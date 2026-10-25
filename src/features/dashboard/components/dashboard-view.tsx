"use client";

import Link from "next/link";
import type { DashboardSummaryResult } from "@/features/stats/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Flame,
  Calendar,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Brain,
  Sparkles,
  BarChart3,
} from "lucide-react";

interface DashboardViewProps {
  summary: DashboardSummaryResult;
}

export function DashboardView({ summary }: DashboardViewProps) {
  const {
    streakDays,
    dueCardsCount,
    recommendedTopic,
    topAttentionTopics,
    totalQuestionsAnswered,
    averageMasteryScore,
    recentActivity,
  } = summary;

  const isNewLearner = totalQuestionsAnswered === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pt-2 pb-16 animate-in fade-in duration-200">
      {/* 1. Top Header: Chào mừng + Chuỗi ngày học (Streak) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6">
        <div>
          <div className="text-[11px] font-mono font-bold uppercase tracking-[0.08em] text-[#475569] mb-1.5 flex items-center gap-2">
            <span>Luyện thi thích ứng</span>
            <span className="text-slate-300">•</span>
            <span>Phân tích theo dữ liệu thực</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
            Tổng quan học tập
          </h1>
          <p className="text-sm text-[#475569] mt-1 leading-relaxed">
            Theo dõi tiến độ, ôn từ vựng đến hạn và rèn luyện các chủ điểm trọng tâm.
          </p>
        </div>

        {/* Huy hiệu Chuỗi ngày học (Streak) */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-xs self-start sm:self-auto">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
            <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748B]">
              Chuỗi ngày học
            </div>
            <div className="text-lg font-mono font-bold text-[#0F172A] leading-tight">
              {streakDays} <span className="text-xs font-normal text-[#64748B]">ngày liên tiếp</span>
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
          {/* A. THẺ LUYỆN PART 5 ĐỀ XUẤT (HERO CARD - CHỨA NÚT PRIMARY DUY NHẤT) */}
          <Card className="p-6 bg-white border border-[#2563EB]/40 shadow-sm relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                {isNewLearner ? "Đề xuất bắt đầu" : "Chủ điểm cần cải thiện"}
              </span>
              <Sparkles className="w-4 h-4 text-[#2563EB]" />
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-mono text-[#64748B]">
                Bài luyện đề xuất
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
                {recommendedTopic ? recommendedTopic.nameVi : "Dạng từ (Word Forms)"}
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                {isNewLearner ? (
                  "Chủ điểm ngữ pháp nền tảng chiếm tỷ trọng lớn trong đề thi. Bắt đầu với phiên 10 câu để hệ thống chẩn đoán độ vững."
                ) : (
                  <>
                    Độ vững hiện tại đạt{" "}
                    <span className="font-mono font-bold text-rose-700">
                      {recommendedTopic?.masteryPercentage}%
                    </span>
                    . Luyện phiên này giúp bù đắp ngay phần kiến thức còn thiếu sót.
                  </>
                )}
              </p>
            </div>

            {/* NÚT PRIMARY DUY NHẤT CỦA MÀN HÌNH DASHBOARD (§5.5 & D-02) */}
            <div className="pt-2 space-y-3">
              <Link
                href={
                  recommendedTopic
                    ? `/practice/new?tagId=${recommendedTopic.tagId}`
                    : "/practice/new"
                }
                className="block"
              >
                <Button variant="primary" size="cta" className="w-full shadow-xs">
                  <span>Bắt đầu luyện 10 câu ngay</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>

              <div className="text-center">
                <Link
                  href="/practice/new"
                  className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] hover:underline"
                >
                  Chọn chủ điểm khác hoặc đổi quy mô phiên →
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
                      <span className="text-xs font-normal text-[#64748B]">
                        thẻ đến hạn ôn
                      </span>
                    </div>
                    <p className="text-xs text-[#475569]">
                      Các từ vựng đến lịch ôn hôm nay để duy trì ghi nhớ lâu dài.
                    </p>
                  </div>
                </div>

                <Link href="/review" className="block">
                  <Button variant="secondary" size="default" className="w-full">
                    <Calendar className="w-3.5 h-3.5 mr-2" />
                    Ôn {dueCardsCount} thẻ ngay →
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Không có thẻ cần ôn hôm nay</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Bạn đã hoàn thành toàn bộ thẻ ôn tập ngắt quãng. Hãy tiếp tục lưu từ mới khi giải đề.
                </p>
                <div className="pt-1">
                  <Link
                    href="/vocab"
                    className="text-xs font-semibold text-emerald-900 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Mở Sổ từ vựng</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
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
                  Top 3 chủ điểm cần chú ý
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
                            ? `${topic.totalAttempts}/5 câu (Chưa đủ mẫu)`
                            : `Làm đúng ${topic.correctAttempts}/${topic.totalAttempts} câu • Wilson: ${topic.masteryPercentage}%`}
                        </div>
                      </div>

                      <Link
                        href={`/practice/new?tagId=${topic.tagId}`}
                        className="shrink-0"
                      >
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-[#EFF6FF] text-[#0F172A] hover:text-[#2563EB] transition-colors cursor-pointer"
                        >
                          Luyện
                        </button>
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

          {/* B. THẺ TÓM TẮT TIẾN ĐỘ & HOẠT ĐỘNG 14 NGÀY */}
          <Card className="p-5 bg-white border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Tần suất làm bài 14 ngày gần nhất
                </h3>
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
                    className={`p-2 rounded-lg text-center flex flex-col justify-between h-14 border transition-colors ${
                      day.isToday
                        ? "border-[#2563EB] bg-[#EFF6FF]/60"
                        : hasActivity
                        ? "border-slate-200 bg-slate-50"
                        : "border-slate-100 bg-slate-50/40"
                    }`}
                    title={`${day.fullDateFormatted}: ${day.count} câu`}
                  >
                    <div className="text-[9px] font-mono text-[#64748B]">
                      {day.dayLabel === "Hôm nay" ? "Nay" : day.dayLabel}
                    </div>
                    <div
                      className={`text-xs font-mono font-bold ${
                        hasActivity ? "text-[#2563EB]" : "text-slate-300"
                      }`}
                    >
                      {day.count}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-[#64748B] pt-1">
              <span>Đã hoàn thành: {totalQuestionsAnswered} câu</span>
              {averageMasteryScore > 0 && (
                <span>Độ vững TB: {averageMasteryScore}%</span>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
