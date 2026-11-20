import type { QuestionExplanation } from "@/features/practice/types";

export type OptionLabel = "A" | "B" | "C" | "D";

export const OPTION_LABELS: readonly OptionLabel[] = ["A", "B", "C", "D"] as const;

const GENERIC_DEFAULT_OPTION_REASON =
  "Phương án này không phù hợp với cấu trúc ngữ pháp của câu.";

export interface InlineSelectedFeedback {
  optionIndex: number;
  optionLabel: OptionLabel;
  kind: "selected_option" | "correct_reason_fallback";
  heading: string;
  body: string;
}

export interface OptionAnalysisDetail {
  option: OptionLabel;
  reason: string;
}

export interface ExpandableDetailOptions {
  includeTranslation?: boolean;
  hasOptionAnalyses?: boolean;
}

export interface ExpandableDetailFlags {
  hasRule: boolean;
  hasTranslation: boolean;
  hasExample: boolean;
  hasTip: boolean;
  hasOptionAnalyses: boolean;
  hasAny: boolean;
  openLabel: string;
  closeLabel: string;
}

export interface ResolvedPracticeFeedback {
  selectedLabel: OptionLabel | null;
  correctLabel: OptionLabel | null;
  inlineSelectedFeedback: InlineSelectedFeedback | null;
  showWhyCorrectInSummary: boolean;
  whyCorrectText: string | null;
  remainingOptionAnalyses: OptionAnalysisDetail[];
  expandable: ExpandableDetailFlags;
}

function normalizeSpecificReason(raw?: string | null): string | null {
  if (typeof raw !== "string") {
    return null;
  }
  const trimmed = raw.trim();
  if (!trimmed || trimmed === GENERIC_DEFAULT_OPTION_REASON) {
    return null;
  }
  return trimmed;
}

/**
 * Chuyển đổi chỉ số phương án (0..3) sang nhãn chữ cái A..D.
 */
export function getOptionLabel(index: number | null | undefined): OptionLabel | null {
  if (typeof index !== "number" || !Number.isInteger(index)) {
    return null;
  }
  if (index < 0 || index >= OPTION_LABELS.length) {
    return null;
  }
  return OPTION_LABELS[index] ?? null;
}

/**
 * Lấy lời giải riêng cho phương án từ why_wrong_vi hoặc options_analysis,
 * bỏ qua giá trị rỗng và câu dự phòng chung chung.
 */
export function getSelectedOptionSpecificReason(
  explanation: QuestionExplanation,
  optionLabel: OptionLabel
): string | null {
  const fromWhyWrong = normalizeSpecificReason(
    explanation.why_wrong_vi?.find((item) => item.option === optionLabel)?.reason_vi
  );
  if (fromWhyWrong) {
    return fromWhyWrong;
  }

  const fromAnalysis = normalizeSpecificReason(
    explanation.options_analysis?.[optionLabel]
  );
  if (fromAnalysis) {
    return fromAnalysis;
  }

  return null;
}

/**
 * Lấy danh sách phân tích các phương án còn lại theo thứ tự A–D,
 * bỏ qua phương án/nội dung đã hiển thị trực tiếp ngay dưới lựa chọn hoặc phần tóm tắt.
 */
export function getRemainingOptionAnalyses(
  explanation: QuestionExplanation,
  options?: {
    excludeOption?: OptionLabel | null;
    excludeTexts?: Array<string | null | undefined>;
  }
): OptionAnalysisDetail[] {
  const excludedOption = options?.excludeOption ?? null;
  const excludedTextSet = new Set(
    (options?.excludeTexts ?? [])
      .map((t) => (typeof t === "string" ? t.trim() : ""))
      .filter((t) => t.length > 0)
  );

  const items: OptionAnalysisDetail[] = [];
  for (const label of OPTION_LABELS) {
    if (label === excludedOption) {
      continue;
    }
    const reason = getSelectedOptionSpecificReason(explanation, label);
    if (!reason || excludedTextSet.has(reason)) {
      continue;
    }
    items.push({ option: label, reason });
  }
  return items;
}

/**
 * Xác định các phần thông tin có thể mở rộng và nhãn nút trung thực.
 */
