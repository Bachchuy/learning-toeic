import type { Metadata } from "next";
import { getGrammarLessonSummaries } from "@/core/grammarLessons";
import { LearnIndexView } from "@/features/learn/components/learn-index-view";

export const metadata: Metadata = {
  title: "Học Lý Thuyết Ngữ Pháp TOEIC — 16 Chủ Điểm",
  description:
    "Tổng hợp 16 chủ điểm ngữ pháp trọng tâm TOEIC Part 5 kèm công thức giải nhanh 5 giây, bẫy ETS thường gặp và ví dụ song ngữ.",
};

export default function LearnIndexPage() {
  const lessons = getGrammarLessonSummaries();
  return <LearnIndexView lessons={lessons} />;
}
