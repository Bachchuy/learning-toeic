"use client";

import { useState, useRef } from "react";
import type { ReviewCardItem } from "../types";
import {
  evaluateSpellingInput,
  generateHintDisplay,
} from "@/core/reviewQuiz";
import { resolvePhonetic } from "@/core/vocabDictionary";
import { getPosBadgeInfo } from "@/core/vocab";
import { playPronunciation } from "@/lib/audio";
import { AudioSpeakerButton } from "@/components/ui/audio-speaker-button";
import {
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Volume2,
} from "lucide-react";

interface TypingModeCardProps {
  card: ReviewCardItem;
  onCardCompleted: (rating: 1 | 2 | 3 | 4) => void;
  autoPlayAudio?: boolean;
  audioSpeed?: number;
}

export function TypingModeCard({
  card,
  onCardCompleted,
  autoPlayAudio = true,
}: TypingModeCardProps) {
  const [inputValue, setInputValue] = useState("");
  const [hintLevel, setHintLevel] = useState(0);
  const [hasChecked, setHasChecked] = useState(false);
  const [isExactMatch, setIsExactMatch] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const posInfo = getPosBadgeInfo(card.part_of_speech, card.meaning, card.word);
  const phonetic = resolvePhonetic(card.word, card.phonetic || card.metadata?.phonetic);

  // Tạo câu đục lỗ bằng dấu sao che từ
  const renderClozeAsterisks = (sentence?: string, targetWord?: string) => {
    if (!sentence || !targetWord) return null;
    const escapedWord = targetWord.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escapedWord}\\b`, "gi");

    const parts = sentence.split(regex);
    const asterisks = "*".repeat(targetWord.trim().length);

    if (parts.length > 1) {
      return (
        <span>
          {parts[0]}
          <strong className="text-rose-600 font-mono tracking-wider font-bold">
            {asterisks}
          </strong>
          {parts[1]}
        </span>
      );
    }

    return (
      <span>
        {sentence}{" "}
        <strong className="text-rose-600 font-mono tracking-wider font-bold">
          ({asterisks})
        </strong>
      </span>
    );
  };

  // Xử lý bấm nút Gợi ý
  const handleRequestHint = () => {
    setHintLevel((prev) => Math.min(prev + 1, 4));
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Kiểm tra đáp án gõ
  const handleCheck = () => {
    if (!inputValue.trim() || hasChecked) return;

    const evaluation = evaluateSpellingInput(inputValue, card.word);

    if (evaluation.isExact) {
      setIsExactMatch(true);
      setHasChecked(true);
      setWarningMessage(null);
      if (autoPlayAudio) {
        playPronunciation(card.word);
      }
    } else if (evaluation.isClose) {
      setWarningMessage(
        `Gần đúng rồi! Bạn gõ "${inputValue.trim()}", chỉ sai 1 ký tự so với từ ${card.word.length} chữ cái.`
      );
    } else {
      setIsExactMatch(false);
      setHasChecked(true);
      setWarningMessage(`Chưa chính xác. Đáp án đúng là "${card.word}".`);
      if (autoPlayAudio) {
        playPronunciation(card.word);
      }
    }
  };

  // Xử lý gõ lại
  const handleRetry = () => {
    setInputValue("");
    setHasChecked(false);
    setIsExactMatch(false);
    setWarningMessage(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const hintDisplay = generateHintDisplay(card.word, hintLevel);

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-9 space-y-6 animate-in fade-in duration-200">
      {/* 1. Illustration Avatar / Category Badge */}
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-b from-blue-50 to-indigo-100/70 border border-blue-200/60 flex flex-col items-center justify-center p-2 shadow-2xs">
          <Sparkles className="w-8 h-8 text-blue-600" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-800 mt-1">
            {card.metadata?.topic || "TOEIC"}
          </span>
        </div>

        {/* Nghĩa tiếng Việt chính + Loại từ (giống hệt ảnh user gửi) */}
        <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight">
            {card.meaning}
          </h2>
          <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {posInfo.labelVi}
          </span>
        </div>
      </div>

      {/* 2. Định nghĩa Tiếng Anh & Định nghĩa */}
      <div className="space-y-3 text-center max-w-lg mx-auto">
        {card.metadata?.detailed_explanation && (
          <div className="space-y-0.5">
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              Định nghĩa Tiếng Anh:
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {card.metadata.detailed_explanation}
            </p>
          </div>
        )}

        {/* Ví dụ đục lỗ và dịch ví dụ */}
        {card.context_sentence && (
          <div className="pt-2 border-t border-slate-100 space-y-1">
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              Ví dụ:
            </div>
            <p className="text-sm sm:text-base text-slate-900 italic font-medium">
              &ldquo;{renderClozeAsterisks(card.context_sentence, card.word)}&rdquo;
            </p>
            {card.context_translation && (
              <p className="text-xs text-slate-500">
                {card.context_translation}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 3. Ô Gợi ý số ký tự (Viền nét đứt giống ảnh user gửi) */}
      <div className="flex flex-col items-center justify-center gap-3 pt-2">
        <div className="px-6 py-2.5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/80 font-mono text-base sm:text-lg font-bold tracking-[0.25em] text-slate-700 select-none">
          {hintDisplay}
        </div>

        {/* Nút Gợi ý */}
        <button
          type="button"
          onClick={handleRequestHint}
          disabled={hintLevel >= 4 || hasChecked}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
          <span>
            {hintLevel === 0
              ? "Gợi ý chữ cái"
              : hintLevel === 1
              ? "Gợi ý thêm chữ cuối"
              : `Gợi ý (Mức ${hintLevel})`}
          </span>
        </button>
      </div>

      {/* 4. Ô nhập text: Nhập từ tiếng Anh... */}
      <div className="max-w-md mx-auto space-y-3">
        {!hasChecked ? (
          <div className="space-y-2">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                autoFocus
                autoComplete="off"
                spellCheck="false"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (warningMessage) setWarningMessage(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCheck();
                  }
                }}
                placeholder="Nhập từ tiếng Anh..."
                className="w-full h-13 px-4 text-center rounded-2xl border-2 border-slate-300 focus:border-blue-600 focus:outline-hidden text-base sm:text-lg font-medium text-slate-900 transition-all shadow-xs placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>

            {/* Thông báo lỗi nhẹ (Typo tolerance) */}
            {warningMessage && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{warningMessage}</span>
              </div>
            )}

            {/* Nút Primary duy nhất: Kiểm tra */}
            <button
              type="button"
              onClick={handleCheck}
              disabled={!inputValue.trim()}
              className="w-full h-12 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              <span>Kiểm tra đáp án</span>
              <span className="text-[11px] font-mono opacity-80">(Phím Enter)</span>
            </button>
          </div>
        ) : (
          /* Trạng thái đã kiểm tra: Đúng hoặc Sai */
          <div className="space-y-4 animate-in zoom-in-95 duration-150">
            {isExactMatch ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Chính xác tuyệt đối!</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {card.word}
                  </span>
                  <button
                    type="button"
                    onClick={() => playPronunciation(card.word)}
                    className="p-1 rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                {phonetic && (
                  <div className="text-xs font-ipa text-slate-600">
                    {phonetic}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-rose-700 font-bold text-sm">
                  <AlertCircle className="w-5 h-5" />
                  <span>Chưa chính xác!</span>
                </div>
                <div className="text-xs text-rose-800">
                  Bạn đã nhập: <strong className="line-through">{inputValue}</strong>
                </div>
                <div className="pt-1 flex items-center justify-center gap-2">
                  <span className="text-xl font-extrabold text-emerald-700">
                    {card.word}
                  </span>
                  <AudioSpeakerButton word={card.word} size="sm" />
                </div>
                {phonetic && (
                  <div className="text-xs font-ipa text-slate-600">
                    {phonetic}
                  </div>
                )}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Thử gõ lại từ này</span>
                  </button>
                </div>
              </div>
            )}

            {/* Các nút chuyển tiếp hoặc đánh giá FSRS */}
            <div className="pt-2 space-y-2">
              <div className="text-[11px] font-mono text-slate-500 text-center">
                Mức độ ghi nhớ thẻ này:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => onCardCompleted(1)}
                  className="h-11 rounded-xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="font-mono">[1]</span> Lại
                </button>
                <button
                  type="button"
                  onClick={() => onCardCompleted(2)}
                  className="h-11 rounded-xl text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="font-mono">[2]</span> Khó
                </button>
                <button
                  type="button"
                  onClick={() => onCardCompleted(3)}
                  className="h-11 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                >
                  <span className="font-mono">[3]</span> Tốt
                </button>
                <button
                  type="button"
                  onClick={() => onCardCompleted(4)}
                  className="h-11 rounded-xl text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="font-mono">[4]</span> Dễ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
