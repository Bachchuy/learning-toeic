"use client";

import { useState, useRef, useEffect } from "react";
import type { ReviewCardItem } from "../types";
import {
  evaluateSpellingInput,
  generateHintDisplay,
} from "@/core/reviewQuiz";
import { resolvePhonetic } from "@/core/phonetic";
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

  // Phím tắt bàn phím khi đã kiểm tra đáp án: 1, 2, 3, 4 hoặc Space/Enter chọn Tốt [3]
  useEffect(() => {
    if (!hasChecked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "1") {
        e.preventDefault();
        onCardCompleted(1);
      } else if (e.key === "2") {
        e.preventDefault();
        onCardCompleted(2);
      } else if (e.key === "3" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onCardCompleted(3);
      } else if (e.key === "4") {
        e.preventDefault();
        onCardCompleted(4);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasChecked, onCardCompleted]);

  // Tạo câu đục lỗ bằng dấu sao che từ
  const renderClozeAsterisks = (sentence?: string, targetWord?: string) => {
    if (!sentence || !targetWord) return null;
    const cleanWord = targetWord.trim();
    const escapedWord = cleanWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escapedWord}\\b`, "gi");

    const parts = sentence.split(regex);
    const asterisks = "*".repeat(cleanWord.length);

    if (parts.length > 1) {
      return (
        <span>
          {parts.map((part, idx) => (
            <span key={idx}>
              {part}
              {idx < parts.length - 1 && (
                <strong className="text-rose-600 font-mono tracking-wider font-bold">
                  {asterisks}
                </strong>
              )}
            </span>
          ))}
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
      inputRef.current?.blur();
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
      inputRef.current?.blur();
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
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const hintDisplay = generateHintDisplay(card.word, hintLevel);

  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 space-y-3 sm:space-y-3.5 animate-in fade-in duration-200">
      {/* 1. Category Tag & Nghĩa tiếng Việt chính (Nhỏ gọn, Zero-Scroll) */}
      <div className="flex flex-col items-center justify-center text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-mono font-semibold">
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span className="uppercase tracking-wider">{card.metadata?.topic || "TOEIC"}</span>
        </div>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-extrabold text-blue-600 tracking-tight">
            {card.meaning}
          </h2>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {posInfo.labelVi}
          </span>
        </div>
      </div>

      {/* 2. Định nghĩa Tiếng Anh & Ngữ cảnh đục lỗ */}
      <div className="space-y-1.5 text-center max-w-lg mx-auto">
        {card.metadata?.detailed_explanation && (
          <div className="space-y-0.5">
            <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              Định nghĩa Tiếng Anh
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-snug font-medium line-clamp-3">
              {card.metadata.detailed_explanation}
            </p>
          </div>
        )}

        {card.context_sentence && (
          <div className="pt-1.5 border-t border-slate-100 space-y-0.5">
            <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              Ví dụ
            </div>
            <p className="text-xs sm:text-sm text-slate-900 italic font-medium leading-snug">
              &ldquo;{renderClozeAsterisks(card.context_sentence, card.word)}&rdquo;
            </p>
            {card.context_translation && (
              <p className="text-[11px] text-slate-500">
                {card.context_translation}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 3. Ô Gợi ý số ký tự (Viền nét đứt) */}
      <div className="flex flex-col items-center justify-center gap-1.5 pt-0.5">
        <div className="px-4 py-1.5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/80 font-mono text-base font-bold tracking-[0.25em] text-slate-700 select-none">
          {hintDisplay}
        </div>

        {/* Nút Gợi ý */}
        <button
          type="button"
          onClick={handleRequestHint}
          disabled={hintLevel >= 4 || hasChecked}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
        >
          <Lightbulb className="w-3 h-3 text-amber-600" />
          <span>
            {hintLevel === 0
              ? "Gợi ý chữ cái"
              : hintLevel === 1
              ? "Gợi ý thêm chữ cuối"
              : `Gợi ý (Mức ${hintLevel})`}
          </span>
        </button>
      </div>

      {/* 4. Ô nhập text hoặc Kết quả & Rating FSRS */}
      <div className="w-full max-w-md mx-auto space-y-2">
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
                className="w-full h-11 px-3 text-center rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:outline-hidden text-base font-medium text-slate-900 transition-all shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>

            {/* Thông báo lỗi nhẹ (Typo tolerance) */}
            {warningMessage && (
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{warningMessage}</span>
              </div>
            )}

            {/* Nút Primary duy nhất: Kiểm tra */}
            <button
              type="button"
              onClick={handleCheck}
              disabled={!inputValue.trim()}
              className="w-full h-11 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              <span>Kiểm tra đáp án</span>
              <span className="text-[11px] font-mono opacity-80">(Phím Enter)</span>
            </button>
          </div>
        ) : (
          /* Trạng thái đã kiểm tra: Đúng hoặc Sai */
          <div className="space-y-2.5 animate-in zoom-in-95 duration-150">
            {isExactMatch ? (
              <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Chính xác tuyệt đối!</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {card.word}
                  </span>
                  <button
                    type="button"
                    onClick={() => playPronunciation(card.word)}
                    className="p-1 rounded-full text-blue-600 hover:bg-blue-100/70 transition-colors cursor-pointer"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                {phonetic && (
                  <div className="text-sm font-ipa font-normal text-slate-600 tracking-wide select-all">
                    {phonetic}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2.5 sm:p-3 rounded-xl bg-rose-50 border border-rose-200 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-rose-700 font-bold text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>Chưa chính xác!</span>
                </div>
                <div className="text-xs text-rose-800">
                  Bạn đã nhập: <strong className="line-through">{inputValue}</strong>
                </div>
                <div className="pt-0.5 flex items-center justify-center gap-2">
                  <span className="text-lg sm:text-xl font-extrabold text-emerald-700">
                    {card.word}
                  </span>
                  <AudioSpeakerButton word={card.word} size="sm" />
                </div>
                {phonetic && (
                  <div className="text-sm font-ipa font-normal text-slate-600 tracking-wide select-all">
                    {phonetic}
                  </div>
                )}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Thử gõ lại từ này</span>
                  </button>
                </div>
              </div>
            )}

            {/* Các nút chuyển tiếp hoặc đánh giá FSRS (hỗ trợ phím tắt 1, 2, 3, 4, Enter, Space) */}
            <div className="pt-0.5 space-y-1.5">
              <div className="text-[11px] font-mono text-slate-500 text-center">
                Mức độ ghi nhớ thẻ này <span className="hidden sm:inline font-normal">(Phím 1, 2, 3, 4)</span>:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => onCardCompleted(1)}
                  className="h-11 rounded-xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1 cursor-pointer active:scale-98"
                >
                  <span className="font-mono opacity-70">[1]</span> Lại
                </button>
                <button
                  type="button"
                  onClick={() => onCardCompleted(2)}
                  className="h-11 rounded-xl text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors flex items-center justify-center gap-1 cursor-pointer active:scale-98"
                >
                  <span className="font-mono opacity-70">[2]</span> Khó
                </button>
                <button
                  type="button"
                  onClick={() => onCardCompleted(3)}
                  className="h-11 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs active:scale-98"
                >
                  <span className="font-mono opacity-90">[3]</span> Tốt
                </button>
                <button
                  type="button"
                  onClick={() => onCardCompleted(4)}
                  className="h-11 rounded-xl text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 cursor-pointer active:scale-98"
                >
                  <span className="font-mono opacity-70">[4]</span> Dễ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
