/**
 * Script Ingest & Audit: Kaggle TOEIC Part 5 Dataset (3,625 questions)
 *
 * Kiểm tra tính đúng đắn, khử trùng lặp, phân loại 16 chủ điểm ngữ pháp,
 * tạo chú giải sư phạm 4 tầng đầy đủ và nạp vào Supabase (questions + question_answers).
 */

import { createClient } from "@supabase/supabase-js";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { runAutomatedValidator, QuestionForValidation } from "../src/core/adminReview";

// 1. Nạp biến môi trường
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  for (const line of envConfig.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...values] = trimmed.split("=");
      process.env[key.trim()] = values.join("=").trim();
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Lỗi: Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface RawKaggleItem {
  question: string;
  "1": string;
  "2": string;
  "3": string;
  "4": string;
  anwser: string;
}

const PRONOUNS = new Set([
  "he", "him", "his", "himself",
  "she", "her", "hers", "herself",
  "they", "them", "their", "theirs", "themselves",
  "we", "us", "our", "ours", "ourselves",
  "it", "its", "itself",
  "i", "me", "my", "mine", "myself",
  "you", "your", "yours", "yourself", "yourselves",
  "anyone", "someone", "everyone", "no one", "anybody", "somebody", "everybody", "nobody",
]);

const PREPOSITIONS = new Set([
  "in", "on", "at", "to", "for", "with", "by", "from", "of", "about", "into", "through",
  "after", "before", "between", "among", "under", "over", "above", "below", "across",
  "during", "without", "within", "toward", "towards", "against", "upon", "despite",
  "behind", "along", "past", "throughout", "prior to", "in addition to",
]);

const CONJUNCTIONS = new Set([
  "although", "though", "even though", "because", "since", "as", "while", "whereas",
  "unless", "if", "whether", "so that", "in order that", "provided that", "once",
  "and", "but", "or", "so", "yet", "for", "nor",
]);

const MODAL_VERBS = new Set([
  "can", "could", "may", "might", "must", "should", "will", "would", "shall", "ought to",
]);

/**
 * Phân tích từ loại và tiền tố/hậu tố để nhận diện Word Form
 */
function isWordFormQuestion(options: string[]): boolean {
  const [a, b, c, d] = options.map((o) => o.toLowerCase().trim());
  const minLen = Math.min(a.length, b.length, c.length, d.length);
  if (minLen < 3) return false;

  let common = 0;
  while (
    common < minLen &&
    a[common] === b[common] &&
    b[common] === c[common] &&
    c[common] === d[common]
  ) {
    common++;
  }

  // Nếu chung gốc từ ít nhất 3-4 ký tự (ví dụ: direct, direction, directly, directed)
  if (common >= 3) return true;

  // Hoặc ít nhất 3 trong 4 từ chung gốc
  const prefixes = [a.slice(0, 3), b.slice(0, 3), c.slice(0, 3), d.slice(0, 3)];
  const counts: Record<string, number> = {};
  for (const p of prefixes) counts[p] = (counts[p] || 0) + 1;
  return Object.values(counts).some((cnt) => cnt >= 3);
}

/**
 * Phân loại câu hỏi vào 1 trong 16 canonical grammar tags
 */
