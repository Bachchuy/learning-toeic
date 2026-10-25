"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createSessionAction,
  getPracticeTopicsAction,
  type PracticeTopicInfo,
} from "@/features/practice/actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, BookOpen, Layers } from "lucide-react";

export default function NewPracticePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [totalQuestions, setTotalQuestions] = useState<number>(5);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [topics, setTopics] = useState<PracticeTopicInfo[]>([]);
  const [allAvailableCount, setAllAvailableCount] = useState<number>(0);
  const [isLoadingTopics, setIsLoadingTopics] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTopics() {
      setIsLoadingTopics(true);
      const res = await getPracticeTopicsAction();
      if (res.topics) {
        setTopics(res.topics);
        setAllAvailableCount(res.allAvailableCount);
      }
      setIsLoadingTopics(false);
    }
    loadTopics();
  }, []);

  // Tính số câu thực tế khả dụng cho lựa chọn hiện tại
  const currentAvailable =
    selectedTagId === null
      ? allAvailableCount
      : topics.find((t) => t.tag_id === selectedTagId)?.available_count ?? 0;

  // Xác định số câu sẽ được tạo trong phiên
  const effectiveQuestionCount = Math.min(totalQuestions, currentAvailable);
  const isOutOfQuestions = currentAvailable === 0;
  const isFewerQuestions =
    !isOutOfQuestions && currentAvailable < totalQuestions;

  const handleStart = () => {
    if (isOutOfQuestions) return;

    setError(null);
    startTransition(async () => {
      const res = await createSessionAction(selectedTagId, totalQuestions);

      if (res.error || !res.sessionId) {
        setError(res.error || "Không thể tạo phiên làm bài. Vui lòng thử lại!");
        return;
      }

      router.push(`/practice/${res.sessionId}`);
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-4 pb-12 animate-in fade-in duration-200">
      <div>
        {/* Overline */}
        <div className="text-[11px] font-mono font-bold uppercase tracking-[0.08em] text-[#475569] mb-2">
          Part 5 — Ngữ pháp thích ứng
        </div>
        <h1 className="text-[26px] sm:text-[30px] font-bold tracking-[-0.02em] leading-[1.2] text-[#0F172A]">
          Khởi tạo phiên luyện tập
        </h1>
        <p className="text-[14px] text-[#475569] mt-2 leading-relaxed">
          Tùy chỉnh chủ điểm và số lượng câu hỏi phù hợp với quỹ thời gian học tập của bạn.
        </p>
      </div>

      <Card className="bg-white border border-[#E2E8F0] shadow-sm">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Quy mô phiên làm bài</CardTitle>
          <CardDescription>
            Chọn số lượng câu hỏi mong muốn. Hệ thống tự động lọc các câu bạn đã làm đúng trong 7 ngày qua.
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
                    ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm"
                    : "bg-white text-[#475569] border-[#8190A6] hover:bg-[#F8FAFC]"
                }`}
              >
                {num} câu
              </button>
            ))}
          </div>

          {/* Chọn chủ điểm ngữ pháp (§5.6 M3) */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A]">
              Chủ điểm ngữ pháp
            </label>

            {isLoadingTopics ? (
              <div className="p-6 text-center text-xs font-mono text-[#475569] bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                Đang tải danh sách chủ điểm...
              </div>
            ) : (
              <div className="space-y-2">
                {/* Lựa chọn ngẫu nhiên toàn bộ */}
                <button
                  type="button"
                  onClick={() => setSelectedTagId(null)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedTagId === null
                      ? "border-[#2563EB] bg-[#EFF6FF] text-[#0F172A]"
                      : "border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`p-2 rounded-md ${
                        selectedTagId === null
                          ? "bg-[#2563EB] text-white"
                          : "bg-[#F1F5F9] text-[#475569]"
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold">
                        Tất cả chủ điểm (Ngẫu nhiên thích ứng)
                      </div>
                      <div className="text-xs text-[#475569]">
                        Kết hợp ngẫu nhiên các dạng câu hỏi Part 5
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="font-bold text-[#2563EB]">
                      {allAvailableCount} câu mới
                    </span>
                  </div>
                </button>

                {/* Danh sách 16 chủ điểm */}
                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 border border-[#E2E8F0] rounded-lg p-2 bg-[#F8FAFC]">
                  {topics.map((t) => {
                    const isSelected = selectedTagId === t.tag_id;
                    const isDisabled = t.available_count === 0;

                    return (
                      <button
                        key={t.tag_id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setSelectedTagId(t.tag_id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-md text-left transition-all ${
                          isDisabled
                            ? "opacity-50 cursor-not-allowed bg-[#F1F5F9] text-[#94A3B8]"
                            : isSelected
                            ? "bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] cursor-pointer"
                            : "bg-white hover:bg-[#F1F5F9] border border-transparent text-[#0F172A] cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-[#475569]" />
                          <span className="text-xs font-medium">{t.name_vi}</span>
                        </div>
                        <div className="font-mono text-xs">
                          {isDisabled ? (
                            <span className="text-[#BE123C] text-[11px]">Hết câu</span>
                          ) : (
                            <span className={isSelected ? "font-bold text-[#2563EB]" : "text-[#475569]"}>
                              {t.available_count} câu
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* CẢNH BÁO D-10 BẮT BUỘC: Hết câu hoặc còn ít hơn quy mô chọn */}
          {isOutOfQuestions && (
            <div
              role="alert"
              className="p-3.5 rounded-lg bg-[#FFF1F2] border border-[#FECDD3] text-xs font-medium text-[#BE123C] flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-[#BE123C]" />
              <span>Bạn đã làm đúng hết câu của chủ điểm này trong 7 ngày qua.</span>
            </div>
          )}

          {isFewerQuestions && (
            <div
              role="status"
              className="p-3.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-xs font-medium text-[#B45309] flex items-center gap-2.5"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#B45309]" />
              <span>
                Chỉ còn <span className="font-bold">{currentAvailable} câu mới</span>. Phiên luyện tập sẽ được tạo với {currentAvailable} câu.
              </span>
            </div>
          )}

          {/* Box quy tắc */}
          <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs space-y-1 text-[#475569]">
            <div className="font-semibold text-[#0F172A] font-mono">
              Quy tắc chọn câu hỏi thích ứng:
            </div>
            <div>• Tự động loại bỏ các câu bạn đã làm đúng trong 7 ngày gần nhất.</div>
            <div>• Đáp án được bảo mật 100% tại máy chủ trước khi bạn nộp bài.</div>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-[#FFF1F2] border border-[#FECDD3] text-xs font-medium text-[#BE123C] flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-[#BE123C]" />
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
              disabled={isOutOfQuestions || isLoadingTopics}
              onClick={handleStart}
            >
              {isOutOfQuestions
                ? "Không còn câu hỏi mới"
                : `Bắt đầu luyện (${effectiveQuestionCount} câu) →`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
