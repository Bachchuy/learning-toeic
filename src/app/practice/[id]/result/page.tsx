import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionReviewAction } from "@/features/practice/actions";
import { calculateAccuracy } from "@/core/math";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PracticeResultPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/practice/${id}/result`);
  }

  const { data: review, error } = await getSessionReviewAction(id);

  if (error || !review) {
    notFound();
  }

  const accuracy = calculateAccuracy(
    review.correct_count,
    review.total_questions
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* 1. Score Card Header */}
      <Card className="text-center p-6 sm:p-8 bg-white border border-[#E2E8F0]">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] font-mono mb-3">
          Tổng kết phiên luyện tập
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
          Kết quả bài làm
        </h1>
        <p className="text-sm text-[#475569] mt-1">
          Phiên luyện Part 5 gồm {review.total_questions} câu hỏi ngữ pháp
        </p>

        {/* Số điểm to mono */}
        <div className="my-6">
          <div className="text-5xl sm:text-6xl font-bold font-mono text-[#0F172A]">
            {review.correct_count}{" "}
            <span className="text-2xl sm:text-3xl text-[#475569] font-normal">
              / {review.total_questions}
            </span>
          </div>
          <div className="text-sm font-semibold font-mono text-[#2563EB] mt-2">
            Độ chính xác: {accuracy}%
          </div>
        </div>

        {/* Bất biến: Duy nhất 1 nút Primary */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/practice/new" className="w-full sm:w-auto">
            <Button variant="primary" size="cta" className="w-full sm:w-48">
              Luyện phiên mới →
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="secondary" size="default" className="w-full sm:w-40">
              Về Trang chủ
            </Button>
          </Link>
        </div>
      </Card>

      {/* 2. Danh sách câu hỏi chi tiết */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#0F172A] flex items-center justify-between">
          <span>Chi tiết từng câu hỏi</span>
          <span className="text-xs font-mono font-normal text-[#475569]">
            {review.attempts?.length || 0} câu đã làm
          </span>
        </h2>

        <div className="space-y-4">
          {review.attempts?.map((item) => {
            const optionLabels = ["A", "B", "C", "D"];
            const selectedLabel =
              item.selected_index !== null
                ? optionLabels[item.selected_index]
                : "Chưa chọn";
            const correctLabel = optionLabels[item.correct_index];

            return (
              <Card key={item.question_id} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0F172A]">
                      Câu {item.order_index}
                    </span>
                    <span className="text-xs text-[#475569] font-mono">
                      • {item.tag_name_vi}
                    </span>
                  </div>

                  {item.is_correct ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#047857] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0] font-mono">
                      [✓] Đúng
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#BE123C] bg-[#FFF1F2] px-2.5 py-0.5 rounded-full border border-[#FECDD3] font-mono">
                      [✗] Sai
                    </span>
                  )}
                </div>

                <p className="text-sm font-medium text-[#0F172A] leading-relaxed">
                  {item.stem}
                </p>

                <div className="flex items-center gap-4 text-xs font-mono pt-1">
                  <div>
                    Bạn chọn:{" "}
                    <span
                      className={`font-bold ${
                        item.is_correct ? "text-[#047857]" : "text-[#BE123C]"
                      }`}
                    >
                      {selectedLabel}
                    </span>
                  </div>
                  <div>
                    Đáp án đúng:{" "}
                    <span className="font-bold text-[#047857]">
                      {correctLabel}
                    </span>
                  </div>
                </div>

                {/* Quy tắc tóm tắt */}
                {item.explanation?.rule_vi && (
                  <div className="p-3 bg-[#F8FAFC] border-l-2 border-[#2563EB] rounded-r text-xs text-[#475569] mt-2">
                    <span className="font-semibold text-[#0F172A]">Quy tắc: </span>
                    {item.explanation.rule_vi}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
