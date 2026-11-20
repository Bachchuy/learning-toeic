import { z } from "zod";
import { formatGrammarTagName } from "@/core/grammarTags";
import type {
  OptionExplanation,
  QuestionExplanation,
  SessionReviewItem,
  SessionReviewResponse,
} from "./types";

/**
 * Zod Schema cho dữ liệu giải thích câu hỏi (Question Explanation)
 * 
 * BẤT BIẾN §4.3 & D-09:
 * - Hệ thống phải chịu lỗi (Resilient / Defensive): Nếu dữ liệu JSON trong DB
 *   bị thiếu trường hoặc sai định dạng, parser phải tự động gán giá trị dự phòng
 *   hợp lý, TUYỆT ĐỐI KHÔNG làm hỏng giao diện hay sập trang (white screen).
 */

export const OptionExplanationSchema = z.object({
  option: z.enum(["A", "B", "C", "D"]),
  reason_vi: z.string().default("Phương án này không phù hợp với cấu trúc ngữ pháp của câu."),
});

export const VocabHintSchema = z.object({
  word: z.string(),
  meaning_vi: z.string(),
});

export const QuestionExplanationSchema = z.object({
  rule_vi: z
    .string()
    .default("Cấu trúc ngữ pháp trọng tâm theo chuẩn đề thi TOEIC Part 5."),
  why_correct_vi: z
    .string()
    .default("Phương án này thỏa mãn hoàn toàn cấu trúc ngữ pháp và ngữ cảnh của câu."),
  full_translation_vi: z.string().optional(),
  options_analysis: z
    .record(z.enum(["A", "B", "C", "D"]), z.string())
    .optional(),
  why_wrong_vi: z.array(OptionExplanationSchema).optional(),
  tip_vi: z.string().optional(),
  example_en: z.string().optional(),
  vocab_hints: z.array(VocabHintSchema).optional(),
});

/**
 * Lọc bỏ các chuỗi rập khuôn/máy móc cũ nếu chưa được tinh chỉnh bằng AI
 */
function sanitizeAnalysisString(text?: string): string | undefined {
  if (!text) return undefined;
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  if (
    trimmed.includes("không phù hợp về ngữ nghĩa hoặc không tạo thành cụm từ tự nhiên") ||
    trimmed.includes("Đáp án đúng. Mang nghĩa và cấu trúc chuẩn xác nhất cho câu.") ||
    trimmed === "Phương án này không phù hợp với cấu trúc ngữ pháp của câu."
  ) {
    return undefined; // Ẩn chuỗi rập khuôn máy móc / dự phòng chung chung
  }
  return text;
}

/**
 * Hàm phân tích và kiểm tra tính hợp lệ của dữ liệu giải thích.
 * Luôn trả về một QuestionExplanation hợp lệ kể cả khi đầu vào là null, undefined hay dữ liệu rác.
 */
