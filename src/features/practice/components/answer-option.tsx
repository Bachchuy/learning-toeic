import React from "react";

export type OptionState =
  | "default"
  | "selected"
  | "correct"
  | "incorrect"
  | "unselected_disabled";

interface AnswerOptionProps {
  label: "A" | "B" | "C" | "D";
  text: string;
  state: OptionState;
  disabled?: boolean;
  onClick: () => void;
}

export function AnswerOption({
  label,
  text,
  state,
  disabled = false,
  onClick,
}: AnswerOptionProps) {
  // Styles theo chuẩn §5.5 (cao tối thiểu 52px, radius 8, keycap 28x28)
  const stateClasses = {
    default:
      "bg-white border-[#E2E8F0] hover:border-[#8190A6] hover:bg-[#F8FAFC] text-[#0F172A]",
    selected:
      "bg-[#EFF6FF] border-[#2563EB] text-[#0F172A] ring-1 ring-[#2563EB]",
    correct:
      "bg-[#ECFDF5] border-[#047857] text-[#047857] font-medium",
    incorrect:
      "bg-[#FFF1F2] border-[#BE123C] text-[#BE123C] font-medium",
    unselected_disabled:
      "bg-white border-[#E2E8F0] text-[#475569] opacity-50 cursor-not-allowed",
  }[state];

  const keycapClasses = {
    default: "bg-[#F1F5F9] text-[#0F172A]",
    selected: "bg-[#2563EB] text-white font-bold",
    correct: "bg-[#047857] text-white font-bold",
    incorrect: "bg-[#BE123C] text-white font-bold",
    unselected_disabled: "bg-[#F1F5F9] text-[#475569]",
  }[state];

  const statusIcon = {
    default: null,
    selected: null,
    correct: <span className="text-sm font-bold text-[#047857]">✓</span>,
    incorrect: <span className="text-sm font-bold text-[#BE123C]">✗</span>,
    unselected_disabled: null,
  }[state];

  return (
    <button
      type="button"
      role="radio"
      aria-checked={state === "selected"}
      disabled={disabled}
      onClick={onClick}
      className={`w-full min-h-[52px] p-3 rounded-lg border-2 flex items-center justify-between text-left transition-all cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2 ${stateClasses}`}
    >
      <div className="flex items-center gap-3">
        {/* Keycap 28x28px */}
        <div
          className={`w-7 h-7 rounded-md flex items-center justify-center font-mono text-xs font-semibold select-none shrink-0 ${keycapClasses}`}
        >
          {label}
        </div>
        <span className="text-[15px] sm:text-[16px] leading-relaxed">
          {text}
        </span>
      </div>

      {statusIcon && <div className="ml-2 shrink-0">{statusIcon}</div>}
    </button>
  );
}
