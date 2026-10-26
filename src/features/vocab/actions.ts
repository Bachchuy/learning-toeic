"use server";

import { createClient } from "@/lib/supabase/server";
import { normalizeLemma } from "@/core/vocab";
import { enrichVocabMetadata } from "@/core/vocabDictionary";
import { trackEventAction } from "@/features/practice/actions";
import {
  CURATED_DECKS,
  getCuratedDeckById,
  type CuratedDeckMeta,
} from "@/data/curated-decks";
import type {
  SaveVocabParams,
  SaveVocabResult,
  SaveBatchVocabParams,
  SaveBatchVocabResult,
  VocabEntry,
  VocabMetadata,
  Notebook,
} from "./types";

/**
 * Server Action: Lưu từ vựng mới vào sổ từ
 * BẤT BIẾN §4.6 & PD-01:
 * - Chuẩn hóa lemma = normalizeLemma(word)
 * - Unique (user_id, lemma): trùng thì báo nhẹ "Từ này đã có trong sổ"
 * - Tự động tạo review_cards (due = now) qua trigger Postgres
 * - Ghi event analytics "vocab_saved"
 */
export async function saveVocabAction(
  params: SaveVocabParams
): Promise<SaveVocabResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Vui lòng đăng nhập để lưu từ vựng vào sổ cá nhân.",
    };
  }

  const rawWord = params.word.trim();
  const lemma = normalizeLemma(rawWord);
  const meaning = params.meaning.trim();
  const contextSentence = params.contextSentence.trim();

  if (!lemma) {
    return {
      success: false,
      message: "Từ vựng không được để trống.",
    };
  }

  if (!meaning) {
    return {
      success: false,
      message: "Vui lòng nhập nghĩa tiếng Việt cho từ.",
    };
  }

  // Làm giàu dữ liệu từ vựng (Họ từ, Đồng nghĩa, Trái nghĩa, Collocations, IPA)
  const enrichment = enrichVocabMetadata(rawWord, meaning, contextSentence);
  const partOfSpeech = params.partOfSpeech || enrichment.part_of_speech || "";
  const phonetic = params.phonetic || enrichment.phonetic || "";
  const contextTranslation =
    params.contextTranslation || enrichment.context_translation || "";
  const metadata = enrichment.metadata;

  // 1. Thêm từ vào bảng vocab_entries
  const { data, error } = await supabase
    .from("vocab_entries")
    .insert({
      user_id: user.id,
      word: rawWord,
      lemma,
      meaning,
      context_sentence: contextSentence,
      part_of_speech: partOfSpeech,
      phonetic,
      context_translation: contextTranslation,
      metadata,
      source_question_id: params.questionId || null,
      notebook_id: params.notebookId || null,
    })
    .select()
    .single();

  if (error) {
    // Mã lỗi Postgres 23505 = unique_violation trên (user_id, lemma)
    if (error.code === "23505" || error.message.includes("unique")) {
      return {
        success: false,
        isDuplicate: true,
        message: "Từ này đã có trong sổ",
      };
    }

    return {
      success: false,
      message: "Không thể lưu từ lúc này. Vui lòng thử lại sau.",
    };
  }

  // 2. Ghi nhận sự kiện vocab_saved
  await trackEventAction("vocab_saved", {
    lemma,
    source_question_id: params.questionId,
  });

  return {
    success: true,
    message: "Đã thêm vào sổ từ vựng thành công!",
    entry: data as VocabEntry,
  };
}

/**
 * Server Action: Lưu nhiều từ vựng cùng một lúc (Batch Save)
 * Cho phép người học chọn nhiều từ trọng tâm trong câu và lưu chỉ bằng 1 thao tác.
 */
