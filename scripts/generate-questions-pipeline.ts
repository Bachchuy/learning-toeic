/**
 * Pipeline Kết Nối Mô Hình AI Sinh Đề TOEIC Part 5 Tự Động (AI Generation Pipeline)
 * 
 * HỖ TRỢ ĐA DẠNG NGUỒN MÔ HÌNH:
 * 1. Google Gemini API / Gemini Tuned Models (gemini-2.5-flash / gemini-1.5-flash-tuned-xxx)
 * 2. Custom Fine-Tuned Model / vLLM / Ollama / OpenAI-compatible endpoint
 * 
 * CƠ CHẾ KIỂM ĐỊNH TỰ ĐỘNG (Quality Gate S3 - S6):
 * - Tự động chạy qua `runAutomatedValidator` từ `src/core/adminReview.ts`.
 * - Bắt buộc: Đúng 1 chỗ trống, 4 phương án không trùng lặp, đáp án 0-3, giải thích đầy đủ.
 * - Chỉ câu hỏi vượt qua 100% tiêu chí mới được nạp vào Supabase (`status: 'needs_review'`).
 */

import { createClient } from "@supabase/supabase-js";
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
  console.error("❌ LỖI: Thiếu biến môi trường Supabase trong .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export interface GeneratedQuestionItem {
  stem: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  tag_code: string;
  difficulty: number;
  correct_index: number;
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
    tip_vi?: string;
    example_en?: string;
    vocab_hints?: Array<{ word: string; meaning_vi: string }>;
  };
}

/**
 * Prompt chuẩn ETS dành cho mô hình sinh đề đã huấn luyện hoặc LLM
 */
export function buildPromptForTopic(tagCode: string, count: number = 3): string {
  const tagInfo = CANONICAL_GRAMMAR_TAGS[tagCode] || {
    nameVi: tagCode,
    descriptionVi: "",
  };

  return `Bạn là chuyên gia khảo thí ETS TOEIC và ngôn ngữ học ứng dụng tiếng Anh công sở.
Nhiệm vụ: Soạn chính xác ${count} câu hỏi TOEIC Part 5 chuẩn ETS về chủ điểm ngữ pháp:
- Mã chủ điểm: "${tagCode}"
- Tên chủ điểm: "${tagInfo.nameVi}"
- Nội dung: ${tagInfo.descriptionVi}

CÁC RÀNG BUỘC KỸ THUẬT BẮT BUỘC (QUY TẮC S3 - S6):
1. [S3] Mỗi câu hỏi trong trường "stem" CHỈ ĐƯỢC CÓ ĐÚNG MỘT CHỖ TRỐNG định dạng "______" (6 dấu gạch dưới). Bối cảnh hoàn toàn trong môi trường doanh nghiệp/công sở (HR, Marketing, Logistics, Finance, Travel, Operations).
2. [S4] Bốn phương án "option_a", "option_b", "option_c", "option_d" KHÔNG ĐƯỢC RỖNG và KHÔNG ĐƯỢC TRÙNG LẶP.
3. [S5] Trường "correct_index" là số nguyên từ 0 đến 3 (0=A, 1=B, 2=C, 3=D). Đúng DUY NHẤT một đáp án chính xác.
4. [S6] Giải thích phải đầy đủ 4 lớp: "rule_vi" (quy tắc cốt lõi), "why_correct_vi" (vì sao chọn đáp án này), "full_translation_vi" (dịch câu trọn vẹn), "options_analysis" (phân tích từng phương án A, B, C, D), và "vocab_hints" (2-3 từ vựng công sở hay).

TRẢ VỀ KẾT QUẢ ĐÚNG ĐỊNH DẠNG JSON ARRAY (Không bọc trong markdown hay text giải thích ngoài):
[
  {
    "stem": "Ms. Carter requested that the financial department ______ the quarterly budget by Friday.",
    "option_a": "revise",
    "option_b": "revises",
    "option_c": "revised",
    "option_d": "revising",
    "tag_code": "${tagCode}",
    "difficulty": 2,
    "correct_index": 0,
    "explanation": {
      "rule_vi": "Cấu trúc giả định thức (Subjunctive) sau động từ yêu cầu (request that + S + V-nguyên thể).",
      "why_correct_vi": "Động từ 'requested that' yêu cầu mệnh đề sau đó chia động từ ở dạng nguyên thể không 'to', bất kể chủ ngữ là số ít hay số nhiều.",
      "full_translation_vi": "Bà Carter đã yêu cầu bộ phận tài chính điều chỉnh ngân sách hàng quý trước thứ Sáu.",
      "options_analysis": {
        "A": "revise (v-bare): điều chỉnh (Đúng theo thể giả định)",
        "B": "revises (v-s): sai ngữ pháp thể giả định",
        "C": "revised (v-ed): sai ngữ pháp thể giả định",
        "D": "revising (v-ing): sai ngữ pháp thể giả định"
      },
      "tip_vi": "Các động từ như recommend, request, demand, suggest đi với 'that' đều đòi hỏi V-nguyên thể.",
      "vocab_hints": [
        {"word": "revise", "meaning_vi": "sửa đổi, điều chỉnh"},
        {"word": "quarterly budget", "meaning_vi": "ngân sách hàng quý"}
      ]
    }
  }
]`;
}

