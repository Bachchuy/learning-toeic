import Link from "next/link";
import type { GrammarLessonSummary } from "@/core/grammarLessons";
import { BookOpen, AlertTriangle, ArrowRight, Clock } from "lucide-react";

interface LessonCardProps {
  lesson: GrammarLessonSummary;
}

export function LessonCard({ lesson }: LessonCardProps) {
  // Tách tiêu đề tiếng Việt và thuật ngữ tiếng Anh trong ngoặc (nếu có) để cân đối font chữ và thị giác
  const titleMatch = lesson.titleVi.match(/^(.*?)\s*\((.*?)\)$/);
  const mainTitle = titleMatch ? titleMatch[1] : lesson.titleVi;
  const englishTitle = titleMatch ? titleMatch[2] : null;

  return (
    <div className="relative flex flex-col justify-between p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs hover:border-[#BFDBFE] hover:shadow-md hover:-translate-y-0.5 transition-all group">
      <div className="space-y-3">
        {/* Category & Time */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase bg-[#EFF6FF] text-[#1E40AF]">
            <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" />
            {lesson.categoryVi}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#475569] bg-[#F8FAFC] px-2 py-0.5 rounded border border-[#E2E8F0]">
            <Clock className="w-3 h-3 text-[#475569]" />
            {lesson.estimatedMinutes} phút
          </span>
        </div>

        {/* Title & Tagline - Cân đối layout & typography */}
        <div>
          <h2 className="text-[17px] font-bold text-[#0F172A] leading-snug tracking-tight group-hover:text-[#2563EB] transition-colors min-h-[44px] flex flex-wrap items-baseline gap-x-1.5">
            <span>{mainTitle}</span>
            {englishTitle && (
              <span className="text-[13px] font-medium text-[#64748B] tracking-normal font-sans">
                ({englishTitle})
              </span>
            )}
          </h2>
          <p className="text-[13px] text-[#475569] mt-1.5 line-clamp-2 leading-relaxed min-h-[38px]">
            {lesson.taglineVi}
          </p>
        </div>

        {/* Quick Highlights */}
        <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#F1F5F9] text-[#475569] font-medium">
            ⚡ {lesson.cheatSheetCount} mẹo 
          </span>
          {lesson.trapsCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FFFBEB] text-[#B45309] font-medium border border-[#FDE68A]">
              <AlertTriangle className="w-3 h-3 text-[#B45309]" />
              {lesson.trapsCount} bẫy ETS
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-4 border-t border-[#F1F5F9] flex items-center justify-between">
        <span className="text-[12px] font-mono text-[#64748B]">
          #{lesson.tagCode}
        </span>
        <Link
          href={`/learn/${lesson.tagCode}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#2563EB] group-hover:text-[#1D4ED8] transition-colors focus:outline-hidden focus:underline cursor-pointer"
        >
          <span className="after:absolute after:inset-0" aria-hidden="true" />
          <span>Học lý thuyết</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
