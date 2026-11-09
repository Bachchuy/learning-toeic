"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { submitReadingExamAction } from "../actions";
import { ExamResultView } from "./exam-result-view";
import { useExamTimer } from "../hooks/use-exam-timer";
import { ExamQuestionNavigator } from "./exam-question-navigator";
import { ExamPassageViewer } from "./exam-passage-viewer";
import { ExamSubmitModal } from "./exam-submit-modal";
import type { ReadingExamData, ReadingQuestionItem, ExamReadingEvaluation } from "../types";
import {
  Clock,
  Flag,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  ArrowLeft,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<ExamReadingEvaluation | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const currentQuestion: ReadingQuestionItem | undefined = questions[currentIdx];

  // Ref lưu đáp án mới nhất cho callback hết giờ
  const latestAnswersRef = useRef(userAnswers);
  useEffect(() => {
    latestAnswersRef.current = userAnswers;
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

  // Hook quản lý bộ đếm ngược thời gian thi 75 phút
  const { timeLeft, formattedTime, timerColorClass, resetTimer } = useExamTimer({
    durationMinutes,
    onTimeUp: handleAutoSubmit,
    isPaused: !!evaluation || isSubmitting,
  });

  // Tính số lượng câu đã trả lời
  const answeredCount = useMemo(() => {
    return Object.keys(userAnswers).length;
  }, [userAnswers]);

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

  // Phím tắt bàn phím: A/B/C/D chọn đáp án, Mũi tên chuyển câu, F gắn cờ
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
          resetTimer();
          setCurrentIdx(0);
        }}
      />
    );
  }

  return (
    <div className="w-full min-h-dvh flex flex-col bg-[#F8FAFC] pb-24 select-none">
      {/* 1. STICKY FOCUSED HEADER: Đồng hồ đếm ngược, Tiến độ, Nộp bài */}
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
                <span>
                  Tiến độ: <strong className="text-[#2563EB]">{answeredCount}</strong>/{totalQuestions}
                </span>
              </div>
            </div>
          </div>

          {/* Đồng hồ đếm ngược & Nút nộp bài */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-mono font-bold ${timerColorClass}`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>{formattedTime}</span>
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

      {/* 2. MAIN EXAM BODY: Question Palette + Workspace */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Cột trái / Palette điều hướng nhanh 100 câu (Lg: 4 cột, Desktop: Sticky) */}
        <aside className="lg:col-span-4 space-y-3 order-2 lg:order-1">
          <ExamQuestionNavigator
            questions={questions}
            currentIdx={currentIdx}
            userAnswers={userAnswers}
            flaggedIds={flaggedIds}
            onSelectQuestion={(idx) => setCurrentIdx(idx)}
            totalQuestions={totalQuestions}
          />
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
                    <span>{flaggedIds.has(currentQuestion.id) ? "Đã đánh dấu" : "Đánh dấu (F)"}</span>
                  </button>
                </div>
              </div>

              {/* PART 6 & PART 7: HIỂN THỊ BÀI ĐỌC (PASSAGE) */}
              {(currentQuestion.part === 6 || currentQuestion.part === 7) &&
                currentQuestion.passageContent && (
                  <ExamPassageViewer
                    docType={currentQuestion.passageDocType}
                    title={currentQuestion.passageTitle}
                    content={currentQuestion.passageContent}
                  />
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
                  Mẹo: Dùng phím <kbd className="px-1.5 py-0.5 rounded bg-[#F1F5F9] border text-[10px] font-mono">A</kbd>{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-[#F1F5F9] border text-[10px] font-mono">B</kbd>{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-[#F1F5F9] border text-[10px] font-mono">C</kbd>{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-[#F1F5F9] border text-[10px] font-mono">D</kbd> để chọn nhanh
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

      {/* Modal xác nhận nộp bài thi */}
      <ExamSubmitModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={handleSubmitExam}
        isSubmitting={isSubmitting}
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
        formattedTimeLeft={formattedTime}
      />
    </div>
  );
}
