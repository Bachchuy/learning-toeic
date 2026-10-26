"use client";

import { useEffect } from "react";
import type { VocabEntry } from "@/features/vocab/types";
import {
  getPosBadgeInfo,
  generateNaturalExplanation,
} from "@/core/vocab";
import { resolvePhonetic } from "@/core/vocabDictionary";
import { playPronunciation } from "@/lib/audio";
import {
  X,
  Calendar,
  Sparkles,
  Brain,
  Edit2,
  Trash2,
  Volume2,
  Layers,
  Bookmark,
} from "lucide-react";

interface VocabDetailModalProps {
  entry: VocabEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onEditClick: (entry: VocabEntry) => void;
  onDeleteClick: (vocabId: string) => void;
}

export function VocabDetailModal({
  entry,
  isOpen,
  onClose,
  onEditClick,
  onDeleteClick,
}: VocabDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !entry) return null;

  const card = entry.card;
  const isDue = card?.due && new Date(card.due) <= new Date();
  const metadata = entry.metadata;

  // Format ngày hẹn ôn kế tiếp (Asia/Ho_Chi_Minh)
  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return "Chưa lên lịch";
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFSRSStateLabel = (stateNum?: number) => {
    switch (stateNum) {
      case 0:
        return {
          text: "Mới học (New)",
          badge: "Mới học",
          color: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case 1:
        return {
          text: "Đang học (L1)",
          badge: "Đang học",
          color: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case 2:
        return {
          text: "Đang ôn (Review)",
          badge: "Đang ôn",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case 3:
        return {
          text: "Học lại (Relearning)",
          badge: "Học lại",
          color: "bg-rose-50 text-rose-700 border-rose-200",
        };
      default:
        return {
          text: "Thẻ mới",
          badge: "Thẻ mới",
          color: "bg-slate-100 text-slate-700 border-slate-200",
        };
    }
  };

  const stateInfo = getFSRSStateLabel(card?.state);

  // Phát âm kép (Dual-Engine: US Audio CDN + Web Speech API fallback)
  const handleSpeak = () => {
    playPronunciation(entry.word, entry.audio_url || entry.metadata?.audio_url);
  };

  const phoneticDisplay = resolvePhonetic(
    entry.word,
    entry.phonetic || metadata?.phonetic
  );
  const posInfo = getPosBadgeInfo(entry.part_of_speech, entry.meaning, entry.word);
  const topicDisplay = metadata?.topic || "TOEIC Essential Vocabulary";

  const isOldBoilerplate =
    metadata?.detailed_explanation?.includes("Thuật ngữ chuyên môn") ||
    metadata?.detailed_explanation?.includes(
      "thường xuyên xuất hiện trong các bài thi TOEIC"
    ) ||
    metadata?.detailed_explanation?.includes(
      "thường xuất hiện trong các bài thi TOEIC"
    );

  const detailedExplanation =
    metadata?.detailed_explanation && !isOldBoilerplate
      ? metadata.detailed_explanation
      : generateNaturalExplanation(entry.word, entry.meaning, posInfo.category);

  const wordFamily = metadata?.word_family || [];
  const synonyms = metadata?.synonyms || [];
  const antonyms = metadata?.antonyms || [];
  const collocations = metadata?.collocations || [];
  const toeicExample = metadata?.toeic_example || entry.context_sentence;
  const toeicExampleTrans =
    metadata?.toeic_example_translation || entry.context_translation;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vocab-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar Navigation */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <Bookmark className="w-3.5 h-3.5 text-blue-600" />
            <span>SỔ TỪ VỰNG</span>
            <span>/</span>
            <span className="font-semibold text-slate-800">{entry.word}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditClick(entry);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
              title="Chỉnh sửa nghĩa"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Chỉnh sửa</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onDeleteClick(entry.id);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Xóa từ khỏi sổ"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer ml-1"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-7 flex-1">
          {/* 1. Header Section: Từ tiếng Anh CHÍNH (To, nổi bật) + Phát âm + Nghĩa Tiếng Việt + Diễn giải */}
          <div className="space-y-3.5 border-b border-slate-100 pb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-2">
                {/* TỪ TIẾNG ANH CHÍNH: HIỆN TO RÕ RÀNG ĐỂ ÔN TẬP */}
                <div className="flex items-center gap-3 flex-wrap">
                  <h1
                    id="vocab-detail-title"
                    className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight"
                  >
                    {entry.word}
                  </h1>
                  <button
                    type="button"
                    onClick={handleSpeak}
                    className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                    title="Nghe phát âm chuẩn"
                    aria-label={`Nghe phát âm từ ${entry.word}`}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>

                  {/* Huy hiệu phân loại từ vựng: Danh · Động · Tính · Trạng */}
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border ${posInfo.badgeClass}`}
                  >
                    {posInfo.shortBadge}
                  </span>
                </div>

                {/* Phiên âm IPA chuẩn ngữ âm */}
                {phoneticDisplay && (
                  <div className="text-[14px] sm:text-[15px] font-ipa font-normal text-slate-600 tracking-wide select-all">
                    {phoneticDisplay}
                  </div>
                )}

                {/* Nghĩa tiếng Việt trọng tâm */}
                <div className="text-xl sm:text-2xl font-bold text-[#2563EB] tracking-tight pt-0.5">
                  {entry.meaning}
                </div>

                {/* Diễn giải ngữ nghĩa học thuật */}
                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed max-w-2xl pt-1">
                  {detailedExplanation}
                </p>
              </div>

              {/* FSRS Status Badge */}
              <div className="shrink-0">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${stateInfo.color}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {stateInfo.text}
                </span>
              </div>
            </div>

            {/* Chủ đề ngữ cảnh */}
            {topicDisplay && (
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200">
                  Chủ đề: {topicDisplay}
                </span>
              </div>
            )}
          </div>

          {/* 2. Main Grid: 2 cột (Cột trái 7/12: Nội dung ngôn ngữ | Cột phải 5/12: Trạng thái học FSRS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            {/* Cột trái: Lexical breakdown */}
            <div className="lg:col-span-7 space-y-6">
              {/* Từ cùng gốc (Word Family) */}
              {wordFamily.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Từ cùng gốc (Word Family)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {wordFamily.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-1"
                      >
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-200 text-slate-700">
                          {item.pos}
                        </span>
                        <div className="text-sm font-bold text-slate-900">
                          {item.word}
                        </div>
                        <div className="text-xs text-slate-600 line-clamp-1">
                          {item.meaning_vi}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Từ đồng nghĩa */}
              {synonyms.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                    Từ đồng nghĩa
                  </div>
                  <div className="text-sm text-slate-700 font-medium leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-200/80">
                    {synonyms.join(" · ")}
                  </div>
                </div>
              )}

              {/* Từ trái nghĩa */}
              {antonyms.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                    Từ trái nghĩa
                  </div>
                  <div className="text-sm text-slate-700 font-medium leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-200/80">
                    {antonyms.join(" · ")}
                  </div>
                </div>
              )}

              {/* Cụm từ cố định (Collocations) */}
              {collocations.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                    Cụm từ cố định (Collocations)
                  </div>
                  <div className="text-sm text-slate-700 font-medium leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-200/80">
                    {collocations.join(" · ")}
                  </div>
                </div>
              )}

              {/* Ví dụ trong đề thi */}
              {toeicExample && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Câu ví dụ trong đề thi</span>
                  </div>
                  <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 space-y-2">
                    <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                      &ldquo;{toeicExample}&rdquo;
                    </div>
                    {toeicExampleTrans && (
                      <div className="text-xs text-slate-600 italic leading-relaxed pt-1.5 border-t border-blue-100/70">
                        {toeicExampleTrans}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Ngữ cảnh trong bài thi (nếu khác với ví dụ TOEIC) */}
              {entry.context_sentence &&
                entry.context_sentence !== toeicExample && (
                  <div className="space-y-2">
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                      Ngữ cảnh bài tập đã làm
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5 text-xs">
                      <div className="text-slate-800 font-medium">
                        &ldquo;{entry.context_sentence}&rdquo;
                      </div>
                      {entry.context_translation && (
                        <div className="text-slate-500 italic">
                          Dịch: &ldquo;{entry.context_translation}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Cột phải: Thẻ FSRS Memory Profile */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-[#FDFBF7] space-y-5">
                <div className="flex items-center justify-between border-b border-amber-950/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-indigo-700" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
                      Chỉ số trí nhớ FSRS
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                    Spaced Repetition
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Chủ đề cá nhân */}
                  <div className="space-y-1">
                    <div className="text-slate-500 font-mono">Chủ đề cá nhân</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {topicDisplay}
                    </div>
                  </div>

                  {/* Trạng thái học */}
                  <div className="space-y-1">
                    <div className="text-slate-500 font-mono">Trạng thái học</div>
                    <div>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-xs font-mono font-semibold border ${stateInfo.color}`}
                      >
                        {stateInfo.badge}
                      </span>
                    </div>
                  </div>

                  {/* Số lượt ôn */}
                  <div className="space-y-1">
                    <div className="text-slate-500 font-mono">Số lượt ôn</div>
                    <div className="text-sm font-mono font-bold text-slate-900">
                      {card?.reps ?? 0} lần
                    </div>
                  </div>

                  {/* Lần ôn tiếp theo */}
                  <div className="space-y-1">
                    <div className="text-slate-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-600" />
                      <span>Lần ôn tiếp theo</span>
                    </div>
                    <div
                      className={`text-sm font-mono font-bold ${
                        isDue ? "text-rose-600" : "text-slate-900"
                      }`}
                    >
                      {isDue ? "Đến hạn ngay bây giờ" : formatDueDate(card?.due)}
                    </div>
                  </div>

                  {/* Độ ổn định & Độ khó */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-950/10">
                    <div className="space-y-0.5">
                      <div className="text-[11px] text-slate-500 font-mono">
                        Độ ổn định
                      </div>
                      <div className="text-xs font-mono font-bold text-indigo-700">
                        {card?.stability
                          ? `${Number(card.stability).toFixed(1)} ngày`
                          : "Chưa đo"}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[11px] text-slate-500 font-mono">
                        Độ khó FSRS
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-800">
                        {card?.difficulty
                          ? `${Number(card.difficulty).toFixed(1)} / 10`
                          : "Chưa đo"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gợi ý thuật toán */}
                <div className="p-3 rounded-xl bg-white/80 border border-slate-200/70 text-[11px] text-slate-600 leading-relaxed">
                  Lặp lại ngắt quãng (Spaced Repetition) với FSRS giúp bạn ghi
                  nhớ từ vựng lâu dài vào thời điểm não bộ chuẩn bị quên.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Single Primary Action */}
        <div className="px-5 sm:px-7 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 h-10 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer inline-flex items-center justify-center gap-1.5"
          >
            <span>Đã hiểu & Đóng</span>
          </button>
        </div>
      </div>
    </div>
  );
}
