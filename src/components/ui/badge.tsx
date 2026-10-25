import React from "react";

export type BadgeVariant =
  | "mastered" // [✓] Vững (≥75%)
  | "proficient" // [~] Khá (50-74%)
  | "needs_review" // [!] Cần ôn (<50%)
  | "insufficient" // [?] Chưa đủ dữ liệu (<5 câu)
  | "info" // Băng rôn Drill
  | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  showIcon?: boolean;
}

export function Badge({
  variant = "neutral",
  showIcon = true,
  children,
  className = "",
  ...props
}: BadgeProps) {
  // WCAG rule: 3 lớp nhận diện: Ký hiệu + Chữ + Màu sắc
  const config = {
    mastered: {
      icon: "✓",
      label: "Vững",
      classes: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]",
    },
    proficient: {
      icon: "~",
      label: "Khá",
      classes: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]",
    },
    needs_review: {
      icon: "!",
      label: "Cần ôn",
      classes: "bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]",
    },
    insufficient: {
      icon: "?",
      label: "Chưa đủ dữ liệu",
      classes: "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]",
    },
    info: {
      icon: "ℹ",
      label: "Thông tin",
      classes: "bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]",
    },
    neutral: {
      icon: "•",
      label: "",
      classes: "bg-[#F1F5F9] text-[#0F172A] border-[#E2E8F0]",
    },
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border font-mono ${config.classes} ${className}`}
      {...props}
    >
      {showIcon && <span className="font-bold select-none">{config.icon}</span>}
      <span>{children || config.label}</span>
    </span>
  );
}
