"use client";

import React, { useState } from "react";
import { BookOpen, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import type { QuestionExplanation } from "../types";

interface AdaptiveExplanationProps {
  isCorrect: boolean;
  explanation: QuestionExplanation;
  onExpandClick?: () => void;
  /** Nếu true, cho phép người dùng mở quy tắc & mẹo; mặc định luôn thu gọn để giữ giao diện thoáng */
  initiallyExpanded?: boolean;
}

export function AdaptiveExplanation({
  isCorrect,
  explanation,
  onExpandClick,
  initiallyExpanded = false,
}: AdaptiveExplanationProps) {
  // Mặc định luôn thu gọn phần mẹo & quy tắc nâng cao để tránh chiếm dụng màn hình
  const [showAdvancedRules, setShowAdvancedRules] = useState(initiallyExpanded);

  const handleToggleAdvanced = () => {
    const nextState = !showAdvancedRules;
    setShowAdvancedRules(nextState);
    if (nextState && onExpandClick) {
      onExpandClick();
    }
  };

  return (
    <div className="w-full space-y-3 text-left" aria-live="polite">
      {/* 1. Khối Giải thích trọng tâm & Dịch nghĩa (Gọn gàng, dễ đọc, không lấn át câu hỏi) */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#F0F7FF] border border-[#BFDBFE] text-[#0F172A] space-y-3">
        {explanation.why_correct_vi && (
          <div className="text-[14px] sm:text-[15px] leading-relaxed text-[#1E293B]">
            <span className="font-bold text-[#1E40AF]">
              {isCorrect ? "Điểm cốt lõi giúp chọn đúng: " : "Điểm mấu chốt cần lưu ý: "}
            </span>
            <span>{explanation.why_correct_vi}</span>
          </div>
        )}

        {explanation.full_translation_vi && (
          <div className="text-[13px] sm:text-[14px] text-[#334155] border-t border-[#DBEAFE] pt-2.5 leading-relaxed">
            <span className="font-semibold text-[#1E40AF]">Dịch toàn câu: </span>
            <span className="italic">&ldquo;{explanation.full_translation_vi}&rdquo;</span>
          </div>
        )}

        {/* Nút chủ động xem thêm Quy tắc & Mẹo (Chỉ mở khi người dùng muốn đào sâu) */}
        {(explanation.rule_vi || explanation.tip_vi || explanation.example_en) && (
          <div className="pt-1 border-t border-[#DBEAFE]/60">
            <button
              type="button"
              onClick={handleToggleAdvanced}
              className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer transition-colors"
            >
              {showAdvancedRules ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Thu gọn quy tắc & mẹo nhận diện</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>Xem thêm quy tắc cốt lõi & mẹo làm bài</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 2. Phần mở rộng nâng cao: Chỉ hiển thị khi người dùng chủ động bấm xem */}
      {showAdvancedRules && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Hộp Quy tắc ngữ pháp */}
          {explanation.rule_vi && (
            <div className="p-3.5 sm:p-4 bg-white border border-[#E2E8F0] rounded-xl flex items-start gap-3 shadow-xs">
              <div className="p-1.5 rounded-lg bg-[#EFF6FF] text-[#2563EB] shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB] font-mono">
                  Quy tắc cốt lõi
                </div>
                <div className="text-[13px] sm:text-[14px] font-medium text-[#0F172A] leading-relaxed">
                  {explanation.rule_vi}
                </div>
              </div>
            </div>
          )}

          {/* Mẹo nhận diện & Ví dụ minh họa */}
          {(explanation.tip_vi || explanation.example_en) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {explanation.tip_vi && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-2.5">
                  <div className="p-1 rounded-md bg-[#FEF3C7] text-[#B45309] shrink-0 mt-0.5">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="font-bold text-[#B45309] text-[11px] font-mono uppercase tracking-wider">
                      Mẹo nhận diện nhanh
                    </div>
                    <div className="text-[12px] sm:text-[13px] text-[#92400E] leading-relaxed">
                      {explanation.tip_vi}
                    </div>
                  </div>
                </div>
              )}

              {explanation.example_en && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 flex-1">
                  <div className="font-bold text-[#475569] font-mono text-[11px] uppercase tracking-wider">
                    Ví dụ minh họa
                  </div>
                  <div className="text-[12px] sm:text-[13px] text-[#0F172A] italic leading-relaxed">
                    &ldquo;{explanation.example_en}&rdquo;
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