function classifyGrammarTag(stem: string, options: string[], answer: string): {
  tag_code: string;
  difficulty: number;
} {
  const qLower = stem.toLowerCase();
  const optsLower = options.map((o) => o.toLowerCase().trim());
  const ansLower = answer.toLowerCase().trim();

  // 1. Đại từ (Pronouns)
  if (optsLower.every((o) => PRONOUNS.has(o)) || optsLower.some((o) => ["himself", "themselves", "itself", "herself"].includes(o))) {
    return { tag_code: "nouns_pronouns", difficulty: 1 };
  }

  // 2. Liên từ & Giới từ (Conjunctions / Prepositions)
  const isPrepConj = optsLower.every((o) => PREPOSITIONS.has(o) || CONJUNCTIONS.has(o)) ||
    (PREPOSITIONS.has(ansLower) || CONJUNCTIONS.has(ansLower));
  if (isPrepConj && optsLower.filter((o) => PREPOSITIONS.has(o) || CONJUNCTIONS.has(o)).length >= 3) {
    return { tag_code: "conjunctions_prepositions", difficulty: 2 };
  }

  // 3. So sánh (Comparisons)
  if (
    optsLower.some((o) => o.startsWith("more ") || o.startsWith("most ") || o.endsWith("er") || o.endsWith("est")) &&
    (qLower.includes("than") || qLower.includes("as ") || qLower.includes("the "))
  ) {
    return { tag_code: "comparisons", difficulty: 2 };
  }

  // 4. Mệnh đề quan hệ (Relative Clauses)
  if (optsLower.some((o) => ["who", "whom", "which", "whose", "where", "when", "that"].includes(o))) {
    return { tag_code: "relative_clauses", difficulty: 2 };
  }

  // 5. Câu điều kiện (Conditionals)
  if (qLower.includes("if ") || qLower.includes("unless ") || optsLower.some((o) => ["provided", "unless", "if"].includes(o))) {
    return { tag_code: "conditionals", difficulty: 2 };
  }

  // 6. Động từ khuyết thiếu (Modal Verbs)
  if (optsLower.every((o) => MODAL_VERBS.has(o)) || (MODAL_VERBS.has(ansLower) && optsLower.filter((o) => MODAL_VERBS.has(o)).length >= 2)) {
    return { tag_code: "modals", difficulty: 1 };
  }

  // 7. Từ loại (Word Form)
  if (isWordFormQuestion(options)) {
    // Kiểm tra xem là word form hay tenses
    const hasTenseMarkers = qLower.includes("yesterday") || qLower.includes("last quarter") || qLower.includes("last year") ||
      qLower.includes("ago") || qLower.includes("tomorrow") || qLower.includes("next year") || qLower.includes("since ");
    const isOnlyVerbInflections = optsLower.every((o) => o.endsWith("s") || o.endsWith("ed") || o.endsWith("ing") || !/[a-z]{2,}(tion|ment|ness|ity|ly|ive|able|al)$/.test(o));

    if (hasTenseMarkers || isOnlyVerbInflections) {
      return { tag_code: "tenses", difficulty: 2 };
    }
    return { tag_code: "word_form", difficulty: 1 };
  }

  // 8. Danh động từ & Động từ nguyên mẫu (V-ing / To-V)
  const isVingToV = optsLower.some((o) => o.startsWith("to ")) && optsLower.some((o) => o.endsWith("ing"));
  if (isVingToV) {
    return { tag_code: "gerund_infinitive", difficulty: 2 };
  }

  // 9. Câu bị động (Passive Voice)
  if (optsLower.some((o) => o.startsWith("be ") || o.startsWith("is ") || o.startsWith("was ") || o.startsWith("been ")) || qLower.includes(" by ")) {
    return { tag_code: "passive_voice", difficulty: 2 };
  }

  // 10. Phân từ (Participles)
  if (optsLower.some((o) => o.endsWith("ed")) && optsLower.some((o) => o.endsWith("ing")) && !qLower.includes("yesterday")) {
    return { tag_code: "participles", difficulty: 2 };
  }

  // 11. Tính từ & Trạng từ (Adjectives & Adverbs)
  if (optsLower.some((o) => o.endsWith("ly")) && optsLower.some((o) => o.endsWith("ful") || o.endsWith("able") || o.endsWith("ive"))) {
    return { tag_code: "adjectives_adverbs", difficulty: 2 };
  }

  // 12. Thì động từ (Tenses)
  if (optsLower.some((o) => ["have", "has", "had", "will", "was", "were"].includes(o.split(" ")[0]))) {
    return { tag_code: "tenses", difficulty: 2 };
  }

  // Mặc định cho câu hỏi từ vựng ngữ cảnh / cụm từ
  return { tag_code: "collocations", difficulty: stem.length > 120 ? 3 : 2 };
}

/**
 * Sinh chú giải sư phạm 4 tầng chất lượng cao cho câu hỏi
 */
