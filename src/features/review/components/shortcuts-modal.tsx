"use client";

import { useEffect } from "react";
import { X, Keyboard } from "lucide-react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: "Space", desc: "Lật thẻ Flashcard hoặc Phát lại âm thanh" },
    { key: "Enter", desc: "Kiểm tra đáp án gõ từ (Đoán từ) hoặc Chuyển thẻ tiếp" },
    { key: "1, 2, 3, 4", desc: "Chọn phương án trắc nghiệm hoặc Đánh giá FSRS (Lại / Khó / Tốt / Dễ)" },
    { key: "H", desc: "Xem gợi ý thêm ký tự ở chế độ Đoán từ" },
    { key: "Esc", desc: "Đóng cửa sổ phím tắt hoặc cài đặt" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Keyboard className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Phím tắt thao tác nhanh
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80"
            >
              <span className="text-xs text-slate-600 font-medium">{s.desc}</span>
              <kbd className="px-2 py-1 rounded bg-white border border-slate-300 font-mono text-xs font-bold text-slate-800 shadow-2xs shrink-0">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