export function getExpandableDetailFlags(
  explanation: QuestionExplanation,
  options?: ExpandableDetailOptions
): ExpandableDetailFlags {
  const includeTranslation = options?.includeTranslation ?? true;
  const hasRule = Boolean(explanation.rule_vi?.trim());
  const hasTranslation =
    includeTranslation && Boolean(explanation.full_translation_vi?.trim());
  const hasExample = Boolean(explanation.example_en?.trim());
  const hasTip = Boolean(explanation.tip_vi?.trim());
  const hasOptionAnalyses = Boolean(options?.hasOptionAnalyses);
  const hasAny =
    hasRule || hasTranslation || hasExample || hasTip || hasOptionAnalyses;

  if (!hasAny) {
    return {
      hasRule,
      hasTranslation,
      hasExample,
      hasTip,
      hasOptionAnalyses,
      hasAny,
      openLabel: "",
      closeLabel: "",
    };
  }

  const primaryParts: string[] = [];
  if (hasRule) primaryParts.push("quy tắc");
  if (hasTranslation) primaryParts.push("bản dịch");
  if (hasExample) primaryParts.push("ví dụ");
  if (hasOptionAnalyses) primaryParts.push("phân tích phương án");

  if (primaryParts.length === 0) {
    return {
      hasRule,
      hasTranslation,
      hasExample,
      hasTip,
      hasOptionAnalyses,
      hasAny,
      openLabel: "Mở mẹo nhận diện",
      closeLabel: "Thu gọn mẹo nhận diện",
    };
  }

  const summary =
    primaryParts.length === 1
      ? primaryParts[0]
      : `${primaryParts.slice(0, -1).join(", ")} và ${
          primaryParts[primaryParts.length - 1]
        }`;

  return {
    hasRule,
    hasTranslation,
    hasExample,
    hasTip,
    hasOptionAnalyses,
    hasAny,
    openLabel: `Mở ${summary}`,
    closeLabel: `Thu gọn ${summary}`,
  };
}

/**
 * Tổng hợp cấu trúc phản hồi sau khi server chấm xong, đảm bảo không lặp lý do đáp án đúng
 * và vẫn giữ phần phân tích các lựa chọn còn lại trong vùng mở rộng.
 */
export function resolvePracticeFeedback(params: {
  isCorrect: boolean;
  selectedIndex: number | null | undefined;
  correctIndex: number;
  explanation: QuestionExplanation;
}): ResolvedPracticeFeedback {
  const { isCorrect, selectedIndex, correctIndex, explanation } = params;
  const selectedLabel = getOptionLabel(selectedIndex);
  const correctLabel = getOptionLabel(correctIndex);
  const whyCorrectText = explanation.why_correct_vi?.trim() || null;

  let inlineSelectedFeedback: InlineSelectedFeedback | null = null;
  let showWhyCorrectInSummary = Boolean(whyCorrectText);

  if (!isCorrect && selectedLabel !== null && typeof selectedIndex === "number") {
    const specificReason = getSelectedOptionSpecificReason(explanation, selectedLabel);

    if (specificReason) {
      inlineSelectedFeedback = {
        optionIndex: selectedIndex,
        optionLabel: selectedLabel,
        kind: "selected_option",
        heading: `Vì sao phương án ${selectedLabel} chưa đúng`,
        body: specificReason,
      };
      showWhyCorrectInSummary = Boolean(
        whyCorrectText && whyCorrectText !== specificReason
      );
    } else if (whyCorrectText) {
      inlineSelectedFeedback = {
        optionIndex: selectedIndex,
        optionLabel: selectedLabel,
        kind: "correct_reason_fallback",
        heading: correctLabel
          ? `Lý do đáp án đúng (${correctLabel})`
          : "Lý do đáp án đúng",
        body: whyCorrectText,
      };
      showWhyCorrectInSummary = false;
    } else {
      showWhyCorrectInSummary = false;
    }
  }

  const remainingOptionAnalyses = getRemainingOptionAnalyses(explanation, {
    excludeOption:
      inlineSelectedFeedback?.kind === "selected_option"
        ? inlineSelectedFeedback.optionLabel
        : null,
    excludeTexts: [
      inlineSelectedFeedback?.body,
      showWhyCorrectInSummary ? whyCorrectText : null,
    ],
  });

  const expandable = getExpandableDetailFlags(explanation, {
    includeTranslation: true,
    hasOptionAnalyses: remainingOptionAnalyses.length > 0,
  });

  return {
    selectedLabel,
    correctLabel,
    inlineSelectedFeedback,
    showWhyCorrectInSummary,
    whyCorrectText,
    remainingOptionAnalyses,
    expandable,
  };
}
