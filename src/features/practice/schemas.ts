import { z } from "zod";
import type { QuestionExplanation } from "./types";

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
  if (
    text.includes("không phù hợp về ngữ nghĩa hoặc không tạo thành cụm từ tự nhiên") ||
    text.includes("Đáp án đúng. Mang nghĩa và cấu trúc chuẩn xác nhất cho câu.")
  ) {
    return undefined; // Ẩn chuỗi rập khuôn máy móc
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
    tip_vi: typeof data.tip_vi === "string" ? data.tip_vi : undefined,
    example_en: typeof data.example_en === "string" ? data.example_en : undefined,
    vocab_hints: Array.isArray(data.vocab_hints)
      ? (data.vocab_hints as Array<{ word: string; meaning_vi: string }>)
      : undefined,
  };
}
