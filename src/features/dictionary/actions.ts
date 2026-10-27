"use server";

import { createClient } from "@/lib/supabase/server";
import {
  normalizeWord,
  parseFreeDictResponse,
  CURATED_TOEIC_TERMS,
  type DictionaryEntry,
  type FreeDictApiResponseItem,
} from "@/core/dictionary";
import { getDualPronunciation } from "@/core/vocab";
import { resolvePhonetic } from "@/core/phonetic";

/**
 * Server Action: Tra cứu từ điển thông minh (Hybrid Smart Cache)
 * 1. Kiểm tra trong Supabase dictionary_cache (O(log N) B-Tree lookup < 1ms)
 * 2. Nếu chưa có -> Gọi Free Dictionary API lấy audio US và definitions
 * 3. Tự động lưu cache để phục vụ cho các học viên khác
 */
export async function lookupWordAction(rawWord: string): Promise<DictionaryEntry | null> {
  const word = normalizeWord(rawWord);
  if (!word || word.length < 2) return null;

  try {
    const supabase = await createClient();

    // 1. Kiểm tra cache trong Database Supabase
    const { data: cached, error: cacheError } = await supabase
      .from("dictionary_cache")
      .select("*")
      .eq("word", word)
      .maybeSingle();

    if (!cacheError && cached) {
      // Cập nhật số lượt tra cứu (await thay vì fire-and-forget)
      const { error: updateError } = await supabase
        .from("dictionary_cache")
        .update({
          lookup_count: (cached.lookup_count || 1) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", cached.id);

      if (updateError) {
        console.warn("[DictionaryCache] Lỗi cập nhật lookup_count:", updateError);
      }

      return {
        id: cached.id,
        word: cached.word,
        phonetic: cached.phonetic || "",
        part_of_speech: cached.part_of_speech || "",
        meaning_vi: cached.meaning_vi || "",
        definition_en: cached.definition_en || "",
        audio_url: cached.audio_url || "",
        examples: cached.examples || [],
        word_family: cached.word_family || [],
        collocations: cached.collocations || [],
        lookup_count: cached.lookup_count,
      };
    }

    // 2. Nhận diện loại từ (Cụm từ hoặc Từ loại kép)
    const isPhrase = word.includes(" ") || word.includes("-");
    const dual = getDualPronunciation(word);
    const resolvedIpa = resolvePhonetic(word);

    // 3. Chưa có trong cache -> Gọi Free Dictionary API bên ngoài (nếu là từ đơn)
    let apiEntry: Partial<DictionaryEntry> | null = null;
    if (!isPhrase) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 giây timeout

        const res = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = (await res.json()) as FreeDictApiResponseItem[];
          if (json && json.length > 0) {
            apiEntry = parseFreeDictResponse(json[0]);
          }
        }
      } catch {
        // Không kết nối được API bên ngoài -> fallback sang từ điển nội bộ
      }
    }

    // 4. Kết hợp với kho từ vựng TOEIC tuyển chọn và hệ thống ngữ âm kép
    const curated = CURATED_TOEIC_TERMS[word];
    const newEntry: DictionaryEntry = {
      word,
      phonetic:
        curated?.phonetic ||
        apiEntry?.phonetic ||
        (dual ? `[n] ${dual.nounIpa} · [v] ${dual.verbIpa}` : resolvedIpa) ||
        "",
      part_of_speech:
        curated?.part_of_speech ||
        (dual ? "noun_verb" : isPhrase ? "phrase" : apiEntry?.part_of_speech || ""),
      meaning_vi:
        curated?.meaning_vi ||
        (dual ? `[n] ${dual.nounMeaning} · [v] ${dual.verbMeaning}` : apiEntry?.meaning_vi || ""),
      definition_en: apiEntry?.definition_en || "",
      audio_url: isPhrase ? "" : (apiEntry?.audio_url || ""),
      examples:
        curated?.examples && curated.examples.length > 0
          ? curated.examples
          : apiEntry?.examples || [],
      word_family: curated?.word_family || apiEntry?.word_family || [],
      collocations: curated?.collocations || apiEntry?.collocations || [],
      lookup_count: 1,
    };

    // 4. Lưu vào dictionary_cache trong database
    const { data: inserted } = await supabase
      .from("dictionary_cache")
      .upsert(
        {
          word: newEntry.word,
          phonetic: newEntry.phonetic,
          part_of_speech: newEntry.part_of_speech,
          meaning_vi: newEntry.meaning_vi,
          definition_en: newEntry.definition_en,
          audio_url: newEntry.audio_url,
          examples: newEntry.examples,
          word_family: newEntry.word_family,
          collocations: newEntry.collocations,
          lookup_count: 1,
        },
        { onConflict: "word" }
      )
      .select()
      .maybeSingle();

    if (inserted) {
      newEntry.id = inserted.id;
    }

    return newEntry;
  } catch (error) {
    console.error("Lỗi tra cứu từ điển:", error);
    // Dự phòng an toàn tuyệt đối, không làm crash ứng dụng
    const curated = CURATED_TOEIC_TERMS[word];
    if (curated) {
      return {
        word,
        phonetic: "",
        part_of_speech: curated.part_of_speech,
        meaning_vi: curated.meaning_vi,
        definition_en: "",
        audio_url: "",
        examples: [],
        word_family: curated.word_family,
        collocations: curated.collocations,
        lookup_count: 1,
      };
    }
    return null;
  }
}
