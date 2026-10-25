"use client";

import React, { useState, useEffect } from "react";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";
import { reportQuestionAction, type ReportReason } from "../actions";

interface QuestionReportModalProps {
  isOpen: boolean;
  questionId: string;
  onClose: () => void;
}

const REPORT_REASONS: Array<{ id: ReportReason; label: string; desc: string }> = [
  {
    id: "multiple_correct",
    label: "Nhiều hơn một đáp án đúng",
    desc: "Có ít nhất hai phương án đều đúng ngữ pháp hoặc ngữ cảnh.",
  },
  {
    id: "none_correct",
    label: "Không có đáp án nào đúng",
    desc: "Cả 4 lựa chọn A, B, C, D đều không thỏa mãn cấu trúc câu.",
  },
  {
    id: "typo",
    label: "Lỗi chính tả hoặc gõ sai",
    desc: "Có từ ngữ bị viết sai ký tự, lỗi dấu chấm câu, lỗi định dạng.",
  },
  {
    id: "unclear",
    label: "Đề bài hoặc ngữ cảnh mơ hồ",
    desc: "Câu hỏi thiếu ngữ cảnh cần thiết để chọn được một đáp án duy nhất.",
  },
  {
    id: "other",
    label: "Lý do khác",
    desc: "Vấn đề học thuật khác cần đội ngũ biên tập xem xét.",
  },
];

export function QuestionReportModal({
  isOpen,
  questionId,
  onClose,
}: QuestionReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason>("multiple_correct");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Đóng modal bằng phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMessage(null);

    const res = await reportQuestionAction(questionId, selectedReason, notes);

    if (res.success) {
      setFeedbackMessage({ type: "success", text: res.message });
      // Tự đóng sau 1.5s
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setFeedbackMessage({ type: "error", text: res.message });
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0F172A]/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      {/* Container: Bottom Sheet trên mobile (360px), Dialog căn giữa trên desktop */}
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#FEF2F2] text-[#DC2626]">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="report-modal-title"
                className="text-base sm:text-lg font-bold text-[#0F172A]"
              >
                Báo lỗi câu hỏi
              </h3>
              <p className="text-xs text-[#64748B]">
                Phản hồi của bạn giúp hoàn thiện chất lượng đề thi.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] rounded-lg transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Thông báo kết quả nếu có */}
          {feedbackMessage && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-sm ${
                feedbackMessage.type === "success"
                  ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#047857]"
                  : "bg-[#FFF1F2] border-[#FECDD3] text-[#BE123C]"
              }`}
            >
              {feedbackMessage.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              )}
              <span className="font-medium">{feedbackMessage.text}</span>
            </div>
          )}

          {/* Danh sách 5 lý do chuẩn mực */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#475569] font-mono">
              Chọn lý do báo lỗi:
            </label>
            <div className="space-y-2" role="radiogroup">
              {REPORT_REASONS.map((reason) => {
                const isSelected = selectedReason === reason.id;
                return (
                  <label
                    key={reason.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#EFF6FF] border-[#2563EB] ring-1 ring-[#2563EB]"
                        : "bg-white border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#CBD5E1]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="report_reason"
                      value={reason.id}
                      checked={isSelected}
                      onChange={() => setSelectedReason(reason.id)}
                      className="mt-1 w-4 h-4 text-[#2563EB] border-[#8190A6] focus:ring-[#2563EB]"
                    />
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-semibold text-[#0F172A]">
                        {reason.label}
                      </span>
                      <span className="text-xs text-[#64748B] mt-0.5">
                        {reason.desc}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Ô nhập ghi chú chi tiết khi chọn 'other' hoặc bổ sung */}
          <div className="space-y-1.5 pt-1">
            <label
              htmlFor="report_notes"
              className="text-xs font-bold text-[#475569] flex justify-between"
            >
              <span>Ghi chú thêm (tùy chọn):</span>
              <span className="font-mono text-[11px] text-[#94A3B8]">
                {notes.length}/200
              </span>
            </label>
            <textarea
              id="report_notes"
              rows={3}
              maxLength={200}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Mô tả cụ thể chỗ sai hoặc đề xuất sửa đổi..."
              className="w-full p-3 rounded-xl border border-[#8190A6] text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB] focus:outline-hidden resize-none"
            />
          </div>

          {/* Footer nút hành động */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg border border-[#8190A6] text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
