"use client";

import React, { useId, useState } from "react";
import {
  BookOpen,
  Lightbulb,
  Languages,
  Quote,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  getExpandableDetailFlags,
  type OptionAnalysisDetail,
  type OptionLabel,
} from "@/core/practiceFeedback";
import type { QuestionExplanation } from "../types";

interface AdaptiveExplanationProps {
  isCorrect: boolean;
  explanation: QuestionExplanation;
  onExpandClick?: () => void;
  /** Nếu true, mặc định mở sẵn phần chi tiết; mặc định thu gọn để giữ màn hình thoáng */
  initiallyExpanded?: boolean;
  /** Ẩn lý do đáp án đúng khi đã được hiển thị làm phương án dự phòng ngay dưới lựa chọn sai */
  showWhyCorrect?: boolean;
  correctOptionLabel?: OptionLabel;
  /** Chỉ thu gọn bản dịch trong phiên luyện Part 5; các màn dùng chung (Drill, Kết quả) giữ bản dịch hiển thị ngay */
  collapseTranslation?: boolean;
  /** Danh sách phân tích các phương án còn lại khi mở chi tiết */
  remainingOptionAnalyses?: OptionAnalysisDetail[];
  /** Văn bản của từng phương án A–D để hiển thị ngữ cảnh kèm phân tích */
  optionTexts?: Partial<Record<OptionLabel, string>>;
}

