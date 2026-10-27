/**
 * Script tự động tinh chỉnh và chuẩn hóa lời giải sư phạm TOEIC Part 5 bằng Gemini AI.
 * 
 * Tính năng nâng cao:
 * - Tự động phát hiện các câu có lời giải cũ rập khuôn để vá (bỏ qua câu đã vá).
 * - Tự động Retry với Exponential Backoff khi gặp lỗi mạng hoặc 503 High Demand.
 * - Luân chuyển model linh hoạt (gemini-3.5-flash, gemini-flash-latest).
 * - Chạy liên tục theo từng trang (Pagination) cho đến khi vá xong toàn bộ.
 * 
 * Cách chạy:
 *   npx tsx scripts/refine-explanations-ai.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// 1. Nạp biến môi trường từ .env.local
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
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Lỗi: Thiếu thông tin kết nối Supabase:");
  console.error(`   - NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "Đã có" : "THIẾU"}`);
  console.error(`   - SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? "Đã có" : "THIẾU"}`);
  process.exit(1);
}

if (!geminiApiKey) {
  console.error("❌ Lỗi: Thiếu GEMINI_API_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 2. Danh mục 16 tag ngữ pháp chuẩn TOEIC
const GRAMMAR_TAGS = [
  { id: 1, code: "tenses", name: "Thì động từ (Tenses)" },
  { id: 2, code: "subject_verb", name: "Hòa hợp Chủ ngữ - Động từ" },
  { id: 3, code: "passive_voice", name: "Câu bị động (Passive Voice)" },
  { id: 4, code: "modals", name: "Động từ khuyết thiếu (Modal Verbs)" },
  { id: 5, code: "gerund_infinitive", name: "Danh động từ & Động từ nguyên mẫu (V-ing / To-V)" },
  { id: 6, code: "participles", name: "Phân từ & Rút gọn mệnh đề" },
  { id: 7, code: "relative_clauses", name: "Mệnh đề quan hệ (Relative Clauses)" },
  { id: 8, code: "conditionals", name: "Câu điều kiện & Thể giả định" },
  { id: 9, code: "comparisons", name: "Cấu trúc so sánh (Comparisons)" },
  { id: 10, code: "conjunctions_prepositions", name: "Liên từ & Giới từ" },
  { id: 11, code: "nouns_pronouns", name: "Danh từ & Đại từ" },
  { id: 12, code: "adjectives_adverbs", name: "Tính từ & Trạng từ" },
  { id: 13, code: "inversion", name: "Đảo ngữ (Inversion)" },
  { id: 14, code: "word_form", name: "Từ loại (Word Form)" },
  { id: 15, code: "collocations", name: "Cụm từ cố định (Collocations)" },
  { id: 16, code: "parallel_structure", name: "Cấu trúc song hành (Parallelism)" },
];

/**
 * Gọi Gemini REST API kèm cơ chế Retry tự động khi máy chủ quá tải (503 / 429)
 */
