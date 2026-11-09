export default function ProfileLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải hồ sơ"
      className="max-w-2xl mx-auto space-y-6 pt-2 pb-16 animate-in fade-in duration-150"
    >
      <span className="sr-only">Đang tải thông tin hồ sơ...</span>

      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-4">
        <div className="h-8 w-44 bg-[#E2E8F0] rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-[#F1F5F9] rounded animate-pulse mt-2" />
      </div>

      {/* Profile Card */}
      <div className="p-6 rounded-2xl border border-[#E2E8F0] bg-white space-y-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#E2E8F0] animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-40 bg-[#E2E8F0] rounded animate-pulse" />
            <div className="h-4 w-52 bg-[#F1F5F9] rounded animate-pulse" />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-[#E2E8F0]">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-[#F1F5F9] rounded animate-pulse" />
            <div className="h-11 w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="h-4 w-32 bg-[#F1F5F9] rounded animate-pulse" />
            <div className="h-11 w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl animate-pulse" />
          </div>

          <div className="h-11 w-full bg-[#E2E8F0] rounded-xl animate-pulse pt-2" />
        </div>
      </div>

      {/* Export / Danger Area */}
      <div className="p-5 rounded-xl border border-[#E2E8F0] bg-white space-y-3 shadow-xs">
        <div className="h-5 w-36 bg-[#E2E8F0] rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-[#F1F5F9] rounded animate-pulse" />
        <div className="h-10 w-40 bg-[#F1F5F9] rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
