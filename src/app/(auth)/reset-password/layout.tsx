import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu",
  description:
    "Thiết lập mật khẩu mới cho tài khoản Tôi Yêu Em Íc của bạn.",
};

export default function ResetPasswordLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