async function callGeminiWithRetry(prompt: string, maxRetries = 3): Promise<string> {
  const models = ["gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3-flash-preview"];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  tag_id: { type: "INTEGER" },
                  rule_vi: { type: "STRING" },
                  why_correct_vi: { type: "STRING" },
                  tip_vi: { type: "STRING" },
                  options_analysis: {
                    type: "OBJECT",
                    properties: {
                      A: { type: "STRING" },
                      B: { type: "STRING" },
                      C: { type: "STRING" },
                      D: { type: "STRING" },
                    },
                    required: ["A", "B", "C", "D"],
                  },
                  vocab_hints: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        word: { type: "STRING" },
                        meaning_vi: { type: "STRING" },
                      },
                      required: ["word", "meaning_vi"],
                    },
                  },
                },
                required: [
                  "tag_id",
                  "rule_vi",
                  "why_correct_vi",
                  "tip_vi",
                  "options_analysis",
                  "vocab_hints",
                ],
              },
              temperature: 0.2,
            },
          }),
          signal: AbortSignal.timeout(25000),
        });

        if (res.ok) {
          const json = await res.json();
          const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        }

        const errText = await res.text();
        // Nếu gặp 429 (Rate Limit), tạm dừng hẳn 15s để làm mới quota window của Google
        if (res.status === 429) {
          const waitSec = attempt * 15;
          console.log(`      ⏳ Đụng giới hạn tốc độ (429 Rate Limit trên ${model}). Tạm nghỉ ${waitSec}s để phục hồi quota...`);
          await new Promise((r) => setTimeout(r, waitSec * 1000));
          continue;
        }

        // Nếu lỗi 503 (quá tải tạm thời), chờ nhẹ rồi thử lại
        if (res.status === 503) {
          const waitSec = attempt * 4;
          console.log(`      ⏳ Máy chủ báo 503 (${model}). Chờ ${waitSec}s rồi thử lại lần ${attempt}/${maxRetries}...`);
          await new Promise((r) => setTimeout(r, waitSec * 1000));
          continue;
        }

        throw new Error(`Gemini API HTTP ${res.status}: ${errText}`);
      } catch (err: any) {
        lastError = err;
        if (attempt < maxRetries) {
          const waitSec = attempt * 2;
          console.log(`      ⚠️ Lỗi kết nối (${err.message}). Chờ ${waitSec}s thử lại...`);
          await new Promise((r) => setTimeout(r, waitSec * 1000));
        }
      }
    }
  }

  throw lastError || new Error("Không thể kết nối đến Gemini sau nhiều lần thử.");
}

interface RefinedResult {
  tag_id: number;
  rule_vi: string;
  why_correct_vi: string;
  tip_vi: string;
  options_analysis: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  vocab_hints: Array<{ word: string; meaning_vi: string }>;
}

function extractJson(rawJsonText: string): any {
  if (!rawJsonText || typeof rawJsonText !== "string") {
    throw new Error("Phản hồi rỗng từ AI");
  }

  // 1. Tháo gỡ markdown code block nếu có
  let clean = rawJsonText.trim();
  clean = clean.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  // 2. Thử parse trực tiếp
  try {
    return JSON.parse(clean);
  } catch {
    // 3. Tìm khối JSON { ... } lớn nhất
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start !== -1 && end > start) {
      const jsonCandidate = clean.slice(start, end + 1);

      try {
        return JSON.parse(jsonCandidate);
      } catch {
        // 4. Khử lỗi trailing comma (dấu phẩy thừa trước } hoặc ])
        let sanitized = jsonCandidate.replace(/,\s*([\}\]])/g, "$1");

        // 5. Loại bỏ comment // ... hoặc /* ... */
        sanitized = sanitized.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "$1");

        try {
          return JSON.parse(sanitized);
        } catch {
          // 6. Xử lý trường hợp có ký tự điều khiển hoặc xuống dòng thô trong chuỗi string
          // Chỉ escape \n, \r trong nội dung chuỗi (giữa hai dấu nháy kép), không can thiệp vào các newline cấu trúc
          const escaped = sanitized.replace(/"((?:\\.|[^"\\])*)"/g, (match) => {
            return match
              .replace(/\r/g, "")
              .replace(/\n/g, "\\n")
              .replace(/\t/g, "\\t");
          });
          return JSON.parse(escaped);
        }
      }
    }
    throw new Error("Không thể trích xuất JSON hợp lệ từ phản hồi AI: " + rawJsonText.slice(0, 100));
  }
}

