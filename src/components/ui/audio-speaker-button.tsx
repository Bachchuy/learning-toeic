"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { playPronunciation } from "@/lib/audio";

interface AudioSpeakerButtonProps {
  word: string;
  audioUrl?: string;
  posHint?: "noun" | "verb";
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AudioSpeakerButton({
  word,
  audioUrl,
  posHint,
  label,
  size = "md",
  className = "",
}: AudioSpeakerButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    try {
      await playPronunciation(word, audioUrl, posHint);
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
    sm: label ? "px-2 py-0.5 gap-1" : "p-1",
    md: label ? "px-2.5 py-1 gap-1.5" : "p-1.5",
    lg: label ? "px-3 py-1.5 gap-2" : "p-2",
  };

  const posTitle =
    posHint === "noun"
      ? "danh từ"
      : posHint === "verb"
      ? "động từ"
      : "";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`rounded-full transition-all duration-150 active:scale-[0.92] cursor-pointer inline-flex items-center justify-center shrink-0 ${
        isPlaying
          ? "bg-[#EFF6FF] text-[#2563EB] ring-2 ring-[#2563EB]/30 animate-pulse"
          : label
          ? "bg-slate-100 hover:bg-[#EFF6FF] text-slate-700 hover:text-[#2563EB] border border-slate-200"
          : "bg-slate-100 hover:bg-[#EFF6FF] text-slate-500 hover:text-[#2563EB]"
      } ${btnPaddings[size]} ${className}`}
      title={`Nghe phát âm chuẩn ${posTitle ? `(${posTitle}) ` : ""}: ${word}`}
      aria-label={`Nghe phát âm từ ${word} ${posTitle}`}
    >
      {label && (
        <span className="text-[10px] font-mono font-bold uppercase">{label}</span>
      )}
      <Volume2 className={iconSizes[size]} />
    </button>
  );
}
