"use client";

import { useState } from "react";
import type { QuestionExplanation } from "../types";

interface AdaptiveExplanationProps {
  isCorrect: boolean;
  explanation: QuestionExplanation;
}

export function AdaptiveExplanation({
  isCorrect,
  explanation,
}: AdaptiveExplanationProps) {
  const [isExpanded, setIsExpanded] = useState(!isCorrect);

  return (
    <div
      aria-live="polite"
      className="w-full bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 shadow-sm space-y-5 text-left transition-all"
    >
      {/* 1. Header trạng thái */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          {isCorrect ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] font-mono">
              [✓] Chính xác
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3] font-mono">
              [✗] Cần ôn lại kiến thức này
            </span>
          )}
          <span className="text-sm text-[#475569]">
            {isCorrect ? "Bạn đã chọn đúng phương án" : "Xem phân tích chi tiết bên dưới"}
          </span>
        </div>

        {/* Nút thu gọn / mở rộng khi làm đúng */}
        {isCorrect && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2563EB] rounded px-2 py-1 bg-[#EFF6FF]"
          >
            {isExpanded ? "▲ Thu gọn" : "▼ Mở rộng phân tích"}
          </button>
        )}
      </div>

      {/* 2. Quy tắc cốt lõi (Rule Box - Viền trái 4px #2563EB, chữ to 15-16px dễ đọc) */}
      <div className="p-4 bg-[#F8FAFC] border-l-4 border-[#2563EB] rounded-r-lg space-y-1.5">
        <div className="text-xs font-bold uppercase tracking-wider text-[#2563EB] font-mono">
          Quy tắc ngữ pháp trọng tâm
        </div>
        <p className="text-[15px] sm:text-[16px] font-medium text-[#0F172A] leading-relaxed">
          {explanation.rule_vi}
        </p>
      </div>

      {/* Nội dung chi tiết */}
      {isExpanded && (
        <div className="space-y-4 pt-1">
          {/* Mẹo làm bài nhanh & Ví dụ */}
          {(explanation.tip_vi || explanation.example_en) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {explanation.tip_vi && (
                <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] space-y-1.5">
                  <div className="font-bold text-[#B45309] text-xs font-mono uppercase tracking-wider">
                    💡 Mẹo nhận diện nhanh
                  </div>
                  <div className="text-sm text-[#92400E] leading-relaxed">
                    {explanation.tip_vi}
                  </div>
                </div>
              )}
              {explanation.example_en && (
                <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-1.5">
                  <div className="font-bold text-[#2563EB] text-xs font-mono uppercase tracking-wider">
                    📖 Câu ví dụ thực tế
                  </div>
                  <div className="text-sm text-[#1E40AF] italic leading-relaxed">
                    &ldquo;{explanation.example_en}&rdquo;
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Từ vựng nổi bật (Word Chips) */}
          {explanation.vocab_hints && explanation.vocab_hints.length > 0 && (
            <div className="pt-3 border-t border-[#E2E8F0]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#475569] mb-2.5 font-mono">
                Từ vựng then chốt trong câu (Bấm để ghi nhớ)
              </div>
              <div className="flex flex-wrap gap-2">
                {explanation.vocab_hints.map((hint, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F8FAFC] text-sm text-[#0F172A] border border-[#E2E8F0] shadow-2xs"
                  >
                    <span className="font-semibold text-[#2563EB] font-mono">
                      {hint.word}
                    </span>
                    <span className="text-[#475569] text-xs">
                      {hint.meaning_vi}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
