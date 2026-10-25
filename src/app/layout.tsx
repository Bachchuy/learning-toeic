import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TOEIC AI Platform",
  description: "Hệ thống luyện thi TOEIC thông minh với FSRS và Wilson Score",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#0F172A]">
        {children}
      </body>
    </html>
  );
}
