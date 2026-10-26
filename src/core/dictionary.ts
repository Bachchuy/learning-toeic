/**
 * Module Tra Cứu Từ Điển Thông Minh (Smart Dictionary Core Service)
 * Hỗ trợ tra cứu nhanh, chuẩn hóa từ khóa, bóc tách audio chuẩn US và cây họ từ TOEIC.
 */

export interface DictionaryExample {
  en: string;
  vi?: string;
}

export interface WordFamilyItem {
  pos: string; // 'v' | 'n' | 'adj' | 'adv'
  word: string;
}

export interface DictionaryEntry {
  id?: string;
  word: string;
  phonetic: string;
  part_of_speech: string;
  meaning_vi: string;
  definition_en: string;
  audio_url: string;
  examples: DictionaryExample[];
  word_family: WordFamilyItem[];
  collocations: string[];
  lookup_count?: number;
}

export interface FreeDictPhonetic {
  text?: string;
  audio?: string;
}

export interface FreeDictDefinition {
  definition: string;
  example?: string;
}

export interface FreeDictMeaning {
  partOfSpeech: string;
  definitions: FreeDictDefinition[];
}

export interface FreeDictApiResponseItem {
  word: string;
  phonetic?: string;
  phonetics?: FreeDictPhonetic[];
  meanings?: FreeDictMeaning[];
}

/**
 * Chuẩn hóa từ khóa tra cứu:
 * - Chuyển chữ thường (lowercase)
 * - Cắt tỉa khoảng trắng đầu/cuối
 * - Loại bỏ các dấu câu liền kề (chấm, phẩy, ngoặc kép, ngoặc đơn)
 */
export function normalizeWord(raw: string): string {
  if (!raw) return "";
  let cleaned = raw.trim().toLowerCase();
  // Loại bỏ dấu câu ở đầu hoặc cuối từ (ví dụ: '"implement,' -> 'implement')
  cleaned = cleaned.replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()"'“’]+|[.,\/#!$%\^&\*;:{}=\-_`~()"'”’]+$/g, "");
  return cleaned;
}

/**
 * Chọn URL phát âm tối ưu nhất (Ưu tiên giọng Anh - Mỹ chuẩn US theo đề thi TOEIC)
 */
export function selectBestUsAudioUrl(phonetics?: FreeDictPhonetic[]): string {
  if (!phonetics || phonetics.length === 0) return "";

  // 1. Ưu tiên file có chứa '-us.mp3' hoặc '/us/'
  const usAudio = phonetics.find(
    (p) => p.audio && (p.audio.includes("-us.mp3") || p.audio.includes("/us/"))
  );
  if (usAudio?.audio) return usAudio.audio;

  // 2. Dự phòng: bất kỳ file audio nào có đuôi .mp3
  const anyMp3 = phonetics.find((p) => p.audio && p.audio.endsWith(".mp3"));
  if (anyMp3?.audio) return anyMp3.audio;

  // 3. Dự phòng cuối: bất kỳ audio nào không rỗng
  const anyAudio = phonetics.find((p) => p.audio && p.audio.trim().length > 0);
  return anyAudio?.audio ?? "";
}

/**
 * Kho từ vựng công sở TOEIC thông dụng có sẵn nghĩa tiếng Việt chuẩn
 */
export const CURATED_TOEIC_TERMS: Record<
  string,
  {
    meaning_vi: string;
    part_of_speech: string;
    collocations: string[];
    word_family: WordFamilyItem[];
  }