export function parseExplanation(raw: unknown): QuestionExplanation {
  if (!raw || typeof raw !== "object") {
    return {
      rule_vi: "Cấu trúc ngữ pháp trọng tâm theo chuẩn đề thi TOEIC Part 5.",
      why_correct_vi: "Phương án này thỏa mãn hoàn toàn cấu trúc ngữ pháp và ngữ cảnh của câu.",
    };
  }

  const result = QuestionExplanationSchema.safeParse(raw);
  const data = result.success ? result.data : (raw as Record<string, unknown>);

  // Làm sạch options_analysis nếu dính chuỗi template cũ
  let cleanedOptionsAnalysis: Record<"A" | "B" | "C" | "D", string> | undefined = undefined;
  if (data.options_analysis && typeof data.options_analysis === "object") {
    const rawAnalysis = data.options_analysis as Record<"A" | "B" | "C" | "D", string>;
    const cleaned: Partial<Record<"A" | "B" | "C" | "D", string>> = {};
    let hasAny = false;
    for (const key of ["A", "B", "C", "D"] as const) {
      const sanitized = sanitizeAnalysisString(rawAnalysis[key]);
      if (sanitized) {
        cleaned[key] = sanitized;
        hasAny = true;
      }
    }
    if (hasAny) {
      cleanedOptionsAnalysis = cleaned as Record<"A" | "B" | "C" | "D", string>;
    }
  }

  // Làm sạch why_correct_vi nếu dính template rập khuôn
  let whyCorrect = typeof data.why_correct_vi === "string" ? data.why_correct_vi : "";
  if (
    whyCorrect.includes("mang ngữ nghĩa phù hợp nhất với ngữ cảnh của câu và kết hợp tự nhiên với các từ xung quanh") ||
    whyCorrect.includes("tạo thành cấu trúc so sánh chuẩn xác theo dấu hiệu ngữ pháp trong câu")
  ) {
    whyCorrect = "Phương án này tạo nên cấu trúc ngữ pháp chuẩn xác và truyền đạt đúng ý nghĩa trong ngữ cảnh câu.";
  }

  // Chuẩn hóa why_wrong_vi (hỗ trợ cả mảng OptionExplanation[] lẫn object Record<"A".."D", string> legacy)
  // Giữ nguyên thông tin thiếu reason_vi ở dữ liệu gốc: không tự điền chuỗi chung chung khi raw thiếu/rỗng
  let normalizedWhyWrong: OptionExplanation[] | undefined = undefined;
  const rawWhyWrong = (raw as Record<string, unknown>).why_wrong_vi;
  if (Array.isArray(rawWhyWrong)) {
    const validItems: OptionExplanation[] = [];
    for (const item of rawWhyWrong) {
      if (!item || typeof item !== "object") {
        continue;
      }
      const rawReason = (item as Record<string, unknown>).reason_vi;
      if (typeof rawReason !== "string" || !sanitizeAnalysisString(rawReason)) {
        continue;
      }
      const parsedItem = OptionExplanationSchema.safeParse(item);
      if (parsedItem.success && parsedItem.data.reason_vi.trim().length > 0) {
        validItems.push({
          option: parsedItem.data.option,
          reason_vi: parsedItem.data.reason_vi.trim(),
        });
      }
    }
    if (validItems.length > 0) {
      normalizedWhyWrong = validItems;
    }
  } else if (rawWhyWrong && typeof rawWhyWrong === "object") {
    const validItems: OptionExplanation[] = [];
    for (const key of ["A", "B", "C", "D"] as const) {
      const val = (rawWhyWrong as Record<string, unknown>)[key];
      if (typeof val === "string" && sanitizeAnalysisString(val)) {
        validItems.push({ option: key, reason_vi: val.trim() });
      }
    }
    if (validItems.length > 0) {
      normalizedWhyWrong = validItems;
    }
  }

  return {
    rule_vi:
      typeof data.rule_vi === "string" && data.rule_vi.trim().length > 0
        ? data.rule_vi
        : "Cấu trúc ngữ pháp trọng tâm theo chuẩn đề thi TOEIC Part 5.",
    why_correct_vi:
      whyCorrect.trim().length > 0
        ? whyCorrect
        : "Phương án này thỏa mãn hoàn toàn cấu trúc ngữ pháp và ngữ cảnh của câu.",
    full_translation_vi:
      typeof data.full_translation_vi === "string" ? data.full_translation_vi : undefined,
    options_analysis: cleanedOptionsAnalysis,
    why_wrong_vi: normalizedWhyWrong,
    tip_vi: typeof data.tip_vi === "string" ? data.tip_vi : undefined,
    example_en: typeof data.example_en === "string" ? data.example_en : undefined,
    vocab_hints: Array.isArray(data.vocab_hints)
      ? (data.vocab_hints as Array<{ word: string; meaning_vi: string }>)
      : undefined,
  };
}

export const SessionReviewItemSchema = z.object({
  question_id: z.string().min(1),
  order_index: z.number().int(),
  stem: z.string(),
  option_a: z.string(),
  option_b: z.string(),
  option_c: z.string(),
  option_d: z.string(),
  tag_name_vi: z.string().optional().nullable(),
  selected_index: z.number().int().nullable(),
  correct_index: z.number().int(),
  is_correct: z.boolean().nullable(),
  explanation: z.unknown().optional(),
});

export const SessionReviewResponseSchema = z.object({
  session_id: z.string().min(1),
  total_questions: z.number().int().nonnegative(),
  completed_at: z.string().nullable(),
  created_at: z.string().min(1),
  correct_count: z.number().int().nonnegative(),
  attempts: z.array(SessionReviewItemSchema),
});

/**
 * Runtime contract guard for get_session_review RPC.
 * Rejects malformed/legacy array payloads instead of casting blindly.
 */
export function parseSessionReviewResponse(
  raw: unknown
): SessionReviewResponse | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }

  const parsed = SessionReviewResponseSchema.safeParse(raw);
  if (!parsed.success) {
    return null;
  }

  const attempts: SessionReviewItem[] = parsed.data.attempts.map((item) => ({
    question_id: item.question_id,
    order_index: item.order_index,
    stem: item.stem,
    option_a: item.option_a,
    option_b: item.option_b,
    option_c: item.option_c,
    option_d: item.option_d,
    tag_name_vi: formatGrammarTagName(
      "",
      item.tag_name_vi || "Ngữ pháp tổng hợp"
    ),
    selected_index: item.selected_index,
    correct_index: item.correct_index,
    is_correct: item.is_correct,
    explanation: parseExplanation(item.explanation),
  }));

  return {
    session_id: parsed.data.session_id,
    total_questions: parsed.data.total_questions,
    completed_at: parsed.data.completed_at,
    created_at: parsed.data.created_at,
    correct_count: parsed.data.correct_count,
    attempts,
  };
}
