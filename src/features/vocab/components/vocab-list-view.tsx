"use client";

import { useState, useTransition, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { VocabEntry, Notebook } from "@/features/vocab/types";
import {
  getPosBadgeInfo,
  getPosCategory,
  resolveDualDetails,
  type PosCategory,
} from "@/core/vocab";
import { resolvePhonetic } from "@/core/phonetic";
import {
  updateVocabMeaningAction,
  deleteVocabAction,
  importCuratedDeckAction,
  type CuratedDeckStatus,
} from "@/features/vocab/actions";
import { VocabDetailModal } from "./vocab-detail-modal";
import { VocabCreateModal } from "./vocab-create-modal";
import { NotebookManagerModal } from "./notebook-manager-modal";
import { VocabCuratedDecksTab } from "./vocab-curated-decks-tab";
import { VocabTopicsGrid } from "./vocab-topics-grid";
import {
  getPageNumbers,
  getTopicVisuals,
  type TopicVisual,
} from "../lib/topic-visuals";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { AudioSpeakerButton } from "@/components/ui/audio-speaker-button";
import {
  Search,
  BookOpen,
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
  ArrowLeft,
  Target,
  CheckCircle2,
  Flame,
  Library,
  LayoutGrid,
  BookOpenText,
  Code2,
  Eye,
  EyeOff,
  TextQuote,
  Quote,
  Loader2,
  Sparkles,
} from "lucide-react";

export { getTopicVisuals, type TopicVisual };

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
  // State quản lý tab nội tuyến (Inline Tab View)
  const [activeMainTab, setActiveMainTab] = useState<"my-vocab" | "standard-decks">("my-vocab");
  // TASK 1: State quản lý điều hướng 3 Tầng: Sổ (books) -> Các Chủ điểm của Sổ (topics) -> Danh sách từ vựng (words)
  const [navigationStep, setNavigationStep] = useState<"books" | "topics" | "words">("books");
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  // TASK 2: Toggle Opt-in Tiếng Anh IT & Công nghệ: Mặc định false, lưu localStorage
  const [includeItVocab, setIncludeItVocab] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("include_it_vocab_in_fsrs") === "true";
      } catch {
        return false;
      }
    }
    return false;
  });

  const handleToggleIncludeIt = (val: boolean) => {
    setIncludeItVocab(val);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("include_it_vocab_in_fsrs", String(val));
      } catch {
        // ignore
      }
    }
  };

  const [entries, setEntries] = useState<VocabEntry[]>(initialEntries);
  const [notebooks, setNotebooks] = useState<Notebook[]>(initialNotebooks);
  const [curatedDecks, setCuratedDecks] = useState<CuratedDeckStatus[]>(initialCuratedDecks);
  const [importingDeckId, setImportingDeckId] = useState<string | null>(null);
  const [deckImportError, setDeckImportError] = useState<string | null>(null);

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

  // Hai công tắc tiện ích học tập trong danh sách từ
  // Công tắc 1: Che nghĩa tiếng Việt để tự nhớ (Flashcard mode trên danh sách)
  const [hideMeanings, setHideMeanings] = useState(false);
  // Công tắc 2: Hiện / ẩn câu ví dụ ngữ cảnh
  const [showExamples, setShowExamples] = useState(true);
  // Tập hợp các ID thẻ từ đã được bấm mở nghĩa khi đang ở chế độ Che nghĩa
  const [revealedCardIds, setRevealedCardIds] = useState<Set<string>>(() => new Set<string>());

  // Bản đồ bộ thẻ chuẩn theo ID (nhận metadata gọn nhẹ từ server, không bundle 2MB JSON xuống client)
  const deckStatusById = useMemo(
    () => new Map(curatedDecks.map((d) => [d.deck.id, d])),
    [curatedDecks]
  );

  // Xác định bộ thẻ IT và các topic IT
  const itDeckStatus = deckStatusById.get("it-vocab");
  const itNotebookId = itDeckStatus?.notebookId;
  const itTopicsSet = useMemo(
    () => new Set(itDeckStatus?.deck.topics || []),
    [itDeckStatus]
  );

  const isItEntry = useCallback(
    (e: VocabEntry) => {
      if (itNotebookId && e.notebook_id === itNotebookId) return true;
      if (e.metadata?.topic && itTopicsSet.has(e.metadata.topic.trim())) return true;
      return false;
    },
    [itNotebookId, itTopicsSet]
  );

  // Từ vựng được tính trong FSRS Micro-learning (Tự động loại bỏ 775 từ IT nếu chưa opt-in)
  const fsrsActiveEntries = useMemo(() => {
    if (includeItVocab) return entries;
    return entries.filter((e) => !isItEntry(e));
  }, [entries, includeItVocab, isItEntry]);

  // Đếm số lượng thẻ đến hạn thực tế (theo FSRS active entries)
  const dueCount = useMemo(() => {
    return fsrsActiveEntries.filter(
      (e) => e.card?.due && new Date(e.card.due).getTime() <= currentTime
    ).length;
  }, [fsrsActiveEntries, currentTime]);

  // Tổng số thẻ trong toàn bộ kho thẻ chuẩn
  const totalCuratedCards = useMemo(() => {
    return curatedDecks.reduce((sum, d) => sum + d.deck.totalCards, 0);
  }, [curatedDecks]);

  // 1. Nhóm 3 Sổ TOEIC Cốt Lõi (ETS, 600 Essential, Idioms)
  const coreBooks = useMemo(() => {
    const ids = ["ets-vocab", "essential-600", "common-idioms"];
    return ids
      .map((id) => {
        const status = deckStatusById.get(id);
        if (!status) return null;
        const meta = status.deck;
        const topics = meta.topics || [];

        const deckEntries = entries.filter((e) => {
          if (status.notebookId && e.notebook_id === status.notebookId) return true;
          if (e.metadata?.topic && topics.includes(e.metadata.topic.trim())) return true;
          return false;
        });

        const wordsCount =
          deckEntries.length > 0 ? deckEntries.length : status.userCardsCount || meta.totalCards;
        const importedCount = deckEntries.length > 0 ? deckEntries.length : status.userCardsCount || 0;
        const reviewedCount = deckEntries.filter(
          (e) => (e.card?.reps ?? 0) > 0 || (e.card?.state ?? 0) > 0
        ).length;
        const deckDue = deckEntries.filter(
          (e) => e.card?.due && new Date(e.card.due).getTime() <= currentTime
        ).length;
        const isImported = !!status.isImported || importedCount > 0;

        return {
          id,
          title: meta.title,
          englishTitle: meta.englishTitle,
          description: meta.description,
          badge: meta.badge,
          badgeType: meta.badgeType,
          color: meta.color,
          totalCards: meta.totalCards,
          wordsCount,
          importedCount,
          reviewedCount,
          topicsCount: topics.length,
          topics,
          isImported,
          notebookId: status.notebookId,
          deckDue,
          reviewUrl: status.notebookId
            ? `/review?notebookId=${status.notebookId}&studyAll=true`
            : `/review?studyAll=true&limit=15`,
        };
      })
      .filter((book): book is NonNullable<typeof book> => book !== null);
  }, [deckStatusById, entries, currentTime]);

  // 2. Nhóm Tiếng Anh IT & Công nghệ (Opt-in)
  const itBook = useMemo(() => {
    const status = deckStatusById.get("it-vocab");
    const meta = status?.deck;
    const topics = meta?.topics || [];

    const deckEntries = entries.filter((e) => {
      if (status?.notebookId && e.notebook_id === status.notebookId) return true;
      if (e.metadata?.topic && topics.includes(e.metadata.topic.trim())) return true;
      return false;
    });

    const totalCards = meta?.totalCards ?? 0;
    const wordsCount =
      deckEntries.length > 0 ? deckEntries.length : status?.userCardsCount || totalCards;
    const importedCount =
      deckEntries.length > 0 ? deckEntries.length : status?.userCardsCount || 0;
    const reviewedCount = deckEntries.filter(
      (e) => (e.card?.reps ?? 0) > 0 || (e.card?.state ?? 0) > 0
    ).length;
    const deckDue = deckEntries.filter(
      (e) => e.card?.due && new Date(e.card.due).getTime() <= currentTime
    ).length;
    const isImported = !!status?.isImported || importedCount > 0;

    return {
      id: "it-vocab",
      title: meta?.title ?? "Từ vựng Tiếng Anh IT & Công Nghệ",
      englishTitle: meta?.englishTitle ?? "English for Information Technology",
      description:
        meta?.description ??
        "Từ vựng tiếng Anh chuyên ngành CNTT, lập trình, mạng và quản lý dự án phần mềm.",
      badge: "Chuyên ngành bổ trợ",
      color: meta?.color ?? "#4338CA",
      totalCards,
      wordsCount,
      importedCount,
      reviewedCount,
      topicsCount: topics.length,
      topics,
      isImported,
      notebookId: status?.notebookId,
      deckDue,
      reviewUrl: status?.notebookId
        ? `/review?notebookId=${status.notebookId}&studyAll=true`
        : `/review?studyAll=true&limit=15`,
    };
  }, [deckStatusById, entries, currentTime]);

  // 3. Sổ cá nhân tự tạo (ngoài 4 bộ chuẩn)
  const customNotebooks = useMemo(() => {
    const curatedTitles = new Set(curatedDecks.map((d) => d.deck.title));
    return notebooks.filter((nb) => !curatedTitles.has(nb.name));
  }, [notebooks, curatedDecks]);

  // Cuốn sổ đang được chọn xem chủ điểm (Cấp 2)
  const selectedBook = useMemo(() => {
    if (!selectedBookId) return null;
    if (selectedBookId === "it-vocab") return itBook;
    const core = coreBooks.find((b) => b.id === selectedBookId);
    if (core) return core;
    const custom = customNotebooks.find((nb) => nb.id === selectedBookId);
    if (custom) {
      const customEntries = entries.filter((e) => e.notebook_id === custom.id);
      const topicsMap = new Map<string, number>();
      for (const e of customEntries) {
        const t = e.metadata?.topic?.trim();
        if (t) topicsMap.set(t, (topicsMap.get(t) || 0) + 1);
      }
      const topics = Array.from(topicsMap.keys());
      const reviewedCount = customEntries.filter(
        (e) => (e.card?.reps ?? 0) > 0 || (e.card?.state ?? 0) > 0
      ).length;
      const deckDue = customEntries.filter(
        (e) => e.card?.due && new Date(e.card.due).getTime() <= currentTime
      ).length;

      return {
        id: custom.id,
        title: custom.name,
        englishTitle: "Personal Notebook",
        description: custom.description || "Sổ từ vựng cá nhân tự tạo",
        badge: "SỔ CÁ NHÂN",
        color: custom.color || "#2563EB",
        totalCards: customEntries.length,
        wordsCount: customEntries.length,
        importedCount: customEntries.length,
        reviewedCount,
        topicsCount: topics.length,
        topics,
        isImported: customEntries.length > 0,
        notebookId: custom.id,
        deckDue,
        reviewUrl: `/review?notebookId=${custom.id}&studyAll=true`,
      };
    }
    return null;
  }, [selectedBookId, itBook, coreBooks, customNotebooks, entries, currentTime]);

  // Danh sách chủ điểm con thuộc riêng cuốn sổ đang chọn (Cấp 2)
  const selectedBookTopics = useMemo(() => {
    if (!selectedBook) return [];
    const deckStatus = deckStatusById.get(selectedBook.id);
    return selectedBook.topics.map((topicName) => {
      const topicEntries = entries.filter((e) => e.metadata?.topic?.trim() === topicName);
      const deckItemCount = deckStatus?.deck.topicCounts[topicName] || 0;
      const count = topicEntries.length > 0 ? topicEntries.length : deckItemCount;
      const importedCount = topicEntries.length;
      const reviewedCount = topicEntries.filter(
        (e) => (e.card?.reps ?? 0) > 0 || (e.card?.state ?? 0) > 0
      ).length;
      const dueCount = topicEntries.filter(
        (e) => e.card?.due && new Date(e.card.due).getTime() <= currentTime
      ).length;

      return {
        name: topicName,
        count,
        importedCount,
        reviewedCount,
        dueCount,
      };
    });
  }, [selectedBook, deckStatusById, entries, currentTime]);

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

  // Đường dẫn ôn tập của sổ/chủ điểm đang được lọc
  const activeFilteredReviewUrl = useMemo(() => {
    if (selectedTopicFilter) {
      return `/review?topic=${encodeURIComponent(selectedTopicFilter)}&limit=15`;
    }
    if (selectedBook) {
      return selectedBook.reviewUrl;
    }
    if (selectedNotebookFilter) {
      return `/review?notebookId=${selectedNotebookFilter}`;
    }
    return `/review?limit=15${includeItVocab ? "" : "&excludeDeck=it-vocab"}`;
  }, [selectedTopicFilter, selectedBook, selectedNotebookFilter, includeItVocab]);

  // Hàm tính số thẻ đến hạn trong 1 sổ tự tạo
  const getNotebookDueCount = (notebookId: string) => {
    return entries.filter(
      (e) =>
        e.notebook_id === notebookId &&
        e.card?.due &&
        new Date(e.card.due).getTime() <= currentTime
    ).length;
  };

  // Lọc theo search, tab, từ loại, sổ tự tạo và chủ điểm
  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      // 0. Lọc theo Chủ điểm cụ thể
      if (selectedTopicFilter !== null) {
        if (item.metadata?.topic?.trim() !== selectedTopicFilter) {
          return false;
        }
      } else if (selectedBookId !== null) {
        // Lọc theo Cuốn Sổ đang chọn
        if (selectedBookId === "it-vocab") {
          if (!isItEntry(item)) return false;
        } else if (deckStatusById.has(selectedBookId)) {
          const status = deckStatusById.get(selectedBookId)!;
          const deckTopics = status.deck.topics || [];
          const matchesNb = status.notebookId && item.notebook_id === status.notebookId;
          const matchesTopic = item.metadata?.topic && deckTopics.includes(item.metadata.topic.trim());
          if (!matchesNb && !matchesTopic) return false;
        } else {
          // Custom notebook ID
          if (item.notebook_id !== selectedBookId) return false;
        }
      } else if (selectedNotebookFilter !== null) {
        if (item.notebook_id !== selectedNotebookFilter) {
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
        const matchTopic = item.metadata?.topic?.toLowerCase().includes(q);
        return matchWord || matchMeaning || matchContext || matchPOS || matchTopic;
      }

      return true;
    });
  }, [
    entries,
    filterTab,
    selectedPosFilter,
    selectedNotebookFilter,
    selectedTopicFilter,
    selectedBookId,
    searchQuery,
    currentTime,
    deckStatusById,
    isItEntry,
  ]);

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

  // Xử lý Bắt đầu học trực tiếp một bộ thẻ chuẩn
  const handleStartDeck = (deckStatus: CuratedDeckStatus) => {
    if (deckStatus.isImported && deckStatus.notebookId) {
      router.push(`/review?notebookId=${deckStatus.notebookId}&studyAll=true`);
      return;
    }

    setDeckImportError(null);
    setImportingDeckId(deckStatus.deck.id);
    startTransition(async () => {
      try {
        const res = await importCuratedDeckAction(deckStatus.deck.id);
        if (res.success && res.notebook?.id) {
          setCuratedDecks((prev) =>
            prev.map((d) =>
              d.deck.id === deckStatus.deck.id
                ? {
                    ...d,
                    isImported: true,
                    notebookId: res.notebook?.id,
                    userCardsCount: (d.userCardsCount || 0) + (res.importedCount || 0),
                  }
                : d
            )
          );
          router.push(`/review?notebookId=${res.notebook.id}&studyAll=true`);
        } else {
          setDeckImportError(res.message || "Không thể nạp bộ thẻ. Vui lòng thử lại.");
        }
      } catch (err) {
        console.error("Lỗi khi nạp bộ thẻ:", err);
        setDeckImportError("Có sự cố khi nạp bộ thẻ. Vui lòng thử lại.");
      } finally {
        setImportingDeckId(null);
      }
    });
  };

  // Xử lý 1-click Tự động nạp bộ thẻ (nếu chưa nạp) rồi chuyển thẳng sang màn hình Ôn tập
  const handleStartBookOrTopicReview = (
    bookId: string,
    notebookId?: string,
    isImported?: boolean,
    topicName?: string
  ) => {
    const topicParam = topicName ? `&topic=${encodeURIComponent(topicName)}` : "";
    if (isImported && notebookId) {
      router.push(`/review?notebookId=${notebookId}${topicParam}&limit=15&studyAll=true`);
      return;
    }

    const deckStatus = deckStatusById.get(bookId);
    if (!deckStatus) {
      router.push(`/review?limit=15&studyAll=true${topicParam}`);
      return;
    }

    setDeckImportError(null);
    setImportingDeckId(bookId);
    startTransition(async () => {
      try {
        const res = await importCuratedDeckAction(bookId);
        if (res.success && res.notebook?.id) {
          setCuratedDecks((prev) =>
            prev.map((d) =>
              d.deck.id === bookId
                ? {
                    ...d,
                    isImported: true,
                    notebookId: res.notebook?.id,
                    userCardsCount: (d.userCardsCount || 0) + (res.importedCount || 0),
                  }
                : d
            )
          );
          router.push(
            `/review?notebookId=${res.notebook.id}${topicParam}&limit=15&studyAll=true`
          );
        } else {
          setDeckImportError(res.message || "Không thể nạp bộ thẻ. Vui lòng thử lại.");
        }
      } catch (err) {
        console.error("Lỗi khi nạp bộ thẻ:", err);
        setDeckImportError("Có sự cố khi nạp bộ thẻ. Vui lòng thử lại.");
      } finally {
        setImportingDeckId(null);
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pt-2 pb-16 animate-in fade-in duration-200">
      {/* Header: Đơn giản, tự tin, đồng bộ với Lý thuyết & Luyện tập */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
            Sổ từ vựng
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-[13px] font-mono text-[#64748B]">
            Hiển thị <span className="font-semibold text-[#0F172A]">{fsrsActiveEntries.length}</span> từ vựng
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="default"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold border-[#8190A6] text-slate-800 hover:bg-slate-100 transition-colors shadow-xs"
              title="Thêm từ vựng mới vào sổ"
            >
              <Plus className="w-4 h-4 text-[#2563EB]" />
              <span>Thêm từ mới</span>
            </Button>

            <Button
              variant="secondary"
              size="default"
              onClick={() => setIsNotebookManagerOpen(true)}
              className="flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold border-[#8190A6] text-slate-800 hover:bg-slate-100 transition-colors shadow-xs"
              title="Quản lý và tạo sổ riêng"
            >
              <FolderPlus className="w-4 h-4 text-indigo-600" />
              <span>Quản lý sổ</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Thẻ FSRS: Nhắc nhở và mục tiêu ôn tập (3 trạng thái trung thực) */}
      <Card
        className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-xs relative overflow-hidden ${
          dueCount > 0
            ? "bg-[#EFF6FF] border-[#BFDBFE]"
            : fsrsActiveEntries.length === 0
              ? "bg-[#F8FAFC] border-[#E2E8F0]"
              : "bg-[#ECFDF5] border-[#A7F3D0]"
        }`}
      >
        {dueCount > 0 ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-[#2563EB] text-white shadow-xs shrink-0">
                <Flame className="w-5 h-5 fill-white" />
              </span>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
                  Mục tiêu hôm nay (FSRS Spaced Repetition)
                </div>
                <div className="text-base sm:text-lg font-bold text-[#0F172A] mt-0.5">
                  <span className="font-mono text-[#2563EB] text-xl font-extrabold">
                    {dueCount}
                  </span>{" "}
                  thẻ đến hạn ôn tập{" "}
                  {!includeItVocab && (
                    <span className="text-xs text-[#475569] font-normal">
                      (TOEIC cốt lõi)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 1 Nút Primary CTA duy nhất theo chuẩn Bất biến */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={`/review?limit=15${includeItVocab ? "" : "&excludeDeck=it-vocab"}`}
                className={buttonVariants({
                  variant: "primary",
                  size: "default",
                  className: "min-h-[44px] px-5 text-xs sm:text-sm font-semibold shadow-sm",
                })}
              >
                <span>Bắt đầu phiên 15 thẻ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/review?studyAll=true&limit=15"
                className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] underline shrink-0 transition-colors px-1"
              >
                Học theo chủ đề →
              </Link>
            </div>
          </div>
        ) : fsrsActiveEntries.length === 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] shrink-0">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <div className="text-sm font-bold text-[#0F172A]">
                  Chưa có thẻ từ vựng trong lịch ôn FSRS
                </div>
                <div className="text-xs text-[#475569] mt-0.5">
                  Chọn một bộ thẻ chuẩn trên Kệ Sổ bên dưới và bấm{" "}
                  <strong className="text-[#0F172A]">Nạp &amp; Ôn tập</strong> để kích hoạt lịch ôn ngắt quãng ngay.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveMainTab("standard-decks")}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
            >
              <span>Mở Thư Viện Bộ Thẻ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-white text-[#047857] border border-[#A7F3D0] shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <div>
                <div className="text-sm font-bold text-[#0F172A]">
                  Tuyệt vời! Bạn đã hoàn thành toàn bộ thẻ đến hạn hôm nay
                </div>
                <div className="text-xs text-[#475569] mt-0.5">
                  Đang quản lý <span className="font-mono font-bold text-[#0F172A]">{fsrsActiveEntries.length}</span> thẻ trong lịch FSRS. Bạn có thể ôn lại trước hạn bất cứ lúc nào.
                </div>
              </div>
            </div>

            <Link
              href={`/review?studyAll=true&limit=15${includeItVocab ? "" : "&excludeDeck=it-vocab"}`}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#A7F3D0] text-xs font-bold text-[#047857] flex items-center gap-1.5 shrink-0 transition-colors self-start sm:self-auto shadow-xs"
            >
              <span>Ôn tập tự do (Ôn trước hạn)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </Card>

      {deckImportError && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-xs text-[#BE123C] flex items-center justify-between gap-3"
        >
          <span className="font-medium">{deckImportError}</span>
          <button
            type="button"
            onClick={() => setDeckImportError(null)}
            className="text-xs font-bold underline cursor-pointer shrink-0"
          >
            Đóng
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* TASK 2: Tab View Nội Tuyến (Inline Tabs: Sổ từ của tôi & Thư Viện Bộ Thẻ) */}
      {/* ========================================================= */}
      <div className="border-b border-[#E2E8F0] pt-2">
        <div className="flex items-center gap-2" role="tablist" aria-label="Phân loại sổ từ">
          <button
            type="button"
            role="tab"
            aria-selected={activeMainTab === "my-vocab"}
            onClick={() => setActiveMainTab("my-vocab")}
            className={`px-4 sm:px-5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeMainTab === "my-vocab"
                ? "border-[#2563EB] text-[#2563EB] bg-[#EFF6FF]"
                : "border-transparent text-[#475569] hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Library className="w-4 h-4" />
            <span>Sổ từ của tôi</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                activeMainTab === "my-vocab"
                  ? "bg-[#2563EB] text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {entries.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeMainTab === "standard-decks"}
            onClick={() => setActiveMainTab("standard-decks")}
            className={`px-4 sm:px-5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeMainTab === "standard-decks"
                ? "border-[#2563EB] text-[#2563EB] bg-[#EFF6FF]"
                : "border-transparent text-[#475569] hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Thư Viện Bộ Thẻ</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                activeMainTab === "standard-decks"
                  ? "bg-[#2563EB] text-white"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {totalCuratedCards > 0 ? `${totalCuratedCards} từ` : "4 bộ"}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: KHO BỘ THẺ TOEIC CHUẨN (INLINE 3-COL GRID VIEW)  */}
      {/* ========================================================= */}
      {activeMainTab === "standard-decks" ? (
        <VocabCuratedDecksTab
          curatedDecks={curatedDecks}
          totalCuratedCards={totalCuratedCards}
          deckImportError={deckImportError}
          importingDeckId={importingDeckId}
          onDismissError={() => setDeckImportError(null)}
          onStartDeck={handleStartDeck}
          onOpenNotebookInMyVocab={(notebookId) => {
            setSelectedNotebookFilter(notebookId);
            setActiveMainTab("my-vocab");
          }}
        />
      ) : (
        /* ========================================================= */
        /* VIEW 2: SỔ TỪ VỰNG CỦA TÔI (MÔ HÌNH KỆ SỔ 2 CẤP)          */
        /* ========================================================= */
        <div className="space-y-5">
          {/* A. Thanh công cụ phía trên (Top Control Bar) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8190A6]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  handleSearchChange(e.target.value);
                  if (e.target.value.trim()) {
                    setNavigationStep("words");
                  }
                }}
                placeholder="Tìm theo từ tiếng Anh, từ loại hoặc nghĩa..."
                className="w-full h-11 pl-10 pr-9 rounded-lg border border-[#8190A6] text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-white shadow-xs"
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

            {/* Segmented Control Chuyển đổi giữa Kệ Sổ và Tất Cả Từ Vựng */}
            <div className="inline-flex rounded-lg border border-[#8190A6] p-0.5 bg-[#F8FAFC] self-start sm:self-auto h-11 items-center shrink-0">
              <button
                type="button"
                onClick={() => {
                  setNavigationStep("books");
                  setSelectedBookId(null);
                  setSelectedNotebookFilter(null);
                  setSelectedTopicFilter(null);
                }}
                className={`px-3.5 h-9.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  navigationStep === "books" || navigationStep === "topics"
                    ? "bg-white text-[#0F172A] shadow-xs"
                    : "text-[#475569] hover:text-[#0F172A]"
                }`}
              >
                <LayoutGrid className="w-4 h-4 text-indigo-600" />
                <span>Kệ Sổ</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    navigationStep === "books" || navigationStep === "topics"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {coreBooks.length + (customNotebooks.length > 0 ? customNotebooks.length : 0) + 1}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNavigationStep("words");
                  setSelectedBookId(null);
                  setSelectedNotebookFilter(null);
                  setSelectedTopicFilter(null);
                }}
                className={`px-3.5 h-9.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  navigationStep === "words" && selectedBookId === null && selectedTopicFilter === null
                    ? "bg-white text-[#0F172A] shadow-xs"
                    : "text-[#475569] hover:text-[#0F172A]"
                }`}
              >
                <BookOpenText className="w-4 h-4 text-[#2563EB]" />
                <span>Tất Cả Từ Vựng</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    navigationStep === "words" && selectedBookId === null && selectedTopicFilter === null
                      ? "bg-[#2563EB] text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {entries.length}
                </span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CẤP 1: KỆ SỔ (navigationStep === 'books' - Mặc định)       */}
          {/* ========================================================= */}
          {navigationStep === "books" && (
            <div className="space-y-8 animate-in fade-in duration-150">
              {/* KHU VỰC CHÍNH: 🎯 Sổ Luyện Thi TOEIC Cốt Lõi */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-blue-100 text-[#2563EB]">
                      <Target className="w-5 h-5" />
                    </span>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        Sổ Luyện Thi TOEIC Cốt Lõi
                      </h2>
                      <p className="text-xs text-[#475569]">
                        Lộ trình từ vựng ETS và 600 Essential Words bám sát đề thi thực tế
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {coreBooks.map((book) => {
                    const isUnimported = !book.isImported;
                    const isNotStarted = book.isImported && book.reviewedCount === 0;
                    const isCompletedToday =
                      book.isImported && book.reviewedCount > 0 && book.deckDue === 0;
                    const isImportingThis = importingDeckId === book.id;

                    const completionRate =
                      isUnimported || isNotStarted
                        ? 0
                        : isCompletedToday
                          ? 100
                          : book.wordsCount > 0
                            ? Math.min(
                                100,
                                Math.max(
                                  8,
                                  Math.round(
                                    ((book.wordsCount - book.deckDue) / book.wordsCount) * 100
                                  )
                                )
                              )
                            : 0;

                    return (
                      <Card
                        key={book.id}
                        className="p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs hover:shadow-md hover:border-[#2563EB]/40 transition-all flex flex-col justify-between space-y-4 group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs border"
                                style={{
                                  backgroundColor: `${book.color}15`,
                                  borderColor: `${book.color}30`,
                                  color: book.color,
                                }}
                              >
                                <BookOpen className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] font-mono block">
                                  {book.badge}
                                </span>
                                <h3
                                  className="text-sm sm:text-base font-bold text-[#0F172A] truncate"
                                  title={book.title}
                                >
                                  {book.title}
                                </h3>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-[#475569] leading-relaxed line-clamp-2">
                            {book.description}
                          </p>

                          <div className="flex items-center gap-2 text-[11px] font-medium text-[#475569] bg-[#F8FAFC] px-2.5 py-1 rounded-lg border border-[#E2E8F0]">
                            <span className="font-bold text-[#0F172A]">
                              {book.topicsCount} chủ điểm
                            </span>
                            <span>•</span>
                            <span>{book.wordsCount} từ vựng</span>
                          </div>

                          {/* Tiến độ FSRS & Trạng thái 3 cấp trung thực */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[#475569] font-medium">
                                Trạng thái ôn tập:
                              </span>
                              {isUnimported ? (
                                <span className="font-semibold text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                                  Chưa nạp vào sổ
                                </span>
                              ) : isNotStarted ? (
                                <span className="font-bold text-[#2563EB] flex items-center gap-1 font-mono">
                                  <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                                  Mới nạp · {book.deckDue || book.wordsCount} thẻ chờ học
                                </span>
                              ) : book.deckDue > 0 ? (
                                <span className="font-bold text-[#4338CA] flex items-center gap-1 font-mono">
                                  <Flame className="w-3.5 h-3.5 text-[#B45309]" />
                                  {book.deckDue} thẻ cần ôn
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

                        {/* Footer: Nút Mở xem các chủ điểm & Nút 1-click Nạp / Ôn tập */}
                        <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBookId(book.id);
                              setNavigationStep("topics");
                              setSelectedTopicFilter(null);
                              setSelectedNotebookFilter(book.notebookId || null);
                            }}
                            className="flex-1 min-h-[44px] px-3 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-[#475569]" />
                            <span>Mở xem các chủ điểm</span>
                          </button>

                          <button
                            type="button"
                            disabled={isImportingThis}
                            onClick={() =>
                              handleStartBookOrTopicReview(
                                book.id,
                                book.notebookId,
                                book.isImported
                              )
                            }
                            className="min-h-[44px] px-3.5 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] disabled:opacity-60 text-[#2563EB] text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0 border border-[#BFDBFE]"
                          >
                            {isImportingThis ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Đang nạp...</span>
                              </>
                            ) : (
                              <>
                                <span>
                                  {isUnimported
                                    ? "Nạp & Ôn tập"
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

                  {/* Các Sổ cá nhân tự tạo (nếu có) */}
                  {customNotebooks.map((nb) => {
                    const nbDue = getNotebookDueCount(nb.id);
                    const nbEntries = entries.filter((e) => e.notebook_id === nb.id);
                    const matchingCount = nbEntries.length;
                    const wordCount = matchingCount > 0 ? matchingCount : (nb.word_count ?? 0);
                    const reviewedCount = nbEntries.filter(
                      (e) => (e.card?.reps ?? 0) > 0 || (e.card?.state ?? 0) > 0
                    ).length;
                    const isEmptyNb = wordCount === 0;
                    const isNotStartedNb = !isEmptyNb && reviewedCount === 0;
                    const isCompletedTodayNb =
                      !isEmptyNb && reviewedCount > 0 && nbDue === 0;

                    const completionRate =
                      isEmptyNb || isNotStartedNb
                        ? 0
                        : isCompletedTodayNb
                          ? 100
                          : wordCount > 0
                            ? Math.min(
                                100,
                                Math.max(8, Math.round(((wordCount - nbDue) / wordCount) * 100))
                              )
                            : 0;

                    return (
                      <Card
                        key={nb.id}
                        className="p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs hover:shadow-md hover:border-[#2563EB]/40 transition-all flex flex-col justify-between space-y-4 group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs border"
                                style={{
                                  backgroundColor: `${nb.color}15`,
                                  borderColor: `${nb.color}30`,
                                  color: nb.color,
                                }}
                              >
                                <Folder className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#475569] block">
                                  Sổ cá nhân
                                </span>
                                <h3
                                  className="text-sm sm:text-base font-bold text-[#0F172A] truncate"
                                  title={nb.name}
                                >
                                  {nb.name}
                                </h3>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-[#475569] leading-relaxed line-clamp-2">
                            {nb.description || "Sổ từ vựng cá nhân tự tạo"}
                          </p>

                          <div className="flex items-center gap-2 text-[11px] font-medium text-[#475569] bg-[#F8FAFC] px-2.5 py-1 rounded-lg border border-[#E2E8F0]">
                            <span className="font-bold text-[#0F172A]">{wordCount} từ vựng</span>
                          </div>

                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[#475569] font-medium">
                                Trạng thái ôn tập:
                              </span>
                              {isEmptyNb ? (
                                <span className="font-semibold text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                                  Chưa có từ vựng
                                </span>
                              ) : isNotStartedNb ? (
                                <span className="font-bold text-[#2563EB] flex items-center gap-1 font-mono">
                                  <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                                  Mới tạo · {nbDue || wordCount} thẻ chờ học
                                </span>
                              ) : nbDue > 0 ? (
                                <span className="font-bold text-[#4338CA] flex items-center gap-1 font-mono">
                                  <Flame className="w-3.5 h-3.5 text-[#B45309]" />
                                  {nbDue} thẻ cần ôn
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
                                  backgroundColor: isCompletedTodayNb ? "#047857" : "#4338CA",
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBookId(nb.id);
                              setSelectedNotebookFilter(nb.id);
                              setSelectedTopicFilter(null);
                              setNavigationStep("words");
                            }}
                            className="flex-1 min-h-[44px] px-3 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-[#475569]" />
                            <span>Mở xem từ vựng</span>
                          </button>
                          <Link
                            href={`/review?notebookId=${nb.id}&studyAll=true`}
                            className="min-h-[44px] px-3.5 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0 border border-[#BFDBFE]"
                          >
                            <span>{isCompletedTodayNb ? "Ôn lại" : "Ôn tập"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* KHU VỰC PHỤ: Tiếng Anh Chuyên Ngành Mở Rộng (Dành cho IT & Tech) */}
              <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE] font-mono">
                        Chuyên ngành bổ trợ
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
                        Tiếng Anh Chuyên Ngành Mở Rộng (Dành cho IT &amp; Tech)
                      </h2>
                    </div>
                    <p className="text-xs text-[#475569] leading-relaxed">
                      Dành cho sinh viên và kỹ sư công nghệ kết hợp luyện thi TOEIC và nâng cao năng lực đọc hiểu tài liệu IT.
                    </p>
                  </div>

                  {/* Toggle Switch persist vào localStorage */}
                  <div className="flex items-center gap-2.5 bg-white px-3.5 py-2 rounded-xl border border-[#C7D2FE] shadow-xs shrink-0 self-start sm:self-auto">
                    <label
                      htmlFor="it-fsrs-toggle"
                      className="text-xs font-semibold text-[#0F172A] cursor-pointer select-none"
                    >
                      Gộp từ vựng IT vào lịch ôn FSRS hằng ngày
                    </label>
                    <button
                      id="it-fsrs-toggle"
                      type="button"
                      role="switch"
                      aria-checked={includeItVocab}
                      onClick={() => handleToggleIncludeIt(!includeItVocab)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 ${
                        includeItVocab ? "bg-[#4338CA]" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white transition-transform shadow-xs absolute top-1 left-1 ${
                          includeItVocab ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Thẻ Sổ IT */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <Card className="p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs border bg-[#EEF2FF] border-[#C7D2FE] text-[#4338CA]">
                            <Code2 className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4338CA] font-mono block">
                              CHUYÊN NGÀNH CNTT
                            </span>
                            <h3
                              className="text-sm sm:text-base font-bold text-[#0F172A] truncate"
                              title={itBook.title}
                            >
                              {itBook.title}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-[#475569] leading-relaxed line-clamp-2">
                        {itBook.description}
                      </p>

                      <div className="flex items-center gap-2 text-[11px] font-medium text-[#475569] bg-[#F8FAFC] px-2.5 py-1 rounded-lg border border-[#E2E8F0]">
                        <span className="font-bold text-[#0F172A]">
                          {itBook.topicsCount} chủ điểm
                        </span>
                        <span>•</span>
                        <span>{itBook.wordsCount} từ vựng</span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#475569] font-medium">
                            Trạng thái ôn tập:
                          </span>
                          {!itBook.isImported ? (
                            <span className="font-semibold text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                              Chưa nạp vào sổ
                            </span>
                          ) : itBook.reviewedCount === 0 ? (
                            <span className="font-bold text-[#4338CA] flex items-center gap-1 font-mono">
                              <Sparkles className="w-3.5 h-3.5 text-[#4338CA]" />
                              Mới nạp · {itBook.deckDue || itBook.wordsCount} thẻ chờ học
                            </span>
                          ) : itBook.deckDue > 0 ? (
                            <span className="font-bold text-[#4338CA] flex items-center gap-1 font-mono">
                              <Flame className="w-3.5 h-3.5 text-[#B45309]" />
                              {itBook.deckDue} thẻ cần ôn
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
                              width: `${
                                !itBook.isImported || itBook.reviewedCount === 0
                                  ? 0
                                  : itBook.deckDue === 0
                                    ? 100
                                    : itBook.wordsCount > 0
                                      ? Math.min(
                                          100,
                                          Math.max(
                                            8,
                                            Math.round(
                                              ((itBook.wordsCount - itBook.deckDue) /
                                                itBook.wordsCount) *
                                                100
                                            )
                                          )
                                        )
                                      : 0
                              }%`,
                              backgroundColor:
                                itBook.isImported &&
                                itBook.reviewedCount > 0 &&
                                itBook.deckDue === 0
                                  ? "#047857"
                                  : "#4338CA",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBookId("it-vocab");
                          setNavigationStep("topics");
                          setSelectedTopicFilter(null);
                          setSelectedNotebookFilter(itBook.notebookId || null);
                        }}
                        className="flex-1 min-h-[44px] px-3 rounded-xl bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4338CA] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#4338CA]" />
                        <span>Mở xem các chủ điểm ({itBook.topicsCount})</span>
                      </button>

                      <button
                        type="button"
                        disabled={importingDeckId === "it-vocab"}
                        onClick={() =>
                          handleStartBookOrTopicReview(
                            "it-vocab",
                            itBook.notebookId,
                            itBook.isImported
                          )
                        }
                        className="min-h-[44px] px-3.5 rounded-xl bg-[#4338CA] hover:bg-[#3730A3] disabled:opacity-60 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0"
                      >
                        {importingDeckId === "it-vocab" ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang nạp...</span>
                          </>
                        ) : (
                          <>
                            <span>
                              {!itBook.isImported
                                ? "Nạp & Ôn tập"
                                : itBook.reviewedCount > 0 && itBook.deckDue === 0
                                  ? "Ôn lại"
                                  : "Ôn tập"}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* CẤP 2: CÁC CHỦ ĐIỂM CON THUỘC SỔ ĐANG CHỌN (navigationStep === 'topics') */}
          {/* ========================================================= */}
          {navigationStep === "topics" && selectedBook && (
            <VocabTopicsGrid
              selectedBook={selectedBook}
              topics={selectedBookTopics}
              isImportingBook={importingDeckId === selectedBook.id}
              onBackToBooks={() => {
                setNavigationStep("books");
                setSelectedBookId(null);
                setSelectedTopicFilter(null);
              }}
              onViewAllBookWords={() => {
                setNavigationStep("words");
                setSelectedTopicFilter(null);
              }}
              onSelectTopic={(topicName) => {
                setSelectedTopicFilter(topicName);
                setNavigationStep("words");
              }}
              onReviewBook={() =>
                handleStartBookOrTopicReview(
                  selectedBook.id,
                  selectedBook.notebookId,
                  selectedBook.isImported
                )
              }
              onReviewTopic={(topicName) =>
                handleStartBookOrTopicReview(
                  selectedBook.id,
                  selectedBook.notebookId,
                  selectedBook.isImported,
                  topicName
                )
              }
            />
          )}

          {/* ========================================================= */}
          {/* CẤP 3: CHI TIẾT SỔ / TẤT CẢ TỪ VỰNG (navigationStep === 'words') */}
          {/* ========================================================= */}
          {navigationStep === "words" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Header Breadcrumb Điều hướng 3 Cấp */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setNavigationStep("books");
                      setSelectedBookId(null);
                      setSelectedTopicFilter(null);
                      setSelectedNotebookFilter(null);
                    }}
                    className="min-h-[38px] px-3 py-1.5 rounded-lg bg-white border border-[#BFDBFE] text-xs font-bold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer flex items-center gap-1 shadow-xs shrink-0"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại Kệ Sổ</span>
                  </button>

                  {selectedBook && (
                    <>
                      <span className="text-slate-300">/</span>
                      <button
                        type="button"
                        onClick={() => {
                          setNavigationStep("topics");
                          setSelectedTopicFilter(null);
                        }}
                        className="text-xs font-bold text-[#1D4ED8] hover:underline cursor-pointer"
                      >
                        {selectedBook.title}
                      </button>
                    </>
                  )}

                  {selectedTopicFilter && (
                    <>
                      <span className="text-slate-300">/</span>
                      <span className="text-xs sm:text-sm font-bold text-[#0F172A] truncate bg-white px-2.5 py-0.5 rounded-md border border-[#BFDBFE]">
                        {getTopicVisuals(selectedTopicFilter).titleVi} ({selectedTopicFilter}) • {filteredEntries.length} từ
                      </span>
                    </>
                  )}

                  {!selectedTopicFilter && !selectedBook && (
                    <>
                      <span className="text-slate-300">/</span>
                      <span className="text-xs sm:text-sm font-bold text-[#0F172A]">
                        Tất cả từ vựng ({filteredEntries.length} từ)
                      </span>
                    </>
                  )}
                </div>

                {selectedBook && !selectedBook.isImported ? (
                  <button
                    type="button"
                    disabled={importingDeckId === selectedBook.id}
                    onClick={() =>
                      handleStartBookOrTopicReview(
                        selectedBook.id,
                        selectedBook.notebookId,
                        selectedBook.isImported,
                        selectedTopicFilter || undefined
                      )
                    }
                    className="w-full sm:w-auto min-h-[40px] px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    {importingDeckId === selectedBook.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang nạp sổ từ...</span>
                      </>
                    ) : (
                      <>
                        <span>Nạp &amp; Ôn tập danh sách này</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={activeFilteredReviewUrl}
                    className="w-full sm:w-auto min-h-[40px] px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    <span>Ôn danh sách này ({filteredEntries.length} từ)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {/* Hàng bộ lọc gọn gàng trên 1 dòng: Từ loại + Bộ lọc Trạng thái Đến hạn (Chuẩn Precision Swiss Tokens) */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
                {/* Các pill lọc TỪ LOẠI */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#475569] mr-1 shrink-0">
                    Từ loại:
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePosFilter("all")}
                    className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                      selectedPosFilter === "all"
                        ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs"
                        : "bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F1F5F9]"
                    }`}
                  >
                    Tất cả ({entries.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePosFilter("noun")}
                    className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                      selectedPosFilter === "noun"
                        ? "bg-[#2563EB] text-white border-[#2563EB] shadow-xs"
                        : "bg-white text-[#0F172A] border-[#E2E8F0] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
                    }`}
                  >
                    Danh từ ({posCounts.noun})
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePosFilter("verb")}
                    className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                      selectedPosFilter === "verb"
                        ? "bg-[#2563EB] text-white border-[#2563EB] shadow-xs"
                        : "bg-white text-[#0F172A] border-[#E2E8F0] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
                    }`}
                  >
                    Động từ ({posCounts.verb})
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePosFilter("adjective")}
                    className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                      selectedPosFilter === "adjective"
                        ? "bg-[#2563EB] text-white border-[#2563EB] shadow-xs"
                        : "bg-white text-[#0F172A] border-[#E2E8F0] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
                    }`}
                  >
                    Tính từ ({posCounts.adjective})
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePosFilter("adverb")}
                    className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                      selectedPosFilter === "adverb"
                        ? "bg-[#2563EB] text-white border-[#2563EB] shadow-xs"
                        : "bg-white text-[#0F172A] border-[#E2E8F0] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
                    }`}
                  >
                    Trạng từ ({posCounts.adverb})
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePosFilter("phrase")}
                    className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                      selectedPosFilter === "phrase"
                        ? "bg-[#2563EB] text-white border-[#2563EB] shadow-xs"
                        : "bg-white text-[#0F172A] border-[#E2E8F0] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
                    }`}
                  >
                    Cụm từ ({posCounts.phrase})
                  </button>
                </div>

                {/* Cụm công cụ bên phải: Lọc Đến hạn + 2 Nút Công tắc (Che nghĩa & Hiện ví dụ) */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Bộ lọc trạng thái: Tất cả | Đến hạn */}
                  <div className="inline-flex rounded-lg border border-[#8190A6] p-0.5 bg-white self-start md:self-auto h-8 items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTabChange("all")}
                      className={`px-2.5 h-7 text-[11px] font-semibold rounded transition-all cursor-pointer font-mono ${
                        filterTab === "all"
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-[#475569] hover:text-[#0F172A]"
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange("due")}
                      className={`px-2.5 h-7 text-[11px] font-semibold rounded transition-all cursor-pointer font-mono ${
                        filterTab === "due"
                          ? "bg-[#EEF2FF] text-[#4338CA] shadow-xs"
                          : "text-[#475569] hover:text-[#4338CA]"
                      }`}
                    >
                      Đến hạn ({dueCount})
                    </button>
                  </div>

                  <div className="h-4 w-px bg-slate-200 hidden sm:block" />

                  {/* Nút Công tắc 1: Che nghĩa (text-amber-600 bg-amber-50) */}
                  <button
                    type="button"
                    onClick={() => {
                      setHideMeanings((prev) => !prev);
                      setRevealedCardIds(new Set());
                    }}
                    className={`h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                      hideMeanings
                        ? "bg-amber-50 text-amber-700 border-amber-300 font-bold shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                    title="Che nghĩa tiếng Việt để tự nhớ (Bấm vào thẻ để hiện nghĩa)"
                  >
                    {hideMeanings ? (
                      <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>{hideMeanings ? "Đang che nghĩa" : "Che nghĩa"}</span>
                  </button>

                  {/* Nút Công tắc 2: Hiện ví dụ (text-slate-600 bg-slate-100) */}
                  <button
                    type="button"
                    onClick={() => setShowExamples((prev) => !prev)}
                    className={`h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                      showExamples
                        ? "bg-slate-100 text-slate-700 border-slate-300 font-bold shadow-xs"
                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                    }`}
                    title="Bật/Tắt hiển thị câu ví dụ ngữ cảnh"
                  >
                    {showExamples ? (
                      <TextQuote className="w-3.5 h-3.5 text-slate-700" />
                    ) : (
                      <Quote className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{showExamples ? "Hiện ví dụ" : "Ẩn ví dụ"}</span>
                  </button>
                </div>
              </div>

              {/* Neo cuộn trang mượt */}
              <div ref={listTopRef} className="-mt-2 scroll-mt-6" />

          {/* ========================================================= */}
          {/* LƯỚI TỪ VỰNG CÁ NHÂN (WORD CARDS)                          */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {paginatedEntries.map((item) => {
              const isEditing = editingId === item.id;
              const isDeleting = confirmDeleteId === item.id;
              const isDue =
                item.card?.due && new Date(item.card.due).getTime() <= currentTime;
              const posInfo = getPosBadgeInfo(item.part_of_speech, item.meaning, item.word);
              const dualDetails = resolveDualDetails(
                item.word,
                item.part_of_speech,
                item.meaning,
                item.context_sentence
              );
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

                          {dualDetails.isDual ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <AudioSpeakerButton
                                word={item.word}
                                audioUrl={dualDetails.nounAudioUrl}
                                posHint="noun"
                                partOfSpeech="noun"
                                phonetic={dualDetails.nounIpa}
                                spokenText={item.word}
                                label="n"
                                size="sm"
                              />
                              <span className="text-[12px] font-ipa text-slate-500">{dualDetails.nounIpa}</span>
                              <AudioSpeakerButton
                                word={item.word}
                                audioUrl={dualDetails.verbAudioUrl}
                                posHint="verb"
                                partOfSpeech="verb"
                                phonetic={dualDetails.verbIpa}
                                spokenText={`to ${item.word}`}
                                label="v"
                                size="sm"
                              />
                              <span className="text-[12px] font-ipa text-slate-500">{dualDetails.verbIpa}</span>
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
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider border ${
                              dualDetails.isDual ? "bg-indigo-50 text-indigo-700 border-indigo-200" : posInfo.badgeClass
                            }`}
                          >
                            {dualDetails.isDual ? "DANH TỪ · ĐỘNG TỪ" : posInfo.shortBadge}
                          </span>

                          {/* Huy hiệu Chuẩn Barron's 600 Words */}
                          {item.metadata?.is_essential_600 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Barron&apos;s
                            </span>
                          )}

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
                    ) : hideMeanings && !revealedCardIds.has(item.id) ? (
                      <div>
                        <button
                          type="button"
                          onClick={() => setRevealedCardIds((prev) => new Set(prev).add(item.id))}
                          className="text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/90 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          title="Bấm để mở nghĩa tiếng Việt"
                        >
                          <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                          <span>Bấm để hiện nghĩa</span>
                        </button>
                      </div>
                    ) : dualDetails.isDual && dualDetails.nounMeaning && dualDetails.verbMeaning ? (
                      <div
                        onClick={() => {
                          if (hideMeanings) {
                            setRevealedCardIds((prev) => {
                              const next = new Set(prev);
                              next.delete(item.id);
                              return next;
                            });
                          } else {
                            setSelectedDetailEntry(item);
                          }
                        }}
                        className={`space-y-1 cursor-pointer ${
                          hideMeanings
                            ? "bg-amber-50/70 border border-amber-200 p-1.5 rounded inline-block text-amber-900"
                            : ""
                        }`}
                        title={hideMeanings ? "Bấm để che lại nghĩa" : "Xem chi tiết từ vựng"}
                      >
                        <div className="flex items-baseline gap-1.5 text-xs text-slate-700">
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase bg-blue-100 text-blue-800 shrink-0">
                            [n]
                          </span>
                          <span className="font-semibold text-slate-900">{dualDetails.nounMeaning}</span>
                        </div>
                        <div className="flex items-baseline gap-1.5 text-xs text-slate-700">
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 shrink-0">
                            [v]
                          </span>
                          <span className="font-semibold text-slate-900">{dualDetails.verbMeaning}</span>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          if (hideMeanings) {
                            setRevealedCardIds((prev) => {
                              const next = new Set(prev);
                              next.delete(item.id);
                              return next;
                            });
                          } else {
                            setSelectedDetailEntry(item);
                          }
                        }}
                        className={`text-[15px] font-semibold text-[#1E40AF] cursor-pointer hover:underline ${
                          hideMeanings
                            ? "bg-amber-50/70 border border-amber-200 px-2 py-0.5 rounded inline-block text-amber-900"
                            : ""
                        }`}
                        title={hideMeanings ? "Bấm để che lại nghĩa" : "Xem chi tiết từ vựng"}
                      >
                        {item.meaning}
                      </div>
                    )}

                    {/* Câu ngữ cảnh hoàn chỉnh (Không có vết đục lỗ ____) - Kiểm soát bởi công tắc Hiện ví dụ */}
                    {showExamples && item.context_sentence && (
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

                    {/* Preview Mẹo & Bí kíp TOEIC Part 5 & 7 */}
                    {item.metadata?.usage_note && (
                      <div
                        onClick={() => setSelectedDetailEntry(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[11px] text-[#B45309] cursor-pointer hover:bg-[#FEF3C7] transition-colors flex items-center justify-between gap-2"
                        title="Bấm để xem chi tiết bí kíp và gia đình từ"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="shrink-0 text-[#B45309] font-bold">Mẹo TOEIC:</span>
                          <span className="truncate">{item.metadata.usage_note}</span>
                        </div>
                        {item.metadata.word_family && item.metadata.word_family.length > 0 && (
                          <span className="shrink-0 text-[10px] font-mono font-medium text-[#B45309] bg-white px-1.5 py-0.5 rounded border border-[#FDE68A]">
                            {item.metadata.word_family.length} dạng từ
                          </span>
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

          {/* Phân trang (Pagination) */}
          {filteredEntries.length > 0 && (
            <nav
              role="navigation"
              aria-label="Phân trang danh sách từ vựng"
              className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
            >
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

          {/* Trạng thái rỗng & không tìm thấy kết quả */}
          {selectedBook && !selectedBook.isImported && filteredEntries.length === 0 ? (
            <Card className="p-8 sm:p-10 text-center bg-white border border-[#E2E8F0] space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#BFDBFE]">
                <Layers className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-[#0F172A]">
                  Bộ thẻ &ldquo;{selectedBook.title}&rdquo; chưa được nạp vào sổ cá nhân
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  Nạp bộ thẻ này ({selectedBook.totalCards} từ • {selectedBook.topicsCount} chủ điểm) để lưu danh sách từ, tra cứu IPA, nghe phát âm và bắt đầu lịch ôn tập ngắt quãng FSRS.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                <button
                  type="button"
                  disabled={importingDeckId === selectedBook.id}
                  onClick={() =>
                    handleStartBookOrTopicReview(
                      selectedBook.id,
                      selectedBook.notebookId,
                      selectedBook.isImported,
                      selectedTopicFilter || undefined
                    )
                  }
                  className={buttonVariants({
                    variant: "primary",
                    size: "default",
                    className: "min-h-[44px] px-5 text-sm font-bold cursor-pointer",
                  })}
                >
                  {importingDeckId === selectedBook.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang nạp {selectedBook.totalCards} từ vựng...</span>
                    </>
                  ) : (
                    <>
                      <span>Nạp bộ thẻ &amp; Bắt đầu ôn tập ngay</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </Card>
          ) : entries.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center bg-white border border-[#E2E8F0] space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                <BookOpen className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-[#0F172A]">
                  Bạn chưa có từ vựng nào trong sổ
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  Hãy quay lại Kệ Sổ để nạp một bộ thẻ TOEIC chuẩn (ETS, Barron&apos;s 600 Words) hoặc lưu từ mới trực tiếp trong lúc giải đề.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setNavigationStep("books");
                    setSelectedBookId(null);
                  }}
                  className={buttonVariants({
                    variant: "primary",
                    size: "default",
                    className: "min-h-[44px] cursor-pointer",
                  })}
                >
                  Chọn &amp; Nạp bộ thẻ trên Kệ Sổ →
                </button>
                <Link
                  href="/practice/new"
                  className={buttonVariants({
                    variant: "secondary",
                    size: "default",
                    className: "min-h-[44px]",
                  })}
                >
                  Làm bài luyện tập
                </Link>
              </div>
            </Card>
          ) : (
            filteredEntries.length === 0 && (
              <div className="p-8 text-center bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-sm text-[#475569] space-y-2">
                <div>
                  Không tìm thấy từ vựng nào khớp với bộ lọc hiện tại
                  {searchQuery ? ` ("${searchQuery}")` : ""}.
                </div>
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
            )
          )}
            </div>
          )}
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
    </div>
  );
}
