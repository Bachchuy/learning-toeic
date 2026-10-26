"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Volume2,
  Brain,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Calendar,
  Eye,
  HelpCircle,
} from "lucide-react";
import type { ReviewCardItem, ReviewSessionSummary } from "../types";
import { submitCardRatingAction } from "../actions";
import { getPosBadgeInfo, generateNaturalExplanation } from "@/core/vocab";
import { resolvePhonetic } from "@/core/vocabDictionary";
import { playPronunciation } from "@/lib/audio";

interface ReviewViewProps {
  initialCards: ReviewCardItem[];
  nextDueFormatted?: string;
  totalCardsCount: number;
}

type FlashcardStudyMode = "vocab" | "cloze";

export function ReviewView({
  initialCards,
  nextDueFormatted,
  totalCardsCount,
}: ReviewViewProps) {
  const [queue, setQueue] = useState<ReviewCardItem[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [studyMode, setStudyMode] = useState<FlashcardStudyMode>("vocab");
  const [isPending, startTransition] = useTransition();
  const [ratingError, setRatingError] = useState<string | null>(null);

  // Thống kê kết quả phiên ôn tập
  const [sessionSummary, setSessionSummary] = useState<ReviewSessionSummary>({
    totalReviewed: 0,
    ratingsDistribution: { again: 0, hard: 0, good: 0, easy: 0 },
  });

  const [isSessionComplete, setIsSessionComplete] = useState(false);

  const currentCard: ReviewCardItem | undefined = queue[currentIndex];

  // Phát âm kép (Dual-Engine: US Audio CDN + Web Speech API fallback)
  const handleSpeak = useCallback((text: string) => {
    playPronunciation(text);
  }, []);

  // Xử lý lật thẻ
  const handleFlip = useCallback(() => {
    if (!isFlipped && currentCard) {
      setIsFlipped(true);
      handleSpeak(currentCard.word);
    }
  }, [isFlipped, currentCard, handleSpeak]);

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
          setIsFlipped(false);
          setShowHint(false);
        } else {
          setIsSessionComplete(true);
        }
      });
    },
    [currentCard, isPending, currentIndex, queue.length]
  );

  // Phím tắt bàn phím (§5.9 & D-22): Space để lật thẻ, 1-4 để chấm điểm
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (!isFlipped) {
          handleFlip();
        }
      } else if (isFlipped && !isPending) {
        if (e.key === "1") handleRate(1);
        else if (e.key === "2") handleRate(2);
        else if (e.key === "3") handleRate(3);
        else if (e.key === "4") handleRate(4);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, isPending, handleFlip, handleRate]);

  // Format câu có bôi đậm từ vựng (dành cho mặt sau)
  const renderHighlightedSentence = (sentence: string, word: string) => {
    if (!sentence) return null;
    const escapedWord = word.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedWord})`, "gi");
    const parts = sentence.split(regex);

    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <span
              key={i}
              className="font-bold text-[#2563EB] bg-blue-50/80 px-1 py-0.5 rounded border-b border-blue-400"
            >
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  // Format câu đục lỗ (Cloze - dành cho chế độ ngữ cảnh)
  const renderClozeSentence = (sentence: string, word: string) => {
    if (!sentence) return null;
    const escapedWord = word.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escapedWord}\\b`, "i");

    if (regex.test(sentence)) {
      const parts = sentence.split(regex);
      return (
        <span className="leading-relaxed">
          {parts[0]}
          <span className="inline-block px-3 py-0.5 mx-1 rounded-md bg-blue-100 text-blue-900 border-b-2 border-blue-600 font-bold font-mono text-sm">
            [ _____ ]
          </span>
          {parts[1]}
        </span>
      );
    }

    return (
      <span className="leading-relaxed">
        {sentence}{" "}
        <span className="inline-block px-3 py-0.5 rounded-md bg-blue-100 text-blue-900 border-b-2 border-blue-600 font-bold font-mono text-sm">
          [ _____ ]
        </span>
      </span>
    );
  };

  const phoneticDisplay = resolvePhonetic(
    currentCard?.word || "",
    currentCard?.phonetic || currentCard?.metadata?.phonetic
  );
  const posInfo = getPosBadgeInfo(
    currentCard?.part_of_speech,
    currentCard?.meaning,
    currentCard?.word
  );
  const topicDisplay =
    currentCard?.metadata?.topic || "TOEIC Essential Vocabulary";

  const isOldBoilerplate =
    currentCard?.metadata?.detailed_explanation?.includes("Thuật ngữ chuyên môn") ||
    currentCard?.metadata?.detailed_explanation?.includes(
      "thường xuyên xuất hiện trong các bài thi TOEIC"
    ) ||
    currentCard?.metadata?.detailed_explanation?.includes(
      "thường xuất hiện trong các bài thi TOEIC"
    );

  const detailedExplanation =
    currentCard?.metadata?.detailed_explanation && !isOldBoilerplate
      ? currentCard.metadata.detailed_explanation
      : currentCard
      ? generateNaturalExplanation(
          currentCard.word,
          currentCard.meaning,
          posInfo.category
        )
      : "";

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
        <div className="w-full max-w-md bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-7 text-center space-y-6 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              Trí nhớ của bạn đang rất tốt!
            </h1>
            <p className="text-sm text-[#475569] leading-relaxed">
              Hôm nay bạn không còn thẻ nào đến hạn ôn tập. Toàn bộ từ vựng đã được củng cố theo đúng chu kỳ FSRS tối ưu.
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
              Bạn chưa có từ vựng nào trong sổ từ. Hãy lưu từ mới sau khi luyện tập câu hỏi TOEIC để bắt đầu ôn tập FSRS.
            </div>
          ) : null}

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/vocab"
              className="px-5 h-11 rounded-xl text-xs font-semibold bg-white border border-[#8190A6] text-[#0F172A] hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-[#475569]" />
              <span>Xem Sổ từ vựng</span>
            </Link>
            <Link
              href="/practice/new"
              className="px-5 h-11 rounded-xl text-xs font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Luyện tập câu mới</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // TRẠNG THÁI 2: HOÀN TẤT PHIÊN ÔN TẬP
  // ========================================================
  if (isSessionComplete) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/80 mx-auto flex items-center justify-center">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              Tuyệt vời! Bạn đã hoàn thành phiên ôn tập
            </h1>
            <p className="text-sm text-[#475569]">
              Bộ não của bạn vừa củng cố vững chắc {sessionSummary.totalReviewed} lượt từ vựng hôm nay.
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
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/vocab"
              className="w-full sm:w-auto px-6 h-11 rounded-xl text-xs font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <BookOpen className="w-4 h-4" />
              <span>Về Sổ từ vựng</span>
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 h-11 rounded-xl text-xs font-semibold bg-white border border-[#8190A6] text-[#0F172A] hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <span>Về Trang chủ</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // TRẠNG THÁI 3: ĐANG ÔN TẬP THẺ FLASHCARD
  // ========================================================
  const progressPct = Math.round(((currentIndex + 1) / queue.length) * 100);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* 1. Focused Header (Ẩn hoàn toàn Navigation §6.3, D-02) */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/vocab"
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
            title="Thoát ôn tập"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#475569]">
              Thẻ Flashcard FSRS
            </div>
            <div className="text-[13px] font-mono font-semibold text-[#0F172A]">
              Thẻ {currentIndex + 1} / {queue.length}
            </div>
          </div>
        </div>

        {/* Chuyển chế độ học: Flashcard từ vựng vs Ngữ cảnh đục lỗ */}
        <div className="hidden sm:inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-xs font-mono">
          <button
            type="button"
            onClick={() => setStudyMode("vocab")}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              studyMode === "vocab"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Từ vựng
          </button>
          <button
            type="button"
            onClick={() => setStudyMode("cloze")}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              studyMode === "cloze"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Câu ngữ cảnh
          </button>
        </div>

        {/* Thanh tiến độ phiên */}
        <div className="w-28 sm:w-36 space-y-1">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2563EB] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="text-[10px] font-mono text-right text-[#64748B]">
            {progressPct}%
          </div>
        </div>
      </header>

      {/* 2. Main Flashcard Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-xl mx-auto w-full">
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

        {/* THẺ FLASHCARD CHUẨN MỰC */}
        <div className="w-full bg-white rounded-2xl border border-[#E2E8F0] shadow-md overflow-hidden flex flex-col min-h-[380px] sm:min-h-[420px] justify-between p-6 sm:p-8 relative transition-all">
          {/* Card Top: Badges & Topic */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider border ${posInfo.badgeClass}`}
              >
                {posInfo.shortBadge}
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
                {topicDisplay}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono text-[#64748B]">
              <Brain className="w-3.5 h-3.5 text-blue-600" />
              <span>Lượt ôn: {currentCard?.reps ?? 0}</span>
            </div>
          </div>

          {/* Card Center: Flashcard Content */}
          <div className="py-6 sm:py-8 flex flex-col items-center justify-center text-center space-y-4 flex-1">
            {!isFlipped ? (
              // ========================================================
              // MẶT TRƯỚC: THẺ TỪ VỰNG FLASHCARD (CHÍNH XÁC NHƯ ANKI/QUIZLET)
              // ========================================================
              studyMode === "vocab" ? (
                <div className="space-y-5 animate-in fade-in duration-150 w-full flex flex-col items-center">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Thuật ngữ cần nhớ
                  </div>

                  {/* TỪ VỰNG TIẾNG ANH TO RÕ TRUNG TÂM */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2.5 flex-wrap">
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                        {currentCard?.word}
                      </h2>
                      <button
                        type="button"
                        onClick={() => handleSpeak(currentCard?.word || "")}
                        className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                        title="Phát âm từ này"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Phiên âm IPA chuẩn ngữ âm */}
                    {phoneticDisplay && (
                      <div className="text-base font-ipa font-normal text-slate-600 tracking-wide">
                        {phoneticDisplay}
                      </div>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
                    Nhớ lại nghĩa và cách dùng trước khi lật thẻ.
                  </p>

                  {/* Nút xem gợi ý ngữ cảnh nếu gặp khó khăn */}
                  {currentCard?.context_sentence && (
                    <div className="pt-1">
                      {!showHint ? (
                        <button
                          type="button"
                          onClick={() => setShowHint(true)}
                          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Xem gợi ý câu ví dụ</span>
                        </button>
                      ) : (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 max-w-md animate-in fade-in">
                          &ldquo;{currentCard.context_sentence}&rdquo;
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                // Chế độ phụ: Câu ngữ cảnh đục lỗ (Cloze)
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#64748B]">
                    Điền từ thích hợp vào chỗ trống:
                  </div>

                  <div className="text-base sm:text-lg font-medium text-[#0F172A] leading-relaxed max-w-md">
                    &ldquo;
                    {renderClozeSentence(
                      currentCard?.context_sentence || "",
                      currentCard?.word || ""
                    )}
                    &rdquo;
                  </div>

                  {currentCard?.context_translation && (
                    <div className="text-xs sm:text-sm text-[#64748B] italic leading-relaxed pt-2 border-t border-slate-100">
                      Gợi ý dịch: &ldquo;{currentCard.context_translation}&rdquo;
                    </div>
                  )}
                </div>
              )
            ) : (
              // ========================================================
              // MẶT SAU: LẬT THẺ HIỆN NGHĨA + PHIÊN ÂM + VÍ DỤ + ĐÁNH GIÁ FSRS
              // ========================================================
              <div className="space-y-5 animate-in zoom-in-95 duration-150 w-full">
                {/* 1. Từ vựng + Phát âm */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                      {currentCard?.word}
                    </h2>
                    <button
                      type="button"
                      onClick={() => handleSpeak(currentCard?.word || "")}
                      className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                      title="Phát âm từ này"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {phoneticDisplay && (
                    <div className="text-sm font-ipa font-normal text-slate-600 tracking-wide">
                      {phoneticDisplay}
                    </div>
                  )}
                </div>

                {/* 2. Nghĩa tiếng Việt trọng tâm */}
                <div className="text-xl sm:text-2xl font-bold text-[#2563EB] tracking-tight border-y border-slate-100 py-3">
                  {currentCard?.meaning}
                </div>

                {/* 3. Diễn giải chi tiết tự nhiên theo phân loại từ vựng */}
                {detailedExplanation && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                    {detailedExplanation}
                  </p>
                )}

                {/* 4. Câu ví dụ hoàn chỉnh có bôi đậm từ vựng */}
                {currentCard?.context_sentence && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-left text-xs sm:text-sm text-[#0F172A] space-y-1.5 mt-2">
                    <div className="leading-relaxed">
                      &ldquo;
                      {renderHighlightedSentence(
                        currentCard.context_sentence,
                        currentCard.word
                      )}
                      &rdquo;
                    </div>
                    {currentCard.context_translation && (
                      <div className="text-xs text-[#64748B] italic pt-1 border-t border-slate-200/60">
                        Dịch: &ldquo;{currentCard.context_translation}&rdquo;
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card Bottom: Nút [ Lật thẻ ] hoặc 4 nút chấm điểm FSRS (Cao 60px) */}
          <div className="border-t border-slate-100 pt-5 w-full">
            {!isFlipped ? (
              <button
                type="button"
                onClick={handleFlip}
                className="w-full h-12 rounded-xl text-xs sm:text-sm font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Lật thẻ xem nghĩa</span>
                <span className="text-[11px] font-mono opacity-80">(Phím Space)</span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-center text-[#64748B]">
                  Đánh giá mức độ nhớ của bạn (Phím 1 - 4):
                </div>

                {/* 4 Nút đánh giá FSRS chuẩn quy chuẩn D-06 (Chiều cao đúng 60px) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {currentCard?.previews?.map((p) => {
                    let btnStyle = "";
                    let keyColor = "";

                    if (p.rating === 1) {
                      btnStyle =
                        "bg-rose-50/70 border-rose-200 text-rose-800 hover:bg-rose-100/80 hover:border-rose-400";
                      keyColor = "text-rose-600";
                    } else if (p.rating === 2) {
                      btnStyle =
                        "bg-amber-50/70 border-amber-200 text-amber-800 hover:bg-amber-100/80 hover:border-amber-400";
                      keyColor = "text-amber-600";
                    } else if (p.rating === 3) {
                      btnStyle =
                        "bg-emerald-50/70 border-emerald-200 text-emerald-800 hover:bg-emerald-100/80 hover:border-emerald-400";
                      keyColor = "text-emerald-600";
                    } else {
                      btnStyle =
                        "bg-blue-50/70 border-blue-200 text-blue-800 hover:bg-blue-100/80 hover:border-blue-400";
                      keyColor = "text-blue-600";
                    }

                    return (
                      <button
                        key={p.rating}
                        type="button"
                        disabled={isPending}
                        onClick={() => handleRate(p.rating)}
                        className={`h-[60px] rounded-xl border flex flex-col items-center justify-center p-1.5 transition-all cursor-pointer ${btnStyle} active:scale-98 disabled:opacity-50`}
                      >
                        <div className="flex items-center gap-1 text-xs font-bold font-mono">
                          <span className={`text-[10px] font-mono opacity-70 ${keyColor}`}>
                            [{p.rating}]
                          </span>
                          <span>{p.ratingLabel}</span>
                        </div>
                        <div className="text-[11px] font-mono font-medium opacity-85 mt-0.5">
                          {p.intervalText}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lời khuyên ôn tập ngắt quãng phía dưới */}
        <div className="mt-4 text-center text-[11px] font-mono text-[#64748B] max-w-sm">
          Phím Space để lật thẻ · Phím 1, 2, 3, 4 để đánh giá mức độ nhớ FSRS
        </div>
      </main>
    </div>
  );
}
