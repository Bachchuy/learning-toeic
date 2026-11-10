"use client";

import { useState, useMemo } from "react";
import type { GrammarLessonSummary } from "@/core/grammarLessons";
import { LessonCard } from "@/features/learn/components/lesson-card";
import {
  Search,
  BookOpen,
  Filter,
  X,
  AlertTriangle,
  RotateCcw,
  ArrowUpDown,
  Clock,
} from "lucide-react";

type DurationFilter = "all" | "short" | "deep";
type SortOption = "default" | "time_asc" | "time_desc" | "traps_desc" | "tricks_desc";

/**
 * Chuẩn hóa chuỗi tìm kiếm tiếng Việt không dấu để tìm kiếm thông minh
 */
function normalizeSearchText(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

interface LearnIndexViewProps {
  lessons: GrammarLessonSummary[];
}

export function LearnIndexView({ lessons: allLessons }: LearnIndexViewProps) {
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [onlyTraps, setOnlyTraps] = useState<boolean>(false);
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allLessons.length };
    for (const lesson of allLessons) {
      counts[lesson.category] = (counts[lesson.category] || 0) + 1;
    }
    return counts;
  }, [allLessons]);

  const trapsCount = useMemo(() => {
    return allLessons.filter((l) => l.trapsCount > 0).length;
  }, [allLessons]);

  const categories = [
    { id: "all", label: "Tất cả", count: categoryCounts.all ?? 16 },
    { id: "verbs", label: "Động từ & Thì", count: categoryCounts.verbs ?? 6 },
    { id: "words_phrases", label: "Từ loại & Vị trí", count: categoryCounts.words_phrases ?? 4 },
    { id: "clauses", label: "Mệnh đề & Câu phức", count: categoryCounts.clauses ?? 2 },
    { id: "structures", label: "Cấu trúc & Liên kết", count: categoryCounts.structures ?? 4 },
  ];

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setOnlyTraps(false);
    setDurationFilter("all");
    setSortBy("default");
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== "all" ||
    onlyTraps ||
    durationFilter !== "all" ||
    sortBy !== "default";

  // Filter & Sort Logic
  const filteredLessons = useMemo(() => {
    const rawQuery = searchQuery.trim();
    const normalizedQuery = normalizeSearchText(rawQuery);

    const filtered = allLessons.filter((lesson) => {
      // 1. Lọc theo Danh mục
      if (selectedCategory !== "all" && lesson.category !== selectedCategory) {
        return false;
      }

      // 2. Lọc theo Bẫy ETS
      if (onlyTraps && lesson.trapsCount === 0) {
        return false;
      }

      // 3. Lọc theo Thời lượng
      if (durationFilter === "short" && lesson.estimatedMinutes >= 10) {
        return false;
      }
      if (durationFilter === "deep" && lesson.estimatedMinutes < 10) {
        return false;
      }

      // 4. Lọc theo Từ khóa tìm kiếm (hỗ trợ cả có dấu và không dấu + thuật ngữ tiếng Anh)
      if (normalizedQuery) {
        const titleNorm = normalizeSearchText(lesson.titleVi);
        const tagNorm = normalizeSearchText(lesson.tagCode);
        const taglineNorm = normalizeSearchText(lesson.taglineVi);
        const categoryNorm = normalizeSearchText(lesson.categoryVi);
        const defNorm = normalizeSearchText(lesson.coreDefinition);

        const matchSearch =
          titleNorm.includes(normalizedQuery) ||
          tagNorm.includes(normalizedQuery) ||
          taglineNorm.includes(normalizedQuery) ||
          categoryNorm.includes(normalizedQuery) ||
          defNorm.includes(normalizedQuery);

        if (!matchSearch) {
          return false;
        }
      }

      return true;
    });

    // Sắp xếp
    if (sortBy === "time_asc") {
      filtered.sort((a, b) => a.estimatedMinutes - b.estimatedMinutes);
    } else if (sortBy === "time_desc") {
      filtered.sort((a, b) => b.estimatedMinutes - a.estimatedMinutes);
    } else if (sortBy === "traps_desc") {
      filtered.sort((a, b) => b.trapsCount - a.trapsCount);
    } else if (sortBy === "tricks_desc") {
      filtered.sort((a, b) => b.cheatSheetCount - a.cheatSheetCount);
    }

    return filtered;
  }, [allLessons, selectedCategory, onlyTraps, durationFilter, searchQuery, sortBy]);

  return (
    <div className="space-y-6 pt-2 pb-16 animate-in fade-in duration-200">
      {/* Header: Đơn giản, tự tin, không chữ con thừa thãi */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-[#E2E8F0] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
            Học lý thuyết
          </h1>
        </div>
        <div className="text-[13px] font-mono text-[#64748B]">
          Hiển thị <span className="font-semibold text-[#0F172A]">{filteredLessons.length}</span>/16 chủ điểm
        </div>
      </div>

      {/* Toolbar Tìm kiếm & Lọc hoàn thiện */}
      <div className="space-y-3.5">
        {/* Hàng 1: Ô tìm kiếm thông minh */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8190A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm chủ điểm (ví dụ: thì động từ, bị động, tenses, từ loại...)"
            className="w-full h-11 pl-10 pr-10 rounded-xl border border-[#8190A6] bg-white text-[14px] text-[#0F172A] placeholder:text-[#8190A6] focus:outline-hidden focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8190A6] hover:text-[#0F172A] rounded-md transition-colors cursor-pointer"
              title="Xóa tìm kiếm"
              aria-label="Xóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Hàng 2: Bộ lọc danh mục chính (Category Pills với số lượng) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[13px] scrollbar-none">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" />
            Lọc:
          </span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#0F172A] text-white shadow-xs"
                    : "bg-white text-[#475569] border border-[#E2E8F0] hover:bg-[#F8FAFC]"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? "bg-white/20 text-white" : "bg-[#F1F5F9] text-[#64748B]"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Hàng 3: Bộ lọc phụ & Sắp xếp (Thời lượng, Bẫy ETS, Sort) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-[12px]">
          {/* Nhóm lọc nhanh */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Bẫy ETS */}
            <button
              type="button"
              onClick={() => setOnlyTraps(!onlyTraps)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium border transition-colors cursor-pointer ${
                onlyTraps
                  ? "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A] shadow-xs"
                  : "bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC]"
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${onlyTraps ? "text-[#B45309]" : "text-[#8190A6]"}`} />
              <span>Có bẫy ETS</span>
              <span className="font-mono text-[11px] opacity-80">({trapsCount})</span>
            </button>

            {/* Lọc thời lượng */}
            <div className="inline-flex items-center rounded-lg border border-[#E2E8F0] bg-white p-0.5">
              <span className="px-2 text-[11px] font-medium text-[#64748B] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#8190A6]" />
                Thời lượng:
              </span>
              <button
                type="button"
                onClick={() => setDurationFilter("all")}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  durationFilter === "all"
                    ? "bg-[#F1F5F9] text-[#0F172A] font-semibold"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setDurationFilter("short")}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  durationFilter === "short"
                    ? "bg-[#F1F5F9] text-[#0F172A] font-semibold"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                &lt; 10 phút
              </button>
              <button
                type="button"
                onClick={() => setDurationFilter("deep")}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  durationFilter === "deep"
                    ? "bg-[#F1F5F9] text-[#0F172A] font-semibold"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                ≥ 10 phút
              </button>
            </div>
          </div>

          {/* Nhóm Sắp xếp & Nút Reset */}
          <div className="flex items-center gap-2">
            {/* Dropdown Sắp xếp */}
            <div className="inline-flex items-center gap-1.5 bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-[12px] text-[#475569]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#8190A6]" />
              <label htmlFor="sort-select" className="sr-only">Sắp xếp theo</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-[#0F172A] font-medium focus:outline-hidden cursor-pointer"
              >
                <option value="default">Thứ tự chuẩn ETS</option>
                <option value="time_asc">Thời lượng: Ngắn → Dài</option>
                <option value="time_desc">Thời lượng: Dài → Ngắn</option>
                <option value="traps_desc">Nhiều bẫy ETS nhất</option>
                <option value="tricks_desc">Nhiều mẹo 5s nhất</option>
              </select>
            </div>

            {/* Nút đặt lại bộ lọc */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                title="Đặt lại toàn bộ bộ lọc"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lesson Cards Grid */}
      {filteredLessons.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-[#E2E8F0] space-y-3 shadow-xs">
          <BookOpen className="w-10 h-10 text-[#8190A6] mx-auto" />
          <h2 className="text-[16px] font-bold text-[#0F172A]">
            Không tìm thấy chủ điểm phù hợp
          </h2>
          <p className="text-[13px] text-[#64748B] max-w-md mx-auto">
            Không có bài học nào khớp với điều kiện tìm kiếm hoặc bộ lọc hiện tại của bạn.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-[#0F172A] bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Xóa bộ lọc để xem tất cả 16 chủ điểm</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLessons.map((lesson) => (
            <LessonCard key={lesson.tagCode} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  );
}
