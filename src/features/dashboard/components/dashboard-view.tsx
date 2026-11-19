"use client";

import Link from "next/link";
import type { DashboardSummaryResult } from "@/features/stats/actions";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StreakFlame } from "@/components/ui/streak-flame";
import {
  Calendar,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Brain,
  BarChart3,
  Clock,
} from "lucide-react";

interface DashboardViewProps {
  summary: DashboardSummaryResult;
}

export function DashboardView({ summary }: DashboardViewProps) {
  const {
    streakDays,
    dueCardsCount,
    topAttentionTopics,
    totalQuestionsAnswered,
    averageMasteryScore,
    recentActivity,
    roadmap,
  } = summary;

  const isNewLearner = totalQuestionsAnswered === 0;
  const todayActivity = recentActivity.find((d) => d.isToday);
  const hasStudiedToday = (todayActivity?.count || 0) > 0;
  const nextStep = roadmap.nextStep;
  const activeStage = roadmap.activeStage;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pt-2 pb-16 animate-in fade-in duration-200">
      {/* 1. Top Header: Chào mừng + Chuỗi ngày học (Streak phong cách Duolingo) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A]">
            Tổng quan học tập
          </h1>
        </div>

        {/* Huy hiệu Chuỗi ngày học — Precision Swiss phẳng, giữ token màu hiện hành */}
        <div
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl border transition-colors self-start sm:self-auto ${
            streakDays > 0
              ? "bg-[#FFFBEB] border-[#FDE68A]"
              : "bg-white border-[#E2E8F0]"
          }`}
        >
          <div className="relative">
            <StreakFlame
              streak={streakDays}
              size="lg"
              isLitToday={hasStudiedToday}
              animate={true}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#B45309]">
                Chuỗi ngày học
              </span>
              {streakDays > 0 && hasStudiedToday && (
                <span className="text-[10px] font-semibold text-[#047857] bg-[#ECFDF5] border border-[#A7F3D0] px-1.5 py-0.5 rounded-full">
                  Đã giữ lửa
                </span>
              )}
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-[#0F172A] leading-tight flex items-baseline gap-1.5 mt-0.5 tabular-nums">
              {streakDays > 0 ? (
                <>
                  <span>{streakDays}</span>
                  <span className="text-xs font-bold text-[#475569]">NGÀY</span>
                </>
              ) : (
                <span className="text-sm font-bold text-[#2563EB]">Thắp lửa hôm nay</span>
              )}
            </div>
            <div className="text-[11px] text-[#475569] mt-0.5">
              {streakDays > 0 ? (
                hasStudiedToday ? (
                  <span className="text-[#047857] font-medium">
                    Hôm nay bạn đã duy trì nhịp học
                  </span>
                ) : (
                  <span className="text-[#B45309] font-medium">
                    Học 1 bài để giữ chuỗi {streakDays + 1} ngày
                  </span>
                )
              ) : (
                <span>Làm 1 bài luyện hoặc ôn từ vựng</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid Bố cục 2 Cột Desktop (Trái 5/12: Luyện đề xuất + Ôn FSRS; Phải 7/12: Top chủ điểm + Thống kê) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================
            CỘT TRÁI (5/12 Desktop): THẺ LUYỆN ĐỀ XUẤT + THẺ ÔN TẬP TỪ VỰNG
            ======================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* A. THẺ BƯỚC TIẾP THEO TRONG LỘ TRÌNH (HERO CARD - CHỨA NÚT PRIMARY DUY NHẤT) */}
          <Card className="p-6 bg-white border border-[#2563EB]/40 border-l-4 border-l-[#2563EB] shadow-sm relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                Lộ trình · Chặng {activeStage.stage.stageNumber} · Bước {nextStep.order}/16
              </span>
              <span className="text-[11px] font-mono font-semibold text-[#475569] tabular-nums">
                {roadmap.clearedCount}/{roadmap.totalSteps} chủ điểm ({roadmap.overallProgressPct}%)
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-medium text-[#475569]">
                {nextStep.masteryLabel === "needs_review"
                  ? "Ưu tiên củng cố trong chặng"
                  : isNewLearner
                  ? "Điểm xuất phát đề xuất theo lộ trình"
                  : "Bước tiếp theo khuyên học"}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
                {nextStep.fullNameVi}
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                {nextStep.prerequisiteReason}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-[#475569]">
                <span className="px-2 py-0.5 rounded bg-[#FAFAF7] border border-[#E2E8F0]">
                  {nextStep.moduleCount} phần nhỏ · {nextStep.exerciseCount} bài tập
                </span>
                {nextStep.totalAttempts > 0 && (
                  <span className="px-2 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0] text-[#0F172A] font-semibold tabular-nums">
                    {nextStep.correctAttempts}/{nextStep.totalAttempts} câu
                    {nextStep.totalAttempts >= 5 ? ` (${nextStep.masteryPercentage}%)` : ""}
                  </span>
                )}
              </div>
            </div>

            {/* Thanh tiến độ lộ trình thu gọn (8px chuẩn D-18) */}
            <div
              role="progressbar"
              aria-label="Tiến độ lộ trình học ngữ pháp"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={roadmap.overallProgressPct}
              className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-[#2563EB] transition-all duration-300"
                style={{
                  width: `${Math.max(roadmap.overallProgressPct, roadmap.clearedCount > 0 ? 4 : 0)}%`,
                }}
              />
            </div>

            {/* NÚT PRIMARY DUY NHẤT CỦA MÀN HÌNH DASHBOARD (§5.5 & D-02) */}
            <div className="pt-1 space-y-3">
              <Link
                href={`/practice/new?topic=${encodeURIComponent(nextStep.tagCode)}&count=10`}
                className={buttonVariants({
                  variant: "primary",
                  size: "cta",
                  className: "w-full shadow-xs",
                })}
              >
                <span>Luyện bước {nextStep.order} (10 câu) ngay</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>

              <div className="text-center flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs font-medium">
                <Link
                  href={`/learn/${nextStep.tagCode}`}
                  className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline"
                >
                  Học lý thuyết bước này →
                </Link>
                <span className="text-[#E2E8F0]" aria-hidden="true">·</span>
                <Link
                  href="/learn"
                  className="text-[#475569] hover:text-[#0F172A] hover:underline"
                >
                  Xem lộ trình 4 chặng →
                </Link>
                <span className="text-[#E2E8F0]" aria-hidden="true">·</span>
                <Link
                  href="/practice/new"
                  className="text-[#475569] hover:text-[#0F172A] hover:underline"
                >
                  Chọn chủ điểm khác →
                </Link>
              </div>
            </div>
          </Card>

          {/* B. THẺ NHẮC ÔN TẬP TỪ VỰNG FSRS */}
          <Card className="p-5 bg-white border border-[#E2E8F0] shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Ôn tập ngắt quãng (FSRS)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#64748B]">
                Trí nhớ dài hạn
              </span>
            </div>

            {dueCardsCount > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-2xl font-mono font-bold text-[#2563EB]">
                      {dueCardsCount}{" "}
                      <span className="text-xs font-normal text-[#475569]">
                        thẻ đến hạn ôn
                      </span>
                    </div>
                    <p className="text-xs text-[#475569]">
                      Các từ vựng đến lịch ôn hôm nay để duy trì ghi nhớ lâu dài.
                    </p>
                  </div>
                </div>

                <Link
                  href="/review"
                  className={buttonVariants({
                    variant: "secondary",
                    size: "default",
                    className: "w-full",
                  })}
                >
                  <Calendar className="w-3.5 h-3.5 mr-2" />
                  Ôn {dueCardsCount} thẻ ngay →
                </Link>
              </div>
            ) : (summary.totalReviewCardsCount ?? 0) === 0 ? (
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
                  <Brain className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <span>Chưa có thẻ từ vựng trong lịch ôn</span>
                </div>
                <p className="text-[11px] text-[#475569] leading-relaxed">
                  Hãy chọn một bộ thẻ TOEIC chuẩn (ETS, Barron&apos;s 600 Words) hoặc lưu từ mới khi giải đề để kích hoạt lịch ôn FSRS.
                </p>
                <div className="pt-1">
                  <Link
                    href="/vocab"
                    className="text-xs font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Nạp bộ thẻ tại Sổ từ vựng</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#047857]">
                  <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />
                  <span>Đã hoàn thành thẻ đến hạn hôm nay</span>
                </div>
                <p className="text-[11px] text-[#047857] leading-relaxed">
                  Đang theo dõi <span className="font-mono font-bold">{summary.totalReviewCardsCount}</span> thẻ trong lịch FSRS. Bạn có thể ôn lại trước hạn hoặc khám phá thêm từ mới.
                </p>
                <div className="pt-1 flex items-center gap-3 flex-wrap">
                  <Link
                    href="/review?studyAll=true&limit=15"
                    className="text-xs font-bold text-[#047857] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Ôn tập tự do (15 thẻ)</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                  <span className="text-[#A7F3D0]" aria-hidden="true">·</span>
                  <Link
                    href="/vocab"
                    className="text-xs font-semibold text-[#0F172A] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Mở Sổ từ vựng</span>
                  </Link>
                </div>
              </div>
            )}
          </Card>

          {/* C. THẺ PHÒNG THI THỬ READING 100 CÂU */}
          <Card className="p-5 bg-white border border-[#E2E8F0] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Thi thử TOEIC Reading (75 phút)
                </h3>
              </div>
              <span className="text-[11px] font-bold text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
                Thang 5–495
              </span>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              Trọn vẹn 100 câu Part 5, 6, 7 theo chuẩn khảo thí ETS 2024. Đếm ngược 75 phút và nhận bảng điểm chi tiết.
            </p>
            <Link
              href="/exam"
              className={buttonVariants({
                variant: "secondary",
                size: "default",
                className: "w-full mt-1",
              })}
            >
              <span>Vào phòng thi thử →</span>
            </Link>
            <div className="text-center">
              <Link
                href="/exam#history"
                className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] hover:underline inline-flex items-center gap-1"
              >
                <span>Xem lịch sử điểm thi →</span>
              </Link>
            </div>
          </Card>
        </div>

        {/* ========================================================
            CỘT PHẢI (7/12 Desktop): TOP 3 CHỦ ĐIỂM CẦN CHÚ Ý + TẦN SUẤT 14 NGÀY
            ======================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* A. TOP 3 CHỦ ĐIỂM CẦN CHÚ Ý (PD-08: mobile chỉ Top 3) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">
                  {isNewLearner
                    ? "3 chủ điểm nền tảng gợi ý bắt đầu"
                    : "Top 3 chủ điểm cần chú ý"}
                </h3>
              </div>

              {/* Liên kết sang /stats */}
              <Link
                href="/stats"
                className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline inline-flex items-center gap-1"
              >
                <span>Xem tất cả 16 chủ điểm</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {topAttentionTopics.map((topic) => {
                const badge = topic.badgeInfo;
                const isInsufficient = topic.totalAttempts < 5;

                return (
                  <Card
                    key={topic.tagId}
                    className="p-4 bg-white border border-[#E2E8F0] shadow-xs hover:border-[#2563EB]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-[#0F172A]">
                            {topic.nameVi}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider border ${badge.badgeClass}`}
                          >
                            {badge.labelVi}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-[#64748B]">
                          {isInsufficient
                            ? `${topic.totalAttempts}/5 câu (Cần làm thêm ${5 - topic.totalAttempts} câu)`
                            : `Làm đúng ${topic.correctAttempts}/${topic.totalAttempts} câu • Độ thành thạo: ${topic.masteryPercentage}%`}
                        </div>
                      </div>

                      <Link
                        href={`/practice/new?topic=${topic.tagCode}`}
                        className="shrink-0 inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-[#EFF6FF] text-[#0F172A] hover:text-[#2563EB] transition-colors"
                      >
                        Luyện
                      </Link>
                    </div>

                    {/* Thanh tiến độ 8px */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${badge.barClass}`}
                        style={{
                          width: `${
                            isInsufficient
                              ? (topic.totalAttempts / 5) * 100
                              : Math.min(100, Math.max(5, topic.masteryPercentage))
                          }%`,
                        }}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* B. THẺ TÓM TẮT TIẾN ĐỘ & HOẠT ĐỘNG 14 NGÀY (Chuẩn Precision Swiss Tokens) */}
          <Card className="p-5 bg-white border border-[#E2E8F0] shadow-xs space-y-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <BarChart3 className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Tần suất làm bài 14 ngày gần nhất
                </h3>
                {streakDays > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] text-xs font-mono font-bold">
                    <span>Chuỗi {streakDays} ngày</span>
                  </span>
                )}
              </div>
              <Link
                href="/stats"
                className="text-xs text-[#2563EB] hover:underline font-mono"
              >
                Chi tiết →
              </Link>
            </div>

            {/* Thanh mini 14 ngày */}
            <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5">
              {recentActivity.map((day) => {
                const hasActivity = day.count > 0;
                return (
                  <div
                    key={day.date}
                    className={`p-1.5 sm:p-2 rounded-xl text-center flex flex-col justify-between h-16 border transition-colors relative ${
                      day.isToday
                        ? "border-[#2563EB] bg-[#EFF6FF] shadow-xs ring-2 ring-[#2563EB]/20"
                        : hasActivity
                          ? "border-[#BFDBFE] bg-[#EFF6FF]/60 hover:border-[#2563EB]"
                          : "border-[#E2E8F0] bg-[#F8FAFC]"
                    }`}
                    title={`${day.fullDateFormatted}: ${day.count} câu`}
                  >
                    <div className="text-[10px] font-mono text-[#475569] flex items-center justify-center gap-0.5">
                      <span>{day.dayLabel === "Hôm nay" ? "Nay" : day.dayLabel}</span>
                    </div>

                    {hasActivity ? (
                      <div className="my-auto flex flex-col items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mb-0.5" aria-hidden="true" />
                        <span className="text-xs font-mono font-bold text-[#2563EB] tabular-nums">
                          {day.count}
                        </span>
                      </div>
                    ) : (
                      <div className="my-auto text-xs font-mono font-semibold text-[#8190A6] tabular-nums">
                        {day.count}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-[#475569] pt-1">
              <span>Đã hoàn thành: {totalQuestionsAnswered} câu</span>
              {averageMasteryScore > 0 && (
                <span>Độ thành thạo TB: {averageMasteryScore}%</span>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
