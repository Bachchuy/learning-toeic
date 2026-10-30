"use client";

import { useState } from "react";
import Link from "next/link";
import type { GrammarLesson, TenseItem } from "@/core/grammarLessons";
import {
  ArrowLeft,
  BookOpen,
  Zap,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  HelpCircle,
  Info,
} from "lucide-react";

interface LessonDetailViewProps {
  lesson: GrammarLesson;
}

export function LessonDetailView({ lesson }: LessonDetailViewProps) {
  const [selectedTenseGroup, setSelectedTenseGroup] = useState<
    "all" | "present" | "past" | "future" | "sequence"
  >("all");

  const tenses = lesson.tensesDetail?.tenses ?? [];
  const sequenceRules = lesson.tensesDetail?.sequenceRules ?? [];

  const filteredTenses = tenses.filter(
    (t) => selectedTenseGroup === "all" || t.group === selectedTenseGroup
  );

  return (
    <article className="max-w-4xl mx-auto space-y-10 pt-2 pb-20 animate-in fade-in duration-200">
      {/* 1. Header Navigation & Breadcrumb */}
      <div>
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#475569] hover:text-[#0F172A] transition-colors mb-4 focus:outline-hidden focus:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Danh sách chủ điểm</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase bg-[#EFF6FF] text-[#1E40AF]">
            <BookOpen className="w-3 h-3 text-[#2563EB]" />
            {lesson.categoryVi}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#475569] px-2 py-0.5 rounded bg-[#F1F5F9]">
            <Clock className="w-3 h-3" />
            {lesson.estimatedMinutes} phút học
          </span>
          <span className="text-[11px] font-mono text-[#475569]">
            #{lesson.tagCode}
          </span>
        </div>

        <h1 className="text-[26px] sm:text-[34px] font-extrabold tracking-tight text-[#0F172A] leading-tight">
          {lesson.titleVi}
        </h1>
        <p className="text-[15px] sm:text-[16px] text-[#475569] mt-2.5 leading-relaxed">
          {lesson.taglineVi}
        </p>
      </div>

      {/* 2. Tổng quan & Bản chất cốt lõi */}
      <section
        aria-labelledby="core-rule-heading"
        className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-5"
      >
        <div className="flex items-center gap-2.5 border-b border-[#F1F5F9] pb-3.5">
          <span className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#2563EB]">
            <Lightbulb className="w-4.5 h-4.5" />
          </span>
          <div>
            <h2
              id="core-rule-heading"
              className="text-[17px] font-bold text-[#0F172A]"
            >
              1. Khung lý thuyết & Bản chất cốt lõi
            </h2>
            <p className="text-[12px] text-[#475569]">
              Hiểu bản chất ngữ pháp trước khi áp dụng vào đề thi
            </p>
          </div>
        </div>

        <p className="text-[14px] sm:text-[15px] text-[#0F172A] leading-relaxed">
          {lesson.coreRule.definition}
        </p>

        {/* Nguyên lý cốt lõi */}
        <div className="grid sm:grid-cols-2 gap-2.5 pt-1">
          {lesson.coreRule.keyFormulas.map((formula, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#F8FAFC] border-l-4 border-l-[#2563EB] border border-[#E2E8F0] text-[13px] text-[#0F172A] leading-relaxed"
            >
              {formula}
            </div>
          ))}
        </div>

        {/* Bí quyết thực chiến */}
        <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-start gap-3 text-[13px] text-[#1E40AF]">
          <Zap className="w-5 h-5 shrink-0 text-[#2563EB] mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-[14px] block mb-0.5">
              Bí quyết làm bài Part 5:
            </span>
            {lesson.coreRule.deepInsight}
          </div>
        </div>
      </section>

      {/* 3. GIÁO TRÌNH CHUYÊN SÂU: CHI TIẾT 11 THÌ ĐỘNG TỪ & PHỐI HỢP THÌ */}
      {lesson.tensesDetail && (
        <section
          aria-labelledby="tenses-detail-heading"
          className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#2563EB]">
                <BookOpen className="w-4.5 h-4.5" />
              </span>
              <div>
                <h2
                  id="tenses-detail-heading"
                  className="text-[18px] font-bold text-[#0F172A]"
                >
                  2. Giáo trình chi tiết 11 thì TOEIC & Phối hợp thì
                </h2>
                <p className="text-[12px] text-[#475569]">
                  Cấu trúc đầy đủ 3 thể (+ / - / ?), ngữ cảnh sử dụng & ví dụ song ngữ Anh - Việt
                </p>
              </div>
            </div>

            {/* Bộ lọc nhóm thì */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[12px]">
              {[
                { id: "all", label: "Tất cả 11 thì" },
                { id: "present", label: "Hiện tại (4)" },
                { id: "past", label: "Quá khứ (3)" },
                { id: "future", label: "Tương lai (4)" },
                { id: "sequence", label: "Phối hợp thì" },
              ].map((grp) => (
                <button
                  key={grp.id}
                  type="button"
                  onClick={() =>
                    setSelectedTenseGroup(
                      grp.id as "all" | "present" | "past" | "future" | "sequence"
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                    selectedTenseGroup === grp.id
                      ? "bg-[#2563EB] text-white shadow-xs"
                      : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]"
                  }`}
                >
                  {grp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Danh sách các thì */}
          {selectedTenseGroup !== "sequence" && (
            <div className="space-y-6">
              {filteredTenses.map((tense) => (
                <TenseCard key={tense.id} tense={tense} />
              ))}
            </div>
          )}

          {/* Bảng Quy tắc phối hợp thì kinh điển */}
          {(selectedTenseGroup === "all" || selectedTenseGroup === "sequence") && (
            <div className="space-y-4 pt-4 border-t border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-[#EFF6FF] text-[#2563EB]">
                  <Zap className="w-4 h-4" />
                </span>
                <h3 className="text-[16px] font-bold text-[#0F172A]">
                  5 Quy tắc phối hợp thì (Sequence of Tenses) kinh điển trong Part 5
                </h3>
              </div>
              <p className="text-[13px] text-[#475569]">
                Đây là các mẫu câu chiếm tới 80% câu hỏi thì nâng cao trong đề thi TOEIC:
              </p>

              <div className="grid gap-3.5">
                {sequenceRules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[13px] font-mono font-bold text-[#1E40AF] bg-[#EFF6FF] px-2.5 py-1 rounded border border-[#BFDBFE]">
                        {rule.pattern}
                      </span>
                    </div>

                    <p className="text-[13px] text-[#0F172A] leading-relaxed">
                      👉 <span className="font-semibold">{rule.ruleVi}</span>
                    </p>

                    <div className="p-3 rounded-lg bg-white border border-[#E2E8F0] space-y-1 text-[13px]">
                      <div className="font-mono text-[#2563EB] font-medium">
                        &ldquo;{rule.exampleEn}&rdquo;
                      </div>
                      <div className="text-[#475569] text-[12px] italic">
                        {rule.exampleVi}
                      </div>
                    </div>

                    {rule.trapNote && (
                      <div className="flex items-start gap-1.5 text-[12px] text-[#B45309] bg-[#FFFBEB] p-2.5 rounded-md border border-[#FDE68A]">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{rule.trapNote}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 4. CHI TIẾT TỪ LOẠI / CÁC CHỦ ĐIỂM KHÁC (Detailed Topic Sections) */}
      {lesson.detailedSections && (
        <section
          aria-labelledby="detailed-sections-heading"
          className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-6"
        >
          <div className="flex items-center gap-2.5 border-b border-[#F1F5F9] pb-3.5">
            <span className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#2563EB]">
              <BookOpen className="w-4.5 h-4.5" />
            </span>
            <div>
              <h2
                id="detailed-sections-heading"
                className="text-[18px] font-bold text-[#0F172A]"
              >
                2. Phân tích chi tiết từng vị trí & Quy tắc vàng
              </h2>
              <p className="text-[12px] text-[#475569]">
                Công thức xác định vị trí và ví dụ thực tế trong đề thi TOEIC
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {lesson.detailedSections.map((sec, idx) => (
              <div key={idx} className="space-y-3.5">
                <h3 className="text-[15px] font-bold text-[#0F172A] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                  {sec.title}
                </h3>
                {sec.description && (
                  <p className="text-[13px] text-[#475569]">{sec.description}</p>
                )}

                <div className="grid gap-3">
                  {sec.rules.map((r, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5"
                    >
                      <div className="text-[13px] font-bold text-[#0F172A]">
                        {r.title}
                      </div>
                      {r.formula && (
                        <div className="p-2 rounded bg-white font-mono text-[12px] font-bold text-[#2563EB] border border-[#BFDBFE]">
                          {r.formula}
                        </div>
                      )}
                      <p className="text-[13px] text-[#475569] leading-relaxed">
                        {r.explanation}
                      </p>
                      {r.examples.map((ex, exIdx) => (
                        <div
                          key={exIdx}
                          className="p-2.5 rounded bg-white border border-[#E2E8F0] space-y-0.5 text-[12px]"
                        >
                          <div className="font-mono text-[#0F172A] font-medium">
                            &ldquo;{ex.en}&rdquo;
                          </div>
                          <div className="text-[#475569] italic">{ex.vi}</div>
                        </div>
                      ))}
                      {r.signals && r.signals.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] font-semibold text-[#475569]">
                            Dấu hiệu:
                          </span>
                          {r.signals.map((sig, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]"
                            >
                              {sig}
                            </span>
                          ))}
                        </div>
                      )}
                      {r.tip && (
                        <div className="p-2.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[12px] text-[#1E40AF] flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 shrink-0 text-[#2563EB] mt-0.5" />
                          <div>
                            <span className="font-bold">Mẹo Part 5: </span>
                            <span>{r.tip}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Bảng Dấu Hiệu Nhận Biết 5 Giây (Cheat Sheet) */}
      <section
        aria-labelledby="cheatsheet-heading"
        className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2.5 border-b border-[#F1F5F9] pb-3.5">
          <span className="w-8 h-8 rounded-lg bg-[#ECFDF5] flex items-center justify-center text-[#047857]">
            <Zap className="w-4.5 h-4.5" />
          </span>
          <div>
            <h2
              id="cheatsheet-heading"
              className="text-[17px] font-bold text-[#0F172A]"
            >
              3. Bảng dấu hiệu nhận diện trong 5 giây (Cheat Sheet)
            </h2>
            <p className="text-[12px] text-[#475569]">
              Quét nhanh từ khóa trong đề bài để suy ra ngay đáp án đúng
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          {lesson.cheatSheet.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5"
            >
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <span className="font-mono text-[13px] font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded border border-[#BFDBFE]">
                  {item.signal}
                </span>
                <span className="text-[12px] font-semibold text-[#047857]">
                  → {item.rule}
                </span>
              </div>
              <div className="text-[12px] text-[#475569] italic pt-0.5 border-t border-[#E2E8F0]/50">
                Ví dụ: &ldquo;{item.example}&rdquo;
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Bẫy Kinh Điển ETS (Traps) */}
      {lesson.traps.length > 0 && (
        <section
          aria-labelledby="traps-heading"
          className="p-6 rounded-2xl bg-white border border-[#FECDD3]/50 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2.5 border-b border-[#FFF1F2] pb-3.5">
            <span className="w-8 h-8 rounded-lg bg-[#FFFBEB] flex items-center justify-center text-[#B45309]">
              <AlertTriangle className="w-4.5 h-4.5" />
            </span>
            <div>
              <h2
                id="traps-heading"
                className="text-[17px] font-bold text-[#0F172A]"
              >
                4. Cảnh báo các bẫy thường gặp (ETS Traps)
              </h2>
              <p className="text-[12px] text-[#475569]">
                Những lỗi sai phổ biến khiến thí sinh mất điểm oan
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {lesson.traps.map((trap, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] space-y-2.5 text-[13px]"
              >
                <div className="font-bold text-[#92400E] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#B45309]" />
                  <span>{trap.title}</span>
                </div>
                <p className="text-[#78350F] leading-relaxed">
                  {trap.trapDescription}
                </p>
                <div className="p-2.5 bg-white/80 rounded-lg border border-[#FDE68A] text-[#92400E]">
                  <span className="font-semibold">Quy tắc chuẩn: </span>
                  {trap.correctRule}
                </div>
                <div className="grid sm:grid-cols-2 gap-2 pt-1 font-mono text-[12px]">
                  <div className="flex items-start gap-1.5 p-2 rounded bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]">
                    <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{trap.badExample}</span>
                  </div>
                  <div className="flex items-start gap-1.5 p-2 rounded bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{trap.goodExample}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Phân Tích Đề Thi Mẫu Thực Chiến (Worked Example) */}
      <section
        aria-labelledby="example-heading"
        className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2.5 border-b border-[#F1F5F9] pb-3.5">
          <span className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#2563EB]">
            <HelpCircle className="w-4.5 h-4.5" />
          </span>
          <div>
            <h2
              id="example-heading"
              className="text-[17px] font-bold text-[#0F172A]"
            >
              5. Phân tích câu hỏi mẫu thực chiến
            </h2>
            <p className="text-[12px] text-[#475569]">
              Áp dụng tư duy loại trừ phương án nhiễu theo từng bước
            </p>
          </div>
        </div>

        {/* Đề câu hỏi */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
          <div className="text-[11px] font-mono uppercase font-semibold text-[#475569]">
            Đề bài TOEIC Part 5 mẫu:
          </div>
          <p className="text-[15px] font-semibold text-[#0F172A] leading-relaxed">
            {lesson.workedExample.questionStem}
          </p>
          <div className="grid sm:grid-cols-2 gap-2 pt-1">
            {lesson.workedExample.options.map((opt, idx) => {
              const isCorrect = idx === lesson.workedExample.correctIndex;
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-[13px] font-mono flex items-center justify-between ${
                    isCorrect
                      ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#047857] font-bold"
                      : "bg-white border-[#E2E8F0] text-[#475569]"
                  }`}
                >
                  <span>{opt}</span>
                  {isCorrect && (
                    <span className="text-[11px] font-sans font-bold bg-[#047857] text-white px-2 py-0.5 rounded">
                      Đáp án đúng
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Giải phẫu từng bước */}
        <div className="space-y-2 pt-2">
          <div className="text-[12px] font-semibold uppercase tracking-wider text-[#475569]">
            Phân tích tư duy từng bước:
          </div>
          <div className="space-y-1.5">
            {lesson.workedExample.explanationStepByStep.map((step, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] leading-relaxed"
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Chuyển Tiếp Sang Luyện Tập (Bridge to Practice - Duy nhất 1 nút Primary) */}
      <section
        aria-labelledby="practice-cta-heading"
        className="p-6 sm:p-8 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-center space-y-4"
      >
        <div className="max-w-md mx-auto space-y-2">
          <h2
            id="practice-cta-heading"
            className="text-[18px] sm:text-[22px] font-bold text-[#1E40AF]"
          >
            Đã nắm chắc toàn bộ lý thuyết?
          </h2>
          <p className="text-[13px] sm:text-[14px] text-[#1E40AF]/80 leading-relaxed">
            Hãy làm ngay phiên 5 câu thực tế về chủ điểm &ldquo;
            {lesson.titleVi}&rdquo; để kiểm chứng và khắc sâu kiến thức vào trí nhớ dài hạn.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href={`/practice/new?topic=${lesson.tagCode}`}
            className="inline-flex items-center justify-center gap-2 px-8 h-12 rounded-xl text-[15px] font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 cursor-pointer w-full sm:w-auto"
          >
            <span>Luyện tập ngay 5 câu về chủ điểm này</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </article>
  );
}

/**
 * Component hiển thị chi tiết một Thì động từ
 */
function TenseCard({ tense }: { tense: TenseItem }) {
  return (
    <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2563EB] block">
            {tense.nameEn}
          </span>
          <h4 className="text-[17px] font-bold text-[#0F172A] leading-tight mt-0.5">
            {tense.nameVi}
          </h4>
        </div>
        <span className="self-start sm:self-auto px-2.5 py-0.5 rounded text-[11px] font-medium bg-white text-[#475569] border border-[#E2E8F0]">
          {tense.groupVi}
        </span>
      </div>

      {/* Cấu trúc 3 thể: Khẳng định, Phủ định, Nghi vấn */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#475569]">
          Cấu trúc 3 thể chuẩn (+ / - / ?):
        </div>
        <div className="grid sm:grid-cols-3 gap-2 font-mono text-[12px]">
          <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] text-[#047857]">
            <span className="font-sans font-bold block text-[10px] text-[#475569] uppercase">
              (+) Khẳng định
            </span>
            <span className="font-bold">{tense.formula.affirmative}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] text-[#BE123C]">
            <span className="font-sans font-bold block text-[10px] text-[#475569] uppercase">
              (-) Phủ định
            </span>
            <span className="font-bold">{tense.formula.negative}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] text-[#1E40AF]">
            <span className="font-sans font-bold block text-[10px] text-[#475569] uppercase">
              (?) Nghi vấn
            </span>
            <span className="font-bold">{tense.formula.question}</span>
          </div>
        </div>
      </div>

      {/* Cách sử dụng thực tế & Ví dụ song ngữ */}
      <div className="space-y-2.5 pt-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#475569]">
          Các ngữ cảnh sử dụng & Ví dụ song ngữ trong TOEIC:
        </div>
        <div className="space-y-2">
          {tense.usages.map((usage, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-white border border-[#E2E8F0] space-y-1.5 text-[13px]"
            >
              <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                {usage.context}
              </div>
              <p className="text-[#475569] text-[12px] leading-relaxed">
                {usage.explanation}
              </p>
              <div className="pt-1 border-t border-[#F1F5F9] space-y-0.5">
                <div className="font-mono text-[12px] font-medium text-[#2563EB]">
                  &ldquo;{usage.exampleEn}&rdquo;
                </div>
                <div className="text-[12px] text-[#64748B] italic">
                  → {usage.exampleVi}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dấu hiệu nhận biết */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] font-semibold text-[#475569] mr-1">
          Dấu hiệu:
        </span>
        {tense.signals.map((sig, sIdx) => (
          <span
            key={sIdx}
            className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]"
          >
            {sig}
          </span>
        ))}
      </div>

      {/* Lưu ý động từ trạng thái */}
      {tense.stativeVerbNote && (
        <div className="p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[12px] text-[#92400E] flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 text-[#B45309] mt-0.5" />
          <span className="leading-relaxed">{tense.stativeVerbNote}</span>
        </div>
      )}

      {/* TOEIC Tip */}
      <div className="p-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[12px] text-[#1E40AF] flex items-start gap-2">
        <Lightbulb className="w-4 h-4 shrink-0 text-[#2563EB] mt-0.5" />
        <div>
          <span className="font-bold">Mẹo Part 5: </span>
          <span>{tense.toeicTip}</span>
        </div>
      </div>
    </div>
  );
}
