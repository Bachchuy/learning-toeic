"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import type { AdminReviewQuestion } from "../types";
import { approveQuestionAction, rejectQuestionAction } from "../actions";
import { runAutomatedValidator } from "@/core/adminReview";
import { EditQuestionModal } from "./edit-question-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  XCircle,
  Edit3,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  ArrowLeft,
  Inbox,
  Check,
  X,
  Clock,
} from "lucide-react";

interface AdminReviewViewProps {
  initialQuestions: AdminReviewQuestion[];
}

export function AdminReviewView({ initialQuestions }: AdminReviewViewProps) {
  const [questions, setQuestions] = useState<AdminReviewQuestion[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isActionPending, startActionTransition] = useTransition();
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  const currentQ = questions[currentIndex] as AdminReviewQuestion | undefined;

  // Chuyển sang câu kế tiếp hoặc lùi
  const goToNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setActionSuccessMsg(null);
      setActionErrorMsg(null);
    }
  }, [currentIndex, questions.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setActionSuccessMsg(null);
      setActionErrorMsg(null);
    }
  }, [currentIndex]);

  // Hành động Duyệt câu hỏi (Y)
  const handleApprove = useCallback(() => {
    if (!currentQ || isActionPending) return;
    setActionSuccessMsg(null);
    setActionErrorMsg(null);

    startActionTransition(async () => {
      const res = await approveQuestionAction(currentQ.id, "Admin duyệt đạt chuẩn");
      if (res.success) {
        setActionSuccessMsg(`Đã duyệt câu hỏi #${currentIndex + 1}`);
        // Xóa câu hỏi khỏi hàng đợi hiện tại
        setQuestions((prev) => {
          const nextList = prev.filter((q) => q.id !== currentQ.id);
          if (currentIndex >= nextList.length && nextList.length > 0) {
            setCurrentIndex(nextList.length - 1);
          }
          return nextList;
        });
      } else {
        setActionErrorMsg(res.error || "Không thể duyệt câu hỏi.");
      }
    });
  }, [currentQ, isActionPending, currentIndex]);

  // Hành động Loại câu hỏi (N)
  const handleReject = useCallback(() => {
    if (!currentQ || isActionPending) return;
    setActionSuccessMsg(null);
    setActionErrorMsg(null);

    startActionTransition(async () => {
      const res = await rejectQuestionAction(currentQ.id, "Admin loại bỏ do không đạt chuẩn");
      if (res.success) {
        setActionSuccessMsg(`Đã loại câu hỏi #${currentIndex + 1}`);
        // Xóa câu hỏi khỏi hàng đợi hiện tại
        setQuestions((prev) => {
          const nextList = prev.filter((q) => q.id !== currentQ.id);
          if (currentIndex >= nextList.length && nextList.length > 0) {
            setCurrentIndex(nextList.length - 1);
          }
          return nextList;
        });
      } else {
        setActionErrorMsg(res.error || "Không thể loại câu hỏi.");
      }
    });
  }, [currentQ, isActionPending, currentIndex]);

  // Keyboard Shortcuts (J: Prev, K: Next, Y: Approve, N: Reject, E: Edit)
  // BẤT BIẾN §4.9: Phím tắt không kích hoạt khi con trỏ ở ô nhập liệu (input, textarea)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditModalOpen) return;

      const target = e.target as HTMLElement | null;
      if (
        !target ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable ||
        target.closest?.('[role="dialog"]') ||
        target.closest?.("dialog")
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === "y") {
        e.preventDefault();
        handleApprove();
      } else if (key === "n") {
        e.preventDefault();
        handleReject();
      } else if (key === "j") {
        e.preventDefault();
        goToPrev();
      } else if (key === "k") {
        e.preventDefault();
        goToNext();
      } else if (key === "e") {
        e.preventDefault();
        setIsEditModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditModalOpen, handleApprove, handleReject, goToPrev, goToNext]);

  // Trạng thái Hàng đợi rỗng (Empty Queue State)
  if (questions.length === 0 || !currentQ) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center mx-auto text-[#047857]">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-[#0F172A]">
            Hàng đợi duyệt đề trống
          </h1>
          <p className="text-sm text-[#475569]">
            Toàn bộ câu hỏi trong hệ thống đã được kiểm định hoặc xuất bản. Không còn câu nào đang chờ xem xét.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/">
            <Button variant="secondary" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Quay lại Trang chủ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Chạy validator tự động cho câu hỏi hiện tại
  const validatorReport = runAutomatedValidator({
    stem: currentQ.stem,
    option_a: currentQ.option_a,
    option_b: currentQ.option_b,
    option_c: currentQ.option_c,
    option_d: currentQ.option_d,
    correct_index: currentQ.correct_index,
    explanation: currentQ.explanation,
  });

  const options = [
    { label: "A", text: currentQ.option_a, idx: 0 },
    { label: "B", text: currentQ.option_b, idx: 1 },
    { label: "C", text: currentQ.option_c, idx: 2 },
    { label: "D", text: currentQ.option_d, idx: 3 },
  ];

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6 pb-28 md:pb-8">
      {/* ========================================================
          Header: Tiêu đề, Breadcrumb & Bộ đếm câu
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xs text-[#475569] hover:text-[#0F172A] flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Trang chủ
            </Link>
            <span className="text-[#8190A6]">/</span>
            <span className="text-xs font-semibold text-[#0F172A]">Quản trị viên</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#2563EB]" />
            Hàng đợi duyệt đề (Review Queue)
          </h1>
        </div>

        {/* Bộ điều hướng câu & Phím tắt nhắc nhở */}
        <div className="flex items-center gap-3">
          <Badge variant="neutral" showIcon={false} className="font-mono text-xs px-2.5 py-1">
            <Inbox className="w-3.5 h-3.5 mr-1 text-[#2563EB]" />
            Câu {currentIndex + 1} / {questions.length} (Còn {questions.length} câu)
          </Badge>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={currentIndex === 0 || isActionPending}
              onClick={goToPrev}
              title="Câu trước (Phím J)"
              className="h-8 px-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="font-mono text-[11px] text-[#475569] hidden sm:inline">J</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={currentIndex === questions.length - 1 || isActionPending}
              onClick={goToNext}
              title="Câu tiếp theo (Phím K)"
              className="h-8 px-2"
            >
              <span className="font-mono text-[11px] text-[#475569] hidden sm:inline">K</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Thông báo thao tác */}
      {actionSuccessMsg && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg text-xs font-medium text-[#047857] flex items-center gap-2 animate-in fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {actionErrorMsg && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-3 bg-[#FFF1F2] border border-[#FECDD3] rounded-lg text-xs font-medium text-[#BE123C] flex items-center gap-2 animate-in fade-in"
        >
          <AlertTriangle className="w-4 h-4 text-[#BE123C] shrink-0" />
          <span>{actionErrorMsg}</span>
        </div>
      )}

      {/* ========================================================
          CẤU TRÚC CHIA ĐÔI (Split View):
          Trái (7/12): Stem, 4 Options, Giải thích
          Phải (5/12): Báo cáo kiểm định, Lý do, Thao tác Duyệt/Loại
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ==========================================
            CỘT TRÁI (7/12 Desktop): Nội dung câu hỏi
            ========================================== */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-[#E2E8F0] shadow-sm">
            <CardHeader className="pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="neutral" showIcon={false} className="text-xs font-medium text-[#2563EB] bg-[#EFF6FF] border-[#BFDBFE]">
                    {currentQ.tag_name_vi}
                  </Badge>
                  <span className="text-xs text-[#475569] font-mono">
                    Độ khó: {currentQ.difficulty}/3
                  </span>
                </div>
                <Badge
                  variant={currentQ.status === "needs_review" ? "needs_review" : "neutral"}
                  showIcon={false}
                  className="text-xs uppercase font-mono"
                >
                  {currentQ.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-5">
              {/* Stem câu hỏi */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <p className="text-base sm:text-lg text-[#0F172A] leading-relaxed font-medium">
                  {currentQ.stem.split(/(_{2,})/).map((part, idx) =>
                    /_{2,}/.test(part) ? (
                      <span
                        key={idx}
                        className="font-mono text-[#2563EB] font-bold bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE] inline-block mx-1 select-all"
                      >
                        {part}
                      </span>
                    ) : (
                      part
                    )
                  )}
                </p>
              </div>

              {/* 4 Phương án lựa chọn (Đáp án đúng được đánh dấu rõ ràng) */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#475569] block">
                  Phương án lựa chọn
                </label>
                <div className="space-y-2">
                  {options.map((opt) => {
                    const isCorrect = opt.idx === currentQ.correct_index;
                    return (
                      <div
                        key={opt.label}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          isCorrect
                            ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#047857]"
                            : "bg-white border-[#E2E8F0] text-[#0F172A]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-md font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                              isCorrect
                                ? "bg-[#047857] text-white"
                                : "bg-[#F1F5F9] text-[#475569]"
                            }`}
                          >
                            {opt.label}
                          </span>
                          <span className="text-sm font-medium">{opt.text}</span>
                        </div>

                        {isCorrect && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#D1FAE5] text-[#065F46] flex items-center gap-1 shrink-0">
                            <Check className="w-3.5 h-3.5" /> Đáp án đúng
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Giải thích sư phạm (Adaptive Explanation) */}
              <div className="space-y-3 pt-4 border-t border-[#E2E8F0]">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#475569]">
                  <BookOpen className="w-4 h-4 text-[#2563EB]" />
                  Giải thích đáp án
                </div>

                {/* Rule vi */}
                {currentQ.explanation.rule_vi && (
                  <div className="p-3.5 bg-[#EFF6FF] rounded-lg border-l-4 border-[#2563EB] space-y-1">
                    <p className="text-xs font-semibold text-[#1E40AF] uppercase tracking-wider">
                      Quy tắc cốt lõi
                    </p>
                    <p className="text-xs text-[#1E3A8A] leading-relaxed">
                      {currentQ.explanation.rule_vi}
                    </p>
                  </div>
                )}

                {/* Why correct */}
                {currentQ.explanation.why_correct_vi && (
                  <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
                    <p className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-[#B45309]" />
                      Vì sao đúng
                    </p>
                    <p className="text-xs text-[#334155] leading-relaxed">
                      {currentQ.explanation.why_correct_vi}
                    </p>
                  </div>
                )}

                {/* Vocab hints (nếu có) */}
                {currentQ.explanation.vocab_hints && currentQ.explanation.vocab_hints.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-[#475569]">Từ vựng gợi ý (Word Hints):</p>
                    <div className="flex flex-wrap gap-2">
                      {currentQ.explanation.vocab_hints.map((vh, i) => (
                        <span
                          key={i}
                          className="text-xs px-2.5 py-1 rounded-md bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0]"
                        >
                          <strong className="font-semibold">{vh.word}</strong>: {vh.meaning_vi}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ==========================================
            CỘT PHẢI (5/12 Desktop): Báo cáo & Quyết định
            ========================================== */}
        <div className="lg:col-span-5 space-y-4">
          {/* Báo cáo kiểm định chất lượng tự động (S3 - S6) */}
          <Card className="border-[#E2E8F0] shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                  Kiểm định tự động (Validator S3–S6)
                </CardTitle>
                <Badge
                  variant={validatorReport.overallPass ? "mastered" : "needs_review"}
                  showIcon={false}
                  className="text-[11px] font-mono"
                >
                  {validatorReport.overallPass ? "ĐẠT CHUẨN" : "CẦN LƯU Ý"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {validatorReport.checks.map((chk) => (
                <div
                  key={chk.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs ${
                    chk.status === "pass"
                      ? "bg-[#ECFDF5]/50 border-[#A7F3D0] text-[#047857]"
                      : chk.status === "warn"
                      ? "bg-[#FFFBEB]/50 border-[#FDE68A] text-[#B45309]"
                      : "bg-[#FFF1F2]/50 border-[#FECDD3] text-[#BE123C]"
                  }`}
                >
                  <span className="font-mono font-bold shrink-0 mt-0.5">[{chk.id}]</span>
                  <div className="flex-1 space-y-0.5">
                    <p className="font-semibold">{chk.name}</p>
                    <p className="text-[11px] opacity-90">{chk.description}</p>
                  </div>
                  {chk.status === "pass" ? (
                    <Check className="w-4 h-4 shrink-0 text-[#047857]" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Lý do vào hàng đợi & Báo lỗi từ học viên */}
          <Card className="border-[#E2E8F0] shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#B45309]" />
                Lý do vào hàng đợi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentQ.reports && currentQ.reports.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-[#BE123C] font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Có {currentQ.reports.length} báo cáo lỗi từ học viên:
                  </p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {currentQ.reports.map((rep) => (
                      <div
                        key={rep.id}
                        className="p-2.5 bg-[#FFF1F2] border border-[#FECDD3] rounded-lg text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[#BE123C] font-semibold">
                          <span>Lý do: {rep.reason}</span>
                          <span className="text-[10px] text-[#475569] font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(rep.created_at).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        {rep.notes && (
                          <p className="text-[11px] text-[#475569] italic">
                            &quot;{rep.notes}&quot;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#475569]">
                  Câu hỏi được đưa vào hàng đợi kiểm định chất lượng trước khi phát hành chính thức.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quyết định Admin (Actions Card) */}
          <Card className="border-[#E2E8F0] shadow-sm hidden md:block">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-[#0F172A]">
                Quyết định duyệt câu hỏi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Duyệt Y */}
                <Button
                  type="button"
                  variant="primary"
                  size="default"
                  disabled={isActionPending}
                  onClick={handleApprove}
                  className="bg-[#047857] hover:bg-[#065F46] text-white flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Duyệt câu (Y)
                </Button>

                {/* Loại N */}
                <Button
                  type="button"
                  variant="destructive"
                  size="default"
                  disabled={isActionPending}
                  onClick={handleReject}
                  className="flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  Loại câu (N)
                </Button>
              </div>

              {/* Sửa nhẹ Edit Mode */}
              <Button
                type="button"
                variant="secondary"
                disabled={isActionPending}
                onClick={() => setIsEditModalOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold"
              >
                <Edit3 className="w-4 h-4 text-[#2563EB]" />
                Sửa nhẹ câu hỏi (E)
              </Button>

              {/* Phím tắt gợi ý */}
              <div className="pt-2 border-t border-[#F1F5F9] flex flex-wrap gap-2 text-[11px] text-[#475569] font-mono">
                <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0]">Y: Duyệt</span>
                <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0]">N: Loại</span>
                <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0]">E: Sửa</span>
                <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0]">J: Lùi</span>
                <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0]">K: Tiến</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ========================================================
          MOBILE STICKY ACTION BAR (360px - 767px)
          Ghim dưới đáy màn hình điện thoại (§5.6 M10)
          ======================================================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] p-3 shadow-lg flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isActionPending}
          onClick={() => setIsEditModalOpen(true)}
          className="flex-1 text-xs"
        >
          <Edit3 className="w-3.5 h-3.5 mr-1 text-[#2563EB]" />
          Sửa
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={isActionPending}
          onClick={handleReject}
          className="flex-1 text-xs"
        >
          <X className="w-3.5 h-3.5 mr-1" />
          Loại (N)
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={isActionPending}
          onClick={handleApprove}
          className="flex-1 bg-[#047857] hover:bg-[#065F46] text-white text-xs"
        >
          <Check className="w-3.5 h-3.5 mr-1" />
          Duyệt (Y)
        </Button>
      </div>

      {/* Edit Mode Modal */}
      {isEditModalOpen && (
        <EditQuestionModal
          question={currentQ}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSaved={() => {
            setActionSuccessMsg("Đã cập nhật câu hỏi thành công.");
          }}
        />
      )}
    </div>
  );
}
