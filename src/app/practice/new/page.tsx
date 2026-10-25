"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSessionAction } from "@/features/practice/actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NewPracticePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [totalQuestions, setTotalQuestions] = useState<number>(5);
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    setError(null);
    startTransition(async () => {
      const res = await createSessionAction(null, totalQuestions);

      if (res.error || !res.sessionId) {
        setError(res.error || "Không thể tạo phiên làm bài. Vui lòng thử lại!");
        return;
      }

      router.push(`/practice/${res.sessionId}`);
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pt-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          Khởi tạo phiên luyện tập Part 5
        </h1>
        <p className="text-sm text-[#475569] mt-1">
          Luyện tập thích ứng với các câu hỏi ngữ pháp trọng tâm theo chuẩn đề thi TOEIC.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quy mô phiên làm bài</CardTitle>
          <CardDescription>
            Chọn số lượng câu hỏi phù hợp với quỹ thời gian hiện tại của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Segmented Pill: 5 / 10 / 20 câu (§5.5) */}
          <div className="grid grid-cols-3 gap-3">
            {[5, 10, 20].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setTotalQuestions(num)}
                className={`h-11 rounded-lg font-mono text-sm font-semibold transition-all cursor-pointer border ${
                  totalQuestions === num
                    ? "bg-[#2563EB] text-white border-[#2563EB]"
                    : "bg-white text-[#475569] border-[#8190A6] hover:bg-[#F8FAFC]"
                }`}
              >
                {num} câu
              </button>
            ))}
          </div>

          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs space-y-1.5 text-[#475569]">
            <div className="font-semibold text-[#0F172A] font-mono">
              Quy tắc chọn câu hỏi thích ứng:
            </div>
            <div>• Tự động chọn ngẫu nhiên từ ngân hàng câu hỏi chuẩn Part 5.</div>
            <div>• Loại bỏ các câu bạn đã làm đúng trong 7 ngày gần nhất.</div>
            <div>• Đáp án và giải thích được bảo mật an toàn tại máy chủ.</div>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-[#FFF1F2] border border-[#FECDD3] text-xs font-medium text-[#BE123C] flex items-center gap-2"
            >
              <span className="font-bold">[!]</span>
              <span>{error}</span>
            </div>
          )}

          {/* Bất biến: Duy nhất 1 nút Primary trên màn hình */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="cta"
              className="w-full"
              isLoading={isPending}
              onClick={handleStart}
            >
              Bắt đầu làm bài ngay →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
