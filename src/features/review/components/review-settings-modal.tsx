"use client";

import { useEffect } from "react";
import { X, Settings, Volume2, Sparkles } from "lucide-react";

export interface ReviewSettings {
  autoPlayAudio: boolean;
  typoTolerance: boolean;
  audioSpeed: 1.0 | 0.8;
}

interface ReviewSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReviewSettings;
  onUpdateSettings: (newSettings: Partial<ReviewSettings>) => void;
}

export function ReviewSettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}: ReviewSettingsModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Settings className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Cài đặt phòng ôn tập
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

        <div className="p-5 space-y-4">
          {/* Tự động phát âm */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Tự động phát âm</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Phát âm tiếng Anh ngay khi mở thẻ hoặc trả lời đúng
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoPlayAudio}
                onChange={(e) =>
                  onUpdateSettings({ autoPlayAudio: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Dung sai chính tả */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Dung sai chính tả (Typo Tolerance)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Cảnh báo nhắc nhở khi gõ sai 1 ký tự ở chế độ Đoán từ
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.typoTolerance}
                onChange={(e) =>
                  onUpdateSettings({ typoTolerance: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Tốc độ phát âm */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-800">
                Tốc độ phát âm mẫu
              </div>
              <p className="text-[11px] text-slate-500">
                Chọn tốc độ 0.8x nếu bạn muốn nghe rõ từng âm tiết
              </p>
            </div>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-200 border border-slate-300 text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => onUpdateSettings({ audioSpeed: 1.0 })}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  settings.audioSpeed === 1.0
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                1.0x
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ audioSpeed: 0.8 })}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  settings.audioSpeed === 0.8
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                0.8x
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
}
