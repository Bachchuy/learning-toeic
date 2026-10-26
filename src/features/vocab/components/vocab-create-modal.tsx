"use client";

import { useState, useTransition } from "react";
import { lookupWordAction } from "@/features/dictionary/actions";
import { saveVocabAction } from "@/features/vocab/actions";
import { AudioSpeakerButton } from "@/components/ui/audio-speaker-button";
import type { Notebook, VocabEntry } from "@/features/vocab/types";
import {
  X,
  Plus,
  Sparkles,
  Folder,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface VocabCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebooks: Notebook[];
  selectedNotebookId?: string | null;
  onVocabCreated: (newEntry: VocabEntry) => void;
}

export function VocabCreateModal(props: VocabCreateModalProps) {
  if (!props.isOpen) return null;
  return <VocabCreateModalForm {...props} />;
}

function VocabCreateModalForm({
  onClose,
  notebooks,
  selectedNotebookId = null,
  onVocabCreated,
}: VocabCreateModalProps) {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("noun");
  const [phonetic, setPhonetic] = useState("");
  const [contextSentence, setContextSentence] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [notebookId, setNotebookId] = useState<string | null>(selectedNotebookId);

  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Tra cứu tự động bằng Smart Dictionary
  const handleAutoLookup = async () => {
    const trimmed = word.trim();
    if (!trimmed || trimmed.length < 2) return;

    setIsSearching(true);
    setSearchFeedback(null);
    setErrorMessage(null);

    try {
      const entry = await lookupWordAction(trimmed);
      if (entry) {
        if (entry.meaning_vi && !meaning) {
          setMeaning(entry.meaning_vi);
        }
        if (entry.phonetic) {
          setPhonetic(entry.phonetic);
        }
        if (entry.part_of_speech) {
          setPartOfSpeech(entry.part_of_speech.split(",")[0].trim() || "noun");
        }
        if (entry.audio_url) {
          setAudioUrl(entry.audio_url);
        }
        if (entry.examples && entry.examples.length > 0 && !contextSentence) {
          setContextSentence(entry.examples[0].en);
        }
        setSearchFeedback("Đã tìm thấy dữ liệu phát âm & định nghĩa chuẩn!");
      } else {
        setSearchFeedback("Không tìm thấy từ này trong từ điển. Bạn hãy tự điền nghĩa nhé.");
      }
    } catch {
      setSearchFeedback("Lỗi tra từ điển tạm thời.");
    } finally {
      setIsSearching(false);
    }
  };

  // Lưu từ vựng mới
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) {
      setErrorMessage("Vui lòng nhập từ tiếng Anh.");
      return;
    }
    if (!meaning.trim()) {
      setErrorMessage("Vui lòng nhập nghĩa tiếng Việt.");
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const res = await saveVocabAction({
        word: word.trim(),
        meaning: meaning.trim(),
        partOfSpeech: partOfSpeech.trim(),
        phonetic: phonetic.trim(),
        contextSentence: contextSentence.trim() || `Example with ${word.trim()}.`,
        notebookId: notebookId || null,
      });

      if (res.success && res.entry) {
        onVocabCreated(res.entry);
        onClose();
      } else {
        setErrorMessage(res.message || "Không thể lưu từ lúc này.");
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vocab-create-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 id="vocab-create-title" className="text-sm font-bold text-slate-900">
                Thêm Từ Vựng Mới
              </h2>
              <p className="text-xs text-slate-500">
                Tự động điền phiên âm, phát âm & nghĩa nhờ Smart Dictionary
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Ô nhập từ tiếng Anh + Nút tra cứu */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 flex items-center justify-between">
              <span>Từ vựng tiếng Anh (Word) *</span>
              {audioUrl && (
                <div className="flex items-center gap-1.5 text-blue-600 font-normal">
                  <AudioSpeakerButton word={word} audioUrl={audioUrl} size="sm" />
                  <span>Nghe thử phát âm US</span>
                </div>
              )}
            </label>
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                onBlur={handleAutoLookup}
                placeholder="Ví dụ: implement, eligible, accommodate..."
                className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAutoLookup}
                disabled={isSearching || !word.trim()}
                className="px-3 h-10 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                title="Tra từ điển tự động"
              >
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span>Tra nhanh</span>
              </button>
            </div>
            {searchFeedback && (
              <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>{searchFeedback}</span>
              </p>
            )}
          </div>

          {/* 2. Phiên âm IPA & Từ loại */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Phiên âm IPA</label>
              <input
                type="text"
                value={phonetic}
                onChange={(e) => setPhonetic(e.target.value)}
                placeholder="/ˈɪmplɪment/"
                className="w-full h-9.5 px-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-xs font-mono text-slate-800"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Từ loại (Part of Speech)</label>
              <select
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
                className="w-full h-9.5 px-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-xs font-medium text-slate-800 bg-white cursor-pointer"
              >
                <option value="noun">Danh từ (Noun)</option>
                <option value="verb">Động từ (Verb)</option>
                <option value="adjective">Tính từ (Adjective)</option>
                <option value="adverb">Trạng từ (Adverb)</option>
                <option value="phrase">Cụm từ (Phrase)</option>
              </select>
            </div>
          </div>

          {/* 3. Nghĩa tiếng Việt */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Nghĩa tiếng Việt *</label>
            <input
              type="text"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="Ví dụ: Thi hành, triển khai (kế hoạch)"
              className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-900 font-medium"
            />
          </div>

          {/* 4. Chọn Sổ từ vựng (Custom Notebook) */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-blue-600" />
              <span>Lưu vào Sổ (Notebook)</span>
            </label>
            <select
              value={notebookId || ""}
              onChange={(e) => setNotebookId(e.target.value ? e.target.value : null)}
              className="w-full h-9.5 px-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-xs font-medium text-slate-800 bg-white cursor-pointer"
            >
              <option value="">📁 Mặc định (Tất cả từ vựng)</option>
              {notebooks.map((nb) => (
                <option key={nb.id} value={nb.id}>
                  📂 {nb.name} ({nb.word_count ?? 0} từ)
                </option>
              ))}
            </select>
          </div>

          {/* 5. Câu ví dụ ngữ cảnh */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Câu ví dụ ngữ cảnh (Tùy chọn)</label>
            <textarea
              value={contextSentence}
              onChange={(e) => setContextSentence(e.target.value)}
              rows={2}
              placeholder="Ví dụ: The board decided to implement new security policies."
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-800"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 h-10 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending || !word.trim() || !meaning.trim()}
              className="px-5 h-10 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Lưu vào sổ ngay</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
