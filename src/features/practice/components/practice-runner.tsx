"use client";

import { useReducer, useEffect, useCallback, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Flag, BookmarkPlus, Sparkles } from "lucide-react";
import type { PracticeQuestion, VocabHint } from "../types";
import {
  practiceReducer,
  createInitialPracticeState,
} from "@/core/practiceReducer";
import {
  submitAnswerAction,
  finishSessionAction,
  trackEventAction,
} from "../actions";
import { FocusedHeader } from "./focused-header";
import { AnswerOption, type OptionState } from "./answer-option";
import { AdaptiveExplanation } from "./adaptive-explanation";
import { QuestionReportModal } from "./question-report-modal";
import { VocabSaveModal } from "@/features/vocab/components/vocab-save-modal";
import { Button } from "@/components/ui/button";

interface PracticeRunnerProps {
  sessionId: string;
  questions: PracticeQuestion[];
}

export function PracticeRunner({ sessionId, questions }: PracticeRunnerProps) {
  const router = useRouter();
  const [isFinishing, startTransition] = useTransition();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isVocabOpen, setIsVocabOpen] = useState(false);
  const [selectedVocabHint, setSelectedVocabHint] = useState<VocabHint | null>(null);

  const [state, dispatch] = useReducer(
    practiceReducer,
    createInitialPracticeState(questions.length)
  );

  const currentQuestion = questions[state.currentIndex];
  const isLastQuestion = state.currentIndex === state.totalQuestions - 1;

  // Xử lý nộp bài
  const handleSubmit = useCallback(async () => {
    if (state.selectedIndex === null || state.status !== "answering") return;

    dispatch({ type: "START_SUBMIT" });

    try {
      const response = await submitAnswerAction(
        sessionId,
        currentQuestion.id,
        state.selectedIndex
      );

      if (response.error || !response.result) {
        dispatch({
          type: "SUBMIT_ERROR",
          payload: { error: response.error || "Không thể kết nối đến máy chủ" },
        });
        return;
      }

      dispatch({
        type: "SUBMIT_SUCCESS",
        payload: { result: response.result },
      });

      // BẤT BIẾN §4.3 & D-08: Nếu làm sai, hệ thống tự động bung giải thích -> ghi nhận explanation_viewed
      if (!response.result.is_correct) {
        trackEventAction("explanation_viewed", {
          question_id: currentQuestion.id,
          session_id: sessionId,
        });
      }
    } catch {
      dispatch({
        type: "SUBMIT_ERROR",
        payload: { error: "Đường truyền hơi chậm một chút. Lựa chọn của bạn vẫn được giữ nguyên, hãy bấm Thử lại nhé." },
      });
    }
  }, [sessionId, currentQuestion, state.selectedIndex, state.status]);

  // Xử lý chuyển câu hoặc kết thúc
  const handleNext = useCallback(async () => {
    if (isLastQuestion) {
      dispatch({ type: "FINISH_SESSION" });
      startTransition(async () => {
        await finishSessionAction(sessionId);
        router.push(`/practice/${sessionId}/result`);
      });
    } else {
      dispatch({ type: "NEXT_QUESTION" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isLastQuestion, sessionId, router]);

  // Hỗ trợ phím tắt bàn phím (A, B, C, D và Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (state.status === "answering") {
        if (e.key === "a" || e.key === "A" || e.key === "1") {
          dispatch({ type: "SELECT_OPTION", payload: { index: 0 } });
        } else if (e.key === "b" || e.key === "B" || e.key === "2") {
          dispatch({ type: "SELECT_OPTION", payload: { index: 1 } });
        } else if (e.key === "c" || e.key === "C" || e.key === "3") {
          dispatch({ type: "SELECT_OPTION", payload: { index: 2 } });
        } else if (e.key === "d" || e.key === "D" || e.key === "4") {
          dispatch({ type: "SELECT_OPTION", payload: { index: 3 } });
        } else if (e.key === "Enter" && state.selectedIndex !== null) {
          e.preventDefault();
          handleSubmit();
        }
      } else if (state.status === "feedback") {
        if (e.key === "Enter") {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.status, state.selectedIndex, handleSubmit, handleNext]);

  // Xác định trạng thái hiển thị của từng option
  const getOptionState = (index: number): OptionState => {
    if (state.status === "feedback" && state.currentResult) {
      if (index === state.currentResult.correct_index) {
        return "correct";
      }
      if (
        index === state.selectedIndex &&
        !state.currentResult.is_correct
      ) {
        return "incorrect";
      }
      return "unselected_disabled";
    }

    if (state.selectedIndex === index) {
      return "selected";
    }

    return "default";
  };

  // Lấy dịch nghĩa tiếng Việt tương ứng cho từng phương án
  const getOptionTranslation = (optLabel: "A" | "B" | "C" | "D"): string | undefined => {
    if (state.status !== "feedback" || !state.currentResult) {
      return undefined;
    }

    // 1. Tìm trong options_analysis của JSON giải thích
    if (state.currentResult.explanation.options_analysis?.[optLabel]) {
      return state.currentResult.explanation.options_analysis[optLabel];
    }

    // 2. Hoặc tìm trong why_wrong_vi
    const wrong = state.currentResult.explanation.why_wrong_vi?.find(
      (w) => w.option === optLabel
    );
    if (wrong) {
      return wrong.reason_vi;
    }

    return undefined;
  };

  const options = [
    { label: "A" as const, text: currentQuestion.option_a },
    { label: "B" as const, text: currentQuestion.option_b },
    { label: "C" as const, text: currentQuestion.option_c },
    { label: "D" as const, text: currentQuestion.option_d },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 pt-20">
      {/* 1. Header tập trung */}
      <FocusedHeader
        currentIndex={state.currentIndex}
        totalQuestions={state.totalQuestions}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        {/* 2. Tiêu đề câu hỏi theo phong cách app mẫu */}
        <div className="space-y-3">
          {/* Header trạng thái sau khi nộp (Khớp 100% mẫu người dùng cung cấp) */}
          {state.status === "feedback" && state.currentResult ? (
            <div className="flex items-center gap-2">
              {state.currentResult.is_correct ? (
                <>
                  <CheckCircle2
                    className="w-5 h-5 text-[#047857] shrink-0"
                    aria-hidden="true"
                  />
                  <span className="font-bold text-[#0F172A] text-base">
                    Câu {state.currentIndex + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold text-white bg-[#047857] select-none font-mono tracking-wide">
                    ĐÚNG
                  </span>
                </>
              ) : (
                <>
                  <XCircle
                    className="w-5 h-5 text-[#BE123C] shrink-0"
                    aria-hidden="true"
                  />
                  <span className="font-bold text-[#0F172A] text-base">
                    Câu {state.currentIndex + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold text-white bg-[#BE123C] select-none font-mono tracking-wide">
                    SAI
                  </span>
                </>
              )}
              <span className="text-xs text-[#64748B] ml-2 font-mono hidden sm:inline">
                {currentQuestion.tag_name_vi}
              </span>

              {/* Nhóm nút phụ sau khi nộp: Lưu từ vựng & Báo lỗi (§5.5 & PD-01) */}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVocabHint(null);
                    setIsVocabOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer border border-[#BFDBFE]"
                  title="Lưu từ vựng vào Sổ cá nhân"
                >
                  <BookmarkPlus className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>+ Lưu từ</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsReportOpen(true);
                    trackEventAction("report_opened", {
                      question_id: currentQuestion.id,
                      session_id: sessionId,
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[#64748B] hover:text-[#BE123C] hover:bg-[#FFF1F2] transition-colors cursor-pointer border border-[#E2E8F0]"
                  title="Báo cáo lỗi câu hỏi này"
                >
                  <Flag className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Báo lỗi</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] font-mono">
                {currentQuestion.tag_name_vi}
              </span>
              <span className="text-xs text-[#475569] font-mono">
                Câu {state.currentIndex + 1} / {state.totalQuestions}
              </span>
            </div>
          )}

          {/* Stem (Nội dung câu hỏi: Lớn, đậm và nổi bật hơn giải thích) */}
          <div className="p-1">
            <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#0F172A] leading-[1.6] tracking-[-0.01em]">
              {currentQuestion.stem}
            </h2>
          </div>
        </div>

        {/* 3. 4 Phương án lựa chọn (Dịch nghĩa hiển thị trọn trong khung như app mẫu) */}
        <div
          role="radiogroup"
          aria-label="Các phương án trả lời"
          className="space-y-3"
        >
          {options.map((opt, index) => (
            <AnswerOption
              key={opt.label}
              label={opt.label}
              text={opt.text}
              translation={getOptionTranslation(opt.label)}
              state={getOptionState(index)}
              disabled={state.status === "submitting" || state.status === "feedback"}
              onClick={() =>
                dispatch({ type: "SELECT_OPTION", payload: { index } })
              }
            />
          ))}
        </div>

        {/* Lỗi mạng (nếu có) */}
        {state.status === "error" && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-sm text-[#BE123C] flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold">[!]</span>
              <span>{state.errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className="text-xs font-bold underline cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* 4. Khối giải thích chi tiết (Gắn trọn vẹn ngữ cảnh cụ thể) */}
        {state.status === "feedback" && state.currentResult && (
          <div className="space-y-4">
            <AdaptiveExplanation
              isCorrect={state.currentResult.is_correct}
              explanation={state.currentResult.explanation}
              onExpandClick={() => {
                trackEventAction("explanation_expand_clicked", {
                  question_id: currentQuestion.id,
                  session_id: sessionId,
                });
              }}
            />

            {/* Word Chips gợi ý từ câu hỏi để lưu nhanh (PD-01 & §5.5) */}
            {state.currentResult.explanation.vocab_hints &&
              state.currentResult.explanation.vocab_hints.length > 0 && (
                <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] space-y-2">
                  <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                    Lưu nhanh từ vựng quan trọng vào Sổ từ:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {state.currentResult.explanation.vocab_hints.map((hint) => (
                      <button
                        key={hint.word}
                        type="button"
                        onClick={() => {
                          setSelectedVocabHint(hint);
                          setIsVocabOpen(true);
                        }}
                        className="h-8 px-2.5 rounded-md text-xs font-medium bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] hover:border-[#BFDBFE] text-[#0F172A] hover:text-[#2563EB] transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span className="font-semibold">{hint.word}</span>
                        <span className="text-[#64748B]">({hint.meaning_vi})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Modal Báo lỗi câu hỏi (Milestone 5) */}
      <QuestionReportModal
        key={`report-${currentQuestion.id}`}
        isOpen={isReportOpen}
        questionId={currentQuestion.id}
        onClose={() => setIsReportOpen(false)}
      />

      {/* Modal Lưu từ vựng (Milestone 7) */}
      <VocabSaveModal
        key={`vocab-${currentQuestion.id}-${selectedVocabHint?.word || "custom"}`}
        isOpen={isVocabOpen}
        contextSentence={currentQuestion.stem}
        answerText={
          state.currentResult
            ? options[state.currentResult.correct_index]?.text || ""
            : ""
        }
        contextTranslation={
          state.currentResult?.explanation.full_translation_vi || ""
        }
        questionId={currentQuestion.id}
        vocabHints={state.currentResult?.explanation.vocab_hints || []}
        initialWord={selectedVocabHint?.word || ""}
        initialMeaning={selectedVocabHint?.meaning_vi || ""}
        onClose={() => {
          setIsVocabOpen(false);
          setSelectedVocabHint(null);
        }}
      />

      {/* ========================================================
          Sticky Action Bar (72px)
          ======================================================== */}
      <footer className="fixed bottom-0 left-0 right-0 h-[72px] bg-white border-t border-[#E2E8F0] z-30 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto h-full flex items-center justify-between">
          <div className="hidden sm:block text-xs font-mono text-[#64748B]">
            {state.status === "answering" && "Phím A-D: chọn • Enter: nộp bài"}
            {state.status === "feedback" && "Nhấn Enter để sang câu tiếp theo"}
          </div>

          <div className="w-full sm:w-auto">
            {state.status === "answering" || state.status === "submitting" || state.status === "error" ? (
              <Button
                variant="primary"
                size="cta"
                className="w-full sm:w-48"
                disabled={state.selectedIndex === null || state.status === "submitting"}
                isLoading={state.status === "submitting"}
                onClick={handleSubmit}
              >
                Nộp đáp án
              </Button>
            ) : (
              <Button
                variant="primary"
                size="cta"
                className="w-full sm:w-48"
                isLoading={isFinishing}
                onClick={handleNext}
              >
                {isLastQuestion ? "Xem kết quả" : "Câu tiếp theo →"}
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
