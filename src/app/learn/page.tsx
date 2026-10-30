"use client";

import { useState, useMemo } from "react";
import { getAllGrammarLessons } from "@/core/grammarLessons";
import { LessonCard } from "@/features/learn/components/lesson-card";
import { Search, BookOpen, Sparkles, Filter } from "lucide-react";

export default function LearnIndexPage() {
  const allLessons = useMemo(() => getAllGrammarLessons(), []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "Tất cả (16)" },
    { id: "verbs", label: "Động từ & Thì" },
    { id: "words_phrases", label: "Từ loại & Vị trí" },
    { id: "clauses", label: "Mệnh đề & Câu phức" },
    { id: "structures", label: "Cấu trúc & Liên kết" },
  ];

  const filteredLessons = useMemo(() => {
    return allLessons.filter((lesson) => {
      const matchCategory =
        selectedCategory === "all" || lesson.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        lesson.titleVi.toLowerCase().includes(q) ||
        lesson.tagCode.toLowerCase().includes(q) ||
        lesson.taglineVi.toLowerCase().includes(q) ||
        lesson.coreRule.definition.toLowerCase().includes(q);

      return matchCategory && matchQuery;
    });
  }, [allLessons, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 pt-2 pb-16 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#475569] mb-2">
          Hệ thống lý thuyết & Bí kíp ETS
        </div>
        <h1 className="text-[26px] sm:text-[32px] font-bold tracking-tight text-[#0F172A] leading-tight">
          Góc học lý thuyết 16 chủ điểm TOEIC
        </h1>
        <p className="text-[14px] sm:text-[15px] text-[#475569] mt-2 max-w-2xl leading-relaxed">
          Nắm chắc bản chất ngữ pháp, nhận diện dấu hiệu 5 giây và phòng tránh các bẫy đề thi kinh điển trước khi bắt đầu luyện tập.
        </p>
      </div>

      {/* Pedagogical Principle Callout */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-start gap-3.5">
        <span className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </span>
        <div className="space-y-1 text-[13px] text-[#1E40AF]">
          <div className="font-bold text-[14px]">
            Học trước — Luyện sau: Phương pháp tiếp thu có mục đích
          </div>
          <p className="leading-relaxed text-[#1E40AF]/90">
            Làm bài tập trắc nghiệm khi chưa có mô hình nhận thức (Mental Model) sẽ biến việc luyện thi thành &ldquo;đoán mò&rdquo;. Hãy dành 5 phút đọc bản chất chủ điểm và các bẫy ETS dưới đây trước khi bấm làm bài!
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8190A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm chủ điểm (ví dụ: thì động từ, bị động, từ loại, tenses...)"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#8190A6] bg-white text-[14px] text-[#0F172A] placeholder:text-[#8190A6] focus:outline-hidden focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
            />
          </div>

          <div className="text-[12px] font-mono text-[#475569] shrink-0 sm:text-right">
            Hiển thị <span className="font-bold text-[#0F172A]">{filteredLessons.length}</span>/16 chủ điểm
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[13px]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#475569] mr-1 flex items-center gap-1 shrink-0">
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
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-[#0F172A] text-white shadow-xs"
                    : "bg-white text-[#475569] border border-[#E2E8F0] hover:bg-[#F8FAFC]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lesson Cards Grid */}
      {filteredLessons.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-[#E2E8F0] space-y-3">
          <BookOpen className="w-10 h-10 text-[#8190A6] mx-auto" />
          <h2 className="text-[16px] font-bold text-[#0F172A]">
            Không tìm thấy chủ điểm phù hợp
          </h2>
          <p className="text-[13px] text-[#475569]">
            Hãy thử tìm bằng từ khóa khác hoặc bấm chọn tab &ldquo;Tất cả&rdquo;.
          </p>
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
