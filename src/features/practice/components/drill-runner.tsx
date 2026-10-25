"use client";

import { useReducer } from "react";
import type { SessionReviewItem } from "@/features/practice/types";
import {
  initDrillState,
  selectDrillOption,
  submitDrillAnswer,
  nextDrillQuestion,
  resetDrillState,
  type DrillState,
} from "@/core/drill";
import { AnswerOption } from "./answer-option";
import { AdaptiveExplanation } from "./adaptive-explanation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Info, RotateCcw, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

type DrillAction =
  | { type: "SELECT_OPTION"; optionIndex: number }
  | { type: "SUBMIT_ANSWER" }
  | { type: "NEXT_QUESTION" }
  | { type: "RESET_DRILL" };

function drillReducer(state: DrillState, action: DrillAction): DrillState {
  switch (action.type) {
    case "SELECT_OPTION":
      return selectDrillOption(state, action.optionIndex);
    case "SUBMIT_ANSWER":
      return submitDrillAnswer(state);
    case "NEXT_QUESTION":
      return nextDrillQuestion(state);
    case "RESET_DRILL":
      return resetDrillState(state);
    default:
      return state;
  }
}

interface DrillRunnerProps {
  wrongItems: SessionReviewItem[];
  onExitDrill: () => void;
}

export function DrillRunner({ wrongItems, onExitDrill }: DrillRunnerProps) {
  const [state, dispatch] = useReducer(drillReducer, wrongItems, initDrillState);

  // Màn hình kết thúc lượt Drill
  if (state.isFinished) {
    const accuracy =
      state.questions.length > 0
        ? Math.round((state.score / state.questions.length) * 100)
        : 100;

    return (
      <div className="max-w-xl mx-auto space-y-6 py-6 animate-in fade-in duration-200">
        <Card className="p-6 sm:p-8 text-center bg-white border border-[#E2E8F0] space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[#4338CA]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE] font-mono">
              Hoàn thành ôn lại
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              Kết quả lượt Drill
            </h2>
            <p className="text-sm text-[#475569]">
              Bạn đã ôn lại {state.questions.length} câu hỏi chưa vững trong phiên.
            </p>
          </div>

          <div className="py-4">
            <div className="text-5xl font-bold font-mono text-[#0F172A]">
              {state.score}{" "}
              <span className="text-2xl text-[#475569] font-normal">
                / {state.questions.length}
              </span>
            </div>
            <div className="text-sm font-semibold font-mono text-[#4338CA] mt-2">
              Độ chính xác lượt ôn: {accuracy}%
            </div>
          </div>

          {/* Bất biến: Duy nhất 1 nút Primary */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="cta"
              className="w-full sm:w-56"
              onClick={onExitDrill}
            >
              Về kết quả phiên →
            </Button>
            <Button
              variant="secondary"
              size="default"
              className="w-full sm:w-48"
              onClick={() => dispatch({ type: "RESET_DRILL" })}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Luyện lại lần nữa
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentQ = state.questions[state.currentIndex];
  const totalDrill = state.questions.length;
  const progressPercent = Math.round(
    ((state.currentIndex + (state.isSubmitted ? 1 : 0)) / totalDrill) * 100
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 animate-in fade-in duration-200">
      {/* 1. Băng rôn Indigo BẮT BUỘC (PD-03 & §4.5) */}
      <div
        role="status"
        aria-live="polite"
        className="p-3.5 sm:p-4 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-between gap-3 text-xs sm:text-sm text-[#4338CA] shadow-sm"
      >
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 shrink-0 text-[#4338CA]" />
          <span className="font-medium">
            Chế độ ôn lại tạm thời — Không lưu vào lịch sử và không đổi điểm thống kê
          </span>
        </div>
        <button
          type="button"
          onClick={onExitDrill}
          className="text-xs font-semibold underline hover:text-[#312E81] shrink-0 cursor-pointer"
        >
          Thoát Drill
        </button>
      </div>

      {/* 2. Drill Progress Header */}
      <div className="flex items-center justify-between text-xs font-mono text-[#475569]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExitDrill}
            className="inline-flex items-center gap-1 hover:text-[#0F172A] font-sans font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Về kết quả
          </button>
          <span>•</span>
          <span className="font-bold text-[#0F172A]">
            Câu ôn {state.currentIndex + 1} / {totalDrill}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-[#F1F5F9] text-[#0F172A] font-semibold">
          {currentQ.tag_name_vi}
        </span>
      </div>

      {/* Thanh tiến độ liên tục */}
      <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
        <div
          className="bg-[#4338CA] h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3. Stem câu hỏi */}
      <Card className="p-5 sm:p-6 bg-white border border-[#E2E8F0]">
        <h3 className="text-[17px] sm:text-[19px] font-semibold text-[#0F172A] leading-[1.6] tracking-[-0.01em]">
          {currentQ.stem}
        </h3>
      </Card>

      {/* 4. 4 Phương án lựa chọn */}
      <div className="space-y-3">
        {(
          [
            { key: "A" as const, text: currentQ.option_a, index: 0 },
            { key: "B" as const, text: currentQ.option_b, index: 1 },
            { key: "C" as const, text: currentQ.option_c, index: 2 },
            { key: "D" as const, text: currentQ.option_d, index: 3 },
          ] as const
        ).map(({ key, text, index }) => {
          let stateType:
            | "default"
            | "selected"
            | "correct"
            | "incorrect"
            | "unselected_disabled" = "default";

          if (state.isSubmitted) {
            if (index === currentQ.correct_index) {
              stateType = "correct";
            } else if (index === state.selectedOption) {
              stateType = "incorrect";
            } else {
              stateType = "unselected_disabled";
            }
          } else if (state.selectedOption === index) {
            stateType = "selected";
          }

          // Phân tích từ options_analysis nếu có
          const optAnalysis =
            currentQ.explanation?.options_analysis?.[key];

          return (
            <AnswerOption
              key={key}
              label={key}
              text={text}
              translation={optAnalysis}
              state={stateType}
              disabled={state.isSubmitted}
              onClick={() => dispatch({ type: "SELECT_OPTION", optionIndex: index })}
            />
          );
        })}
      </div>

      {/* 5. Giải thích sau khi nộp câu Drill */}
      {state.isSubmitted && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <AdaptiveExplanation
            isCorrect={state.selectedOption === currentQ.correct_index}
            explanation={currentQ.explanation}
          />
        </div>
      )}

      {/* 6. Sticky Action Bar dưới chân (chỉ đúng 1 nút Primary) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur border-t border-[#E2E8F0] z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-end">
          {!state.isSubmitted ? (
            <Button
              variant="primary"
              size="cta"
              className="w-full sm:w-48"
              disabled={state.selectedOption === null}
              onClick={() => dispatch({ type: "SUBMIT_ANSWER" })}
            >
              Kiểm tra đáp án
            </Button>
          ) : (
            <Button
              variant="primary"
              size="cta"
              className="w-full sm:w-56"
              onClick={() => dispatch({ type: "NEXT_QUESTION" })}
            >
              {state.currentIndex + 1 < totalDrill ? (
                <>
                  Câu tiếp theo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                "Xem kết quả ôn lại →"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
