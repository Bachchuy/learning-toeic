"use client";

import { useState } from "react";
import Link from "next/link";
import type { SessionReviewResponse, SessionReviewItem } from "@/features/practice/types";
import { calculateAccuracy } from "@/core/math";
import { DrillRunner } from "./drill-runner";
import { AdaptiveExplanation } from "./adaptive-explanation";
import { AnswerOption } from "./answer-option";
import { VocabSaveModal } from "@/features/vocab/components/vocab-save-modal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RotateCcw,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookmarkPlus,
} from "lucide-react";

interface PracticeResultViewProps {
  review: SessionReviewResponse;
}

/**
 * Format khoảng thời gian làm bài (tính từ created_at đến completed_at)
 */
function formatDuration(createdAt: string, completedAt: string | null): string {
  if (!completedAt) return "Không xác định";

  const start = new Date(createdAt).getTime();
  const end = new Date(completedAt).getTime();
  const diffSeconds = Math.max(0, Math.floor((end - start) / 1000));

  const minutes = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;

  if (minutes === 0) {
    return `${seconds} giây`;
  }
  return `${minutes} phút ${seconds} giây`;
}

export function PracticeResultView({ review }: PracticeResultViewProps) {
  const [isDrillActive, setIsDrillActive] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "wrong">("all");
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [activeVocabItem, setActiveVocabItem] = useState<SessionReviewItem | null>(null);

  const wrongItems = (review.attempts || []).filter((item) => !item.is_correct);
  const wrongCount = wrongItems.length;
  const isPerfect = review.correct_count === review.total_questions;
  const accuracy = calculateAccuracy(review.correct_count, review.total_questions);
  const durationText = formatDuration(review.created_at, review.completed_at);

  // Chuyển sang màn hình Drill nếu đang kích hoạt
  if (isDrillActive && wrongItems.length > 0) {
    return (
      <DrillRunner
        wrongItems={wrongItems}
        onExitDrill={() => setIsDrillActive(false)}
      />
    );
  }

  const toggleExpand = (questionId: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const displayedAttempts =
    filterMode === "wrong" ? wrongItems : review.attempts || [];

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4 animate-in fade-in duration-200">
      {/* 1. Score Card Header */}
      <Card className="text-center p-6 sm:p-8 bg-white border border-[#E2E8F0] shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] font-mono mb-3">
          Tổng kết phiên luyện tập
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
          Kết quả bài làm
        </h1>
        <p className="text-sm text-[#475569] mt-1">
          Phiên luyện Part 5 gồm {review.total_questions} câu hỏi ngữ pháp
        </p>

        {/* Số điểm to mono */}
        <div className="my-6">
          <div className="text-5xl sm:text-6xl font-bold font-mono text-[#0F172A] tracking-tight">
            {review.correct_count}{" "}
            <span className="text-2xl sm:text-3xl text-[#475569] font-normal">
              / {review.total_questions}
            </span>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs sm:text-sm font-mono mt-3">
            <span className="font-semibold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-md border border-[#BFDBFE]">
              Độ chính xác: {accuracy}%
            </span>
            <span className="inline-flex items-center gap-1 text-[#475569] bg-[#F8FAFC] px-2.5 py-1 rounded-md border border-[#E2E8F0]">
              <Clock className="w-3.5 h-3.5" />
              {durationText}
            </span>
          </div>
        </div>

        {/* Nút hành động chính khi hoàn hảo 10/10 (Ẩn Drill) */}
        {isPerfect && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/practice/new" className="w-full sm:w-auto">
              <Button variant="primary" size="cta" className="w-full sm:w-48">
                Luyện phiên mới →
              </Button>
            </Link>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="secondary" size="default" className="w-full sm:w-40">
                Về Trang chủ
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* 2. Ô Drill Box Indigo (PD-03 & §4.5) — Chỉ hiện khi có câu sai */}
      {!isPerfect && wrongCount > 0 && (
        <Card className="p-6 bg-[#EEF2FF] border border-[#C7D2FE] shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#E0E7FF] text-[#4338CA]">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h2 className="text-base sm:text-lg font-bold text-[#312E81]">
                  Củng cố nhanh điểm chưa chắc
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#4338CA] leading-relaxed">
                Có <span className="font-bold">{wrongCount} câu</span> bạn vừa phân vân lúc nãy. Làm lại ngay khi kiến thức còn nóng sẽ giúp bạn nhớ sâu và tự tin hơn.
              </p>
            </div>

            {/* Bất biến: Duy nhất 1 nút Primary trên màn hình có câu sai */}
            <Button
              variant="primary"
              size="cta"
              className="w-full sm:w-auto shrink-0 shadow-md"
              onClick={() => setIsDrillActive(true)}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Củng cố {wrongCount} câu này ngay
            </Button>
          </div>
        </Card>
      )}

      {/* Nút hành động phụ khi có câu sai */}
      {!isPerfect && (
        <div className="flex items-center justify-end gap-3 text-sm">
          <Link href="/practice/new">
            <Button variant="secondary" size="default">
              Luyện thêm phiên mới
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="default">
              Về Trang chủ
            </Button>
          </Link>
        </div>
      )}

      {/* 3. Danh sách câu hỏi chi tiết */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-bold text-[#0F172A]">
            Chi tiết câu hỏi bài làm
          </h2>

          {/* Segmented Filter */}
          <div className="inline-flex rounded-lg border border-[#8190A6] p-0.5 bg-[#F8FAFC] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                filterMode === "all"
                  ? "bg-white text-[#0F172A] shadow-sm font-mono"
                  : "text-[#475569] hover:text-[#0F172A]"
              }`}
            >
              Tất cả ({review.total_questions})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("wrong")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                filterMode === "wrong"
                  ? "bg-[#FFF1F2] text-[#BE123C] shadow-sm font-mono"
                  : "text-[#475569] hover:text-[#BE123C]"
              }`}
            >
              Câu sai ({wrongCount})
            </button>
          </div>
        </div>

        {/* Danh sách từng câu */}
        <div className="space-y-4">
          {displayedAttempts.map((item: SessionReviewItem) => {
            const optionLabels = ["A", "B", "C", "D"] as const;
            const selectedLabel =
              item.selected_index !== null
                ? optionLabels[item.selected_index]
                : "Chưa chọn";
            const correctLabel = optionLabels[item.correct_index];
            const isExpanded = !!expandedQuestions[item.question_id];

            const optionsTexts = [
              item.option_a,
              item.option_b,
              item.option_c,
              item.option_d,
            ];
            const selectedText =
              item.selected_index !== null
                ? optionsTexts[item.selected_index]
                : "Chưa chọn";
            const correctText = optionsTexts[item.correct_index];

            // 4 phương án tương ứng
            const optionsData = [
              { key: "A" as const, text: item.option_a, index: 0 },
              { key: "B" as const, text: item.option_b, index: 1 },
              { key: "C" as const, text: item.option_c, index: 2 },
              { key: "D" as const, text: item.option_d, index: 3 },
            ] as const;

            return (
              <Card
                key={item.question_id}
                className="p-5 sm:p-6 space-y-4 bg-white border border-[#E2E8F0] shadow-sm"
              >
                {/* Header câu hỏi */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0F172A]">
                      Câu {item.order_index}
                    </span>
                    <span className="text-xs text-[#475569] font-mono">
                      • {item.tag_name_vi}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveVocabItem(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] transition-colors cursor-pointer"
                      title="Lưu từ vựng của câu này"
                    >
                      <BookmarkPlus className="w-3 h-3" />
                      <span>+ Lưu từ</span>
                    </button>

                    {item.is_correct ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#047857] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0] font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đúng
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#BE123C] bg-[#FFF1F2] px-2.5 py-0.5 rounded-full border border-[#FECDD3] font-mono">
                        <XCircle className="w-3.5 h-3.5" />
                        Sai
                      </span>
                    )}
                  </div>
                </div>

                {/* Nội dung đề bài STEM: Nâng cấp cỡ chữ lớn, đậm, rõ nét hơn hẳn giải thích */}
                <h3 className="text-[17px] sm:text-[18px] font-semibold text-[#0F172A] leading-[1.6] tracking-[-0.01em]">
                  {item.stem}
                </h3>

                {/* Tóm tắt lựa chọn cụ thể: Hiển thị rõ chữ phương án chứ không chỉ A B C D */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-[13px] p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#475569]">Bạn chọn:</span>
                    <span
                      className={`font-semibold ${
                        item.is_correct ? "text-[#047857]" : "text-[#BE123C]"
                      }`}
                    >
                      {item.selected_index !== null ? (
                        <>
                          <span className="font-mono font-bold">{selectedLabel}.</span>{" "}
                          {selectedText}
                        </>
                      ) : (
                        "Chưa chọn"
                      )}
                    </span>
                  </div>

                  <div className="text-[#CBD5E1] hidden sm:inline">|</div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[#475569]">Đáp án đúng:</span>
                    <span className="font-semibold text-[#047857]">
                      <span className="font-mono font-bold">{correctLabel}.</span>{" "}
                      {correctText}
                    </span>
                  </div>
                </div>

                {/* Accordion mở/thu gọn giải thích & 4 phương án chi tiết */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.question_id)}
                    className="w-full flex items-center justify-between py-2.5 text-xs sm:text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors cursor-pointer border-t border-[#F1F5F9]"
                  >
                    <span>
                      {isExpanded
                        ? "Thu gọn giải thích"
                        : "Xem giải thích chi tiết & phân tích 4 phương án"}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {/* Khi mở rộng: Hiển thị 4 phương án phân tích + Adaptive Explanation gọn gàng */}
                  {isExpanded && (
                    <div className="pt-3 space-y-4 animate-in fade-in slide-in-from-top-1 duration-150">
                      {/* 4 Phương án có trạng thái & phân tích */}
                      <div className="space-y-2.5">
                        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#475569]">
                          Phân tích các phương án lựa chọn:
                        </div>
                        {optionsData.map(({ key, text, index }) => {
                          let optState:
                            | "default"
                            | "selected"
                            | "correct"
                            | "incorrect"
                            | "unselected_disabled" = "unselected_disabled";

                          if (index === item.correct_index) {
                            optState = "correct";
                          } else if (index === item.selected_index && !item.is_correct) {
                            optState = "incorrect";
                          }

                          const analysis =
                            item.explanation?.options_analysis?.[key];

                          return (
                            <AnswerOption
                              key={key}
                              label={key}
                              text={text}
                              translation={analysis}
                              state={optState}
                              disabled={true}
                            />
                          );
                        })}
                      </div>

                      {/* Khối Giải thích thích ứng (mặc định thu gọn quy tắc & mẹo) */}
                      <AdaptiveExplanation
                        isCorrect={!!item.is_correct}
                        explanation={item.explanation}
                        initiallyExpanded={false}
                      />
                    </div>
                  )}
                </div>
              </Card>
            );
          })}

          {displayedAttempts.length === 0 && (
            <div className="p-8 text-center bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-sm text-[#475569]">
              Không có câu hỏi nào trong mục này.
            </div>
          )}
        </div>
      </div>

      {/* Modal Lưu từ vựng (Milestone 7) */}
      {activeVocabItem && (
        <VocabSaveModal
          key={`result-vocab-${activeVocabItem.question_id}-${activeVocabItem.order_index}`}
          isOpen={!!activeVocabItem}
          contextSentence={activeVocabItem.stem}
          answerText={
            [
              activeVocabItem.option_a,
              activeVocabItem.option_b,
              activeVocabItem.option_c,
              activeVocabItem.option_d,
            ][activeVocabItem.correct_index] || ""
          }
          contextTranslation={
            activeVocabItem.explanation?.full_translation_vi || ""
          }
          questionId={activeVocabItem.question_id}
          vocabHints={activeVocabItem.explanation?.vocab_hints || []}
          onClose={() => setActiveVocabItem(null)}
        />
      )}
    </div>
  );
}
