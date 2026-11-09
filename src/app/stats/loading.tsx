export default function StatsLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải thống kê"
      className="max-w-5xl mx-auto space-y-8 pt-2 pb-16 animate-in fade-in duration-150"
    >
      <span className="sr-only">Đang tải thống kê học tập...</span>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div className="h-8 w-52 bg-[#E2E8F0] rounded-lg animate-pulse" />
        <div className="h-11 w-44 bg-[#E2E8F0] rounded-xl animate-pulse" />
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-[#E2E8F0] bg-white space-y-2 shadow-xs"
          >
            <div className="h-4 w-20 bg-[#F1F5F9] rounded animate-pulse" />
            <div className="h-8 w-24 bg-[#E2E8F0] rounded-lg animate-pulse" />
            <div className="h-3 w-28 bg-[#F1F5F9] rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* 14-day Activity Chart Card */}
      <div className="p-6 rounded-2xl border border-[#E2E8F0] bg-white space-y-4 shadow-xs">
        <div className="flex justify-between items-center">
          <div className="h-5 w-44 bg-[#E2E8F0] rounded animate-pulse" />
          <div className="h-4 w-24 bg-[#F1F5F9] rounded animate-pulse" />
        </div>
        <div className="h-40 w-full bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] animate-pulse flex items-end justify-between p-4 gap-2">
          {[40, 60, 20, 80, 50, 90, 70, 30, 45, 60, 85, 30, 75, 55].map((h, idx) => (
            <div
              key={idx}
              className="w-full bg-[#E2E8F0] rounded-t"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* Mastery List */}
      <div className="space-y-4">
        <div className="h-6 w-56 bg-[#E2E8F0] rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((j) => (
            <div
              key={j}
              className="p-4 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-2 flex-1">
                <div className="h-4 w-40 bg-[#E2E8F0] rounded animate-pulse" />
                <div className="h-2 w-full bg-[#F1F5F9] rounded-full animate-pulse" />
              </div>
              <div className="h-6 w-16 bg-[#F1F5F9] rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
