import { getExamListAction } from "@/features/exam/actions";
import { ExamListView } from "@/features/exam/components/exam-list-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Thi Thử TOEIC Reading 100 Câu (Part 5+6+7) | TOEIC AI",
  description:
    "Phòng thi thử trực tuyến 100 câu đọc hiểu TOEIC trong 75 phút chuẩn format ETS 2024. Chấm điểm tự động thang 5–495 điểm.",
};

export default async function ExamPage() {
  const exams = await getExamListAction();

  return <ExamListView exams={exams} />;
}
