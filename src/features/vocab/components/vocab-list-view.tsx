"use client";

import { useState, useTransition, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { VocabEntry, Notebook } from "@/features/vocab/types";
import {
  getPosBadgeInfo,
  getPosCategory,
  getDualPronunciation,
  type PosCategory,
} from "@/core/vocab";
import { resolvePhonetic } from "@/core/vocabDictionary";
import {
  updateVocabMeaningAction,
  deleteVocabAction,
  importCuratedDeckAction,
  type CuratedDeckStatus,
} from "@/features/vocab/actions";
import { VocabDetailModal } from "./vocab-detail-modal";
import { VocabCreateModal } from "./vocab-create-modal";
import { NotebookManagerModal } from "./notebook-manager-modal";
import { CuratedDecksModal } from "./curated-decks-modal";
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
  Plus,
  Folder,
  FolderPlus,
  Layers,
  ArrowRight,
  Loader2,
  Play,
  CheckCircle2,
} from "lucide-react";

interface VocabListViewProps {
  initialEntries: VocabEntry[];
  initialDueCount?: number;
  initialNotebooks?: Notebook[];
  initialCuratedDecks?: CuratedDeckStatus[];
}

export function VocabListView({
  initialEntries,
  initialNotebooks = [],
  initialCuratedDecks = [],
}: VocabListViewProps) {
  const router = useRouter();
  const [mainView, setMainView] = useState<"my_vocab" | "curated_decks">("my_vocab");
  const [entries, setEntries] = useState<VocabEntry[]>(initialEntries);
  const [notebooks, setNotebooks] = useState<Notebook[]>(initialNotebooks);
  const [curatedDecks] = useState<CuratedDeckStatus[]>(initialCuratedDecks);
  const [importingDeckId, setImportingDeckId] = useState<string | null>(null);
  const [isCuratedModalOpen, setIsCuratedModalOpen] = useState(false);
  const [selectedNotebookFilter, setSelectedNotebookFilter] = useState<string | null>(null);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNotebookManagerOpen, setIsNotebookManagerOpen] = useState(false);
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

  // Danh sách chủ điểm (Topics) có sẵn trong sổ từ
  const availableTopics = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) {
      const t = e.metadata?.topic?.trim();
      if (t) {
        map.set(t, (map.get(t) || 0) + 1);
      }
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [entries]);

  // Lọc theo search, tab, từ loại, sổ tự tạo và chủ điểm
  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      // 0. Lọc theo Sổ từ vựng tự tạo
      if (selectedNotebookFilter !== null) {
        if (item.notebook_id !== selectedNotebookFilter) {
          return false;
        }
      }

      // 0b. Lọc theo Chủ điểm chuyên đề
      if (selectedTopicFilter !== null) {
        if (item.metadata?.topic?.trim() !== selectedTopicFilter) {
          return false;
        }
      }

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
  }, [entries, filterTab, selectedPosFilter, selectedNotebookFilter, selectedTopicFilter, searchQuery, currentTime]);

  // Phân trang danh sách (Tránh quá tải DOM khi sổ có hàng trăm/nghìn từ vựng)
  const [pageSize, setPageSize] = useState(24);
  const [currentPage, setCurrentPage] = useState(1);
  const listTopRef = useRef<HTMLDivElement>(null);

  // Bộ điều hướng bộ lọc (Tự động quay về trang 1 khi đổi tiêu chí lọc)
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: "all" | "due") => {
    setFilterTab(tab);
    setCurrentPage(1);
  };

  const handleNotebookFilter = (id: string | null) => {
    setSelectedNotebookFilter(id);
    setCurrentPage(1);
  };

  const handleTopicFilter = (topic: string | null) => {
    setSelectedTopicFilter(topic);
    setCurrentPage(1);
  };

  const handlePosFilter = (pos: "all" | PosCategory) => {
    setSelectedPosFilter(pos);
    setCurrentPage(1);
  };

  // Tính toán số trang và danh sách từ vựng của trang hiện tại
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedEntries = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredEntries.slice(startIndex, startIndex + pageSize);
  }, [filteredEntries, safeCurrentPage, pageSize]);

  // Cuộn mượt lên đầu danh sách thẻ khi chuyển trang
  const scrollToCardsTop = () => {
    if (typeof window !== "undefined" && listTopRef.current) {
      listTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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

  // Xử lý Bắt đầu học trực tiếp một bộ thẻ chuẩn (Image 2 Parroto)
  const handleStartDeck = (deckStatus: CuratedDeckStatus) => {
    if (deckStatus.isImported && deckStatus.notebookId) {
      router.push(`/review?notebookId=${deckStatus.notebookId}`);
      return;
    }

    setImportingDeckId(deckStatus.deck.id);
    startTransition(async () => {
      const res = await importCuratedDeckAction(deckStatus.deck.id);
      setImportingDeckId(null);
      if (res.success && res.notebook?.id) {
        router.push(`/review?notebookId=${res.notebook.id}`);
      } else {
        alert(res.message);
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

        {/* Nhóm nút hành động ở Header */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Button
            variant="secondary"
            size="default"
            onClick={() => setIsCuratedModalOpen(true)}
            className="flex items-center gap-1.5 border-[#2563EB]/30 bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] transition-colors"
            title="Khám phá kho bộ thẻ từ vựng TOEIC có sẵn"
          >
            <Layers className="w-4 h-4 text-[#2563EB]" />
            <span>Kho Bộ Thẻ TOEIC</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#2563EB] text-white">
              4 bộ
            </span>
          </Button>

          <Button
            variant="secondary"
            size="default"
            onClick={() => setIsNotebookManagerOpen(true)}
            className="flex items-center gap-1.5"
            title="Quản lý và tạo sổ riêng"
          >
            <FolderPlus className="w-4 h-4 text-indigo-600" />
            <span>Quản lý sổ</span>
          </Button>

          <Button
            variant={dueCount > 0 ? "secondary" : "primary"}
            size="default"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5"
            title="Thêm từ mới vào sổ"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm từ mới</span>
          </Button>

          {dueCount > 0 && (
            <Link href="/review?limit=15">
              <Button variant="primary" size="default" className="shadow-sm">
                <Calendar className="w-4 h-4 mr-1.5" />
                Ôn 15 thẻ hôm nay →
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Banner nhắc ôn tập FSRS vi mô (Chia nhỏ thông minh, tránh quá tải) */}
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
                  ? "Mục tiêu hôm nay: Ôn tập 15–20 thẻ (FSRS Micro-learning)"
                  : "Không có thẻ nào đến hạn ôn tập"}
              </div>
              <div className="text-xs text-[#475569]">
                {dueCount > 0
                  ? `Bạn có ${dueCount} thẻ trong lịch. Thuật toán FSRS khuyến nghị chia nhỏ thành từng phiên 15 thẻ hoặc chọn theo từng Chủ đề (~50 thẻ) để học sâu và bền vững, không dồn dập!`
                  : "Tuyệt vời! Bạn đã hoàn thành tất cả các thẻ đến hạn hiện tại."}
              </div>
            </div>
          </div>

          {dueCount > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/review?limit=15"
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Bắt đầu phiên 15 thẻ →
              </Link>
              <Link
                href="/review"
                className="text-xs font-semibold underline text-[#4338CA] hover:text-[#312E81] shrink-0"
              >
                Học theo Chủ đề →
              </Link>
            </div>
          )}
        </div>
      </Card>

      {/* 2b. Chuyển đổi giữa Sổ từ cá nhân & Kho Bộ Thẻ Chuẩn (Parroto Image 2) */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          type="button"
          onClick={() => setMainView("my_vocab")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            mainView === "my_vocab"
              ? "bg-[#0F172A] text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Sổ từ của tôi ({entries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMainView("curated_decks")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            mainView === "curated_decks"
              ? "bg-[#2563EB] text-white shadow-sm"
              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
          }`}
        >
          <Layers className="w-4 h-4 text-[#2563EB]" />
          <span>Kho Bộ Thẻ TOEIC Chuẩn</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white">
            4 bộ
          </span>
        </button>
      </div>

      {mainView === "curated_decks" ? (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Tag Pills phía trên (Image 2 Parroto) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {[
              "Tất cả",
              "#toeic",
              "#ets",
              "#oxford",
              "#it-english",
              "#idioms",
              "#part5",
              "#essential",
              "#b1",
              "#b2",
              "#c1",
              "#communication",
            ].map((tag, idx) => (
              <span
                key={tag}
                className={`px-3 py-1 rounded-full text-xs font-mono font-medium cursor-pointer transition-colors shrink-0 ${
                  idx === 0
                    ? "bg-[#0F172A] text-white shadow-xs font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* NHÓM 1: TỪ VỰNG TIẾNG ANH THÔNG DỤNG & TOEIC CỐT LÕI */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                <span>Từ Vựng Tiếng Anh Thông Dụng & TOEIC</span>
                <span className="text-xs font-mono font-semibold text-slate-500">
                  (3 bộ thẻ)
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {curatedDecks
                .filter((d) => d.deck.id !== "it-vocab")
                .map((deckStatus) => {
                  const { deck, isImported } = deckStatus;
                  const isImporting = importingDeckId === deck.id;

                  return (
                    <Card
                      key={deck.id}
                      className="overflow-hidden border border-[#E2E8F0] bg-white rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      {/* Bìa bộ thẻ */}
                      <div
                        className="p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[140px]"
                        style={{ backgroundColor: deck.color || "#2563EB" }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-xs text-white uppercase tracking-wider">
                            {deck.badge}
                          </span>
                          {isImported && (
                            <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Đã nạp</span>
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-bold tracking-tight text-white line-clamp-1">
                            {deck.title}
                          </h3>
                          <div className="text-xs text-white/80 font-mono mt-0.5">
                            📚 {deck.totalCards} thẻ · 👥 {deck.items.length * 12 + 1042} học viên
                          </div>
                        </div>
                      </div>

                      {/* Thông tin & Nút Bắt Đầu Học */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <p className="text-xs text-[#475569] leading-relaxed line-clamp-2">
                          {deck.description}
                        </p>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold">
                            ✨ Chia nhỏ ~50 từ / chủ đề
                          </span>

                          <button
                            type="button"
                            disabled={isImporting}
                            onClick={() => handleStartDeck(deckStatus)}
                            className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            {isImporting ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Đang nạp...</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-white" />
                                <span>BẮT ĐẦU HỌC</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div>

          {/* NHÓM 2: TỪ VỰNG TIẾNG ANH CHUYÊN NGÀNH */}
          <div className="space-y-4 pt-4 border-t border-slate-200/80">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                <span>Từ Vựng Tiếng Anh Chuyên Ngành</span>
                <span className="text-xs font-mono font-semibold text-slate-500">
                  (1 bộ thẻ)
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {curatedDecks
                .filter((d) => d.deck.id === "it-vocab")
                .map((deckStatus) => {
                  const { deck, isImported } = deckStatus;
                  const isImporting = importingDeckId === deck.id;

                  return (
                    <Card
                      key={deck.id}
                      className="overflow-hidden border border-[#E2E8F0] bg-white rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      {/* Bìa bộ thẻ */}
                      <div
                        className="p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[140px]"
                        style={{ backgroundColor: deck.color || "#4338CA" }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-xs text-white uppercase tracking-wider">
                            {deck.badge}
                          </span>
                          {isImported && (
                            <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Đã nạp ({deck.totalCards} thẻ)</span>
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-bold tracking-tight text-white line-clamp-1">
                            {deck.title}
                          </h3>
                          <div className="text-xs text-white/80 font-mono mt-0.5">
                            📚 {deck.totalCards} thẻ · 👥 89,412 học viên
                          </div>
                        </div>
                      </div>

                      {/* Thông tin & Nút Bắt Đầu Học */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <p className="text-xs text-[#475569] leading-relaxed line-clamp-2">
                          {deck.description}
                        </p>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-semibold">
                            ✨ Chia thành 50+ chuyên đề AI, Web, DevOps
                          </span>

                          <button
                            type="button"
                            disabled={isImporting}
                            onClick={() => handleStartDeck(deckStatus)}
                            className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            {isImporting ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Đang nạp...</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-white" />
                                <span>BẮT ĐẦU HỌC</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* 3. Thanh tìm kiếm & Tabs lọc */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8190A6]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm theo từ tiếng Anh, từ loại hoặc nghĩa..."
            className="w-full h-11 pl-10 pr-9 rounded-lg border border-[#8190A6] text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
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
            onClick={() => handleTabChange("all")}
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
            onClick={() => handleTabChange("due")}
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

      {/* 3a. Bộ lọc Sổ từ vựng tự tạo (Notebooks) */}
      {notebooks.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0 flex items-center gap-1">
            <Folder className="w-3.5 h-3.5 text-indigo-500" />
            <span>Sổ:</span>
          </span>
          <button
            type="button"
            onClick={() => handleNotebookFilter(null)}
            className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              selectedNotebookFilter === null
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tất cả ({entries.length})
          </button>
          {notebooks.map((nb) => {
            const isSelected = selectedNotebookFilter === nb.id;
            return (
              <button
                key={nb.id}
                type="button"
                onClick={() => handleNotebookFilter(nb.id)}
                className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: nb.color }}
                />
                <span>{nb.name}</span>
                <span className="text-[10px] opacity-70">({nb.word_count ?? 0})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3b. Bộ lọc Chủ điểm chuyên đề (Topics - Chia nhỏ 50 chủ đề TOEIC) */}
      {availableTopics.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Chủ điểm:</span>
          </span>
          <button
            type="button"
            onClick={() => handleTopicFilter(null)}
            className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              selectedTopicFilter === null
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tất cả chủ điểm ({availableTopics.length})
          </button>
          {availableTopics.map((top) => {
            const isSelected = selectedTopicFilter === top.name;
            return (
              <button
                key={top.name}
                type="button"
                onClick={() => handleTopicFilter(top.name)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs font-bold"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>{top.name}</span>
                <span className={`text-[10px] font-mono ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                  ({top.count})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Banner hành động khi đang lọc theo 1 chủ điểm cụ thể */}
      {selectedTopicFilter && (
        <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-semibold text-blue-950">
              Đang chọn chủ điểm: <strong>{selectedTopicFilter}</strong> ({filteredEntries.length} từ)
            </span>
          </div>
          <Link
            href={`/review?topic=${encodeURIComponent(selectedTopicFilter)}&limit=15`}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <span>Ôn chủ điểm này ({filteredEntries.length} từ)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 3b. Bộ lọc phân loại từ vựng: Danh từ · Động từ · Tính từ · Trạng từ · Cụm từ */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
          Từ loại:
        </span>
        <button
          type="button"
          onClick={() => handlePosFilter("all")}
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
          onClick={() => handlePosFilter("noun")}
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
          onClick={() => handlePosFilter("verb")}
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
          onClick={() => handlePosFilter("adjective")}
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
          onClick={() => handlePosFilter("adverb")}
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
          onClick={() => handlePosFilter("phrase")}
          className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
            selectedPosFilter === "phrase"
              ? "bg-slate-700 text-white border-slate-700 shadow-xs"
              : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
          }`}
        >
          Cụm từ ({posCounts.phrase})
        </button>
      </div>

      {/* Neo cuộn trang mượt */}
      <div ref={listTopRef} className="-mt-2 scroll-mt-6" />

      {/* 4. Danh sách thẻ từ vựng chuẩn mực (Hiển thị phân trang tối ưu DOM) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {paginatedEntries.map((item) => {
          const isEditing = editingId === item.id;
          const isDeleting = confirmDeleteId === item.id;
          const isDue =
            item.card?.due && new Date(item.card.due).getTime() <= currentTime;
          const posInfo = getPosBadgeInfo(item.part_of_speech, item.meaning, item.word);
          const dual = getDualPronunciation(item.word);
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

                      {dual ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <AudioSpeakerButton word={item.word} posHint="noun" label="n" size="sm" />
                          <span className="text-[12px] font-ipa text-slate-500">{dual.nounIpa}</span>
                          <AudioSpeakerButton word={item.word} posHint="verb" label="v" size="sm" />
                          <span className="text-[12px] font-ipa text-slate-500">{dual.verbIpa}</span>
                        </div>
                      ) : (
                        <>
                          <AudioSpeakerButton word={item.word} size="sm" />
                          {phonetic && (
                            <span className="text-[13px] font-ipa font-normal text-slate-500 tracking-wide select-all">
                              {phonetic}
                            </span>
                          )}
                        </>
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

      {/* 5. Điều hướng Phân trang (Pagination) - Tối ưu hiệu năng 60 FPS */}
      {filteredEntries.length > 0 && (
        <nav
          role="navigation"
          aria-label="Phân trang danh sách từ vựng"
          className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
        >
          {/* Thống kê phạm vi từ hiển thị */}
          <div className="text-[#475569] font-medium text-center sm:text-left">
            Hiển thị{" "}
            <span className="font-bold font-mono text-[#0F172A]">
              {(safeCurrentPage - 1) * pageSize + 1}–
              {Math.min(safeCurrentPage * pageSize, filteredEntries.length)}
            </span>{" "}
            trên tổng số{" "}
            <span className="font-bold font-mono text-[#0F172A]">
              {filteredEntries.length}
            </span>{" "}
            từ vựng
          </div>

          {/* Cụm nút điều hướng trang */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1 flex-wrap justify-center">
              <button
                type="button"
                disabled={safeCurrentPage === 1}
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  scrollToCardsTop();
                }}
                className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-xs"
                aria-label="Trang trước"
              >
                ← Trước
              </button>

              {getPageNumbers(safeCurrentPage, totalPages).map((pageNum, idx) => {
                if (pageNum === "...") {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1.5 py-1 text-slate-400 select-none font-mono"
                    >
                      …
                    </span>
                  );
                }
                const isCurrent = pageNum === safeCurrentPage;
                return (
                  <button
                    key={`page-${pageNum}`}
                    type="button"
                    onClick={() => {
                      setCurrentPage(pageNum as number);
                      scrollToCardsTop();
                    }}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`min-w-8 h-8 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shadow-xs ${
                      isCurrent
                        ? "bg-[#2563EB] text-white shadow-sm"
                        : "bg-white text-slate-700 border border-[#E2E8F0] hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={safeCurrentPage === totalPages}
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  scrollToCardsTop();
                }}
                className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-xs"
                aria-label="Trang sau"
              >
                Sau →
              </button>
            </div>
          )}

          {/* Chọn số từ hiển thị mỗi trang */}
          <div className="flex items-center gap-1.5 text-[#475569]">
            <span className="text-[11px]">Trang:</span>
            {[24, 48, 96].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                className={`px-2 py-0.5 rounded font-mono text-[11px] font-semibold transition-all cursor-pointer ${
                  pageSize === size
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </nav>
      )}

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
              handleSearchChange("");
              handleTabChange("all");
              handleNotebookFilter(null);
              handleTopicFilter(null);
              handlePosFilter("all");
            }}
            className="text-xs font-semibold text-[#2563EB] underline cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
      </>
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

      {/* Modal Thêm từ vựng mới trực tiếp */}
      <VocabCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        notebooks={notebooks}
        selectedNotebookId={selectedNotebookFilter}
        onVocabCreated={(newEntry) => {
          setEntries((prev) => [newEntry, ...prev]);
          if (newEntry.notebook_id) {
            setNotebooks((prev) =>
              prev.map((nb) =>
                nb.id === newEntry.notebook_id
                  ? { ...nb, word_count: (nb.word_count ?? 0) + 1 }
                  : nb
              )
            );
          }
        }}
      />

      {/* Modal Quản lý & Tạo sổ từ vựng mới */}
      <NotebookManagerModal
        isOpen={isNotebookManagerOpen}
        onClose={() => setIsNotebookManagerOpen(false)}
        notebooks={notebooks}
        onNotebooksChanged={(updated) => setNotebooks(updated)}
      />

      {/* Modal Kho Bộ Thẻ Từ Vựng Chuẩn (Curated Decks) */}
      <CuratedDecksModal
        isOpen={isCuratedModalOpen}
        onClose={() => setIsCuratedModalOpen(false)}
        decks={curatedDecks}
        onSelectNotebookFilter={(nbId) => {
          handleNotebookFilter(nbId);
        }}
        onImportSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}

/**
 * Thuật toán sinh danh sách số trang hiển thị thông minh kèm dấu lược (...)
 */
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}
