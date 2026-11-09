export default function RootLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải trang"
      className="space-y-6 pt-2 pb-16 animate-in fade-in duration-150"
    >
      <span className="sr-only">Đang tải trang...</span>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-[#E2E8F0] rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-[#F1F5F9] rounded animate-pulse" />
        </div>
        <div className="h-6 w-24 bg-[#F1F5F9] rounded animate-pulse" />
      </div>

      {/* Hero / Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-[#E2E8F0] bg-white space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 bg-[#F1F5F9] rounded animate-pulse" />
              <div className="h-6 w-6 rounded-full bg-[#F1F5F9] animate-pulse" />
            </div>
            <div className="h-7 w-28 bg-[#E2E8F0] rounded animate-pulse" />
            <div className="h-3 w-36 bg-[#F1F5F9] rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl border border-[#E2E8F0] bg-white space-y-4 shadow-xs">
            <div className="h-5 w-40 bg-[#E2E8F0] rounded animate-pulse" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-12 w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-6 rounded-2xl border border-[#E2E8F0] bg-white space-y-4 shadow-xs">
            <div className="h-5 w-32 bg-[#E2E8F0] rounded animate-pulse" />
            <div className="h-36 w-full bg-[#F8FAFC] rounded-xl animate-pulse" />
            <div className="h-10 w-full bg-[#E2E8F0] rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