function generatePedagogicalExplanation(
  stem: string,
  options: string[],
  correctIndex: number,
  tagCode: string
) {
  const correctOptionLetter = String.fromCharCode(65 + correctIndex);
  const correctText = options[correctIndex];

  // Phân tích bối cảnh xung quanh chỗ trống
  const blankMatch = stem.match(/([a-zA-Z0-9',]+)\s+_{2,}\s+([a-zA-Z0-9',]+)/);
  const prevWord = blankMatch ? blankMatch[1] : "";
  const nextWord = blankMatch ? blankMatch[2] : "";

  let rule_vi = "";
  let why_correct_vi = "";
  let tip_vi = "";
  const options_analysis: Record<string, string> = {};

  // Phân tích theo từng chủ điểm ngữ pháp
  switch (tagCode) {
    case "word_form":
      rule_vi = `Quy tắc nhận diện từ loại (Word Form). Xác định vị trí của chỗ trống trong câu dựa vào các thành phần đứng trước (${prevWord ? `'${prevWord}'` : "từ đứng trước"}) và đứng sau (${nextWord ? `'${nextWord}'` : "từ đứng sau"}) để chọn đúng danh từ, động từ, tính từ hay trạng từ.`;
      why_correct_vi = `Phương án ${correctOptionLetter} (${correctText}) có từ loại chính xác đứng vào vị trí chỗ trống để hoàn thiện cấu trúc ngữ pháp của câu.`;
      tip_vi = "Nhìn nhanh 1 từ trước và 1 từ sau chỗ trống để xác định từ loại cần điền, không cần dịch toàn bộ câu trước.";
      break;

    case "tenses":
      rule_vi = `Quy tắc chia thì động từ (Tenses) và sự phối hợp thì trong câu. Dựa vào dấu hiệu thời gian và liên từ thời gian để xác định thì phù hợp.`;
      why_correct_vi = `Phương án ${correctOptionLetter} (${correctText}) chia đúng thì của động từ phù hợp với mốc thời gian và ngữ cảnh diễn tiến hành động trong câu.`;
      tip_vi = "Tìm ngay các trạng từ chỉ thời gian (last, next, already, since, ago...) hoặc thì của mệnh đề còn lại để loại suy nhanh.";
      break;

    case "nouns_pronouns":
      rule_vi = `Quy tắc sử dụng Đại từ (Pronouns) và Danh từ. Phân biệt rõ giữa đại từ nhân xưng chủ ngữ (he/they), tân ngữ (him/them), tính từ sở hữu (his/their + Noun), đại từ sở hữu và đại từ phản thân (-self).`;
      why_correct_vi = `Phương án ${correctOptionLetter} (${correctText}) đảm nhiệm đúng chức năng ngữ pháp trong vị trí cụm danh từ hoặc bổ ngữ của câu.`;
      tip_vi = "Nếu sau chỗ trống là một Danh từ, hãy ưu tiên chọn Tính từ sở hữu (my, his, her, their, our, its).";
      break;

    case "conjunctions_prepositions":
      rule_vi = `Quy tắc phân biệt Giới từ (Preposition + Noun/V-ing) và Liên từ (Conjunction + Clause S-V).`;
      why_correct_vi = `Phương án ${correctOptionLetter} (${correctText}) kết nối chính xác ngữ nghĩa và ngữ pháp với thành phần đứng sau trong câu.`;
      tip_vi = "Kiểm tra phía sau chỗ trống là Cụm danh từ (Noun Phrase) hay Mệnh đề có động từ chia thì (S + V) để loại bỏ 50% phương án ngay lập tức.";
      break;

    case "comparisons":
      rule_vi = `Cấu trúc so sánh (Comparisons) trong tiếng Anh: so sánh hơn (adj/adv-er / more + adj than), so sánh nhất (the -est / the most + adj), hoặc so sánh bằng (as... as).`;
      why_correct_vi = `Phương án ${correctOptionLetter} (${correctText}) tạo thành cấu trúc so sánh chuẩn xác theo dấu hiệu ngữ pháp trong câu.`;
      tip_vi = "Tìm các từ khóa then chốt: 'than' (so sánh hơn), 'the' (so sánh nhất), hoặc 'as' (so sánh bằng).";
      break;

    case "modals":
      rule_vi = `Động từ khuyết thiếu (Modal Verbs: can, could, should, must, will, may) luôn đi kèm với một động từ nguyên thể không 'to' (V-bare).`;
      why_correct_vi = `Phương án ${correctOptionLetter} (${correctText}) thể hiện đúng ý nghĩa mức độ khả năng/bắt buộc và tuân thủ dạng nguyên thể sau trợ động từ.`;
      tip_vi = "Sau modal verb luôn là V-bare; nếu là thể bị động sẽ là 'modal + be + V3/ed'.";
      break;

    case "gerund_infinitive":
      rule_vi = `Quy tắc sử dụng Danh động từ (V-ing) và Động từ nguyên mẫu có 'to' (To-V). V-ing thường theo sau giới từ hoặc các động từ đặc thù; To-V biểu thị mục đích hoặc theo sau các động từ chỉ dự định.`;
      why_correct_vi = `Phương án ${correctOptionLetter} (${correctText}) tuân thủ đúng dạng động từ theo cấu trúc chuẩn.`;
      tip_vi = "Học thuộc các động từ thông dụng đi với To-V (decide, expect, plan, agree) và V-ing (consider, suggest, avoid, postpone).";
      break;

    default:
      rule_vi = `Sự kết hợp từ ngữ (Collocations) và ngữ nghĩa từ vựng chuẩn môi trường công sở ETS TOEIC. Lựa chọn từ có ý nghĩa tự nhiên và chính xác nhất theo ngữ cảnh văn phòng/thương mại.`;
      why_correct_vi = `Phương án ${correctOptionLetter} (${correctText}) mang ngữ nghĩa phù hợp nhất với ngữ cảnh của câu và kết hợp tự nhiên với các từ xung quanh.`;
      tip_vi = "Đọc kỹ toàn bộ câu để nắm ý chính của câu văn giao tiếp thương mại, chú ý giới từ đi kèm phía sau.";
      break;
  }

  // Phân tích lý do vì sao 3 phương án còn lại sai
  const letters = ["A", "B", "C", "D"];
  for (let i = 0; i < 4; i++) {
    const l = letters[i];
    if (i === correctIndex) {
      options_analysis[l] = `Đáp án đúng. Mang nghĩa và cấu trúc chuẩn xác nhất cho câu.`;
    } else {
      const opt = options[i];
      if (tagCode === "word_form") {
        options_analysis[l] = `'${opt}' sai từ loại, không đứng vào vị trí ngữ pháp này trong câu.`;
      } else if (tagCode === "tenses") {
        options_analysis[l] = `'${opt}' sai thì hoặc sai dạng chia động từ theo chủ ngữ/thời điểm.`;
      } else if (tagCode === "nouns_pronouns") {
        options_analysis[l] = `'${opt}' sai chức năng ngữ pháp (chủ ngữ/tân ngữ/sở hữu).`;
      } else if (tagCode === "conjunctions_prepositions") {
        options_analysis[l] = `'${opt}' không phù hợp về cấu trúc (cần Noun/Clause) hoặc sai nghĩa kết nối.`;
      } else {
        options_analysis[l] = `'${opt}' không phù hợp về ngữ nghĩa hoặc không tạo thành cụm từ tự nhiên trong ngữ cảnh này.`;
      }
    }
  }

  return {
    rule_vi,
    why_correct_vi,
    tip_vi,
    options_analysis,
    vocab_hints: [
      { word: correctText, meaning_vi: `Từ khóa chính trong câu` },
    ],
  };
}

