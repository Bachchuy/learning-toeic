"use client";

import { useState, useTransition } from "react";
import {
  createNotebookAction,
  deleteNotebookAction,
} from "@/features/vocab/actions";
import type { Notebook } from "@/features/vocab/types";
import {
  X,
  FolderPlus,
  Folder,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";

interface NotebookManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebooks: Notebook[];
  onNotebooksChanged: (notebooks: Notebook[]) => void;
}

const NOTEBOOK_COLORS = [
  { name: "Blue", hex: "#2563EB", bg: "bg-blue-600" },
  { name: "Emerald", hex: "#059669", bg: "bg-emerald-600" },
  { name: "Amber", hex: "#D97706", bg: "bg-amber-600" },
  { name: "Purple", hex: "#7C3AED", bg: "bg-purple-600" },
  { name: "Rose", hex: "#E11D48", bg: "bg-rose-600" },
];

export function NotebookManagerModal({
  isOpen,
  onClose,
  notebooks,
  onNotebooksChanged,
}: NotebookManagerModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#2563EB");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMessage("Vui lòng nhập tên sổ từ vựng.");
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const res = await createNotebookAction(trimmed, description, color);
      if (res.success && res.notebook) {
        onNotebooksChanged([res.notebook, ...notebooks]);
        setName("");
        setDescription("");
      } else {
        setErrorMessage(res.message);
      }
    });
  };

  const handleDelete = (nbId: string) => {
    startTransition(async () => {
      const res = await deleteNotebookAction(nbId);
      if (res.success) {
        onNotebooksChanged(notebooks.filter((n) => n.id !== nbId));
      } else {
        setErrorMessage(res.message);
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notebook-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 id="notebook-modal-title" className="text-sm font-bold text-slate-900">
                Quản Lý Sổ Từ Vựng (Custom Notebooks)
              </h2>
              <p className="text-xs text-slate-500">
                Phân nhóm từ vựng theo chuyên đề TOEIC (Hợp đồng, Kế toán, Nhân sự...)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form tạo sổ mới */}
          <form onSubmit={handleCreate} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>Tạo sổ mới</span>
            </div>

            <div className="space-y-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên sổ (Ví dụ: Hợp đồng & Đàm phán, Đề ETS Test 1...)"
                className="w-full h-9.5 px-3 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-900 bg-white"
              />
            </div>

            {/* Bảng chọn màu sắc */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-500">Màu nhận diện:</span>
              <div className="flex items-center gap-1.5">
                {NOTEBOOK_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${c.bg} ${
                      color === c.hex ? "ring-2 ring-offset-2 ring-slate-800 scale-110" : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    {color === c.hex && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                disabled={isPending || !name.trim()}
                className="px-4 h-9 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FolderPlus className="w-3.5 h-3.5" />
                )}
                <span>Thêm sổ</span>
              </button>
            </div>
          </form>

          {/* Danh sách các sổ hiện có */}
          <div className="space-y-2">
            <div className="font-semibold text-slate-700 text-xs flex items-center justify-between">
              <span>Danh sách các sổ ({notebooks.length})</span>
            </div>

            {notebooks.length === 0 ? (
              <p className="text-slate-400 italic text-center py-4">
                Chưa có sổ tự tạo nào. Hãy tạo sổ đầu tiên để gom nhóm từ vựng nhé!
              </p>
            ) : (
              <div className="space-y-1.5">
                {notebooks.map((nb) => (
                  <div
                    key={nb.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: nb.color }}
                      >
                        <Folder className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-xs">
                          {nb.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {nb.word_count ?? 0} từ vựng
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(nb.id)}
                      disabled={isPending}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Xóa sổ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-9.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
}
