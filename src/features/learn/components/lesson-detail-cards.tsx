"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  DetailedTopicSection,
  GrammarLesson,
  TenseComparison,
  TenseItem,
} from "@/core/grammarLessons";
import type { getRoadmapContextByTag } from "@/core/roadmap";
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
} from "lucide-react";
import {
  HighlightedExample,
  RecallableTranslation,
} from "./lesson-highlights-context";

export function DetailedSectionCard({
  sec,
  partNumber,
  minutes,
  recallMode,
}: {
  sec: DetailedTopicSection;
  partNumber: number;
  minutes: number;
  recallMode: boolean;
}) {
  return (
    <section className="p-5 sm:p-6 rounded-xl bg-white border border-[#E2E8F0] space-y-5">
      <div className="border-b border-[#F1F5F9] pb-3.5">
        <span className="text-[11px] font-mono font-bold uppercase tracking-[0.08em] text-[#2563EB]">
          Học phần {partNumber} · ~{minutes} phút
        </span>
        <h2 className="text-[18px] sm:text-[20px] font-bold text-[#0F172A] mt-0.5">
          {sec.title}
        </h2>
        {sec.description && (
          <p className="text-[13px] sm:text-[14px] text-[#475569] mt-1 leading-relaxed">
            {sec.description}
          </p>
        )}
      </div>

      {/* Bỏ thẻ lồng thẻ 3 lớp: dùng cấu trúc phẳng phân tách bằng đường kẻ mảnh + khối công thức nổi bật */}
      <div className="divide-y divide-[#E2E8F0]">
        {sec.rules.map((r, rIdx) => (
          <div key={rIdx} className="py-5 first:pt-0 last:pb-0 space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded bg-[#F1F5F9] border border-[#E2E8F0] text-[#0F172A] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                {String(rIdx + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[15px] sm:text-[16px] font-bold text-[#0F172A] leading-snug">
                {r.title}
              </h3>
            </div>

            {r.formula && (
              <div className="p-3 rounded-lg bg-[#F1F5F9] border-l-4 border-l-[#2563EB] font-mono text-[13px] font-bold text-[#0F172A] break-words">
                {r.formula}
              </div>
            )}

            <p className="text-[14px] text-[#0F172A] leading-[1.65]">
              {r.explanation}
            </p>

            {/* Ví dụ song ngữ sạch, hỗ trợ Ẩn dịch */}
            <div className="space-y-2.5">
              {r.examples.map((ex, exIdx) => (
                <div
                  key={exIdx}
                  className="pl-3.5 border-l-2 border-[#E2E8F0] space-y-1.5"
                >
                  <div className="text-[14px] text-[#0F172A] font-medium leading-[1.75]">
                    &ldquo;
                    <HighlightedExample
                      text={ex.en}
                      explicitHighlight={ex.highlight}
                    />
                    &rdquo;
                  </div>
                  <RecallableTranslation
                    textVi={ex.vi}
                    recallMode={recallMode}
                  />
                </div>
              ))}
            </div>

            {r.signals && r.signals.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-[#475569] mr-1">
                  Dấu hiệu:
                </span>
                {r.signals.map((sig, sIdx) => (
                  <span
                    key={sIdx}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
                  >
                    {sig}
                  </span>
                ))}
              </div>
            )}

            {r.tip && (
              <div className="p-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[13px] text-[#0F172A] flex items-start gap-2">
                <Lightbulb
                  className="w-4 h-4 shrink-0 text-[#2563EB] mt-0.5"
                  aria-hidden="true"
                />
                <div className="leading-[1.55]">
                  <span className="font-bold text-[#2563EB]">Mẹo Part 5: </span>
                  <span>{r.tip}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function ComparisonCard({
  comp,
  defaultOpen,
  recallMode,
}: {
  comp: TenseComparison;
  defaultOpen: boolean;
  recallMode: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl bg-[#FAFAF7] border border-[#E2E8F0] overflow-hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        className="w-full min-h-[48px] p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left hover:bg-[#F1F5F9]/70 transition-colors cursor-pointer"
      >
        <div className="space-y-1.5 min-w-0">
          <div className="text-[14px] sm:text-[15px] font-bold text-[#0F172A]">
            {comp.title}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] font-bold">
              {comp.pair[0]}
            </span>
            <span className="text-[#475569] font-sans font-semibold">vs</span>
            <span className="px-2 py-0.5 rounded bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] font-bold">
              {comp.pair[1]}
            </span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563EB] shrink-0">
          <span className="hidden sm:inline">
            {isOpen ? "Thu gọn" : "Xem đối chiếu"}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          )}
        </span>
      </button>

      {isOpen && (
        <div className="p-4 pt-2 border-t border-[#E2E8F0] space-y-3.5 bg-white">
          <p className="text-[13px] sm:text-[14px] text-[#0F172A] leading-[1.6] pt-1">
            {comp.explanation}
          </p>

          <div className="overflow-x-auto rounded-lg border border-[#E2E8F0] bg-white">
            <table className="w-full text-left text-[12.5px]">
              <thead>
                <tr className="bg-[#F1F5F9] border-b border-[#E2E8F0] text-[11px] font-mono uppercase tracking-wider text-[#475569]">
                  <th className="py-2 px-3 font-bold w-1/4">Khía cạnh</th>
                  <th className="py-2 px-3 font-bold text-[#2563EB] w-[37.5%]">
                    {comp.pair[0]}
                  </th>
                  <th className="py-2 px-3 font-bold text-[#B45309] w-[37.5%]">
                    {comp.pair[1]}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {comp.table.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="py-2 px-3 font-semibold text-[#0F172A] bg-[#F8FAFC]">
                      {row.aspect}
                    </td>
                    <td className="py-2 px-3 text-[#0F172A] leading-relaxed">
                      {row.tenseA}
                    </td>
                    <td className="py-2 px-3 text-[#0F172A] leading-relaxed">
                      {row.tenseB}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(comp.examplePairs || []).map((ex, eIdx) => (
            <div
              key={eIdx}
              className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-[12px]"
            >
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#475569]">
                {ex.context}
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] space-y-1.5">
                  <div className="font-mono font-medium text-[#0F172A] leading-[1.75]">
                    <HighlightedExample
                      text={ex.exampleA.en}
                      tone="invertedPrimary"
                    />
                  </div>
                  <RecallableTranslation
                    textVi={ex.exampleA.vi}
                    recallMode={recallMode}
                    prefix=""
                  />
                </div>
                <div className="p-2.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] space-y-1.5">
                  <div className="font-mono font-medium text-[#0F172A] leading-[1.75]">
                    <HighlightedExample text={ex.exampleB.en} tone="warning" />
                  </div>
                  <RecallableTranslation
                    textVi={ex.exampleB.vi}
                    recallMode={recallMode}
                    prefix=""
                  />
                </div>
              </div>
              <div className="text-[#475569] leading-relaxed">
                <span className="font-semibold text-[#0F172A]">Bản chất: </span>
                {ex.insight}
              </div>
            </div>
          ))}

          {comp.toeicTrap && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[12px] text-[#0F172A]">
              <AlertTriangle
                className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <span className="font-bold text-[#B45309]">
                  Lưu ý phòng bẫy:{" "}
                </span>
                {comp.toeicTrap}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PracticeBridgeSection({
  lesson,
  roadmapContext,
  solvedCount,
  correctSolvedCount,
  totalExercises,
}: {
  lesson: GrammarLesson;
  roadmapContext: ReturnType<typeof getRoadmapContextByTag>;
  solvedCount: number;
  correctSolvedCount: number;
  totalExercises: number;
}) {
  return (
    <section
      aria-labelledby="practice-cta-heading"
      className="p-5 sm:p-7 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-center space-y-4"
    >
      <div className="max-w-md mx-auto space-y-1.5">
        {solvedCount > 0 && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white border border-[#BFDBFE] text-[11px] font-mono font-semibold text-[#2563EB] tabular-nums">
            Tự luyện tại chỗ: {correctSolvedCount}/{totalExercises} câu đúng
          </div>
        )}
        <h2
          id="practice-cta-heading"
          className="text-[18px] sm:text-[21px] font-bold text-[#0F172A]"
        >
          Đã hoàn thành lý thuyết chủ điểm này?
        </h2>
        <p className="text-[13px] sm:text-[14px] text-[#475569] leading-relaxed">
          Chuyển sang làm phiên luyện Part 5 chính thức về &ldquo;
          {lesson.titleVi}&rdquo; để ghi nhận điểm thành thạo vào lộ trình.
        </p>
      </div>

      <div className="pt-1 space-y-3">
        <Link
          href={`/practice/new?topic=${lesson.tagCode}`}
          className="inline-flex items-center justify-center gap-2 px-7 h-12 rounded-lg text-[15px] font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2 w-full sm:w-auto"
        >
          <span>Luyện tập ngay 5 câu về chủ điểm này</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>

        {roadmapContext?.nextStep && (
          <div>
            <Link
              href={`/learn/${roadmapContext.nextStep.tagCode}`}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg text-[13px] font-semibold text-[#2563EB] hover:underline"
            >
              <span>
                Bước tiếp theo trong lộ trình: Bước{" "}
                {roadmapContext.nextStep.order} —{" "}
                {roadmapContext.nextStep.nameVi}
              </span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Component hiển thị chi tiết một Thì động từ theo bố cục phẳng, bảng cấu trúc 3 thể gọn mắt.
 */
export function TenseCard({
  tense,
  index,
  recallMode,
}: {
  tense: TenseItem;
  index: number;
  recallMode: boolean;
}) {
  return (
    <div className="space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <span className="w-6 h-6 rounded bg-[#EFF6FF] text-[#2563EB] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-1 tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2563EB] block">
              {tense.nameEn}
            </span>
            <h4 className="text-[16px] sm:text-[17px] font-bold text-[#0F172A] leading-tight mt-0.5">
              {tense.nameVi}
            </h4>
          </div>
        </div>
        <span className="self-start sm:self-auto px-2.5 py-0.5 rounded text-[11px] font-medium bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
          {tense.groupVi}
        </span>
      </div>

      {/* Bảng công thức 3 thể gọn 1 khung thay vì 3 thẻ rời */}
      <div className="rounded-lg border border-[#E2E8F0] overflow-hidden bg-[#F8FAFC] divide-y divide-[#E2E8F0] text-[12px] sm:text-[13px]">
        <div className="grid grid-cols-[96px_minmax(0,1fr)] items-baseline">
          <span className="px-3 py-2 font-sans text-[11px] font-bold uppercase text-[#047857] bg-[#ECFDF5]">
            (+) Khẳng định
          </span>
          <span className="px-3 py-2 font-mono font-semibold text-[#0F172A] break-words bg-white">
            {tense.formula.affirmative}
          </span>
        </div>
        <div className="grid grid-cols-[96px_minmax(0,1fr)] items-baseline">
          <span className="px-3 py-2 font-sans text-[11px] font-bold uppercase text-[#BE123C] bg-[#FFF1F2]">
            (-) Phủ định
          </span>
          <span className="px-3 py-2 font-mono font-semibold text-[#0F172A] break-words bg-white">
            {tense.formula.negative}
          </span>
        </div>
        <div className="grid grid-cols-[96px_minmax(0,1fr)] items-baseline">
          <span className="px-3 py-2 font-sans text-[11px] font-bold uppercase text-[#2563EB] bg-[#EFF6FF]">
            (?) Nghi vấn
          </span>
          <span className="px-3 py-2 font-mono font-semibold text-[#0F172A] break-words bg-white">
            {tense.formula.question}
          </span>
        </div>
      </div>

      {/* Cách dùng và ví dụ (hỗ trợ Ẩn dịch) */}
      <div className="space-y-3">
        {tense.usages.map((usage, idx) => (
          <div
            key={idx}
            className="pl-3.5 border-l-2 border-[#E2E8F0] space-y-1 text-[13px]"
          >
            <div className="font-bold text-[#0F172A]">{usage.context}</div>
            <p className="text-[#475569] text-[13px] leading-[1.6]">
              {usage.explanation}
            </p>
            <div className="pt-1 space-y-1">
              <div className="font-medium text-[#0F172A] leading-[1.75]">
                &ldquo;
                <HighlightedExample text={usage.exampleEn} />
                &rdquo;
              </div>
              <RecallableTranslation
                textVi={usage.exampleVi}
                recallMode={recallMode}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Dấu hiệu nhận biết */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-[#475569] mr-1">
          Dấu hiệu:
        </span>
        {tense.signals.map((sig, sIdx) => (
          <span
            key={sIdx}
            className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
          >
            {sig}
          </span>
        ))}
      </div>

      {tense.stativeVerbNote && (
        <div className="p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[12px] text-[#0F172A] flex items-start gap-2">
          <Info
            className="w-4 h-4 shrink-0 text-[#B45309] mt-0.5"
            aria-hidden="true"
          />
          <span className="leading-relaxed">{tense.stativeVerbNote}</span>
        </div>
      )}

      <div className="p-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[12px] sm:text-[13px] text-[#0F172A] flex items-start gap-2">
        <Lightbulb
          className="w-4 h-4 shrink-0 text-[#2563EB] mt-0.5"
          aria-hidden="true"
        />
        <div>
          <span className="font-bold text-[#2563EB]">Mẹo Part 5: </span>
          <span>{tense.toeicTip}</span>
        </div>
      </div>
    </div>
  );
}
