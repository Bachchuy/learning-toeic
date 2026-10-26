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
    phonetic?: string;
    collocations: string[];
    word_family: WordFamilyItem[];
    examples?: DictionaryExample[];
  }
> = {
  // --- Cụm từ thông dụng trong giao tiếp và công sở TOEIC ---
  "nice to meet you": {
    meaning_vi: "Rất vui được gặp bạn (lời chào khi lần đầu gặp gỡ đối tác)",
    part_of_speech: "phrase",
    phonetic: "/naɪs tuː miːt juː/",
    collocations: ["nice to meet you in person", "pleased to meet you"],
    word_family: [],
    examples: [
      {
        en: "Nice to meet you, Mr. Jenkins. Welcome to our Chicago headquarters.",
        vi: "Rất vui được gặp ông, ông Jenkins. Chào mừng ông đến trụ sở Chicago của chúng tôi.",
      },
    ],
  },
  "look forward to": {
    meaning_vi: "Trông mong, chờ đợi (hợp tác, phản hồi, cuộc họp)",
    part_of_speech: "phrase",
    phonetic: "/lʊk ˈfɔːrwərd tuː/",
    collocations: ["look forward to hearing from you", "look forward to working together"],
    word_family: [],
    examples: [
      {
        en: "We look forward to receiving your proposal by Friday.",
        vi: "Chúng tôi rất mong nhận được đề xuất của quý công ty trước thứ Sáu.",
      },
    ],
  },
  "in charge of": {
    meaning_vi: "Chịu trách nhiệm, phụ trách (phòng ban, dự án)",
    part_of_speech: "phrase",
    phonetic: "/ɪn tʃɑːrdʒ əv/",
    collocations: ["in charge of sales", "placed in charge of the project"],
    word_family: [],
    examples: [
      {
        en: "Ms. Tanaka is in charge of international marketing.",
        vi: "Bà Tanaka phụ trách mảng tiếp thị quốc tế.",
      },
    ],
  },
  "take advantage of": {
    meaning_vi: "Tận dụng, đón đầu cơ hội (ưu đãi, giảm giá, chương trình đào tạo)",
    part_of_speech: "phrase",
    phonetic: "/teɪk ədˈvæntɪdʒ əv/",
    collocations: ["take advantage of special discounts", "take advantage of the opportunity"],
    word_family: [],
    examples: [
      {
        en: "Employees should take advantage of the free training seminars.",
        vi: "Nhân viên nên tận dụng các buổi hội thảo đào tạo miễn phí.",
      },
    ],
  },
  "due to": {
    meaning_vi: "Bởi vì, do nguyên nhân từ",
    part_of_speech: "phrase",
    phonetic: "/duː tuː/",
    collocations: ["due to inclement weather", "due to technical difficulties"],
    word_family: [],
    examples: [
      {
        en: "The workshop was rescheduled due to unexpected flight cancellations.",
        vi: "Buổi hội thảo đã được dời lịch do sự cố hủy chuyến bay bất ngờ.",
      },
    ],
  },
  "as well as": {
    meaning_vi: "Cũng như, đi cùng với",
    part_of_speech: "phrase",
    phonetic: "/æz wel æz/",
    collocations: ["executives as well as staff"],
    word_family: [],
    examples: [
      {
        en: "The package includes flight tickets as well as hotel accommodations.",
        vi: "Gói dịch vụ bao gồm vé máy bay cũng như chỗ nghỉ tại khách sạn.",
      },
    ],
  },

  // --- Từ loại kép (Danh từ & Động từ) có trọng âm hoặc nét nghĩa kép ---
  record: {
    meaning_vi: "[n] Bản ghi, hồ sơ, kỷ lục · [v] Ghi âm, ghi chép lại",
    part_of_speech: "noun_verb",
    phonetic: "[n] /ˈrekərd/ · [v] /rɪˈkɔːrd/",
    collocations: ["keep track of records", "record the transaction"],
    word_family: [
      { pos: "n", word: "record" },
      { pos: "v", word: "record" },
      { pos: "n", word: "recorder" },
    ],
    examples: [
      {
        en: "The secretary will record the meeting minutes in the official database.",
        vi: "Thư ký sẽ ghi chép lại biên bản cuộc họp vào cơ sở dữ liệu chính thức.",
      },
    ],
  },
  present: {
    meaning_vi: "[n] Món quà; hiện tại · [v] Thuyết trình, trình bày",
    part_of_speech: "noun_verb",
    phonetic: "[n] /ˈpreznt/ · [v] /prɪˈzent/",
    collocations: ["present a proposal", "at the present time"],
    word_family: [
      { pos: "v", word: "present" },
      { pos: "n", word: "presentation" },
      { pos: "n", word: "presenter" },
    ],
  },
  contract: {
    meaning_vi: "[n] Bản hợp đồng · [v] Ký hợp đồng; thu hẹp, co lại",
    part_of_speech: "noun_verb",
    phonetic: "[n] /ˈkɑːntrækt/ · [v] /kənˈtrækt/",
    collocations: ["sign a contract", "renew a contract", "contract with a supplier"],
    word_family: [
      { pos: "n", word: "contract" },
      { pos: "n", word: "contractor" },
      { pos: "adj", word: "contractual" },
    ],
  },
  conduct: {
    meaning_vi: "[n] Hạnh kiểm, tác phong · [v] Tiến hành, thực hiện (khảo sát, nghiên cứu)",
    part_of_speech: "noun_verb",
    phonetic: "[n] /ˈkɑːndʌkt/ · [v] /kənˈdʌkt/",
    collocations: ["conduct an investigation", "conduct a survey", "code of conduct"],
    word_family: [
      { pos: "v", word: "conduct" },
      { pos: "n", word: "conductor" },
    ],
  },
  produce: {
    meaning_vi: "[n] Nông sản, hoa màu · [v] Sản xuất, chế tạo",
    part_of_speech: "noun_verb",
    phonetic: "[n] /ˈprɑːduːs/ · [v] /prəˈduːs/",
    collocations: ["organic produce", "produce high-quality goods"],
    word_family: [
      { pos: "v", word: "produce" },
      { pos: "n", word: "product" },
      { pos: "n", word: "production" },
      { pos: "adj", word: "productive" },
    ],
  },
  project: {
    meaning_vi: "[n] Dự án, đề án · [v] Dự đoán, phóng chiếu số liệu",
    part_of_speech: "noun_verb",
    phonetic: "[n] /ˈprɑːdʒekt/ · [v] /prəˈdʒekt/",
    collocations: ["manage a project", "project quarterly revenue"],
    word_family: [
      { pos: "n", word: "project" },
      { pos: "n", word: "projection" },
    ],
  },
  schedule: {
    meaning_vi: "[n] Lịch trình, thời gian biểu · [v] Lên lịch, sắp xếp thời gian",
    part_of_speech: "noun_verb",
    phonetic: "/ˈskedʒuːl/",
    collocations: ["ahead of schedule", "schedule an appointment", "tight schedule"],
    word_family: [
      { pos: "n", word: "schedule" },
      { pos: "v", word: "reschedule" },
    ],
  },
  plan: {
    meaning_vi: "[n] Kế hoạch, dự tính · [v] Lập kế hoạch, lên phương án",
    part_of_speech: "noun_verb",
    phonetic: "/plæn/",
    collocations: ["contingency plan", "plan carefully", "strategic plan"],
    word_family: [
      { pos: "n", word: "plan" },
      { pos: "n", word: "planner" },
      { pos: "n", word: "planning" },
    ],
  },

  // --- Từ vựng TOEIC thông dụng khác ---
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
  const finalPhonetic = curated?.phonetic || phonetic;
  const finalExamples =
    curated?.examples && curated.examples.length > 0 ? curated.examples : examples;

  return {
    word,
    phonetic: finalPhonetic,
    part_of_speech: curated ? curated.part_of_speech : partOfSpeech,
    meaning_vi: meaningVi,
    definition_en: definitionEn,
    audio_url: audioUrl,
    examples: finalExamples,
    word_family: wordFamily,
    collocations,
  };
}