> = {
  implement: {
    meaning_vi: "Thi hành, thực hiện, triển khai (chính sách, kế hoạch)",
    part_of_speech: "verb",
    collocations: ["implement a policy", "implement new regulations", "implement changes"],
    word_family: [
      { pos: "v", word: "implement" },
      { pos: "n", word: "implementation" },
      { pos: "adj", word: "implementable" },
    ],
  },
  commence: {
    meaning_vi: "Bắt đầu, khởi đầu (buổi lễ, hợp đồng, dự án)",
    part_of_speech: "verb",
    collocations: ["commence operations", "commence work", "commence immediately"],
    word_family: [
      { pos: "v", word: "commence" },
      { pos: "n", word: "commencement" },
    ],
  },
  eligible: {
    meaning_vi: "Đủ tư cách, đủ điều kiện (hưởng trợ cấp, thăng chức)",
    part_of_speech: "adjective",
    collocations: ["eligible for promotion", "eligible to participate", "eligible candidates"],
    word_family: [
      { pos: "adj", word: "eligible" },
      { pos: "n", word: "eligibility" },
    ],
  },
  accommodate: {
    meaning_vi: "Đáp ứng (yêu cầu), chứa (số lượng người), cung cấp chỗ ở",
    part_of_speech: "verb",
    collocations: ["accommodate requests", "accommodate passengers", "accommodate large groups"],
    word_family: [
      { pos: "v", word: "accommodate" },
      { pos: "n", word: "accommodation" },
      { pos: "adj", word: "accommodating" },
    ],
  },
  negotiate: {
    meaning_vi: "Thương lượng, đàm phán (hợp đồng, mức giá)",
    part_of_speech: "verb",
    collocations: ["negotiate a contract", "negotiate terms", "negotiate directly"],
    word_family: [
      { pos: "v", word: "negotiate" },
      { pos: "n", word: "negotiation" },
      { pos: "n", word: "negotiator" },
      { pos: "adj", word: "negotiable" },
    ],
  },
  complimentary: {
    meaning_vi: "Miễn phí (vé mời, bữa sáng, quà tặng đính kèm)",
    part_of_speech: "adjective",
    collocations: ["complimentary breakfast", "complimentary tickets", "complimentary shuttle"],
    word_family: [
      { pos: "adj", word: "complimentary" },
      { pos: "n", word: "compliment" },
    ],
  },
  delegate: {
    meaning_vi: "Ủy quyền, giao phó (nhiệm vụ) / Đại biểu, người đại diện",
    part_of_speech: "verb, noun",
    collocations: ["delegate tasks", "delegate authority", "conference delegates"],
    word_family: [
      { pos: "v", word: "delegate" },
      { pos: "n", word: "delegation" },
    ],
  },
  warranty: {
    meaning_vi: "Giấy bảo hành, sự cam đoan chất lượng",
    part_of_speech: "noun",
    collocations: ["under warranty", "warranty period", "extended warranty"],
    word_family: [
      { pos: "n", word: "warranty" },
      { pos: "v", word: "warrant" },
    ],
  },
};

/**
 * Phân tích và chuyển đổi dữ liệu từ Free Dictionary API sang cấu trúc chuẩn DictionaryEntry
 */
export function parseFreeDictResponse(
  rawItem: FreeDictApiResponseItem
): Partial<DictionaryEntry> {
  const word = normalizeWord(rawItem.word);

  // 1. Lấy phiên âm
  let phonetic = rawItem.phonetic ?? "";
  if (!phonetic && rawItem.phonetics) {
    const withText = rawItem.phonetics.find((p) => p.text && p.text.trim().length > 0);
    phonetic = withText?.text ?? "";
  }

  // 2. Lấy audio US
  const audioUrl = selectBestUsAudioUrl(rawItem.phonetics);

  // 3. Từ loại và định nghĩa tiếng Anh
  const partsOfSpeechSet = new Set<string>();
  const examples: DictionaryExample[] = [];
  let definitionEn = "";

  if (rawItem.meanings && rawItem.meanings.length > 0) {
    for (const m of rawItem.meanings) {
      if (m.partOfSpeech) {
        partsOfSpeechSet.add(m.partOfSpeech);
      }
      for (const d of m.definitions) {
        if (!definitionEn && d.definition) {
          definitionEn = d.definition;
        }
        if (d.example && examples.length < 3) {
          examples.push({ en: d.example });
        }
      }
    }
  }

  const partOfSpeech = Array.from(partsOfSpeechSet).join(", ");

  // 4. Kiểm tra xem có trong bộ từ điển tuyển chọn sẵn không
  const curated = CURATED_TOEIC_TERMS[word];
  const meaningVi = curated ? curated.meaning_vi : "";
  const wordFamily = curated ? curated.word_family : [];
  const collocations = curated ? curated.collocations : [];

  return {
    word,
    phonetic,
    part_of_speech: curated ? curated.part_of_speech : partOfSpeech,
    meaning_vi: meaningVi,
    definition_en: definitionEn,
    audio_url: audioUrl,
    examples,
    word_family: wordFamily,
    collocations,
  };
}
