import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng",
  description:
    "Điều khoản sử dụng dịch vụ, tuyên bố nhãn hiệu ETS TOEIC® và nguyên tắc sử dụng điểm tham chiếu trên nền tảng Tôi Yêu Em Íc.",
};

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-[#F8FAFC] py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <BrandLogo variant="horizontal" size="sm" href="/" />
          <div className="flex items-center gap-3 text-xs font-medium">
            <Link
              href="/privacy"
              className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline"
            >
              Chính sách bảo mật
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
              PHÁP LÝ &amp; QUY ƯỚC HỌC TẬP
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
              Điều khoản sử dụng — Tôi Yêu Em Íc
            </h1>
            <p className="text-xs font-mono text-[#475569]">
              Cập nhật lần cuối: 19/11/2026
            </p>
          </header>

          <section className="space-y-2 text-sm text-[#0F172A] leading-relaxed">
            <h2 className="text-base font-bold text-[#0F172A]">
              1. Mục đích nền tảng
            </h2>
            <p className="text-[#475569]">
              <strong className="text-[#0F172A]">Tôi Yêu Em Íc</strong> là nền
              tảng tự học và luyện thi TOEIC thích ứng cá nhân hóa (ngữ pháp
              Part 5, đọc hiểu Part 6/7, thi thử Reading 100 câu và ghi nhớ từ
              vựng ngắt quãng FSRS). Toàn bộ nội dung và bài tập được thiết kế cho
              mục đích học tập cá nhân, phi thương mại hóa đề thi thật.
            </p>
          </section>

          <section className="space-y-2 text-sm text-[#0F172A] leading-relaxed">
            <h2 className="text-base font-bold text-[#0F172A]">
              2. Miễn trừ nhãn hiệu ETS TOEIC® &amp; điểm tham chiếu
            </h2>
            <p className="text-[#475569]">
              TOEIC® là nhãn hiệu đã đăng ký của Educational Testing Service
              (ETS). <strong className="text-[#0F172A]">Tôi Yêu Em Íc</strong> là
              nền tảng luyện thi độc lập, không liên kết, tài trợ hoặc đại diện
              chính thức cho ETS. Thang điểm Reading 5–495 trên phòng thi thử chỉ
              mang tính <strong className="text-[#0F172A]">ước lượng tham chiếu</strong>{" "}
              để theo dõi tiến bộ học tập, không phải bảng điểm chứng chỉ chính
              thức.
            </p>
          </section>

          <section className="space-y-2 text-sm text-[#0F172A] leading-relaxed">
            <h2 className="text-base font-bold text-[#0F172A]">
              3. Tài khoản, dữ liệu và sử dụng hợp lệ
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-[#475569]">
              <li>
                Người học chịu trách nhiệm bảo mật thông tin đăng nhập của mình
                và không dùng công cụ tự động cào dữ liệu ngân hàng câu hỏi, đáp
                án hoặc gây quá tải API hệ thống.
              </li>
              <li>
                Bạn giữ toàn quyền sở hữu dữ liệu học tập cá nhân: có thể xuất
                toàn bộ sang định dạng JSON hoặc xóa vĩnh viễn tài khoản bất kỳ
                lúc nào trong trang{" "}
                <Link href="/profile" className="text-[#2563EB] hover:underline">
                  Hồ sơ (/profile)
                </Link>
                .
              </li>
            </ul>
          </section>

          <footer className="pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs text-[#475569]">
            <span>Tôi Yêu Em Íc — Học TOEIC Dễ Dàng</span>
            <Link
              href="/privacy"
              className="font-semibold text-[#2563EB] hover:underline"
            >
              Đọc Chính sách bảo mật →
            </Link>
          </footer>
        </article>
      </div>
    </div>
  );
}
