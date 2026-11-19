import { cache } from "react";
import { notFound } from "next/navigation";
import { getReadingPassageAction } from "@/features/reading/actions";
import { Part6View } from "@/features/reading/components/part6-view";
import { Part7View } from "@/features/reading/components/part7-view";

export const dynamic = "force-dynamic";

const getCachedReadingPassage = cache(async (id: string) =>
  getReadingPassageAction(id)
);

interface ReadingPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ReadingPageProps) {
  const { id } = await params;
  const passage = await getCachedReadingPassage(id);
  if (!passage) {
    return { title: "Bài đọc hiểu" };
  }

  return {
    title: `Part ${passage.part}: ${passage.title}`,
    description: `Luyện tập đọc hiểu TOEIC Part ${passage.part} theo chuẩn đề thi quốc tế ETS`,
  };
}

export default async function ReadingPassagePage({ params }: ReadingPageProps) {
  const { id } = await params;
  const passage = await getCachedReadingPassage(id);

  if (!passage) {
    notFound();
  }

  if (passage.part === 6) {
    return <Part6View passage={passage} />;
  }

  return <Part7View passage={passage} />;
}
