"use client";

import { useEffect, useRef, useState } from "react";
import { Headphones, Pause, Play, RotateCcw, Volume2 } from "lucide-react";

export interface SpeechSegment {
  speaker?: string;
  text: string;
}

interface ListeningAudioPlayerProps {
  title: string;
  audioUrl?: string;
  segments: SpeechSegment[];
}

const SPEED_OPTIONS = [0.85, 1, 1.15] as const;

function resolveSpeakerPitch(speaker?: string): number {
  const s = (speaker || "").toUpperCase();
  if (s.startsWith("W2")) return 1.16;
  if (s.startsWith("W")) return 1.08;
  if (s.startsWith("M2")) return 0.84;
  if (s.startsWith("M")) return 0.92;
  return 1.0;
}

export function ListeningAudioPlayer({
  title,
  audioUrl,
  segments,
}: ListeningAudioPlayerProps) {
  const [status, setStatus] = useState<"idle" | "playing" | "paused">("idle");
  const [speed, setSpeed] = useState<(typeof SPEED_OPTIONS)[number]>(1);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackRunIdRef = useRef(0);

  const stopPlayback = () => {
    playbackRunIdRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  useEffect(() => {
    return () => {
      playbackRunIdRef.current += 1;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const speakFromIndex = (startIdx: number, rate: number) => {
    if (typeof window === "undefined") return;

    if ("speechSynthesis" in window && segments.length > 0) {
      window.speechSynthesis.cancel();
      const runId = ++playbackRunIdRef.current;

      const playStep = (idx: number) => {
        if (playbackRunIdRef.current !== runId) return;
        if (idx >= segments.length) {
          setStatus("idle");
          setSegmentIndex(0);
          return;
        }

        const seg = segments[idx];
        setSegmentIndex(idx);
        const utterance = new SpeechSynthesisUtterance(seg.text);
        utterance.lang = "en-US";
        utterance.rate = rate;
        utterance.pitch = resolveSpeakerPitch(seg.speaker);

        const voices = window.speechSynthesis.getVoices();
        const enUsVoice = voices.find((v) =>
          v.lang.toLowerCase().startsWith("en-us")
        );
        if (enUsVoice) {
          utterance.voice = enUsVoice;
        }

        utterance.onend = () => {
          if (playbackRunIdRef.current !== runId) return;
          playStep(idx + 1);
        };
        utterance.onerror = () => {
          if (playbackRunIdRef.current !== runId) return;
          setStatus("idle");
          setAudioNotice(
            "Trình duyệt không phát được giọng đọc tự động. Bạn có thể mở Transcript hỗ trợ tự học bên dưới."
          );
        };

        window.speechSynthesis.speak(utterance);
      };

      setAudioNotice(null);
      setStatus("playing");
      playStep(startIdx);
      return;
    }

    // Fallback ngắn qua /api/audio/tts nếu trình duyệt thiếu speechSynthesis
    const joined = segments
      .map((s) => s.text)
      .join(" ")
      .slice(0, 190);
    if (!joined) return;
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.src = `/api/audio/tts?text=${encodeURIComponent(joined)}`;
    audio.playbackRate = rate;
    audio.onended = () => setStatus("idle");
    audio.onerror = () => {
      setStatus("idle");
      setAudioNotice(
        "Không thể phát âm thanh trên thiết bị này. Bạn có thể mở Transcript hỗ trợ tự học."
      );
    };
    setAudioNotice(null);
    setStatus("playing");
    void audio.play().catch(() => {
      setStatus("idle");
    });
  };

  const handlePlayOrPause = () => {
    if (audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
      }
      const audio = audioRef.current;
      audio.playbackRate = speed;
      audio.onended = () => setStatus("idle");
      audio.onerror = () => {
        setStatus("idle");
        setAudioNotice("Không tải được file âm thanh của câu này.");
      };

      if (status === "playing") {
        audio.pause();
        setStatus("paused");
      } else {
        setAudioNotice(null);
        setStatus("playing");
        void audio.play().catch(() => setStatus("idle"));
      }
      return;
    }

    if (status === "playing") {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        playbackRunIdRef.current += 1;
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setStatus("paused");
      return;
    }

    speakFromIndex(status === "paused" ? segmentIndex : 0, speed);
  };

  const handleReplay = () => {
    stopPlayback();
    setSegmentIndex(0);
    if (audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
      }
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = speed;
      audioRef.current.onended = () => setStatus("idle");
      setStatus("playing");
      void audioRef.current.play().catch(() => setStatus("idle"));
      return;
    }
    speakFromIndex(0, speed);
  };

  const handleSpeedChange = (nextSpeed: (typeof SPEED_OPTIONS)[number]) => {
    setSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
    if (!audioUrl && status === "playing") {
      speakFromIndex(segmentIndex, nextSpeed);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] flex items-center justify-center shrink-0">
            <Headphones className="w-4 h-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#0F172A] truncate">
              {title}
            </div>
            <div className="text-[11px] font-mono text-[#475569]">
              {audioUrl
                ? "Audio chuẩn phòng thi"
                : segments.length > 1
                  ? `Đoạn thoại ${Math.min(segmentIndex + 1, segments.length)}/${segments.length} · en-US TTS`
                  : "Giọng đọc en-US TTS"}
            </div>
          </div>
        </div>

        {/* Điều chỉnh tốc độ đọc */}
        <div className="flex items-center gap-1" role="group" aria-label="Tốc độ phát">
          {SPEED_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleSpeedChange(opt)}
              aria-pressed={speed === opt}
              className={`min-h-[36px] px-2.5 rounded-md font-mono text-xs font-semibold border transition-colors cursor-pointer ${
                speed === opt
                  ? "bg-[#2563EB] text-white border-[#2563EB]"
                  : "bg-white text-[#475569] border-[#E2E8F0] hover:text-[#0F172A]"
              }`}
            >
              {opt}x
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handlePlayOrPause}
          className="min-h-[44px] px-4 rounded-lg bg-white hover:bg-[#EFF6FF] border border-[#8190A6] text-xs font-semibold text-[#0F172A] inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          {status === "playing" ? (
            <>
              <Pause className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
              <span>Tạm dừng audio</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
              <span>{status === "paused" ? "Nghe tiếp" : "Nghe đoạn audio"}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleReplay}
          className="min-h-[44px] px-3.5 rounded-lg bg-white hover:bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-medium text-[#475569] hover:text-[#0F172A] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Nghe lại từ đầu</span>
        </button>

        {status === "playing" && (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#2563EB] px-2">
            <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Đang phát...</span>
          </span>
        )}
      </div>

      {audioNotice && (
        <p className="text-xs text-[#B45309] bg-[#FFFBEB] border border-[#FDE68A] rounded-lg px-3 py-2">
          {audioNotice}
        </p>
      )}
    </div>
  );
}
