import type { Metadata } from "next";
import { getGrammarLessonSummaries } from "@/core/grammarLessons";
import { getLearningRoadmapAction } from "@/features/stats/actions";
import { LearnIndexView } from "@/features/learn/components/learn-index-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Học Lý Thuyết Ngữ Pháp TOEIC — Lộ Trình 4 Chặng",
  description:
    "Lộ trình học ngữ pháp TOEIC Part 5 theo 4 chặng chia nhỏ từng phần kèm bài tập áp dụng ngay, công thức giải nhanh và bẫy ETS.",
};

export default async function LearnIndexPage({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string }>;
}) {
  const [lessons, roadmap, resolvedSearch] = await Promise.all([
    Promise.resolve(getGrammarLessonSummaries()),
    getLearningRoadmapAction(),
    searchParams ?? Promise.resolve<{ view?: string }>({}),
  ]);

  const initialView = resolvedSearch?.view === "all" ? "all" : "roadmap";

  return (
    <LearnIndexView
      lessons={lessons}
      roadmap={roadmap}
      initialView={initialView}
    />
  );
}