/**
 * Gọi mô hình sinh đề (Gemini API hoặc Custom Fine-Tuned LLM Endpoint)
 */
export async function callModelEndpoint(prompt: string): Promise<GeneratedQuestionItem[]> {
  const provider = process.env.LLM_PROVIDER || (process.env.GEMINI_API_KEY ? "gemini" : "custom");
  const apiKey = process.env.LLM_API_KEY || process.env.GEMINI_API_KEY;
  const endpoint = process.env.LLM_ENDPOINT; // Ví dụ: http://localhost:8000/v1/chat/completions
  const modelName = process.env.LLM_MODEL || "gemini-2.0-flash";

  if (!apiKey && !endpoint) {
    throw new Error(
      "Chưa cấu hình API Key hoặc LLM_ENDPOINT. Vui lòng thêm GEMINI_API_KEY hoặc LLM_ENDPOINT vào .env.local"
    );
  }

  let rawJsonText = "";

  if (provider === "gemini") {
    // Gọi Google Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Lỗi gọi Gemini API (${res.status}): ${errText}`);
    }

    const json = await res.json();
    rawJsonText = json.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
  } else {
    // Gọi OpenAI-compatible endpoint (vLLM / Ollama / Fine-tuned model)
    const targetUrl = endpoint || "http://localhost:8000/v1/chat/completions";
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Lỗi gọi Custom Model Endpoint (${res.status}): ${errText}`);
    }

    const json = await res.json();
    rawJsonText = json.choices?.[0]?.message?.content || "[]";
  }

  // Làm sạch markdown nếu có
  const cleaned = rawJsonText
    .replace(/^```json/m, "")
    .replace(/^```/m, "")
    .trim();

  try {
    return JSON.parse(cleaned) as GeneratedQuestionItem[];
  } catch (err) {
    console.error("❌ Lỗi parse JSON từ mô hình:", rawJsonText);
    throw err;
  }
}

/**
 * Xử lý nạp câu hỏi vào Supabase có bảo vệ qua Validator S3 - S6
 */
export async function importQuestionsWithQualityGate(
  questions: GeneratedQuestionItem[],
  targetStatus: "needs_review" | "published" = "needs_review"
) {
  // 1. Lấy tag map
  const { data: tags } = await supabase.from("grammar_tags").select("id, tag_code");
  const tagMap = new Map<string, number>();
  for (const t of tags || []) {
    tagMap.set(t.tag_code, t.id);
  }

  let passedCount = 0;
  let rejectedCount = 0;

  for (const q of questions) {
    // 2. Chạy bộ kiểm định chất lượng tự động S3 - S6
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
      console.warn(`⚠️ Bỏ qua câu hỏi không đạt tiêu chí chất lượng:`);
      console.warn(`   Stem: ${q.stem}`);
      report.checks
        .filter((c) => c.status === "fail")
        .forEach((c) => console.warn(`   - [${c.id}] ${c.description}`));
      rejectedCount++;
      continue;
    }

    const tagId = tagMap.get(q.tag_code);
    if (!tagId) {
      console.warn(`⚠️ Bỏ qua câu hỏi vì không tìm thấy tag_code: ${q.tag_code}`);
      rejectedCount++;
      continue;
    }

    // 3. Tạo hash nhận diện duy nhất
    const contentHash = `ai_${q.tag_code}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 4. Lưu vào bảng questions
    const { data: insertedQ, error: qErr } = await supabase
      .from("questions")
      .insert({
        stem: q.stem,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        tag_id: tagId,
        difficulty: q.difficulty || 1,
        status: targetStatus,
        content_hash: contentHash,
      })
      .select("id")
      .single();

    if (qErr || !insertedQ) {
      console.error(`❌ Lỗi insert questions:`, qErr?.message);
      rejectedCount++;
      continue;
    }

    // 5. Lưu vào bảng question_answers
    const { error: aErr } = await supabase.from("question_answers").insert({
      question_id: insertedQ.id,
      correct_index: q.correct_index,
      explanation: q.explanation,
    });

    if (aErr) {
      console.error(`❌ Lỗi insert question_answers:`, aErr.message);
      rejectedCount++;
      continue;
    }

    passedCount++;
  }

  console.log(`\n📊 Kết quả Kiểm định & Nhập dữ liệu:`);
  console.log(`✅ Đạt chuẩn và đã nạp: ${passedCount} câu (Trạng thái: '${targetStatus}')`);
  if (rejectedCount > 0) {
    console.log(`⚠️ Bị loại do không đạt chuẩn: ${rejectedCount} câu`);
  }
}