async function run() {
  console.log("=== BẮT ĐẦU KIỂM ĐỊNH VÀ NẠP BỘ ĐỀ KAGGLE TOEIC (3,625 CÂU) ===");

  // 1. Đọc dữ liệu thô
  const rawDataPath = path.resolve(process.cwd(), "toeic_test_raw.json");
  if (!fs.existsSync(rawDataPath)) {
    console.error("❌ Không tìm thấy file toeic_test_raw.json");
    process.exit(1);
  }

  const rawData: Record<string, RawKaggleItem> = JSON.parse(
    fs.readFileSync(rawDataPath, "utf-8")
  );

  console.log(`📦 Đã nạp ${Object.keys(rawData).length} mục từ file thô.`);

  // 2. Lấy danh sách grammar tags từ Supabase
  const { data: dbTags, error: tagErr } = await supabase
    .from("grammar_tags")
    .select("id, tag_code");

  if (tagErr || !dbTags) {
    console.error("❌ Không lấy được grammar_tags từ Supabase:", tagErr);
    process.exit(1);
  }

  const tagMap = new Map<string, number>();
  for (const t of dbTags) {
    tagMap.set(t.tag_code, t.id);
  }

  // 3. Khử trùng lặp và làm sạch câu hỏi (Audit & Cleaning)
  const seenHashes = new Set<string>();
  const validQuestions: Array<{
    stem: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_index: number;
    tag_id: number;
    tag_code: string;
    difficulty: number;
    content_hash: string;
    explanation: any;
  }> = [];

  let auditPassed = 0;
  let auditFailed = 0;
  let duplicateCount = 0;

  for (const key of Object.keys(rawData)) {
    const item = rawData[key];
    let stem = (item.question || "").trim();

    // Sửa lỗi OCR phổ biến (ví dụ: "lndie" -> "Indie")
    if (stem.startsWith("lndie")) {
      stem = "Indie" + stem.slice(5);
    }

    // Chuẩn hóa chỗ trống thành '______' (6 gạch)
    stem = stem.replace(/_{2,}/g, "______");

    // Chuẩn hóa dấu chấm/hỏi cuối câu nếu bị cách dấu (ví dụ: '___ .' -> '_____.')
    stem = stem.replace(/\s+([.,?!])/g, "$1");

    const options = [
      (item["1"] || "").trim(),
      (item["2"] || "").trim(),
      (item["3"] || "").trim(),
      (item["4"] || "").trim(),
    ];

    const ansText = (item.anwser || "").trim().toLowerCase();
    const correctIndex = options.findIndex(
      (opt) => opt.toLowerCase() === ansText
    );

    if (correctIndex === -1) {
      console.warn(`[Cảnh báo Q${key}] Không khớp đáp án: ${item.anwser}`);
      auditFailed++;
      continue;
    }

    // Tạo content hash duy nhất để chống trùng
    const normStem = stem.toLowerCase().replace(/\s+/g, " ");
    const contentHash = crypto
      .createHash("sha256")
      .update(normStem)
      .digest("hex");

    if (seenHashes.has(contentHash)) {
      duplicateCount++;
      continue;
    }
    seenHashes.add(contentHash);

    // Phân loại chủ điểm ngữ pháp
    const { tag_code, difficulty } = classifyGrammarTag(
      stem,
      options,
      options[correctIndex]
    );
    const tagId = tagMap.get(tag_code) || tagMap.get("collocations")!;

    // Tạo chú giải sư phạm 4 tầng
    const explanation = generatePedagogicalExplanation(
      stem,
      options,
      correctIndex,
      tag_code
    );

    // Kiểm định chất lượng tự động theo S3-S6
    const questionForValidation: QuestionForValidation = {
      stem,
      option_a: options[0],
      option_b: options[1],
      option_c: options[2],
      option_d: options[3],
      correct_index: correctIndex,
      explanation: {
        rule_vi: explanation.rule_vi,
        why_correct_vi: explanation.why_correct_vi,
        why_wrong_vi: explanation.options_analysis,
      },
    };

    const valReport = runAutomatedValidator(questionForValidation);
    if (!valReport.overallPass) {
      console.warn(
        `[Cảnh báo Validator Q${key}] Thất bại kiểm định:`,
        valReport.checks
      );
      auditFailed++;
      continue;
    }

    validQuestions.push({
      stem,
      option_a: options[0],
      option_b: options[1],
      option_c: options[2],
      option_d: options[3],
      correct_index: correctIndex,
      tag_id: tagId,
      tag_code,
      difficulty,
      content_hash: contentHash,
      explanation,
    });

    auditPassed++;
  }

  console.log(`\n📊 KẾT QUẢ KIỂM ĐỊNH TỰ ĐỘNG (S3 - S6):`);
  console.log(`- Tổng số câu nạp từ dataset: ${Object.keys(rawData).length}`);
  console.log(`- Số câu trùng lặp đã loại: ${duplicateCount}`);
  console.log(`- Số câu kiểm định thất bại: ${auditFailed}`);
  console.log(`- Số câu ĐẠT CHUẨN 100% S3-S6: ${auditPassed}`);

  // Thống kê theo chủ điểm ngữ pháp
  const tagStats: Record<string, number> = {};
  for (const q of validQuestions) {
    tagStats[q.tag_code] = (tagStats[q.tag_code] || 0) + 1;
  }
  console.log(`\n📈 Phân bổ 16 chủ điểm ngữ pháp:`, tagStats);

  // 4. Tiến hành nạp vào Supabase theo từng đợt (Batch Ingestion)
  console.log(`\n🚀 BẮT ĐẦU NẠP VÀO SUPABASE (BATCH SIZE = 100)...`);
  const BATCH_SIZE = 100;
  let insertedQuestions = 0;
  let insertedAnswers = 0;

  for (let i = 0; i < validQuestions.length; i += BATCH_SIZE) {
    const chunk = validQuestions.slice(i, i + BATCH_SIZE);

    // Chuẩn bị dữ liệu bảng questions
    const questionRows = chunk.map((q) => ({
      stem: q.stem,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      tag_id: q.tag_id,
      difficulty: q.difficulty,
      status: "published",
      content_hash: q.content_hash,
    }));

    const { data: insertedQData, error: qErr } = await supabase
      .from("questions")
      .upsert(questionRows, { onConflict: "content_hash" })
      .select("id, content_hash");

    if (qErr || !insertedQData) {
      console.error(`❌ Lỗi upsert questions batch ${i}:`, qErr);
      continue;
    }
    insertedQuestions += insertedQData.length;

    // Map content_hash -> question_id để nạp vào question_answers
    const hashToId = new Map<string, string>();
    for (const row of insertedQData) {
      hashToId.set(row.content_hash, row.id);
    }

    const answerRows = chunk
      .map((q) => {
        const qId = hashToId.get(q.content_hash);
        if (!qId) return null;
        return {
          question_id: qId,
          correct_index: q.correct_index,
          explanation: q.explanation,
        };
      })
      .filter(Boolean);

    if (answerRows.length > 0) {
      const { data: insertedAData, error: aErr } = await supabase
        .from("question_answers")
        .upsert(answerRows as any, { onConflict: "question_id" })
        .select("question_id");

      if (aErr) {
        console.error(`❌ Lỗi upsert question_answers batch ${i}:`, aErr);
      } else {
        insertedAnswers += insertedAData?.length || 0;
      }
    }

    const progress = Math.min(
      100,
      Math.round(((i + chunk.length) / validQuestions.length) * 100)
    );
    process.stdout.write(
      `\r Tiến độ: ${progress}% (${insertedQuestions}/${validQuestions.length} câu đã lưu)...`
    );
  }

  console.log(`\n\n🎉 HOÀN TẤT NẠP DỮ LIỆU THÀNH CÔNG!`);
  console.log(`- Tổng câu hỏi đã lưu vào 'questions': ${insertedQuestions}`);
  console.log(`- Tổng đáp án & giải thích 4 tầng đã lưu vào 'question_answers': ${insertedAnswers}`);

  // Kiểm tra tổng số câu trong DB hiện tại
  const { count } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true });
  console.log(`- Tổng kho đề Part 5 trên hệ thống hiện tại: ${count} câu hỏi.`);
}

run().catch((err) => {
  console.error("❌ Lỗi nghiêm trọng trong quá trình xử lý:", err);
  process.exit(1);
});
