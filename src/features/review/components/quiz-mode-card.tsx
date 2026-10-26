"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { ReviewCardItem } from "../types";
import { generateQuizOptions, type QuizOption } from "@/core/reviewQuiz";
import { resolvePhonetic } from "@/core/vocabDictionary";
import { getPosBadgeInfo } from "@/core/vocab";
import { playPronunciation } from "@/lib/audio";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Volume2,
} from "lucide-react";

interface QuizModeCardProps {
  card: ReviewCardItem;
  allCards: ReviewCardItem[];
  mode: "en_to_vi" | "vi_to_en";
  onCardCompleted: (rating: 1 | 2 | 3 | 4) => void;
  autoPlayAudio?: boolean;
}

export function QuizModeCard({
  card,
  allCards,
  mode,
  onCardCompleted,
  autoPlayAudio = true,
}: QuizModeCardProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Sinh 4 phương án trắc nghiệm khi thẻ thay đổi
  const options: QuizOption[] = useMemo(() => {
    return generateQuizOptions(
      { word: card.word, meaning: card.meaning },
      allCards.map((c) => ({ word: c.word, meaning: c.meaning })),
      mode
    );
  }, [card.word, card.meaning, allCards, mode]);

  useEffect(() => {
    if (mode === "en_to_vi" && autoPlayAudio) {
      playPronunciation(card.word);
    }
  }, [card.word, mode, autoPlayAudio]);

  const posInfo = getPosBadgeInfo(card.part_of_speech, card.meaning, card.word);
  const phonetic = resolvePhonetic(card.word, card.phonetic || card.metadata?.phonetic);

  // Xử lý chọn phương án
  const handleSelectOption = useCallback(
    (opt: QuizOption) => {
      if (hasSubmitted) return;

      setSelectedOptionId(opt.id);
      setHasSubmitted(true);

      if (autoPlayAudio) {
        playPronunciation(card.word);
      }
    },
    [hasSubmitted, autoPlayAudio, card.word]
  );

  // Phím tắt bàn phím 1, 2, 3, 4 & Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (!hasSubmitted) {
        if (["1", "2", "3", "4"].includes(e.key)) {
          const index = parseInt(e.key, 10) - 1;
          if (options[index]) {
            handleSelectOption(options[index]);
          }
        }
      } else {
        if (e.key === "Enter" || e.code === "Space") {
          e.preventDefault();
          const selected = options.find((o) => o.id === selectedOptionId);
          onCardCompleted(selected?.isCorrect ? 3 : 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasSubmitted, options, selectedOptionId, onCardCompleted, handleSelectOption]);

  const selectedOption = options.find((o) => o.id === selectedOptionId);
  const isCorrect = selectedOption?.isCorrect ?? false;

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-9 space-y-6 animate-in fade-in duration-200">
      {/* 1. Header câu hỏi */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold uppercase border ${posInfo.badgeClass}`}
          >
            {posInfo.shortBadge}
          </span>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            {mode === "en_to_vi" ? "Trắc nghiệm nghĩa tiếng Việt" : "Trắc nghiệm từ tiếng Anh"}
          </span>
        </div>

        {mode === "en_to_vi" ? (
          /* Đề bài là từ tiếng Anh */
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {card.word}
              </h2>
              <button
                type="button"
                onClick={() => playPronunciation(card.word)}
                className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                title="Phát âm từ này"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            {phonetic && (
              <div className="text-sm font-ipa text-slate-500 font-normal">
                {phonetic}
              </div>
            )}
          </div>
        ) : (
          /* Đề bài là nghĩa tiếng Việt */
          <div className="space-y-2 pt-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight">
              {card.meaning}
            </h2>
            {card.metadata?.detailed_explanation && (
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                {card.metadata.detailed_explanation}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 2. Danh sách 4 phương án trắc nghiệm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto pt-2">
        {options.map((opt, idx) => {
          let btnStyle = "bg-slate-50/70 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300";

          if (hasSubmitted) {
            if (opt.isCorrect) {
              btnStyle = "bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold";
            } else if (opt.id === selectedOptionId && !opt.isCorrect) {
              btnStyle = "bg-rose-600 text-white border-rose-600 shadow-xs font-bold";
            } else {
              btnStyle = "bg-slate-50 text-slate-400 border-slate-200 opacity-50";
            }
          }

          return (
            <button
              key={opt.id}
              type="button"
              disabled={hasSubmitted}
              onClick={() => handleSelectOption(opt)}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${btnStyle} active:scale-[0.99] disabled:cursor-default min-h-[58px]`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 border ${
                    hasSubmitted && opt.isCorrect
                      ? "bg-white/20 text-white border-white/30"
                      : "bg-white text-slate-700 border-slate-200"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="text-sm sm:text-base font-semibold leading-snug">
                  {opt.label}
                </span>
              </div>

              {hasSubmitted && opt.isCorrect && (
                <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
              )}
              {hasSubmitted && opt.id === selectedOptionId && !opt.isCorrect && (
                <XCircle className="w-5 h-5 text-white shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Phản hồi và Chuyển tiếp sau khi chọn */}
      {hasSubmitted && (
        <div className="max-w-xl mx-auto pt-2 space-y-4 animate-in zoom-in-95 duration-150">
          {/* Card dẫn chứng / ví dụ */}
          {card.context_sentence && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm text-slate-800 space-y-1">
              <div className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] font-mono">
                Câu ví dụ TOEIC:
              </div>
              <p className="italic font-medium">
                &ldquo;{card.context_sentence}&rdquo;
              </p>
              {card.context_translation && (
                <p className="text-slate-500 text-xs">
                  Dịch: {card.context_translation}
                </p>
              )}
            </div>
          )}

          {/* Nút Primary duy nhất: Tiếp tục */}
          <button
            type="button"
            onClick={() => onCardCompleted(isCorrect ? 3 : 1)}
            className="w-full h-12 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <span>Thẻ tiếp theo</span>
            <ArrowRight className="w-4 h-4" />
            <span className="text-[11px] font-mono opacity-80">(Phím Enter)</span>
          </button>
        </div>
      )}
    </div>
  );
}
