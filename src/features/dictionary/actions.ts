"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getOptionalUser } from "@/shared/auth";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  normalizeWord,
  parseFreeDictEntries,
  validateSafeAudioUrl,
  CURATED_TOEIC_TERMS,
  type DictionaryEntry,
  type FreeDictApiResponseItem,
} from "@/core/dictionary";
import { getDualPronunciation } from "@/core/vocab";
import { resolvePhonetic } from "@/core/phonetic";

function sanitizeAudioField(rawUrl?: string | null): string {
  const trimmed = (rawUrl || "").trim();
  if (trimmed.startsWith("/api/audio/tts?")) {
    return trimmed;
  }
  return validateSafeAudioUrl(trimmed);
}

/**
 * Server Action: Tra cứu từ điển thông minh (Hybrid Smart Cache)
 * 1. Bắt buộc xác thực người dùng (chống ẩn danh lạm dụng service_role ghi DB)
 * 2. Kiểm tra trong Supabase dictionary_cache (O(log N) B-Tree lookup < 1ms)
 * 3. Nếu chưa có -> Gọi Free Dictionary API lấy audio US và definitions
 * 4. Chỉ lưu cache khi có dữ liệu thực chất (không lưu dòng rỗng cho từ vô nghĩa)
 */
export async function lookupWordAction(rawWord: string): Promise<DictionaryEntry | null> {
  const word = normalizeWord(rawWord);
  if (!word || word.length < 2) return null;

  try {
    const { user, supabase } = await getOptionalUser();
    if (!user) return null;

    const rl = checkRateLimit(`dict:${user.id}`, { limit: 30, windowMs: 60_000 });
    if (!rl.allowed) return null;

    // 1. Kiểm tra cache trong Database Supabase
    const { data: cached, error: cacheError } = await supabase
      .from("dictionary_cache")
      .select("*")
      .eq("word", word)
      .maybeSingle();

    if (!cacheError && cached) {
      // Cập nhật số lượt tra cứu an toàn qua Backend Admin Client (service_role)
      try {
        const adminClient = createAdminClient();
        await adminClient
          .from("dictionary_cache")
          .update({
            lookup_count: (cached.lookup_count || 1) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", cached.id);
      } catch (updateErr) {
        console.warn("[DictionaryCache] Lỗi cập nhật lookup_count:", updateErr);
      }

      return {
        id: cached.id,
        word: cached.word,
        phonetic: cached.phonetic || "",
        part_of_speech: cached.part_of_speech || "",
        meaning_vi: cached.meaning_vi || "",
        definition_en: cached.definition_en || "",
        audio_url: sanitizeAudioField(cached.audio_url || ""),
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
            apiEntry = parseFreeDictEntries(json);
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
      audio_url: isPhrase ? "" : (dual?.nounAudioUrl || apiEntry?.audio_url || ""),
      examples:
        curated?.examples && curated.examples.length > 0
          ? curated.examples
          : apiEntry?.examples || [],
      word_family: curated?.word_family || apiEntry?.word_family || [],
      collocations: curated?.collocations || apiEntry?.collocations || [],
      lookup_count: 1,
    };

    // 4. Kiểm định dữ liệu và chỉ lưu vào dictionary_cache nếu tra cứu có kết quả thực chất
    newEntry.audio_url = sanitizeAudioField(newEntry.audio_url);

    const hasMeaningfulData = Boolean(
      curated ||
        dual ||
        apiEntry ||
        newEntry.meaning_vi ||
        newEntry.definition_en ||
        newEntry.phonetic ||
        newEntry.audio_url
    );

    if (!hasMeaningfulData) {
      return null;
    }

    try {
      const adminClient = createAdminClient();
      const { data: inserted, error: upsertError } = await adminClient
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
            updated_at: new Date().toISOString(),
          },
          { onConflict: "word" }
        )
        .select()
        .maybeSingle();

      if (upsertError) {
        console.warn("[DictionaryCache] Lỗi upsert dictionary_cache:", upsertError);
      } else if (inserted) {
        newEntry.id = inserted.id;
      }
    } catch (saveErr) {
      console.warn("[DictionaryCache] Lỗi lưu cache qua admin client:", saveErr);
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
