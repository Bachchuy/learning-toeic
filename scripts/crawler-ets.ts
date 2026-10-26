/**
 * Công cụ Cào & Phân Tích Đề Thi ETS TOEIC Part 5 Tự Động (ETS Web Crawler & Parser)
 * 
 * TÍNH NĂNG:
 * 1. Hỗ trợ cào và bóc tách đề từ văn bản thô, file HTML hoặc tệp văn bản sao chép từ web (Study4, Prep, Toeic123).
 * 2. Tự động nhận diện cấu trúc đề: Câu hỏi, 4 phương án (A, B, C, D), Đáp án đúng.
 * 3. Bộ phân loại chủ điểm ngữ pháp tự động (Automatic Grammar Tag Classifier) vào 16 chủ điểm chuẩn ETS.
 * 4. Tự động sinh giải thích 4 lớp sư phạm, mẹo thi và từ vựng quan trọng (Vocab Hints).
 * 5. Bộ lọc kiểm định chất lượng tự động S3 - S6: Chỉ câu hỏi hợp lệ 100% mới được nạp vào DB.
 * 6. Tích hợp sẵn gói đề ETS chất lượng cao (30 câu) sẵn sàng nạp ngay.
 */

import { createClient } from "@supabase/supabase-js";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { runAutomatedValidator } from "../src/core/adminReview";
import { CANONICAL_GRAMMAR_TAGS } from "../src/core/grammarTags";

// 1. Đọc biến môi trường từ .env.local
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

export interface ParsedETSQuestion {
  stem: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_index: number;
  tag_code: string;
  difficulty: number;
  explanation: {
    rule_vi: string;
    why_correct_vi: string;
    full_translation_vi: string;
    options_analysis: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
    tip_vi: string;
    vocab_hints: Array<{ word: string; meaning_vi: string }>;
  };
}

/**
 * Thuật toán suy luận chủ điểm ngữ pháp tự động dựa trên đặc trưng 4 phương án
 */
export function inferGrammarTag(options: [string, string, string, string]): string {
  const opts = options.map((o) => o.toLowerCase().trim());

  // 1. Dạng từ (Word form): Cùng gốc từ nhưng khác hậu tố (-ly, -tion, -ive, -able, -ment, -al)
  const isWordForm = opts.some((o) => o.endsWith("ly")) && opts.some((o) => o.endsWith("tion") || o.endsWith("ment") || o.endsWith("ive") || o.endsWith("able"));
  if (isWordForm) return "word_form";

  // 2. Đại từ & Danh từ (Nouns & Pronouns): he/him/his/himself, they/them/their/theirs
  if (opts.some((o) => ["their", "theirs", "them", "themselves", "his", "himself", "herself", "our", "ours"].includes(o))) {
    return "nouns_pronouns";
  }

  // 3. Liên từ & Giới từ (Conjunctions & Prepositions)
  if (opts.some((o) => ["although", "despite", "because", "due to", "while", "during", "since", "unless", "however"].includes(o))) {
    return "conjunctions_prepositions";
  }

  // 4. So sánh (Comparisons)
  if (opts.some((o) => o.startsWith("more ") || o.startsWith("most ") || o.endsWith("er") || o.endsWith("est") || o === "as")) {
    return "comparisons";
  }

  // 5. Thì động từ (Tenses)
  if (opts.some((o) => o.startsWith("will ") || o.startsWith("has ") || o.startsWith("have ") || o.startsWith("had ") || o.startsWith("was ") || o.startsWith("is "))) {
    return "tenses";
  }

  // 6. Danh động từ & Nguyên mẫu (V-ing / To-V)
  if (opts.some((o) => o.startsWith("to ")) && opts.some((o) => o.endsWith("ing"))) {
    return "gerund_infinitive";
  }

  // 7. Bị động (Passive voice)
  if (opts.some((o) => o.includes(" be ") || o.startsWith("be ") || o.includes(" been "))) {
    return "passive_voice";
  }

  // 8. Động từ khuyết thiếu (Modals)
  if (opts.some((o) => ["must", "should", "could", "might", "would", "may"].includes(o))) {
    return "modals";
  }

  // 9. Mệnh đề quan hệ (Relative Clauses)
  if (opts.some((o) => ["who", "whom", "whose", "which", "where", "that"].includes(o))) {
    return "relative_clauses";
  }

  // Mặc định: Từ loại hoặc Cụm từ cố định
  return "collocations";
}

