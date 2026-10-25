"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: "Luyện tập",
    href: "/",
    icon: (active) => (
      <svg
        className={`w-5 h-5 ${active ? "text-[#2563EB]" : "text-[#475569]"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={active ? 2.5 : 2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
  {
    name: "Từ vựng",
    href: "/vocab",
    icon: (active) => (
      <svg
        className={`w-5 h-5 ${active ? "text-[#2563EB]" : "text-[#475569]"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={active ? 2.5 : 2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    name: "Thống kê",
    href: "/stats",
    icon: (active) => (
      <svg
        className={`w-5 h-5 ${active ? "text-[#2563EB]" : "text-[#475569]"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={active ? 2.5 : 2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    name: "Tôi",
    href: "/profile",
    icon: (active) => (
      <svg
        className={`w-5 h-5 ${active ? "text-[#2563EB]" : "text-[#475569]"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={active ? 2.5 : 2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
];

export function AppNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Ẩn Navigation hoàn toàn ở màn hình Focus: /practice/[id] và /review (§5.5)
  const isFocusScreen =
    pathname.startsWith("/practice/") || pathname === "/review";

  if (isFocusScreen) {
    return <main className="flex-1 w-full">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ========================================================
          Desktop Left Sidebar (240px) - chỉ hiện trên màn hình md+ (≥768px/1024px)
          ======================================================== */}
      <aside
        aria-label="Điều hướng chính"
        className="hidden md:flex flex-col w-60 border-r border-[#E2E8F0] bg-white p-5 sticky top-0 h-screen select-none"
      >
        {/* Brand Header */}
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-bold text-sm">
            T
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-[#0F172A]">
              TOEIC AI
            </div>
            <div className="text-[11px] font-mono text-[#475569]">
              Swiss LearningGrid
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#EFF6FF] text-[#2563EB] font-semibold"
                    : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                }`}
              >
                {item.icon(active)}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile / Quick Info */}
        <div className="pt-4 border-t border-[#E2E8F0] px-2 text-xs text-[#475569] flex items-center justify-between">
          <span className="font-mono">v0.1.0 (MVP)</span>
          <span className="inline-block w-2 h-2 rounded-full bg-[#047857]" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8 pb-20 md:pb-8">
        {children}
      </main>

      {/* ========================================================
          Mobile Bottom Navigation Bar (56px) - chỉ hiện trên mobile (<768px)
          Vùng chạm chuẩn ≥44px, cố định đáy màn hình (Sticky Bottom)
          ======================================================== */}
      <nav
        aria-label="Điều hướng di động"
        className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-[#E2E8F0] flex items-center justify-around z-40 px-2"
      >
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[64px] h-full py-1 text-[11px] font-medium transition-colors ${
                active ? "text-[#2563EB] font-semibold" : "text-[#475569]"
              }`}
            >
              <div className="flex items-center justify-center h-6">
                {item.icon(active)}
              </div>
              <span className="mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
