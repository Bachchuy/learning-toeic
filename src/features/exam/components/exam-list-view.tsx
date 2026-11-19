"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { ExamMetaSummary, ExamAttemptHistoryItem } from "../types";
import { Clock, BookOpen, CheckCircle2, ArrowRight, History, Award, Headphones } from "lucide-react";

interface ExamListViewProps {
  exams: ExamMetaSummary[];
  history?: ExamAttemptHistoryItem[];
}

function formatAttemptDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export function ExamListView({ exams, history = [] }: ExamListViewProps) {
  const bestScore =
    history.length > 0
      ? Math.max(
          ...history.map((item) =>
            item.examMode === "listening"
              ? item.scoreListening
              : item.scoreReading
          )
        )
      : null;
  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header: Đơn giản, tự tin, đồng bộ với Lý thuyết & Luyện tập */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-[#E2E8F0] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
            Thi thử TOEIC
          </h1>
        </div>
        <div className="text-[13px] font-mono text-[#64748B]">
          Hiển thị <span className="font-semibold text-[#0F172A]">{exams.length}</span> đề thi · 75 phút / 100 câu
        </div>
      </div>

      {/* Format Quy chuẩn ETS Summary Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center font-bold text-sm text-[#2563EB]">
              P5
            </div>
            <div>
              <div className="text-sm font-bold text-[#0F172A]">Part 5: Hoàn thành câu</div>
              <div className="text-xs text-[#475569]">30 câu (101 - 130) · Ngữ pháp & Từ vựng</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center font-bold text-sm text-[#2563EB]">
              P6
            </div>
            <div>
              <div className="text-sm font-bold text-[#0F172A]">Part 6: Điền đoạn văn</div>
              <div className="text-xs text-[#475569]">16 câu (131 - 146) · 4 bài đọc ngắn</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center font-bold text-sm text-[#2563EB]">
              P7
            </div>
            <div>
              <div className="text-sm font-bold text-[#0F172A]">Part 7: Đọc hiểu văn bản</div>
              <div className="text-xs text-[#475569]">54 câu (147 - 200) · Đơn, kép & bài đọc ba</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Danh sách các đề thi */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#2563EB]" />
            <span>Bộ đề thi chuẩn ETS TOEIC 2024</span>
          </h2>
          <span className="text-xs text-[#475569]">{exams.length} đề thi sẵn sàng</span>
        </div>

        {exams.length === 0 ? (
          <Card className="p-8 bg-white border border-[#E2E8F0] text-center space-y-2">
            <p className="text-base font-bold text-[#0F172A]">
              Chưa có đề thi thử nào khả dụng
            </p>
            <p className="text-xs text-[#475569] max-w-md mx-auto leading-relaxed">
              Hệ thống đang cập nhật kho đề thi ETS TOEIC 2024. Bạn có thể chuyển sang mục Luyện tập để ôn tập theo từng chủ điểm.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {exams.map((exam, index) => (
              <Card
                key={exam.id}
                className="p-5 bg-white border border-[#E2E8F0] hover:border-[#2563EB] transition-all flex flex-col justify-between shadow-2xs group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#EFF6FF] text-[#2563EB]">
                        ETS TEST #{index + 1}
                      </span>
                      <span className="text-xs text-[#475569]">Target {exam.target_score}+</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Đã thẩm định</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors line-clamp-1">
                    {exam.title}
                  </h3>

                  <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
                    {exam.description || "Đề thi thử chuẩn cấu trúc đề thi thật ETS TOEIC 2024. Phù hợp đánh giá trình độ và rèn luyện kỹ năng quản lý thời gian."}
                  </p>

                  {/* Specs */}
                  <div className="flex items-center gap-4 pt-2 text-xs text-[#475569] border-t border-[#F1F5F9]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>{exam.duration_minutes} phút</span>
                    </div>
                    <div>•</div>
                    <div>
                      <span className="font-semibold text-[#0F172A]">{exam.total_questions}</span> câu hỏi
                    </div>
                    <div>•</div>
                    <div>Thang điểm <span className="font-semibold text-[#0F172A]">5–495</span></div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-[#F1F5F9] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Link
                    href={`/exam/${exam.slug}`}
                    className={buttonVariants({
                      variant: index === 0 ? "primary" : "secondary",
                      size: "default",
                      className: "w-full",
                    })}
                  >
                    <span>Thi Reading (75p)</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/exam/${exam.slug}/listening`}
                    className={buttonVariants({
                      variant: "secondary",
                      size: "default",
                      className: "w-full",
                    })}
                  >
                    <Headphones className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
                    <span>Thi Listening (45p)</span>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Lịch sử làm bài thi thử (Batch 8 F6) */}
      <section
        id="history"
        aria-labelledby="exam-history-heading"
        className="space-y-4 pt-2 scroll-mt-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="exam-history-heading"
            className="text-lg font-bold text-[#0F172A] flex items-center gap-2"
          >
            <History className="w-5 h-5 text-[#2563EB]" aria-hidden="true" />
            <span>Lịch sử thi thử gần đây</span>
          </h2>
          {bestScore !== null && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
              <Award className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Cao nhất: {bestScore} / 495</span>
            </span>
          )}
        </div>

        {history.length === 0 ? (
          <Card className="p-6 bg-white border border-[#E2E8F0] text-center space-y-2">
            <p className="text-sm font-semibold text-[#0F172A]">
              Chưa có bài thi thử nào hoàn thành
            </p>
            <p className="text-xs text-[#475569] max-w-md mx-auto leading-relaxed">
              Hoàn thành một đề Reading hoặc Listening 100 câu để lưu điểm tham chiếu 5–495 và
              theo dõi xu hướng làm bài tại đây.
            </p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {history.map((item) => {
              const isListening = item.examMode === "listening";
              const itemScore = isListening ? item.scoreListening : item.scoreReading;
              const itemCorrect = isListening ? item.correctCountListening : item.correctCountReading;
              const durationMinutes = Math.max(
                1,
                Math.round(item.timeSpentSeconds / 60)
              );
              const scoreBadgeClass =
                itemScore >= 350
                  ? "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]"
                  : itemScore >= 250
                    ? "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]"
                    : "bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]";
              const retakeHref = item.examSlug
                ? isListening
                  ? `/exam/${item.examSlug}/listening`
                  : `/exam/${item.examSlug}`
                : null;

              return (
                <Card
                  key={item.id}
                  className="p-4 bg-white border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          isListening
                            ? "bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]"
                            : "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
                        }`}
                      >
                        {isListening ? "Listening" : "Reading"}
                      </span>
                      <span className="text-sm font-bold text-[#0F172A]">
                        {item.examTitle}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[#475569] tabular-nums">
                      <span>{formatAttemptDate(item.submittedAt)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{durationMinutes} phút</span>
                      <span aria-hidden="true">·</span>
                      <span>Đúng {itemCorrect}/100 câu</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border tabular-nums ${scoreBadgeClass}`}
                    >
                      {itemScore} / 495
                    </span>
                    {retakeHref && (
                      <Link
                        href={retakeHref}
                        className={buttonVariants({
                          variant: "secondary",
                          size: "sm",
                        })}
                      >
                        Thi lại
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
