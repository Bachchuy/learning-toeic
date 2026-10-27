"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root Error Boundary cấp toàn cục (Global Error Boundary) theo chuẩn Next.js App Router.
 * Bắt các lỗi xảy ra ở mức Root Layout hoặc các lỗi không được xử lý ở error.tsx.
 * Bắt buộc phải render thẻ <html> và <body> riêng.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[Global Root Layout Error Caught]:", error);
  }, [error]);

  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E2E8F0] shadow-sm p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-600 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">
              Sự cố giao diện toàn cục
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              Đã xảy ra lỗi nghiêm trọng
            </h1>
            <p className="text-sm text-[#475569] leading-relaxed">
              Dữ liệu hoặc khung hiển thị vừa gặp sự cố nhỏ. Vui lòng bấm thử tải lại hoặc quay về trang chủ.
            </p>
          </div>

          {error.digest && (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left">
              <span className="text-[10px] font-mono text-slate-500 block">Mã truy vết hệ thống:</span>
              <code className="text-xs font-mono font-bold text-slate-700">{error.digest}</code>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto px-6 h-11 rounded-xl text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Thử tải lại</span>
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto px-5 h-11 rounded-xl text-xs font-semibold border border-[#8190A6] text-[#0F172A] hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-slate-600" />
              <span>Về trang chủ</span>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
