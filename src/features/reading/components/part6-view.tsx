"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Send, RotateCcw, Sparkles } from "lucide-react";
import type { ReadingPassage, PassageSubmitResult } from "../types";
import { submitPassageAnswersAction } from "../actions";
import { tokenizePart6Content, getPassageTypeLabel, getPassageTypeBadgeClass } from "@/core/passages";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Part6ViewProps {
  passage: ReadingPassage;
}

export function Part6View({ passage }: Part6ViewProps) {
  // Lưu đáp án học viên chọn cho từng questionId: { [questionId]: selectedIndex }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [submitResult, setSubmitResult] = useState<PassageSubmitResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const questions = passage.questions;
  const tokens = tokenizePart6Content(passage.content);

  // Tìm câu hỏi tương ứng theo blankNumber (131 -> order 1, 132 -> order 2...)
  const getQuestionForBlank = (blankNum: number) => {
    // Thử tìm theo order_in_passage trước (ví dụ 131 là câu số 1)
    const normalizedIndex = blankNum >= 131 ? blankNum - 130 : blankNum;
    return questions.find((q) => q.order_in_passage === normalizedIndex) || questions[normalizedIndex - 1];
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submitResult) return; // Đã nộp bài thì không sửa
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
    });
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitResult(null);
    setActiveQuestionIndex(0);
  };

  const allAnswered = questions.every((q) => selectedAnswers[q.id] !== undefined);
  const answeredCount = questions.filter((q) => selectedAnswers[q.id] !== undefined).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pt-2 pb-16 px-3 sm:px-6 animate-in fade-in duration-200">
      {/* 1. Header Navigation */}
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
                TOEIC Part 6 · Text Completion
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

        {/* Tiến độ làm bài */}
        <div className="text-right shrink-0">
          <span className="text-xs font-mono font-semibold text-slate-600">
            Đã làm: {answeredCount} / {questions.length} câu
          </span>
        </div>
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
                  ? "Xuất sắc! Bạn làm đúng toàn bộ 4 câu đục lỗ"
                  : `Kết quả: ${submitResult.score} / ${submitResult.total} câu chính xác`}
              </div>
              <p className="text-xs text-slate-500">
                Xem lại giải thích chi tiết và dẫn chứng ngữ pháp cho từng chỗ trống bên dưới.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm lại bài này</span>
          </button>
        </div>
      )}

      {/* 2. Main Grid: Đoạn văn (Interactive Passage) + Danh sách Câu hỏi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI (7 CỘT): ĐOẠN VĂN TƯƠNG TÁC (Chỗ đục lỗ điền trực tiếp từ được chọn) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Đoạn văn hoàn chỉnh
            </span>
            <span className="text-xs text-slate-500 italic">
              Bấm vào từng chỗ trống để làm câu tương ứng
            </span>
          </div>

          {/* Nội dung đoạn văn có đục lỗ */}
          <div className="text-sm sm:text-[15px] leading-[2] text-slate-800 font-sans whitespace-pre-line">
            {tokens.map((token, idx) => {
              if (token.type === "text") {
                return <span key={idx}>{token.value}</span>;
              }

              const targetQ = getQuestionForBlank(token.blankIndex);
              const qIndex = targetQ ? targetQ.order_in_passage - 1 : 0;
              const userChoiceIndex = targetQ ? selectedAnswers[targetQ.id] : undefined;
              const hasAnswer = userChoiceIndex !== undefined && targetQ;

              // Lấy chữ của đáp án học viên chọn
              let chosenText = "";
              if (hasAnswer && targetQ) {
                const options = [targetQ.option_a, targetQ.option_b, targetQ.option_c, targetQ.option_d];
                chosenText = options[userChoiceIndex];
              }

              // Kiểm tra đúng/sai nếu đã nộp bài
              const qResult = submitResult?.results.find((r) => r.question_id === targetQ?.id);
              const isCorrect = qResult?.is_correct;

              const isFocused = activeQuestionIndex === qIndex;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveQuestionIndex(qIndex)}
                  className={`inline-flex items-center gap-1 mx-1 px-2.5 py-0.5 rounded-lg font-medium text-xs sm:text-[13px] transition-all cursor-pointer border ${
                    submitResult
                      ? isCorrect
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                        : "bg-rose-50 text-rose-800 border-rose-300 line-through"
                      : isFocused
                      ? "bg-blue-100 text-blue-900 border-blue-500 ring-2 ring-blue-400/30 font-bold shadow-xs scale-105"
                      : hasAnswer
                      ? "bg-blue-50 text-blue-700 border-blue-200 font-semibold"
                      : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                  }`}
                  title={`Chỗ đục lỗ [${token.blankIndex}]`}
                >
                  <span className="font-mono text-[10px] opacity-70">[{token.blankIndex}]</span>
                  <span>{chosenText || "________"}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CỘT PHẢI (5 CỘT): DANH SÁCH 4 CÂU HỎI TRẮC NGHIỆM */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {questions.map((q, idx) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isFocused = activeQuestionIndex === idx;
              const qResult = submitResult?.results.find((r) => r.question_id === q.id);

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setActiveQuestionIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer border shrink-0 ${
                    isFocused
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : submitResult
                      ? qResult?.is_correct
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                      : isAnswered
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Câu {130 + q.order_in_passage}
                </button>
              );
            })}
          </div>

          {/* Câu hỏi đang được focus */}
          {questions[activeQuestionIndex] && (() => {
            const currentQ = questions[activeQuestionIndex];
            const qResult = submitResult?.results.find((r) => r.question_id === currentQ.id);
            const userChoice = selectedAnswers[currentQ.id];
            const options = [
              { label: "A", text: currentQ.option_a, index: 0 },
              { label: "B", text: currentQ.option_b, index: 1 },
              { label: "C", text: currentQ.option_c, index: 2 },
              { label: "D", text: currentQ.option_d, index: 3 },
            ];

            return (
              <Card className="p-5 bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      CÂU {130 + currentQ.order_in_passage} / 134
                    </span>
                    {currentQ.question_sub_type && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700">
                        {currentQ.question_sub_type}
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

                {/* Danh sách 4 phương án */}
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
                        onClick={() => handleSelectOption(currentQ.id, opt.index)}
                        disabled={!!submitResult}
                        className={`w-full p-3 rounded-xl text-xs sm:text-sm text-left border transition-all cursor-pointer flex items-start gap-2.5 ${btnClass}`}
                      >
                        <span className="w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 bg-slate-100 text-slate-700">
                          {opt.label}
                        </span>
                        <span className="flex-1 leading-snug">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Phân tích đáp án khi đã nộp bài */}
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
                        <strong className="text-blue-700">Giải thích ngữ pháp: </strong>
                        <span>{qResult.explanation.analysis}</span>
                      </div>
                    )}
                    {qResult.explanation.key_clue && (
                      <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                        <strong>Dấu hiệu nhận biết: </strong>
                        <span>{qResult.explanation.key_clue}</span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })()}

          {/* Nút Primary duy nhất nộp bài (Taste Gate Invariant 5) */}
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
              <span>{allAnswered ? "Nộp bài & Chấm điểm" : `Hãy làm đủ 4 câu (${answeredCount}/4)`}</span>
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
