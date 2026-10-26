"use client";

import { useState, useCallback, useTransition } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
  BookOpen,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  Folder,
  Loader2,
  X,
} from "lucide-react";
import type { ReviewCardItem, ReviewSessionSummary, ReviewTopicInfo } from "../types";
import type { Notebook } from "@/features/vocab/types";
import { submitCardRatingAction, getReviewCardsAction } from "../actions";
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
  totalCardsCount?: number;
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
  totalCardsCount = 0,
  notebookName,
  topicName,
  notebookId,
  currentTopic,
  currentLimit = 15,
  notebooks = [],
  topics = [],
}: ReviewViewProps) {
  // Chủ đề đang hoạt động (Mặc định là chủ đề đầu tiên hoặc chủ đề từ URL)
  const [activeTopic, setActiveTopic] = useState<string>(
    currentTopic || (topics.length > 0 ? topics[0].name : topicName || "Tổng hợp")
  );
  const [queue, setQueue] = useState<ReviewCardItem[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMode, setCurrentMode] = useState<ReviewStudyMode>("typing");
  const [isLoadingTopic, setIsLoadingTopic] = useState(false);
  const [isMobileTopicsOpen, setIsMobileTopicsOpen] = useState(false);
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

  // Thống kê kết quả phiên ôn tập của chủ đề hiện tại
  const [sessionSummary, setSessionSummary] = useState<ReviewSessionSummary>({
    totalReviewed: 0,
    ratingsDistribution: { again: 0, hard: 0, good: 0, easy: 0 },
  });

  const [isSessionComplete, setIsSessionComplete] = useState(false);

  const currentCard: ReviewCardItem | undefined = queue[currentIndex];

  // Chuyển sang chủ đề khác từ danh sách bên trái
  const handleSelectTopic = (selectedName: string) => {
    if (selectedName === activeTopic && queue.length > 0 && !isSessionComplete) return;
    setActiveTopic(selectedName);
    setIsLoadingTopic(true);
    setIsSessionComplete(false);
    setRatingError(null);
    setIsMobileTopicsOpen(false);

    startTransition(async () => {
      try {
        const res = await getReviewCardsAction({
          notebookId,
          topic: selectedName,
          limit: 50,
          studyAll: true,
        });
        setQueue(res.cards);
        setCurrentIndex(0);
        setSessionSummary({
          totalReviewed: 0,
          ratingsDistribution: { again: 0, hard: 0, good: 0, easy: 0 },
        });
      } catch (err) {
        console.error("Lỗi khi tải chủ đề:", err);
        setRatingError("Không thể nạp từ vựng cho chủ đề này. Vui lòng thử lại.");
      } finally {
        setIsLoadingTopic(false);
      }
    });
  };

  // Tìm chủ đề kế tiếp để học liên tục
  const activeTopicIndex = topics.findIndex((t) => t.name === activeTopic);
  const nextTopic =
    activeTopicIndex >= 0 && activeTopicIndex + 1 < topics.length
      ? topics[activeTopicIndex + 1]
      : null;

  // Xử lý gửi đánh giá thẻ (1=Again, 2=Hard, 3=Good, 4=Easy)
  const handleRate = useCallback(
    (rating: 1 | 2 | 3 | 4) => {
      if (!currentCard || isPending) return;

      setRatingError(null);

      startTransition(async () => {
        try {
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
        } catch (err) {
          console.error("Lỗi khi gửi đánh giá FSRS:", err);
          setRatingError("Lỗi kết nối khi lưu đánh giá. Vui lòng chấm lại.");
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

  // Tiến độ hoàn thành của phiên hiện tại (0 -> 100%)
  const progressPct =
    queue.length > 0 ? Math.round(((currentIndex + 1) / queue.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* 1. Header Đa Năng 5 Chế độ kèm Điều hướng */}
      <ReviewHeader
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        currentIndex={currentIndex}
        totalCards={queue.length}
        notebookName={notebookName}
        topicName={activeTopic}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSetup={() => setIsSetupOpen(true)}
      />

      {/* Nút mở danh sách chủ đề trên Mobile */}
      <div className="lg:hidden bg-white border-b border-[#E2E8F0] px-4 py-2.5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsMobileTopicsOpen(true)}
          className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg cursor-pointer"
        >
          <Folder className="w-3.5 h-3.5 text-blue-600" />
          <span className="line-clamp-1">Chủ đề: {activeTopic}</span>
          <span className="text-[10px] text-slate-500 font-mono">
            ({currentIndex + 1}/{queue.length})
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 rotate-90" />
        </button>
        <span className="text-xs font-mono font-bold text-blue-600">
          {topics.length} chủ đề
        </span>
      </div>

      {/* 2. BỐ CỤC 2 CỘT CHUẨN PARROTO (Image 3) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full flex-1 flex flex-col lg:flex-row gap-6 items-start">
        {/* CỘT TRÁI: DANH SÁCH CHỦ ĐỀ (~30-50 THẺ MỖI CHỦ ĐỀ) */}
        <aside className="hidden lg:flex w-80 shrink-0 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-4 flex-col max-h-[calc(100vh-120px)] sticky top-20">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#475569]">
              DANH SÁCH CHỦ ĐỀ
            </span>
            <span
              className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
              title="Tổng số thẻ trong sổ"
            >
              {totalCardsCount > 0 ? `${totalCardsCount} thẻ` : `${topics.length} chủ đề`}
            </span>
          </div>

          <div className="overflow-y-auto space-y-1.5 pr-1 no-scrollbar flex-1">
            {topics.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Chưa có danh sách chủ đề
              </div>
            ) : (
              topics.map((t) => {
                const isSelected = t.name === activeTopic;
                const isFinished =
                  t.learnedCount !== undefined &&
                  t.learnedCount >= t.totalCount &&
                  t.totalCount > 0;

                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => handleSelectTopic(t.name)}
                    className={`w-full p-2.5 sm:p-3 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#0F172A] text-white border-[#0F172A] shadow-sm font-semibold"
                        : "bg-white text-slate-800 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
                          isSelected
                            ? "bg-slate-800"
                            : "bg-blue-50 border border-blue-100/80 text-blue-700"
                        }`}
                      >
                        {getTopicIcon(t.name)}
                      </div>
                      <div className="min-w-0">
                        <div
                          className={`text-xs sm:text-[13px] font-bold line-clamp-1 ${
                            isSelected ? "text-white" : "text-[#0F172A]"
                          }`}
                        >
                          {t.name}
                        </div>
                        <div
                          className={`text-[11px] font-mono mt-0.5 ${
                            isSelected ? "text-slate-300" : "text-slate-500"
                          }`}
                        >
                          {t.learnedCount || 0}/{t.totalCount} thẻ
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isFinished ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                      ) : (
                        <span
                          className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                            isSelected
                              ? "text-slate-400 bg-slate-800"
                              : "text-slate-400 bg-slate-100"
                          }`}
                        >
                          —
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* CỘT PHẢI: VÙNG HỌC TẬP CHÍNH CỦA CHỦ ĐỀ */}
        <main className="flex-1 w-full flex flex-col items-center">
          {/* Thanh Tiến Độ theo Chủ Đề (giống Image 3 Parroto) */}
          <div className="w-full max-w-2xl mb-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>
                  TIẾN ĐỘ - {activeTopic.toUpperCase()}
                </span>
              </span>
              <span className="text-[#2563EB]">
                {queue.length > 0 ? Math.min(currentIndex + 1, queue.length) : 0} /{" "}
                {queue.length} THẺ
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {ratingError && (
            <div className="w-full max-w-2xl mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between animate-in fade-in">
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

          {/* TRẠNG THÁI: Đang nạp thẻ của chủ đề mới */}
          {isLoadingTopic ? (
            <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#E2E8F0] shadow-xs p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <div className="text-sm font-semibold text-[#0F172A]">
                Đang nạp từ vựng chủ đề &ldquo;{activeTopic}&rdquo;...
              </div>
            </div>
          ) : isSessionComplete ? (
            /* TRẠNG THÁI: Hoàn thành chủ đề */
            <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#E2E8F0] shadow-xs p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 mx-auto flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
                  Hoàn thành chủ đề &ldquo;{activeTopic}&rdquo;!
                </h1>
                <p className="text-sm text-[#475569]">
                  Bạn vừa hoàn tất {sessionSummary.totalReviewed} lượt ôn luyện theo thuật toán ghi nhớ FSRS. Đợt ôn kế tiếp: <span className="font-semibold text-slate-800">{formatTimeDue()}</span>.
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

              {/* Nút chuyển chủ đề tiếp theo */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
                {nextTopic ? (
                  <button
                    type="button"
                    onClick={() => handleSelectTopic(nextTopic.name)}
                    className="w-full sm:w-auto px-6 h-11 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <span>Học chủ đề tiếp: &ldquo;{nextTopic.name}&rdquo;</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    href="/vocab"
                    className="w-full sm:w-auto px-6 h-11 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Quay lại kho bộ thẻ</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => handleSelectTopic(activeTopic)}
                  className="w-full sm:w-auto px-6 h-11 rounded-xl text-xs font-semibold bg-white border border-[#8190A6] text-[#0F172A] hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  <span>Ôn lại chủ đề này</span>
                </button>
              </div>
            </div>
          ) : queue.length === 0 ? (
            /* TRẠNG THÁI: Chủ đề không có thẻ */
            <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#E2E8F0] shadow-xs p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/80 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#0F172A]">
                  Chủ đề &ldquo;{activeTopic}&rdquo; hiện không có thẻ nào cần ôn
                </h3>
                <p className="text-xs text-[#475569] max-w-md mx-auto">
                  Toàn bộ từ vựng của chủ điểm này đã được học hoặc chưa đến hạn theo thuật toán FSRS. Hãy chọn chủ đề khác ở danh sách bên trái!
                </p>
              </div>
              {nextTopic && (
                <button
                  type="button"
                  onClick={() => handleSelectTopic(nextTopic.name)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer shadow-xs inline-flex items-center gap-2"
                >
                  <span>Chuyển sang &ldquo;{nextTopic.name}&rdquo;</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : currentCard ? (
            /* TRẠNG THÁI: Học thẻ theo đúng mode */
            <div className="w-full max-w-2xl flex flex-col items-center">
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
            </div>
          ) : null}
        </main>
      </div>

      {/* Sheet mở danh sách chủ đề trên thiết bị di động */}
      {isMobileTopicsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm lg:hidden animate-in fade-in"
        >
          <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A]">
                DANH SÁCH CHỦ ĐỀ ({topics.length})
              </span>
              <button
                type="button"
                onClick={() => setIsMobileTopicsOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
              {topics.map((t) => {
                const isSelected = t.name === activeTopic;
                return (
                  <button
                    key={`mobile-${t.name}`}
                    type="button"
                    onClick={() => handleSelectTopic(t.name)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? "bg-[#0F172A] text-white border-[#0F172A] font-semibold"
                        : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{getTopicIcon(t.name)}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold line-clamp-1">{t.name}</div>
                        <div className="text-[10px] opacity-75 font-mono">
                          {t.learnedCount || 0}/{t.totalCount} thẻ
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono opacity-50">—</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
        currentTopic={activeTopic}
        currentLimit={currentLimit}
      />
    </div>
  );
}

/**
 * Trả về icon biểu tượng sinh động cho từng chủ điểm TOEIC / IT
 */
function getTopicIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("ai") || lower.includes("machine learning") || lower.includes("data")) return "🧠";
  if (lower.includes("frontend") || lower.includes("web") || lower.includes("api") || lower.includes("code")) return "💻";
  if (lower.includes("testing") || lower.includes("qa") || lower.includes("debug")) return "🔍";
  if (lower.includes("devops") || lower.includes("cloud") || lower.includes("server")) return "☁️";
  if (lower.includes("hợp đồng") || lower.includes("contract") || lower.includes("luật")) return "📝";
  if (lower.includes("tiếp thị") || lower.includes("market") || lower.includes("quảng cáo")) return "📢";
  if (lower.includes("tài chính") || lower.includes("ngân hàng") || lower.includes("finance")) return "💳";
  if (lower.includes("gia đình") || lower.includes("family")) return "👨‍👩‍👦";
  if (lower.includes("trường") || lower.includes("học") || lower.includes("school")) return "🏫";
  if (lower.includes("công việc") || lower.includes("work") || lower.includes("office")) return "💼";
  if (lower.includes("nghề") || lower.includes("job") || lower.includes("career")) return "👔";
  if (lower.includes("ăn") || lower.includes("uống") || lower.includes("food") || lower.includes("dining")) return "🍲";
  if (lower.includes("du lịch") || lower.includes("travel") || lower.includes("hotel")) return "✈️";
  if (lower.includes("mua sắm") || lower.includes("shop")) return "🛍️";
  return "📘";
}
