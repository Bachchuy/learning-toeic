import Link from "next/link";
import type { GrammarLessonSummary } from "@/core/grammarLessons";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  Zap,
} from "lucide-react";

interface LessonCardProps {
  lesson: GrammarLessonSummary;
  selfPracticeDone?: number;
}

export function LessonCard({
  lesson,
  selfPracticeDone = 0,
}: LessonCardProps) {
  // Tách tiêu đề tiếng Việt và thuật ngữ tiếng Anh trong ngoặc (nếu có) để cân đối chữ và thị giác
  const titleMatch = lesson.titleVi.match(/^(.*?)\s*\((.*?)\)$/);
  const mainTitle = titleMatch ? titleMatch[1] : lesson.titleVi;
  const englishTitle = titleMatch ? titleMatch[2] : null;
  const { microSummary } = lesson;
  const allSelfDone =
    microSummary.exerciseCount > 0 &&
    selfPracticeDone >= microSummary.exerciseCount;

  return (
    <div className="relative flex flex-col justify-between p-5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#2563EB] transition-colors group">
      <div className="space-y-3">
        {/* Category & Time */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{lesson.categoryVi}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#475569] bg-[#F8FAFC] px-2 py-0.5 rounded border border-[#E2E8F0] tabular-nums">
            <Clock className="w-3 h-3 text-[#475569]" aria-hidden="true" />
            <span>~{lesson.estimatedMinutes} phút</span>
          </span>
        </div>

        {/* Title & Tagline */}
        <div>
          <h2 className="text-[17px] font-bold text-[#0F172A] leading-snug tracking-tight group-hover:text-[#2563EB] transition-colors min-h-[44px] flex flex-wrap items-baseline content-start gap-x-1">
            <span>{mainTitle}</span>
            {englishTitle && (
              <>
                {" "}
                <span className="text-[13px] font-medium text-[#475569] tracking-normal font-sans">
                  ({englishTitle})
                </span>
              </>
            )}
          </h2>
          <p className="text-[13px] text-[#475569] mt-1.5 line-clamp-2 leading-relaxed min-h-[38px]">
            {lesson.taglineVi}
          </p>
        </div>

        {/* Quick Highlights (không dùng emoji, 100% icon đồng nhất & đúng bảng Token) */}
        <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F1F5F9] text-[#0F172A] font-mono font-medium border border-[#E2E8F0] tabular-nums">
            <Layers className="w-3 h-3 text-[#2563EB]" aria-hidden="true" />
            <span>
              {microSummary.moduleCount} phần · {microSummary.exerciseCount} bài tập
            </span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F8FAFC] text-[#475569] font-medium border border-[#E2E8F0] tabular-nums">
            <Zap className="w-3 h-3 text-[#2563EB]" aria-hidden="true" />
            <span>{lesson.cheatSheetCount} mẹo 5s</span>
          </span>
          {lesson.trapsCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FFFBEB] text-[#B45309] font-medium border border-[#FDE68A] tabular-nums">
              <AlertTriangle className="w-3 h-3 text-[#B45309]" aria-hidden="true" />
              <span>{lesson.trapsCount} bẫy</span>
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3.5 mt-4 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
        {selfPracticeDone > 0 ? (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold tabular-nums ${
              allSelfDone ? "text-[#047857]" : "text-[#2563EB]"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              Tự luyện {Math.min(selfPracticeDone, microSummary.exerciseCount)}/
              {microSummary.exerciseCount}
            </span>
          </span>
        ) : (
          <span className="text-[12px] font-mono text-[#475569]">
            #{lesson.tagCode}
          </span>
        )}

        <Link
          href={`/learn/${lesson.tagCode}`}
          className="inline-flex items-center gap-1.5 min-h-[36px] text-[13px] font-semibold text-[#2563EB] group-hover:text-[#1D4ED8] transition-colors focus:outline-hidden focus:underline cursor-pointer"
        >
          <span className="after:absolute after:inset-0" aria-hidden="true" />
          <span>Học lý thuyết</span>
          <ArrowRight
            className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  );
}
