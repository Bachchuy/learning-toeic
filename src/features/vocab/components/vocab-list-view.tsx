"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import type { VocabEntry } from "@/features/vocab/types";
import { getPosBadgeInfo, getPosCategory, type PosCategory } from "@/core/vocab";
import { resolvePhonetic } from "@/core/vocabDictionary";
import {
  updateVocabMeaningAction,
  deleteVocabAction,
} from "@/features/vocab/actions";
import { VocabDetailModal } from "./vocab-detail-modal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioSpeakerButton } from "@/components/ui/audio-speaker-button";
import {
  Search,
  BookOpen,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  Check,
  X,
  ExternalLink,
} from "lucide-react";

interface VocabListViewProps {
  initialEntries: VocabEntry[];
  initialDueCount?: number;
}

export function VocabListView({ initialEntries }: VocabListViewProps) {
  const [entries, setEntries] = useState<VocabEntry[]>(initialEntries);
  const [filterTab, setFilterTab] = useState<"all" | "due">("all");
  const [selectedPosFilter, setSelectedPosFilter] = useState<"all" | PosCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMeaning, setEditMeaning] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedDetailEntry, setSelectedDetailEntry] = useState<VocabEntry | null>(null);
  const [currentTime] = useState(() => Date.now());
  const [isPending, startTransition] = useTransition();

  // Đếm số lượng thẻ đến hạn thực tế
  const dueCount = useMemo(() => {
    return entries.filter(
      (e) => e.card?.due && new Date(e.card.due).getTime() <= currentTime
    ).length;
  }, [entries, currentTime]);

  // Đếm số lượng theo từng loại từ: Danh · Động · Tính · Trạng · Cụm từ (Hỗ trợ từ loại kép)
  const posCounts = useMemo(() => {
    const counts = { noun: 0, verb: 0, adjective: 0, adverb: 0, phrase: 0 };
    for (const item of entries) {
      const cat = getPosCategory(item.part_of_speech, item.meaning, item.word);
      if (cat === "noun_verb") {
        counts.noun++;
        counts.verb++;
      } else if (cat === "noun_adj") {
        counts.noun++;
        counts.adjective++;
      } else if (cat === "adj_adv") {
        counts.adjective++;
        counts.adverb++;
      } else if (cat in counts) {
        counts[cat as keyof typeof counts]++;
      }
    }
    return counts;
  }, [entries]);

  // Lọc theo search, tab và từ loại
  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      // 1. Lọc theo tab Đến hạn / Tất cả
      if (filterTab === "due") {
        if (!item.card?.due || new Date(item.card.due).getTime() > currentTime) {
          return false;
        }
      }

      // 2. Lọc theo phân loại từ loại: danh, động, tính, trạng, cụm từ (bao gồm từ loại kép)
      if (selectedPosFilter !== "all") {
        const itemCategory = getPosCategory(item.part_of_speech, item.meaning, item.word);
        if (selectedPosFilter === "noun") {
          if (
            itemCategory !== "noun" &&
            itemCategory !== "noun_verb" &&
            itemCategory !== "noun_adj"
          ) {
            return false;
          }
        } else if (selectedPosFilter === "verb") {
          if (itemCategory !== "verb" && itemCategory !== "noun_verb") {
            return false;
          }
        } else if (selectedPosFilter === "adjective") {
          if (
            itemCategory !== "adjective" &&
            itemCategory !== "noun_adj" &&
            itemCategory !== "adj_adv"
          ) {
            return false;
          }
        } else if (selectedPosFilter === "adverb") {
          if (itemCategory !== "adverb" && itemCategory !== "adj_adv") {
            return false;
          }
        } else if (itemCategory !== selectedPosFilter) {
          return false;
        }
      }

      // 3. Lọc theo từ khóa tìm kiếm
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchWord = item.word.toLowerCase().includes(q);
        const matchMeaning = item.meaning.toLowerCase().includes(q);
        const matchContext = item.context_sentence.toLowerCase().includes(q);
        const matchPOS = (item.part_of_speech || "").toLowerCase().includes(q);
        return matchWord || matchMeaning || matchContext || matchPOS;
      }

      return true;
    });
  }, [entries, filterTab, selectedPosFilter, searchQuery, currentTime]);

  // Xử lý lưu chỉnh sửa nghĩa tại chỗ
  const handleSaveMeaning = (vocabId: string) => {
    if (!editMeaning.trim()) return;

    startTransition(async () => {
      const res = await updateVocabMeaningAction(vocabId, editMeaning);
      if (res.success) {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === vocabId ? { ...e, meaning: editMeaning.trim() } : e
          )
        );
        setEditingId(null);
      }
    });
  };

  // Xử lý xóa từ vựng
  const handleDelete = (vocabId: string) => {
    startTransition(async () => {
      const res = await deleteVocabAction(vocabId);
      if (res.success) {
        setEntries((prev) => prev.filter((e) => e.id !== vocabId));
        setConfirmDeleteId(null);
        if (selectedDetailEntry?.id === vocabId) {
          setSelectedDetailEntry(null);
        }
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-2 pb-16 animate-in fade-in duration-200">
      {/* 1. Tiêu đề & Thống kê */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono font-bold uppercase tracking-[0.08em] text-[#475569] mb-1">
            Ghi nhớ ngắt quãng FSRS
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
            Sổ từ vựng cá nhân
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            Tổng cộng {entries.length} từ vựng đã được lưu từ các phiên luyện Part 5.
          </p>
        </div>

        {/* Nút sang ôn tập */}
        {dueCount > 0 && (
          <Link href="/review" className="shrink-0">
            <Button variant="primary" size="cta" className="shadow-sm">
              <Calendar className="w-4 h-4 mr-2" />
              Ôn {dueCount} thẻ đến hạn ngay →
            </Button>
          </Link>
        )}
      </div>

      {/* 2. Banner nhắc ôn tập FSRS (§5.6 M6) */}
      <Card
        className={`p-4 sm:p-5 border transition-all ${
          dueCount > 0
            ? "bg-[#EEF2FF] border-[#C7D2FE] text-[#4338CA]"
            : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`p-2 rounded-lg ${
                dueCount > 0
                  ? "bg-[#E0E7FF] text-[#4338CA]"
                  : "bg-[#F1F5F9] text-[#64748B]"
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <div className="text-sm font-bold text-[#0F172A]">
                {dueCount > 0
                  ? `Có ${dueCount} thẻ từ vựng cần ôn tập hôm nay`
                  : "Không có thẻ nào đến hạn ôn tập"}
              </div>
              <div className="text-xs text-[#475569]">
                {dueCount > 0
                  ? "Ôn tập đều đặn giúp củng cố trí nhớ dài hạn theo thuật toán FSRS."
                  : "Tuyệt vời! Bạn đã hoàn thành tất cả các thẻ đến hạn hiện tại."}
              </div>
            </div>
          </div>

          {dueCount > 0 && (
            <Link
              href="/review"
              className="text-xs font-semibold underline text-[#4338CA] hover:text-[#312E81] shrink-0"
            >
              Bắt đầu ôn tập →
            </Link>
          )}
        </div>
      </Card>

      {/* 3. Thanh tìm kiếm & Tabs lọc */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8190A6]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo từ tiếng Anh, từ loại hoặc nghĩa..."
            className="w-full h-11 pl-10 pr-9 rounded-lg border border-[#8190A6] text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8190A6] hover:text-[#0F172A] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Segmented Filter Tabs (§5.6 M6) */}
        <div className="inline-flex rounded-lg border border-[#8190A6] p-0.5 bg-[#F8FAFC] self-start sm:self-auto h-11 items-center">
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={`px-4 h-9.5 text-xs font-semibold rounded-md transition-all cursor-pointer font-mono ${
              filterTab === "all"
                ? "bg-white text-[#0F172A] shadow-xs"
                : "text-[#475569] hover:text-[#0F172A]"
            }`}
          >
            Tất cả ({entries.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("due")}
            className={`px-4 h-9.5 text-xs font-semibold rounded-md transition-all cursor-pointer font-mono ${
              filterTab === "due"
                ? "bg-[#EEF2FF] text-[#4338CA] shadow-xs"
                : "text-[#475569] hover:text-[#4338CA]"
            }`}
          >
            Đến hạn ({dueCount})
          </button>
        </div>
      </div>

      {/* 3b. Bộ lọc phân loại từ vựng: Danh từ · Động từ · Tính từ · Trạng từ · Cụm từ */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
          Từ loại:
        </span>
        <button
          type="button"
          onClick={() => setSelectedPosFilter("all")}
          className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            selectedPosFilter === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Tất cả ({entries.length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedPosFilter("noun")}
          className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
            selectedPosFilter === "noun"
              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
              : "bg-blue-50/70 text-blue-700 border-blue-200/80 hover:bg-blue-100"
          }`}
        >
          Danh từ ({posCounts.noun})
        </button>
        <button
          type="button"
          onClick={() => setSelectedPosFilter("verb")}
          className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
            selectedPosFilter === "verb"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
              : "bg-emerald-50/70 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100"
          }`}
        >
          Động từ ({posCounts.verb})
        </button>
        <button
          type="button"
          onClick={() => setSelectedPosFilter("adjective")}
          className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
            selectedPosFilter === "adjective"
              ? "bg-amber-600 text-white border-amber-600 shadow-xs"
              : "bg-amber-50/70 text-amber-800 border-amber-200/80 hover:bg-amber-100"
          }`}
        >
          Tính từ ({posCounts.adjective})
        </button>
        <button
          type="button"
          onClick={() => setSelectedPosFilter("adverb")}
          className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
            selectedPosFilter === "adverb"
              ? "bg-purple-600 text-white border-purple-600 shadow-xs"
              : "bg-purple-50/70 text-purple-700 border-purple-200/80 hover:bg-purple-100"
          }`}
        >
          Trạng từ ({posCounts.adverb})
        </button>
        <button
          type="button"
          onClick={() => setSelectedPosFilter("phrase")}
          className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
            selectedPosFilter === "phrase"
              ? "bg-slate-700 text-white border-slate-700 shadow-xs"
              : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
          }`}
        >
          Cụm từ ({posCounts.phrase})
        </button>
      </div>

      {/* 4. Danh sách thẻ từ vựng chuẩn mực (Bấm vào xem chi tiết) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredEntries.map((item) => {
          const isEditing = editingId === item.id;
          const isDeleting = confirmDeleteId === item.id;
          const isDue =
            item.card?.due && new Date(item.card.due).getTime() <= currentTime;
          const posInfo = getPosBadgeInfo(item.part_of_speech, item.meaning, item.word);
          const phonetic = resolvePhonetic(
            item.word,
            item.phonetic || item.metadata?.phonetic
          );

          return (
            <Card
              key={item.id}
              className="p-5 bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-3.5 hover:border-[#2563EB]/40 hover:shadow-sm transition-all"
            >
              <div className="space-y-2.5">
                {/* Header thẻ: Từ vựng + Từ loại + Trạng thái FSRS */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setSelectedDetailEntry(item)}
                        className="text-lg sm:text-[19px] font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors cursor-pointer tracking-tight text-left"
                      >
                        {item.word}
                      </button>

                      <AudioSpeakerButton word={item.word} size="sm" />

                      {/* Phiên âm IPA chuẩn quốc tế cho từ đơn và cụm từ */}
                      {phonetic && (
                        <span className="text-[13px] font-ipa font-normal text-slate-500 tracking-wide select-all">
                          {phonetic}
                        </span>
                      )}

                      {/* Huy hiệu phân loại từ loại chuẩn: Danh · Động · Tính · Trạng */}
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider border ${posInfo.badgeClass}`}
                      >
                        {posInfo.shortBadge}
                      </span>

                      {/* Huy hiệu Đến hạn ôn */}
                      {isDue && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE]">
                          Đến hạn ôn
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nút hành động */}
                  {!isEditing && !isDeleting && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedDetailEntry(item)}
                        className="p-1.5 rounded-md text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                        title="Xem chi tiết thẻ từ"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(item.id);
                          setEditMeaning(item.meaning);
                          setConfirmDeleteId(null);
                        }}
                        className="p-1.5 rounded-md text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                        title="Sửa nghĩa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="p-1.5 rounded-md text-[#64748B] hover:text-[#BE123C] hover:bg-[#FFF1F2] transition-colors cursor-pointer"
                        title="Xóa từ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Nghĩa tiếng Việt: Có thể sửa tại chỗ (Inline Edit) */}
                {isEditing ? (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={editMeaning}
                      onChange={(e) => setEditMeaning(e.target.value)}
                      className="flex-1 h-9 px-2.5 rounded-md border border-[#2563EB] text-sm text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      autoFocus
                    />
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleSaveMeaning(item.id)}
                      className="p-2 rounded-md bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors cursor-pointer"
                      title="Lưu nghĩa"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-2 rounded-md bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] transition-colors cursor-pointer"
                      title="Hủy"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setSelectedDetailEntry(item)}
                    className="text-[15px] font-semibold text-[#1E40AF] cursor-pointer hover:underline"
                  >
                    {item.meaning}
                  </div>
                )}

                {/* Câu ngữ cảnh hoàn chỉnh (Không có vết đục lỗ ____) */}
                {item.context_sentence && (
                  <div
                    onClick={() => setSelectedDetailEntry(item)}
                    className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer space-y-1.5 hover:bg-[#F1F5F9] transition-colors"
                  >
                    <div className="text-xs text-[#0F172A] font-medium leading-relaxed line-clamp-2">
                      &ldquo;{item.context_sentence}&rdquo;
                    </div>
                    {item.context_translation && (
                      <div className="text-[11px] text-[#64748B] italic line-clamp-1 border-t border-[#E2E8F0]/60 pt-1">
                        Dịch: &ldquo;{item.context_translation}&rdquo;
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Hộp xác nhận xóa */}
              {isDeleting && (
                <div className="p-2.5 rounded-md bg-[#FFF1F2] border border-[#FECDD3] flex items-center justify-between gap-2 text-xs text-[#BE123C] animate-in fade-in duration-150">
                  <span className="font-medium">Xác nhận xóa từ này?</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(item.id)}
                      className="px-2 py-1 rounded bg-[#BE123C] text-white hover:bg-[#9F1239] font-semibold cursor-pointer"
                    >
                      Xóa
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2 py-1 rounded bg-white text-[#475569] border border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* 5. Trạng thái rỗng & không tìm thấy kết quả (§5.6 M6) */}
      {entries.length === 0 && (
        <Card className="p-8 sm:p-12 text-center bg-white border border-[#E2E8F0] space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-[#0F172A]">
              Bạn chưa có từ vựng nào trong sổ
            </h3>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Mỗi khi gặp từ mới trong lúc giải đề, hãy bấm nút Lưu từ. Hệ thống sẽ tự động xếp lịch ôn ngắt quãng giúp bạn ghi nhớ tự nhiên và lâu dài.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/practice/new">
              <Button variant="primary" size="default">
                Bắt đầu làm bài luyện tập →
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {entries.length > 0 && filteredEntries.length === 0 && (
        <div className="p-8 text-center bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-sm text-[#475569] space-y-2">
          <div>Không tìm thấy từ vựng nào khớp với từ khóa &ldquo;{searchQuery}&rdquo;.</div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setFilterTab("all");
            }}
            className="text-xs font-semibold text-[#2563EB] underline cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Modal Xem chi tiết từ vựng FSRS */}
      <VocabDetailModal
        entry={selectedDetailEntry}
        isOpen={!!selectedDetailEntry}
        onClose={() => setSelectedDetailEntry(null)}
        onEditClick={(entry) => {
          setEditingId(entry.id);
          setEditMeaning(entry.meaning);
        }}
        onDeleteClick={(id) => setConfirmDeleteId(id)}
      />
    </div>
  );
}
