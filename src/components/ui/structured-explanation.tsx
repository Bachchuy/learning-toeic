import React from "react";
import { BookOpen, FileText, Lightbulb, Languages } from "lucide-react";
import type { OptionLetter } from "@/core/explanationQuality";

export interface StructuredExplanationViewData {
  questionTypeVi?: string | null;
  ruleVi?: string | null;
  evidence?: string | null;
  whyCorrectVi?: string | null;
  optionsAnalysis?: Partial<Record<OptionLetter, string>> | null;
  tipVi?: string | null;
  translationVi?: string | null;
  vocabHints?: Array<{ word: string; meaning_vi: string }>;
  /** Dữ liệu văn bản cũ fallback khi chưa nâng cấp sang JSON chi tiết */
  legacySummary?: string | null;
}

interface StructuredExplanationBlockProps {
  data: StructuredExplanationViewData;
  options?: readonly string[];
  correctIndex?: number | null;
  userSelectedIndex?: number | null;
  evidenceLabel?: string;
}

const LETTERS: readonly OptionLetter[] = ["A", "B", "C", "D"];

/**
 * Khối hiển thị lời giải sư phạm dùng chung cho Part 6, Part 7 và kết quả Thi thử (Part 1–7).
 * Tuân thủ 100% bảng token Precision Swiss và không chứa hex ngoài danh sách được cấp phép.
 */
export function StructuredExplanationBlock({
  data,
  options,
  correctIndex,
  userSelectedIndex,
  evidenceLabel = "Trích dẫn bằng chứng trong bài:",
}: StructuredExplanationBlockProps) {
  const optionEntries = LETTERS.map((letter, idx) => ({
    letter,
    idx,
    text: options?.[idx],
    reason: data.optionsAnalysis?.[letter]?.trim(),
  })).filter((item) => Boolean(item.reason));

  const hasAny =
    Boolean(data.questionTypeVi?.trim()) ||
    Boolean(data.ruleVi?.trim()) ||
    Boolean(data.evidence?.trim()) ||
    Boolean(data.whyCorrectVi?.trim()) ||
    optionEntries.length > 0 ||
    Boolean(data.tipVi?.trim()) ||
    Boolean(data.translationVi?.trim()) ||
    Boolean(data.legacySummary?.trim());

  if (!hasAny) {
    return null;
  }

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3 text-xs leading-relaxed text-[#0F172A]">
      {(data.questionTypeVi || data.ruleVi) && (
        <div className="space-y-1.5">
          {data.questionTypeVi && (
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] border border-[#E2E8F0] font-mono text-[11px] font-bold">
              {data.questionTypeVi}
            </span>
          )}
          {data.ruleVi && (
            <div className="flex items-start gap-2 text-[#0F172A]">
              <BookOpen
                className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <p className="min-w-0 break-words">
                <strong className="text-[#0F172A]">Quy tắc / Chiến lược: </strong>
                <span>{data.ruleVi}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {data.evidence && (
        <div className="space-y-1">
          <span className="font-bold text-[#0F172A] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#2563EB]" aria-hidden="true" />
            <span>{evidenceLabel}</span>
          </span>
          <blockquote className="italic text-[#475569] pl-3 border-l-2 border-[#2563EB] bg-[#FFFFFF] p-2 rounded-r-md break-words">
            &ldquo;{data.evidence}&rdquo;
          </blockquote>
        </div>
      )}

      {(data.whyCorrectVi || data.legacySummary) && (
        <div className="space-y-1">
          <span className="font-bold text-[#2563EB]">
            {data.whyCorrectVi ? "Lý do chọn đáp án đúng:" : "Phân tích sư phạm:"}
          </span>
          <p className="text-[#0F172A] whitespace-pre-line break-words">
            {data.whyCorrectVi || data.legacySummary}
          </p>
        </div>
      )}

      {optionEntries.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#475569]">
            Phân tích từng phương án:
          </div>
          <ul className="space-y-2">
            {optionEntries.map(({ letter, idx, text, reason }) => {
              const isCorrect = correctIndex !== null && correctIndex !== undefined && idx === correctIndex;
              const isWrongSelected =
                !isCorrect &&
                userSelectedIndex !== null &&
                userSelectedIndex !== undefined &&
                idx === userSelectedIndex;

              return (
                <li
                  key={letter}
                  className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                    isCorrect
                      ? "bg-[#ECFDF5] border-[#A7F3D0]"
                      : isWrongSelected
                        ? "bg-[#FFF1F2] border-[#FECDD3]"
                        : "bg-[#FFFFFF] border-[#E2E8F0]"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-[6px] flex items-center justify-center font-mono text-[11px] font-bold shrink-0 mt-0.5 border ${
                      isCorrect
                        ? "bg-[#047857] text-[#FFFFFF] border-[#047857]"
                        : isWrongSelected
                          ? "bg-[#BE123C] text-[#FFFFFF] border-[#BE123C]"
                          : "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]"
                    }`}
                  >
                    {letter}
                  </span>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    {(text || isCorrect || isWrongSelected) && (
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        {text && (
                          <span className="font-semibold text-[#0F172A] break-words">
                            {text}
                          </span>
                        )}
                        {isCorrect && (
                          <span className="text-[11px] font-mono font-bold text-[#047857]">
                            (Đúng)
                          </span>
                        )}
                        {isWrongSelected && (
                          <span className="text-[11px] font-mono font-bold text-[#BE123C]">
                            (Bạn chọn · Sai)
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-[#0F172A] break-words">{reason}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {data.tipVi && (
        <div className="p-2.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] border-l-4 border-l-[#B45309] flex items-start gap-2">
          <Lightbulb
            className="w-3.5 h-3.5 text-[#B45309] shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="min-w-0 break-words text-[#0F172A]">
            <strong className="text-[#B45309]">Mẹo nhanh: </strong>
            <span>{data.tipVi}</span>
          </div>
        </div>
      )}

      {data.translationVi && (
        <div className="space-y-1 pt-2 border-t border-[#E2E8F0]">
          <span className="font-bold text-[#475569] flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-[#475569]" aria-hidden="true" />
            <span>Dịch nghĩa:</span>
          </span>
          <p className="text-[#475569] italic break-words whitespace-pre-line">
            {data.translationVi}
          </p>
        </div>
      )}

      {data.vocabHints && data.vocabHints.length > 0 && (
        <div className="pt-2 border-t border-[#E2E8F0] flex flex-wrap gap-1.5">
          {data.vocabHints.map((v) => (
            <span
              key={v.word}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#E2E8F0] text-[11px] text-[#0F172A]"
            >
              <strong className="font-semibold">{v.word}</strong>
              <span className="text-[#475569]">({v.meaning_vi})</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