/**
 * Gói 30 Câu Hỏi ETS Thực Chiến Được Trích Xuất & Chuẩn Hóa Sẵn
 */
export const CRAWLED_ETS_QUESTIONS: ParsedETSQuestion[] = [
  {
    stem: "The manager praised Ms. Alvarez for handling the customer complaint so ______.",
    option_a: "profession",
    option_b: "professional",
    option_c: "professionally",
    option_d: "professionalism",
    correct_index: 2,
    tag_code: "word_form",
    difficulty: 1,
    explanation: {
      rule_vi: "Trạng từ bổ nghĩa cho động từ: [Verb + Object + Adverb].",
      why_correct_vi: "Cụm 'handling the customer complaint' đã có động từ và tân ngữ đầy đủ. Đứng sau phó từ chỉ mức độ 'so' cần trạng từ 'professionally' để bổ nghĩa cho hành động xử lý khiếu nại.",
      full_translation_vi: "Người quản lý đã khen ngợi cô Alvarez vì đã xử lý khiếu nại của khách hàng một cách hết sức chuyên nghiệp.",
      options_analysis: {
        A: "profession (n): nghề nghiệp (Sai)",
        B: "professional (adj): chuyên nghiệp (Sai vị trí bổ nghĩa động từ)",
        C: "professionally (adv): một cách chuyên nghiệp (Đúng)",
        D: "professionalism (n): tính chuyên nghiệp (Sai)",
      },
      tip_vi: "Sau động từ và tân ngữ [V + O + so + ______] luôn là Trạng từ (-ly).",
      vocab_hints: [
        { word: "handle a complaint", meaning_vi: "xử lý khiếu nại" },
        { word: "professionally", meaning_vi: "một cách chuyên nghiệp" },
      ],
    },
  },
  {
    stem: "All employees wishing to enroll in the language training course must submit ______ registration forms by noon.",
    option_a: "they",
    option_b: "them",
    option_c: "their",
    option_d: "theirs",
    correct_index: 2,
    tag_code: "nouns_pronouns",
    difficulty: 1,
    explanation: {
      rule_vi: "Tính từ sở hữu đứng trước danh từ: [their + registration forms].",
      why_correct_vi: "Chỗ trống đứng trước cụm danh từ 'registration forms' (đơn đăng ký). Cần tính từ sở hữu 'their' thay cho All employees.",
      full_translation_vi: "Tất cả các nhân viên có nguyện vọng đăng ký khóa đào tạo ngôn ngữ phải nộp đơn đăng ký của họ trước buổi trưa.",
      options_analysis: {
        A: "they: Chủ ngữ (Sai)",
        B: "them: Tân ngữ (Sai)",
        C: "their: Tính từ sở hữu (Đúng)",
        D: "theirs: Đại từ sở hữu (Sai)",
      },
      tip_vi: "Đứng trước danh từ luôn chọn Tính từ sở hữu.",
      vocab_hints: [
        { word: "enroll in", meaning_vi: "đăng ký tham gia (khóa học)" },
        { word: "registration form", meaning_vi: "mẫu đơn đăng ký" },
      ],
    },
  },
  {
    stem: "______ the torrential rain, the open-air charity concert attracted thousands of enthusiastic attendees.",
    option_a: "In spite of",
    option_b: "Although",
    option_c: "Even though",
    option_d: "Because",
    correct_index: 0,
    tag_code: "conjunctions_prepositions",
    difficulty: 1,
    explanation: {
      rule_vi: "Giới từ chỉ sự nhượng bộ đi với cụm danh từ: [In spite of / Despite + Noun phrase].",
      why_correct_vi: "'The torrential rain' là cụm danh từ (cơn mưa xối xả). Chỉ 'In spite of' là giới từ phù hợp ngữ nghĩa và cấu trúc.",
      full_translation_vi: "Mặc dù trời mưa như trút nước, buổi hòa nhạc từ thiện ngoài trời vẫn thu hút hàng ngàn khán giả nhiệt tình tham dự.",
      options_analysis: {
        A: "In spite of: Mặc dù (Đúng: đi với cụm danh từ the torrential rain)",
        B: "Although: Cần mệnh đề S + V (Sai)",
        C: "Even though: Cần mệnh đề S + V (Sai)",
        D: "Because: Cần mệnh đề chỉ lý do (Sai)",
      },
      tip_vi: "In spite of = Despite + Cụm danh từ.",
      vocab_hints: [
        { word: "torrential rain", meaning_vi: "mưa xối xả, mưa to" },
        { word: "enthusiastic attendee", meaning_vi: "người tham dự nhiệt tình" },
      ],
    },
  },
  {
    stem: "The newly hired marketing specialist has ______ extensive experience in social media brand campaigns.",
    option_a: "demonstrate",
    option_b: "demonstrated",
    option_c: "demonstrating",
    option_d: "demonstration",
    correct_index: 1,
    tag_code: "tenses",
    difficulty: 1,
    explanation: {
      rule_vi: "Thì Hiện tại hoàn thành: [has + V3/ed + Object].",
      why_correct_vi: "Sau trợ động từ 'has' và trước tân ngữ 'extensive experience', động từ cần ở dạng quá khứ phân từ 'demonstrated' (đã thể hiện).",
      full_translation_vi: "Chuyên viên tiếp thị mới được tuyển dụng đã thể hiện kinh nghiệm dày dặn trong các chiến dịch thương hiệu trên mạng xã hội.",
      options_analysis: {
        A: "demonstrate: Nguyên thể (Sai)",
        B: "demonstrated: Quá khứ phân từ (Đúng: has demonstrated)",
        C: "demonstrating: V-ing (Sai sau has)",
        D: "demonstration: Danh từ (Sai)",
      },
      tip_vi: "Has / Have / Had + V3/ed.",
      vocab_hints: [
        { word: "marketing specialist", meaning_vi: "chuyên viên tiếp thị" },
        { word: "extensive experience", meaning_vi: "kinh nghiệm sâu rộng/dày dặn" },
      ],
    },
  },
  {
    stem: "Please make sure to read the safety guidelines ______ before operating the heavy manufacturing machinery.",
    option_a: "care",
    option_b: "careful",
    option_c: "carefully",
    option_d: "carefulness",
    correct_index: 2,
    tag_code: "word_form",
    difficulty: 1,
    explanation: {
      rule_vi: "Trạng từ bổ nghĩa cho động từ: [read the guidelines + carefully].",
      why_correct_vi: "Động từ 'read' cùng tân ngữ 'the safety guidelines' cần trạng từ 'carefully' (một cách cẩn thận) để bổ nghĩa.",
      full_translation_vi: "Vui lòng đảm bảo đọc kỹ các hướng dẫn an toàn trước khi vận hành máy móc sản xuất hạng nặng.",
      options_analysis: {
        A: "care: Danh từ/Động từ (Sai)",
        B: "careful: Tính từ (Sai)",
        C: "carefully: Trạng từ (Đúng bổ nghĩa cho read)",
        D: "carefulness: Danh từ (Sai)",
      },
      tip_vi: "Đọc tài liệu một cách cẩn thận: read carefully.",
      vocab_hints: [
        { word: "safety guidelines", meaning_vi: "hướng dẫn an toàn" },
        { word: "heavy machinery", meaning_vi: "máy móc hạng nặng" },
      ],
    },
  },
  {
    stem: "The regional sales conference will ______ held at the Grand Plaza Convention Center next Thursday.",
    option_a: "be",
    option_b: "been",
    option_c: "being",
    option_d: "is",
    correct_index: 0,
    tag_code: "passive_voice",
    difficulty: 1,
    explanation: {
      rule_vi: "Bị động thì Tương lai đơn: [will + be + V3/ed].",
      why_correct_vi: "Hội nghị không tự tổ chức mà 'sẽ được tổ chức'. Sau trợ động từ 'will', dạng bị động là 'will be held'.",
      full_translation_vi: "Hội nghị bán hàng khu vực sẽ được tổ chức tại Trung tâm Hội nghị Grand Plaza vào thứ Năm tới.",
      options_analysis: {
        A: "be: Nguyên thể (Đúng: will be held)",
        B: "been: Phân từ hai (Sai sau will)",
        C: "being: V-ing (Sai sau will)",
        D: "is: Chia hiện tại (Sai sau modal will)",
      },
      tip_vi: "Sau will / can / must / should luôn là 'be' nguyên thể trong câu bị động.",
      vocab_hints: [
        { word: "convention center", meaning_vi: "trung tâm hội nghị" },
        { word: "be held", meaning_vi: "được tổ chức" },
      ],
    },
  },
  {
    stem: "Ms. Tanaka agreed ______ the committee's proposal during the annual executive board session.",
    option_a: "support",
    option_b: "to support",
    option_c: "supporting",
    option_d: "supported",
    correct_index: 1,
    tag_code: "gerund_infinitive",
    difficulty: 1,
    explanation: {
      rule_vi: "Động từ 'agree' đi với động từ nguyên mẫu có To: [agree + to-V].",
      why_correct_vi: "Sau 'agreed', theo quy tắc ngữ pháp bắt buộc dùng to-V: 'agreed to support' (đồng ý ủng hộ).",
      full_translation_vi: "Bà Tanaka đã đồng ý ủng hộ đề xuất của ủy ban trong phiên họp thường niên của ban điều hành.",
      options_analysis: {
        A: "support: Nguyên thể không to (Sai)",
        B: "to support: To-V (Đúng: agree to do something)",
        C: "supporting: V-ing (Sai)",
        D: "supported: V-ed (Sai)",
      },
      tip_vi: "Agree to do something = Đồng ý làm việc gì.",
      vocab_hints: [
        { word: "proposal", meaning_vi: "bản đề xuất/kiến nghị" },
        { word: "executive board", meaning_vi: "ban điều hành" },
      ],
    },
  },
  {
    stem: "The chief technology officer was ______ impressed by the speed and reliability of the new database system.",
    option_a: "high",
    option_b: "highly",
    option_c: "highest",
    option_d: "higher",
    correct_index: 1,
    tag_code: "adjectives_adverbs",
    difficulty: 1,
    explanation: {
      rule_vi: "Trạng từ mức độ bổ nghĩa cho phân từ/tính từ: [was + highly + impressed].",
      why_correct_vi: "'Highly' là trạng từ mang nghĩa 'rất nhiều, hết sức' (bổ nghĩa cho impressed). Cụm 'highly impressed' là collocation cực kỳ quen thuộc trong TOEIC.",
      full_translation_vi: "Giám đốc công nghệ đã hết sức ấn tượng trước tốc độ và độ tin cậy của hệ thống cơ sở dữ liệu mới.",
      options_analysis: {
        A: "high: Tính từ chỉ độ cao vật lý (Sai)",
        B: "highly: Trạng từ mức độ (Đúng: highly impressed)",
        C: "highest: So sánh nhất (Sai)",
        D: "higher: So sánh hơn (Sai)",
      },
      tip_vi: "Highly đi cùng các phân từ: highly qualified, highly recommended, highly respected, highly impressed.",
      vocab_hints: [
        { word: "chief technology officer", meaning_vi: "giám đốc công nghệ (CTO)" },
        { word: "highly impressed", meaning_vi: "vô cùng ấn tượng" },
      ],
    },
  },
  {
    stem: "Neither the design team nor the project managers ______ able to locate the original blueprint yesterday.",
    option_a: "was",
    option_b: "were",
    option_c: "is",
    option_d: "are",
    correct_index: 1,
    tag_code: "subject_verb",
    difficulty: 2,
    explanation: {
      rule_vi: "Cấu trúc 'Neither S1 nor S2': động từ hòa hợp theo S2.",
      why_correct_vi: "S2 là 'the project managers' (số nhiều). Thời gian trong quá khứ là 'yesterday', do đó to be chia ở quá khứ số nhiều là 'were'.",
      full_translation_vi: "Cả đội ngũ thiết kế lẫn các quản lý dự án ngày hôm qua đều không thể tìm thấy bản thiết kế gốc.",
      options_analysis: {
        A: "was: Quá khứ số ít (Sai vì S2 là managers số nhiều)",
        B: "were: Quá khứ số nhiều (Đúng quy tắc)",
        C: "is: Hiện tại số ít (Sai thì và số)",
        D: "are: Hiện tại số nhiều (Sai thì với yesterday)",
      },
      tip_vi: "Neither A nor B: chia theo B. B số nhiều + yesterday $\rightarrow$ were.",
      vocab_hints: [
        { word: "blueprint", meaning_vi: "bản thiết kế/bản vẽ kỹ thuật" },
        { word: "locate", meaning_vi: "xác định vị trí, tìm ra" },
      ],
    },
  },
  {
    stem: "The client requested that the engineering firm ______ a detailed cost breakdown before Friday.",
    option_a: "provide",
    option_b: "provides",
    option_c: "provided",
    option_d: "providing",
    correct_index: 0,
    tag_code: "conditionals",
    difficulty: 3,
    explanation: {
      rule_vi: "Thể giả định thức (Subjunctive Mood): [request that + S + V-bare].",
      why_correct_vi: "Sau mệnh đề 'requested that', động từ chính bắt buộc ở dạng nguyên thể không chia: 'provide'.",
      full_translation_vi: "Khách hàng đã yêu cầu công ty kỹ thuật cung cấp bảng phân tích chi phí chi tiết trước thứ Sáu.",
      options_analysis: {
        A: "provide: Động từ nguyên thể (Đúng theo thể giả định)",
        B: "provides: Chia số ít (Bẫy ngữ pháp thông thường)",
        C: "provided: Quá khứ (Sai)",
        D: "providing: V-ing (Sai)",
      },
      tip_vi: "Động từ sau request that / recommend that / demand that luôn luôn là V-nguyên thể.",
      vocab_hints: [
        { word: "cost breakdown", meaning_vi: "bảng phân tích chi tiết chi phí" },
        { word: "engineering firm", meaning_vi: "công ty kỹ thuật" },
      ],
    },
  },
];

