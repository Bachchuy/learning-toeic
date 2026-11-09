"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { ExamMetaSummary } from "../types";
import { Clock, BookOpen, CheckCircle2, ArrowRight } from "lucide-react";

interface ExamListViewProps {
  exams: ExamMetaSummary[];
}

export function ExamListView({ exams }: ExamListViewProps) {
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

              <div className="pt-5 mt-4 border-t border-[#F1F5F9]">
                <Link
                  href={`/exam/${exam.slug}`}
                  className="w-full h-11 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-[15px] inline-flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span>Bắt đầu thi thử</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
