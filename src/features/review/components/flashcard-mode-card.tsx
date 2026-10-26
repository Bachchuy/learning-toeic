"use client";

import { useState, useEffect } from "react";
import type { ReviewCardItem } from "../types";
import { resolvePhonetic } from "@/core/vocabDictionary";
import {
  getPosBadgeInfo,
  generateNaturalExplanation,
  getDualPronunciation,
} from "@/core/vocab";
import { playPronunciation } from "@/lib/audio";
import { AudioSpeakerButton } from "@/components/ui/audio-speaker-button";
import {
  Eye,
  Volume2,
  HelpCircle,
} from "lucide-react";

interface FlashcardModeCardProps {
  card: ReviewCardItem;
  onRateCard: (rating: 1 | 2 | 3 | 4) => void;
  isPending?: boolean;
  autoPlayAudio?: boolean;
}

export function FlashcardModeCard({
  card,
  onRateCard,
  isPending = false,
  autoPlayAudio = true,
}: FlashcardModeCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (autoPlayAudio) {
      playPronunciation(card.word);
    }
  }, [card.word, autoPlayAudio]);

  const phoneticDisplay = resolvePhonetic(
    card.word,
    card.phonetic || card.metadata?.phonetic
  );
  const dual = getDualPronunciation(card.word);
  const posInfo = getPosBadgeInfo(card.part_of_speech, card.meaning, card.word);

  const isOldBoilerplate =
    card.metadata?.detailed_explanation?.includes("Thuật ngữ chuyên môn") ||
    card.metadata?.detailed_explanation?.includes(
      "thường xuyên xuất hiện trong các bài thi TOEIC"
    ) ||
    card.metadata?.detailed_explanation?.includes(
      "thường xuất hiện trong các bài thi TOEIC"
    );

  const detailedExplanation =
    card.metadata?.detailed_explanation && !isOldBoilerplate
      ? card.metadata.detailed_explanation
      : generateNaturalExplanation(card.word, card.meaning, posInfo.category);

  // Phím tắt Space để lật thẻ, 1-4 để chấm điểm
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
          setIsFlipped(true);
          playPronunciation(card.word);
        }
      } else if (isFlipped && !isPending) {
        if (e.key === "1") onRateCard(1);
        else if (e.key === "2") onRateCard(2);
        else if (e.key === "3") onRateCard(3);
        else if (e.key === "4") onRateCard(4);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, isPending, card.word, onRateCard]);

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

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col min-h-[400px] sm:min-h-[440px] justify-between p-6 sm:p-9 relative transition-all">
      {/* 1. Card Top: Badges */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <span
          className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider border ${posInfo.badgeClass}`}
        >
          {posInfo.shortBadge}
        </span>
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
          Lượt ôn: {card.reps ?? 0}
        </span>
      </div>

      {/* 2. Card Center: Mặt trước / Mặt sau */}
      <div className="py-6 sm:py-8 flex flex-col items-center justify-center text-center space-y-4 flex-1">
        {!isFlipped ? (
          /* MẶT TRƯỚC: TỪ VỰNG */
          <div className="space-y-4 animate-in fade-in duration-150 w-full flex flex-col items-center">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Thuật ngữ cần nhớ
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2.5 flex-wrap">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {card.word}
                </h2>
                <button
                  type="button"
                  onClick={() => playPronunciation(card.word)}
                  className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                  title="Phát âm từ này"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {dual ? (
                <div className="flex items-center justify-center gap-2.5 pt-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                    <span className="font-bold font-mono">DANH TỪ:</span>
                    <span className="font-ipa">{dual.nounIpa}</span>
                    <AudioSpeakerButton word={card.word} posHint="noun" label="n" size="sm" />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                    <span className="font-bold font-mono">ĐỘNG TỪ:</span>
                    <span className="font-ipa">{dual.verbIpa}</span>
                    <AudioSpeakerButton word={card.word} posHint="verb" label="v" size="sm" />
                  </div>
                </div>
              ) : phoneticDisplay ? (
                <div className="text-base font-ipa text-slate-600 font-normal">
                  {phoneticDisplay}
                </div>
              ) : null}
            </div>

            <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
              Nhớ lại nghĩa và cách dùng trước khi lật thẻ.
            </p>

            {/* Gợi ý câu ngữ cảnh */}
            {card.context_sentence && (
              <div className="pt-2">
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
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 max-w-md animate-in fade-in">
                    &ldquo;{card.context_sentence}&rdquo;
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* MẶT SAU: HIỆN NGHĨA + GIẢI THÍCH + VÍ DỤ */
          <div className="space-y-4 animate-in zoom-in-95 duration-150 w-full">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {card.word}
              </h2>
              {phoneticDisplay && (
                <div className="text-sm font-ipa text-slate-500 font-normal">
                  {phoneticDisplay}
                </div>
              )}
            </div>

            <div className="text-xl sm:text-2xl font-bold text-blue-600 tracking-tight border-y border-slate-100 py-3">
              {card.meaning}
            </div>

            {detailedExplanation && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                {detailedExplanation}
              </p>
            )}

            {card.context_sentence && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs sm:text-sm text-slate-800 space-y-1 max-w-md mx-auto">
                <p className="italic font-medium leading-relaxed">
                  &ldquo;{renderHighlightedSentence(card.context_sentence, card.word)}&rdquo;
                </p>
                {card.context_translation && (
                  <p className="text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                    Dịch: &ldquo;{card.context_translation}&rdquo;
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Card Bottom: Nút Lật thẻ hoặc 4 Nút đánh giá FSRS */}
      <div className="border-t border-slate-100 pt-4 w-full">
        {!isFlipped ? (
          <button
            type="button"
            onClick={() => {
              setIsFlipped(true);
              playPronunciation(card.word);
            }}
            className="w-full h-12 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Lật thẻ xem nghĩa</span>
            <span className="text-[11px] font-mono opacity-80">(Phím Space)</span>
          </button>
        ) : (
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-center text-slate-500">
              Đánh giá mức độ nhớ của bạn (Phím 1 - 4):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {card.previews?.map((p) => {
                let btnStyle = "";
                let keyColor = "";

                if (p.rating === 1) {
                  btnStyle = "bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100";
                  keyColor = "text-rose-600";
                } else if (p.rating === 2) {
                  btnStyle = "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100";
                  keyColor = "text-amber-600";
                } else if (p.rating === 3) {
                  btnStyle = "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100";
                  keyColor = "text-emerald-600";
                } else {
                  btnStyle = "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100";
                  keyColor = "text-blue-600";
                }

                return (
                  <button
                    key={p.rating}
                    type="button"
                    disabled={isPending}
                    onClick={() => onRateCard(p.rating)}
                    className={`h-[58px] rounded-xl border flex flex-col items-center justify-center p-1.5 transition-all cursor-pointer ${btnStyle} active:scale-[0.98] disabled:opacity-50`}
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
  );
}
