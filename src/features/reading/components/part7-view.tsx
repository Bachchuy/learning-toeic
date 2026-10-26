"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Send, RotateCcw, Sparkles, BookOpen, FileText } from "lucide-react";
import type { ReadingPassage, PassageSubmitResult } from "../types";
import { submitPassageAnswersAction } from "../actions";
import { getPassageTypeLabel, getPassageTypeBadgeClass } from "@/core/passages";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Part7ViewProps {
  passage: ReadingPassage;
}

export function Part7View({ passage }: Part7ViewProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [mobileTab, setMobileTab] = useState<"passage" | "questions">("passage");
  const [submitResult, setSubmitResult] = useState<PassageSubmitResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const questions = passage.questions;

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submitResult) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = () => {
    const payload = questions.map((q) => ({
      questionId: q.id,
      selectedIndex: selectedAnswers[q.id] ?? -1,
    }));

    startTransition(async () => {
      const res = await submitPassageAnswersAction(passage.id, payload);
      setSubmitResult(res);
      setMobileTab("questions"); // Tự động mở tab câu hỏi để xem kết quả
    });
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitResult(null);
  };

  const allAnswered = questions.every((q) => selectedAnswers[q.id] !== undefined);
  const answeredCount = questions.filter((q) => selectedAnswers[q.id] !== undefined).length;

  return (
    <div className="max-w-6xl mx-auto space-y-5 pt-2 pb-16 px-3 sm:px-6 animate-in fade-in duration-200">
      {/* 1. Top Header */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <Link
            href="/practice/new"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                TOEIC Part 7 · Reading Comprehension
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getPassageTypeBadgeClass(passage.passage_type)}`}>
                {getPassageTypeLabel(passage.passage_type)}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {passage.title}
            </h1>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs font-mono font-semibold text-slate-600">
            {answeredCount} / {questions.length} câu
          </span>
        </div>
      </div>

      {/* Mobile Tab Switcher (Chỉ hiển thị trên màn hình nhỏ < 1024px để học sinh chuyển đổi mượt mà) */}
      <div className="flex lg:hidden rounded-xl border border-slate-200 p-1 bg-slate-100 text-xs font-mono">
        <button
          type="button"
          onClick={() => setMobileTab("passage")}
          className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mobileTab === "passage"
              ? "bg-white text-slate-900 shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>Bài đọc văn bản</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("questions")}
          className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mobileTab === "questions"
              ? "bg-white text-slate-900 shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>Câu hỏi ({answeredCount}/{questions.length})</span>
        </button>
      </div>

      {/* Kết quả sau khi nộp bài */}
      {submitResult && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-4 animate-in zoom-in-95">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
              submitResult.score === submitResult.total
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}>
              {submitResult.score}/{submitResult.total}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                {submitResult.score === submitResult.total
                  ? "Hoàn hảo! Bạn trả lời đúng toàn bộ câu hỏi đọc hiểu"
                  : `Kết quả đọc hiểu: ${submitResult.score} / ${submitResult.total} câu`}
              </div>
              <p className="text-xs text-slate-500">
                Xem lại dẫn chứng trích xuất từ bài đọc cho từng câu hỏi bên dưới.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm lại</span>
          </button>
        </div>
      )}

      {/* 2. Main Two-Pane Grid: Trái là Bài đọc, Phải là Danh sách câu hỏi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI (7 CỘT): BÀI ĐỌC THƯƠNG MẠI CHÂN THỰC */}
        <div className={`lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5 ${
          mobileTab === "passage" ? "block" : "hidden lg:block"
        }`}>
          {/* Header mô phỏng E-mail / Văn bản công sở */}
          {passage.context_info && Object.keys(passage.context_info).length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-sans text-slate-700">
              {passage.context_info.from && (
                <div className="flex items-start gap-2">
                  <span className="font-mono font-bold text-slate-500 w-16 shrink-0">FROM:</span>
                  <span className="font-medium text-slate-900">{passage.context_info.from}</span>
                </div>
              )}
              {passage.context_info.to && (
                <div className="flex items-start gap-2">
                  <span className="font-mono font-bold text-slate-500 w-16 shrink-0">TO:</span>
                  <span className="font-medium text-slate-900">{passage.context_info.to}</span>
                </div>
              )}
              {passage.context_info.date && (
                <div className="flex items-start gap-2">
                  <span className="font-mono font-bold text-slate-500 w-16 shrink-0">DATE:</span>
                  <span>{passage.context_info.date}</span>
                </div>
              )}
              {passage.context_info.subject && (
                <div className="flex items-start gap-2 pt-1 border-t border-slate-200/80">
                  <span className="font-mono font-bold text-slate-500 w-16 shrink-0">SUBJECT:</span>
                  <span className="font-bold text-slate-900">{passage.context_info.subject}</span>
                </div>
              )}
            </div>
          )}

          {/* Nội dung bài đọc */}
          <div className="text-sm sm:text-[15px] leading-[1.8] text-slate-800 font-sans whitespace-pre-line space-y-3">
            {passage.content}
          </div>
        </div>

        {/* CỘT PHẢI (5 CỘT): DANH SÁCH CÂU HỎI */}
        <div className={`lg:col-span-5 space-y-5 ${
          mobileTab === "questions" ? "block" : "hidden lg:block"
        }`}>
          {questions.map((q) => {
            const userChoice = selectedAnswers[q.id];
            const qResult = submitResult?.results.find((r) => r.question_id === q.id);
            const options = [
              { label: "A", text: q.option_a, index: 0 },
              { label: "B", text: q.option_b, index: 1 },
              { label: "C", text: q.option_c, index: 2 },
              { label: "D", text: q.option_d, index: 3 },
            ];

            return (
              <Card key={q.id} className="p-5 bg-white border border-slate-200 shadow-sm space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      CÂU {146 + q.order_in_passage}
                    </span>
                    {q.question_sub_type && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700">
                        {q.question_sub_type}
                      </span>
                    )}
                  </div>

                  {qResult && (
                    <span className={`text-xs font-mono font-bold flex items-center gap-1 ${
                      qResult.is_correct ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {qResult.is_correct ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Sai
                        </>
                      )}
                    </span>
                  )}
                </div>

                {/* Tiêu đề câu hỏi */}
                <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                  {q.stem}
                </div>

                {/* 4 Phương án lựa chọn */}
                <div className="space-y-2">
                  {options.map((opt) => {
                    const isSelected = userChoice === opt.index;
                    const isCorrect = qResult?.correct_index === opt.index;
                    const isWrongChoice = qResult && isSelected && !isCorrect;

                    let btnClass = "bg-white text-slate-800 border-slate-200 hover:bg-slate-50";

                    if (submitResult) {
                      if (isCorrect) {
                        btnClass = "bg-emerald-50 text-emerald-900 border-emerald-500 font-semibold";
                      } else if (isWrongChoice) {
                        btnClass = "bg-rose-50 text-rose-900 border-rose-400";
                      } else {
                        btnClass = "bg-slate-50 text-slate-400 border-slate-200 opacity-60";
                      }
                    } else if (isSelected) {
                      btnClass = "bg-blue-50 text-blue-900 border-blue-600 shadow-xs font-semibold";
                    }

                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => handleSelectOption(q.id, opt.index)}
                        disabled={!!submitResult}
                        className={`w-full p-2.5 rounded-xl text-xs text-left border transition-all cursor-pointer flex items-start gap-2.5 ${btnClass}`}
                      >
                        <span className="w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-[11px] shrink-0 bg-slate-100 text-slate-700">
                          {opt.label}
                        </span>
                        <span className="flex-1 leading-snug">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Giải thích chi tiết khi nộp bài */}
                {qResult && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 animate-in fade-in">
                    {qResult.explanation.translation && (
                      <div>
                        <strong className="text-slate-900">Dịch nghĩa: </strong>
                        <span>{qResult.explanation.translation}</span>
                      </div>
                    )}
                    {qResult.explanation.analysis && (
                      <div>
                        <strong className="text-blue-700">Giải thích: </strong>
                        <span>{qResult.explanation.analysis}</span>
                      </div>
                    )}
                    {qResult.explanation.key_clue && (
                      <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                        <strong>Dẫn chứng bài đọc: </strong>
                        <span>&ldquo;{qResult.explanation.key_clue}&rdquo;</span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}

          {/* Action Button: Nộp bài (Taste Gate Invariant 5) */}
          {!submitResult ? (
            <Button
              type="button"
              variant="primary"
              size="default"
              onClick={handleSubmit}
              disabled={isPending || !allAnswered}
              className="w-full h-11 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>{allAnswered ? "Nộp bài & Chấm điểm" : `Hãy trả lời đủ câu hỏi (${answeredCount}/${questions.length})`}</span>
            </Button>
          ) : (
            <Link
              href="/practice/new"
              className="w-full h-11 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Luyện thêm bài đọc khác</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