async function refineQuestionWithAI(q: any, correctIndex: number): Promise<RefinedResult> {
  const letters = ["A", "B", "C", "D"];
  const correctLetter = letters[correctIndex];
  const optionsArr = [q.option_a, q.option_b, q.option_c, q.option_d];
  const correctText = optionsArr[correctIndex];

  const prompt = `
Bạn là chuyên gia sư phạm TOEIC 990 điểm. Hãy viết lời giải chi tiết, chuẩn xác, không rập khuôn cho câu hỏi TOEIC Part 5 sau:

ĐỀ BÀI: "${q.stem}"
A. ${q.option_a}
B. ${q.option_b}
C. ${q.option_c}
D. ${q.option_d}
ĐÁP ÁN ĐÚNG: ${correctLetter} (${correctText})

DANH SÁCH 16 CHỦ ĐIỂM NGỮ PHÁP (Chọn đúng 1 tag_id phản ánh bản chất ngữ pháp của câu):
${JSON.stringify(GRAMMAR_TAGS.map((t) => ({ id: t.id, name: t.name })))}

YÊU CẦU NỘI DUNG:
1. Xác định đúng bản chất ngữ pháp (Ví dụ: Chỗ trống cần Danh từ làm Chủ ngữ thì tag_id phải là 14 Word Form hoặc 11 Nouns, KHÔNG gán nhầm sang Comparisons chỉ vì câu có 'than' trong mốc thời gian).
2. Viết lời giải 4 tầng chất lượng cao:
   - rule_vi: Quy tắc ngữ pháp trọng tâm, phân tích thành phần câu.
   - why_correct_vi: Giải thích vì sao đáp án đúng thỏa mãn cấu trúc và ngữ nghĩa.
   - tip_vi: Mẹo nhận diện nhanh trong 10-15 giây để làm bài tốc độ cao.
   - options_analysis: Phân tích tường tận TỪNG PHƯƠNG ÁN A, B, C, D (từ loại, nghĩa, lý do sai hoặc đúng).
   - vocab_hints: 1-3 từ vựng/cụm từ quan trọng nhất trong câu.

TRẢ VỀ DUY NHẤT 1 ĐỐI TƯỢNG JSON:
{
  "tag_id": <số nguyên từ 1 đến 16>,
  "rule_vi": "<nội dung>",
  "why_correct_vi": "<nội dung>",
  "tip_vi": "<nội dung>",
  "options_analysis": {
    "A": "<giải thích A>",
    "B": "<giải thích B>",
    "C": "<giải thích C>",
    "D": "<giải thích D>"
  },
  "vocab_hints": [
    { "word": "<từ vựng>", "meaning_vi": "<nghĩa tiếng Việt>" }
  ]
}
`;

  const rawJsonText = await callGeminiWithRetry(prompt);
  return extractJson(rawJsonText);
}

/**
 * Kiểm tra xem lời giải hiện tại có phải là lời giải cũ rập khuôn cần vá không
 */
function isBoilerplateExplanation(explanation: any): boolean {
  if (!explanation) return true;
  const expStr = JSON.stringify(explanation);
  
  // Dấu hiệu của template cũ trong ingest-kaggle-toeic.ts
  if (expStr.includes("không phù hợp về ngữ nghĩa hoặc không tạo thành cụm từ tự nhiên")) return true;
  if (expStr.includes("tạo thành cấu trúc so sánh chuẩn xác theo dấu hiệu ngữ pháp trong câu")) return true;
  if (expStr.includes("Quy tắc nhận diện từ loại (Word Form). Xác định vị trí của chỗ trống")) return true;
  if (expStr.includes("Quy tắc chia thì động từ (Tenses) và sự phối hợp thì trong câu. Dựa vào dấu hiệu thời gian")) return true;
  if (expStr.includes("Quy tắc sử dụng Đại từ (Pronouns) và Danh từ. Phân biệt rõ giữa")) return true;
  if (expStr.includes("Từ khóa chính trong câu")) return true;

  return false;
}

