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
  explanationReason?: string;
  isCorrectOption?: boolean;
  onClick: () => void;
}

export function AnswerOption({
  label,
  text,
  state,
  disabled = false,
  explanationReason,
  isCorrectOption = false,
  onClick,
}: AnswerOptionProps) {
  // Styles theo chuẩn Swiss Grid (min-height 52px, radius 8px, viền 2px rõ nét)
  const stateBorderClasses = {
    default:
      "bg-white border-[#E2E8F0] hover:border-[#8190A6] hover:bg-[#F8FAFC] text-[#0F172A]",
    selected:
      "bg-[#EFF6FF] border-[#2563EB] text-[#0F172A] shadow-xs",
    correct:
      "bg-[#ECFDF5] border-[#047857] text-[#047857]",
    incorrect:
      "bg-[#FFF1F2] border-[#BE123C] text-[#BE123C]",
    unselected_disabled:
      "bg-white border-[#E2E8F0] text-[#475569] opacity-75 cursor-not-allowed",
  }[state];

  const keycapClasses = {
    default: "bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0]",
    selected: "bg-[#2563EB] text-white font-bold border border-[#2563EB]",
    correct: "bg-[#047857] text-white font-bold border border-[#047857]",
    incorrect: "bg-[#BE123C] text-white font-bold border border-[#BE123C]",
    unselected_disabled: "bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]",
  }[state];

  const statusBadge = {
    default: null,
    selected: (
      <span className="text-xs font-mono text-[#2563EB] font-semibold bg-[#DBEAFE] px-2 py-0.5 rounded">
        Đang chọn
      </span>
    ),
    correct: (
      <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#047857] bg-[#D1FAE5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
        [✓] Đáp án đúng
      </span>
    ),
    incorrect: (
      <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#BE123C] bg-[#FFE4E6] px-2.5 py-0.5 rounded-full border border-[#FECDD3]">
        [✗] Lựa chọn của bạn
      </span>
    ),
    unselected_disabled: null,
  }[state];

  return (
    <div className="w-full space-y-1.5">
      <button
        type="button"
        role="radio"
        aria-checked={state === "selected"}
        disabled={disabled}
        onClick={onClick}
        className={`w-full min-h-[54px] p-3.5 rounded-xl border-2 flex items-center justify-between text-left transition-all cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2 ${stateBorderClasses}`}
      >
        <div className="flex items-center gap-3.5">
          {/* Keycap 28x28px */}
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-sm font-bold select-none shrink-0 ${keycapClasses}`}
          >
            {label}
          </div>
          <span className="text-[16px] font-medium leading-normal">
            {text}
          </span>
        </div>

        {statusBadge && <div className="ml-2 shrink-0">{statusBadge}</div>}
      </button>

      {/* Lời giải thích tương ứng hiện ngay dưới phương án (UX theo phản hồi của Intern) */}
      {explanationReason && (
        <div
          className={`ml-11 mr-1 p-3 rounded-lg text-sm leading-relaxed border ${
            isCorrectOption
              ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#14532D]"
              : state === "incorrect"
              ? "bg-[#FFF1F2] border-[#FECDD3] text-[#9F1239]"
              : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]"
          }`}
        >
          <div className="flex items-start gap-2">
            <span className="font-bold font-mono text-xs mt-0.5 shrink-0">
              {isCorrectOption ? "[✓ Vì sao đúng]:" : "[Phân tích]:"}
            </span>
            <span className="text-[14px]">{explanationReason}</span>
          </div>
        </div>
      )}
    </div>
  );
}
