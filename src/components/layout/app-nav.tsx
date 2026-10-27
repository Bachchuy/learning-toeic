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
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
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

  // Ẩn Navigation hoàn toàn ở màn hình Focus làm bài: /practice/[id] (trừ /practice/new), /review, và màn hình Auth (/login)
  const isFocusScreen =
    (pathname.startsWith("/practice/") && pathname !== "/practice/new") ||
    pathname === "/review" ||
    pathname === "/login";

  if (isFocusScreen) {
    return (
      <main id="main-content" className="min-h-dvh w-full scrollbar-gutter-stable bg-[var(--color-bg-page)]">
        {children}
      </main>
    );
  }

  return (
    <div className="min-h-dvh w-full flex flex-col md:flex-row bg-[var(--color-bg-page)]">
      {/* ========================================================
          Desktop Left Sidebar (240px) - chỉ hiện trên màn hình md+ (≥768px/1024px)
          Sticky theo viewport h-dvh, không giật màn hình
          ======================================================== */}
      <aside
        aria-label="Điều hướng chính"
        className="hidden md:flex flex-col w-60 border-r border-[#E2E8F0] bg-white p-5 sticky top-0 h-dvh shrink-0 select-none justify-between overflow-y-auto"
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-2.5 mb-8 px-2">
            <div className="w-8 h-8 rounded-[6px] bg-[var(--color-primary-default)] flex items-center justify-center text-white font-bold text-sm font-mono shrink-0">
              T
            </div>
            <div>
              <div className="font-bold text-[15px] tracking-tight text-[var(--color-text-primary)] leading-none">
                TOEIC
              </div>
              <div className="text-[10px] text-[var(--color-text-secondary)] tracking-[0.04em] uppercase mt-0.5">
                Luyện thi thích ứng
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                    active
                      ? "bg-[var(--color-primary-subtle)] text-[var(--color-primary-default)] font-semibold"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {/* Active left-bar */}
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--color-primary-default)] rounded-r-full"
                      aria-hidden="true"
                    />
                  )}
                  {item.icon(active)}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom App Info */}
        <div className="pt-4 border-t border-[#E2E8F0] px-2 text-xs text-[#475569] flex items-center justify-between shrink-0">
          <span className="font-medium text-slate-500">Học tập thông minh</span>
          <span className="text-[11px] text-slate-400">ETS 2026</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 min-h-dvh scrollbar-gutter-stable w-full px-4 py-6 md:px-8 md:py-8 pb-28 md:pb-12">
        <div className="max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* ========================================================
          Mobile Bottom Navigation Bar (56px + Safe Area) - chỉ hiện trên mobile (<768px)
          Vùng chạm chuẩn ≥44px, hỗ trợ iPhone home indicator
          ======================================================== */}
      <nav
        aria-label="Điều hướng di động"
        className="md:hidden fixed bottom-0 left-0 right-0 h-[calc(3.5rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] bg-white border-t border-[#E2E8F0] flex items-center justify-around z-40 px-2 shadow-sm"
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
              aria-current={active ? "page" : undefined}
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
