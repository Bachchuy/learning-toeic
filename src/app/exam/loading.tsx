export default function ExamLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải danh sách đề thi"
      className="space-y-6 pt-2 pb-16 animate-in fade-in duration-150"
    >
      <span className="sr-only">Đang tải danh sách đề thi...</span>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-[#E2E8F0] pb-4">
        <div className="h-8 w-56 bg-[#E2E8F0] rounded-lg animate-pulse" />
        <div className="h-4 w-40 bg-[#F1F5F9] rounded animate-pulse" />
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] animate-pulse shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 w-48 bg-[#E2E8F0] rounded animate-pulse" />
          <div className="h-3 w-72 bg-[#F8FAFC] rounded animate-pulse" />
        </div>
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-[#E2E8F0] bg-white space-y-4 shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="h-6 w-48 bg-[#E2E8F0] rounded-lg animate-pulse" />
                <div className="h-4 w-3/4 bg-[#F8FAFC] rounded animate-pulse" />
              </div>
              <div className="h-6 w-16 bg-[#F1F5F9] rounded-full animate-pulse shrink-0" />
            </div>

            <div className="flex items-center gap-4 text-xs pt-2 border-t border-[#E2E8F0]">
              <div className="h-4 w-20 bg-[#F1F5F9] rounded animate-pulse" />
              <div className="h-4 w-20 bg-[#F1F5F9] rounded animate-pulse" />
              <div className="h-4 w-24 bg-[#F1F5F9] rounded animate-pulse" />
            </div>

            <div className="h-10 w-full bg-[#E2E8F0] rounded-xl animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
