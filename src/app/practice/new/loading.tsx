export default function NewPracticeLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải cấu hình luyện tập"
      className="max-w-2xl mx-auto space-y-6 pt-4 pb-12 animate-in fade-in duration-150"
    >
      <span className="sr-only">Đang tải cấu hình luyện tập...</span>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-[#E2E8F0] pb-4">
        <div className="h-8 w-48 bg-[#E2E8F0] rounded-lg animate-pulse" />
        <div className="h-4 w-28 bg-[#F1F5F9] rounded animate-pulse" />
      </div>

      {/* Part selector */}
      <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 rounded-lg bg-white/70 animate-pulse" />
        ))}
      </div>

      {/* Config Card */}
      <div className="p-6 rounded-2xl border border-[#E2E8F0] bg-white space-y-6 shadow-xs">
        <div className="space-y-2">
          <div className="h-5 w-44 bg-[#E2E8F0] rounded animate-pulse" />
          <div className="h-3 w-72 bg-[#F1F5F9] rounded animate-pulse" />
        </div>

        {/* 5 / 10 / 20 pills */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-11 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] animate-pulse" />
          ))}
        </div>

        {/* Topics list skeleton */}
        <div className="space-y-2 pt-2">
          <div className="h-4 w-32 bg-[#F1F5F9] rounded animate-pulse" />
          <div className="h-14 w-full bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg animate-pulse" />
          <div className="h-36 w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg animate-pulse" />
        </div>

        <div className="h-12 w-full bg-[#E2E8F0] rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
