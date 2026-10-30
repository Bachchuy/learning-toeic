"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getReadingProficiencyLevel, type ExamReadingEvaluation } from "@/core/examReading";
import {
  Award,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ExamResultViewProps {
  examTitle: string;
  evaluation: ExamReadingEvaluation;
  onRetake: () => void;
}

const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

export function ExamResultView({
  examTitle,
  evaluation,
  onRetake,
}: ExamResultViewProps) {
  const { scaledScore, rawScore, timeSpentSeconds, parts, results } = evaluation;

  const proficiency = useMemo(() => {
    return getReadingProficiencyLevel(scaledScore);
  }, [scaledScore]);

  // Bộ lọc xem lại chi tiết
  const [reviewFilter, setReviewFilter] = useState<"all" | "incorrect" | "correct" | "p5" | "p6" | "p7">("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const toggleExpand = (qId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      if (reviewFilter === "incorrect") return !r.isCorrect;
      if (reviewFilter === "correct") return r.isCorrect;
      if (reviewFilter === "p5") return r.part === 5;
      if (reviewFilter === "p6") return r.part === 6;
      if (reviewFilter === "p7") return r.part === 7;
      return true;
    });
  }, [results, reviewFilter]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} phút ${s} giây`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* ========================================================
          1. HERO SCORE REPORT BANNER (Chuẩn ETS TOEIC Scale 5-495)
          ======================================================== */}
      <Card className="p-6 md:p-8 bg-white border border-[#E2E8F0] shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: proficiency.badgeBg, color: proficiency.colorHex }}>
              <Award className="w-4 h-4" />
              <span>{proficiency.levelVi}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">
              Bảng Điểm TOEIC Reading
            </h1>
            <p className="text-xs md:text-sm text-[#475569]">
              Bài thi: <strong className="text-[#0F172A]">{examTitle}</strong>
            </p>
            <p className="text-xs text-[#475569] max-w-xl leading-relaxed pt-1">
              {proficiency.descriptionVi}
            </p>
          </div>

          {/* Cụm Điểm Quy Đổi To Rõ */}
          <div className="flex flex-col items-center justify-center p-6 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] min-w-[200px] text-center shrink-0">
            <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">
              Scaled Score
            </span>
            <div className="text-5xl font-black text-[#2563EB] tracking-tight mt-1 font-mono">
              {scaledScore}
            </div>
            <span className="text-xs text-[#475569] mt-1 font-medium">
              Thang điểm ETS: 5 – 495
            </span>
            <div className="mt-3 pt-2 border-t border-[#E2E8F0] w-full text-[11px] text-[#475569] flex justify-between">
              <span>Đúng: <strong>{rawScore}/100</strong></span>
              <span>•</span>
              <span>Thời gian: <strong>{formatDuration(timeSpentSeconds)}</strong></span>
            </div>
          </div>
        </div>
      </Card>

      {/* ========================================================
          2. PHÂN TÍCH HIỆU SUẤT TỪNG PHẦN (PART 5, 6, 7)
          ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Part 5 */}
        <Card className="p-4 bg-white border border-[#E2E8F0] shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#0F172A] uppercase">Part 5: Hoàn thành câu</span>
            <span className="text-xs font-bold text-[#2563EB]">{parts.part5.correct}/{parts.part5.total}</span>
          </div>
          <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#2563EB] h-full rounded-full transition-all duration-500"
              style={{ width: `${parts.part5.percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#475569]">
            <span>Độ chính xác</span>
            <span className="font-semibold text-[#0F172A]">{parts.part5.percentage}%</span>
          </div>
        </Card>

        {/* Part 6 */}
        <Card className="p-4 bg-white border border-[#E2E8F0] shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#0F172A] uppercase">Part 6: Điền đoạn văn</span>
            <span className="text-xs font-bold text-[#2563EB]">{parts.part6.correct}/{parts.part6.total}</span>
          </div>
          <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#2563EB] h-full rounded-full transition-all duration-500"
              style={{ width: `${parts.part6.percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#475569]">
            <span>Độ chính xác</span>
            <span className="font-semibold text-[#0F172A]">{parts.part6.percentage}%</span>
          </div>
        </Card>

        {/* Part 7 */}
        <Card className="p-4 bg-white border border-[#E2E8F0] shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#0F172A] uppercase">Part 7: Đọc hiểu văn bản</span>
            <span className="text-xs font-bold text-[#2563EB]">{parts.part7.correct}/{parts.part7.total}</span>
          </div>
          <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#2563EB] h-full rounded-full transition-all duration-500"
              style={{ width: `${parts.part7.percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#475569]">
            <span>Độ chính xác</span>
            <span className="font-semibold text-[#0F172A]">{parts.part7.percentage}%</span>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button
          onClick={onRetake}
          variant="secondary"
          className="h-10 px-4 border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC] cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          <span>Làm lại đề này</span>
        </Button>

        <Link
          href="/exam"
          className="h-10 px-5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium inline-flex items-center justify-center transition-colors cursor-pointer text-sm"
        >
          <span>Danh sách đề thi</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>

      {/* ========================================================
          3. CHI TIẾT ĐÁP ÁN & LỜI GIẢI SƯ PHẠM (100 CÂU)
          ======================================================== */}
      <div className="space-y-4 pt-4 border-t border-[#E2E8F0]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#2563EB]" />
              <span>Xem lại chi tiết từng câu hỏi ({filteredResults.length})</span>
            </h2>
            <p className="text-xs text-[#475569]">
              Đối soát câu trả lời, trích dẫn bằng chứng trong bài đọc và phân tích lý do đúng sai.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1 text-xs">
            {[
              { id: "all", label: `Tất cả (${results.length})` },
              { id: "incorrect", label: `Câu sai (${results.filter((r) => !r.isCorrect).length})` },
              { id: "correct", label: `Câu đúng (${results.filter((r) => r.isCorrect).length})` },
              { id: "p5", label: "Part 5" },
              { id: "p6", label: "Part 6" },
              { id: "p7", label: "Part 7" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setReviewFilter(f.id as typeof reviewFilter)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  reviewFilter === f.id
                    ? "bg-[#2563EB] text-white"
                    : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách các câu hỏi xem lại */}
        <div className="space-y-4">
          {filteredResults.map((item) => {
            const isExpanded = expandedIds.has(item.id);

            return (
              <Card
                key={item.id}
                className={`p-5 bg-white border transition-all ${
                  item.isCorrect ? "border-[#A7F3D0]" : "border-[#FECDD3]"
                } shadow-2xs space-y-4`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        item.isCorrect
                          ? "bg-[#ECFDF5] text-[#047857]"
                          : "bg-[#FFF1F2] text-[#BE123C]"
                      }`}
                    >
                      {item.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </span>
                    <div>
                      <span className="text-sm font-bold text-[#0F172A]">
                        Câu {item.questionNumber}
                      </span>
                      <span className="text-xs text-[#475569] ml-2">
                        (Part {item.part})
                      </span>
                    </div>
                  </div>

                  <div className="text-xs font-semibold flex items-center gap-2">
                    {item.isCorrect ? (
                      <span className="text-[#047857] bg-[#ECFDF5] px-2.5 py-1 rounded-md">
                        Đúng (+1)
                      </span>
                    ) : (
                      <span className="text-[#BE123C] bg-[#FFF1F2] px-2.5 py-1 rounded-md">
                        {item.userSelectedIndex === null ? "Chưa làm" : "Chưa chính xác"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Câu hỏi */}
                <div className="text-sm font-semibold text-[#0F172A] leading-relaxed">
                  {item.stem}
                </div>

                {/* 4 Phương án có highlight */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {item.options.map((opt, optIdx) => {
                    const isUserChoice = item.userSelectedIndex === optIdx;
                    const isCorrectAnswer = item.correctIndex === optIdx;

                    let bgClass = "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]";
                    if (isCorrectAnswer) {
                      bgClass = "bg-[#ECFDF5] border-[#A7F3D0] text-[#047857] font-semibold";
                    } else if (isUserChoice && !item.isCorrect) {
                      bgClass = "bg-[#FFF1F2] border-[#FECDD3] text-[#BE123C] font-semibold";
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-lg border flex items-center gap-2.5 ${bgClass}`}
                      >
                        <span className="font-bold w-5 h-5 rounded bg-white/80 flex items-center justify-center shrink-0 border border-current">
                          {OPTION_LETTERS[optIdx]}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {isCorrectAnswer && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                        {isUserChoice && !isCorrectAnswer && <XCircle className="w-4 h-4 shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {/* Toggle xem giải thích & bằng chứng */}
                {(item.explanation || item.evidence) && (
                  <div className="pt-2 border-t border-[#F1F5F9]">
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? "Thu gọn giải thích" : "Xem giải thích chi tiết & bằng chứng"}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3 text-xs leading-relaxed animate-in fade-in">
                        {item.evidence && (
                          <div className="space-y-1">
                            <span className="font-bold text-[#0F172A] flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                              <span>Trích dẫn bằng chứng trong bài:</span>
                            </span>
                            <blockquote className="italic text-[#475569] pl-3 border-l-2 border-[#2563EB] bg-white p-2 rounded-r-md">
                              &ldquo;{item.evidence}&rdquo;
                            </blockquote>
                          </div>
                        )}

                        {item.explanation && (
                          <div className="space-y-1">
                            <span className="font-bold text-[#0F172A]">Phân tích sư phạm:</span>
                            <p className="text-[#334155] whitespace-pre-line">{item.explanation}</p>
                          </div>
                        )}

                        {item.explanationVi && (
                          <div className="space-y-1 pt-1 border-t border-[#E2E8F0]">
                            <span className="font-bold text-[#475569]">Dịch nghĩa phương án:</span>
                            <p className="text-[#64748B] italic">{item.explanationVi}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
