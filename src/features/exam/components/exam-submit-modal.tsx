"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ExamSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  answeredCount: number;
  totalQuestions: number;
  formattedTimeLeft: string;
}

export function ExamSubmitModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  answeredCount,
  totalQuestions,
  formattedTimeLeft,
}: ExamSubmitModalProps) {
  if (!isOpen) return null;

  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <Card className="w-full max-w-md p-6 bg-white border border-[#E2E8F0] shadow-xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-full bg-[#EFF6FF] text-[#2563EB] shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0F172A]">Xác nhận nộp bài thi?</h3>
            <p className="text-xs text-[#475569] mt-1">
              Hệ thống sẽ chấm điểm {totalQuestions} câu theo thang điểm chuẩn ETS TOEIC 5–495 điểm.
            </p>
          </div>
        </div>

        <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
          <div className="flex justify-between text-[#475569]">
            <span>Số câu đã làm:</span>
            <strong className="text-[#047857]">{answeredCount} / {totalQuestions} câu</strong>
          </div>
          <div className="flex justify-between text-[#475569]">
            <span>Số câu chưa trả lời:</span>
            <strong className={unansweredCount > 0 ? "text-[#BE123C]" : "text-[#475569]"}>
              {unansweredCount} câu
            </strong>
          </div>
          <div className="flex justify-between text-[#475569]">
            <span>Thời gian còn lại:</span>
            <strong className="text-[#0F172A] font-mono">{formattedTimeLeft}</strong>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            className="h-10 px-4 border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] cursor-pointer"
          >
            Tiếp tục làm bài
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="h-10 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold cursor-pointer"
          >
            {isSubmitting ? "Đang chấm..." : "Xác nhận nộp bài"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