export async function saveBatchVocabAction(
  params: SaveBatchVocabParams
): Promise<SaveBatchVocabResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      savedCount: 0,
      duplicateCount: 0,
      message: "Vui lòng đăng nhập để lưu từ vựng vào sổ cá nhân.",
    };
  }

  const validItems = params.items
    .map((item) => ({
      word: item.word.trim(),
      lemma: normalizeLemma(item.word),
      meaning: item.meaning.trim(),
      partOfSpeech: item.partOfSpeech || "",
      phonetic: item.phonetic || "",
    }))
    .filter((item) => item.lemma && item.meaning);

  if (validItems.length === 0) {
    return {
      success: false,
      savedCount: 0,
      duplicateCount: 0,
      message: "Vui lòng chọn hoặc nhập ít nhất một từ vựng hợp lệ kèm nghĩa.",
    };
  }

  let savedCount = 0;
  let duplicateCount = 0;
  const contextSentence = params.contextSentence.trim();

  for (const item of validItems) {
    const enrichment = enrichVocabMetadata(item.word, item.meaning, contextSentence);
    const partOfSpeech = item.partOfSpeech || enrichment.part_of_speech || "";
    const phonetic = item.phonetic || enrichment.phonetic || "";
    const contextTranslation =
      params.contextTranslation || enrichment.context_translation || "";
    const metadata = enrichment.metadata;

    const { error } = await supabase.from("vocab_entries").insert({
      user_id: user.id,
      word: item.word,
      lemma: item.lemma,
      meaning: item.meaning,
      context_sentence: contextSentence,
      part_of_speech: partOfSpeech,
      phonetic,
      context_translation: contextTranslation,
      metadata,
      source_question_id: params.questionId || null,
      notebook_id: params.notebookId || null,
    });

    if (error) {
      if (error.code === "23505" || error.message.includes("unique")) {
        duplicateCount++;
      }
    } else {
      savedCount++;
      await trackEventAction("vocab_saved", {
        lemma: item.lemma,
        source_question_id: params.questionId,
      });
    }
  }

  if (savedCount === 0 && duplicateCount > 0) {
    return {
      success: false,
      savedCount: 0,
      duplicateCount,
      message:
        duplicateCount === 1
          ? "Từ này đã có trong sổ từ vựng."
          : `Cả ${duplicateCount} từ này đều đã có sẵn trong sổ từ.`,
    };
  }

  let successMsg = `Đã lưu thành công ${savedCount} từ vựng vào sổ từ!`;
  if (duplicateCount > 0) {
    successMsg = `Đã lưu ${savedCount} từ mới (${duplicateCount} từ đã có trong sổ).`;
  }

  return {
    success: true,
    savedCount,
    duplicateCount,
    message: successMsg,
  };
}

/**
 * Server Action: Lấy danh sách từ vựng kèm thẻ ôn FSRS
 */
