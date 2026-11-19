"use client";

import { createContext, useContext, useState } from "react";
import { Eye } from "lucide-react";
import { splitTextWithHighlights } from "@/core/lessonHighlightUtils";

export const LessonHighlightsContext = createContext<Record<string, string[]>>(
  {}
);

export function useLessonHighlights() {
  return useContext(LessonHighlightsContext);
}

/**
 * Hiển thị bản dịch tiếng Việt hoặc ẩn để người học Ẩn dịch (Active Recall).
 */
export function RecallableTranslation({
  textVi,
  recallMode,
  prefix = "→ ",
}: {
  textVi: string;
  recallMode: boolean;
  prefix?: string;
}) {
  const [revealed, setRevealed] = useState(false);

  if (!recallMode || revealed) {
    return (
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-[13px] text-[#475569]">
        <span className="italic">
          {prefix}
          {textVi}
        </span>
        {recallMode && revealed && (
          <button
            type="button"
            onClick={() => setRevealed(false)}
            className="text-[11px] font-mono font-semibold text-[#475569] hover:text-[#0F172A] underline cursor-pointer shrink-0"
          >
            Ẩn lại
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      aria-expanded={false}
      className="inline-flex items-center gap-1.5 min-h-[36px] px-2.5 py-1 rounded-md bg-[#F1F5F9] hover:bg-[#EFF6FF] text-[#475569] hover:text-[#2563EB] border border-dashed border-[#8190A6] text-[12px] font-medium transition-colors cursor-pointer text-left"
    >
      <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>Chạm để xem nghĩa tiếng Việt</span>
    </button>
  );
}

/**
 * Tô sáng và gạch chân cụm từ khóa / cấu trúc trọng tâm trong câu ví dụ tiếng Anh.
 */
export function HighlightedExample({
  text,
  explicitHighlight,
  tone = "primary",
}: {
  text: string;
  explicitHighlight?: string | string[];
  tone?: "primary" | "invertedPrimary" | "warning";
}) {
  const highlightsMap = useLessonHighlights();
  const highlights = explicitHighlight
    ? Array.isArray(explicitHighlight)
      ? explicitHighlight.filter(Boolean)
      : [explicitHighlight]
    : highlightsMap[text] ?? [];
  const segments = splitTextWithHighlights(text, highlights);

  const markClass =
    tone === "invertedPrimary"
      ? "bg-white text-[#1D4ED8] font-semibold px-1 py-0.5 rounded-[4px] underline decoration-[#2563EB] decoration-2 underline-offset-4"
      : tone === "warning"
        ? "bg-white text-[#B45309] font-semibold px-1 py-0.5 rounded-[4px] underline decoration-[#B45309] decoration-2 underline-offset-4"
        : "bg-[#EFF6FF] text-[#1D4ED8] font-semibold px-1 py-0.5 rounded-[4px] underline decoration-[#2563EB] decoration-2 underline-offset-4";

  return (
    <>
      {segments.map((seg, idx) =>
        seg.highlighted ? (
          <mark key={idx} className={markClass}>
            {seg.text}
          </mark>
        ) : (
          <span key={idx}>{seg.text}</span>
        )
      )}
    </>
  );
}
