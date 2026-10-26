"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  Eye,
  HelpCircle,
  ArrowLeftRight,
  Mic,
  Keyboard,
  Settings,
  SlidersHorizontal,
} from "lucide-react";

export type ReviewStudyMode =
  | "typing"
  | "flashcard"
  | "quiz"
  | "reverse_quiz"
  | "listen_repeat";

interface ReviewHeaderProps {
  currentMode: ReviewStudyMode;
  onSelectMode: (mode: ReviewStudyMode) => void;
  currentIndex: number;
  totalCards: number;
  notebookName?: string;
  topicName?: string;
  onOpenShortcuts: () => void;
  onOpenSettings: () => void;
  onOpenSetup?: () => void;
}

export function ReviewHeader({
  currentMode,
  onSelectMode,
  currentIndex,
  totalCards,
  notebookName,
  topicName,
  onOpenShortcuts,
  onOpenSettings,
  onOpenSetup,
}: ReviewHeaderProps) {
  const progressPct = totalCards > 0 ? Math.round(((currentIndex + 1) / totalCards) * 100) : 0;

  const modes: Array<{
    id: ReviewStudyMode;
    label: string;
    icon: typeof Brain;
  }> = [
    { id: "typing", label: "Đoán", icon: Brain },
    { id: "flashcard", label: "Flashcard", icon: Eye },
    { id: "quiz", label: "Trắc nghiệm", icon: HelpCircle },
    { id: "reverse_quiz", label: "Trắc nghiệm đảo", icon: ArrowLeftRight },
    { id: "listen_repeat", label: "Lặp lại", icon: Mic },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] shadow-xs">
      <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto">
        {/* Left: Nút thoát & Tên sổ */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/vocab"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors text-xs font-semibold"
            title="Quay lại danh sách bộ thẻ"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[#0F172A] line-clamp-1 max-w-[150px] sm:max-w-xs">
              {topicName ? `${notebookName || "Ôn tập"} · ${topicName}` : (notebookName || "Ôn tập theo chủ đề")}
            </span>
          </div>
        </div>

        {/* Center: 5 Chế độ học dạng Pill Scroll ngang (giống hệt ảnh user gửi) */}
        <div className="flex-1 flex items-center justify-center overflow-x-auto no-scrollbar py-0.5 px-1">
          <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-full bg-slate-100/90 border border-slate-200/80 shrink-0">
            {modes.map((m) => {
              const Icon = m.icon;
              const isActive = currentMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectMode(m.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-[#1E293B] text-white shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Counter & Công cụ */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Badge tiến độ: X / N THẺ */}
          <div className="text-right">
            <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-800">
              {currentIndex} / {totalCards} THẺ
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block" />

          {/* Nút Tùy chỉnh phiên ôn (Sổ / Chủ đề / Số thẻ) */}
          {onOpenSetup && (
            <button
              type="button"
              onClick={onOpenSetup}
              className="p-1.5 sm:p-2 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200 flex items-center gap-1 text-xs font-semibold"
              title="Chia nhỏ / Tùy chỉnh phiên ôn"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden lg:inline">Tùy chỉnh</span>
            </button>
          )}

          {/* Nút Phím tắt */}
          <button
            type="button"
            onClick={onOpenShortcuts}
            className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/80"
            title="Phím tắt bàn phím"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Nút Cài đặt */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/80"
            title="Cài đặt ôn tập"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Thanh tiến độ phiên (Progress bar liền dưới header) */}
      <div className="h-1 w-full bg-slate-100 overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </header>
  );
}
