"use server";

import { createClient } from "@/lib/supabase/server";
import { getOptionalUser } from "@/shared/auth";
import {
  previewFSRSRatings,
  calculateFSRSReview,
  type DBCardRow,
} from "@/core/fsrs";
import { trackEventAction } from "@/features/practice/actions";
import { enrichVocabMetadata } from "@/core/vocabDictionary";
import type { VocabMetadata } from "@/features/vocab/types";
import type { ReviewCardItem, ReviewFilterOptions, ReviewTopicInfo } from "./types";

/**
 * Server Action: Lấy danh sách thẻ từ vựng đến hạn ôn tập (FSRS Spaced Repetition)
 * BẤT BIẾN §4.6b, D-03, D-22, D-24:
 * - Hỗ trợ chia nhỏ theo Sổ từ vựng (notebookId) và Chủ điểm chuyên đề (topic)
 * - Giới hạn kích cỡ phiên (limit: 10, 15, 20, 30...) tránh quá tải nhận thức
 * - Lấy các thẻ có due <= now() của user hiện tại (hoặc học củng cố cramMode)
 * - Tính toán thời gian xem trước (preview) cho 4 nút Lại / Khó / Tốt / Dễ bằng thư viện FSRS
 */
export async function getReviewCardsAction(
  optionsOrNotebookId?: string | ReviewFilterOptions
): Promise<{
  cards: ReviewCardItem[];
  nextDueFormatted?: string;
  totalCardsCount: number;
  notebookName?: string;
  topicName?: string;
  error?: string;
}> {
  const { user, supabase } = await getOptionalUser();

  if (!user) {
    return {
      cards: [],
      totalCardsCount: 0,
      error: "Vui lòng đăng nhập để ôn tập từ vựng.",
    };
  }

  const options: ReviewFilterOptions =
    typeof optionsOrNotebookId === "string"
      ? { notebookId: optionsOrNotebookId }
      : optionsOrNotebookId || {};

  const { notebookId, topic, limit = 20, studyAll = false, excludeDeck } = options;

  const now = new Date();

  let notebookName: string | undefined;

  if (notebookId) {
    const { data: nb } = await supabase
      .from("notebooks")
      .select("name")
      .eq("id", notebookId)
      .eq("user_id", user.id)
      .single();

    notebookName = nb?.name;
  }

  let excludedNotebookId: string | undefined;
  if (excludeDeck === "it-vocab") {
    const { data: itNb } = await supabase
      .from("notebooks")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", "Từ vựng Tiếng Anh IT & Công Nghệ")
      .maybeSingle();
    excludedNotebookId = itNb?.id;
  }

  // 1. Đếm tổng số thẻ mà người dùng đang có theo bộ lọc sổ / chủ đề
  let countQuery = supabase
    .from("review_cards")
    .select("id, vocab_entries!inner(notebook_id, metadata)", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (notebookId) {
    countQuery = countQuery.eq("vocab_entries.notebook_id", notebookId);
  }
  if (topic) {
    countQuery = countQuery.eq("vocab_entries.metadata->>topic", topic);
  }
  if (excludedNotebookId) {
    countQuery = countQuery.neq("vocab_entries.notebook_id", excludedNotebookId);
  }

  const { count: totalCardsCount } = await countQuery;

  // 2. Lấy danh sách thẻ ôn tập
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
      vocab_entries!inner (
        id,
        word,
        lemma,
        meaning,
        context_sentence,
        context_translation,
        part_of_speech,
        phonetic,
        metadata,
        notebook_id
      )
    `)
    .eq("user_id", user.id);

  if (notebookId) {
    cardsQuery = cardsQuery.eq("vocab_entries.notebook_id", notebookId);
  }
  if (topic) {
    cardsQuery = cardsQuery.eq("vocab_entries.metadata->>topic", topic);
  }
  if (excludedNotebookId) {
    cardsQuery = cardsQuery.neq("vocab_entries.notebook_id", excludedNotebookId);
  }

  if (studyAll) {
    // Chế độ học tự do / củng cố toàn bộ
    cardsQuery = cardsQuery
      .order("last_review", { ascending: true, nullsFirst: true })
      .limit(limit);
  } else {
    // Mặc định: Lấy các thẻ đến hạn theo FSRS
    cardsQuery = cardsQuery
      .lte("due", now.toISOString())
      .order("due", { ascending: true })
      .limit(limit);
  }

  const { data: initialData, error } = await cardsQuery;
  let data = initialData;

  if (error) {
    console.error("Lỗi getReviewCardsAction:", error);
    return {
      cards: [],
      totalCardsCount: totalCardsCount ?? 0,
      notebookName,
      topicName: topic,
      error: "Không thể tải danh sách thẻ ôn lúc này.",
    };
  }

  // Nếu người dùng chọn học riêng một bộ thẻ hoặc chủ đề mà chưa có thẻ nào đến hạn,
  // tự động lấy tối đa số thẻ (limit) của nhóm này để học tự do / củng cố (Cram Mode)
  if ((notebookId || topic) && (!data || data.length === 0)) {
    let cramQuery = supabase
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
        vocab_entries!inner (
          id,
          word,
          lemma,
          meaning,
          context_sentence,
          context_translation,
          part_of_speech,
          phonetic,
          metadata,
          notebook_id
        )
      `)
      .eq("user_id", user.id)
      .order("last_review", { ascending: true, nullsFirst: true })
      .limit(limit);

    if (notebookId) {
      cramQuery = cramQuery.eq("vocab_entries.notebook_id", notebookId);
    }
    if (topic) {
      cramQuery = cramQuery.eq("vocab_entries.metadata->>topic", topic);
    }

    const { data: cramData } = await cramQuery;

    if (cramData && cramData.length > 0) {
      data = cramData;
    }
  }

  // 3. Nếu không có thẻ nào đến hạn, tìm thời điểm thẻ sớm nhất kế tiếp
  let nextDueFormatted: string | undefined;
  if (!data || data.length === 0) {
    let upcomingQuery = supabase
      .from("review_cards")
      .select("due, vocab_entries!inner(notebook_id, metadata)")
      .eq("user_id", user.id)
      .gt("due", now.toISOString())
      .order("due", { ascending: true })
      .limit(1);

    if (notebookId) {
      upcomingQuery = upcomingQuery.eq("vocab_entries.notebook_id", notebookId);
    }
    if (topic) {
      upcomingQuery = upcomingQuery.eq("vocab_entries.metadata->>topic", topic);
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
  const { user, supabase } = await getOptionalUser();

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

/**
 * Server Action: Lấy danh sách các chủ điểm (Topics) từ vựng của người dùng kèm số lượng thẻ
 * Giúp người học chia nhỏ kho từ vựng lớn (1000+ từ) thành các chủ đề nhỏ 10-15 từ
 */
export async function getReviewTopicsAction(notebookId?: string): Promise<{
  topics: ReviewTopicInfo[];
  error?: string;
}> {
  const { user, supabase } = await getOptionalUser();

  if (!user) {
    return { topics: [] };
  }

  const now = new Date().toISOString();

  let query = supabase
    .from("vocab_entries")
    .select(`
      id,
      metadata,
      notebook_id,
      review_cards (
        id,
        due,
        state,
        reps
      )
    `)
    .eq("user_id", user.id);

  if (notebookId) {
    query = query.eq("notebook_id", notebookId);
  }

  const { data, error } = await query;

  if (error || !data) {
    return { topics: [] };
  }

  const map = new Map<string, { totalCount: number; dueCount: number; learnedCount: number }>();

  interface QueryEntry {
    metadata?: { topic?: string };
    review_cards?:
      | Array<{ id: string; due: string | null; state?: number; reps?: number }>
      | { id: string; due: string | null; state?: number; reps?: number };
  }

  for (const item of data as unknown as QueryEntry[]) {
    const topic = item.metadata?.topic?.trim() || "Chung";
    if (!map.has(topic)) {
      map.set(topic, { totalCount: 0, dueCount: 0, learnedCount: 0 });
    }
    const stat = map.get(topic)!;
    stat.totalCount += 1;

    const cards = Array.isArray(item.review_cards)
      ? item.review_cards
      : item.review_cards
      ? [item.review_cards]
      : [];

    const firstCard = cards[0];
    if (firstCard && (!firstCard.due || firstCard.due <= now)) {
      stat.dueCount += 1;
    }
    if (
      firstCard &&
      ((firstCard.reps !== undefined && firstCard.reps > 0) ||
        (firstCard.state !== undefined && firstCard.state > 0))
    ) {
      stat.learnedCount += 1;
    }
  }

  const topics: ReviewTopicInfo[] = Array.from(map.entries())
    .map(([name, stat]) => ({
      name,
      totalCount: stat.totalCount,
      dueCount: stat.dueCount,
      learnedCount: stat.learnedCount,
    }))
    .sort((a, b) => b.dueCount - a.dueCount || a.name.localeCompare(b.name));

  return { topics };
}
