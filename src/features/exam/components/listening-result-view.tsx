"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getListeningProficiencyLevel,
  type ExamListeningEvaluation,
} from "@/core/examListening";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  RotateCcw,
  XCircle,
} from "lucide-react";

interface ListeningResultViewProps {
  examTitle: string;
  evaluation: ExamListeningEvaluation;
  onRetake: () => void;
}

const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

export function ListeningResultView({
  examTitle,
  evaluation,
  onRetake,
}: ListeningResultViewProps) {
  const { scaledScore, rawScore, totalQuestions, timeSpentSeconds, parts, results } =
    evaluation;

  const proficiency = useMemo(
    () => getListeningProficiencyLevel(scaledScore),
    [scaledScore]
  );

  const [reviewFilter, setReviewFilter] = useState<
    "all" | "incorrect" | "correct" | "p1" | "p2" | "p3" | "p4"
  >("all");
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
      if (reviewFilter === "p1") return r.part === 1;
      if (reviewFilter === "p2") return r.part === 2;
      if (reviewFilter === "p3") return r.part === 3;
      if (reviewFilter === "p4") return r.part === 4;
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
      {/* 1. Hero Score Report Banner */}
      <Card className="p-6 md:p-8 bg-white border border-[#E2E8F0] shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: proficiency.badgeBg,
                color: proficiency.colorHex,
              }}
            >
              <Award className="w-4 h-4" aria-hidden="true" />
              <span>{proficiency.levelVi}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">
              Bảng Điểm TOEIC Listening
            </h1>
            <p className="text-xs md:text-sm text-[#475569]">
              Bài thi: <strong className="text-[#0F172A]">{examTitle}</strong>
            </p>
            <p className="text-xs text-[#475569] max-w-xl leading-relaxed pt-1">
              {proficiency.descriptionVi}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] min-w-[200px] text-center shrink-0">
            <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">
              Scaled Score
            </span>
            <div className="text-5xl font-black text-[#2563EB] tracking-tight mt-1 font-mono tabular-nums">
              {scaledScore}
            </div>
            <span className="text-xs text-[#475569] mt-1 font-medium">
              Thang điểm tham chiếu: 5 – 495
            </span>
            <div className="mt-3 pt-2 border-t border-[#E2E8F0] w-full text-[11px] text-[#475569] flex justify-between gap-2 tabular-nums">
              <span>
                Đúng: <strong>{rawScore}/{totalQuestions}</strong>
              </span>
              <span>•</span>
              <span>
                Thời gian: <strong>{formatDuration(timeSpentSeconds)}</strong>
              </span>
            </div>
          </div>
        </div>
      </Card>

      <p className="text-xs text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 leading-relaxed">
        Lưu ý: Thang điểm quy đổi 5–495 chỉ mang tính tham khảo tự luyện dựa trên mô phỏng cấu trúc đề nghe hiểu. Nền tảng hoạt động độc lập, không liên kết hoặc đại diện cho Educational Testing Service (ETS).
      </p>

      {/* 2. Phân tích từng Part (Part 1-4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(
          [
            { key: "part1", label: "Part 1: Mô tả tranh", data: parts.part1 },
            { key: "part2", label: "Part 2: Hỏi - Đáp", data: parts.part2 },
            { key: "part3", label: "Part 3: Hội thoại", data: parts.part3 },
            { key: "part4", label: "Part 4: Bài nói ngắn", data: parts.part4 },
          ] as const
        ).map((item) => (
          <Card
            key={item.key}
            className="p-4 bg-white border border-[#E2E8F0] shadow-2xs space-y-3"
          >
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs font-bold text-[#0F172A] uppercase">
                {item.label}
              </span>
              <span className="text-xs font-mono font-bold text-[#2563EB] tabular-nums">
                {item.data.correct}/{item.data.total}
              </span>
            </div>
            <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#2563EB] h-full rounded-full transition-all duration-500"
                style={{ width: `${item.data.percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#475569]">
              <span>Độ chính xác</span>
              <span className="font-mono font-semibold text-[#0F172A] tabular-nums">
                {item.data.percentage}%
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Action Buttons: 1 Secondary, 1 Primary */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button
          onClick={onRetake}
          variant="secondary"
          className="h-11 px-4 border-[#8190A6] text-[#0F172A]"
        >
          <RotateCcw className="w-4 h-4 mr-1" aria-hidden="true" />
          <span>Làm lại đề Listening</span>
        </Button>

        <Link
          href="/exam"
          className={buttonVariants({ variant: "primary", size: "default" })}
        >
          <span>Danh sách đề thi</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      {/* 3. Chi tiết đáp án, transcript & lời giải */}
      <div className="space-y-4 pt-4 border-t border-[#E2E8F0]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#2563EB]" aria-hidden="true" />
              <span>Xem lại chi tiết từng câu hỏi ({filteredResults.length})</span>
            </h2>
            <p className="text-xs text-[#475569]">
              Đối soát câu trả lời, transcript đoạn nghe và phân tích lý do đúng sai.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              { id: "all", label: `Tất cả (${results.length})` },
              {
                id: "incorrect",
                label: `Câu sai (${results.filter((r) => !r.isCorrect).length})`,
              },
              {
                id: "correct",
                label: `Câu đúng (${results.filter((r) => r.isCorrect).length})`,
              },
              { id: "p1", label: "Part 1" },
              { id: "p2", label: "Part 2" },
              { id: "p3", label: "Part 3" },
              { id: "p4", label: "Part 4" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setReviewFilter(f.id as typeof reviewFilter)}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
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
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <XCircle className="w-4 h-4" aria-hidden="true" />
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

                <div className="text-sm font-semibold text-[#0F172A] leading-relaxed">
                  {item.stem}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {item.options.map((opt, optIdx) => {
                    const isUserChoice = item.userSelectedIndex === optIdx;
                    const isCorrectAnswer =
                      item.correctIndex !== null && item.correctIndex === optIdx;

                    let bgClass = "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]";
                    if (isCorrectAnswer) {
                      bgClass =
                        "bg-[#ECFDF5] border-[#A7F3D0] text-[#047857] font-semibold";
                    } else if (isUserChoice && !item.isCorrect) {
                      bgClass =
                        "bg-[#FFF1F2] border-[#FECDD3] text-[#BE123C] font-semibold";
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
                        {isCorrectAnswer && (
                          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                        )}
                        {isUserChoice && !isCorrectAnswer && (
                          <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {item.isAnswerHidden && (
                  <p className="text-xs text-[#475569] italic pt-2 border-t border-[#F1F5F9]">
                    Đáp án và giải thích chi tiết được ẩn cho câu chưa chọn phương án. Hãy làm lại đề để mở khóa đầy đủ.
                  </p>
                )}

                {(item.explanation || item.evidence || (!item.isAnswerHidden && item.transcript)) && (
                  <div className="pt-2 border-t border-[#F1F5F9]">
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      className="min-h-[36px] text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>
                        {isExpanded
                          ? "Thu gọn giải thích"
                          : "Xem giải thích chi tiết, transcript & bằng chứng"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3 text-xs leading-relaxed animate-in fade-in">
                        {item.transcript && !item.isAnswerHidden && (
                          <div className="space-y-1">
                            <span className="font-bold text-[#0F172A] flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-[#2563EB]" aria-hidden="true" />
                              <span>Transcript đoạn nghe:</span>
                            </span>
                            <pre className="whitespace-pre-wrap font-sans text-[#475569] bg-white p-2.5 rounded-md border border-[#E2E8F0]">
                              {item.transcript}
                            </pre>
                          </div>
                        )}

                        {item.evidence && (
                          <div className="space-y-1">
                            <span className="font-bold text-[#0F172A]">
                              Từ khóa gợi ý đáp án:
                            </span>
                            <blockquote className="italic text-[#475569] pl-3 border-l-2 border-[#2563EB] bg-white p-2 rounded-r-md">
                              &ldquo;{item.evidence}&rdquo;
                            </blockquote>
                          </div>
                        )}

                        {item.explanation && (
                          <div className="space-y-1">
                            <span className="font-bold text-[#0F172A]">
                              Phân tích sư phạm:
                            </span>
                            <p className="text-[#0F172A] whitespace-pre-line">
                              {item.explanation}
                            </p>
                          </div>
                        )}

                        {item.explanationVi && (
                          <div className="space-y-1 pt-1 border-t border-[#E2E8F0]">
                            <span className="font-bold text-[#475569]">
                              Dịch nghĩa & giải thích thêm:
                            </span>
                            <p className="text-[#475569] italic">
                              {item.explanationVi}
                            </p>
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
