"use client";

import { useId, useState } from "react";
import {
  checkFillBlankAnswer,
  isFillBlankExercise,
  type LessonFillBlankExercise,
  type LessonMcqExercise,
  type LessonPracticeExercise,
} from "@/core/lessonExerciseUtils";
import type { StoredExerciseAttempt } from "@/features/learn/lib/learn-progress-storage";
import {
  CheckCircle2,
  HelpCircle,
  PencilLine,
  RotateCcw,
  XCircle,
} from "lucide-react";

const OPTION_KEYS = ["A", "B", "C", "D"] as const;

function parseOptionParts(rawOption: string, idx: number) {
  const match = rawOption.trim().match(/^([A-D])[\.\)]\s*(.+)$/);
  return {
    keycap: match ? match[1] : OPTION_KEYS[idx] ?? String(idx + 1),
    label: match ? match[2] : rawOption,
  };
}

interface LessonExerciseListProps {
  exercises: LessonPracticeExercise[];
  solvedMap: Record<string, StoredExerciseAttempt>;
  onExerciseSolved: (
    exerciseId: string,
    attempt: StoredExerciseAttempt
  ) => void;
  onExerciseReset: (exerciseId: string) => void;
  title?: string;
}

export function LessonExerciseList({
  exercises,
  solvedMap,
  onExerciseSolved,
  onExerciseReset,
  title = "Thực hành áp dụng ngay",
}: LessonExerciseListProps) {
  if (exercises.length === 0) return null;

  const solvedCount = exercises.filter((ex) => ex.id in solvedMap).length;
  const correctCount = exercises.filter(
    (ex) => solvedMap[ex.id]?.isCorrect
  ).length;
  const allSolved = solvedCount === exercises.length;

  return (
    <section
      aria-label={title}
      className="p-4 sm:p-6 rounded-xl bg-[#FAFAF7] border border-[#E2E8F0] space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#E2E8F0] pb-3.5">
        <div className="flex items-start sm:items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shrink-0">
            <HelpCircle className="w-4 h-4" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-[15px] sm:text-[16px] font-bold text-[#0F172A]">
              {title} ({exercises.length} câu)
            </h3>
            <p className="text-[12px] text-[#475569]">
              Kết hợp Chọn đáp án &amp; Điền từ chủ động — lưu tiến độ tại trình duyệt, không ảnh hưởng điểm thống kê
            </p>
          </div>
        </div>

        <span
          className={`text-[12px] font-mono font-semibold tabular-nums self-start sm:self-center px-2.5 py-1 rounded-md border shrink-0 ${
            allSolved
              ? "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]"
              : "bg-white text-[#0F172A] border-[#E2E8F0]"
          }`}
        >
          {allSolved ? "[✓] " : ""}
          {solvedCount}/{exercises.length} câu
          {solvedCount > 0 ? ` · ${correctCount} đúng` : ""}
        </span>
      </div>

      <div className="space-y-4">
        {exercises.map((exercise, index) =>
          isFillBlankExercise(exercise) ? (
            <SingleFillBlankExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index}
              persistedAttempt={solvedMap[exercise.id]}
              onSolved={(typedAnswer, isCorrect) =>
                onExerciseSolved(exercise.id, { isCorrect, typedAnswer })
              }
              onReset={() => onExerciseReset(exercise.id)}
            />
          ) : (
            <SingleMcqExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index}
              persistedAttempt={solvedMap[exercise.id]}
              onSolved={(selectedIdx, isCorrect) =>
                onExerciseSolved(exercise.id, {
                  isCorrect,
                  selectedIndex: selectedIdx,
                })
              }
              onReset={() => onExerciseReset(exercise.id)}
            />
          )
        )}
      </div>

      {allSolved && (
        <div
          aria-live="polite"
          className={`p-3.5 rounded-lg border text-[13px] flex flex-wrap items-center justify-between gap-2 ${
            correctCount === exercises.length
              ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#047857]"
              : "bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]"
          }`}
        >
          <div className="font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>
              Hoàn thành phần thực hành ({correctCount}/{exercises.length} câu đúng).
              {correctCount < exercises.length
                ? " Bạn có thể bấm Làm lại ở câu chưa đúng hoặc chuyển tiếp."
                : " Sẵn sàng sang bước tiếp theo."}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

function ExerciseStatusBadge({ isCorrect }: { isCorrect: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${
        isCorrect
          ? "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]"
          : "bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]"
      }`}
    >
      {isCorrect ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>[✓] Chính xác</span>
        </>
      ) : (
        <>
          <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>[✗] Chưa đúng</span>
        </>
      )}
    </span>
  );
}

function ExerciseExplanationBox({
  steps,
  onReset,
}: {
  steps: string[];
  onReset: () => void;
}) {
  return (
    <div
      aria-live="polite"
      className="p-3.5 sm:p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] border-l-4 border-l-[#2563EB] space-y-2.5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-[0.06em] text-[#2563EB]">
          Giải thích từng bước
        </span>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 min-h-[44px] px-3 -my-2 rounded-lg text-[12px] font-semibold text-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Làm lại</span>
        </button>
      </div>
      <ul className="space-y-1.5">
        {steps.map((stepText, sIdx) => (
          <li
            key={sIdx}
            className="text-[13px] sm:text-[14px] text-[#0F172A] leading-[1.6]"
          >
            {stepText}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Thẻ câu hỏi Chọn đáp án (MCQ Keycap A/B/C/D).
 */
function SingleMcqExerciseCard({
  exercise,
  index,
  persistedAttempt,
  onSolved,
  onReset,
}: {
  exercise: LessonMcqExercise;
  index: number;
  persistedAttempt?: StoredExerciseAttempt;
  onSolved: (selectedIndex: number, isCorrect: boolean) => void;
  onReset: () => void;
}) {
  const [draftSelectedIndex, setDraftSelectedIndex] = useState<number | null>(
    null
  );

  const isSubmitted =
    persistedAttempt !== undefined &&
    typeof persistedAttempt.selectedIndex === "number";
  const selectedIndex = isSubmitted
    ? (persistedAttempt.selectedIndex as number)
    : draftSelectedIndex;
  const isCorrect = isSubmitted
    ? persistedAttempt.isCorrect
    : selectedIndex === exercise.correctIndex;

  const handleCheck = () => {
    if (draftSelectedIndex === null || isSubmitted) return;
    onSolved(
      draftSelectedIndex,
      draftSelectedIndex === exercise.correctIndex
    );
  };

  const handleReset = () => {
    setDraftSelectedIndex(null);
    onReset();
  };

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E2E8F0] space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="px-2 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0] text-[10px] font-mono font-bold uppercase tracking-wider text-[#475569]">
            Chọn đáp án
          </span>
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.06em] text-[#2563EB]">
            Câu {String(index + 1).padStart(2, "0")} · {exercise.skillFocus}
          </span>
        </div>

        {isSubmitted && <ExerciseStatusBadge isCorrect={isCorrect} />}
      </div>

      <p className="text-[15px] sm:text-[16px] font-medium text-[#0F172A] leading-[1.6]">
        {exercise.questionStem}
      </p>

      <div
        role="radiogroup"
        aria-label={`Lựa chọn cho câu ${index + 1}`}
        className="grid sm:grid-cols-2 gap-2.5"
      >
        {exercise.options.map((opt, optIdx) => {
          const { keycap, label } = parseOptionParts(opt, optIdx);
          const isOptionCorrect = optIdx === exercise.correctIndex;
          const isOptionSelected = selectedIndex === optIdx;

          let cardClass =
            "bg-white border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#8190A6] cursor-pointer";
          let keycapClass =
            "bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0]";

          if (isSubmitted) {
            if (isOptionCorrect) {
              cardClass =
                "bg-[#ECFDF5] border-[#047857] text-[#047857] font-semibold";
              keycapClass = "bg-[#047857] text-white";
            } else if (isOptionSelected) {
              cardClass =
                "bg-[#FFF1F2] border-[#BE123C] text-[#BE123C] font-medium";
              keycapClass = "bg-[#BE123C] text-white";
            } else {
              cardClass =
                "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] opacity-60";
              keycapClass =
                "bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]";
            }
          } else if (isOptionSelected) {
            cardClass =
              "bg-[#EFF6FF] border-[#2563EB] text-[#0F172A] font-semibold";
            keycapClass = "bg-[#2563EB] text-white";
          }

          return (
            <button
              key={optIdx}
              type="button"
              role="radio"
              aria-checked={isOptionSelected}
              disabled={isSubmitted}
              onClick={() => {
                if (!isSubmitted) setDraftSelectedIndex(optIdx);
              }}
              className={`min-h-[50px] px-3 py-2.5 rounded-lg border flex items-center justify-between gap-2.5 text-left transition-colors ${cardClass}`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-7 h-7 rounded-md font-mono text-[12px] font-bold flex items-center justify-center shrink-0 ${keycapClass}`}
                >
                  {keycap}
                </span>
                <span className="text-[14px] leading-snug break-words">
                  {label}
                </span>
              </span>

              {isSubmitted && isOptionCorrect && (
                <span className="text-[11px] font-mono font-bold shrink-0">
                  [✓] Đúng
                </span>
              )}
              {isSubmitted && isOptionSelected && !isOptionCorrect && (
                <span className="text-[11px] font-mono font-bold shrink-0">
                  [✗] Đã chọn
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-2 border-t border-[#F1F5F9]">
        {!isSubmitted ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <span className="text-[12px] text-[#475569]">
              {selectedIndex === null
                ? "Chọn một phương án A–D để kiểm tra"
                : `Đã chọn phương án ${OPTION_KEYS[selectedIndex] ?? ""}`}
            </span>
            <button
              type="button"
              disabled={selectedIndex === null}
              onClick={handleCheck}
              className="min-h-[44px] px-5 rounded-lg bg-[#0F172A] hover:bg-[#0F172A]/90 text-white text-[13px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 w-full sm:w-auto"
            >
              Kiểm tra đáp án
            </button>
          </div>
        ) : (
          <ExerciseExplanationBox
            steps={exercise.explanationStepByStep}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Thẻ câu hỏi Điền từ vào chỗ trống (Active Recall).
 */
function SingleFillBlankExerciseCard({
  exercise,
  index,
  persistedAttempt,
  onSolved,
  onReset,
}: {
  exercise: LessonFillBlankExercise;
  index: number;
  persistedAttempt?: StoredExerciseAttempt;
  onSolved: (typedAnswer: string, isCorrect: boolean) => void;
  onReset: () => void;
}) {
  const inputId = useId();
  const [draftTyped, setDraftTyped] = useState("");

  const isSubmitted =
    persistedAttempt !== undefined &&
    typeof persistedAttempt.typedAnswer === "string";
  const displayedAnswer = isSubmitted
    ? (persistedAttempt.typedAnswer as string)
    : draftTyped;
  const isCorrect = isSubmitted ? persistedAttempt.isCorrect : false;
  const canonicalAnswer = exercise.acceptedAnswers[0] ?? "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitted) return;
    const trimmed = draftTyped.trim();
    if (!trimmed) return;
    const ok = checkFillBlankAnswer(trimmed, exercise.acceptedAnswers);
    onSolved(trimmed, ok);
  };

  const handleReset = () => {
    setDraftTyped("");
    onReset();
  };

  // Hiển thị chỗ trống trực quan ngay trong câu hỏi
  const stemParts = exercise.questionStem.split("_______");

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E2E8F0] space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[10px] font-mono font-bold uppercase tracking-wider text-[#2563EB]">
            <PencilLine className="w-3 h-3" aria-hidden="true" />
            <span>Điền từ</span>
          </span>
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.06em] text-[#2563EB]">
            Câu {String(index + 1).padStart(2, "0")} · {exercise.skillFocus}
          </span>
        </div>

        {isSubmitted && <ExerciseStatusBadge isCorrect={isCorrect} />}
      </div>

      <p className="text-[15px] sm:text-[16px] font-medium text-[#0F172A] leading-[1.7]">
        {stemParts.map((part, pIdx) => (
          <span key={pIdx}>
            <span>{part}</span>
            {pIdx < stemParts.length - 1 && (
              <span
                className={`inline-block mx-1 px-2.5 py-0.5 rounded font-mono text-[14px] font-bold border align-baseline ${
                  isSubmitted
                    ? isCorrect
                      ? "bg-[#ECFDF5] text-[#047857] border-[#047857]"
                      : "bg-[#FFF1F2] text-[#BE123C] border-[#BE123C] line-through"
                    : displayedAnswer.trim()
                    ? "bg-[#EFF6FF] text-[#2563EB] border-[#2563EB]"
                    : "bg-[#F1F5F9] text-[#475569] border-dashed border-[#8190A6]"
                }`}
              >
                {displayedAnswer.trim() || "_______"}
              </span>
            )}
          </span>
        ))}
        {exercise.wordCue && (
          <span className="inline-flex items-center ml-1.5 px-2 py-0.5 rounded bg-[#FFFBEB] border border-[#FDE68A] text-[12px] font-mono font-semibold text-[#B45309]">
            ({exercise.wordCue})
          </span>
        )}
      </p>

      {!isSubmitted ? (
        <form
          onSubmit={handleSubmit}
          className="pt-2 border-t border-[#F1F5F9] space-y-2.5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor={inputId}
              className="text-[12px] font-semibold text-[#475569]"
            >
              Nhập từ / cụm từ chính xác:
            </label>
            {exercise.wordCue && (
              <span className="text-[11px] font-mono text-[#475569]">
                Gợi ý gốc: <strong className="text-[#0F172A]">{exercise.wordCue}</strong>
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <input
              id={inputId}
              type="text"
              value={draftTyped}
              onChange={(e) => setDraftTyped(e.target.value)}
              placeholder="Gõ đáp án tiếng Anh rồi nhấn Enter..."
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="flex-1 min-h-[44px] px-3.5 rounded-lg bg-white border border-[#8190A6] text-base sm:text-[14px] font-mono text-[#0F172A] placeholder:text-[#475569]/65 focus:outline-hidden focus:border-[#2563EB]"
            />
            <button
              type="submit"
              disabled={!draftTyped.trim()}
              className="min-h-[44px] px-5 rounded-lg bg-[#0F172A] hover:bg-[#0F172A]/90 text-white text-[13px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 w-full sm:w-auto"
            >
              Kiểm tra đáp án
            </button>
          </div>
        </form>
      ) : (
        <div className="pt-2 border-t border-[#F1F5F9] space-y-2.5">
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            <span className="text-[#475569]">Bạn đã điền:</span>
            <span
              className={`px-2.5 py-0.5 rounded font-mono font-bold border ${
                isCorrect
                  ? "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]"
                  : "bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]"
              }`}
            >
              {displayedAnswer}
            </span>
            {!isCorrect && (
              <>
                <span className="text-[#475569]">· Đáp án chuẩn:</span>
                <span className="px-2.5 py-0.5 rounded font-mono font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                  {canonicalAnswer}
                </span>
              </>
            )}
          </div>

          <ExerciseExplanationBox
            steps={exercise.explanationStepByStep}
            onReset={handleReset}
          />
        </div>
      )}
    </div>
  );
}