export async function getVocabListAction(
  filter: "all" | "due" = "all",
  searchQuery: string = ""
): Promise<{ entries: VocabEntry[]; dueCount: number; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { entries: [], dueCount: 0, error: "Chưa đăng nhập" };
  }

  // Truy vấn từ vựng của user kèm thông tin thẻ review_cards
  let query = supabase
    .from("vocab_entries")
    .select(`
      id,
      user_id,
      word,
      lemma,
      meaning,
      context_sentence,
      part_of_speech,
      phonetic,
      context_translation,
      metadata,
      source_question_id,
      notebook_id,
      created_at,
      review_cards (
        id,
        state,
        stability,
        difficulty,
        due,
        reps,
        lapses
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    query = query.or(`word.ilike.%${q}%,meaning.ilike.%${q}%`);
  }

  const { data, error } = await query;

  if (error || !data) {
    return { entries: [], dueCount: 0, error: error?.message };
  }

  const now = new Date();

  interface RawCardRow {
    id: string;
    state: number;
    stability: number;
    difficulty: number;
    due: string;
    reps: number;
    lapses: number;
  }

  interface RawVocabRow {
    id: string;
    user_id: string;
    word: string;
    lemma: string;
    meaning: string;
    context_sentence: string;
    part_of_speech?: string;
    phonetic?: string;
    context_translation?: string;
    metadata?: VocabMetadata;
    source_question_id: string | null;
    notebook_id?: string | null;
    created_at: string;
    review_cards: RawCardRow | RawCardRow[] | null;
  }

  const rawRows = data as unknown as RawVocabRow[];

  // Chuẩn hóa cấu trúc kết quả
  const allEntries: VocabEntry[] = rawRows.map((item) => {
    const card = Array.isArray(item.review_cards)
      ? item.review_cards[0]
      : item.review_cards;

    // Tự động làm giàu metadata nếu bản ghi cũ chưa có hoặc chứa mẫu câu cũ rập khuôn
    const isOldBoilerplate =
      item.metadata?.detailed_explanation?.includes("Thuật ngữ chuyên môn") ||
      item.metadata?.detailed_explanation?.includes("thường xuyên xuất hiện trong các bài thi TOEIC");

    const enriched = enrichVocabMetadata(
      item.word,
      item.meaning,
      item.context_sentence
    );

    const metadata =
      item.metadata && Object.keys(item.metadata).length > 0 && !isOldBoilerplate
        ? item.metadata
        : enriched.metadata;

    const partOfSpeech = item.part_of_speech || enriched.part_of_speech || "";
    const phonetic = item.phonetic || metadata.phonetic || enriched.phonetic || "";

    return {
      id: item.id,
      user_id: item.user_id,
      word: item.word,
      lemma: item.lemma,
      meaning: item.meaning,
      context_sentence: item.context_sentence,
      part_of_speech: partOfSpeech,
      phonetic,
      context_translation: item.context_translation || "",
      metadata,
      source_question_id: item.source_question_id,
      notebook_id: item.notebook_id ?? null,
      created_at: item.created_at,
      card: card
        ? {
            id: card.id,
            state: card.state,
            stability: Number(card.stability),
            difficulty: Number(card.difficulty),
            due: card.due,
            reps: card.reps,
            lapses: card.lapses,
          }
        : undefined,
    };
  });

  // Đếm số lượng thẻ đến hạn ôn
  const dueCount = allEntries.filter((e) => {
    if (!e.card?.due) return false;
    return new Date(e.card.due) <= now;
  }).length;

  // Lọc theo tab
  const filteredEntries =
    filter === "due"
      ? allEntries.filter((e) => e.card?.due && new Date(e.card.due) <= now)
      : allEntries;

  return {
    entries: filteredEntries,
    dueCount,
  };
}

/**
 * Server Action: Chỉnh sửa nghĩa tiếng Việt tại chỗ (Inline edit)
 */
export async function updateVocabMeaningAction(
  vocabId: string,
  meaning: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Vui lòng đăng nhập" };
  }

  const trimmedMeaning = meaning.trim();
  if (!trimmedMeaning) {
    return { success: false, message: "Nghĩa tiếng Việt không được để trống" };
  }

  const { error } = await supabase
    .from("vocab_entries")
    .update({ meaning: trimmedMeaning })
    .eq("id", vocabId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: "Không thể cập nhật nghĩa" };
  }

  return { success: true, message: "Đã cập nhật nghĩa thành công!" };
}

/**
 * Server Action: Xóa từ vựng khỏi sổ từ (Tự động CASCADE xóa review_cards)
 */
export async function deleteVocabAction(
  vocabId: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Vui lòng đăng nhập" };
  }

  const { error } = await supabase
    .from("vocab_entries")
    .delete()
    .eq("id", vocabId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: "Không thể xóa từ lúc này" };
  }

  return { success: true, message: "Đã xóa từ khỏi sổ từ vựng" };
}

interface RawNotebookRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  created_at: string;
  vocab_entries?: { count: number }[];
}

/**
 * Lấy danh sách sổ từ vựng của người dùng kèm số lượng từ
 */
export async function getNotebooksAction(): Promise<Notebook[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("notebooks")
    .select("*, vocab_entries(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const rows = data as unknown as RawNotebookRow[];

  return rows.map((nb) => ({
    id: nb.id,
    user_id: nb.user_id,
    name: nb.name,
    description: nb.description || "",
    color: nb.color || "#2563EB",
    icon: nb.icon || "folder",
    created_at: nb.created_at,
    word_count: nb.vocab_entries?.[0]?.count ?? 0,
  }));
}

/**
 * Tạo sổ từ vựng mới
 */
export async function createNotebookAction(
  name: string,
  description?: string,
  color?: string
): Promise<{ success: boolean; notebook?: Notebook; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Vui lòng đăng nhập để tạo sổ." };
  }

  const trimmed = name.trim();
  if (!trimmed) {
    return { success: false, message: "Tên sổ không được để trống." };
  }

  const { data, error } = await supabase
    .from("notebooks")
    .insert({
      user_id: user.id,
      name: trimmed,
      description: description?.trim() || "",
      color: color || "#2563EB",
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, message: "Không thể tạo sổ lúc này." };
  }

  return {
    success: true,
    notebook: { ...data, word_count: 0 },
    message: "Tạo sổ từ vựng thành công!",
  };
}

/**
 * Xóa sổ từ vựng (Các từ trong sổ sẽ chuyển về trạng thái không phân loại)
 */
export async function deleteNotebookAction(
  notebookId: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Vui lòng đăng nhập." };
  }

  const { error } = await supabase
    .from("notebooks")
    .delete()
    .eq("id", notebookId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: "Không thể xóa sổ lúc này." };
  }

  return { success: true, message: "Đã xóa sổ từ vựng." };
}

/**
 * Di chuyển từ vựng sang một sổ khác
 */
export async function moveVocabToNotebookAction(
  vocabId: string,
  notebookId: string | null
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Vui lòng đăng nhập." };
  }

  const { error } = await supabase
    .from("vocab_entries")
    .update({ notebook_id: notebookId })
    .eq("id", vocabId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: "Không thể chuyển sổ lúc này." };
  }

  return { success: true, message: "Đã chuyển sổ thành công!" };
}

export interface CuratedDeckStatus {
  deck: CuratedDeckMeta;
  isImported: boolean;
  notebookId?: string;
  userCardsCount: number;
}

/**
 * Lấy danh sách các bộ thẻ mẫu chuẩn (Curated Decks) kèm trạng thái học của user
 */
export async function getCuratedDecksAction(): Promise<{
  decks: CuratedDeckStatus[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      decks: CURATED_DECKS.map((deck) => ({
        deck,
        isImported: false,
        userCardsCount: 0,
      })),
    };
  }

  // Lấy các notebook của user kèm số lượng từ
  const { data: notebooks } = await supabase
    .from("notebooks")
    .select(`
      id,
      name,
      vocab_entries(count)
    `)
    .eq("user_id", user.id);

  const notebookMap = new Map<string, { id: string; count: number }>();
  if (notebooks) {
    for (const nb of notebooks) {
      const rawEntries = nb.vocab_entries as unknown as Array<{ count: number }> | undefined;
      const count = rawEntries?.[0]?.count ?? 0;
      notebookMap.set(nb.name, { id: nb.id, count });
    }
  }

  const results: CuratedDeckStatus[] = CURATED_DECKS.map((deck) => {
    const existing = notebookMap.get(deck.title);
    return {
      deck,
      isImported: !!existing && existing.count > 0,
      notebookId: existing?.id,
      userCardsCount: existing?.count || 0,
    };
  });

  return { decks: results };
}

/**
 * Server Action: Nạp bộ thẻ chuẩn vào Sổ từ vựng cá nhân
 * - Tạo notebook tương ứng (nếu chưa có)
 * - Tự động lọc trùng các từ đã có trong sổ
 * - Batch insert vào vocab_entries
 * - Kích hoạt Postgres Trigger tạo thẻ FSRS trong review_cards
 */
export async function importCuratedDeckAction(deckId: string): Promise<{
  success: boolean;
  message: string;
  notebook?: Notebook;
  importedCount?: number;
  existingCount?: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Vui lòng đăng nhập để nạp bộ thẻ." };
  }

  const deck = getCuratedDeckById(deckId);
  if (!deck) {
    return { success: false, message: "Không tìm thấy bộ thẻ yêu cầu." };
  }

  // 1. Tìm hoặc tạo Sổ từ vựng tương ứng cho người dùng
  const { data: existingNotebooks } = await supabase
    .from("notebooks")
    .select("*")
    .eq("user_id", user.id)
    .eq("name", deck.title);

  let notebook = existingNotebooks?.[0];
  if (!notebook) {
    const { data: newNotebook, error: nbError } = await supabase
      .from("notebooks")
      .insert({
        user_id: user.id,
        name: deck.title,
        description: deck.description,
        color: deck.color,
        icon: deck.icon,
      })
      .select()
      .single();

    if (nbError || !newNotebook) {
      return { success: false, message: "Không thể tạo sổ cho bộ thẻ này." };
    }
    notebook = newNotebook;
  }

  // 2. Lấy danh sách lemma đã có của người dùng để tránh trùng khóa unique(user_id, lemma)
  const { data: userEntries } = await supabase
    .from("vocab_entries")
    .select("id, lemma, notebook_id")
    .eq("user_id", user.id);

  const existingLemmas = new Set(
    (userEntries || []).map((e: { lemma: string }) => e.lemma)
  );

  // 3. Lọc và chuẩn hóa danh sách từ cần nạp (Deduplicate lemma trong chính bộ thẻ và so với sổ người dùng)
  const seenLemmas = new Set(existingLemmas);
  const itemsToInsert: typeof deck.items = [];

  for (const item of deck.items) {
    const lemma = normalizeLemma(item.word);
    if (!lemma) continue;
    if (seenLemmas.has(lemma)) {
      // Nếu từ xuất hiện nhiều lần (ví dụ vừa là noun vừa là verb), gộp nghĩa
      const existingIdx = itemsToInsert.findIndex(
        (i) => normalizeLemma(i.word) === lemma
      );
      if (existingIdx >= 0) {
        itemsToInsert[existingIdx] = {
          ...itemsToInsert[existingIdx],
          meaning: `${itemsToInsert[existingIdx].meaning}; ${item.meaning}`,
        };
      }
      continue;
    }
    seenLemmas.add(lemma);
    itemsToInsert.push({ ...item });
  }

  // 4. Batch insert theo từng chunk 50 từ (Postgres trigger tự động tạo review_cards FSRS)
  const CHUNK_SIZE = 50;
  let totalInserted = 0;

  for (let i = 0; i < itemsToInsert.length; i += CHUNK_SIZE) {
    const chunk = itemsToInsert.slice(i, i + CHUNK_SIZE);
    const rows = chunk.map((item) => ({
      user_id: user.id,
      word: item.word.trim(),
      lemma: normalizeLemma(item.word),
      meaning: item.meaning.trim(),
      context_sentence: item.example ? item.example.trim() : "",
      part_of_speech: item.part_of_speech || "",
      phonetic: item.phonetic || "",
      context_translation: item.example_translation ? item.example_translation.trim() : "",
      metadata: {
        topic: item.topic,
        detailed_explanation: item.explanation,
        image_url: item.image_url,
        audio_url: item.audio_url,
      },
      notebook_id: notebook.id,
    }));

    const { error: insertError } = await supabase
      .from("vocab_entries")
      .upsert(rows, { onConflict: "user_id,lemma", ignoreDuplicates: true });

    if (insertError) {
      console.error("Lỗi khi batch insert bộ thẻ:", insertError);
    } else {
      totalInserted += rows.length;
    }
  }

  await trackEventAction("vocab_saved", {
    deck_id: deck.id,
    imported_count: totalInserted,
  });

  return {
    success: true,
    message:
      totalInserted > 0
        ? `Đã nạp thành công ${totalInserted} thẻ vào sổ "${deck.title}"!`
        : `Tất cả các thẻ trong bộ "${deck.title}" đã có sẵn trong sổ từ của bạn.`,
    notebook,
    importedCount: totalInserted,
    existingCount: deck.items.length - totalInserted,
  };
}


