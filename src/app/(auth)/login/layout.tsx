import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập & Đăng ký",
  description:
    "Đăng nhập hoặc tạo tài khoản Tôi Yêu Em Íc để bắt đầu lộ trình luyện thi TOEIC thích ứng.",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
