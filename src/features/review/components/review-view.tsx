"use client";

import { useState, useCallback, useTransition } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
  BookOpen,
  Calendar,
  SlidersHorizontal,
} from "lucide-react";
import type { ReviewCardItem, ReviewSessionSummary, ReviewTopicInfo } from "../types";
import type { Notebook } from "@/features/vocab/types";
import { submitCardRatingAction } from "../actions";
import { ReviewHeader, type ReviewStudyMode } from "./review-header";
import { ShortcutsModal } from "./shortcuts-modal";
import { ReviewSettingsModal, type ReviewSettings } from "./review-settings-modal";
import { ReviewSetupModal } from "./review-setup-modal";
import { TypingModeCard } from "./typing-mode-card";
import { FlashcardModeCard } from "./flashcard-mode-card";
import { QuizModeCard } from "./quiz-mode-card";
import { SpeakingModeCard } from "./speaking-mode-card";

interface ReviewViewProps {
  initialCards: ReviewCardItem[];
  nextDueFormatted?: string;
  totalCardsCount: number;
  notebookName?: string;
  topicName?: string;
  notebookId?: string;
  currentTopic?: string;
  currentLimit?: number;
  notebooks?: Notebook[];
  topics?: ReviewTopicInfo[];
}

export function ReviewView({
  initialCards,
  nextDueFormatted,
  totalCardsCount,
  notebookName,
  topicName,
  notebookId,
  currentTopic,
  currentLimit = 15,
  notebooks = [],
  topics = [],
}: ReviewViewProps) {
  const [queue, setQueue] = useState<ReviewCardItem[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMode, setCurrentMode] = useState<ReviewStudyMode>("typing");
  const [isPending, startTransition] = useTransition();
  const [ratingError, setRatingError] = useState<string | null>(null);

  // Phím tắt bàn phím hỗ trợ WCAG 2.1 AA (§5.9 & D-22): "Space" lật thẻ, "1", "2", "3", "4" chấm thẻ FSRS
  // Đã được tích hợp phân tầng trong FlashcardModeCard, QuizModeCard và ShortcutsModal
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  // Settings
  const [settings, setSettings] = useState<ReviewSettings>({
    autoPlayAudio: true,
    typoTolerance: true,
    audioSpeed: 1.0,
  });

  // Thống kê kết quả phiên ôn tập
  const [sessionSummary, setSessionSummary] = useState<ReviewSessionSummary>({
    totalReviewed: 0,
    ratingsDistribution: { again: 0, hard: 0, good: 0, easy: 0 },
  });

  const [isSessionComplete, setIsSessionComplete] = useState(false);

  const currentCard: ReviewCardItem | undefined = queue[currentIndex];

  // Xử lý gửi đánh giá thẻ (1=Again, 2=Hard, 3=Good, 4=Easy)
  const handleRate = useCallback(
    (rating: 1 | 2 | 3 | 4) => {
      if (!currentCard || isPending) return;

      setRatingError(null);

      startTransition(async () => {
        const res = await submitCardRatingAction(currentCard.id, rating);

        if (!res.success) {
          setRatingError(res.error || "Không thể chấm thẻ lúc này.");
          return;
        }

        // Cập nhật thống kê phân bổ đánh giá
        setSessionSummary((prev) => {
          const dist = { ...prev.ratingsDistribution };
          if (rating === 1) dist.again += 1;
          if (rating === 2) dist.hard += 1;
          if (rating === 3) dist.good += 1;
          if (rating === 4) dist.easy += 1;
          return {
            totalReviewed: prev.totalReviewed + 1,
            ratingsDistribution: dist,
            earliestNextDue: res.nextDue || prev.earliestNextDue,
          };
        });

        // Xử lý hàng đợi OQ-2: Nếu chọn Again (1) hoặc đang ở bước học ngắn hạn,
        // xếp lại thẻ vào cuối hàng đợi để người học củng cố trí nhớ ngay trong phiên
        if (rating === 1 || res.isShortTermLearningStep) {
          setQueue((prevQueue) => [...prevQueue, currentCard]);
        }

        // Chuyển sang thẻ tiếp theo
        const nextIndex = currentIndex + 1;
        if (nextIndex < queue.length || rating === 1 || res.isShortTermLearningStep) {
          setCurrentIndex(nextIndex);
        } else {
          setIsSessionComplete(true);
        }
      });
    },
    [currentCard, isPending, currentIndex, queue.length]
  );

  // Format thời điểm kế tiếp
  const formatTimeDue = (isoString?: string) => {
    if (!isoString) return nextDueFormatted || "Ngày mai";
    const d = new Date(isoString);
    return d.toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ========================================================
  // TRẠNG THÁI 1: KHÔNG CÓ THẺ NÀO ĐẾN HẠN ÔN TẬP
  // ========================================================
  if (queue.length === 0 && !isSessionComplete) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E2E8F0] shadow-sm p-7 text-center space-y-6 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              {topicName ? `Chủ đề "${topicName}" đã hoàn tất!` : "Trí nhớ của bạn đang rất tốt!"}
            </h1>
            <p className="text-sm text-[#475569] leading-relaxed">
              {topicName
                ? `Không còn từ vựng nào đến hạn trong chủ điểm "${topicName}". Bạn có thể chọn chủ điểm khác để tiếp tục.`
                : "Hôm nay bạn không còn thẻ nào đến hạn ôn tập. Toàn bộ từ vựng đã được củng cố theo đúng chu kỳ FSRS tối ưu."}
            </p>
          </div>

          {nextDueFormatted ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-xs font-mono text-[#64748B] flex items-center justify-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Lần ôn tập tiếp theo:</span>
              </div>
              <div className="text-base font-bold font-mono text-[#0F172A]">
                {nextDueFormatted}
              </div>
            </div>
          ) : totalCardsCount === 0 ? (
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/60 text-xs text-blue-900 leading-relaxed">
              Bạn chưa có từ vựng nào trong mục này. Hãy nạp bộ thẻ hoặc chọn chủ đề khác.
            </div>
          ) : null}

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <button
              type="button"
              onClick={() => setIsSetupOpen(true)}
              className="px-5 h-11 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Đổi chủ điểm / Quy mô phiên</span>
            </button>
            <Link
              href="/vocab"
              className="px-5 h-11 rounded-xl text-xs font-semibold bg-white border border-[#8190A6] text-[#0F172A] hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-[#475569]" />
              <span>Xem Sổ từ vựng</span>
            </Link>
          </div>
        </div>

        {/* Modal Setup khi trống */}
        <ReviewSetupModal
          isOpen={isSetupOpen}
          onClose={() => setIsSetupOpen(false)}
          notebooks={notebooks}
          topics={topics}
          currentNotebookId={notebookId}
          currentTopic={currentTopic}
          currentLimit={currentLimit}
        />
      </div>
    );
  }

  // ========================================================
  // TRẠNG THÁI 2: HOÀN TẤT PHIÊN ÔN TẬP
  // ========================================================
  if (isSessionComplete) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E2E8F0] shadow-sm p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/80 mx-auto flex items-center justify-center">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              Tuyệt vời! Hoàn thành phiên ôn tập
            </h1>
            <p className="text-sm text-[#475569]">
              Bạn vừa hoàn thành một phiên vi mô {sessionSummary.totalReviewed} từ vựng
              {topicName ? ` thuộc chủ điểm "${topicName}"` : ""}.
            </p>
          </div>

          {/* Bảng phân bổ kết quả chấm điểm */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 text-center">
              <div className="text-[11px] font-mono font-semibold text-rose-700">Lại</div>
              <div className="text-lg font-bold text-rose-900 mt-0.5">
                {sessionSummary.ratingsDistribution.again}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-center">
              <div className="text-[11px] font-mono font-semibold text-amber-700">Khó</div>
              <div className="text-lg font-bold text-amber-900 mt-0.5">
                {sessionSummary.ratingsDistribution.hard}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-center">
              <div className="text-[11px] font-mono font-semibold text-emerald-700">Tốt</div>
              <div className="text-lg font-bold text-emerald-900 mt-0.5">
                {sessionSummary.ratingsDistribution.good}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-center">
              <div className="text-[11px] font-mono font-semibold text-blue-700">Dễ</div>
              <div className="text-lg font-bold text-blue-900 mt-0.5">
                {sessionSummary.ratingsDistribution.easy}
              </div>
            </div>
          </div>

          {/* Lịch ôn tiếp theo */}
          <div className="p-4 rounded-xl bg-[#FDFBF7] border border-amber-950/10 text-xs text-[#64748B] flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-mono">
              <Calendar className="w-4 h-4 text-amber-700" />
              Lần ôn tập tiếp theo:
            </span>
            <span className="font-mono font-bold text-[#0F172A]">
              {formatTimeDue(sessionSummary.earliestNextDue)}
            </span>
          </div>

          {/* Nút hành động chính */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <button
              type="button"
              onClick={() => setIsSetupOpen(true)}
              className="w-full sm:w-auto px-6 h-11 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Ôn chủ điểm khác</span>
            </button>
            <Link
              href="/vocab"
              className="w-full sm:w-auto px-6 h-11 rounded-xl text-xs font-semibold bg-white border border-[#8190A6] text-[#0F172A] hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Về Sổ từ vựng</span>
            </Link>
          </div>
        </div>

        {/* Modal Setup khi hoàn tất */}
        <ReviewSetupModal
          isOpen={isSetupOpen}
          onClose={() => setIsSetupOpen(false)}
          notebooks={notebooks}
          topics={topics}
          currentNotebookId={notebookId}
          currentTopic={currentTopic}
          currentLimit={currentLimit}
        />
      </div>
    );
  }

  // ========================================================
  // TRẠNG THÁI 3: PHÒNG ÔN TẬP ĐA NĂNG (5 MODES)
  // ========================================================
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* 1. Header Đa Năng 5 Chế độ kèm Tùy chỉnh chủ đề */}
      <ReviewHeader
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        currentIndex={currentIndex}
        totalCards={queue.length}
        notebookName={notebookName}
        topicName={topicName}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSetup={() => setIsSetupOpen(true)}
      />

      {/* 2. Container Nội dung Chế độ Học */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-2xl mx-auto w-full">
        {ratingError && (
          <div className="w-full mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between animate-in fade-in">
            <span>{ratingError}</span>
            <button
              type="button"
              onClick={() => setRatingError(null)}
              className="font-bold underline ml-2 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {currentCard && (
          <>
            {/* Chế độ 1: 🧠 Đoán từ (Typing active recall) */}
            {currentMode === "typing" && (
              <TypingModeCard
                key={currentCard.id}
                card={currentCard}
                onCardCompleted={handleRate}
                autoPlayAudio={settings.autoPlayAudio}
                audioSpeed={settings.audioSpeed}
              />
            )}

            {/* Chế độ 2: 👁️ Flashcard (Lật thẻ truyền thống) */}
            {currentMode === "flashcard" && (
              <FlashcardModeCard
                key={currentCard.id}
                card={currentCard}
                onRateCard={handleRate}
                isPending={isPending}
                autoPlayAudio={settings.autoPlayAudio}
              />
            )}

            {/* Chế độ 3: ❓ Trắc nghiệm (EN -> VI) */}
            {currentMode === "quiz" && (
              <QuizModeCard
                key={`${currentCard.id}-quiz`}
                card={currentCard}
                allCards={queue}
                mode="en_to_vi"
                onCardCompleted={handleRate}
                autoPlayAudio={settings.autoPlayAudio}
              />
            )}

            {/* Chế độ 4: ⇄ Trắc nghiệm đảo (VI -> EN) */}
            {currentMode === "reverse_quiz" && (
              <QuizModeCard
                key={`${currentCard.id}-reverse-quiz`}
                card={currentCard}
                allCards={queue}
                mode="vi_to_en"
                onCardCompleted={handleRate}
                autoPlayAudio={settings.autoPlayAudio}
              />
            )}

            {/* Chế độ 5: 🎙️ Lặp lại (Phát âm & Shadowing) */}
            {currentMode === "listen_repeat" && (
              <SpeakingModeCard
                key={currentCard.id}
                card={currentCard}
                onCardCompleted={handleRate}
                audioSpeed={settings.audioSpeed}
              />
            )}
          </>
        )}
      </main>

      {/* 3. Modals */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <ReviewSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) =>
          setSettings((prev) => ({ ...prev, ...newSettings }))
        }
      />

      <ReviewSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        notebooks={notebooks}
        topics={topics}
        currentNotebookId={notebookId}
        currentTopic={currentTopic}
        currentLimit={currentLimit}
      />
    </div>
  );
}
