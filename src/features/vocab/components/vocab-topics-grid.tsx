"use client";

import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Flame,
  Loader2,
  Sparkles,
} from "lucide-react";
import { getTopicVisuals } from "../lib/topic-visuals";

export interface VocabBookSummary {
  id: string;
  title: string;
  englishTitle: string;
  description: string;
  badge: string;
  color: string;
  totalCards: number;
  wordsCount: number;
  importedCount: number;
  reviewedCount: number;
  topicsCount: number;
  topics: string[];
  isImported: boolean;
  notebookId?: string;
  deckDue: number;
  reviewUrl: string;
}

export interface VocabTopicSummary {
  name: string;
  count: number;
  importedCount: number;
  reviewedCount: number;
  dueCount: number;
}

interface VocabTopicsGridProps {
  selectedBook: VocabBookSummary;
  topics: VocabTopicSummary[];
  isImportingBook?: boolean;
  onBackToBooks: () => void;
  onViewAllBookWords: () => void;
  onSelectTopic: (topicName: string) => void;
  onReviewBook: () => void;
  onReviewTopic: (topicName: string) => void;
}

export function VocabTopicsGrid({
  selectedBook,
  topics,
  isImportingBook = false,
  onBackToBooks,
  onViewAllBookWords,
  onSelectTopic,
  onReviewBook,
  onReviewTopic,
}: VocabTopicsGridProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Thanh Breadcrumb Điều hướng phía trên */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onBackToBooks}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-xs font-bold text-[#0F172A] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Kệ Sổ</span>
          </button>
          <span className="text-slate-300">/</span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm sm:text-base font-bold text-[#0F172A]">
              {selectedBook.title}
            </span>
            <span className="text-xs text-[#475569] font-mono font-medium">
              ({selectedBook.wordsCount} từ • {topics.length} chủ điểm)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onViewAllBookWords}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white border border-[#8190A6] hover:border-[#2563EB] text-xs font-semibold text-[#0F172A] hover:text-[#2563EB] transition-colors cursor-pointer shadow-xs"
          >
            Xem toàn bộ từ trong sổ ({selectedBook.wordsCount})
          </button>
          <button
            type="button"
            disabled={isImportingBook}
            onClick={onReviewBook}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-xs font-bold text-white flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            {isImportingBook ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang nạp sổ...</span>
              </>
            ) : (
              <>
                <span>
                  {!selectedBook.isImported ? "Nạp & Ôn tập sổ này" : "Ôn tập sổ này"}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Lưới Grid Các Chủ Điểm Riêng Của Cuốn Sổ Này (3 Cột) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((top) => {
          const visual = getTopicVisuals(top.name);
          const TopicIcon = visual.icon;
          const isUnimported = !selectedBook.isImported || top.importedCount === 0;
          const isNotStarted = !isUnimported && top.reviewedCount === 0;
          const isCompletedToday =
            !isUnimported && top.reviewedCount > 0 && top.dueCount === 0;

          const completionRate = isUnimported || isNotStarted
            ? 0
            : isCompletedToday
              ? 100
              : top.count > 0
                ? Math.min(
                    100,
                    Math.max(8, Math.round(((top.count - top.dueCount) / top.count) * 100))
                  )
                : 0;
          const isSameName = visual.titleVi.toLowerCase() === top.name.toLowerCase();

          return (
            <Card
              key={top.name}
              className="p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs hover:shadow-md hover:border-[#2563EB]/40 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-xs ${visual.badgeColor}`}
                    >
                      <TopicIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="text-sm sm:text-base font-bold text-[#0F172A] truncate"
                        title={top.name}
                      >
                        {visual.titleVi}
                      </h3>
                      {!isSameName && (
                        <span className="text-xs text-[#475569] font-medium truncate block">
                          {top.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569] shrink-0 border border-[#E2E8F0]">
                    {top.count} từ
                  </span>
                </div>

                {/* Tiến độ FSRS & Trạng thái trung thực 3 cấp */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#475569] font-medium">Trạng thái ôn tập:</span>
                    {isUnimported ? (
                      <span className="font-semibold text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                        Chưa nạp vào sổ
                      </span>
                    ) : isNotStarted ? (
                      <span className="font-bold text-[#2563EB] flex items-center gap-1 font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                        Mới nạp · {top.dueCount || top.count} thẻ chờ học
                      </span>
                    ) : top.dueCount > 0 ? (
                      <span className="font-bold text-[#4338CA] flex items-center gap-1 font-mono">
                        <Flame className="w-3.5 h-3.5 text-[#B45309]" />
                        {top.dueCount} thẻ cần ôn
                      </span>
                    ) : (
                      <span className="font-bold text-[#047857] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã ôn xong hôm nay
                      </span>
                    )}
                  </div>
                  <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${completionRate}%`,
                        backgroundColor: isCompletedToday ? "#047857" : "#2563EB",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer: 2 Nút hành động chuẩn >=44px touch target */}
              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectTopic(top.name)}
                  className="flex-1 min-h-[44px] px-3 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#475569]" />
                  <span>Mở sổ xem từ</span>
                </button>

                <button
                  type="button"
                  disabled={isImportingBook}
                  onClick={() => onReviewTopic(top.name)}
                  className="min-h-[44px] px-3.5 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] disabled:opacity-60 text-[#2563EB] text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0 border border-[#BFDBFE]"
                >
                  {isImportingBook ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>
                        {isUnimported
                          ? "Nạp & Ôn"
                          : isCompletedToday
                            ? "Ôn lại"
                            : "Ôn tập"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
