"use client";

import { useState, useMemo } from "react";
import type { GrammarLessonSummary } from "@/core/grammarLessons";
import {
  buildLearningRoadmap,
  type LearningRoadmapState,
} from "@/core/roadmap";
import { LessonCard } from "@/features/learn/components/lesson-card";
import { RoadmapView } from "@/features/learn/components/roadmap-view";
import { useAllLearnProgress } from "@/features/learn/lib/learn-progress-storage";
import {
  AlertTriangle,
  ArrowUpDown,
  BookOpen,
  Clock,
  Compass,
  Filter,
  LayoutGrid,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

type LearnViewMode = "roadmap" | "all";

type DurationFilter = "all" | "short" | "deep";
type SortOption =
  | "default"
  | "time_asc"
  | "time_desc"
  | "traps_desc"
  | "tricks_desc";

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
  roadmap?: LearningRoadmapState;
  initialView?: LearnViewMode;
}

export function LearnIndexView({
  lessons: allLessons,
  roadmap,
  initialView = "roadmap",
}: LearnIndexViewProps) {
  const [viewMode, setViewMode] = useState<LearnViewMode>(initialView);
  const resolvedRoadmap = useMemo(
    () => roadmap ?? buildLearningRoadmap([], 650),
    [roadmap]
  );
  const localProgressStore = useAllLearnProgress();

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
    {
      id: "words_phrases",
      label: "Từ loại & Vị trí",
      count: categoryCounts.words_phrases ?? 4,
    },
    {
      id: "clauses",
      label: "Mệnh đề & Câu phức",
      count: categoryCounts.clauses ?? 2,
    },
    {
      id: "structures",
      label: "Cấu trúc & Liên kết",
      count: categoryCounts.structures ?? 4,
    },
  ];

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
      if (selectedCategory !== "all" && lesson.category !== selectedCategory) {
        return false;
      }

      if (onlyTraps && lesson.trapsCount === 0) {
        return false;
      }

      if (durationFilter === "short" && lesson.estimatedMinutes >= 10) {
        return false;
      }
      if (durationFilter === "deep" && lesson.estimatedMinutes < 10) {
        return false;
      }

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
  }, [
    allLessons,
    selectedCategory,
    onlyTraps,
    durationFilter,
    searchQuery,
    sortBy,
  ]);

  return (
    <div className="space-y-6 pt-2 pb-16 animate-in fade-in duration-200">
      {/* Header + Chuyển chế độ Lộ trình / 16 chủ điểm */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div className="space-y-1">
          <div className="text-[11px] font-mono font-bold uppercase tracking-[0.08em] text-[#475569]">
            Giáo trình TOEIC Part 5
          </div>
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-[-0.02em] text-[#0F172A] leading-tight">
            Học lý thuyết theo lộ trình
          </h1>
        </div>

        <div
          role="tablist"
          aria-label="Chế độ xem bài học ngữ pháp"
          className="grid grid-cols-2 sm:inline-flex p-1 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] gap-1"
        >
          <button
            type="button"
            role="tab"
            id="tab-roadmap"
            aria-selected={viewMode === "roadmap"}
            onClick={() => setViewMode("roadmap")}
            className={`min-h-[44px] px-3.5 py-2 rounded-md text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === "roadmap"
                ? "bg-white text-[#0F172A] border border-[#E2E8F0]"
                : "text-[#475569] hover:text-[#0F172A]"
            }`}
          >
            <Compass className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
            <span>Lộ trình 4 chặng</span>
          </button>
          <button
            type="button"
            role="tab"
            id="tab-all-lessons"
            aria-selected={viewMode === "all"}
            onClick={() => setViewMode("all")}
            className={`min-h-[44px] px-3.5 py-2 rounded-md text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === "all"
                ? "bg-white text-[#0F172A] border border-[#E2E8F0]"
                : "text-[#475569] hover:text-[#0F172A]"
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-[#475569]" aria-hidden="true" />
            <span>16 chủ điểm ({filteredLessons.length})</span>
          </button>
        </div>
      </div>

      {viewMode === "roadmap" ? (
        <div role="tabpanel" aria-labelledby="tab-roadmap">
          <RoadmapView
            roadmap={resolvedRoadmap}
            localProgressStore={localProgressStore}
          />
        </div>
      ) : (
        <div
          role="tabpanel"
          aria-labelledby="tab-all-lessons"
          className="space-y-6"
        >
          {/* Toolbar Tìm kiếm & Lọc chuẩn 44px & font >= 16px mobile */}
          <div className="space-y-3">
            {/* Hàng 1: Ô tìm kiếm thông minh */}
            <div className="relative">
              <label htmlFor="learn-search-input" className="sr-only">
                Tìm kiếm chủ điểm ngữ pháp
              </label>
              <Search
                className="w-4 h-4 text-[#475569] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="learn-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm chủ điểm (ví dụ: thì động từ, bị động, tenses, từ loại...)"
                className="w-full min-h-[44px] h-11 pl-10 pr-11 rounded-lg border border-[#8190A6] bg-white text-base sm:text-[14px] text-[#0F172A] placeholder:text-[#475569]/70 focus:outline-hidden focus:border-[#2563EB] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#475569] hover:text-[#0F172A] rounded-md transition-colors cursor-pointer"
                  title="Xóa tìm kiếm"
                  aria-label="Xóa tìm kiếm"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Hàng 2: Bộ lọc danh mục chính */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[13px]">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#475569] mr-1 flex items-center gap-1 shrink-0">
                <Filter className="w-3 h-3" aria-hidden="true" />
                <span>Lọc:</span>
              </span>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`min-h-[44px] sm:min-h-[38px] px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                      isSelected
                        ? "bg-[#0F172A] border-[#0F172A] text-white"
                        : "bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded font-mono tabular-nums ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-[#F1F5F9] text-[#475569]"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Hàng 3: Bộ lọc phụ & Sắp xếp */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 text-[12px]">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-pressed={onlyTraps}
                  onClick={() => setOnlyTraps(!onlyTraps)}
                  className={`min-h-[44px] sm:min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium border transition-colors cursor-pointer ${
                    onlyTraps
                      ? "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]"
                      : "bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <AlertTriangle
                    className={`w-3.5 h-3.5 ${
                      onlyTraps ? "text-[#B45309]" : "text-[#475569]"
                    }`}
                    aria-hidden="true"
                  />
                  <span>Có bẫy ETS</span>
                  <span className="font-mono text-[11px] tabular-nums">
                    ({trapsCount})
                  </span>
                </button>

                <div className="inline-flex items-center rounded-lg border border-[#E2E8F0] bg-white p-0.5 gap-0.5">
                  <span className="px-2 text-[11px] font-medium text-[#475569] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#475569]" aria-hidden="true" />
                    <span className="hidden sm:inline">Thời lượng:</span>
                  </span>
                  {(
                    [
                      { id: "all", label: "Tất cả" },
                      { id: "short", label: "< 10 phút" },
                      { id: "deep", label: "≥ 10 phút" },
                    ] as const
                  ).map((item) => {
                    const active = durationFilter === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setDurationFilter(item.id)}
                        className={`min-h-[38px] sm:min-h-[32px] px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                          active
                            ? "bg-[#F1F5F9] text-[#0F172A] font-semibold"
                            : "text-[#475569] hover:text-[#0F172A]"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="min-h-[44px] sm:min-h-[38px] inline-flex items-center gap-1.5 bg-white border border-[#8190A6] rounded-lg px-2.5 py-1 text-[12px] text-[#475569]">
                  <ArrowUpDown
                    className="w-3.5 h-3.5 text-[#475569]"
                    aria-hidden="true"
                  />
                  <label htmlFor="sort-select" className="sr-only">
                    Sắp xếp theo
                  </label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-transparent text-[#0F172A] font-medium focus:outline-hidden cursor-pointer min-h-[32px]"
                  >
                    <option value="default">Thứ tự chuẩn ETS</option>
                    <option value="time_asc">Thời lượng: Ngắn → Dài</option>
                    <option value="time_desc">Thời lượng: Dài → Ngắn</option>
                    <option value="traps_desc">Nhiều bẫy ETS nhất</option>
                    <option value="tricks_desc">Nhiều mẹo 5s nhất</option>
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="min-h-[44px] sm:min-h-[38px] inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                    title="Đặt lại toàn bộ bộ lọc"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Đặt lại</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Lesson Cards Grid */}
          {filteredLessons.length === 0 ? (
            <div className="p-10 text-center rounded-xl bg-white border border-[#E2E8F0] space-y-3">
              <BookOpen
                className="w-10 h-10 text-[#8190A6] mx-auto"
                aria-hidden="true"
              />
              <h2 className="text-[16px] font-bold text-[#0F172A]">
                Không tìm thấy chủ điểm phù hợp
              </h2>
              <p className="text-[13px] text-[#475569] max-w-md mx-auto">
                Không có bài học nào khớp với điều kiện tìm kiếm hoặc bộ lọc hiện tại của bạn.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg text-[13px] font-semibold text-[#0F172A] bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>Xóa bộ lọc để xem tất cả 16 chủ điểm</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLessons.map((lesson) => {
                const selfPracticeDone = Object.keys(
                  localProgressStore[lesson.tagCode]?.solved ?? {}
                ).length;

                return (
                  <LessonCard
                    key={lesson.tagCode}
                    lesson={lesson}
                    selfPracticeDone={selfPracticeDone}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
