import Image from "next/image";
import Link from "next/link";

export type BrandLogoVariant = "horizontal" | "vertical" | "icon" | "wordmark";
export type BrandLogoSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface BrandLogoProps {
  /**
   * Kiểu hiển thị logo:
   * - 'horizontal': Icon + Cụm chữ bên cạnh (dùng cho thanh bên desktop, thanh điều hướng)
   * - 'vertical': Icon ở trên, Cụm chữ ở dưới (dùng cho trang Đăng nhập / Chào mừng)
   * - 'icon': Chỉ biểu tượng Sách + Trái tim
   * - 'wordmark': Chỉ cụm chữ "TÔI ❤ EM ÍC - HỌC TOEIC DỄ DÀNG"
   */
  variant?: BrandLogoVariant;
  /**
   * Kích thước tương ứng
   */
  size?: BrandLogoSize;
  /**
   * Nếu có href, bọc logo trong thẻ <Link>
   */
  href?: string;
  /**
   * Tải ưu tiên (mặc định true cho logo ở đầu trang / navbar)
   */
  priority?: boolean;
  className?: string;
}

// Kích thước chuẩn tương ứng với tỉ lệ gốc của từng tài nguyên
const SIZE_DIMENSIONS: Record<
  BrandLogoVariant,
  Record<BrandLogoSize, { width: number; height: number }>
> = {
  // Tỉ lệ gốc: 718 x 200 (aspect ratio: 3.59)
  horizontal: {
    xs: { width: 86, height: 24 },
    sm: { width: 115, height: 32 },
    md: { width: 144, height: 40 },
    lg: { width: 187, height: 52 },
    xl: { width: 230, height: 64 },
  },
  // Tỉ lệ gốc: 320 x 309 (aspect ratio: 1.036)
  vertical: {
    xs: { width: 44, height: 42 },
    sm: { width: 62, height: 60 },
    md: { width: 93, height: 90 },
    lg: { width: 135, height: 130 },
    xl: { width: 176, height: 170 },
  },
  // Tỉ lệ gốc: 332 x 238 (aspect ratio: 1.395)
  icon: {
    xs: { width: 28, height: 20 },
    sm: { width: 39, height: 28 },
    md: { width: 50, height: 36 },
    lg: { width: 67, height: 48 },
    xl: { width: 89, height: 64 },
  },
  // Tỉ lệ gốc: 457 x 168 (aspect ratio: 2.72)
  wordmark: {
    xs: { width: 65, height: 24 },
    sm: { width: 87, height: 32 },
    md: { width: 109, height: 40 },
    lg: { width: 141, height: 52 },
    xl: { width: 174, height: 64 },
  },
};

const IMAGE_SOURCES: Record<BrandLogoVariant, string> = {
  horizontal: "/brand/logo-horizontal.png",
  vertical: "/brand/logo-vertical.png",
  icon: "/brand/logo-icon.png",
  wordmark: "/brand/logo-wordmark.png",
};

export function BrandLogo({
  variant = "horizontal",
  size = "md",
  href,
  priority = true,
  className = "",
}: BrandLogoProps) {
  const { width, height } = SIZE_DIMENSIONS[variant][size];
  const src = IMAGE_SOURCES[variant];

  const content = (
    <div
      className={`inline-flex items-center justify-center select-none ${className}`}
      role="img"
      aria-label="Tôi Em Íc — Học TOEIC Dễ Dàng"
    >
      <Image
        src={src}
        alt="Tôi Em Íc — Học TOEIC Dễ Dàng"
        width={width}
        height={height}
        priority={priority}
        className="w-auto h-auto object-contain"
        sizes={`${width}px`}
      />
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus-visible:outline-2 focus-visible:outline-[var(--color-primary-default)] rounded-md transition-opacity hover:opacity-90"
        aria-label="Về trang chủ Tôi Em Íc"
      >
        {content}
      </Link>
    );
  }

  return content;
}
