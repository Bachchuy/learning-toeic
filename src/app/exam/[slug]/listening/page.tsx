import { cache } from "react";
import { notFound } from "next/navigation";
import { getListeningExamAction } from "@/features/exam/actions";
import { ListeningExamSimulator } from "@/features/exam/components/listening-exam-simulator";

export const dynamic = "force-dynamic";

const getCachedListeningExam = cache(async (slug: string) =>
  getListeningExamAction(slug)
);

interface ListeningExamPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ListeningExamPageProps) {
  const { slug } = await params;
  const exam = await getCachedListeningExam(slug);
  if (!exam) {
    return { title: "Đề thi thử TOEIC Listening" };
  }

  return {
    title: `${exam.title} — Listening (45 phút / ${exam.totalQuestions} câu)`,
    description:
      "Phòng thi thử TOEIC Listening Part 1–4 trong 45 phút với bộ phát audio và bảng điểm quy đổi 5–495.",
  };
}

export default async function ListeningExamPage({
  params,
}: ListeningExamPageProps) {
  const { slug } = await params;
  const examData = await getCachedListeningExam(slug);

  if (!examData) {
    notFound();
  }

  return <ListeningExamSimulator examData={examData} />;
}
