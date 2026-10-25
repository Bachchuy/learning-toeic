"use client";

import Link from "next/link";
import type { SkillMasteryStatsResult, DailyActivityItem } from "../actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
  HelpCircle,
  Calendar,
  BookOpen,
} from "lucide-react";

interface StatsViewProps {
  stats: SkillMasteryStatsResult;
  dailyActivity: DailyActivityItem[];
}

export function StatsView({ stats, dailyActivity }: StatsViewProps) {
  const {
    group1Sufficient,
    group2Insufficient,
    weakestTopic,
    totalAttempts,
    totalCorrect,
    overallAccuracy,
  } = stats;

  const isNewLearner = totalAttempts === 0;

  // Tìm số câu lớn nhất trong 14 ngày để chuẩn hóa tỷ lệ chiều cao cột biểu đồ SVG
  const maxDailyCount = Math.max(
    ...dailyActivity.map((d) => d.count),
    10 // Tối thiểu 10 câu để biểu đồ có không gian thoáng
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pt-2 pb-16 animate-in fade-in duration-200">
      {/* 1. Header Màn hình Thống kê */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E2E8F0] pb-6">
        <div>
          <div className="text-[11px] font-mono font-bold uppercase tracking-[0.08em] text-[#475569] mb-1.5 flex items-center gap-2">
            <span>Độ vững kỹ năng</span>
            <span className="text-slate-300">•</span>
            <span>Mô hình Wilson (95% tin cậy)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
            Thống kê &amp; Chẩn đoán Điểm số
          </h1>
          <p className="text-sm text-[#475569] mt-1.5 leading-relaxed max-w-xl">
            Đánh giá mức độ thành thạo từng chủ điểm và xác định chính xác phần kiến thức cần củng cố.
          </p>
        </div>

        {/* Nút Primary duy nhất của màn hình: Luyện chủ điểm yếu nhất ngay */}
        {weakestTopic && (
          <Link
            href={`/practice/new?tagId=${weakestTopic.tagId}`}
            className="shrink-0"
          >
            <Button variant="primary" size="cta" className="shadow-sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              Luyện chủ điểm yếu nhất ngay →
            </Button>
          </Link>
        )}
      </div>

      {/* 2. Hàng chỉ số KPI tổng thể */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 bg-white border border-[#E2E8F0] shadow-xs text-center">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#475569]">
            Số câu đã làm
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-[#0F172A] mt-1 tabular-nums">
            {totalAttempts}
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5 font-mono">
            Chính thức
          </div>
        </Card>

        <Card className="p-4 bg-white border border-[#E2E8F0] shadow-xs text-center">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#475569]">
            Số câu đúng
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-[#047857] mt-1 tabular-nums">
            {totalCorrect}
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5 font-mono">
            Làm đúng
          </div>
        </Card>

        <Card className="p-4 bg-white border border-[#E2E8F0] shadow-xs text-center">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#475569]">
            Tỷ lệ đúng
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-[#2563EB] mt-1 tabular-nums">
            {overallAccuracy}%
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5 font-mono">
            {totalCorrect}/{totalAttempts} câu
          </div>
        </Card>

        <Card className="p-4 bg-white border border-[#E2E8F0] shadow-xs text-center">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#475569]">
            Chủ điểm đạt chuẩn
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-[#0F172A] mt-1 tabular-nums">
            {group1Sufficient.filter((t) => t.masteryLabel === "mastered").length}
            <span className="text-sm font-normal text-[#64748B]"> / 16</span>
          </div>
          <div className="text-[11px] text-[#047857] mt-0.5 font-mono font-semibold">
            Độ vững ≥ 75%
          </div>
        </Card>
      </div>

      {/* 3. Bố cục 2 cột chính: Cột trái (Chẩn đoán & Biểu đồ) / Cột phải (Danh sách 16 chủ điểm) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================
            CỘT TRÁI (5/12 Desktop): Chẩn đoán điểm yếu + Biểu đồ 14 ngày
            ======================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* A. Thẻ Cảnh báo điểm yếu nhất cần khắc phục (Hero Diagnostic Card) */}
          {weakestTopic ? (
            <Card
              className={`p-5 sm:p-6 border shadow-xs relative overflow-hidden ${
                weakestTopic.totalAttempts >= 5
                  ? "bg-rose-50/50 border-rose-200"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    weakestTopic.totalAttempts >= 5
                      ? "bg-rose-100 text-rose-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {weakestTopic.totalAttempts >= 5 ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <BookOpen className="w-5 h-5" />
                  )}
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    {weakestTopic.totalAttempts >= 5
                      ? "Chủ điểm cần cải thiện nhất"
                      : "Gợi ý chủ điểm bắt đầu"}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#0F172A]">
                    {weakestTopic.nameVi}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    {weakestTopic.totalAttempts >= 5 ? (
                      <>
                        Độ vững hiện tại:{" "}
                        <span className="font-mono font-bold text-rose-700">
                          {weakestTopic.masteryPercentage}%
                        </span>{" "}
                        ({weakestTopic.correctAttempts}/{weakestTopic.totalAttempts} câu đúng). Cần luyện thêm chủ điểm này để nâng điểm thi thực tế.
                      </>
                    ) : (
                      <>
                        Chủ điểm cốt lõi trong đề thi. Bạn đã làm{" "}
                        <span className="font-mono font-bold">
                          {weakestTopic.totalAttempts}/5
                        </span>{" "}
                        câu cần thiết để kích hoạt chẩn đoán.
                      </>
                    )}
                  </p>

                  <div className="pt-2">
                    <Link href={`/practice/new?tagId=${weakestTopic.tagId}`}>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors cursor-pointer group"
                      >
                        <span>Luyện 10 câu cho chủ điểm này</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ) : null}

          {/* B. Biểu đồ 14 ngày (SVG thuần túy, WCAG AA, có bảng sr-only) */}
          <Card className="p-5 sm:p-6 bg-white border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Tần suất luyện tập 14 ngày gần nhất
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#64748B]">
                Số câu / ngày
              </span>
            </div>

            {isNewLearner ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <p className="text-xs text-[#64748B] max-w-xs mx-auto leading-relaxed">
                  Chưa ghi nhận hoạt động nào. Hãy hoàn thành phiên làm bài đầu tiên để xem biểu đồ tần suất học tập của bạn!
                </p>
                <Link href="/practice/new">
                  <Button variant="secondary" size="sm">
                    Khởi tạo phiên ngay
                  </Button>
                </Link>
              </div>
            ) : (
              <div>
                {/* Biểu đồ SVG thuần túy: aria-hidden để tránh làm rối thiết bị trợ thính */}
                <div className="relative pt-4 pb-1" aria-hidden="true">
                  <svg
                    viewBox="0 0 420 130"
                    className="w-full h-32 sm:h-36 overflow-visible"
                  >
                    {/* Đường lưới nền mờ */}
                    <line
                      x1="0"
                      y1="20"
                      x2="420"
                      y2="20"
                      stroke="#E2E8F0"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1="0"
                      y1="60"
                      x2="420"
                      y2="60"
                      stroke="#E2E8F0"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1="0"
                      y1="100"
                      x2="420"
                      y2="100"
                      stroke="#E2E8F0"
                    />

                    {/* Các cột dữ liệu 14 ngày */}
                    {dailyActivity.map((day, idx) => {
                      const colWidth = 18;
                      const gap = 12;
                      const x = 5 + idx * (colWidth + gap);
                      const barHeight =
                        day.count > 0
                          ? Math.max(6, (day.count / maxDailyCount) * 80)
                          : 0;
                      const y = 100 - barHeight;

                      const isCurrentDay = day.isToday;

                      return (
                        <g key={day.date} className="group">
                          {/* Cột số câu */}
                          {day.count > 0 ? (
                            <rect
                              x={x}
                              y={y}
                              width={colWidth}
                              height={barHeight}
                              rx="3"
                              className={`transition-all duration-200 ${
                                isCurrentDay
                                  ? "fill-[#2563EB]"
                                  : "fill-[#2563EB]/70 hover:fill-[#2563EB]"
                              }`}
                            />
                          ) : (
                            <rect
                              x={x}
                              y={98}
                              width={colWidth}
                              height={2}
                              rx="1"
                              className="fill-slate-200"
                            />
                          )}

                          {/* Nhãn số lượng khi hover hoặc có số câu */}
                          {day.count > 0 && (
                            <text
                              x={x + colWidth / 2}
                              y={Math.max(12, y - 4)}
                              textAnchor="middle"
                              className="text-[9px] font-mono font-bold fill-[#0F172A]"
                            >
                              {day.count}
                            </text>
                          )}

                          {/* Nhãn ngày bên dưới */}
                          <text
                            x={x + colWidth / 2}
                            y="116"
                            textAnchor="middle"
                            className={`text-[9px] font-mono ${
                              isCurrentDay
                                ? "font-bold fill-[#2563EB]"
                                : "fill-[#64748B]"
                            }`}
                          >
                            {day.dayLabel === "Hôm nay" ? "Nay" : day.dayLabel}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Bảng dữ liệu chuẩn cho Accessibility (Trình đọc màn hình) */}
                <table className="sr-only">
                  <caption>Số câu hỏi Part 5 đã hoàn thành trong 14 ngày gần nhất</caption>
                  <thead>
                    <tr>
                      <th scope="col">Ngày</th>
                      <th scope="col">Số câu hoàn thành</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyActivity.map((day) => (
                      <tr key={day.date}>
                        <td>{day.fullDateFormatted} ({day.dayLabel})</td>
                        <td>{day.count} câu</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* C. Hộp giải thích 4 nhãn độ vững chuẩn học thuật (§4.7 & PD-05) */}
          <Card className="p-5 bg-white border border-[#E2E8F0] shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A]">
                Ý nghĩa 4 mức nhãn Độ vững Wilson
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-[#475569]">
              <div className="flex items-start gap-2.5">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] shrink-0">
                  Vững
                </span>
                <p className="leading-relaxed">
                  <strong className="text-[#0F172A]">Vững (≥ 75%):</strong> Làm đúng ổn định, nắm chắc quy tắc ngữ pháp.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] shrink-0">
                  Khá
                </span>
                <p className="leading-relaxed">
                  <strong className="text-[#0F172A]">Khá (50% – 74%):</strong> Nắm được kiến thức cơ bản, đôi khi còn nhầm lẫn bẫy đề.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3] shrink-0">
                  Cần ôn
                </span>
                <p className="leading-relaxed">
                  <strong className="text-[#0F172A]">Cần ôn (&lt; 50%):</strong> Tỷ lệ sai còn cao, cần ưu tiên luyện tập thêm.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#F1F5F9] text-[#475569] border-[#E2E8F0] shrink-0">
                  Chưa đủ DL
                </span>
                <p className="leading-relaxed">
                  <strong className="text-[#0F172A]">Chưa đủ dữ liệu (&lt; 5 câu):</strong> Cần làm thêm để hệ thống chẩn đoán chính xác.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* ========================================================
            CỘT PHẢI (7/12 Desktop): Bảng 16 Chủ điểm chia 2 Nhóm
            ======================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* NHÓM 1: CHỦ ĐIỂM ĐÃ ĐỦ DỮ LIỆU (Sắp xếp tăng dần theo độ vững) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">
                  Chủ điểm đã có dữ liệu ({group1Sufficient.length}/16)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#64748B]">
                Sắp xếp từ yếu đến vững
              </span>
            </div>

            {group1Sufficient.length === 0 ? (
              <Card className="p-6 bg-slate-50 border border-[#E2E8F0] text-center space-y-2">
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Chưa có chủ điểm nào đạt mốc tối thiểu 5 câu làm bài.
                </p>
                <p className="text-xs text-slate-500">
                  Hãy tiếp tục làm bài ở các chủ điểm thuộc Nhóm 2 bên dưới để kích hoạt phân tích!
                </p>
              </Card>
            ) : (
              <div className="space-y-2.5">
                {group1Sufficient.map((topic) => {
                  const badge = topic.badgeInfo;
                  const accuracy = Math.round(
                    (topic.correctAttempts / topic.totalAttempts) * 100
                  );

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
                            Làm đúng {topic.correctAttempts}/{topic.totalAttempts} câu ({accuracy}%) • Wilson: {topic.masteryPercentage}%
                          </div>
                        </div>

                        {/* Nút Luyện sang /practice/new */}
                        <Link
                          href={`/practice/new?tagId=${topic.tagId}`}
                          className="shrink-0"
                        >
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-[#EFF6FF] text-[#0F172A] hover:text-[#2563EB] transition-colors cursor-pointer"
                          >
                            <span>Luyện</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </Link>
                      </div>

                      {/* Thanh tiến độ độ vững 8px chuẩn quy chuẩn (§5.5) */}
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${badge.barClass}`}
                          style={{
                            width: `${Math.min(100, Math.max(5, topic.masteryPercentage))}%`,
                          }}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* NHÓM 2: CHỦ ĐIỂM CHƯA ĐỦ DỮ LIỆU (< 5 CÂU) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">
                  Chưa đủ dữ liệu ({group2Insufficient.length}/16)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#64748B]">
                Cần tối thiểu 5 câu để đánh giá
              </span>
            </div>

            {group2Insufficient.length === 0 ? (
              <Card className="p-4 bg-emerald-50/50 border border-emerald-200 text-center text-xs text-emerald-800">
                Chúc mừng! Bạn đã tích lũy đủ dữ liệu thống kê cho toàn bộ 16 chủ điểm ngữ pháp TOEIC.
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {group2Insufficient.map((topic) => {
                  const needed = Math.max(0, 5 - topic.totalAttempts);

                  return (
                    <div
                      key={topic.tagId}
                      className="p-3.5 rounded-xl bg-[#FAFAF7] border border-[#E2E8F0] flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-[#0F172A]">
                          {topic.nameVi}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-[#64748B]">
                            {topic.totalAttempts}/5 câu
                          </span>
                          <span className="text-[10px] font-mono text-amber-700 font-medium">
                            (Còn thiếu {needed} câu)
                          </span>
                        </div>
                        {/* Thanh xám thể hiện tiến độ tới mốc 5 câu */}
                        <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-400 transition-all"
                            style={{ width: `${(topic.totalAttempts / 5) * 100}%` }}
                          />
                        </div>
                      </div>

                      <Link
                        href={`/practice/new?tagId=${topic.tagId}`}
                        className="shrink-0"
                      >
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium text-slate-700 bg-white border border-[#8190A6]/40 hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer"
                        >
                          Luyện +
                        </button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
