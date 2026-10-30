"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { submitReadingExamAction } from "../actions";
import { ExamResultView } from "./exam-result-view";
import type { ReadingExamData, ReadingQuestionItem, ExamReadingEvaluation } from "../types";
import {
  Clock,
  Flag,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  ArrowLeft,
  FileText,
  Loader2,
} from "lucide-react";

interface ReadingExamSimulatorProps {
  examData: ReadingExamData;
}

const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

export function ReadingExamSimulator({ examData }: ReadingExamSimulatorProps) {
  const { questions, totalQuestions, durationMinutes, title, examSetId } = examData;

  // Trạng thái bài thi
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(() => new Set());
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60); // 75 phút = 4500s
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<ExamReadingEvaluation | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [paletteFilter, setPaletteFilter] = useState<
    "all" | "p5" | "p6" | "p7" | "flagged" | "unanswered"
  >("all");

  const currentQuestion: ReadingQuestionItem | undefined = questions[currentIdx];

  // Ref lưu đáp án mới nhất cho callback hết giờ
  const latestAnswersRef = useRef(userAnswers);
  useEffect(() => {
    latestAnswersRef.current = userAnswers;
  }, [userAnswers]);

  // Tính số lượng câu đã trả lời
  const answeredCount = useMemo(() => {
    return Object.keys(userAnswers).length;
  }, [userAnswers]);

  // Tự động nộp khi hết 75 phút
  const handleAutoSubmit = useCallback(async () => {
    setIsSubmitting(true);
    const res = await submitReadingExamAction({
      examSetId,
      userAnswers: latestAnswersRef.current,
      timeSpentSeconds: durationMinutes * 60,
    });
    setIsSubmitting(false);
    if (res.success && res.evaluation) {
      setEvaluation(res.evaluation);
    }
  }, [examSetId, durationMinutes]);

  const autoSubmitRef = useRef(handleAutoSubmit);
  useEffect(() => {
    autoSubmitRef.current = handleAutoSubmit;
  }, [handleAutoSubmit]);

  // Bộ đếm ngược thời gian thi 75 phút
  useEffect(() => {
    if (evaluation || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          autoSubmitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [evaluation, isSubmitting]);

  // Format thời gian hiển thị (MM:SS hoặc HH:MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Màu sắc thời gian (bình thường -> vàng cam < 10 phút -> đỏ < 5 phút)
  const timerColorClass = useMemo(() => {
    if (timeLeft < 300) return "text-[#BE123C] bg-[#FFF1F2] border-[#FECDD3] animate-pulse";
    if (timeLeft < 600) return "text-[#B45309] bg-[#FFFBEB] border-[#FDE68A]";
    return "text-[#0F172A] bg-[#F8FAFC] border-[#E2E8F0]";
  }, [timeLeft]);

  // Chọn phương án A/B/C/D
  const handleSelectOption = (qId: string, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: optionIndex,
    }));
  };

  // Bật/tắt gắn cờ xem lại
  const handleToggleFlag = (qId: string) => {
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  // Nộp bài thi
  const handleSubmitExam = async () => {
    setIsSubmitting(true);
    setShowSubmitModal(false);

    const timeSpent = durationMinutes * 60 - timeLeft;

    const res = await submitReadingExamAction({
      examSetId,
      userAnswers,
      timeSpentSeconds: timeSpent,
    });

    setIsSubmitting(false);

    if (res.success && res.evaluation) {
      setEvaluation(res.evaluation);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      alert(res.error || "Có lỗi xảy ra khi nộp bài thi. Vui lòng thử lại.");
    }
  };

  // Phím tắt bàn phím: A/B/C/D chọn đáp án, Mũi tên chuyển câu
  useEffect(() => {
    if (evaluation || showSubmitModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (!currentQuestion) return;

      const key = e.key.toUpperCase();
      if (key === "A") handleSelectOption(currentQuestion.id, 0);
      else if (key === "B") handleSelectOption(currentQuestion.id, 1);
      else if (key === "C") handleSelectOption(currentQuestion.id, 2);
      else if (key === "D") handleSelectOption(currentQuestion.id, 3);
      else if (key === "F") handleToggleFlag(currentQuestion.id);
      else if (e.key === "ArrowLeft" && currentIdx > 0) {
        setCurrentIdx((i) => i - 1);
      } else if (e.key === "ArrowRight" && currentIdx < totalQuestions - 1) {
        setCurrentIdx((i) => i + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQuestion, currentIdx, totalQuestions, evaluation, showSubmitModal]);

  // Lọc câu hỏi trong Question Palette
  const filteredPaletteQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (paletteFilter === "p5") return q.part === 5;
      if (paletteFilter === "p6") return q.part === 6;
      if (paletteFilter === "p7") return q.part === 7;
      if (paletteFilter === "flagged") return flaggedIds.has(q.id);
      if (paletteFilter === "unanswered") return userAnswers[q.id] === undefined;
      return true;
    });
  }, [questions, paletteFilter, flaggedIds, userAnswers]);

  // Nếu đã có kết quả chấm điểm -> Chuyển sang màn hình Bảng Điểm & Giải Thích Chi Tiết
  if (evaluation) {
    return (
      <ExamResultView
        examTitle={title}
        evaluation={evaluation}
        onRetake={() => {
          setEvaluation(null);
          setUserAnswers({});
          setFlaggedIds(new Set());
          setTimeLeft(durationMinutes * 60);
          setCurrentIdx(0);
        }}
      />
    );
  }

  return (
    <div className="w-full min-h-dvh flex flex-col bg-[#F8FAFC] pb-24 select-none">
      {/* ========================================================
          1. STICKY FOCUSED HEADER: Đồng hồ đếm ngược, Tiến độ, Nộp bài
          ======================================================== */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Nút thoát & Tên đề */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/exam"
              className="h-9 px-2 rounded-lg text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] inline-flex items-center text-xs font-medium cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Rời khỏi phòng thi</span>
            </Link>
            <div className="h-5 w-px bg-[#E2E8F0] hidden sm:block" />
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-[#0F172A] truncate">{title}</h1>
              <div className="text-[11px] text-[#475569] flex items-center gap-2">
                <span>100 câu Đọc (Part 5–7)</span>
                <span>•</span>
                <span>Tiến độ: <strong className="text-[#2563EB]">{answeredCount}</strong>/100</span>
              </div>
            </div>
          </div>

          {/* Đồng hồ đếm ngược & Nút nộp bài */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-mono font-bold ${timerColorClass}`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <Button
              onClick={() => setShowSubmitModal(true)}
              disabled={isSubmitting}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold h-9 px-4 rounded-lg shadow-none cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  <span>Đang chấm...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1.5" />
                  <span>Nộp bài</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* ========================================================
          2. MAIN EXAM BODY: Question Palette + Workspace
          ======================================================== */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Cột trái / Palette điều hướng nhanh 100 câu (Lg: 4 cột, Desktop: Sticky) */}
        <aside className="lg:col-span-4 space-y-3 order-2 lg:order-1">
          <Card className="p-4 bg-white border border-[#E2E8F0] shadow-2xs sticky top-18">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Bảng điều hướng câu hỏi (101 - 200)
              </div>
              <span className="text-[11px] text-[#475569]">
                Đã làm: {answeredCount}/100
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1 pt-2.5 pb-2 text-[11px]">
              {[
                { id: "all", label: "Tất cả" },
                { id: "p5", label: "Part 5 (30)" },
                { id: "p6", label: "Part 6 (16)" },
                { id: "p7", label: "Part 7 (54)" },
                { id: "flagged", label: `Cờ (${flaggedIds.size})` },
                { id: "unanswered", label: `Chưa làm (${100 - answeredCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPaletteFilter(tab.id as typeof paletteFilter)}
                  className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    paletteFilter === tab.id
                      ? "bg-[#2563EB] text-white"
                      : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Lưới 100 nút bấm câu hỏi */}
            <div className="max-h-[380px] overflow-y-auto pr-1 grid grid-cols-5 gap-1.5 pt-2">
              {filteredPaletteQuestions.map((q) => {
                const originalIndex = questions.findIndex((item) => item.id === q.id);
                const isAnswered = userAnswers[q.id] !== undefined;
                const isCurrent = originalIndex === currentIdx;
                const isFlagged = flaggedIds.has(q.id);

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(originalIndex)}
                    className={`relative h-9 rounded-md text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      isCurrent
                        ? "ring-2 ring-[#2563EB] font-bold"
                        : ""
                    } ${
                      isAnswered
                        ? "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
                        : "bg-white text-[#475569] border border-[#E2E8F0] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <span>{q.questionNumber}</span>
                    {isFlagged && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#B45309]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Ghi chú chú giải */}
            <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#475569]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#EFF6FF] border border-[#BFDBFE]" />
                <span>Đã làm</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-white border border-[#E2E8F0]" />
                <span>Chưa làm</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B45309]" />
                <span>Đánh dấu cờ</span>
              </div>
            </div>
          </Card>
        </aside>

        {/* Cột phải / Khu vực làm bài (Lg: 8 cột) */}
        <main className="lg:col-span-8 space-y-4 order-1 lg:order-2">
          {currentQuestion && (
            <div className="space-y-4">
              {/* Question Header Status */}
              <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-[#2563EB] text-white text-xs font-bold font-mono">
                    Câu {currentQuestion.questionNumber}
                  </span>
                  <span className="text-xs font-semibold text-[#475569]">
                    Part {currentQuestion.part}
                  </span>
                  {currentQuestion.grammarTag && (
                    <span className="text-[11px] text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded">
                      {currentQuestion.grammarTag}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleFlag(currentQuestion.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                      flaggedIds.has(currentQuestion.id)
                        ? "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]"
                        : "bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{flaggedIds.has(currentQuestion.id) ? "Đã gắn cờ" : "Đánh dấu cờ (F)"}</span>
                  </button>
                </div>
              </div>

              {/* ========================================================
                  PART 6 & PART 7: HIỂN THỊ BÀI ĐỌC (PASSAGE)
                  ======================================================== */}
              {(currentQuestion.part === 6 || currentQuestion.part === 7) &&
                currentQuestion.passageContent && (
                  <Card className="p-5 bg-white border border-[#E2E8F0] shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#F1F5F9]">
                      <FileText className="w-4 h-4 text-[#2563EB]" />
                      <span className="text-xs font-bold text-[#0F172A] uppercase">
                        {currentQuestion.passageDocType || "Văn bản bài đọc"}
                      </span>
                      {currentQuestion.passageTitle && (
                        <span className="text-xs text-[#475569] truncate">
                          — {currentQuestion.passageTitle}
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-[#0F172A] leading-relaxed whitespace-pre-line font-serif bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0] max-h-[360px] overflow-y-auto">
                      {currentQuestion.passageContent}
                    </div>
                  </Card>
                )}

              {/* Câu hỏi & 4 Phương án A/B/C/D */}
              <Card className="p-6 bg-white border border-[#E2E8F0] shadow-2xs space-y-5">
                <div className="text-base font-semibold text-[#0F172A] leading-relaxed">
                  {currentQuestion.stem}
                </div>

                {/* 4 Lựa chọn A, B, C, D */}
                <div className="space-y-2.5">
                  {currentQuestion.options.map((optionText, optIdx) => {
                    const isSelected = userAnswers[currentQuestion.id] === optIdx;

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3.5 cursor-pointer ${
                          isSelected
                            ? "bg-[#EFF6FF] border-[#2563EB] text-[#0F172A] shadow-xs"
                            : "bg-white border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#CBD5E1]"
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isSelected
                              ? "bg-[#2563EB] text-white"
                              : "bg-[#F1F5F9] text-[#475569]"
                          }`}
                        >
                          {OPTION_LETTERS[optIdx]}
                        </span>
                        <span className="text-sm font-medium leading-snug flex-1">
                          {optionText}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-[#2563EB] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Navigation Controls: Câu trước / Câu tiếp theo */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                  disabled={currentIdx === 0}
                  className="h-10 px-4 border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span>Câu trước</span>
                </Button>

                <span className="text-xs text-[#475569] font-medium hidden sm:inline">
                  Mẹo: Dùng phím <kbd className="px-1.5 py-0.5 rounded bg-[#F1F5F9] border text-[10px] font-mono">A</kbd> <kbd className="px-1.5 py-0.5 rounded bg-[#F1F5F9] border text-[10px] font-mono">B</kbd> <kbd className="px-1.5 py-0.5 rounded bg-[#F1F5F9] border text-[10px] font-mono">C</kbd> <kbd className="px-1.5 py-0.5 rounded bg-[#F1F5F9] border text-[10px] font-mono">D</kbd> để chọn nhanh
                </span>

                <Button
                  variant="secondary"
                  onClick={() => setCurrentIdx((i) => Math.min(totalQuestions - 1, i + 1))}
                  disabled={currentIdx === totalQuestions - 1}
                  className="h-10 px-4 border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  <span>Câu tiếp theo</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================
          MODAL XÁC NHẬN NỘP BÀI (SUBMIT MODAL)
          ======================================================== */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <Card className="w-full max-w-md p-6 bg-white border border-[#E2E8F0] shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-[#EFF6FF] text-[#2563EB] shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">Xác nhận nộp bài thi?</h3>
                <p className="text-xs text-[#475569] mt-1">
                  Hệ thống sẽ chấm điểm 100 câu theo thang điểm chuẩn ETS TOEIC 5–495 điểm.
                </p>
              </div>
            </div>

            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
              <div className="flex justify-between text-[#475569]">
                <span>Số câu đã làm:</span>
                <strong className="text-[#047857]">{answeredCount} / 100 câu</strong>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Số câu chưa trả lời:</span>
                <strong className={100 - answeredCount > 0 ? "text-[#BE123C]" : "text-[#475569]"}>
                  {100 - answeredCount} câu
                </strong>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Thời gian còn lại:</span>
                <strong className="text-[#0F172A] font-mono">{formatTime(timeLeft)}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setShowSubmitModal(false)}
                className="h-10 px-4 border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] cursor-pointer"
              >
                Tiếp tục làm bài
              </Button>
              <Button
                onClick={handleSubmitExam}
                disabled={isSubmitting}
                className="h-10 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold cursor-pointer"
              >
                {isSubmitting ? "Đang chấm..." : "Xác nhận nộp bài"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
