"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  importCuratedDeckAction,
  type CuratedDeckStatus,
} from "@/features/vocab/actions";
import {
  BookOpen,
  Sparkles,
  Award,
  CheckCircle2,
  Loader2,
  X,
  Layers,
  ArrowRight,
  Clock,
} from "lucide-react";

interface CuratedDecksModalProps {
  isOpen: boolean;
  onClose: () => void;
  decks: CuratedDeckStatus[];
  onImportSuccess?: () => void;
}

export function CuratedDecksModal({
  isOpen,
  onClose,
  decks: initialDecks,
  onImportSuccess,
}: CuratedDecksModalProps) {
  const router = useRouter();
  const [decks, setDecks] = useState<CuratedDeckStatus[]>(initialDecks);
  const [loadingDeckId, setLoadingDeckId] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    deckTitle: string;
    count: number;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleImport = (deckId: string, deckTitle: string) => {
    setLoadingDeckId(deckId);
    startTransition(async () => {
      const res = await importCuratedDeckAction(deckId);
      setLoadingDeckId(null);

      if (res.success) {
        setDecks((prev) =>
          prev.map((d) =>
            d.deck.id === deckId
              ? {
                  ...d,
                  isImported: true,
                  notebookId: res.notebook?.id,
                  userCardsCount: (d.userCardsCount || 0) + (res.importedCount || 0),
                }
              : d
          )
        );
        setImportResult({
          deckTitle,
          count: res.importedCount || 0,
        });

        if (onImportSuccess) {
          onImportSuccess();
        }
      } else {
        alert(res.message);
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="curated-decks-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#E2E8F0] flex flex-col">
        {/* Header Modal */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-6 bg-white border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                <Layers className="w-5 h-5" />
              </span>
              <h2
                id="curated-decks-title"
                className="text-lg sm:text-xl font-bold text-[#0F172A]"
              >
                Kho Bộ Thẻ Từ Vựng TOEIC Chuẩn
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#475569] mt-1">
              Bộ từ vựng và thành ngữ cốt lõi đã được biên soạn sẵn. Chọn bộ thẻ để nạp vào sổ và kích hoạt ôn tập FSRS ngay lập tức.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="p-2 rounded-lg text-[#8190A6] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thông báo nạp thành công nếu có */}
        {importResult && (
          <div className="mx-4 sm:mx-6 mt-4 p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#047857]" />
              <div className="text-xs sm:text-sm font-medium">
                Đã nạp thành công <strong>{importResult.count} từ vựng</strong> của bộ{" "}
                <strong>&quot;{importResult.deckTitle}&quot;</strong> vào Sổ từ vựng cá nhân!
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                router.push("/review");
              }}
              className="shrink-0 text-xs h-8"
            >
              Ôn thẻ ngay →
            </Button>
          </div>
        )}

        {/* Danh sách 3 bộ thẻ (Grid) */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          {decks.map(({ deck, isImported, userCardsCount }) => {
            const isLoading = loadingDeckId === deck.id;

            return (
              <Card
                key={deck.id}
                className="flex flex-col overflow-hidden border border-[#E2E8F0] rounded-xl hover:shadow-md transition-shadow bg-white"
              >
                {/* 1. Deck Cover (Phần ảnh bìa mô phỏng) */}
                <div
                  className="relative p-5 text-white flex flex-col justify-between min-h-[140px]"
                  style={{
                    backgroundColor:
                      deck.id === "essential-600"
                        ? "#1E40AF"
                        : deck.id === "ets-vocab"
                        ? "#0F172A"
                        : "#047857",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      {deck.badge}
                    </span>
                    {deck.icon === "book" && <BookOpen className="w-4 h-4 opacity-80" />}
                    {deck.icon === "award" && <Award className="w-4 h-4 opacity-80" />}
                    {deck.icon === "sparkles" && <Sparkles className="w-4 h-4 opacity-80" />}
                  </div>

                  <div className="mt-4">
                    <div className="text-xs font-semibold tracking-wide uppercase opacity-85">
                      {deck.englishTitle}
                    </div>
                    <div className="text-sm font-extrabold line-clamp-1 mt-0.5 text-white">
                      {deck.subtitle}
                    </div>
                  </div>
                </div>

                {/* 2. Deck Body */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-[#0F172A] text-sm sm:text-base leading-snug">
                        {deck.title}
                      </h3>
                      {isImported && (
                        <span className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                          ĐANG HỌC
                        </span>
                      )}
                    </div>

                    {/* Stats badges */}
                    <div className="flex items-center gap-3 text-xs text-[#475569] mt-2 font-medium">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-[#8190A6]" />
                        {deck.totalCards} thẻ
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#8190A6]" />
                        {isImported
                          ? `Đã nạp ${userCardsCount} thẻ`
                          : "Ôn tập FSRS"}
                      </span>
                    </div>

                    <p className="text-xs text-[#475569] mt-2.5 leading-relaxed line-clamp-3">
                      {deck.description}
                    </p>
                  </div>

                  {/* 3. Action Button */}
                  <div className="pt-2 border-t border-[#E2E8F0]">
                    {isImported ? (
                      <Button
                        variant="secondary"
                        size="default"
                        className="w-full flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold h-11"
                        onClick={() => {
                          onClose();
                          router.push(`/vocab`);
                        }}
                      >
                        <span>Tiếp tục học trong Sổ từ</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="default"
                        disabled={isLoading || isPending}
                        onClick={() => handleImport(deck.id, deck.title)}
                        className="w-full flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold h-11"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                            <span>Đang nạp từ vựng...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-1" />
                            <span>Bắt đầu học bộ thẻ này</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer Modal */}
        <div className="p-4 sm:p-5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#475569]">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-[#047857]" />
            Thẻ được nạp sẽ tự động lên lịch FSRS và lưu trữ trong Sổ từ cá nhân của bạn.
          </span>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