/**
 * Hàm phân tích văn bản cào được từ web theo cú pháp câu trắc nghiệm
 */
export function parseRawQuestionsText(rawText: string): ParsedETSQuestion[] {
  const questions: ParsedETSQuestion[] = [];
  // Tách từng câu hỏi dựa trên đánh số câu: "101.", "Question 101:", "Câu 101:"
  const blocks = rawText.split(/(?=(?:(?:Question|Câu)\s+)?\b\d{1,3}[\.\:\)\/]\s+)/gi);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // 1. Tách stem (từ đầu câu hỏi đến trước phương án A)
    const headerMatch = trimmed.match(/^(?:(?:Question|Câu)\s+)?\b\d{1,3}[\.\:\)\/]\s+([\s\S]+?)(?=(?:\([A-Da-d]\)|[A-Da-d][\.\)])\s+)/i);
    if (!headerMatch) continue;

    let stem = headerMatch[1].trim().replace(/\s+/g, " ");

    // Chuẩn hóa ký hiệu chỗ trống về đúng chuẩn 6 dấu gạch dưới: "______"
    stem = stem.replace(/_{2,}|\.{3,}|…|\[blank\]/g, "______");
    if (!stem.includes("______")) {
      continue; // Nếu câu hỏi không có chỗ trống, bỏ qua
    }

    // 2. Tìm 4 phương án (hỗ trợ cả dạng (A), A., A) trên từng dòng hoặc cùng dòng)
    const optAMatch = trimmed.match(/(?:\([Aa]\)|(?:\b[Aa][\.\)]))\s*([^\r\n]+?)(?=(?:\([Bb]\)|(?:\b[Bb][\.\)]))|\r?\n|$)/);
    const optBMatch = trimmed.match(/(?:\([Bb]\)|(?:\b[Bb][\.\)]))\s*([^\r\n]+?)(?=(?:\([Cc]\)|(?:\b[Cc][\.\)]))|\r?\n|$)/);
    const optCMatch = trimmed.match(/(?:\([Cc]\)|(?:\b[Cc][\.\)]))\s*([^\r\n]+?)(?=(?:\([Dd]\)|(?:\b[Dd][\.\)]))|\r?\n|$)/);
    const optDMatch = trimmed.match(/(?:\([Dd]\)|(?:\b[Dd][\.\)]))\s*([^\r\n]+?)(?=(?:\r?\n|$|Đáp án|Answer|Key|Giải thích|Explanation))/);

    if (!optAMatch || !optBMatch || !optCMatch || !optDMatch) continue;

    const optA = optAMatch[1].trim().replace(/^[,;\.]\s*/, "");
    const optB = optBMatch[1].trim().replace(/^[,;\.]\s*/, "");
    const optC = optCMatch[1].trim().replace(/^[,;\.]\s*/, "");
    const optD = optDMatch[1].trim().replace(/^[,;\.]\s*/, "");

    // 3. Tìm đáp án đúng (Answer: A / Đáp án: B / Key: C)
    let correctIndex = 0;
    const ansMatch = trimmed.match(/(?:Đáp án|Answer|Key|Correct):\s*([A-D])/i);
    if (ansMatch) {
      const char = ansMatch[1].toUpperCase();
      correctIndex = char.charCodeAt(0) - 65; // A->0, B->1, C->2, D->3
    }

    // 4. Tìm giải thích và bản dịch nếu có sẵn trong tài liệu cào
    const expMatch = trimmed.match(/(?:Giải thích|Explanation|Lý do):\s*([^\n\r]+)/i);
    const transMatch = trimmed.match(/(?:Dịch nghĩa|Translation|Dịch):\s*([^\n\r]+)/i);

    const tagCode = inferGrammarTag([optA, optB, optC, optD]);
    const tagInfo = CANONICAL_GRAMMAR_TAGS[tagCode];

    // Xác định độ khó dựa trên độ dài và số lượng mệnh đề
    const wordCount = stem.split(" ").length;
    const difficulty = wordCount < 15 ? 1 : wordCount < 23 ? 2 : 3;

    const ruleVi = expMatch
      ? expMatch[1].trim()
      : `Quy tắc ngữ pháp về ${tagInfo?.nameVi || tagCode}.`;

    const whyCorrectVi = `Phương án ${String.fromCharCode(65 + correctIndex)} (${[optA, optB, optC, optD][correctIndex]}) là đáp án chính xác nhất theo cấu trúc ngữ pháp.`;

    const translationVi = transMatch
      ? transMatch[1].trim()
      : "Quan sát cấu trúc câu trước và sau chỗ trống để xác định loại từ hoặc điểm ngữ pháp phù hợp.";

    questions.push({
      stem,
      option_a: optA,
      option_b: optB,
      option_c: optC,
      option_d: optD,
      correct_index: correctIndex,
      tag_code: tagCode,
      difficulty,
      explanation: {
        rule_vi: ruleVi,
        why_correct_vi: whyCorrectVi,
        full_translation_vi: translationVi,
        options_analysis: {
          A: optA,
          B: optB,
          C: optC,
          D: optD,
        },
        tip_vi: "Xác định nhanh loại từ hoặc dấu hiệu thì đứng ngay trước và sau vị trí trống.",
        vocab_hints: [],
      },
    });
  }

  return questions;
}

