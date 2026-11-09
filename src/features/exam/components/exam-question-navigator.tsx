"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import type { ReadingQuestionItem } from "../types";

interface ExamQuestionNavigatorProps {
  questions: ReadingQuestionItem[];
  currentIdx: number;
  userAnswers: Record<string, number>;
  flaggedIds: Set<string>;
  onSelectQuestion: (index: number) => void;
  totalQuestions: number;
}

export function ExamQuestionNavigator({
  questions,
  currentIdx,
  userAnswers,
  flaggedIds,
  onSelectQuestion,
  totalQuestions,
}: ExamQuestionNavigatorProps) {
  const [paletteFilter, setPaletteFilter] = useState<
    "all" | "p5" | "p6" | "p7" | "flagged" | "unanswered"
  >("all");

  const answeredCount = Object.keys(userAnswers).length;

  // Lọc câu hỏi trong Question Palette
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (paletteFilter === "p5") return q.part === 5;
      if (paletteFilter === "p6") return q.part === 6;
      if (paletteFilter === "p7") return q.part === 7;
      if (paletteFilter === "flagged") return flaggedIds.has(q.id);
      if (paletteFilter === "unanswered") return userAnswers[q.id] === undefined;
      return true;
    });
  }, [questions, paletteFilter, flaggedIds, userAnswers]);

  return (
    <Card className="p-4 bg-white border border-[#E2E8F0] shadow-2xs sticky top-18">
      <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
        <div className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
          Bảng điều hướng câu hỏi (101 - 200)
        </div>
        <span className="text-[11px] text-[#475569]">
          Đã làm: {answeredCount}/{totalQuestions}
        </span>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-1 pt-2.5 pb-2 text-[11px]">
        {[
          { id: "all", label: "Tất cả" },
          { id: "p5", label: "Part 5 (30)" },
          { id: "p6", label: "Part 6 (16)" },
          { id: "p7", label: "Part 7 (54)" },
          { id: "flagged", label: `Cờ (${flaggedIds.size})` },
          { id: "unanswered", label: `Chưa làm (${totalQuestions - answeredCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPaletteFilter(tab.id as typeof paletteFilter)}
            className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              paletteFilter === tab.id
                ? "bg-[#2563EB] text-white"
                : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lưới 100 nút bấm câu hỏi */}
      <div className="max-h-[380px] overflow-y-auto pr-1 grid grid-cols-5 gap-1.5 pt-2">
        {filteredQuestions.map((q) => {
          const originalIndex = questions.findIndex((item) => item.id === q.id);
          const isAnswered = userAnswers[q.id] !== undefined;
          const isCurrent = originalIndex === currentIdx;
          const isFlagged = flaggedIds.has(q.id);

          return (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(originalIndex)}
              className={`relative h-9 rounded-md text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                isCurrent ? "ring-2 ring-[#2563EB] font-bold" : ""
              } ${
                isAnswered
                  ? "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
                  : "bg-white text-[#475569] border border-[#E2E8F0] hover:bg-[#F8FAFC]"
              }`}
            >
              <span>{q.questionNumber}</span>
              {isFlagged && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#B45309]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Ghi chú chú giải */}
      <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#475569]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#EFF6FF] border border-[#BFDBFE]" />
          <span>Đã làm</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-white border border-[#E2E8F0]" />
          <span>Chưa làm</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#B45309]" />
          <span>Đánh dấu</span>
        </div>
      </div>
    </Card>
  );
}
