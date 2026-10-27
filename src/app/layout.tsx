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
  description: "Hệ thống luyện thi TOEIC thích ứng với phương pháp ghi nhớ ngắt quãng khoa học",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="min-h-dvh flex flex-col bg-[var(--color-bg-page)] text-[var(--color-text-primary)] font-sans">
        <AppNav>
          <Suspense
            fallback={
              <div className="flex-1 w-full min-h-[400px] flex flex-col items-center justify-center p-8 text-sm text-[var(--color-text-secondary)] gap-3">
                <div className="w-6 h-6 border-2 border-[var(--color-primary-default)] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                <span>Đang tải nội dung...</span>
              </div>
            }
          >
            {children}
          </Suspense>
        </AppNav>
      </body>
    </html>
  );
}
