import Link from "next/link";
import { Compass, Home, BookOpen } from "lucide-react";

/**
 * Trang 404 tùy chỉnh chuẩn Precision Swiss Design.
 */
export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#F8FAFC]">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E2E8F0] shadow-sm p-6 sm:p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-600 mx-auto flex items-center justify-center">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2563EB]">
            Mã lỗi 404 · Không tìm thấy
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
            Trang không tồn tại
          </h1>
          <p className="text-sm text-[#475569] leading-relaxed">
            Đường dẫn bạn vừa truy cập có thể đã được chuyển đổi hoặc không còn khả dụng trên hệ thống.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 h-11 rounded-xl text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Link>
          <Link
            href="/vocab"
            className="w-full sm:w-auto px-5 h-11 rounded-xl text-xs font-semibold border border-[#8190A6] text-[#0F172A] hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-slate-600" />
            <span>Kho từ vựng</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
