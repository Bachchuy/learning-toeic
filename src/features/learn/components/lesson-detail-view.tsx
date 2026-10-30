import Link from "next/link";
import type { GrammarLesson } from "@/core/grammarLessons";
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
} from "lucide-react";

interface LessonDetailViewProps {
  lesson: GrammarLesson;
}

export function LessonDetailView({ lesson }: LessonDetailViewProps) {
  return (
    <article className="max-w-3xl mx-auto space-y-8 pt-2 pb-16 animate-in fade-in duration-200">
      {/* 1. Header Navigation & Back Button */}
      <div>
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#475569] hover:text-[#0F172A] transition-colors mb-4 focus:outline-hidden focus:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Danh sách chủ điểm</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase bg-[#EFF6FF] text-[#1E40AF]">
            <BookOpen className="w-3 h-3 text-[#2563EB]" />
            {lesson.categoryVi}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#475569] px-2 py-0.5 rounded bg-[#F1F5F9]">
            <Clock className="w-3 h-3" />
            {lesson.estimatedMinutes} phút đọc
          </span>
          <span className="text-[11px] font-mono text-[#475569]">
            #{lesson.tagCode}
          </span>
        </div>

        <h1 className="text-[26px] sm:text-[32px] font-bold tracking-tight text-[#0F172A] leading-tight">
          {lesson.titleVi}
        </h1>
        <p className="text-[15px] text-[#475569] mt-2 leading-relaxed">
          {lesson.taglineVi}
        </p>
      </div>

      {/* 2. Khung Lý Thuyết & Bản Chất Cốt Lõi (Core Rule) */}
      <section
        aria-labelledby="core-rule-heading"
        className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3">
          <span className="w-7 h-7 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#2563EB]">
            <Lightbulb className="w-4 h-4" />
          </span>
          <h2
            id="core-rule-heading"
            className="text-[16px] font-bold text-[#0F172A]"
          >
            1. Bản chất & Khung quy tắc cốt lõi
          </h2>
        </div>

        <p className="text-[14px] text-[#0F172A] leading-relaxed">
          {lesson.coreRule.definition}
        </p>

        {/* Công thức trọng tâm */}
        <div className="space-y-2 pt-1">
          <div className="text-[12px] font-semibold uppercase tracking-wider text-[#475569]">
            Công thức & Mẫu cấu trúc chuẩn:
          </div>
          <div className="space-y-2">
            {lesson.coreRule.keyFormulas.map((formula, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#F8FAFC] border-l-4 border-l-[#2563EB] border border-[#E2E8F0] text-[13px] font-medium text-[#0F172A]"
              >
                {formula}
              </div>
            ))}
          </div>
        </div>

        {/* Bí quyết thực chiến */}
        <div className="p-3.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-start gap-3 text-[13px] text-[#1E40AF]">
          <Zap className="w-4 h-4 shrink-0 text-[#2563EB] mt-0.5" />
          <div>
            <span className="font-bold">Bí quyết nhận diện nhanh: </span>
            {lesson.coreRule.deepInsight}
          </div>
        </div>
      </section>

      {/* 3. Bảng Dấu Hiệu Nhận Biết 5 Giây (Cheat Sheet) */}
      <section
        aria-labelledby="cheatsheet-heading"
        className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3">
          <span className="w-7 h-7 rounded-lg bg-[#ECFDF5] flex items-center justify-center text-[#047857]">
            <Zap className="w-4 h-4" />
          </span>
          <h2
            id="cheatsheet-heading"
            className="text-[16px] font-bold text-[#0F172A]"
          >
            2. Bảng dấu hiệu nhận diện trong 5 giây
          </h2>
        </div>

        <p className="text-[13px] text-[#475569]">
          Gặp các từ khóa dấu hiệu này trong câu hỏi, áp dụng ngay quy tắc tương ứng:
        </p>

        <div className="grid gap-3">
          {lesson.cheatSheet.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5"
            >
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <span className="font-mono text-[13px] font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded">
                  {item.signal}
                </span>
                <span className="text-[12px] font-medium text-[#047857]">
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

      {/* 4. Bẫy Kinh Điển ETS (Traps) */}
      {lesson.traps.length > 0 && (
        <section
          aria-labelledby="traps-heading"
          className="p-6 rounded-2xl bg-white border border-[#FECDD3]/50 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-[#FFF1F2] pb-3">
            <span className="w-7 h-7 rounded-lg bg-[#FFFBEB] flex items-center justify-center text-[#B45309]">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <h2
              id="traps-heading"
              className="text-[16px] font-bold text-[#0F172A]"
            >
              3. Cảnh báo các bẫy thường gặp (ETS Traps)
            </h2>
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

      {/* 5. Phân Tích Đề Thi Mẫu (Worked Example) */}
      <section
        aria-labelledby="example-heading"
        className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3">
          <span className="w-7 h-7 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#2563EB]">
            <BookOpen className="w-4 h-4" />
          </span>
          <h2
            id="example-heading"
            className="text-[16px] font-bold text-[#0F172A]"
          >
            4. Phân tích câu hỏi mẫu thực chiến
          </h2>
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
                    <span className="text-[11px] font-sans font-bold bg-[#047857] text-white px-1.5 py-0.5 rounded">
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

      {/* 6. Chuyển Tiếp Sang Luyện Tập (Bridge to Practice - Duy nhất 1 nút Primary) */}
      <section
        aria-labelledby="practice-cta-heading"
        className="p-6 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-center space-y-4"
      >
        <div className="max-w-md mx-auto space-y-2">
          <h2
            id="practice-cta-heading"
            className="text-[18px] sm:text-[20px] font-bold text-[#1E40AF]"
          >
            Đã nắm vững lý thuyết?
          </h2>
          <p className="text-[13px] text-[#1E40AF]/80 leading-relaxed">
            Hãy làm ngay một phiên 5 câu hỏi thực tế về chủ điểm &ldquo;
            {lesson.titleVi}&rdquo; để kiểm chứng và khắc sâu kiến thức vào trí nhớ.
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
