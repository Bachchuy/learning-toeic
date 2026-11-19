"use client";

import { useState } from "react";
import type {
  GrammarLesson,
  GrammarLessonCheatSheetItem,
  LessonMicroModule,
} from "@/core/grammarLessons";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  XCircle,
  Zap,
} from "lucide-react";
import {
  HighlightedExample,
  RecallableTranslation,
} from "./lesson-highlights-context";
import {
  ComparisonCard,
  DetailedSectionCard,
  TenseCard,
} from "./lesson-detail-cards";

const TENSE_COMPARISON_BY_GROUP: Record<
  "present" | "past" | "future",
  string[]
> = {
  present: ["pres_cont_vs_pres_simp", "pres_perf_cont_vs_pres_perf"],
  past: [
    "pres_perf_vs_past_simp",
    "past_cont_vs_past_simp",
    "past_perf_vs_past_perf_cont",
  ],
  future: ["will_vs_be_going_to"],
};

/**
 * Ngăn tra nhanh Dấu hiệu 5 giây ở Rail phải (Desktop) hoặc Drawer inline (Mobile).
 */
export function QuickCheatSheetPanel({
  items,
  onClose,
}: {
  items: GrammarLessonCheatSheetItem[];
  onClose?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (items.length === 0) return null;

  return (
    <section
      aria-label="Tra nhanh dấu hiệu 5 giây"
      className="p-4 rounded-xl bg-[#FAFAF7] border border-[#E2E8F0] space-y-3"
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-2 text-left cursor-pointer min-h-[32px]"
        >
          <span className="w-6 h-6 rounded-md bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] flex items-center justify-center shrink-0">
            <Zap className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
          <span className="text-[12px] font-mono font-bold uppercase tracking-[0.06em] text-[#0F172A]">
            Tra nhanh 5 giây ({items.length})
          </span>
        </button>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] font-semibold text-[#475569] hover:text-[#0F172A] px-2 py-1 rounded cursor-pointer"
          >
            Đóng
          </button>
        ) : (
          <button
            type="button"
            aria-label={isOpen ? "Thu gọn bảng tra nhanh" : "Mở bảng tra nhanh"}
            onClick={() => setIsOpen((v) => !v)}
            className="p-1 rounded text-[#475569] hover:text-[#0F172A] cursor-pointer"
          >
            {isOpen ? (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {isOpen && (
        <ul className="divide-y divide-[#E2E8F0] max-h-[340px] overflow-y-auto pr-1">
          {items.map((item, idx) => (
            <li key={idx} className="py-2 first:pt-0 last:pb-0 space-y-1">
              <div className="font-mono text-[12px] font-bold text-[#2563EB] break-words">
                {item.signal}
              </div>
              <div className="text-[12px] text-[#0F172A] leading-snug">
                {item.rule}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * Tóm tắt bản chất cốt lõi — thu gọn được để không đẩy nội dung học xuống quá xa.
 */
export function CoreRuleSection({
  lesson,
  defaultExpanded,
}: {
  lesson: GrammarLesson;
  defaultExpanded: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section
      aria-labelledby="core-rule-heading"
      className="rounded-xl bg-[#FAFAF7] border border-[#E2E8F0] border-l-4 border-l-[#2563EB] overflow-hidden"
    >
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full min-h-[48px] px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#F1F5F9]/60 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shrink-0">
            <Lightbulb className="w-4 h-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2
              id="core-rule-heading"
              className="text-[15px] sm:text-[16px] font-bold text-[#0F172A]"
            >
              Bản chất cốt lõi cần nhớ
            </h2>
            {!isExpanded && (
              <p className="text-[12px] text-[#475569] truncate">
                {lesson.coreRule.definition}
              </p>
            )}
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563EB] shrink-0">
          <span className="hidden sm:inline">
            {isExpanded ? "Thu gọn" : "Mở tóm tắt"}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          )}
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 space-y-3.5 border-t border-[#E2E8F0]">
          <p className="text-[14px] text-[#0F172A] leading-[1.65] pt-2">
            {lesson.coreRule.definition}
          </p>

          <ul className="divide-y divide-[#E2E8F0] rounded-lg bg-white border border-[#E2E8F0] px-3.5">
            {lesson.coreRule.keyFormulas.map((formula, idx) => (
              <li
                key={idx}
                className="py-2.5 flex items-start gap-2.5 text-[13px] text-[#0F172A] leading-[1.6]"
              >
                <span className="font-mono text-[11px] font-bold text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded shrink-0 mt-0.5 tabular-nums">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span>{formula}</span>
              </li>
            ))}
          </ul>

          <div className="p-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-start gap-2 text-[13px] text-[#0F172A]">
            <Zap
              className="w-4 h-4 shrink-0 text-[#2563EB] mt-0.5"
              aria-hidden="true"
            />
            <div className="leading-[1.6]">
              <span className="font-bold text-[#2563EB]">
                Mẹo nhận diện nhanh:{" "}
              </span>
              {lesson.coreRule.deepInsight}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export function ModuleTheoryContent({
  lesson,
  mod,
  recallMode,
}: {
  lesson: GrammarLesson;
  mod: LessonMicroModule;
  recallMode: boolean;
}) {
  if (mod.kind === "summary_practice") {
    return (
      <div className="space-y-6">
        {/* Bảng dấu hiệu 5 giây */}
        <section
          aria-labelledby={`cheatsheet-heading-${mod.partNumber}`}
          className="p-5 sm:p-6 rounded-xl bg-white border border-[#E2E8F0] space-y-4"
        >
          <div className="flex items-center gap-2.5 border-b border-[#F1F5F9] pb-3">
            <span className="w-8 h-8 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#047857] shrink-0">
              <Zap className="w-4 h-4" aria-hidden="true" />
            </span>
            <div>
              <h2
                id={`cheatsheet-heading-${mod.partNumber}`}
                className="text-[17px] font-bold text-[#0F172A]"
              >
                Phần {mod.partNumber}: Bảng dấu hiệu nhận diện trong 5 giây
              </h2>
              <p className="text-[12px] text-[#475569]">
                Quét nhanh từ khóa để chọn ngay đáp án đúng
              </p>
            </div>
          </div>

          <ul className="divide-y divide-[#E2E8F0]">
            {lesson.cheatSheet.map((item, idx) => (
              <li key={idx} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <span className="font-mono text-[13px] font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded border border-[#BFDBFE]">
                    {item.signal}
                  </span>
                  <span className="text-[13px] font-semibold text-[#047857]">
                    → {item.rule}
                  </span>
                </div>
                <div className="text-[13px] text-[#475569] italic pl-1">
                  Ví dụ: &ldquo;
                  <HighlightedExample text={item.example} />
                  &rdquo;
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Bẫy ETS thường gặp */}
        {lesson.traps.length > 0 && (
          <section
            aria-labelledby={`traps-heading-${mod.partNumber}`}
            className="p-5 sm:p-6 rounded-xl bg-white border border-[#FECDD3] space-y-4"
          >
            <div className="flex items-center gap-2.5 border-b border-[#FFF1F2] pb-3">
              <span className="w-8 h-8 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#B45309] shrink-0">
                <AlertTriangle className="w-4 h-4" aria-hidden="true" />
              </span>
              <div>
                <h2
                  id={`traps-heading-${mod.partNumber}`}
                  className="text-[17px] font-bold text-[#0F172A]"
                >
                  Cảnh báo các bẫy thường gặp
                </h2>
                <p className="text-[12px] text-[#475569]">
                  Những lỗi sai phổ biến khiến thí sinh mất điểm
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {lesson.traps.map((trap, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] space-y-2.5 text-[13px]"
                >
                  <div className="font-bold text-[#B45309] flex items-center gap-2">
                    <AlertTriangle
                      className="w-4 h-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{trap.title}</span>
                  </div>
                  <p className="text-[#0F172A] leading-[1.6]">
                    {trap.trapDescription}
                  </p>
                  <div className="p-2.5 bg-white rounded-lg border border-[#FDE68A] text-[#0F172A] leading-[1.6]">
                    <span className="font-semibold text-[#B45309]">
                      Quy tắc chuẩn:{" "}
                    </span>
                    {trap.correctRule}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 pt-1 font-mono text-[12px]">
                    <div className="flex items-start gap-1.5 p-2.5 rounded bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]">
                      <XCircle
                        className="w-4 h-4 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{trap.badExample}</span>
                    </div>
                    <div className="flex items-start gap-1.5 p-2.5 rounded bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                      <CheckCircle2
                        className="w-4 h-4 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{trap.goodExample}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // Học phần dành riêng cho chủ điểm Thì (tenses)
  if (
    lesson.tensesDetail &&
    (mod.kind === "tenses_present" ||
      mod.kind === "tenses_past" ||
      mod.kind === "tenses_future" ||
      mod.kind === "tenses_sequence")
  ) {
    const {
      tenses,
      sequenceRules,
      tenseComparisons = [],
    } = lesson.tensesDetail;

    if (mod.kind === "tenses_sequence") {
      return (
        <section className="p-5 sm:p-6 rounded-xl bg-white border border-[#E2E8F0] space-y-5">
          <div className="border-b border-[#F1F5F9] pb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.08em] text-[#2563EB]">
              Học phần {mod.partNumber} · ~{mod.estimatedMinutes} phút
            </span>
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#0F172A] mt-0.5">
              {mod.titleVi}
            </h2>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {sequenceRules.map((rule, idx) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded bg-[#EFF6FF] text-[#2563EB] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="font-mono text-[13px] font-bold text-[#0F172A] leading-snug">
                    {rule.pattern}
                  </div>
                </div>

                <p className="text-[14px] text-[#0F172A] leading-[1.6]">
                  {rule.ruleVi}
                </p>

                <div className="space-y-2.5">
                  <div className="pl-3.5 border-l-2 border-[#2563EB]/40 space-y-1.5 text-[13px]">
                    <div className="font-medium text-[#0F172A] leading-[1.75]">
                      &ldquo;
                      <HighlightedExample text={rule.exampleEn} />
                      &rdquo;
                    </div>
                    <RecallableTranslation
                      textVi={rule.exampleVi}
                      recallMode={recallMode}
                    />
                  </div>

                  {rule.extraExamples?.map((extra, eIdx) => (
                    <div
                      key={eIdx}
                      className="pl-3.5 border-l-2 border-[#E2E8F0] space-y-1.5 text-[13px]"
                    >
                      <div className="font-medium text-[#0F172A] leading-[1.75]">
                        &ldquo;
                        <HighlightedExample
                          text={extra.en}
                          explicitHighlight={extra.highlight}
                        />
                        &rdquo;
                      </div>
                      <RecallableTranslation
                        textVi={extra.vi}
                        recallMode={recallMode}
                      />
                    </div>
                  ))}
                </div>

                {rule.trapNote && (
                  <div className="flex items-start gap-1.5 text-[12px] text-[#B45309] bg-[#FFFBEB] p-2.5 rounded-md border border-[#FDE68A]">
                    <AlertTriangle
                      className="w-3.5 h-3.5 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{rule.trapNote}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    }

    const group = mod.tensesGroup as "present" | "past" | "future";
    const groupTenses = tenses.filter((t) => t.group === group);
    const compIds = TENSE_COMPARISON_BY_GROUP[group] ?? [];
    const groupComparisons = tenseComparisons.filter((c) =>
      compIds.includes(c.id)
    );

    return (
      <section className="p-5 sm:p-6 rounded-xl bg-white border border-[#E2E8F0] space-y-6">
        <div className="border-b border-[#F1F5F9] pb-3">
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.08em] text-[#2563EB]">
            Học phần {mod.partNumber} · ~{mod.estimatedMinutes} phút
          </span>
          <h2 className="text-[18px] sm:text-[20px] font-bold text-[#0F172A] mt-0.5">
            {mod.titleVi}
          </h2>
        </div>

        <div className="divide-y divide-[#E2E8F0]">
          {groupTenses.map((tense, tIdx) => (
            <div key={tense.id} className="py-5 first:pt-0 last:pb-0">
              <TenseCard
                tense={tense}
                index={tIdx}
                recallMode={recallMode}
              />
            </div>
          ))}
        </div>

        {groupComparisons.length > 0 && (
          <div className="space-y-3 pt-5 border-t border-[#E2E8F0]">
            <div className="space-y-0.5">
              <h3 className="text-[15px] sm:text-[16px] font-bold text-[#0F172A]">
                Đối chiếu cặp thì dễ nhầm trong nhóm này (
                {groupComparisons.length})
              </h3>
              <p className="text-[12px] text-[#475569]">
                Mở từng cặp khi cần phân biệt sâu để không bị quá tải chữ
              </p>
            </div>
            <div className="space-y-2.5">
              {groupComparisons.map((comp, cIdx) => (
                <ComparisonCard
                  key={comp.id}
                  comp={comp}
                  defaultOpen={cIdx === 0}
                  recallMode={recallMode}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  // Học phần chuẩn từ detailedSections (15 chủ điểm còn lại)
  if (mod.section) {
    return (
      <DetailedSectionCard
        sec={mod.section}
        partNumber={mod.partNumber}
        minutes={mod.estimatedMinutes}
        recallMode={recallMode}
      />
    );
  }

  return null;
}
