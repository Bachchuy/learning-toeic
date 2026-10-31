"use client";

import { useState, useEffect } from "react";
import type { ReviewCardItem } from "../types";
import { resolvePhonetic } from "@/core/phonetic";
import { getPosBadgeInfo } from "@/core/vocab";
import { playPronunciation } from "@/lib/audio";
import { evaluateSpellingInput } from "@/core/reviewQuiz";
import {
  Volume2,
  Mic,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

interface SpeakingModeCardProps {
  card: ReviewCardItem;
  onCardCompleted: (rating: 1 | 2 | 3 | 4) => void;
  audioSpeed?: number;
}

export function SpeakingModeCard({
  card,
  onCardCompleted,
  audioSpeed = 1.0,
}: SpeakingModeCardProps) {
  const [speed, setSpeed] = useState<number>(audioSpeed);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<"exact" | "close" | "miss" | null>(null);

  // Kiểm tra hỗ trợ Web Speech API
  const isSpeechSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const posInfo = getPosBadgeInfo(card.part_of_speech, card.meaning, card.word);
  const phonetic = resolvePhonetic(card.word, card.phonetic || card.metadata?.phonetic);

  // Tự động phát âm khi vào thẻ
  useEffect(() => {
    playPronunciation(card.word, card.audio_url || card.metadata?.audio_url);
  }, [card.word, card.audio_url, card.metadata?.audio_url]);

  const handlePlayAudio = () => {
    setIsPlaying(true);
    playPronunciation(card.word, card.audio_url || card.metadata?.audio_url);
    setTimeout(() => setIsPlaying(false), 1200);
  };

  // Khởi động nhận diện giọng nói
  const handleStartListening = () => {
    if (typeof window === "undefined") return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;

      setIsListening(true);
      setSpokenText(null);
      setMatchResult(null);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript || "";
        setSpokenText(transcript);
        setIsListening(false);

        const evaluation = evaluateSpellingInput(transcript, card.word);
        if (evaluation.isExact) {
          setMatchResult("exact");
        } else if (evaluation.isClose) {
          setMatchResult("close");
        } else {
          setMatchResult("miss");
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 space-y-4 text-center animate-in fade-in duration-200">
      {/* 1. Header loại từ */}
      <div className="flex items-center justify-center gap-2">
        <span
          className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold uppercase border ${posInfo.badgeClass}`}
        >
          {posInfo.shortBadge}
        </span>
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
          Phòng luyện phát âm & Shadowing
        </span>
      </div>

      {/* 2. Loa phát âm lớn ở trung tâm */}
      <div className="flex flex-col items-center justify-center gap-4 py-2">
        <button
          type="button"
          onClick={handlePlayAudio}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
            isPlaying
              ? "bg-blue-600 text-white scale-105 shadow-blue-200 ring-8 ring-blue-100"
              : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-102"
          }`}
          title="Bấm để nghe phát âm chuẩn US"
        >
          <Volume2 className="w-10 h-10" />
        </button>

        {/* Tốc độ đọc */}
        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setSpeed(1.0);
              playPronunciation(card.word, card.audio_url || card.metadata?.audio_url);
            }}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              speed === 1.0 ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600"
            }`}
          >
            1.0x Chuẩn
          </button>
          <button
            type="button"
            onClick={() => {
              setSpeed(0.8);
              playPronunciation(card.word, card.audio_url || card.metadata?.audio_url);
            }}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              speed === 0.8 ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600"
            }`}
          >
            0.8x Chậm
          </button>
        </div>
      </div>

      {/* 3. Từ vựng & Phiên âm IPA */}
      <div className="space-y-1.5">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {card.word}
        </h2>
        {phonetic && (
          <div className="text-base font-ipa text-slate-600 font-normal">
            {phonetic}
          </div>
        )}
        <div className="text-base sm:text-lg font-bold text-blue-600 pt-1">
          {card.meaning}
        </div>
      </div>

      {/* 4. Câu ví dụ luyện đọc nối âm */}
      {card.context_sentence && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm text-slate-800 space-y-1 max-w-lg mx-auto">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Luyện đọc nhại lại cả câu (Shadowing):
          </div>
          <p className="font-medium italic leading-relaxed">
            &ldquo;{card.context_sentence}&rdquo;
          </p>
          {card.context_translation && (
            <p className="text-slate-500 text-xs">
              {card.context_translation}
            </p>
          )}
        </div>
      )}

      {/* 5. Khối Thu âm nhận diện giọng nói hoặc Shadowing */}
      <div className="max-w-md mx-auto pt-2 space-y-3">
        {isSpeechSupported ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleStartListening}
              disabled={isListening}
              className={`w-full h-12 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                isListening
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>
                {isListening ? "Đang lắng nghe... Hãy nói ngay!" : "🎙️ Bấm để thu âm phát âm"}
              </span>
            </button>

            {/* Phản hồi nhận diện */}
            {spokenText && (
              <div
                className={`p-3.5 rounded-2xl border text-xs sm:text-sm animate-in zoom-in-95 ${
                  matchResult === "exact"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : matchResult === "close"
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 font-bold mb-1">
                  {matchResult === "exact" ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Phát âm xuất sắc! 100% chuẩn xác.</span>
                    </>
                  ) : matchResult === "close" ? (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Rất gần rồi! Máy nghe thấy: &ldquo;{spokenText}&rdquo;</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Máy nhận diện: &ldquo;{spokenText}&rdquo;. Hãy thử lại nhé!</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Trình duyệt không hỗ trợ Web Speech API Mic */
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            Trình duyệt của bạn đang bật chế độ Nghe & Lặp lại (Shadowing). Hãy nghe loa và tự phát âm to rõ 3 lần.
          </div>
        )}

        {/* Nút Primary duy nhất: Tiếp tục */}
        <button
          type="button"
          onClick={() => onCardCompleted(matchResult === "exact" ? 4 : 3)}
          className="w-full h-12 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <span>Thẻ tiếp theo</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
