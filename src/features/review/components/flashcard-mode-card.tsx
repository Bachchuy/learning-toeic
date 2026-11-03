"use client";

import { useState, useEffect, useCallback } from "react";
import type { ReviewCardItem } from "../types";
import { resolvePhonetic } from "@/core/phonetic";
import {
  getPosBadgeInfo,
  generateNaturalExplanation,
  resolveDualDetails,
} from "@/core/vocab";
import { playPronunciation, playDualPronunciation } from "@/lib/audio";
import { AudioSpeakerButton } from "@/components/ui/audio-speaker-button";
import {
  Eye,
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
  autoPlayAudio = false,
}: FlashcardModeCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const dualDetails = resolveDualDetails(
    card.word,
    card.part_of_speech,
    card.meaning,
    card.context_sentence
  );
  const isVerbContext = dualDetails.primaryRole === "verb";
  const isNounContext = dualDetails.primaryRole === "noun";

  const handlePlayAudio = useCallback(() => {
    if (dualDetails.isDual) {
      playDualPronunciation(card.word, {
        nounAudioUrl: dualDetails.nounAudioUrl,
        verbAudioUrl: dualDetails.verbAudioUrl,
      });
    } else {
      playPronunciation(card.word, card.audio_url || card.metadata?.audio_url);
    }
  }, [
    card.word,
    card.audio_url,
    card.metadata?.audio_url,
    dualDetails.isDual,
    dualDetails.nounAudioUrl,
    dualDetails.verbAudioUrl,
  ]);

  useEffect(() => {
    if (autoPlayAudio) {
      handlePlayAudio();
    }
  }, [autoPlayAudio, handlePlayAudio]);

  const phoneticDisplay = resolvePhonetic(
    card.word,
    card.phonetic || card.metadata?.phonetic
  );
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
  }, [isFlipped, isPending, handlePlayAudio, onRateCard]);

  // Format câu có bôi đậm từ vựng (dành cho mặt sau) với underline tinh tế
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
              className="font-semibold text-blue-600 underline decoration-blue-300 decoration-2 underline-offset-4"
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
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col min-h-[330px] sm:min-h-[360px] justify-between p-4 sm:p-6 relative transition-all">
      {/* 1. Header của thẻ: Huy hiệu từ loại bên trái, Lượt ôn bên phải */}
      <div className="flex items-center justify-between w-full">
        <span
          className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider border ${
            dualDetails.isDual
              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
              : posInfo.badgeClass
          }`}
        >
          {dualDetails.isDual ? "DANH TỪ · ĐỘNG TỪ" : posInfo.shortBadge}
        </span>
        <span className="text-xs font-medium text-slate-400">
          Lượt ôn: {card.reps ?? 0}
        </span>
      </div>

      {/* 2. Khu vực Từ vựng trung tâm: Mặt trước / Mặt sau */}
      <div className="py-3 sm:py-4 flex flex-col items-center justify-center text-center space-y-3 flex-1">
        {!isFlipped ? (
          /* MẶT TRƯỚC: TỪ VỰNG */
          <div className="space-y-4 animate-in fade-in duration-150 w-full flex flex-col items-center">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold tracking-tight text-slate-900">
                {card.word}
              </h2>

              {/* Ngay dưới từ chính: Phiên âm + Nút phát âm (Phân tách rõ [n] và [v] nếu khác phát âm) */}
              {dualDetails.isDual &&
              dualDetails.nounIpa &&
              dualDetails.verbIpa &&
              dualDetails.nounIpa !== dualDetails.verbIpa ? (
                <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold font-mono text-slate-500">[n]</span>
                    <span className="font-ipa text-slate-700 font-medium">{dualDetails.nounIpa}</span>
                    <AudioSpeakerButton
                      word={card.word}
                      audioUrl={dualDetails.nounAudioUrl}
                      posHint="noun"
                      partOfSpeech="noun"
                      phonetic={dualDetails.nounIpa}
                      spokenText={card.word}
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold font-mono text-slate-500">[v]</span>
                    <span className="font-ipa text-slate-700 font-medium">{dualDetails.verbIpa}</span>
                    <AudioSpeakerButton
                      word={card.word}
                      audioUrl={dualDetails.verbAudioUrl}
                      posHint="verb"
                      partOfSpeech="verb"
                      phonetic={dualDetails.verbIpa}
                      spokenText={`to ${card.word}`}
                      size="sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 mt-2 text-slate-500">
                  {phoneticDisplay && (
                    <span className="font-ipa text-sm sm:text-base text-slate-600">
                      {phoneticDisplay}
                    </span>
                  )}
                  <AudioSpeakerButton
                    word={card.word}
                    audioUrl={card.audio_url || card.metadata?.audio_url}
                    phonetic={phoneticDisplay}
                    size="sm"
                  />
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
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
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 max-w-md animate-in fade-in text-left">
                    &ldquo;{card.context_sentence}&rdquo;
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* MẶT SAU: HIỆN NGHĨA + GIẢI THÍCH + VÍ DỤ */
          <div className="space-y-4 animate-in zoom-in-95 duration-150 w-full">
            {/* Từ chính cỡ lớn + phiên âm + 1 nút phát âm trung tâm */}
            <div className="space-y-1">
              <h2 className="text-4xl font-bold tracking-tight text-slate-900">
                {card.word}
              </h2>
              {dualDetails.isDual &&
              dualDetails.nounIpa &&
              dualDetails.verbIpa &&
              dualDetails.nounIpa !== dualDetails.verbIpa ? (
                <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold font-mono text-slate-500">[n]</span>
                    <span className="font-ipa text-slate-700 font-medium">{dualDetails.nounIpa}</span>
                    <AudioSpeakerButton
                      word={card.word}
                      audioUrl={dualDetails.nounAudioUrl}
                      posHint="noun"
                      partOfSpeech="noun"
                      phonetic={dualDetails.nounIpa}
                      spokenText={card.word}
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold font-mono text-slate-500">[v]</span>
                    <span className="font-ipa text-slate-700 font-medium">{dualDetails.verbIpa}</span>
                    <AudioSpeakerButton
                      word={card.word}
                      audioUrl={dualDetails.verbAudioUrl}
                      posHint="verb"
                      partOfSpeech="verb"
                      phonetic={dualDetails.verbIpa}
                      spokenText={`to ${card.word}`}
                      size="sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 mt-2 text-slate-500">
                  {phoneticDisplay && (
                    <span className="font-ipa text-sm sm:text-base text-slate-600">
                      {phoneticDisplay}
                    </span>
                  )}
                  <AudioSpeakerButton
                    word={card.word}
                    audioUrl={card.audio_url || card.metadata?.audio_url}
                    phonetic={phoneticDisplay}
                    size="sm"
                  />
                </div>
              )}
            </div>

            {/* 3. Khu vực Từ loại: Nếu là từ loại kép (Dual POS) -> layout 2 cột phẳng */}
            {dualDetails.isDual && dualDetails.nounMeaning && dualDetails.verbMeaning ? (
              <div className="w-full max-w-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 my-6 pt-6 border-t border-slate-100 md:divide-x md:divide-slate-100 text-left">
                {/* Cột Danh từ */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="whitespace-nowrap inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                      [n] Danh từ
                    </span>
                    {isNounContext && (
                      <span className="bg-blue-50 text-blue-700 text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                        Trọng tâm bài
                      </span>
                    )}
                    {dualDetails.nounIpa && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-ipa">
                        <span>{dualDetails.nounIpa}</span>
                        <AudioSpeakerButton
                          word={card.word}
                          audioUrl={dualDetails.nounAudioUrl}
                          posHint="noun"
                          partOfSpeech="noun"
                          phonetic={dualDetails.nounIpa}
                          spokenText={card.word}
                          label="n"
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-base font-semibold text-slate-900">
                    {dualDetails.nounMeaning}
                  </p>
                </div>

                {/* Cột Động từ */}
                <div className="space-y-2 md:pl-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="whitespace-nowrap inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                      [v] Động từ
                    </span>
                    {isVerbContext && (
                      <span className="bg-blue-50 text-blue-700 text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                        Trọng tâm bài
                      </span>
                    )}
                    {dualDetails.verbIpa && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-ipa">
                        <span>{dualDetails.verbIpa}</span>
                        <AudioSpeakerButton
                          word={card.word}
                          audioUrl={dualDetails.verbAudioUrl}
                          posHint="verb"
                          partOfSpeech="verb"
                          phonetic={dualDetails.verbIpa}
                          spokenText={`to ${card.word}`}
                          label="v"
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-base font-semibold text-slate-900">
                    {dualDetails.verbMeaning}
                  </p>
                </div>
              </div>
            ) : (
              /* Từ loại đơn */
              <div className="my-6 pt-6 border-t border-slate-100 text-center space-y-2">
                <div className="inline-flex items-center gap-2">
                  <span className="whitespace-nowrap inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                    {posInfo.shortBadge}
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-semibold text-slate-900">
                  {card.meaning}
                </p>
              </div>
            )}

            {/* Định nghĩa tiếng Anh / Giải thích tự nhiên */}
            {detailedExplanation && (
              <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                {detailedExplanation}
              </p>
            )}

            {/* 4. Khu vực Câu ví dụ: Kiểu Quote thanh lịch */}
            {card.context_sentence && (
              <div className="border-l-2 border-slate-300 pl-4 py-1 my-6 max-w-xl mx-auto text-left space-y-1.5">
                <p className="italic font-medium text-slate-800 leading-relaxed text-sm sm:text-base">
                  &ldquo;{renderHighlightedSentence(card.context_sentence, card.word)}&rdquo;
                </p>
                {card.context_translation && (
                  <p className="text-xs text-slate-500">
                    Dịch: &ldquo;{card.context_translation}&rdquo;
                  </p>
                )}
                {dualDetails.isDual && (
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                    <span>Vai trò trong câu ví dụ:</span>
                    <span className="font-semibold text-slate-600">
                      {isVerbContext ? "Động từ (Verb)" : "Danh từ (Noun)"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Card Bottom: Nút Lật thẻ hoặc 4 Nút đánh giá FSRS */}
      <div className="border-t border-slate-100 pt-4 w-full">
        {!isFlipped ? (
          <button
            type="button"
            onClick={() => {
              setIsFlipped(true);
            }}
            className="w-full h-12 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Lật thẻ xem nghĩa</span>
            <span className="text-[11px] font-mono opacity-80">(Phím Space)</span>
          </button>
        ) : (
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-center text-slate-400">
              Đánh giá mức độ nhớ của bạn (Phím 1 - 4):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {card.previews?.map((p) => {
                let dotColor = "bg-blue-500";
                if (p.rating === 1) dotColor = "bg-rose-500";
                else if (p.rating === 2) dotColor = "bg-amber-500";
                else if (p.rating === 3) dotColor = "bg-emerald-500";

                return (
                  <button
                    key={p.rating}
                    type="button"
                    disabled={isPending}
                    onClick={() => onRateCard(p.rating)}
                    className="group flex flex-col items-center justify-center min-h-[60px] p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80 transition-all shadow-2xs cursor-pointer active:scale-[0.98] disabled:opacity-50"
                  >
                    <div className="flex items-center gap-1.5">
                      <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-500 rounded">
                        {p.rating}
                      </kbd>
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
                      <span className="text-xs font-semibold text-slate-800">
                        {p.ratingLabel}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-1">
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
