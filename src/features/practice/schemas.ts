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
  if (result.success) {
    return result.data as QuestionExplanation;
  }

  // Fallback an toàn nếu dữ liệu không khớp
  const fallback = raw as Record<string, unknown>;
  return {
    rule_vi:
      typeof fallback.rule_vi === "string" && fallback.rule_vi.trim().length > 0
        ? fallback.rule_vi
        : "Cấu trúc ngữ pháp trọng tâm theo chuẩn đề thi TOEIC Part 5.",
    why_correct_vi:
      typeof fallback.why_correct_vi === "string" && fallback.why_correct_vi.trim().length > 0
        ? fallback.why_correct_vi
        : "Phương án này thỏa mãn hoàn toàn cấu trúc ngữ pháp và ngữ cảnh của câu.",
    full_translation_vi:
      typeof fallback.full_translation_vi === "string" ? fallback.full_translation_vi : undefined,
    options_analysis:
      fallback.options_analysis && typeof fallback.options_analysis === "object"
        ? (fallback.options_analysis as Record<"A" | "B" | "C" | "D", string>)
        : undefined,
    tip_vi: typeof fallback.tip_vi === "string" ? fallback.tip_vi : undefined,
    example_en: typeof fallback.example_en === "string" ? fallback.example_en : undefined,
    vocab_hints: Array.isArray(fallback.vocab_hints)
      ? (fallback.vocab_hints as Array<{ word: string; meaning_vi: string }>)
      : undefined,
  };
}
