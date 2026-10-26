"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root Error Boundary cho ứng dụng Next.js App Router.
 * Bắt tất cả các ngoại lệ Runtime chưa được xử lý ở client hoặc server components,
 * ngăn chặn hiện tượng sập trắng trang (White Screen of Death).
 */
export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log lỗi hệ thống ra console để tiện giám sát và debug
    console.error("[System Stability Error Caught]:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#F8FAFC]">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E2E8F0] shadow-sm p-6 sm:p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-600 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-600">
            Hệ thống gián đoạn tạm thời
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
            Đã xảy ra lỗi không mong muốn
          </h1>
          <p className="text-sm text-[#475569] leading-relaxed">
            Dữ liệu hoặc kết nối mạng vừa gặp sự cố nhỏ. Phiên học và tiến độ FSRS của bạn đã được lưu an toàn.
          </p>
        </div>

        {error.digest && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left">
            <span className="text-[10px] font-mono text-slate-500 block">Mã truy vết hệ thống:</span>
            <code className="text-xs font-mono font-bold text-slate-700">{error.digest}</code>
          </div>
        )}

        {/* Hành động phục hồi: duy nhất 1 nút Primary */}
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
    </div>
  );
}
