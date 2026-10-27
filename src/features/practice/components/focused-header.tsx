"use client";

import { useState } from "react";
import Link from "next/link";

interface FocusedHeaderProps {
  currentIndex: number;
  totalQuestions: number;
  isAnswered?: boolean;
}

export function FocusedHeader({
  currentIndex,
  totalQuestions,
  isAnswered = false,
}: FocusedHeaderProps) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const currentDisplayNumber = currentIndex + 1;
  // Thanh tiến độ tính theo số câu đã nộp đáp án để không bị 10% khi chưa trả lời câu nào
  const completedQuestions = isAnswered ? currentIndex + 1 : currentIndex;
  const progressPercent = Math.min(
    100,
    Math.round((completedQuestions / totalQuestions) * 100)
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-[52px] bg-white border-b border-[#E2E8F0] z-30 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto h-full flex items-center justify-between">
          {/* Nút Thoát — vùng chạm tối thiểu 44px chuẩn a11y */}
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F172A] px-3 min-h-[44px] rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2563EB]"
          >
            <span className="font-bold text-sm">✕</span>
            <span>Thoát</span>
          </button>

          {/* Vị trí câu hỏi (Mono font) */}
          <div className="font-mono text-xs font-bold text-[#0F172A]">
            Câu {currentDisplayNumber} / {totalQuestions}
          </div>

          {/* Phần trăm hoàn thành */}
          <div className="font-mono text-xs text-[#475569]">
            {progressPercent}%
          </div>
        </div>

        {/* Thanh tiến độ liên tục 8px (D-18 & §5.5) */}
        <div
          role="progressbar"
          aria-label="Tiến độ bài làm"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#F1F5F9]"
        >
          <div
            className="h-full bg-[#2563EB] transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Hộp thoại xác nhận thoát phiên (D-30 & screens.md M4) */}
      {showExitConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        >
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 max-w-sm w-full shadow-xl space-y-4 text-center">
            <div className="w-10 h-10 rounded-full bg-[#FFFBEB] text-[#B45309] font-bold text-lg flex items-center justify-center mx-auto border border-[#FDE68A]">
              !
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">
              Bạn muốn rời phiên làm bài?
            </h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Các câu hỏi bạn đã nộp đáp án sẽ được lưu trữ an toàn trong lịch sử học tập.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="w-full h-11 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold cursor-pointer"
              >
                Ở lại làm tiếp
              </button>
              <Link
                href="/"
                className="w-full h-10 rounded-lg flex items-center justify-center text-xs font-medium text-[#475569] hover:bg-[#F1F5F9] transition-colors"
              >
                Xác nhận thoát
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
