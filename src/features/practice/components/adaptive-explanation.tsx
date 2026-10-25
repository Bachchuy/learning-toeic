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
  // Bất biến §4.3: Sai thì mở toàn bộ; Đúng thì thu gọn, có nút mở
  const [isExpanded, setIsExpanded] = useState(!isCorrect);

  return (
    <div
      aria-live="polite"
      className="w-full bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-4 text-left transition-all"
    >
      {/* 1. Tiêu đề phản hồi */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          {isCorrect ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] font-mono">
              [✓] Chính xác
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3] font-mono">
              [✗] Chưa chính xác
            </span>
          )}
          <span className="text-xs text-[#475569] font-mono">
            {isCorrect ? "Nắm vững quy tắc" : "Xem phân tích lỗi sai"}
          </span>
        </div>

        {/* Nút thu gọn / mở rộng khi làm đúng */}
        {isCorrect && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2563EB] rounded px-1.5 py-0.5"
          >
            {isExpanded ? "▲ Thu gọn" : "▼ Xem giải thích chi tiết"}
          </button>
        )}
      </div>

      {/* 2. Quy tắc cốt lõi (Rule Box - Viền trái 4px #2563EB) */}
      <div className="p-4 bg-[#F8FAFC] border-l-4 border-[#2563EB] rounded-r-lg space-y-1">
        <div className="text-xs font-bold uppercase tracking-wider text-[#2563EB] font-mono">
          Quy tắc ngữ pháp cốt lõi
        </div>
        <p className="text-sm font-medium text-[#0F172A] leading-relaxed">
          {explanation.rule_vi}
        </p>
      </div>

      {/* Nội dung chi tiết (Mở toàn bộ nếu sai, hoặc khi bấm mở rộng nếu đúng) */}
      {isExpanded && (
        <div className="space-y-4 pt-2">
          {/* 3. Vì sao đúng */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#047857] font-mono">
              Vì sao đáp án đúng?
            </h4>
            <p className="text-sm text-[#0F172A] leading-relaxed">
              {explanation.why_correct_vi}
            </p>
          </div>

          {/* 4. Phân tích các phương án bẫy (sai) */}
          {explanation.why_wrong_vi && explanation.why_wrong_vi.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#475569] font-mono">
                Phân tích các phương án gây nhiễu
              </h4>
              <div className="space-y-2">
                {explanation.why_wrong_vi.map((wrong) => (
                  <div
                    key={wrong.option}
                    className="p-3 bg-[#F1F5F9] rounded-lg text-xs leading-relaxed flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded bg-white text-[#BE123C] font-mono font-bold flex items-center justify-center shrink-0 border border-[#E2E8F0]">
                      {wrong.option}
                    </span>
                    <span className="text-[#475569] mt-0.5">
                      {wrong.reason_vi}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Mẹo & Ví dụ */}
          {(explanation.tip_vi || explanation.example_en) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {explanation.tip_vi && (
                <div className="p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-xs">
                  <div className="font-bold text-[#B45309] mb-1 font-mono">
                    💡 Mẹo làm bài nhanh
                  </div>
                  <div className="text-[#92400E] leading-relaxed">
                    {explanation.tip_vi}
                  </div>
                </div>
              )}
              {explanation.example_en && (
                <div className="p-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-xs">
                  <div className="font-bold text-[#2563EB] mb-1 font-mono">
                    📖 Ví dụ điển hình
                  </div>
                  <div className="text-[#1E40AF] italic leading-relaxed">
                    &ldquo;{explanation.example_en}&rdquo;
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6. Từ vựng nổi bật (Word Chips) */}
          {explanation.vocab_hints && explanation.vocab_hints.length > 0 && (
            <div className="pt-2 border-t border-[#E2E8F0]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#475569] mb-2 font-mono">
                Từ vựng then chốt trong câu
              </div>
              <div className="flex flex-wrap gap-2">
                {explanation.vocab_hints.map((hint, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#F1F5F9] text-xs font-medium text-[#0F172A] border border-[#E2E8F0]"
                  >
                    <span className="font-semibold text-[#2563EB]">
                      {hint.word}
                    </span>
                    <span className="text-[#475569]">({hint.meaning_vi})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
