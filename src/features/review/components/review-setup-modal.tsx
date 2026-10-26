"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ReviewTopicInfo } from "../types";
import type { Notebook } from "@/features/vocab/types";
import {
  X,
  SlidersHorizontal,
  BookOpen,
  Layers,
  Sparkles,
  Search,
  Check,
  ArrowRight,
} from "lucide-react";

interface ReviewSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebooks: Notebook[];
  topics: ReviewTopicInfo[];
  currentNotebookId?: string;
  currentTopic?: string;
  currentLimit?: number;
}

export function ReviewSetupModal({
  isOpen,
  onClose,
  notebooks,
  topics,
  currentNotebookId,
  currentTopic,
  currentLimit = 15,
}: ReviewSetupModalProps) {
  const router = useRouter();
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | undefined>(
    currentNotebookId
  );
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>(currentTopic);
  const [selectedLimit, setSelectedLimit] = useState<number>(currentLimit);
  const [searchTopicQuery, setSearchTopicQuery] = useState("");

  const filteredTopics = useMemo(() => {
    if (!searchTopicQuery.trim()) return topics;
    const q = searchTopicQuery.toLowerCase().trim();
    return topics.filter((t) => t.name.toLowerCase().includes(q));
  }, [topics, searchTopicQuery]);

  if (!isOpen) return null;

  const handleStartReview = () => {
    const params = new URLSearchParams();
    if (selectedNotebookId) params.set("notebookId", selectedNotebookId);
    if (selectedTopic) params.set("topic", selectedTopic);
    if (selectedLimit > 0) params.set("limit", selectedLimit.toString());

    onClose();
    router.push(`/review?${params.toString()}`);
  };

  const limitOptions = [
    { value: 10, label: "10 từ", sub: "⚡ ~3 phút (Ôn nhanh)" },
    { value: 15, label: "15 từ", sub: "🎯 ~5 phút (Khuyên dùng)" },
    { value: 25, label: "25 từ", sub: "🚀 ~8 phút (Chuyên sâu)" },
    { value: 0, label: "Tất cả", sub: "📚 Toàn bộ thẻ đến hạn" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Tùy chỉnh phiên ôn tập
              </h3>
              <p className="text-xs text-slate-500">
                Chia nhỏ kho từ vựng lớn thành các phiên vừa vặn 10-15 từ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. Chọn Quy mô phiên ôn (Session Size Chunking) */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>1. Quy mô mỗi phiên ôn (Số thẻ):</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {limitOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedLimit(opt.value)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                    selectedLimit === opt.value
                      ? "bg-blue-50 border-blue-600 text-blue-900 font-bold ring-2 ring-blue-600/20"
                      : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/80 text-slate-700"
                  }`}
                >
                  <span className="text-sm font-bold">{opt.label}</span>
                  <span className="text-[10px] text-slate-500">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Chọn Sổ từ vựng */}
          {notebooks.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span>2. Chọn Sổ từ vựng:</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedNotebookId(undefined)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    !selectedNotebookId
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Tất cả các sổ ({notebooks.length})</span>
                </button>
                {notebooks.map((nb) => (
                  <button
                    key={nb.id}
                    type="button"
                    onClick={() => setSelectedNotebookId(nb.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedNotebookId === nb.id
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>{nb.name}</span>
                    {nb.word_count !== undefined && (
                      <span className="text-[10px] opacity-70 font-mono">
                        ({nb.word_count})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Chọn Chủ điểm TOEIC chuyên sâu (50 Thematic Units) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span>3. Chọn Chủ điểm chuyên đề (10-15 từ/chủ điểm):</span>
              </label>
              {selectedTopic && (
                <button
                  type="button"
                  onClick={() => setSelectedTopic(undefined)}
                  className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
                >
                  Bỏ chọn chủ điểm
                </button>
              )}
            </div>

            {/* Ô tìm kiếm chủ điểm */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm chủ điểm (Marketing, Contracts, Office, Health...)"
                value={searchTopicQuery}
                onChange={(e) => setSearchTopicQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-600 bg-slate-50/50"
              />
            </div>

            {/* Danh sách chủ điểm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setSelectedTopic(undefined)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  !selectedTopic
                    ? "bg-blue-50/80 border-blue-500 text-blue-900 font-bold"
                    : "bg-slate-50/60 border-slate-200 hover:bg-slate-100/70 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-xs font-semibold">Tất cả chủ điểm</span>
                </div>
                {!selectedTopic && <Check className="w-4 h-4 text-blue-600" />}
              </button>

              {filteredTopics.map((t) => {
                const isSelected = selectedTopic === t.name;
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => setSelectedTopic(t.name)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/80 border-blue-500 text-blue-900 font-bold"
                        : "bg-slate-50/60 border-slate-200 hover:bg-slate-100/70 text-slate-700"
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-semibold truncate">
                        {t.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                        <span>{t.totalCount} từ</span>
                        {t.dueCount > 0 && (
                          <span className="text-rose-600 font-bold">
                            · {t.dueCount} đến hạn
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer (Taste Gate Invariant 5: Duy nhất 1 nút Primary) */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-mono hidden sm:block">
            {selectedTopic ? `Chủ đề: ${selectedTopic}` : "Tất cả chủ đề"} ·{" "}
            {selectedLimit > 0 ? `Tối đa ${selectedLimit} thẻ` : "Toàn bộ"}
          </div>
          <button
            type="button"
            onClick={handleStartReview}
            className="w-full sm:w-auto px-6 h-11 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ml-auto"
          >
            <span>Bắt đầu ôn tập</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
