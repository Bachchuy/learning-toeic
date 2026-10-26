/**
 * Script Ingestion: Nạp bộ câu hỏi Part 5 TOEIC chất lượng cao từ HuynhDucKhoi0105/English-ETS-TOEIC-web
 * 
 * BẤT BIẾN DỰ ÁN:
 * 1. Mọi câu hỏi phải qua kiểm định tự động S3 - S6 (runAutomatedValidator)
 * 2. Phân loại chuẩn xác vào 16 chủ điểm ngữ pháp canonical
 * 3. Đáp án lưu ở question_answers (RLS bảo vệ, client không đọc được trước khi nộp)
 * 4. Content hash duy nhất, không trùng lặp
 */

import { createClient } from "@supabase/supabase-js";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { runAutomatedValidator } from "../src/core/adminReview";

// 1. Đọc biến môi trường
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
  console.error("❌ LỖI: Thiếu biến môi trường NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Bản đồ ánh xạ tag từ repo nguồn sang 16 canonical tags của dự án
const TAG_MAPPING: Record<string, string> = {
  inv: "inversion",
  subj: "conditionals",
  reduce: "participles",
  pair: "conjunctions_prepositions",
  nclause: "relative_clauses",
  ever: "conjunctions_prepositions",
  caus: "gerund_infinitive",
  timecl: "conjunctions_prepositions",
  advpos: "adjectives_adverbs",
  prepphr: "conjunctions_prepositions",
  wordform: "word_form",
  vocab: "collocations",
  colloc: "collocations",
  conj: "conjunctions_prepositions",
  prep: "conjunctions_prepositions",
  tense: "tenses",
  np: "nouns_pronouns",
  pron: "nouns_pronouns",
  rel: "relative_clauses",
  part: "participles",
};

interface RawSourceQuestion {
  id: string;
  q: string;
  o: string[];
  a: number;
  t: string;
  lv: number;
  e: string;
  tr?: string;
}

function parseStructuredExplanation(rawExplanation: string, translation?: string) {
  let rule_vi = "Quy tắc ngữ pháp chuẩn ETS.";
  let why_correct_vi = rawExplanation;
  const options_analysis = {
    A: "Phương án sai theo ngữ cảnh.",
    B: "Phương án sai theo ngữ cảnh.",
    C: "Phương án sai theo ngữ cảnh.",
    D: "Phương án sai theo ngữ cảnh.",
  };
  let tip_vi = "Chú ý vị trí từ loại và dấu hiệu nhận biết xung quanh chỗ trống.";

  // Bóc tách Mẹo
  const tipMatch = rawExplanation.match(/Mẹo:\s*([^]+?)(?:$)/i);
  if (tipMatch) {
    tip_vi = tipMatch[1].trim();
  }

  // Bóc tách Dấu hiệu / Quy tắc
  const ruleMatch = rawExplanation.match(/Dấu hiệu:\s*([^]+?)(?:→|Vì sao|$)/i);
  if (ruleMatch) {
    rule_vi = ruleMatch[1].trim();
  }

  // Bóc tách Đáp án đúng
  const correctMatch = rawExplanation.match(/→\s*Đáp án đúng là\s*([A-D])\s*\([^)]*\):\s*([^]+?)(?:Vì sao|Mẹo|$)/i);
  if (correctMatch) {
    why_correct_vi = correctMatch[2].trim();
  }

  // Bóc tách Phân tích các phương án sai
  const optAMatch = rawExplanation.match(/\(A\)\s*([^;]+?)(?:;\s*\(B\)|\(B\)|Mẹo|$)/i);
  if (optAMatch) options_analysis.A = optAMatch[1].trim();

  const optBMatch = rawExplanation.match(/\(B\)\s*([^;]+?)(?:;\s*\(C\)|\(C\)|Mẹo|$)/i);
  if (optBMatch) options_analysis.B = optBMatch[1].trim();

  const optCMatch = rawExplanation.match(/\(C\)\s*([^;]+?)(?:;\s*\(D\)|\(D\)|Mẹo|$)/i);
  if (optCMatch) options_analysis.C = optCMatch[1].trim();

  const optDMatch = rawExplanation.match(/\(D\)\s*([^;]+?)(?:;\s*\(A\)|Mẹo|$)/i);
  if (optDMatch) options_analysis.D = optDMatch[1].trim();

  return {
    rule_vi,
    why_correct_vi,
    options_analysis,
    tip_vi,
    full_translation_vi: translation || "Dịch nghĩa câu hỏi theo ngữ cảnh công sở.",
    vocab_hints: [] as { word: string; meaning_vi: string }[],
  };
}

