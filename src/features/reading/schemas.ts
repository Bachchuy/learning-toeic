import { z } from "zod";
import { isBoilerplateTemplateText, OPTION_LETTERS_4, type OptionLetter } from "@/core/explanationQuality";
import type { PassageSubmitResult, QuestionExplanation, ReadingQuestionResult } from "./types";

const VocabHintSchema = z.object({
  word: z.string(),
  meaning_vi: z.string(),
});

const QuestionExplanationObjectSchema = z
  .object({
    question_type_vi: z.string().optional(),
    rule_vi: z.string().optional(),
    translation: z.string().optional(),
    full_translation_vi: z.string().optional(),
    analysis: z.string().optional(),
    why_correct_vi: z.string().optional(),
    key_clue: z.string().optional(),
    evidence: z.string().optional(),
    tip_vi: z.string().optional(),
    options_analysis: z
      .record(z.enum(["A", "B", "C", "D"]), z.string())
      .optional(),
    vocab_hints: z.array(VocabHintSchema).optional(),
  })
  .passthrough();

const ReadingQuestionResultSchema = z.object({
  question_id: z.string().min(1),
  is_correct: z.boolean(),
  correct_index: z.number().int(),
  user_selected: z.number().int(),
  explanation: z
    .union([QuestionExplanationObjectSchema, z.string(), z.null()])
    .optional(),
});

const PassageRpcSuccessSchema = z.object({
  success: z.literal(true),
  score: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  results: z.array(ReadingQuestionResultSchema),
  message: z.string().optional(),
});

/**
 * Chuẩn hóa payload giải thích bài đọc Part 6 & Part 7 (hỗ trợ cả chuỗi văn bản cũ,
 * cấu trúc legacy {translation, analysis, key_clue} và cấu trúc mới đầy đủ options_analysis).
 */
export function normalizeReadingExplanation(raw: unknown): QuestionExplanation {
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return {};
    if (trimmed.startsWith("{")) {
      try {
        return normalizeReadingExplanation(JSON.parse(trimmed));
      } catch {
        return { analysis: trimmed };
      }
    }
    return { analysis: trimmed };
  }

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  const obj = raw as Record<string, unknown>;
  const pickStr = (...keys: string[]): string | undefined => {
    for (const k of keys) {
      const val = obj[k];
      if (typeof val === "string" && val.trim().length > 0) {
        return val.trim();
      }
    }
    return undefined;
  };

  let optionsAnalysis: Partial<Record<OptionLetter, string>> | undefined;
  if (obj.options_analysis && typeof obj.options_analysis === "object" && !Array.isArray(obj.options_analysis)) {
    const rawOpts = obj.options_analysis as Record<string, unknown>;
    const cleanOpts: Partial<Record<OptionLetter, string>> = {};
    for (const letter of OPTION_LETTERS_4) {
      const val = rawOpts[letter];
      if (typeof val === "string" && val.trim().length > 0 && !isBoilerplateTemplateText(val)) {
        cleanOpts[letter] = val.trim();
      }
    }
    if (Object.keys(cleanOpts).length > 0) {
      optionsAnalysis = cleanOpts;
    }
  }

  const vocabHints = Array.isArray(obj.vocab_hints)
    ? obj.vocab_hints.filter(
        (h): h is { word: string; meaning_vi: string } =>
          Boolean(h) &&
          typeof h === "object" &&
          typeof (h as Record<string, unknown>).word === "string" &&
          typeof (h as Record<string, unknown>).meaning_vi === "string"
      )
    : undefined;

  return {
    question_type_vi: pickStr("question_type_vi"),
    rule_vi: pickStr("rule_vi"),
    translation: pickStr("full_translation_vi", "translation"),
    analysis: pickStr("why_correct_vi", "analysis"),
    key_clue: pickStr("key_clue", "evidence"),
    tip_vi: pickStr("tip_vi"),
    options_analysis: optionsAnalysis,
    vocab_hints: vocabHints && vocabHints.length > 0 ? vocabHints : undefined,
  };
}

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
    explanation: normalizeReadingExplanation(item.explanation),
  }));

  return {
    success: true,
    score: parsed.data.score,
    total: parsed.data.total,
    results,
    message: parsed.data.message,
  };
}
