"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { playPronunciation } from "@/lib/audio";

interface AudioSpeakerButtonProps {
  word: string;
  audioUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AudioSpeakerButton({
  word,
  audioUrl,
  size = "md",
  className = "",
}: AudioSpeakerButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    try {
      await playPronunciation(word, audioUrl);
    } finally {
      setTimeout(() => setIsPlaying(false), 600);
    }
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const btnPaddings = {
    sm: "p-1",
    md: "p-1.5",
    lg: "p-2",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`rounded-full transition-all duration-150 active:scale-[0.92] cursor-pointer flex items-center justify-center shrink-0 ${
        isPlaying
          ? "bg-[#EFF6FF] text-[#2563EB] ring-2 ring-[#2563EB]/30 animate-pulse"
          : "bg-slate-100 hover:bg-[#EFF6FF] text-slate-500 hover:text-[#2563EB]"
      } ${btnPaddings[size]} ${className}`}
      title={`Nghe phát âm chuẩn: ${word}`}
      aria-label={`Nghe phát âm từ ${word}`}
    >
      <Volume2 className={iconSizes[size]} />
    </button>
  );
}