export function AdaptiveExplanation({
  isCorrect,
  explanation,
  onExpandClick,
  initiallyExpanded = false,
  showWhyCorrect = true,
  correctOptionLabel,
  collapseTranslation = false,
  remainingOptionAnalyses = [],
  optionTexts,
}: AdaptiveExplanationProps) {
  const detailsId = useId();
  const [showDetails, setShowDetails] = useState(initiallyExpanded);

  const whyCorrectText = showWhyCorrect
    ? explanation.why_correct_vi?.trim() || ""
    : "";
  const rawTranslation = explanation.full_translation_vi?.trim() || "";
  const visibleTranslation = !collapseTranslation ? rawTranslation : "";
  const expandable = getExpandableDetailFlags(explanation, {
    includeTranslation: collapseTranslation,
    hasOptionAnalyses: remainingOptionAnalyses.length > 0,
  });

  if (!whyCorrectText && !visibleTranslation && !expandable.hasAny) {
    return null;
  }

  const handleToggleDetails = () => {
    const nextState = !showDetails;
    setShowDetails(nextState);
    if (nextState && onExpandClick) {
      onExpandClick();
    }
  };

  const whyCorrectHeading = isCorrect
    ? correctOptionLabel
      ? `Lý do đáp án đúng (${correctOptionLabel})`
      : "Điểm cốt lõi giúp chọn đúng"
    : correctOptionLabel
      ? `Lý do đáp án đúng (${correctOptionLabel})`
      : "Lý do đáp án đúng";

  return (
    <div className="w-full space-y-3 text-left" aria-live="polite">
      {/* 1. Khối Giải thích trọng tâm & Nút mở rộng quy tắc, bản dịch, ví dụ */}
      <div className="p-4 sm:p-5 rounded-[10px] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] border-l-4 border-l-[var(--color-primary-default)] text-[var(--color-text-primary)] space-y-3">
        {whyCorrectText && (
          <div className="space-y-1">
            <div
              className={`text-[11px] font-mono font-bold uppercase tracking-[0.06em] ${
                isCorrect
                  ? "text-[var(--status-success-text)]"
                  : "text-[var(--color-primary-default)]"
              }`}
            >
              {whyCorrectHeading}
            </div>
            <p className="text-[14px] sm:text-[15px] leading-[1.6] text-[var(--color-text-primary)] break-words">
              {whyCorrectText}
            </p>
          </div>
        )}

        {visibleTranslation && (
          <div
            data-testid="visible-translation"
            className={
              whyCorrectText
                ? "pt-3 border-t border-[var(--color-border-default)] space-y-1"
                : "space-y-1"
            }
          >
            <div className="text-[11px] font-mono font-bold uppercase tracking-[0.06em] text-[var(--color-text-secondary)]">
              Dịch toàn câu
            </div>
            <p className="text-[13px] sm:text-[14px] text-[var(--color-text-primary)] italic leading-relaxed break-words">
              &ldquo;{visibleTranslation}&rdquo;
            </p>
          </div>
        )}

        {expandable.hasAny && (
          <div
            className={
              whyCorrectText || visibleTranslation
                ? "pt-3 border-t border-[var(--color-border-default)]"
                : undefined
            }
          >
            <button
              type="button"
              data-testid="explanation-details-toggle"
              aria-expanded={showDetails}
              aria-controls={detailsId}
              onClick={handleToggleDetails}
              className="w-full min-h-[44px] flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left text-[13px] sm:text-sm font-semibold text-[var(--color-primary-default)] bg-[var(--color-primary-subtle)] border border-[var(--color-border-default)] hover:border-[var(--color-primary-default)] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-primary-default)] focus-visible:outline-offset-2"
            >
              <span>
                {showDetails ? expandable.closeLabel : expandable.openLabel}
              </span>
              {showDetails ? (
                <ChevronUp className="w-4 h-4 shrink-0" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-4 h-4 shrink-0" aria-hidden="true" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* 2. Phần mở rộng: Quy tắc, Bản dịch, Ví dụ và Mẹo (chỉ hiện khi có dữ liệu và người dùng mở) */}
      {showDetails && expandable.hasAny && (
        <div
          id={detailsId}
          data-testid="explanation-details-panel"
          className="space-y-3"
        >
          {expandable.hasRule && (
            <div className="p-3.5 sm:p-4 bg-[var(--color-bg-muted)] border border-[var(--color-border-default)] rounded-lg flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-[var(--color-primary-subtle)] text-[var(--color-primary-default)] shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--color-primary-default)] font-mono">
                  Quy tắc
                </div>
                <div className="text-[13px] sm:text-[14px] font-medium text-[var(--color-text-primary)] leading-relaxed break-words">
                  {explanation.rule_vi.trim()}
                </div>
              </div>
            </div>
          )}

          {expandable.hasTranslation && (
            <div className="p-3.5 sm:p-4 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-lg flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] shrink-0 mt-0.5">
                <Languages className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] font-mono">
                  Bản dịch
                </div>
                <div className="text-[13px] sm:text-[14px] text-[var(--color-text-primary)] leading-relaxed break-words">
                  {explanation.full_translation_vi?.trim()}
                </div>
              </div>
            </div>
          )}

          {expandable.hasExample && (
            <div className="p-3.5 sm:p-4 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-lg flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] shrink-0 mt-0.5">
                <Quote className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] font-mono">
                  Ví dụ
                </div>
                <div className="text-[13px] sm:text-[14px] text-[var(--color-text-primary)] italic leading-relaxed break-words">
                  &ldquo;{explanation.example_en?.trim()}&rdquo;
                </div>
              </div>
            </div>
          )}

          {expandable.hasOptionAnalyses && remainingOptionAnalyses.length > 0 && (
            <div
              data-testid="remaining-options-analysis"
              className="p-3.5 sm:p-4 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-lg space-y-3"
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] font-mono">
                {isCorrect ? "Phân tích các phương án" : "Phân tích các phương án còn lại"}
              </div>
              <ul className="space-y-2.5">
                {remainingOptionAnalyses.map((item) => {
                  const isCorrectOption = item.option === correctOptionLabel;
                  const optionWord = optionTexts?.[item.option];

                  return (
                    <li
                      key={item.option}
                      data-analysis-option={item.option}
                      className="flex items-start gap-2.5 text-[13px] sm:text-[14px] leading-relaxed"
                    >
                      <span
                        className={`w-6 h-6 rounded-[6px] flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 ${
                          isCorrectOption
                            ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)] border border-[var(--status-success-text)]"
                            : "bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border-default)]"
                        }`}
                      >
                        {item.option}
                      </span>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        {(optionWord || isCorrectOption) && (
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            {optionWord && (
                              <span className="font-semibold text-[var(--color-text-primary)] break-words">
                                {optionWord}
                              </span>
                            )}
                            {isCorrectOption && (
                              <span className="text-[11px] font-mono font-bold text-[var(--status-success-text)]">
                                (Đáp án đúng)
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-[var(--color-text-primary)] break-words">
                          {item.reason}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {expandable.hasTip && (
            <div className="p-3.5 sm:p-4 bg-[var(--status-warning-bg)] border border-[var(--color-border-default)] border-l-4 border-l-[var(--status-warning-text)] rounded-lg flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--status-warning-text)] shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--status-warning-text)] font-mono">
                  Mẹo nhận diện
                </div>
                <div className="text-[13px] sm:text-[14px] text-[var(--color-text-primary)] leading-relaxed break-words">
                  {explanation.tip_vi?.trim()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
