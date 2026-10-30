import Link from "next/link";
import type { GrammarLesson } from "@/core/grammarLessons";
import { BookOpen, AlertTriangle, ArrowRight, Clock } from "lucide-react";

interface LessonCardProps {
  lesson: GrammarLesson;
}

export function LessonCard({ lesson }: LessonCardProps) {
  return (
    <div className="flex flex-col justify-between p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs hover:border-[#BFDBFE] hover:shadow-sm transition-all">
      <div className="space-y-3">
        {/* Category & Time */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase bg-[#EFF6FF] text-[#1E40AF]">
            <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" />
            {lesson.categoryVi}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#475569]">
            <Clock className="w-3 h-3 text-[#475569]" />
            {lesson.estimatedMinutes} phút
          </span>
        </div>

        {/* Title & Tagline */}
        <div>
          <h2 className="text-[17px] font-bold text-[#0F172A] leading-snug tracking-tight">
            {lesson.titleVi}
          </h2>
          <p className="text-[13px] text-[#475569] mt-1.5 line-clamp-2 leading-relaxed">
            {lesson.taglineVi}
          </p>
        </div>

        {/* Quick Highlights */}
        <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569] font-medium">
            ⚡ {lesson.cheatSheet.length} mẹo 5 giây
          </span>
          {lesson.traps.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FFFBEB] text-[#B45309] font-medium border border-[#FDE68A]">
              <AlertTriangle className="w-3 h-3 text-[#B45309]" />
              {lesson.traps.length} bẫy ETS
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-4 border-t border-[#F1F5F9] flex items-center justify-between">
        <span className="text-[12px] font-mono text-[#475569]">
          #{lesson.tagCode}
        </span>
        <Link
          href={`/learn/${lesson.tagCode}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors focus:outline-hidden focus:underline cursor-pointer"
        >
          <span>Học lý thuyết</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
