"use client";

import { Card } from "@/components/ui/card";
import type { CuratedDeckStatus } from "@/features/vocab/actions";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Loader2,
  Play,
  Sparkles,
  X,
} from "lucide-react";

interface VocabCuratedDecksTabProps {
  curatedDecks: CuratedDeckStatus[];
  totalCuratedCards: number;
  deckImportError: string | null;
  importingDeckId: string | null;
  onDismissError: () => void;
  onStartDeck: (deckStatus: CuratedDeckStatus) => void;
  onOpenNotebookInMyVocab: (notebookId: string) => void;
}

export function VocabCuratedDecksTab({
  curatedDecks,
  totalCuratedCards,
  deckImportError,
  importingDeckId,
  onDismissError,
  onStartDeck,
  onOpenNotebookInMyVocab,
}: VocabCuratedDecksTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
        <div className="space-y-0.5">
          <h2 className="text-base font-bold text-slate-900">
            Kho Bộ Thẻ Biên Soạn Theo Chuẩn Đề Thi Thật
          </h2>
          <p className="text-xs text-[#475569]">
            Chọn bộ thẻ để nạp trực tiếp vào sổ cá nhân và kích hoạt lịch ôn ngắt quãng FSRS ngay lập tức.
          </p>
        </div>
        <div className="text-xs font-mono font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0] shrink-0 self-start sm:self-auto">
          Tổng cộng 4 bộ thẻ · {totalCuratedCards} từ vựng
        </div>
      </div>

      {deckImportError && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-[#FECDD3] bg-[#FFF1F2] p-3.5 text-sm text-[#BE123C]"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{deckImportError}</span>
          </div>
          <button
            type="button"
            onClick={onDismissError}
            aria-label="Đóng thông báo lỗi"
            className="p-1 rounded-md hover:bg-[#FFE4E6] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {curatedDecks.map((deckStatus) => {
          const { deck, isImported } = deckStatus;
          const isImporting = importingDeckId === deck.id;

          return (
            <Card
              key={deck.id}
              className="overflow-hidden border border-[#E2E8F0] bg-white rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div
                className="p-5 text-white relative overflow-hidden flex flex-col justify-between min-h-[145px]"
                style={{
                  backgroundColor:
                    deck.id === "essential-600"
                      ? "#2563EB"
                      : deck.id === "ets-vocab"
                        ? "#0F172A"
                        : deck.id === "common-idioms"
                          ? "#047857"
                          : "#4338CA",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-xs text-white border border-white/20">
                    {deck.badge}
                  </span>
                  {isImported && (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đã nạp</span>
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <h3 className="text-lg font-bold tracking-tight text-white leading-snug line-clamp-2">
                    {deck.title}
                  </h3>
                  <div className="text-xs text-white/90 font-mono mt-1 flex items-center gap-1.5 font-medium">
                    {isImported ? (
                      <span>
                        Đã nạp {deckStatus.userCardsCount || deck.totalCards} / {deck.totalCards} thẻ
                      </span>
                    ) : (
                      <span>{deck.totalCards} thẻ từ vựng</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-[#475569] leading-relaxed line-clamp-3">
                  {deck.description}
                </p>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                    <Sparkles className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                    <span className="truncate">Chia nhỏ ~50 từ / chủ đề chuyên biệt</span>
                  </div>

                  {isImported ? (
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => onStartDeck(deckStatus)}
                        className="w-full h-10 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>
                          Học Flashcard ({deckStatus.userCardsCount || deck.totalCards} thẻ) →
                        </span>
                      </button>

                      {deckStatus.notebookId && (
                        <button
                          type="button"
                          onClick={() => onOpenNotebookInMyVocab(deckStatus.notebookId!)}
                          className="w-full text-center text-xs text-[#475569] hover:text-[#2563EB] hover:underline font-medium py-1 transition-colors cursor-pointer"
                        >
                          Xem danh sách từ trong Sổ từ cá nhân
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isImporting}
                      onClick={() => onStartDeck(deckStatus)}
                      className="w-full h-10 px-4 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang nạp từ vựng...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>BẮT ĐẦU HỌC BỘ THẺ</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
