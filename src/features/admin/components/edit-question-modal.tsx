"use client";

import { useState, useTransition } from "react";
import type { AdminReviewQuestion } from "../types";
import { editQuestionAction } from "../actions";
import { validateStemBlank, validateOptions } from "@/core/adminReview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

interface EditQuestionModalProps {
  question: AdminReviewQuestion;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function EditQuestionModal({
  question,
  isOpen,
  onClose,
  onSaved,
}: EditQuestionModalProps) {
  const [stem, setStem] = useState(question.stem);
  const [optA, setOptA] = useState(question.option_a);
  const [optB, setOptB] = useState(question.option_b);
  const [optC, setOptC] = useState(question.option_c);
  const [optD, setOptD] = useState(question.option_d);
  const [correctIndex, setCorrectIndex] = useState(question.correct_index);
  const [ruleVi, setRuleVi] = useState(question.explanation.rule_vi || "");
  const [whyCorrectVi, setWhyCorrectVi] = useState(question.explanation.why_correct_vi || "");
  const [notes, setNotes] = useState("");

  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Kiểm tra tính hợp lệ S3 & S4
  const blankCheck = validateStemBlank(stem);
  const optCheck = validateOptions([optA, optB, optC, optD]);
  const isFormValid = blankCheck.valid && optCheck.valid;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isFormValid) {
      setErrorMsg(blankCheck.error || optCheck.error || "Dữ liệu chưa hợp lệ.");
      return;
    }

    startTransition(async () => {
      const res = await editQuestionAction(question.id, {
        stem,
        option_a: optA,
        option_b: optB,
        option_c: optC,
        option_d: optD,
        correct_index: correctIndex,
        rule_vi: ruleVi,
        why_correct_vi: whyCorrectVi,
        notes,
      });

      if (res.success) {
        onSaved();
        onClose();
      } else {
        setErrorMsg(res.error || "Không thể lưu câu hỏi.");
      }
    });
  };

  const insertBlank = () => {
    setStem((prev) => prev + " ______ ");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-2xl w-full p-6 my-8 space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] shrink-0">
          <div>
            <h2 id="edit-modal-title" className="text-lg font-bold text-[#0F172A]">
              Chỉnh sửa câu hỏi (Edit Mode)
            </h2>
            <p className="text-xs text-[#475569] mt-0.5">
              Chủ điểm: <span className="font-medium text-[#2563EB]">{question.tag_name_vi}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#475569] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-[#F1F5F9]"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSave} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Stem / Nội dung câu hỏi */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="edit-stem"
                className="text-xs font-semibold uppercase tracking-wider text-[#475569]"
              >
                Nội dung câu hỏi (Stem)
              </label>
              <button
                type="button"
                onClick={insertBlank}
                className="text-xs text-[#2563EB] hover:underline flex items-center gap-1 font-mono"
              >
                <Sparkles className="w-3 h-3" /> Chèn chỗ trống ______
              </button>
            </div>
            <textarea
              id="edit-stem"
              rows={3}
              value={stem}
              onChange={(e) => setStem(e.target.value)}
              className={`w-full rounded-lg p-3 text-sm text-[#0F172A] border transition-colors ${
                !blankCheck.valid && stem.trim() !== ""
                  ? "border-[#BE123C] focus:border-[#BE123C]"
                  : "border-[#8190A6] focus:border-[#2563EB]"
              } focus-visible:outline-2 focus-visible:outline-[#2563EB]`}
              placeholder="Nhập nội dung câu hỏi kèm 1 chỗ trống ______"
              required
            />
            {!blankCheck.valid && (
              <p className="text-xs text-[#BE123C] flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {blankCheck.error}
              </p>
            )}
          </div>

          {/* 4 Phương án & Chọn đáp án đúng */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
              4 Phương án & Chọn đáp án đúng (Radio)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "A", val: optA, set: setOptA, idx: 0 },
                { label: "B", val: optB, set: setOptB, idx: 1 },
                { label: "C", val: optC, set: setOptC, idx: 2 },
                { label: "D", val: optD, set: setOptD, idx: 3 },
              ].map((opt) => (
                <div
                  key={opt.label}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${
                    correctIndex === opt.idx
                      ? "border-[#2563EB] bg-[#EFF6FF]"
                      : "border-[#E2E8F0] bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="correct-option"
                    id={`radio-${opt.label}`}
                    checked={correctIndex === opt.idx}
                    onChange={() => setCorrectIndex(opt.idx)}
                    className="w-4 h-4 text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <label
                    htmlFor={`radio-${opt.label}`}
                    className="font-mono font-bold text-xs w-5 text-center text-[#475569]"
                  >
                    {opt.label}
                  </label>
                  <input
                    type="text"
                    value={opt.val}
                    onChange={(e) => opt.set(e.target.value)}
                    className="flex-1 text-sm bg-transparent border-b border-[#CBD5E1] focus:border-[#2563EB] focus:outline-none px-1 py-0.5"
                    placeholder={`Phương án ${opt.label}`}
                    required
                  />
                </div>
              ))}
            </div>
            {!optCheck.valid && (
              <p className="text-xs text-[#BE123C] flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {optCheck.error}
              </p>
            )}
          </div>

          {/* Giải thích sư phạm */}
          <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
            <Input
              id="edit-rule-vi"
              label="Quy tắc cốt lõi (Rule Vi)"
              value={ruleVi}
              onChange={(e) => setRuleVi(e.target.value)}
              placeholder="Quy tắc ngữ pháp ngắn gọn..."
            />
            <div className="space-y-1.5">
              <label
                htmlFor="edit-why-correct"
                className="text-xs font-semibold uppercase tracking-wider text-[#475569]"
              >
                Vì sao đúng (Why Correct)
              </label>
              <textarea
                id="edit-why-correct"
                rows={2}
                value={whyCorrectVi}
                onChange={(e) => setWhyCorrectVi(e.target.value)}
                className="w-full rounded-lg p-2.5 text-sm text-[#0F172A] border border-[#8190A6] focus:border-[#2563EB] focus-visible:outline-2 focus-visible:outline-[#2563EB]"
                placeholder="Giải thích tại sao phương án này chính xác..."
              />
            </div>
          </div>

          {/* Ghi chú của Admin */}
          <Input
            id="edit-notes"
            label="Ghi chú chỉnh sửa của Admin (Lưu vào review_log)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Lý do chỉnh sửa (sửa lỗi chính tả, chuẩn hóa chỗ trống...)"
          />

          {errorMsg && (
            <div
              role="alert"
              className="p-3 bg-[#FFF1F2] border border-[#FECDD3] rounded-lg text-xs font-medium text-[#BE123C] flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-[#BE123C] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
            <Button
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={onClose}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!isFormValid || isPending}
              isLoading={isPending}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
