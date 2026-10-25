export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#F8FAFC] text-[#0F172A]">
      <div className="w-full max-w-md p-8 bg-white border border-[#E2E8F0] rounded-xl shadow-sm text-center">
        <div className="inline-flex items-center px-3 py-1 mb-4 text-xs font-medium rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
          Milestone 1 • Quality Gates Ready
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] mb-2">
          TOEIC AI Platform
        </h1>
        <p className="text-sm text-[#475569] mb-6">
          Hệ thống luyện thi TOEIC thích ứng với thuật toán Spaced Repetition FSRS và khoảng tin cậy Wilson.
        </p>
        <div className="p-4 bg-[#F1F5F9] rounded-lg text-xs text-left text-[#475569] space-y-1 font-mono">
          <div>✓ TypeScript Strict: ON</div>
          <div>✓ ESLint & Prettier: Configured</div>
          <div>✓ Vitest Pure Logic: Ready</div>
        </div>
      </div>
    </main>
  );
}
