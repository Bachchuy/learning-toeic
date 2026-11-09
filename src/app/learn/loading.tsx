export default function LearnLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải danh sách bài học"
      className="space-y-6 pt-2 pb-16 animate-in fade-in duration-150"
    >
      <span className="sr-only">Đang tải danh sách bài học...</span>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-[#E2E8F0] pb-4">
        <div className="h-8 w-44 bg-[#E2E8F0] rounded-lg animate-pulse" />
        <div className="h-4 w-32 bg-[#F1F5F9] rounded animate-pulse" />
      </div>

      {/* Search & Categories Toolbar */}
      <div className="space-y-3.5">
        <div className="h-11 w-full bg-white border border-[#8190A6]/40 rounded-xl animate-pulse" />
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-24 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg animate-pulse shrink-0" />
          ))}
        </div>
      </div>

      {/* Grid of Lesson Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
        {[1, 2, 3, 4, 5, 6].map((j) => (
          <div
            key={j}
            className="p-5 rounded-2xl border border-[#E2E8F0] bg-white space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 bg-[#F1F5F9] rounded-full animate-pulse" />
              <div className="h-4 w-16 bg-[#F1F5F9] rounded animate-pulse" />
            </div>
            <div className="h-6 w-3/4 bg-[#E2E8F0] rounded-lg animate-pulse" />
            <div className="space-y-1.5 pt-1">
              <div className="h-3 w-full bg-[#F8FAFC] rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-[#F8FAFC] rounded animate-pulse" />
            </div>
            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
              <div className="h-4 w-20 bg-[#F1F5F9] rounded animate-pulse" />
              <div className="h-4 w-4 rounded-full bg-[#F1F5F9] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
