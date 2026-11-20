import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export type OptionState =
  | "default"
  | "selected"
  | "correct"
  | "incorrect"
  | "unselected_disabled";

interface AnswerOptionProps {
  label: "A" | "B" | "C" | "D";
  text: string;
  translation?: string;
  state: OptionState;
  badgeText?: string;
  isSelected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function AnswerOption({
  label,
  text,
  translation,
  state,
  badgeText,
  isSelected,
  disabled = false,
  onClick,
}: AnswerOptionProps) {
  // Token-aligned state styles — tất cả màu từ design-direction.md §5.2
  const containerClasses = {
    default:
      "bg-[var(--color-bg-surface)] border-[var(--color-border-default)] hover:border-[var(--color-border-input)] hover:bg-[var(--color-bg-page)] text-[var(--color-text-primary)]",
    selected:
      "bg-[var(--color-primary-subtle)] border-[var(--color-primary-default)] text-[var(--color-text-primary)] ring-1 ring-[var(--color-primary-default)]",
    correct:
      "bg-[var(--status-success-bg)] border-[var(--status-success-text)] text-[var(--status-success-text)]",
    incorrect:
      "bg-[var(--status-error-bg)] border-[var(--status-error-text)] text-[var(--status-error-text)]",
    unselected_disabled:
      "bg-[var(--color-bg-surface)] border-[var(--color-border-default)] text-[var(--color-text-primary)] cursor-default",
  }[state];

  // Keycap (A/B/C/D) — 28×28px, radius 6px, font mono (§5.5)
  const keycapClasses = {
    default:
      "bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border-default)]",
    selected:
      "bg-[var(--color-primary-default)] text-white border border-[var(--color-primary-default)] font-bold",
    correct:
      "bg-[var(--status-success-text)] text-white border border-[var(--status-success-text)] font-bold",
    incorrect:
      "bg-[var(--status-error-text)] text-white border border-[var(--status-error-text)] font-bold",
    unselected_disabled:
      "bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border-default)] opacity-70",
  }[state];

  const translationColor = {
    default: "text-[var(--color-text-secondary)]",
    selected: "text-[var(--color-primary-default)]",
    correct: "text-[var(--status-success-text)]",
    incorrect: "text-[var(--status-error-text)]",
    unselected_disabled: "text-[var(--color-text-secondary)]",
  }[state];

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected ?? state === "selected"}
      disabled={disabled}
      onClick={onClick}
      className={`w-full min-h-[52px] px-4 py-3 rounded-lg border flex items-start gap-3 text-left transition-colors duration-150 ease-out select-none focus-visible:outline-2 focus-visible:outline-[var(--color-primary-default)] focus-visible:outline-offset-2 ${
        disabled ? "cursor-default" : "cursor-pointer active:scale-[0.99]"
      } ${containerClasses}`}
    >
      {/* Keycap A/B/C/D — 28×28px radius-6px mono (§5.5) */}
      <div
        className={`w-7 h-7 rounded-[6px] flex items-center justify-center font-mono text-xs font-semibold select-none shrink-0 mt-0.5 ${keycapClasses}`}
      >
        {label}
      </div>

      {/* Nội dung + nhãn trạng thái + dịch nghĩa (tùy chọn cho Drill/Result) */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
          <span className="text-[15px] sm:text-[16px] font-medium leading-snug break-words min-w-0">
            {text}
          </span>

          {badgeText && (state === "correct" || state === "incorrect") ? (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[11px] sm:text-xs font-mono font-bold tracking-wide shrink-0 whitespace-nowrap text-white ${
                state === "correct"
                  ? "bg-[var(--status-success-text)]"
                  : "bg-[var(--status-error-text)]"
              }`}
            >
              {state === "correct" ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              )}
              <span>{badgeText}</span>
            </span>
          ) : (
            (state === "correct" || state === "incorrect") && (
              <span className="shrink-0">
                {state === "correct" ? (
                  <CheckCircle2
                    className="w-5 h-5 text-[var(--status-success-text)]"
                    aria-hidden="true"
                  />
                ) : (
                  <XCircle
                    className="w-5 h-5 text-[var(--status-error-text)]"
                    aria-hidden="true"
                  />
                )}
              </span>
            )
          )}
        </div>

        {translation && (
          <div className={`text-[13px] leading-relaxed break-words ${translationColor}`}>
            {translation}
          </div>
        )}
      </div>
    </button>
  );
}
