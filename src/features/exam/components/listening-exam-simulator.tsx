"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { submitListeningExamAction } from "../actions";
import { useExamTimer } from "../hooks/use-exam-timer";
import { ExamSubmitModal } from "./exam-submit-modal";
import {
  ListeningAudioPlayer,
  type SpeechSegment,
} from "./listening-audio-player";
import { ListeningResultView } from "./listening-result-view";
import type {
  ExamListeningData,
  ExamListeningEvaluation,
  ListeningGroupItem,
  ListeningQuestionItem,
} from "../types";
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  Flag,
  Image as ImageIcon,
  Loader2,
  Send,
} from "lucide-react";

interface ListeningExamSimulatorProps {
  examData: ExamListeningData;
}

const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

export function ListeningExamSimulator({
  examData,
}: ListeningExamSimulatorProps) {
  const { questions, groups, totalQuestions, durationMinutes, title, examSetId } =
    examData;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(() => new Set());
  const [showTranscript, setShowTranscript] = useState(false);
  const [paletteFilter, setPaletteFilter] = useState<
    "all" | "p1" | "p2" | "p3" | "p4" | "flagged" | "unanswered"
  >("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<ExamListeningEvaluation | null>(
    null
  );
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const currentQuestion: ListeningQuestionItem | undefined = questions[currentIdx];

  const groupMap = useMemo(() => {
    const map = new Map<string, ListeningGroupItem>();
    for (const g of groups) {
      map.set(g.id, g);
    }
    return map;
  }, [groups]);

  const currentGroup = currentQuestion?.groupId
    ? groupMap.get(currentQuestion.groupId)
    : undefined;

  const groupQuestions = useMemo(() => {
    if (!currentQuestion) return [];
    if (
      (currentQuestion.part === 3 || currentQuestion.part === 4) &&
      currentGroup
    ) {
      return currentGroup.questionIds
        .map((id) => questions.find((q) => q.id === id))
        .filter((q): q is ListeningQuestionItem => Boolean(q));
    }
    return [currentQuestion];
  }, [currentQuestion, currentGroup, questions]);

  const audioSegments = useMemo((): SpeechSegment[] => {
    if (!currentQuestion) return [];
    if (currentQuestion.part === 1) {
      return currentQuestion.options.map((opt, idx) => ({
        text: `(${OPTION_LETTERS[idx]}) ${opt}`,
      }));
    }
    if (currentQuestion.part === 2) {
      return [
        { text: currentQuestion.stem },
        ...currentQuestion.options.map((opt, idx) => ({
          text: `(${OPTION_LETTERS[idx]}) ${opt}`,
        })),
      ];
    }
    if (currentQuestion.part === 3 && currentGroup?.lines?.length) {
      return currentGroup.lines.map((l) => ({
        speaker: l.speaker,
        text: l.text,
      }));
    }
    if (currentQuestion.part === 4 && currentGroup?.script) {
      return [
        {
          speaker: currentGroup.speaker || "M",
          text: currentGroup.script,
        },
      ];
    }
    return [{ text: currentQuestion.stem }];
  }, [currentQuestion, currentGroup]);

  const latestAnswersRef = useRef(userAnswers);
  useEffect(() => {
    latestAnswersRef.current = userAnswers;
  }, [userAnswers]);

  const handleAutoSubmit = useCallback(async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await submitListeningExamAction({
        examSetId,
        userAnswers: latestAnswersRef.current,
        timeSpentSeconds: durationMinutes * 60,
      });
      if (res.success && res.evaluation) {
        setEvaluation(res.evaluation);
      } else {
        setSubmitError(
          res.error ||
            "Không thể tự động nộp bài khi hết giờ. Đáp án vẫn được giữ nguyên, vui lòng bấm Nộp bài."
        );
      }
    } catch {
      setSubmitError(
        "Lỗi kết nối máy chủ khi tự động nộp bài. Vui lòng bấm Nộp bài để thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [examSetId, durationMinutes]);

  const { timeLeft, formattedTime, timerColorClass, resetTimer } = useExamTimer({
    durationMinutes,
    onTimeUp: handleAutoSubmit,
    isPaused: !!evaluation || isSubmitting,
  });

  const answeredCount = useMemo(
    () => Object.keys(userAnswers).length,
    [userAnswers]
  );

  const filteredNavQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (paletteFilter === "p1") return q.part === 1;
      if (paletteFilter === "p2") return q.part === 2;
      if (paletteFilter === "p3") return q.part === 3;
      if (paletteFilter === "p4") return q.part === 4;
      if (paletteFilter === "flagged") return flaggedIds.has(q.id);
      if (paletteFilter === "unanswered") return userAnswers[q.id] === undefined;
      return true;
    });
  }, [questions, paletteFilter, flaggedIds, userAnswers]);

  const handleSelectOption = (qId: string, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: optionIndex,
    }));
  };

  const handleToggleFlag = (qId: string) => {
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const handleSubmitExam = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    setShowSubmitModal(false);
    const timeSpent = durationMinutes * 60 - timeLeft;

    try {
      const res = await submitListeningExamAction({
        examSetId,
        userAnswers,
        timeSpentSeconds: timeSpent,
      });
      if (res.success && res.evaluation) {
        setEvaluation(res.evaluation);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setSubmitError(res.error || "Không thể chấm bài thi Listening lúc này.");
      }
    } catch {
      setSubmitError("Lỗi kết nối máy chủ khi nộp bài Listening.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setEvaluation(null);
    setUserAnswers({});
    setFlaggedIds(new Set());
    setCurrentIdx(0);
    setSubmitError(null);
    resetTimer();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (evaluation) {
    return (
      <ListeningResultView
        examTitle={title}
        evaluation={evaluation}
        onRetake={handleRetake}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="p-8 text-center text-[#475569]">
        Không tìm thấy dữ liệu câu hỏi Listening cho đề thi này.
      </div>
    );
  }

  const playerKey = currentGroup?.id || currentQuestion.id;

  return (
    <div className="min-h-dvh bg-[#F8FAFC] flex flex-col">
      {/* Focused Header (Sticky Top) */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] px-4 md:px-6 h-14 flex items-center justify-between shadow-2xs gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/exam"
            className="min-h-[44px] px-2.5 rounded-lg hover:bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A] transition-colors inline-flex items-center gap-1.5 text-xs font-medium shrink-0"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Thoát</span>
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-[#0F172A] truncate">
              {title} · Listening
            </h1>
            <div className="text-[11px] font-mono text-[#475569] flex items-center gap-2 tabular-nums">
              <span>Part {currentQuestion.part}</span>
              <span>•</span>
              <span>
                Đã làm: <strong>{answeredCount}/{totalQuestions}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div
            className={`px-3 py-1.5 rounded-lg border border-[#E2E8F0] flex items-center gap-2 font-mono text-sm font-bold tabular-nums ${timerColorClass}`}
          >
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span>{formattedTime}</span>
          </div>

          <Button
            onClick={() => setShowSubmitModal(true)}
            disabled={isSubmitting}
            variant="primary"
            className="h-10 px-4 text-xs sm:text-sm font-semibold"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="w-4 h-4" aria-hidden="true" />
            )}
            <span>Nộp bài</span>
          </Button>
        </div>
      </header>

      {submitError && (
        <div className="max-w-7xl w-full mx-auto px-4 md:px-6 pt-4">
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-xs sm:text-sm text-[#BE123C] flex items-center gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="flex-1">{submitError}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cột trái (8/12): Audio player + Context + Câu hỏi */}
        <div className="lg:col-span-8 space-y-5">
          <Card className="p-5 sm:p-6 bg-white border border-[#E2E8F0] shadow-2xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-[#EFF6FF] text-[#2563EB] text-xs font-mono font-bold tabular-nums">
                  {groupQuestions.length > 1
                    ? `Câu ${groupQuestions[0].questionNumber}–${
                        groupQuestions[groupQuestions.length - 1].questionNumber
                      }`
                    : `Câu ${currentQuestion.questionNumber}`}
                </span>
                <span className="text-xs font-medium text-[#475569]">
                  Part {currentQuestion.part}
                </span>
              </div>

              <button
                type="button"
                aria-pressed={showTranscript}
                onClick={() => setShowTranscript((prev) => !prev)}
                className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium border inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showTranscript
                    ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
                    : "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:text-[#0F172A]"
                }`}
              >
                {showTranscript ? (
                  <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>
                  {showTranscript
                    ? "Ẩn transcript tự học"
                    : "Hiện transcript hỗ trợ tự học"}
                </span>
              </button>
            </div>

            {/* Trình phát audio cho Part 1-4 */}
            <ListeningAudioPlayer
              key={playerKey}
              title={
                currentGroup?.title ||
                `Câu ${currentQuestion.questionNumber} (Part ${currentQuestion.part})`
              }
              audioUrl={currentGroup?.audioUrl || currentQuestion.audioUrl}
              segments={audioSegments}
            />

            {/* Part 1: Mô tả cảnh quan hoặc ảnh minh họa */}
            {currentQuestion.part === 1 && (
              <div className="p-4 rounded-xl bg-[#FAFAF7] border border-[#E2E8F0] space-y-2.5">
                {currentQuestion.imageUrl && (
                  // Ảnh đề thi từ URL động chưa cố định domain CDN trong next.config
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentQuestion.imageUrl}
                    alt={`Hình minh họa câu ${currentQuestion.questionNumber}`}
                    className="w-full max-h-72 object-contain rounded-lg border border-[#E2E8F0] bg-white"
                  />
                )}
                <div className="flex items-start gap-2 text-xs sm:text-sm text-[#0F172A] leading-relaxed">
                  <ImageIcon
                    className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <span className="font-bold text-[#0F172A]">
                      Ngữ cảnh bức tranh:{" "}
                    </span>
                    <span className="text-[#475569]">
                      {currentQuestion.scene ||
                        "Quan sát tình huống và nghe 4 lựa chọn A/B/C/D."}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Transcript tùy chọn cho tự học (Tắt mặc định) */}
            {showTranscript && (
              <div className="p-4 rounded-xl bg-[#FAFAF7] border border-[#E2E8F0] space-y-2 text-xs sm:text-sm text-[#0F172A]">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2563EB]">
                  Transcript tự học
                </div>
                {currentQuestion.part === 1 && (
                  <ul className="space-y-1 text-[#475569]">
                    {currentQuestion.options.map((opt, idx) => (
                      <li key={idx}>
                        <strong className="font-mono text-[#0F172A]">
                          ({OPTION_LETTERS[idx]})
                        </strong>{" "}
                        {opt}
                      </li>
                    ))}
                  </ul>
                )}
                {currentQuestion.part === 2 && (
                  <div className="space-y-1.5 text-[#475569]">
                    <p className="font-semibold text-[#0F172A]">
                      Câu hỏi: {currentQuestion.stem}
                    </p>
                    {currentQuestion.options.map((opt, idx) => (
                      <div key={idx}>
                        <strong className="font-mono text-[#0F172A]">
                          ({OPTION_LETTERS[idx]})
                        </strong>{" "}
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
                {currentQuestion.part === 3 && currentGroup?.lines && (
                  <div className="space-y-1.5 text-[#475569]">
                    {currentGroup.lines.map((line, lIdx) => (
                      <p key={lIdx}>
                        <strong className="font-mono text-[#0F172A]">
                          {line.speaker}:
                        </strong>{" "}
                        {line.text}
                      </p>
                    ))}
                  </div>
                )}
                {currentQuestion.part === 4 && currentGroup?.script && (
                  <p className="text-[#475569] leading-relaxed">
                    {currentGroup.script}
                  </p>
                )}
              </div>
            )}

            {/* Danh sách câu hỏi trong nhóm (1 câu với Part 1/2, 3 câu với Part 3/4) */}
            <div className="space-y-6">
              {groupQuestions.map((q) => {
                const qIndex = questions.findIndex((item) => item.id === q.id);
                const selectedIdx = userAnswers[q.id];
                const isFlagged = flaggedIds.has(q.id);
                const hideStemInAudio =
                  (q.part === 1 || q.part === 2) && !showTranscript;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border transition-colors space-y-3 ${
                      q.id === currentQuestion.id
                        ? "border-[#BFDBFE] bg-[#EFF6FF]/20"
                        : "border-[#E2E8F0] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[#0F172A]">
                        Câu {q.questionNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleFlag(q.id)}
                        className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-medium border inline-flex items-center gap-1 transition-colors cursor-pointer ${
                          isFlagged
                            ? "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]"
                            : "bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC]"
                        }`}
                      >
                        <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{isFlagged ? "Đã gắn cờ" : "Gắn cờ"}</span>
                      </button>
                    </div>

                    <div className="text-sm sm:text-base font-semibold text-[#0F172A] leading-relaxed">
                      {hideStemInAudio
                        ? q.part === 1
                          ? "Nghe audio và chọn phương án mô tả đúng bức tranh (A, B, C hoặc D)."
                          : "Nghe câu hỏi/phát biểu và chọn câu đáp lại phù hợp nhất (A, B hoặc C)."
                        : q.stem}
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedIdx === optIdx;
                        const labelText = hideStemInAudio
                          ? `Phương án ${OPTION_LETTERS[optIdx]}`
                          : opt;

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => {
                              if (qIndex >= 0) setCurrentIdx(qIndex);
                              handleSelectOption(q.id, optIdx);
                            }}
                            className={`w-full min-h-[44px] text-left p-3 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                              isSelected
                                ? "bg-[#EFF6FF] border-[#2563EB] text-[#0F172A] ring-1 ring-[#2563EB]"
                                : "bg-white border-[#E2E8F0] hover:border-[#8190A6] hover:bg-[#F8FAFC] text-[#475569]"
                            }`}
                          >
                            <span
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${
                                isSelected
                                  ? "bg-[#2563EB] text-white border-[#2563EB]"
                                  : "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]"
                              }`}
                            >
                              {OPTION_LETTERS[optIdx]}
                            </span>
                            <span className="text-sm font-medium">{labelText}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Điều hướng Trước / Sau */}
            <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                className="min-h-[44px] px-4 border-[#8190A6] text-[#0F172A]"
              >
                <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
                <span>Câu trước</span>
              </Button>

              <Button
                variant="secondary"
                disabled={currentIdx === questions.length - 1}
                onClick={() =>
                  setCurrentIdx((prev) =>
                    Math.min(questions.length - 1, prev + 1)
                  )
                }
                className="min-h-[44px] px-4 border-[#8190A6] text-[#0F172A]"
              >
                <span>Câu tiếp theo</span>
                <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Cột phải (4/12): Navigator Part 1–4 */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4 bg-white border border-[#E2E8F0] shadow-2xs sticky top-18 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#F1F5F9]">
              <div className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Bảng câu hỏi Listening (1 – {totalQuestions})
              </div>
              <span className="text-[11px] font-mono text-[#475569] tabular-nums">
                {answeredCount}/{totalQuestions}
              </span>
            </div>

            <div className="flex flex-wrap gap-1 text-[11px]">
              {[
                { id: "all", label: "Tất cả" },
                { id: "p1", label: "Part 1" },
                { id: "p2", label: "Part 2" },
                { id: "p3", label: "Part 3" },
                { id: "p4", label: "Part 4" },
                { id: "flagged", label: `Cờ (${flaggedIds.size})` },
                {
                  id: "unanswered",
                  label: `Chưa làm (${totalQuestions - answeredCount})`,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setPaletteFilter(tab.id as typeof paletteFilter)
                  }
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

            <div className="max-h-[380px] overflow-y-auto pr-1 grid grid-cols-5 gap-1.5 pt-1">
              {filteredNavQuestions.map((q) => {
                const originalIndex = questions.findIndex(
                  (item) => item.id === q.id
                );
                const isAnswered = userAnswers[q.id] !== undefined;
                const isCurrent = originalIndex === currentIdx;
                const isFlagged = flaggedIds.has(q.id);

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIdx(originalIndex)}
                    className={`relative h-9 rounded-md text-xs font-mono font-semibold flex items-center justify-center transition-all cursor-pointer tabular-nums ${
                      isCurrent ? "ring-2 ring-[#2563EB] font-bold" : ""
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
          </Card>
        </div>
      </main>

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
