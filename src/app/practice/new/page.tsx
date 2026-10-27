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
import { AlertCircle, AlertTriangle, BookOpen, Layers, ArrowRight, FileText } from "lucide-react";
import { getReadingPassagesListAction } from "@/features/reading/actions";
import type { ReadingPassage } from "@/features/reading/types";
import { getPassageTypeLabel, getPassageTypeBadgeClass } from "@/core/passages";
import Link from "next/link";

export default function NewPracticePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedPart, setSelectedPart] = useState<5 | 6 | 7>(5);
  const [totalQuestions, setTotalQuestions] = useState<number>(5);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [topics, setTopics] = useState<PracticeTopicInfo[]>([]);
  const [passages, setPassages] = useState<ReadingPassage[]>([]);
  const [allAvailableCount, setAllAvailableCount] = useState<number>(0);
  const [isLoadingTopics, setIsLoadingTopics] = useState<boolean>(true);
  const [isLoadingPassages, setIsLoadingPassages] = useState<boolean>(false);
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

  const handleSelectPart = (part: 5 | 6 | 7) => {
    setSelectedPart(part);
    if (part === 6 || part === 7) {
      setIsLoadingPassages(true);
      getReadingPassagesListAction(part).then((res) => {
        setPassages(res);
        setIsLoadingPassages(false);
      });
    }
  };

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
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#475569] mb-2">
          {selectedPart === 5
            ? "Part 5 — Ngữ pháp & Từ vựng thích ứng"
            : selectedPart === 6
            ? "Part 6 — Điền đoạn văn (Text Completion)"
            : "Part 7 — Đọc hiểu văn bản (Reading Comprehension)"}
        </div>
        <h1 className="text-[26px] sm:text-[30px] font-bold tracking-[-0.02em] leading-[1.2] text-[#0F172A]">
          Khởi tạo phiên luyện tập
        </h1>
        <p className="text-[14px] text-[#475569] mt-2 leading-relaxed">
          Tùy chỉnh phần thi và chủ điểm phù hợp với quỹ thời gian học tập của bạn.
        </p>
      </div>

      {/* Bộ chọn Phần thi TOEIC Reading: Part 5 / Part 6 / Part 7 */}
      <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
        <button
          type="button"
          onClick={() => handleSelectPart(5)}
          className={`py-2.5 rounded-lg font-bold transition-all cursor-pointer ${
            selectedPart === 5
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Part 5 · Điền câu
        </button>
        <button
          type="button"
          onClick={() => handleSelectPart(6)}
          className={`py-2.5 rounded-lg font-bold transition-all cursor-pointer ${
            selectedPart === 6
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Part 6 · Điền đoạn
        </button>
        <button
          type="button"
          onClick={() => handleSelectPart(7)}
          className={`py-2.5 rounded-lg font-bold transition-all cursor-pointer ${
            selectedPart === 7
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Part 7 · Đọc hiểu
        </button>
      </div>

      {selectedPart === 5 ? (
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
              Chủ điểm ngữ pháp
            </label>

            {isLoadingTopics ? (
              <div className="p-6 text-center text-xs text-[#475569] bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
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
            <div className="font-semibold text-[#0F172A]">
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
      ) : (
        /* Giao diện danh sách đề bài Part 6 / Part 7 */
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Đề thi luyện tập {selectedPart === 6 ? "Part 6 (Text Completion)" : "Part 7 (Reading Comprehension)"}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {passages.length} đề thi sẵn sàng
            </span>
          </div>

          {isLoadingPassages ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
              Đang tải danh sách bài đọc...
            </div>
          ) : passages.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 space-y-2">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <p>Hiện chưa có bài đọc nào được xuất bản cho phần thi này.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {passages.map((p) => (
                <Card
                  key={p.id}
                  className="p-5 bg-white border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getPassageTypeBadgeClass(p.passage_type)}`}>
                        {getPassageTypeLabel(p.passage_type)}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        {p.part === 6 ? "4 câu đục lỗ [131]-[134]" : "Đọc hiểu văn bản"}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {p.title}
                    </h3>
                  </div>

                  <Link
                    href={`/reading/${p.id}`}
                    className="w-full sm:w-auto px-5 h-10 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
                  >
                    <span>Làm bài ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
