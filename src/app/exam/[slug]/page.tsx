import { notFound } from "next/navigation";
import { getReadingExamAction } from "@/features/exam/actions";
import { ReadingExamSimulator } from "@/features/exam/components/reading-exam-simulator";

export const dynamic = "force-dynamic";

interface ExamDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ExamDetailPageProps) {
  const { slug } = await params;
  const exam = await getReadingExamAction(slug);
  if (!exam) {
    return { title: "Đề thi thử TOEIC Reading | TOEIC AI" };
  }

  return {
    title: `${exam.title} (75 phút / 100 câu) | TOEIC AI`,
    description: `Thi thử trực tuyến trọn vẹn 100 câu đọc TOEIC Part 5, 6, 7 theo chuẩn khảo thí quốc tế ETS.`,
  };
}

export default async function ExamDetailPage({ params }: ExamDetailPageProps) {
  const { slug } = await params;
  const examData = await getReadingExamAction(slug);

  if (!examData) {
    notFound();
  }

  return <ReadingExamSimulator examData={examData} />;
}
