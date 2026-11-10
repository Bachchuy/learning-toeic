"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateFeedbackStatusAction } from "@/features/feedback/actions";
import type { FeedbackStatus } from "@/features/feedback/schemas";
import type { AdminInsightsData, UserFeedbackItem } from "@/features/feedback/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  FileText,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface AdminInsightsViewProps {
  initialData: AdminInsightsData;
}

const CATEGORY_LABEL: Record<UserFeedbackItem["category"], string> = {
  ux: "Giao diện / UX",
  bug: "Lỗi kỹ thuật",
  content: "Nội dung đề",
  feature: "Tính năng mới",
  other: "Khác",
};

const STATUS_BADGE: Record<
  FeedbackStatus,
  { label: string; className: string }
> = {
  new: {
    label: "Mới",
    className: "bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]",
  },
  reviewed: {
    label: "Đã xem",
    className: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]",
  },
  resolved: {
    label: "Đã xử lý",
    className: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]",
  },
};

export function AdminInsightsView({ initialData }: AdminInsightsViewProps) {
  const [feedbacks, setFeedbacks] = useState<UserFeedbackItem[]>(
    initialData.feedbacks
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const completionRate =
    initialData.usage.sessionsCount > 0
      ? Math.round(
          (initialData.usage.completedSessionsCount /
            initialData.usage.sessionsCount) *
            100
        )
      : 0;

  const isHighReportRate = initialData.usage.reportRatePercent >= 2;

  const handleStatusChange = (id: string, nextStatus: FeedbackStatus) => {
    setUpdatingId(id);
    startTransition(async () => {
      const res = await updateFeedbackStatusAction(id, nextStatus);
      setUpdatingId(null);
      if (res.success) {
        setFeedbacks((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: nextStatus } : item
          )
        );
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6 pb-28 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/"
              className="text-[#475569] hover:text-[#0F172A] flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Trang chủ
            </Link>
            <span className="text-[#8190A6]">/</span>
            <span className="font-semibold text-[#0F172A]">Quản trị &amp; Số liệu</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#2563EB]" aria-hidden="true" />
            Admin Insights &amp; Góp ý
          </h1>
        </div>

        <Link href="/admin/review">
          <Button variant="secondary" className="gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
            <span>Hàng đợi duyệt đề ({initialData.content.needsReviewCount})</span>
          </Button>
        </Link>
      </div>

      {/* Hàng 1: Chỉ số sử dụng & Phễu */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#E2E8F0]">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-medium text-[#475569]">Hồ sơ người dùng</span>
            <div className="text-2xl font-bold font-mono text-[#0F172A]">
              {initialData.usage.profilesCount}
            </div>
            <p className="text-xs text-[#475569]">
              {initialData.usage.examAttemptsCount} lượt thi thử Reading
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0]">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-medium text-[#475569]">Phiên Part 5</span>
            <div className="text-2xl font-bold font-mono text-[#0F172A]">
              {initialData.usage.completedSessionsCount}/{initialData.usage.sessionsCount}
            </div>
            <p className="text-xs text-[#475569]">
              Hoàn thành: <span className="font-mono font-semibold">{completionRate}%</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0]">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-medium text-[#475569]">Lượt trả lời &amp; Ôn FSRS</span>
            <div className="text-2xl font-bold font-mono text-[#0F172A]">
              {initialData.usage.attemptsCount}
            </div>
            <p className="text-xs text-[#475569]">
              {initialData.usage.reviewEventsCount} lượt chấm thẻ FSRS
            </p>
          </CardContent>
        </Card>

        <Card
          className={
            isHighReportRate
              ? "border-[#BE123C]/40 bg-[#FFF1F2]/40"
              : "border-[#E2E8F0]"
          }
        >
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-medium text-[#475569]">Tỉ lệ báo lỗi câu hỏi</span>
            <div
              className={`text-2xl font-bold font-mono flex items-center gap-1.5 ${
                isHighReportRate ? "text-[#BE123C]" : "text-[#047857]"
              }`}
            >
              <span>{initialData.usage.reportRatePercent}%</span>
              {isHighReportRate ? (
                <AlertTriangle className="w-4 h-4" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              )}
            </div>
            <p className="text-xs text-[#475569]">
              {initialData.usage.reportsCount} báo cáo (Ngưỡng cảnh báo: 2%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hàng 2: Góp ý người dùng + Thống kê Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cột trái 7/12: Hộp thư góp ý */}
        <Card className="lg:col-span-7 border-[#E2E8F0]">
          <CardHeader className="pb-3 border-b border-[#F1F5F9]">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
              Hộp thư Góp ý &amp; Báo lỗi ({feedbacks.length})
            </CardTitle>
            <CardDescription>
              Ý kiến thu thập từ người dùng thực tế kèm đường dẫn và kích thước màn hình
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {feedbacks.length === 0 ? (
              <div className="py-10 text-center space-y-2 text-sm text-[#475569]">
                <Clock className="w-8 h-8 text-[#8190A6] mx-auto" aria-hidden="true" />
                <p className="font-medium text-[#0F172A]">Chưa có góp ý nào được gửi</p>
                <p className="text-xs">
                  Góp ý mới gửi qua nút &ldquo;Góp ý&rdquo; trên thanh điều hướng sẽ hiển thị tại đây.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {feedbacks.map((item) => {
                  const statusCfg = STATUS_BADGE[item.status];
                  const isRowPending = isPending && updatingId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${statusCfg.className}`}
                          >
                            {statusCfg.label}
                          </span>
                          <Badge variant="neutral" showIcon={false} className="text-[11px]">
                            {CATEGORY_LABEL[item.category]}
                          </Badge>
                          {item.pagePath && (
                            <span className="text-[11px] font-mono text-[#475569] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
                              {item.pagePath}
                            </span>
                          )}
                          {item.viewport && (
                            <span className="text-[11px] font-mono text-[#475569]">
                              {item.viewport}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-[#475569]">
                          {new Date(item.createdAt).toLocaleString("vi-VN", {
                            timeZone: "Asia/Ho_Chi_Minh",
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <p className="text-sm text-[#0F172A] leading-relaxed whitespace-pre-wrap">
                        {item.message}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {item.status !== "reviewed" && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={isRowPending}
                            onClick={() => handleStatusChange(item.id, "reviewed")}
                            className="min-h-[36px] text-xs"
                          >
                            Đánh dấu Đã xem
                          </Button>
                        )}
                        {item.status !== "resolved" && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={isRowPending}
                            onClick={() => handleStatusChange(item.id, "resolved")}
                            className="min-h-[36px] text-xs text-[#047857] border-[#047857]/30 hover:bg-[#ECFDF5]"
                          >
                            Đánh dấu Đã xử lý
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cột phải 5/12: Sự kiện D-08 + Kiểm kê kho đề */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-[#E2E8F0]">
            <CardHeader className="pb-3 border-b border-[#F1F5F9]">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
                Hành vi học tập (1.000 sự kiện gần nhất)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5">
              {initialData.eventBreakdown.length === 0 ? (
                <p className="text-xs text-[#475569]">Chưa có dữ liệu sự kiện.</p>
              ) : (
                initialData.eventBreakdown.map((ev) => (
                  <div
                    key={ev.eventName}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-[#F1F5F9] last:border-b-0"
                  >
                    <span className="font-mono text-[#0F172A]">{ev.eventName}</span>
                    <span className="font-mono font-bold text-[#2563EB]">{ev.count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-[#E2E8F0]">
            <CardHeader className="pb-3 border-b border-[#F1F5F9]">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
                Độ dày Kho Đề Hiện Tại
              </CardTitle>
              <CardDescription>
                {initialData.content.part5Total} Part 5 ·{" "}
                {initialData.content.passageCount} bài đọc Part 6/7 ·{" "}
                {initialData.content.examSetsCount} bộ đề thi thử
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-2 max-h-[380px] overflow-y-auto">
              {initialData.content.tagStats.map((tag) => {
                const isLow = tag.publishedCount < 35;
                return (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between gap-2 text-xs py-1 border-b border-[#F1F5F9] last:border-b-0"
                  >
                    <span className="text-[#0F172A] truncate" title={tag.nameVi}>
                      {tag.nameVi}
                    </span>
                    <span
                      className={`font-mono font-semibold px-2 py-0.5 rounded shrink-0 ${
                        isLow
                          ? "bg-[#FFFBEB] text-[#B45309]"
                          : "bg-[#F1F5F9] text-[#0F172A]"
                      }`}
                    >
                      {tag.publishedCount} câu
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
