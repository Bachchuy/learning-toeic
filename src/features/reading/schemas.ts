import { z } from "zod";
import type { PassageSubmitResult, ReadingQuestionResult } from "./types";

const QuestionExplanationSchema = z
  .object({
    translation: z.string().optional(),
    analysis: z.string().optional(),
    key_clue: z.string().optional(),
  })
  .passthrough();

const ReadingQuestionResultSchema = z.object({
  question_id: z.string().min(1),
  is_correct: z.boolean(),
  correct_index: z.number().int(),
  user_selected: z.number().int(),
  explanation: QuestionExplanationSchema.optional().default({}),
});

const PassageRpcSuccessSchema = z.object({
  success: z.literal(true),
  score: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  results: z.array(ReadingQuestionResultSchema),
  message: z.string().optional(),
});

/**
 * Fail-closed runtime parser for submit_passage_answers RPC payloads.
 * Only reports success when raw payload explicitly sets success === true with valid results.
 */
export function parsePassageSubmitResult(
  raw: unknown,
  fallbackTotal: number
): PassageSubmitResult {
  const safeFallbackTotal = Math.max(0, fallbackTotal);

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      success: false,
      score: 0,
      total: safeFallbackTotal,
      results: [],
      message: "Lỗi kiểm tra đáp án bài đọc.",
    };
  }

  const rawObj = raw as Record<string, unknown>;
  const rawMessage =
    typeof rawObj.message === "string" && rawObj.message.trim().length > 0
      ? rawObj.message
      : "Lỗi kiểm tra đáp án bài đọc.";

  if (rawObj.success !== true) {
    return {
      success: false,
      score: 0,
      total: safeFallbackTotal,
      results: [],
      message: rawMessage,
    };
  }

  const parsed = PassageRpcSuccessSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      score: 0,
      total: safeFallbackTotal,
      results: [],
      message: rawMessage,
    };
  }

  const results: ReadingQuestionResult[] = parsed.data.results.map((item) => ({
    question_id: item.question_id,
    is_correct: item.is_correct,
    correct_index: item.correct_index,
    user_selected: item.user_selected,
    explanation: {
      translation: item.explanation?.translation,
      analysis: item.explanation?.analysis,
      key_clue: item.explanation?.key_clue,
    },
  }));

  return {
    success: true,
    score: parsed.data.score,
    total: parsed.data.total,
    results,
    message: parsed.data.message,
  };
}
