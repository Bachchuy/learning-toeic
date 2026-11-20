"use client";

import { useReducer, useEffect, useCallback, useTransition, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Flag, BookmarkPlus, Sparkles } from "lucide-react";
import type { PracticeQuestion, VocabHint } from "../types";
import {
  practiceReducer,
  createInitialPracticeState,
} from "@/core/practiceReducer";
import { resolvePracticeFeedback } from "@/core/practiceFeedback";
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
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const resultHeaderRef = useRef<HTMLDivElement>(null);

  const [state, dispatch] = useReducer(
    practiceReducer,
    createInitialPracticeState(questions.length)
  );

  const currentQuestion = questions[state.currentIndex];
  const isLastQuestion = state.currentIndex === state.totalQuestions - 1;

  // Xử lý nộp bài
  const handleSubmit = useCallback(async () => {
    if (
      state.selectedIndex === null ||
      (state.status !== "answering" && state.status !== "error")
    ) {
      return;
    }

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
      document.getElementById("main-content")?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isLastQuestion, sessionId, router]);

  // Hỗ trợ phím tắt bàn phím (A, B, C, D và Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Chặn phím tắt khi modal đang mở
      if (isReportOpen || isVocabOpen) {
        return;
      }

      if (e.isComposing || e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      // 2. Chặn phím tắt khi đang nhập liệu hoặc bên trong bất kỳ dialog nào
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable ||
        target?.closest?.('[role="dialog"]') ||
        target?.closest?.("dialog")
      ) {
        return;
      }

      const interactiveControl = target?.closest?.(
        'button, a[href], summary, [role="button"], [role="link"], [role="tab"], [role="menuitem"]'
      );
      const isRadioOption = Boolean(target?.closest?.('[role="radio"]'));

      if (state.status === "answering" || state.status === "error") {
        if (e.key === "a" || e.key === "A" || e.key === "1") {
          dispatch({ type: "SELECT_OPTION", payload: { index: 0 } });
        } else if (e.key === "b" || e.key === "B" || e.key === "2") {
          dispatch({ type: "SELECT_OPTION", payload: { index: 1 } });
        } else if (e.key === "c" || e.key === "C" || e.key === "3") {
          dispatch({ type: "SELECT_OPTION", payload: { index: 2 } });
        } else if (e.key === "d" || e.key === "D" || e.key === "4") {
          dispatch({ type: "SELECT_OPTION", payload: { index: 3 } });
        } else if (e.key === "Enter") {
          if (interactiveControl && !isRadioOption) {
            return;
          }
          if (!e.repeat && state.selectedIndex !== null) {
            e.preventDefault();
            handleSubmit();
          }
        }
      } else if (state.status === "feedback") {
        if (e.key === "Enter") {
          // Khi focus ở nút mở/đóng lời giải hoặc nút thao tác khác, để trình duyệt kích hoạt nút thay vì chuyển câu
          if (interactiveControl) {
            return;
          }
          if (!e.repeat) {
            e.preventDefault();
            handleNext();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.status, state.selectedIndex, isReportOpen, isVocabOpen, handleSubmit, handleNext]);

  // Chuyển focus hỗ trợ Screen Reader & Bàn phím khi có kết quả
  useEffect(() => {
    if (state.status === "feedback") {
      resultHeaderRef.current?.focus();
    }
  }, [state.status]);

  const isFeedback = state.status === "feedback" && state.currentResult !== null;
  const effectiveSelectedIndex =
    isFeedback &&
    state.currentResult &&
    state.currentResult.selected_index >= 0 &&
    state.currentResult.selected_index <= 3
      ? state.currentResult.selected_index
      : state.selectedIndex;

  const feedback =
    isFeedback && state.currentResult
      ? resolvePracticeFeedback({
          isCorrect: state.currentResult.is_correct,
          selectedIndex: effectiveSelectedIndex,
          correctIndex: state.currentResult.correct_index,
          explanation: state.currentResult.explanation,
        })
      : null;

  // Xác định trạng thái hiển thị của từng option
  const getOptionState = (index: number): OptionState => {
    if (isFeedback && state.currentResult) {
      if (index === state.currentResult.correct_index) {
        return "correct";
      }
      if (
        index === effectiveSelectedIndex &&
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

  if (!currentQuestion) {
    return (
      <div className="min-h-dvh bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center space-y-4 shadow-xs">
          <h2 className="text-lg font-bold text-[#0F172A]">
            Không tìm thấy câu hỏi trong phiên luyện tập
          </h2>
          <p className="text-xs text-[#475569] leading-relaxed">
            Phiên luyện tập này chưa có câu hỏi nào hoặc đã hết hạn. Vui lòng khởi tạo một phiên mới.
          </p>
          <Button
            type="button"
            variant="primary"
            onClick={() => router.push("/practice/new")}
          >
            Tạo phiên luyện tập mới
          </Button>
        </div>
      </div>
    );
  }

  const options = [
    { label: "A" as const, text: currentQuestion.option_a },
    { label: "B" as const, text: currentQuestion.option_b },
    { label: "C" as const, text: currentQuestion.option_c },
    { label: "D" as const, text: currentQuestion.option_d },
  ];

  return (
    <div className="min-h-dvh bg-[#F8FAFC] pb-28 pt-20">
      {/* Thông báo Screen Reader Live Region */}
      <div className="sr-only" aria-live="polite">
        {isFeedback && state.currentResult && (
          state.currentResult.is_correct
            ? `Câu ${state.currentIndex + 1}: Đúng. Đáp án chính xác là phương án ${String.fromCharCode(65 + state.currentResult.correct_index)}.`
            : `Câu ${state.currentIndex + 1}: Chưa chính xác. Đáp án chính xác là phương án ${String.fromCharCode(65 + state.currentResult.correct_index)}.`
        )}
      </div>

      {/* 1. Header tập trung */}
      <FocusedHeader
        currentIndex={state.currentIndex}
        totalQuestions={state.totalQuestions}
        isAnswered={isFeedback}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        {/* 2. Tiêu đề câu hỏi */}
        <div className="space-y-3">
          {/* Header trạng thái chỉ hiển thị sau khi server chấm xong */}
          {isFeedback && state.currentResult ? (
            <div
              ref={resultHeaderRef}
              tabIndex={-1}
              className="flex flex-wrap items-center justify-between gap-2 outline-none"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="sr-only">
                  Kết quả: {state.currentResult.is_correct ? "Đúng" : "Chưa chính xác"}
                </span>
                {state.currentResult.is_correct ? (
                  <>
                    <CheckCircle2
                      className="w-5 h-5 text-[var(--status-success-text)] shrink-0"
                      aria-hidden="true"
                    />
                    <span className="font-bold text-[var(--color-text-primary)] text-base">
                      Câu {state.currentIndex + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold text-white bg-[var(--status-success-text)] select-none font-mono tracking-wide">
                      ĐÚNG
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle
                      className="w-5 h-5 text-[var(--status-error-text)] shrink-0"
                      aria-hidden="true"
                    />
                    <span className="font-bold text-[var(--color-text-primary)] text-base">
                      Câu {state.currentIndex + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold text-white bg-[var(--status-error-text)] select-none font-mono tracking-wide">
                      SAI
                    </span>
                  </>
                )}
                <span className="text-xs text-[var(--color-text-secondary)] ml-1 font-mono hidden sm:inline">
                  {currentQuestion.tag_name_vi}
                </span>
              </div>

              {/* Nhóm nút phụ sau khi nộp: Lưu từ vựng & Báo lỗi (§5.5 & PD-01) */}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVocabHint(null);
                    setIsVocabOpen(true);
                  }}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-primary-default)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-primary-subtle)] transition-colors cursor-pointer border border-[var(--color-border-input)]"
                  title="Lưu từ vựng vào Sổ cá nhân"
                >
                  <BookmarkPlus
                    className="w-3.5 h-3.5 text-[var(--color-primary-default)]"
                    aria-hidden="true"
                  />
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
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg-surface)] hover:text-[var(--status-error-text)] hover:bg-[var(--status-error-bg)] transition-colors cursor-pointer border border-[var(--color-border-input)]"
                  title="Báo cáo lỗi câu hỏi này"
                >
                  <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Báo lỗi</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-primary-subtle)] text-[var(--color-primary-default)] border border-[var(--color-border-default)] font-mono">
                {currentQuestion.tag_name_vi}
              </span>
              <span className="text-xs text-[var(--color-text-secondary)] font-mono">
                Câu {state.currentIndex + 1} / {state.totalQuestions}
              </span>
            </div>
          )}

          {/* Stem giữ nguyên văn bản thuần (chưa gạch chân dấu hiệu trong đợt này) */}
          <div className="p-1">
            <h2 className="text-[18px] sm:text-[20px] font-semibold text-[var(--color-text-primary)] leading-[1.6] tracking-[-0.01em] break-words">
              {currentQuestion.stem}
            </h2>
          </div>
        </div>

        {/* 3. 4 Phương án theo đúng thứ tự A–D; đặt lời giải của phương án đã chọn ngay bên dưới khi sai */}
        <div
          role="radiogroup"
          aria-label="Các phương án trả lời"
          className="space-y-3"
        >
          {options.map((opt, index) => {
            const optionState = getOptionState(index);
            const optionBadge = isFeedback
              ? optionState === "incorrect"
                ? "Bạn chọn · Sai"
                : optionState === "correct"
                  ? "Đáp án đúng"
                  : undefined
              : undefined;
            const inlineFeedback =
              feedback?.inlineSelectedFeedback?.optionIndex === index
                ? feedback.inlineSelectedFeedback
                : null;

            return (
              <div key={opt.label} data-option-label={opt.label} className="space-y-2">
                <AnswerOption
                  label={opt.label}
                  text={opt.text}
                  state={optionState}
                  badgeText={optionBadge}
                  isSelected={effectiveSelectedIndex === index}
                  disabled={state.status === "submitting" || state.status === "feedback"}
                  onClick={() =>
                    dispatch({ type: "SELECT_OPTION", payload: { index } })
                  }
                />

                {inlineFeedback && (
                  <div
                    data-testid="selected-option-feedback"
                    role="region"
                    aria-label={inlineFeedback.heading}
                    className={`rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] border-l-4 px-4 py-3 space-y-1 ${
                      inlineFeedback.kind === "selected_option"
                        ? "border-l-[var(--status-error-text)]"
                        : "border-l-[var(--status-success-text)]"
                    }`}
                  >
                    <div
                      className={`text-[11px] font-mono font-bold uppercase tracking-[0.06em] ${
                        inlineFeedback.kind === "selected_option"
                          ? "text-[var(--status-error-text)]"
                          : "text-[var(--status-success-text)]"
                      }`}
                    >
                      {inlineFeedback.heading}
                    </div>
                    <p className="text-[14px] sm:text-[15px] text-[var(--color-text-primary)] leading-[1.6] break-words">
                      {inlineFeedback.body}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Lỗi mạng (nếu có) */}
        {state.status === "error" && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-[var(--status-error-bg)] border border-[var(--status-error-text)] text-sm text-[var(--status-error-text)] flex flex-wrap items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold">[!]</span>
              <span>{state.errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className="min-h-[44px] px-3 text-xs font-bold underline cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* 4. Khối giải thích tổng hợp & mở rộng (chỉ hiển thị sau khi server chấm xong) */}
        {isFeedback && state.currentResult && feedback && (
          <div className="space-y-4">
            <AdaptiveExplanation
              key={currentQuestion.id}
              isCorrect={state.currentResult.is_correct}
              explanation={state.currentResult.explanation}
              showWhyCorrect={feedback.showWhyCorrectInSummary}
              correctOptionLabel={feedback.correctLabel ?? undefined}
              collapseTranslation={true}
              remainingOptionAnalyses={feedback.remainingOptionAnalyses}
              optionTexts={{
                A: currentQuestion.option_a,
                B: currentQuestion.option_b,
                C: currentQuestion.option_c,
                D: currentQuestion.option_d,
              }}
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
                <div className="p-3.5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] space-y-2">
                  <div className="text-[11px] font-mono font-bold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] flex items-center gap-1.5">
                    <Sparkles
                      className="w-3.5 h-3.5 text-[var(--color-primary-default)]"
                      aria-hidden="true"
                    />
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
                        className="min-h-[44px] px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--color-bg-page)] hover:bg-[var(--color-primary-subtle)] border border-[var(--color-border-default)] hover:border-[var(--color-primary-default)] text-[var(--color-text-primary)] hover:text-[var(--color-primary-default)] transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <BookmarkPlus
                          className="w-3.5 h-3.5 text-[var(--color-primary-default)]"
                          aria-hidden="true"
                        />
                        <span className="font-semibold">{hint.word}</span>
                        <span className="text-[var(--color-text-secondary)]">
                          ({hint.meaning_vi})
                        </span>
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
          Sticky Action Bar (72px + Safe Area Inset)
          ======================================================== */}
      <footer className="fixed bottom-0 left-0 right-0 h-[calc(4.5rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] bg-white border-t border-[#E2E8F0] z-30 px-4 sm:px-6 shadow-sm">
        <div className="max-w-3xl mx-auto h-full flex items-center justify-between">
          <div className="hidden sm:block text-xs font-mono text-[var(--color-text-secondary)]">
            {(state.status === "answering" || state.status === "error") &&
              "Phím A-D: chọn • Enter: nộp bài"}
            {state.status === "feedback" &&
              "Tab: chọn nút • Enter: mở lời giải hoặc sang câu tiếp"}
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
                ref={nextButtonRef}
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
