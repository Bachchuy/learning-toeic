export default function VocabLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải sổ từ vựng"
      className="space-y-6 pt-2 pb-16 animate-in fade-in duration-150"
    >
      <span className="sr-only">Đang tải sổ từ vựng...</span>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div className="space-y-1">
          <div className="h-8 w-48 bg-[#E2E8F0] rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-[#F1F5F9] rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-28 bg-[#F1F5F9] rounded-xl animate-pulse" />
          <div className="h-10 w-36 bg-[#E2E8F0] rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Search & Tabs Toolbar */}
      <div className="space-y-3">
        <div className="h-11 w-full bg-white border border-[#8190A6]/40 rounded-xl animate-pulse" />
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-24 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg animate-pulse shrink-0" />
          ))}
        </div>
      </div>

      {/* Vocab Cards List */}
      <div className="space-y-3 pt-2">
        {[1, 2, 3, 4, 5, 6].map((j) => (
          <div
            key={j}
            className="p-4 rounded-xl border border-[#E2E8F0] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="h-5 w-32 bg-[#E2E8F0] rounded animate-pulse" />
                <div className="h-4 w-12 bg-[#F1F5F9] rounded-full animate-pulse" />
                <div className="h-4 w-20 bg-[#F1F5F9] rounded animate-pulse" />
              </div>
              <div className="h-4 w-3/4 bg-[#F8FAFC] rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-8 w-16 bg-[#F1F5F9] rounded-lg animate-pulse" />
              <div className="h-8 w-8 bg-[#F1F5F9] rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
