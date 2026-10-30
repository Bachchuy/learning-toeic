import { notFound } from "next/navigation";
import {
  getGrammarLessonByCode,
  getAllGrammarLessons,
} from "@/core/grammarLessons";
import { LessonDetailView } from "@/features/learn/components/lesson-detail-view";
import type { Metadata } from "next";

export function generateStaticParams() {
  const lessons = getAllGrammarLessons();
  return lessons.map((l) => ({ tagCode: l.tagCode }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tagCode: string }>;
}): Promise<Metadata> {
  const { tagCode } = await params;
  const lesson = getGrammarLessonByCode(tagCode);
  if (!lesson) {
    return { title: "Không tìm thấy chủ điểm" };
  }
  return {
    title: `${lesson.titleVi} — Học Lý Thuyết TOEIC`,
    description: lesson.taglineVi,
  };
}

export default async function GrammarLessonDetailPage({
  params,
}: {
  params: Promise<{ tagCode: string }>;
}) {
  const { tagCode } = await params;
  const lesson = getGrammarLessonByCode(tagCode);

  if (!lesson) {
    notFound();
  }

  return <LessonDetailView lesson={lesson} />;
}
