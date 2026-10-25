"use client";

import { useReducer, useEffect, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PracticeQuestion } from "../types";
import {
  practiceReducer,
  createInitialPracticeState,
} from "@/core/practiceReducer";
import { submitAnswerAction, finishSessionAction } from "../actions";
import { FocusedHeader } from "./focused-header";
import { AnswerOption, type OptionState } from "./answer-option";
import { AdaptiveExplanation } from "./adaptive-explanation";
import { Button } from "@/components/ui/button";

interface PracticeRunnerProps {
  sessionId: string;
  questions: PracticeQuestion[];
}

export function PracticeRunner({ sessionId, questions }: PracticeRunnerProps) {
  const router = useRouter();
  const [isFinishing, startTransition] = useTransition();

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
    } catch {
      dispatch({
        type: "SUBMIT_ERROR",
        payload: { error: "Lỗi kết nối mạng. Vui lòng thử lại." },
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

  // Hỗ trợ phím tắt bàn phím (A, B, C, D và Enter) - §5.9
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu đang gõ trong input hoặc textarea
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

  const options = [
    { label: "A" as const, text: currentQuestion.option_a },
    { label: "B" as const, text: currentQuestion.option_b },
    { label: "C" as const, text: currentQuestion.option_c },
    { label: "D" as const, text: currentQuestion.option_d },
  ];

  // Lấy lý do giải thích cụ thể cho từng phương án khi đã nộp bài (Feedback state)
  const getOptionExplanation = (optLabel: "A" | "B" | "C" | "D", index: number): string | undefined => {
    if (state.status !== "feedback" || !state.currentResult) {
      return undefined;
    }

    if (index === state.currentResult.correct_index) {
      return state.currentResult.explanation.why_correct_vi;
    }

    const wrongReason = state.currentResult.explanation.why_wrong_vi?.find(
      (w) => w.option === optLabel
    )?.reason_vi;

    return wrongReason;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 pt-20">
      {/* 1. Header tập trung */}
      <FocusedHeader
        currentIndex={state.currentIndex}
        totalQuestions={state.totalQuestions}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        {/* 2. Chủ điểm ngữ pháp Tag Badge */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] font-mono">
            {currentQuestion.tag_name_vi}
          </span>
          <span className="text-xs text-[#475569] font-mono">
            Part 5 • Độ khó: {currentQuestion.difficulty}/3
          </span>
        </div>

        {/* 3. Stem (Câu hỏi) */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs">
          <h2 className="text-lg sm:text-xl font-medium text-[#0F172A] leading-relaxed">
            {currentQuestion.stem}
          </h2>
        </div>

        {/* 4. 4 Phương án lựa chọn kèm giải thích gắn liền (Inline Explanation) */}
        <div
          role="radiogroup"
          aria-label="Các phương án trả lời"
          className="space-y-4"
        >
          {options.map((opt, index) => (
            <AnswerOption
              key={opt.label}
              label={opt.label}
              text={opt.text}
              state={getOptionState(index)}
              disabled={state.status === "submitting" || state.status === "feedback"}
              explanationReason={getOptionExplanation(opt.label, index)}
              isCorrectOption={
                state.status === "feedback" &&
                index === state.currentResult?.correct_index
              }
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
            className="p-4 rounded-lg bg-[#FFF1F2] border border-[#FECDD3] text-sm text-[#BE123C] flex items-center justify-between"
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

        {/* 5. Giải thích thích ứng (Chỉ hiện sau khi nộp) */}
        {state.status === "feedback" && state.currentResult && (
          <AdaptiveExplanation
            isCorrect={state.currentResult.is_correct}
            explanation={state.currentResult.explanation}
          />
        )}
      </div>

      {/* ========================================================
          Sticky Action Bar (72px) ghim cố định đáy màn hình
          Bất biến: Mỗi màn hình chỉ MỘT nút Primary duy nhất
          ======================================================== */}
      <footer className="fixed bottom-0 left-0 right-0 h-[72px] bg-white border-t border-[#E2E8F0] z-30 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto h-full flex items-center justify-between">
          <div className="hidden sm:block text-xs font-mono text-[#475569]">
            {state.status === "answering" && "Phím A-D: chọn • Enter: nộp"}
            {state.status === "feedback" && "Nhấn Enter để tiếp tục"}
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
