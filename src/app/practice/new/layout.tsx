import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Khởi tạo phiên luyện tập",
  description:
    "Chọn chủ điểm ngữ pháp Part 5 hoặc bài đọc hiểu Part 6 & Part 7 để bắt đầu phiên luyện tập thích ứng.",
};

export default function NewPracticeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