async function main() {
  console.log("==========================================================");
  console.log("🚀 BẮT ĐẦU QUY TRÌNH VÁ TOÀN BỘ LỜI GIẢI TOEIC BẰNG GEMINI");
  console.log("==========================================================\n");

  const specificQId = process.env.QUESTION_ID;
  const maxToProcess = parseInt(process.env.LIMIT || "500", 10);
  const pageSize = 50;

  let totalProcessed = 0;
  let totalRefined = 0;
  let totalSkipped = 0;
  let totalFailed = 0;
  let offset = 0;

  while (totalProcessed < maxToProcess) {
    let query = supabase
      .from("questions")
      .select("id, stem, option_a, option_b, option_c, option_d, tag_id, part")
      .eq("part", 5)
      .gte("created_at", "2026-10-26T15:00:00+00:00")
      .order("created_at", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (specificQId) {
      query = supabase
        .from("questions")
        .select("id, stem, option_a, option_b, option_c, option_d, tag_id, part")
        .eq("id", specificQId);
    }

    const { data: questions, error } = await query;
    if (error || !questions || questions.length === 0) {
      console.log("📦 Không còn câu hỏi nào để duyệt trong khoảng này.");
      break;
    }

    console.log(`\n--- Đang quét trang offset ${offset} -> ${offset + questions.length} (${questions.length} câu) ---`);

    for (const q of questions) {
      if (totalProcessed >= maxToProcess) break;
      totalProcessed++;

      const { data: aData } = await supabase
        .from("question_answers")
        .select("correct_index, explanation")
        .eq("question_id", q.id)
        .single();

      if (!aData) {
        totalSkipped++;
        continue;
      }

      // Kiểm tra xem câu này có cần vá không
      const needsRefine = isBoilerplateExplanation(aData.explanation);
      if (!needsRefine && !specificQId) {
        // Đã là lời giải chất lượng cao -> bỏ qua
        totalSkipped++;
        continue;
      }

      console.log(`[#${totalProcessed}] Đang vá câu: "${q.stem.slice(0, 55)}..." (ID: ${q.id})`);

      try {
        const refined = await refineQuestionWithAI(q, aData.correct_index);

        // 1. Cập nhật tag_id cho questions
        if (refined.tag_id && refined.tag_id !== q.tag_id) {
          await supabase
            .from("questions")
            .update({ tag_id: refined.tag_id })
            .eq("id", q.id);
          console.log(`   🏷️  Đổi tag_id: ${q.tag_id} -> ${refined.tag_id}`);
        }

        // 2. Cập nhật explanation cho question_answers
        const updatedExplanation = {
          rule_vi: refined.rule_vi,
          why_correct_vi: refined.why_correct_vi,
          tip_vi: refined.tip_vi,
          options_analysis: refined.options_analysis,
          vocab_hints: refined.vocab_hints,
        };

        const { error: updateErr } = await supabase
          .from("question_answers")
          .update({ explanation: updatedExplanation })
          .eq("question_id", q.id);

        if (updateErr) throw new Error(updateErr.message);

        console.log(`   ✅ Đã vá thành công!`);
        totalRefined++;
      } catch (err: any) {
        console.error(`   ❌ Lỗi: ${err.message}`);
        totalFailed++;
        // Nếu dính hạn ngạch cứng 429 quota day, dừng để báo người dùng
        if (err.message.includes("429") && err.message.includes("quota")) {
          console.error("🛑 Key đã đạt giới hạn ngày. Dừng tiến trình.");
          return;
        }
      }

      // Giãn cách 4.5 giây giữa mỗi câu để giữ tốc độ ở mức ~13 requests/phút (chuẩn dưới ngưỡng 15 RPM của Gemini)
      await new Promise((r) => setTimeout(r, 4500));
    }

    if (specificQId) break;
    offset += pageSize;
  }

  console.log("\n==========================================================");
  console.log(`🎉 KẾT THÚC TIẾN TRÌNH:`);
  console.log(`   - Tổng số câu đã quét: ${totalProcessed}`);
  console.log(`   - Đã vá mới thành công: ${totalRefined}`);
  console.log(`   - Bỏ qua (đã chuẩn):   ${totalSkipped}`);
  console.log(`   - Lỗi:                 ${totalFailed}`);
  console.log("==========================================================");
}

main().catch((err) => {
  console.error("Lỗi:", err);
  process.exit(1);
});