async function main() {
  console.log("==================================================================");
  console.log("🚀 BẮT ĐẦU INGESTION CÂU HỎI TỪ HUYNHDUCKHOI0105/ENGLISH-ETS-TOEIC");
  console.log("==================================================================\n");

  // 1. Tải dữ liệu từ GitHub
  console.log("📥 Đang tải K_part5_new_and_fixed.json...");
  const res = await fetch("https://raw.githubusercontent.com/HuynhDucKhoi0105/English-ETS-TOEIC-web/main/data/K_part5_new_and_fixed.json");
  const data = await res.json();

  const newQuestions: RawSourceQuestion[] = data.newQuestions || [];
  console.log(`📦 Tổng số câu trong nguồn: ${newQuestions.length} câu`);

  // 2. Lấy danh sách grammar_tags từ Supabase
  const { data: tagsData, error: tagsErr } = await supabase
    .from("grammar_tags")
    .select("id, tag_code");

  if (tagsErr || !tagsData) {
    console.error("❌ Không thể lấy danh sách grammar_tags:", tagsErr);
    process.exit(1);
  }

  const tagIdMap = new Map<string, number>();
  for (const t of tagsData) {
    tagIdMap.set(t.tag_code, t.id);
  }

  // 3. Lấy danh sách content_hash đã có trong DB để tránh trùng
  const { data: existingHashes } = await supabase
    .from("questions")
    .select("content_hash");

  const hashSet = new Set((existingHashes || []).map((h) => h.content_hash));
  console.log(`🔍 Số câu đã có trong DB: ${hashSet.size} câu`);

  let validCount = 0;
  let skippedDuplicates = 0;
  let validatorFailed = 0;
  let insertedCount = 0;

  for (let i = 0; i < newQuestions.length; i++) {
    const raw = newQuestions[i];
    if (!raw.q || !raw.o || raw.o.length !== 4) continue;

    // Chuẩn hóa stem có chỗ trống
    let stem = raw.q.trim();
    if (!stem.includes("___")) {
      // Thay thế chuỗi _ liên tiếp thành ___
      stem = stem.replace(/_{2,}/g, "___");
    }

    const contentHash = crypto
      .createHash("sha256")
      .update(stem.toLowerCase().trim())
      .digest("hex");

    if (hashSet.has(contentHash)) {
      skippedDuplicates++;
      continue;
    }

    // Ánh xạ tag
    const mappedTagCode = TAG_MAPPING[raw.t] || "word_form";
    const tagId = tagIdMap.get(mappedTagCode) || tagIdMap.get("word_form") || 1;

    // Phân loại độ khó (1: 500-650, 2: 700-750, 3: 800+)
    const difficulty = raw.lv >= 800 ? 3 : raw.lv >= 700 ? 2 : 1;

    // Chạy bộ kiểm định chất lượng tự động S3 - S6
    const validationReport = runAutomatedValidator({
      stem,
      option_a: raw.o[0].trim(),
      option_b: raw.o[1].trim(),
      option_c: raw.o[2].trim(),
      option_d: raw.o[3].trim(),
      correct_index: raw.a,
      explanation: {
        rule_vi: "rule",
        why_correct_vi: "why",
      },
    });

    if (!validationReport.overallPass) {
      validatorFailed++;
      continue;
    }

    validCount++;

    // Bóc tách cấu trúc giải thích 4 lớp
    const explanationJson = parseStructuredExplanation(raw.e, raw.tr);

    // Insert vào questions
    const { data: qData, error: qErr } = await supabase
      .from("questions")
      .insert({
        stem,
        option_a: raw.o[0].trim(),
        option_b: raw.o[1].trim(),
        option_c: raw.o[2].trim(),
        option_d: raw.o[3].trim(),
        tag_id: tagId,
        difficulty,
        status: "published",
        content_hash: contentHash,
      })
      .select("id")
      .single();

    if (qErr || !qData) {
      console.error(`❌ Lỗi insert câu ${raw.id}:`, qErr?.message);
      continue;
    }

    // Insert vào question_answers (RLS bảo vệ)
    const { error: aErr } = await supabase
      .from("question_answers")
      .insert({
        question_id: qData.id,
        correct_index: raw.a,
        explanation: explanationJson,
      });

    if (aErr) {
      console.error(`❌ Lỗi insert đáp án cho câu ${qData.id}:`, aErr.message);
    } else {
      hashSet.add(contentHash);
      insertedCount++;
      process.stdout.write(`⏳ Tiến độ nạp câu hỏi: ${insertedCount} câu thành công...\r`);
    }
  }

  console.log("\n==================================================================");
  console.log("🎉 HOÀN THÀNH INGESTION CÂU HỎI TOEIC PART 5!");
  console.log(`✅ Đã nạp thành công: ${insertedCount} câu hỏi mới vào Database`);
  console.log(`🔎 Đạt chuẩn kiểm định chất lượng: ${validCount} câu`);
  console.log(`⏭️ Bỏ qua trùng lặp: ${skippedDuplicates} câu`);
  console.log(`⚠️ Bị loại do không qua chuẩn S3-S6: ${validatorFailed} câu`);
  console.log("==================================================================");
}

main().catch(console.error);
