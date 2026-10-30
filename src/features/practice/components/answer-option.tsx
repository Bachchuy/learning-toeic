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
  disabled?: boolean;
  onClick?: () => void;
}

export function AnswerOption({
  label,
  text,
  translation,
  state,
  disabled = false,
  onClick,
}: AnswerOptionProps) {
  // Token-aligned state styles — tất cả màu từ design-direction.md §5.2
  const containerClasses = {
    default:
      "bg-[var(--color-bg-surface)] border-[var(--color-border-default)] hover:border-[#94A3B8] hover:bg-[var(--color-bg-page)] text-[var(--color-text-primary)]",
    selected:
      "bg-[var(--color-primary-subtle)] border-[var(--color-primary-default)] text-[var(--color-text-primary)] ring-1 ring-[var(--color-primary-default)]",
    correct:
      "bg-[var(--status-success-bg)] border-[var(--status-success-text)] text-[var(--status-success-text)]",
    incorrect:
      "bg-[var(--status-error-bg)] border-[var(--status-error-text)] text-[var(--status-error-text)]",
    unselected_disabled:
      "bg-[var(--color-bg-surface)] border-[var(--color-border-default)] text-[var(--color-text-primary)] cursor-not-allowed",
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
      aria-checked={state === "selected"}
      disabled={disabled}
      onClick={onClick}
      className={`w-full min-h-[52px] px-4 py-3 rounded-lg border flex items-start sm:items-center justify-between text-left transition-all active:scale-[0.99] duration-150 ease-out cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[var(--color-primary-default)] focus-visible:outline-offset-2 ${containerClasses}`}
    >
      <div className="flex items-start sm:items-center gap-3 flex-1 pr-2">
        {/* Keycap A/B/C/D — 28×28px radius-6px mono (§5.5) */}
        <div
          className={`w-7 h-7 rounded-[6px] flex items-center justify-center font-mono text-xs font-semibold select-none shrink-0 mt-0.5 sm:mt-0 ${keycapClasses}`}
        >
          {label}
        </div>

        {/* Nội dung + dịch nghĩa */}
        <div className="flex flex-col gap-0.5 flex-1">
          <div className="text-[15px] sm:text-[16px] font-medium leading-snug">
            {text}
          </div>
          {translation && (
            <div
              className={`text-[13px] leading-relaxed ${translationColor}`}
            >
              {translation}
            </div>
          )}
        </div>
      </div>

      {/* Status icon — Lucide icon chuẩn thiết kế */}
      <div className="shrink-0 mt-1 sm:mt-0 ml-2">
        {state === "correct" && (
          <CheckCircle2
            className="w-5 h-5 text-[var(--status-success-text)]"
            aria-hidden="true"
          />
        )}
        {state === "incorrect" && (
          <XCircle
            className="w-5 h-5 text-[var(--status-error-text)]"
            aria-hidden="true"
          />
        )}
      </div>
    </button>
  );
}
