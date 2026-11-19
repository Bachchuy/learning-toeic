import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Chính sách bảo mật",
  description:
    "Chính sách bảo vệ dữ liệu học tập, kiểm soát truy cập Row Level Security (RLS), quyền xuất JSON và xóa tài khoản vĩnh viễn trên Tôi Yêu Em Íc.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-[#F8FAFC] py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <BrandLogo variant="horizontal" size="sm" href="/" />
          <div className="flex items-center gap-3 text-xs font-medium">
            <Link
              href="/terms"
              className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline"
            >
              Điều khoản sử dụng
            </Link>
            <Link
              href="/login"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Quay lại</span>
            </Link>
          </div>
        </div>

        <article className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-6">
          <header className="space-y-2 border-b border-[#E2E8F0] pb-4">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2563EB]">
              BẢO MẬT &amp; QUYỀN SỞ HỮU DỮ LIỆU
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
              Chính sách bảo mật — Tôi Yêu Em Íc
            </h1>
            <p className="text-xs font-mono text-[#475569]">
              Cập nhật lần cuối: 19/11/2026
            </p>
          </header>

          <section className="space-y-2 text-sm text-[#0F172A] leading-relaxed">
            <h2 className="text-base font-bold text-[#0F172A]">
              1. Dữ liệu chúng tôi lưu trữ
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-[#475569]">
              <li>
                Thông tin tài khoản cơ bản: địa chỉ email, tên hiển thị và điểm
                mục tiêu TOEIC bạn tự khai báo.
              </li>
              <li>
                Dữ liệu học tập: lịch sử phiên luyện tập, bài thi thử, sổ từ
                vựng cá nhân, lịch sử chấm thẻ FSRS và góp ý bạn chủ động gửi.
              </li>
              <li>
                Chúng tôi <strong className="text-[#0F172A]">không</strong> bán,
                cho thuê hoặc chia sẻ dữ liệu học tập cá nhân của bạn cho bên thứ
                ba vì mục đích quảng cáo.
              </li>
            </ul>
          </section>

          <section className="space-y-2 text-sm text-[#0F172A] leading-relaxed">
            <h2 className="text-base font-bold text-[#0F172A]">
              2. Bảo vệ kỹ thuật &amp; phân tách truy cập (RLS)
            </h2>
            <p className="text-[#475569]">
              Mọi bảng dữ liệu người dùng trên PostgreSQL đều bật Row Level
              Security (RLS) bảo đảm mỗi tài khoản chỉ đọc và thao tác được dữ
              liệu thuộc <code className="font-mono text-xs bg-[#F1F5F9] px-1.5 py-0.5 rounded">auth.uid()</code>{" "}
              của chính mình. Phiên đăng nhập được quản lý qua cookie HTTP-only
              của Supabase SSR, và đáp án bài thi luôn được chấm hoàn toàn phía
              máy chủ.
            </p>
          </section>

          <section className="space-y-2 text-sm text-[#0F172A] leading-relaxed">
            <h2 className="text-base font-bold text-[#0F172A]">
              3. Quyền xuất dữ liệu và xóa vĩnh viễn tài khoản
            </h2>
            <p className="text-[#475569]">
              Trong trang{" "}
              <Link href="/profile" className="text-[#2563EB] hover:underline">
                Hồ sơ (/profile)
              </Link>
              , bạn luôn có thể tải về toàn bộ dữ liệu học tập dưới dạng tệp
              JSON chuẩn hoặc yêu cầu xóa tài khoản vĩnh viễn (xóa sạch hồ sơ,
              từ vựng, lịch sử làm bài và tài khoản xác thực ngay lập tức).
            </p>
          </section>

          <footer className="pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs text-[#475569]">
            <span>Tôi Yêu Em Íc — Học TOEIC Dễ Dàng</span>
            <Link
              href="/terms"
              className="font-semibold text-[#2563EB] hover:underline"
            >
              Đọc Điều khoản sử dụng →
            </Link>
          </footer>
        </article>
      </div>
    </div>
  );
}
