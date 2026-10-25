"use client";

import { useState, useTransition, useEffect } from "react";
import { saveBatchVocabAction } from "@/features/vocab/actions";
import { completeStemWithAnswer, inferPartOfSpeech } from "@/core/vocab";
import { Button } from "@/components/ui/button";
import {
  X,
  BookmarkPlus,
  Check,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";
import type { VocabHint } from "@/features/practice/types";

interface VocabSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextSentence: string;
  answerText?: string;
  contextTranslation?: string;
  questionId?: string;
  vocabHints?: VocabHint[];
  initialWord?: string;
  initialMeaning?: string;
  onSavedSuccess?: () => void;
}

interface EditableVocabItem {
  id: string;
  word: string;
  meaning: string;
  partOfSpeech: string;
  selected: boolean;
  isCustom?: boolean;
}

export function VocabSaveModal({
  isOpen,
  onClose,
  contextSentence,
  answerText = "",
  contextTranslation = "",
  questionId,
  vocabHints = [],
  initialWord = "",
  initialMeaning = "",
  onSavedSuccess,
}: VocabSaveModalProps) {
  // Tự động thay thế ____ bằng đáp án đúng để tạo thành câu hoàn chỉnh chuẩn ngữ pháp
  const completedSentence = answerText
    ? completeStemWithAnswer(contextSentence, answerText)
    : contextSentence;

  // Khởi tạo danh sách các từ có thể lưu
  const [items, setItems] = useState<EditableVocabItem[]>(() => {
    // 1. Tạo từ danh sách vocabHints nếu có
    const hintItems: EditableVocabItem[] = vocabHints.map((hint, idx) => {
      const isInitialMatch = initialWord
        ? hint.word.toLowerCase() === initialWord.toLowerCase()
        : true; // Mặc định chọn tất cả nếu mở chung

      return {
        id: `hint-${idx}`,
        word: hint.word,
        meaning: hint.meaning_vi,
        partOfSpeech: inferPartOfSpeech(hint.word, hint.meaning_vi),
        selected: isInitialMatch,
      };
    });

    // 2. Nếu có initialWord mà không trùng trong hint, thêm như từ tùy chỉnh
    if (
      initialWord &&
      !hintItems.some(
        (h) => h.word.toLowerCase() === initialWord.toLowerCase()
      )
    ) {
      hintItems.unshift({
        id: "custom-initial",
        word: initialWord,
        meaning: initialMeaning,
        partOfSpeech: inferPartOfSpeech(initialWord, initialMeaning),
        selected: true,
        isCustom: true,
      });
    }

    // 3. Nếu không có hint nào, thêm 1 ô trống mặc định
    if (hintItems.length === 0) {
      hintItems.push({
        id: "custom-default",
        word: initialWord,
        meaning: initialMeaning,
        partOfSpeech: inferPartOfSpeech(initialWord, initialMeaning),
        selected: true,
        isCustom: true,
      });
    }

    return hintItems;
  });

  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "warning" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Đóng bằng phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending, onClose]);

  if (!isOpen) return null;

  // Toggle chọn / bỏ chọn một từ
  const toggleSelect = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
    setFeedbackMessage(null);
  };

  // Chọn tất cả
  const selectAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: true })));
    setFeedbackMessage(null);
  };

  // Bỏ chọn tất cả
  const deselectAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: false })));
    setFeedbackMessage(null);
  };

  // Cập nhật nghĩa tiếng Việt của một từ
  const updateMeaning = (id: string, newMeaning: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, meaning: newMeaning } : item
      )
    );
  };

  // Cập nhật từ tiếng Anh (cho từ tùy chỉnh)
  const updateWord = (id: string, newWord: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              word: newWord,
              partOfSpeech: inferPartOfSpeech(newWord, item.meaning),
            }
          : item
      )
    );
  };

  // Thêm một dòng từ tùy chỉnh mới
  const addCustomItem = () => {
    const newId = `custom-${Date.now()}`;
    setItems((prev) => [
      ...prev,
      {
        id: newId,
        word: "",
        meaning: "",
        partOfSpeech: "Từ vựng (Word)",
        selected: true,
        isCustom: true,
      },
    ]);
  };

  // Xóa một dòng từ tùy chỉnh
  const removeCustomItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const selectedItems = items.filter((item) => item.selected && item.word.trim());
  const selectedCount = selectedItems.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);

    if (selectedCount === 0) {
      setFeedbackMessage({
        type: "error",
        text: "Vui lòng chọn hoặc nhập ít nhất một từ vựng để lưu.",
      });
      return;
    }

    // Kiểm tra xem các từ đã chọn có nghĩa chưa
    const missingMeaning = selectedItems.find((item) => !item.meaning.trim());
    if (missingMeaning) {
      setFeedbackMessage({
        type: "error",
        text: `Vui lòng nhập nghĩa tiếng Việt cho từ "${missingMeaning.word}".`,
      });
      return;
    }

    startTransition(async () => {
      const res = await saveBatchVocabAction({
        items: selectedItems.map((item) => ({
          word: item.word,
          meaning: item.meaning,
          partOfSpeech: item.partOfSpeech,
        })),
        contextSentence: completedSentence,
        contextTranslation,
        questionId,
      });

      if (!res.success) {
        setFeedbackMessage({
          type: res.duplicateCount > 0 ? "warning" : "error",
          text: res.message,
        });
        return;
      }

      setFeedbackMessage({
        type: "success",
        text: res.message,
      });

      if (onSavedSuccess) {
        onSavedSuccess();
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vocab-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#EFF6FF] text-[#2563EB]">
              <BookmarkPlus className="w-5 h-5" />
            </span>
            <div>
              <h2
                id="vocab-modal-title"
                className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight"
              >
                Lưu từ vựng vào Sổ từ
              </h2>
              <p className="text-xs text-[#64748B]">
                Hệ thống tự động điền câu ví dụ chuẩn và phân tích từ loại.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors cursor-pointer"
            aria-label="Đóng hộp thoại"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Danh sách từ vựng có thể lưu */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                Từ vựng trọng tâm trong câu ({items.length}):
              </span>
              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-[#2563EB] hover:underline font-semibold cursor-pointer"
                >
                  Chọn tất cả
                </button>
                <span className="text-[#CBD5E1]">•</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            {/* Danh sách các dòng từ vựng */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all ${
                    item.selected
                      ? "bg-[#F0FDF4]/70 border-[#86EFAC] shadow-xs"
                      : "bg-[#F8FAFC] border-[#E2E8F0] opacity-75"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 mt-1 rounded text-[#2563EB] focus:ring-[#2563EB] border-[#8190A6] cursor-pointer"
                    />

                    {/* Nội dung từ, từ loại & nghĩa */}
                    <div className="flex-1 space-y-1.5">
                      {item.isCustom ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.word}
                            onChange={(e) => updateWord(item.id, e.target.value)}
                            placeholder="Nhập từ tiếng Anh..."
                            className="flex-1 h-8 px-2 rounded-md border border-[#8190A6] text-xs font-bold text-[#0F172A] bg-white focus:outline-none focus:border-[#2563EB]"
                          />
                          <button
                            type="button"
                            onClick={() => removeCustomItem(item.id)}
                            className="p-1 rounded text-[#64748B] hover:text-[#BE123C] cursor-pointer"
                            title="Xóa dòng này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#0F172A]">
                            {item.word}
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white text-[#475569] border border-[#E2E8F0]">
                            {item.partOfSpeech}
                          </span>
                        </div>
                      )}

                      {/* Ô nhập nghĩa tiếng Việt */}
                      <input
                        type="text"
                        value={item.meaning}
                        onChange={(e) => updateMeaning(item.id, e.target.value)}
                        placeholder="Nghĩa tiếng Việt..."
                        className="w-full h-8 px-2.5 rounded-md border border-[#CBD5E1] text-xs text-[#0F172A] bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Nút thêm từ tùy chỉnh khác */}
            <button
              type="button"
              onClick={addCustomItem}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] pt-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Thêm từ khác từ câu này</span>
            </button>
          </div>

          {/* Câu ngữ cảnh hoàn chỉnh (Không còn vết ____) */}
          {completedSentence && (
            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#64748B]">
                Câu ví dụ hoàn chỉnh (Đã điền từ đúng):
              </label>
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <div className="text-xs text-[#0F172A] font-medium leading-relaxed">
                  &ldquo;{completedSentence}&rdquo;
                </div>
                {contextTranslation && (
                  <div className="text-[11px] text-[#64748B] italic leading-relaxed border-t border-[#E2E8F0]/60 pt-1">
                    Dịch: &ldquo;{contextTranslation}&rdquo;
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Thông báo phản hồi */}
          {feedbackMessage && (
            <div
              role="alert"
              className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150 ${
                feedbackMessage.type === "success"
                  ? "bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857]"
                  : feedbackMessage.type === "warning"
                  ? "bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309]"
                  : "bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C]"
              }`}
            >
              {feedbackMessage.type === "success" ? (
                <Check className="w-4 h-4 shrink-0 text-[#047857]" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
          )}

          {/* Bất biến: Duy nhất 1 nút Primary */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="cta"
              className="w-full"
              isLoading={isPending}
              disabled={selectedCount === 0}
            >
              {selectedCount > 0
                ? `Lưu ${selectedCount} từ vào Sổ từ vựng →`
                : "Vui lòng chọn ít nhất 1 từ"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
