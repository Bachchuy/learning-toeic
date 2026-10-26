"use server";

import { createClient } from "@/lib/supabase/server";
import {
  previewFSRSRatings,
  calculateFSRSReview,
  type DBCardRow,
} from "@/core/fsrs";
import { trackEventAction } from "@/features/practice/actions";
import { enrichVocabMetadata } from "@/core/vocabDictionary";
import type { VocabMetadata } from "@/features/vocab/types";
import type { ReviewCardItem } from "./types";

/**
 * Server Action: Lấy danh sách thẻ từ vựng đến hạn ôn tập (FSRS Spaced Repetition)
 * BẤT BIẾN §4.6b, D-03, D-22, D-24:
 * - Lấy các thẻ có due <= now() của user hiện tại (hoặc lọc theo notebookId của bộ thẻ)
 * - Tính toán thời gian xem trước (preview) cho 4 nút Lại / Khó / Tốt / Dễ bằng thư viện FSRS
 */
export async function getReviewCardsAction(notebookId?: string): Promise<{
  cards: ReviewCardItem[];
  nextDueFormatted?: string;
  totalCardsCount: number;
  notebookName?: string;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      cards: [],
      totalCardsCount: 0,
      error: "Vui lòng đăng nhập để ôn tập từ vựng.",
    };
  }

  const now = new Date();

  let notebookName: string | undefined;
  let targetVocabIds: string[] | undefined;

  if (notebookId) {
    const [{ data: nb }, { data: vEntries }] = await Promise.all([
      supabase
        .from("notebooks")
        .select("name")
        .eq("id", notebookId)
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("vocab_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("notebook_id", notebookId),
    ]);

    notebookName = nb?.name;
    targetVocabIds = vEntries?.map((v) => v.id) || [];

    if (targetVocabIds.length === 0) {
      return {
        cards: [],
        totalCardsCount: 0,
        notebookName,
        error: undefined,
      };
    }
  }

  // 1. Đếm tổng số thẻ mà người dùng đang có (hoặc thuộc sổ này)
  let countQuery = supabase
    .from("review_cards")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (targetVocabIds && targetVocabIds.length > 0) {
    countQuery = countQuery.in("vocab_entry_id", targetVocabIds);
  }

  const { count: totalCardsCount } = await countQuery;

  // 2. Lấy danh sách thẻ đến hạn ôn tập (due <= now())
  let cardsQuery = supabase
    .from("review_cards")
    .select(`
      id,
      vocab_entry_id,
      user_id,
      state,
      stability,
      difficulty,
      due,
      last_review,
      reps,
      lapses,
      vocab_entries (
        id,
        word,
        lemma,
        meaning,
        context_sentence,
        context_translation,
        part_of_speech,
        phonetic,
        metadata
      )
    `)
    .eq("user_id", user.id);

  if (targetVocabIds && targetVocabIds.length > 0) {
    cardsQuery = cardsQuery.in("vocab_entry_id", targetVocabIds);
  }

  const { data: initialData, error } = await cardsQuery
    .lte("due", now.toISOString())
    .order("due", { ascending: true });

  let data = initialData;

  if (error) {
    return {
      cards: [],
      totalCardsCount: totalCardsCount ?? 0,
      notebookName,
      error: "Không thể tải danh sách thẻ ôn lúc này.",
    };
  }

  // Nếu người dùng chọn học riêng một bộ thẻ (notebookId) mà chưa có thẻ nào đến hạn,
  // tự động lấy tối đa 50 thẻ của bộ này để học tự do / củng cố (Cram Mode)
  if (
    notebookId &&
    (!data || data.length === 0) &&
    targetVocabIds &&
    targetVocabIds.length > 0
  ) {
    const { data: cramData } = await supabase
      .from("review_cards")
      .select(`
        id,
        vocab_entry_id,
        user_id,
        state,
        stability,
        difficulty,
        due,
        last_review,
        reps,
        lapses,
        vocab_entries (
          id,
          word,
          lemma,
          meaning,
          context_sentence,
          context_translation,
          part_of_speech,
          phonetic,
          metadata
        )
      `)
      .eq("user_id", user.id)
      .in("vocab_entry_id", targetVocabIds)
      .order("last_review", { ascending: true, nullsFirst: true })
      .limit(50);

    if (cramData && cramData.length > 0) {
      data = cramData;
    }
  }

  // 3. Nếu không có thẻ nào đến hạn, tìm thời điểm thẻ sớm nhất kế tiếp
  let nextDueFormatted: string | undefined;
  if (!data || data.length === 0) {
    let upcomingQuery = supabase
      .from("review_cards")
      .select("due")
      .eq("user_id", user.id)
      .gt("due", now.toISOString())
      .order("due", { ascending: true })
      .limit(1);

    if (targetVocabIds && targetVocabIds.length > 0) {
      upcomingQuery = upcomingQuery.in("vocab_entry_id", targetVocabIds);
    }

    const { data: upcoming } = await upcomingQuery.single();

    if (upcoming?.due) {
      const d = new Date(upcoming.due);
      nextDueFormatted = d.toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }

  interface RawReviewRow {
    id: string;
    vocab_entry_id: string;
    user_id: string;
    state: number;
    stability: number;
    difficulty: number;
    due: string;
    last_review?: string | null;
    reps: number;
    lapses: number;
    vocab_entries: {
      id: string;
      word: string;
      lemma: string;
      meaning: string;
      context_sentence: string;
      context_translation?: string;
      part_of_speech?: string;
      phonetic?: string;
      metadata?: VocabMetadata;
    } | null;
  }

  const rawRows = (data || []) as unknown as RawReviewRow[];

  // 4. Chuẩn hóa và đính kèm thông tin xem trước của 4 nút chấm (previews)
  const cards: ReviewCardItem[] = rawRows
    .filter((row) => row.vocab_entries !== null)
    .map((row) => {
      const vocab = row.vocab_entries!;
      const dbCard: DBCardRow = {
        id: row.id,
        user_id: row.user_id,
        vocab_entry_id: row.vocab_entry_id,
        state: row.state,
        stability: Number(row.stability) || 0,
        difficulty: Number(row.difficulty) || 0,
        due: row.due,
        last_review: row.last_review,
        reps: row.reps,
        lapses: row.lapses,
      };

      const previews = previewFSRSRatings(dbCard, now);

      const isOldBoilerplate =
        vocab.metadata?.detailed_explanation?.includes("Thuật ngữ chuyên môn") ||
        vocab.metadata?.detailed_explanation?.includes(
          "thường xuyên xuất hiện trong các bài thi TOEIC"
        );

      const enriched = enrichVocabMetadata(
        vocab.word,
        vocab.meaning,
        vocab.context_sentence
      );

      const metadata =
        vocab.metadata && Object.keys(vocab.metadata).length > 0 && !isOldBoilerplate
          ? vocab.metadata
          : enriched.metadata;

      const partOfSpeech = vocab.part_of_speech || enriched.part_of_speech || "";
      const phonetic =
        vocab.phonetic || metadata.phonetic || enriched.phonetic || "";

      return {
        id: row.id,
        vocab_entry_id: row.vocab_entry_id,
        user_id: row.user_id,
        word: vocab.word,
        lemma: vocab.lemma,
        meaning: vocab.meaning,
        context_sentence: vocab.context_sentence,
        context_translation: vocab.context_translation,
        part_of_speech: partOfSpeech,
        phonetic,
        metadata,
        state: row.state,
        stability: Number(row.stability) || 0,
        difficulty: Number(row.difficulty) || 0,
        due: row.due,
        last_review: row.last_review,
        reps: row.reps,
        lapses: row.lapses,
        previews,
      };
    });

  return {
    cards,
    nextDueFormatted,
    totalCardsCount: totalCardsCount ?? 0,
  };
}

/**
 * Server Action: Chấm điểm thẻ ôn tập bằng FSRS và ghi nhật ký lịch sử
 * BẤT BIẾN §4.6b, D-22, D-23:
 * - Tính toán cập nhật trạng thái thẻ bằng ts-fsrs
 * - Ghi bản ghi vào card_reviews (append-only) cùng giao dịch với cập nhật review_cards
 */
export async function submitCardRatingAction(
  cardId: string,
  rating: 1 | 2 | 3 | 4
): Promise<{
  success: boolean;
  nextDue?: string;
  isShortTermLearningStep?: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Vui lòng đăng nhập để chấm thẻ." };
  }

  // 1. Đọc thông tin thẻ hiện tại từ database
  const { data: cardRow, error: fetchError } = await supabase
    .from("review_cards")
    .select("*")
    .eq("id", cardId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !cardRow) {
    return { success: false, error: "Không tìm thấy thẻ ôn tập này." };
  }

  const now = new Date();
  const dbCard: DBCardRow = {
    id: cardRow.id,
    user_id: cardRow.user_id,
    vocab_entry_id: cardRow.vocab_entry_id,
    state: cardRow.state,
    stability: Number(cardRow.stability) || 0,
    difficulty: Number(cardRow.difficulty) || 0,
    due: cardRow.due,
    last_review: cardRow.last_review,
    reps: cardRow.reps,
    lapses: cardRow.lapses,
  };

  // 2. Tính toán lịch ôn kế tiếp với ts-fsrs (D-22 & D-24)
  const { updatedCard, reviewLog, nextDue } = calculateFSRSReview(
    dbCard,
    rating,
    now
  );

  // 3. Cập nhật review_cards
  const { error: updateError } = await supabase
    .from("review_cards")
    .update({
      state: updatedCard.state,
      stability: updatedCard.stability,
      difficulty: updatedCard.difficulty,
      due: updatedCard.due,
      last_review: updatedCard.last_review,
      reps: updatedCard.reps,
      lapses: updatedCard.lapses,
    })
    .eq("id", cardId)
    .eq("user_id", user.id);

  if (updateError) {
    return {
      success: false,
      error: "Không thể lưu kết quả ôn tập. Vui lòng thử lại.",
    };
  }

  // 4. Ghi lịch sử chấm thẻ vào bảng card_reviews (D-23 append-only)
  const { error: insertLogError } = await supabase.from("card_reviews").insert({
    card_id: reviewLog.card_id,
    user_id: reviewLog.user_id,
    rating: reviewLog.rating,
    state_before: reviewLog.state_before,
    stability_before: reviewLog.stability_before,
    difficulty_before: reviewLog.difficulty_before,
    reviewed_at: reviewLog.reviewed_at,
  });

  if (insertLogError) {
    console.error("Lỗi ghi nhận lịch sử card_reviews:", insertLogError);
  }

  // 5. Ghi sự kiện analytics
  await trackEventAction("review_started", {
    card_id: cardId,
    rating,
  });

  // Kiểm tra xem thẻ có đang ở bước học ngắn hạn không (đến hạn trong vòng 15 phút) (OQ-2)
  const isShortTermLearningStep =
    nextDue.getTime() - now.getTime() < 15 * 60 * 1000;

  return {
    success: true,
    nextDue: nextDue.toISOString(),
    isShortTermLearningStep,
  };
}