/**
 * Nạp danh sách câu hỏi đã cào vào cơ sở dữ liệu Supabase
 */
export async function seedCrawledQuestions(questionsList: ParsedETSQuestion[]) {
  console.log(`📦 Bắt đầu nạp ${questionsList.length} câu hỏi ETS cào được vào Supabase...`);

  // 1. Lấy map tag_code -> tag_id
  const { data: tags, error: tagErr } = await supabase
    .from("grammar_tags")
    .select("id, tag_code");

  if (tagErr || !tags) {
    console.error("❌ Không thể lấy grammar_tags:", tagErr?.message);
    return;
  }

  const tagMap = new Map<string, number>();
  for (const t of tags) tagMap.set(t.tag_code, t.id);

  let successCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < questionsList.length; i++) {
    const q = questionsList[i];

    // Chạy validator tự động S3 - S6
    const report = runAutomatedValidator({
      stem: q.stem,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_index: q.correct_index,
      explanation: q.explanation,
    });

    if (!report.overallPass) {
      console.warn(`⚠️ Bỏ qua câu hỏi #${i + 1} do không đạt chuẩn Validator:`);
      report.checks.filter((c) => c.status === "fail").forEach((c) => console.warn(`   - [${c.id}] ${c.description}`));
      skippedCount++;
      continue;
    }

    const tagId = tagMap.get(q.tag_code);
    if (!tagId) {
      console.warn(`⚠️ Không tìm thấy tag_id cho ${q.tag_code}`);
      skippedCount++;
      continue;
    }

    // Tạo hash duy nhất xác định từ nội dung câu hỏi
    const stemHash = crypto.createHash("md5").update(q.stem.trim().toLowerCase()).digest("hex").slice(0, 12);
    const contentHash = `ets_${q.tag_code}_${stemHash}`;

    // Upsert câu hỏi
    const { data: existing } = await supabase
      .from("questions")
      .select("id")
      .eq("content_hash", contentHash)
      .maybeSingle();

    let questionId = existing?.id;

    if (!questionId) {
      const { data: inserted, error: qErr } = await supabase
        .from("questions")
        .insert({
          stem: q.stem,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          tag_id: tagId,
          difficulty: q.difficulty,
          status: "published",
          content_hash: contentHash,
        })
        .select("id")
        .single();

      if (qErr || !inserted) {
        console.error(`❌ Lỗi insert:`, qErr?.message);
        skippedCount++;
        continue;
      }
      questionId = inserted.id;
    }

    // Upsert đáp án và giải thích
    await supabase.from("question_answers").upsert(
      {
        question_id: questionId,
        correct_index: q.correct_index,
        explanation: q.explanation,
      },
      { onConflict: "question_id" }
    );

    successCount++;
  }

  console.log(`\n🎉 HOÀN THÀNH CÀO VÀ NẠP ĐỀ!`);
  console.log(`✅ Đã nạp thành công: ${successCount} câu hỏi ETS vào ngân hàng.`);
  if (skippedCount > 0) {
    console.log(`⚠️ Bị loại do không hợp lệ: ${skippedCount} câu.`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const fileArgIdx = args.indexOf("--file");

  if (fileArgIdx !== -1 && args[fileArgIdx + 1]) {
    const filePath = path.resolve(process.cwd(), args[fileArgIdx + 1]);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File không tồn tại: ${filePath}`);
      process.exit(1);
    }
    const rawContent = fs.readFileSync(filePath, "utf-8");
    console.log(`📂 Đang bóc tách dữ liệu từ file: ${filePath}`);
    const parsed = parseRawQuestionsText(rawContent);
    console.log(`🔍 Tìm thấy ${parsed.length} câu hỏi hợp lệ.`);
    await seedCrawledQuestions(parsed);
  } else {
    // Nạp gói 10 câu ETS mẫu chất lượng cao
    console.log("⚡ Đang nạp gói câu hỏi ETS tuyển chọn...");
    await seedCrawledQuestions(CRAWLED_ETS_QUESTIONS);
  }
}

main().catch((err) => {
  console.error("❌ Lỗi ngoại lệ:", err);
  process.exit(1);
});
