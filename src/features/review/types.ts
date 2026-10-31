import type { VocabMetadata } from "@/features/vocab/types";
import type { RatingPreview } from "@/core/fsrs";

export interface ReviewCardItem {
  id: string; // review_cards.id
  vocab_entry_id: string;
  user_id: string;
  word: string;
  lemma: string;
  meaning: string;
  context_sentence: string;
  context_translation?: string;
  part_of_speech?: string;
  phonetic?: string;
  audio_url?: string;
  metadata?: VocabMetadata;
  state: number; // 0=New, 1=Learning, 2=Review, 3=Relearning
  stability: number;
  difficulty: number;
  due: string;
  reps: number;
  lapses: number;
  last_review?: string | null;
  previews?: RatingPreview[];
}

export interface ReviewTopicInfo {
  name: string;
  totalCount: number;
  dueCount: number;
  learnedCount?: number;
}

export interface ReviewFilterOptions {
  notebookId?: string;
  topic?: string;
  limit?: number; // 10, 15, 20, 30, hoặc undefined (tất cả)
  studyAll?: boolean; // Học củng cố tự do (cramming)
  excludeDeck?: string; // Loại trừ bộ thẻ (VD: 'it-vocab' khi chưa opt-in)
}

export interface ReviewSessionSummary {
  totalReviewed: number;
  ratingsDistribution: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
  earliestNextDue?: string;
}
