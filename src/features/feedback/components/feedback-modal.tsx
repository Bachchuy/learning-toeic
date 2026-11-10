"use client";

import { useState, useEffect, useTransition } from "react";
import { usePathname } from "next/navigation";
import { submitFeedbackAction } from "../actions";
import type { FeedbackCategory } from "../schemas";
import { Button } from "@/components/ui/button";
import { X, MessageSquarePlus, CheckCircle2, AlertCircle } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_OPTIONS: Array<{ value: FeedbackCategory; label: string }> = [
  { value: "ux", label: "Trải nghiệm / Giao diện khó dùng" },
  { value: "bug", label: "Lỗi kỹ thuật / Nút không hoạt động" },
  { value: "content", label: "Nội dung câu hỏi / Giải thích" },
  { value: "feature", label: "Đề xuất tính năng mới" },
  { value: "other", label: "Góp ý khác" },
];

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const pathname = usePathname();
  const [category, setCategory] = useState<FeedbackCategory>("ux");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClose = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const viewport =
      typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "";

    startTransition(async () => {
      const res = await submitFeedbackAction({
        category,
        message,
        pagePath: pathname || "/",
        viewport,
      });

      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }

      setSuccessMsg(res.message);
      setMessage("");
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-[#0F172A]/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="w-full sm:max-w-md bg-[#FFFFFF] rounded-t-2xl sm:rounded-2xl border border-[#E2E8F0] shadow-xl p-5 sm:p-6 space-y-4 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-[#EFF6FF] text-[#2563EB]">
              <MessageSquarePlus className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <h2
                id="feedback-modal-title"
                className="text-base font-bold text-[#0F172A]"
              >
                Góp ý &amp; Báo lỗi nhanh
              </h2>
              <p className="text-xs text-[#475569]">
                Ghi chú trang hiện tại ({pathname || "/"}) để cải thiện nhanh hơn
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Đóng hộp góp ý"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {errorMsg && (
          <div
            role="alert"
            aria-live="polite"
            className="p-3 rounded-lg bg-[#FFF1F2] border border-[#BE123C]/20 text-xs font-medium text-[#BE123C] flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            aria-live="polite"
            className="p-3 rounded-lg bg-[#ECFDF5] border border-[#047857]/20 text-xs font-medium text-[#047857] flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="feedback-category"
              className="block text-sm font-medium text-[#0F172A]"
            >
              Chủ đề góp ý
            </label>
            <select
              id="feedback-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
              disabled={isPending}
              className="w-full h-11 px-3 rounded-lg border border-[#8190A6] bg-[#FFFFFF] text-base sm:text-sm text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="feedback-message"
              className="block text-sm font-medium text-[#0F172A]"
            >
              Nội dung chi tiết
            </label>
            <textarea
              id="feedback-message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isPending}
              required
              minLength={5}
              maxLength={2000}
              placeholder="Ví dụ: Trên điện thoại 360px phần giải thích bị khó đọc, hoặc mình muốn thêm..."
              className="w-full p-3 rounded-lg border border-[#8190A6] bg-[#FFFFFF] text-base sm:text-sm text-[#0F172A] placeholder:text-[#475569]/70 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isPending}
            >
              Đóng
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="cta"
              isLoading={isPending}
              disabled={message.trim().length < 5}
            >
              Gửi góp ý
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
