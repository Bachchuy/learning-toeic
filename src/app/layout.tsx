import { Suspense } from "react";
import type { Metadata } from "next";
import { Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import { AppNav } from "@/components/layout/app-nav";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TOEIC Platform",
  description: "Hệ thống luyện thi TOEIC thông minh với FSRS và Adaptive Rolling Mastery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} ${jetbrainsMono.variable} h-screen overflow-hidden antialiased`}
    >
      <body className="h-screen overflow-hidden flex flex-col bg-[var(--color-bg-page)] text-[var(--color-text-primary)] font-sans">
        <AppNav>
          <Suspense fallback={<div className="flex-1 w-full min-h-[400px] flex items-center justify-center p-8 text-sm text-slate-400">Đang tải dữ liệu...</div>}>
            {children}
          </Suspense>
        </AppNav>
      </body>
    </html>
  );
}
