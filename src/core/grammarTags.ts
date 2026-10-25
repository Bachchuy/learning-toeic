/**
 * Bảng Chuẩn hóa Thuật ngữ 16 Chủ điểm Ngữ pháp TOEIC Part 5
 * Tuân thủ tiêu chuẩn giảng dạy TOEIC chuẩn ETS & Ngôn ngữ học ứng dụng tại Việt Nam.
 * 
 * BẢN CHẤT NGÔN NGỮ HỌC:
 * 1. "Thì động từ (Tenses)": Người Việt dùng "Thì", tuyệt đối không dùng từ Hán-Việt cổ "Thì thời".
 * 2. "Từ loại (Word Form)": Part 5 dạng bài này kiểm tra vị trí từ loại (Danh/Động/Tính/Trạng),
 *    thuật ngữ quen thuộc nhất với học viên là "Từ loại", không dùng "Cấu tạo từ".
 * 3. "Cụm từ cố định (Collocations)": Part 5 kiểm tra Collocations và Phrasal verbs trong công sở,
 *    không kiểm tra "Thành ngữ" (Idioms - thuộc văn nói thân mật hoặc văn phong đời thường).
 * 4. "Hòa hợp Chủ ngữ - Động từ": Động từ chia theo Chủ ngữ, chuẩn xác hơn "Chủ - Vị".
 */

export interface CanonicalGrammarTag {
  tagCode: string;
  nameVi: string;
  nameEn: string;
  fullNameVi: string;
  shortName: string;
  descriptionVi: string;
}

export const CANONICAL_GRAMMAR_TAGS: Record<string, CanonicalGrammarTag> = {
  tenses: {
    tagCode: "tenses",
    nameVi: "Thì động từ",
    nameEn: "Tenses",
    fullNameVi: "Thì động từ (Tenses)",
    shortName: "Thì động từ",
    descriptionVi: "Các thì đơn, tiếp diễn, hoàn thành và sự phối hợp thì trong câu.",
  },
  subject_verb: {
    tagCode: "subject_verb",
    nameVi: "Hòa hợp Chủ ngữ - Động từ",
    nameEn: "Subject-Verb Agreement",
    fullNameVi: "Hòa hợp Chủ ngữ - Động từ",
    shortName: "Hòa hợp Chủ - Động từ",
    descriptionVi: "Quy tắc chia động từ theo chủ ngữ đơn, số nhiều, cụm danh từ và đại từ.",
  },
  passive_voice: {
    tagCode: "passive_voice",
    nameVi: "Câu bị động",
    nameEn: "Passive Voice",
    fullNameVi: "Câu bị động (Passive Voice)",
    shortName: "Câu bị động",
    descriptionVi: "Dạng bị động các thì, thể truyền khiến (have/get something done).",
  },
  modals: {
    tagCode: "modals",
    nameVi: "Động từ khuyết thiếu",
    nameEn: "Modal Verbs",
    fullNameVi: "Động từ khuyết thiếu (Modal Verbs)",
    shortName: "Động từ khuyết thiếu",
    descriptionVi: "Các trợ động từ khuyết thiếu (can, could, should, must, may) và thể giả định.",
  },
  gerund_infinitive: {
    tagCode: "gerund_infinitive",
    nameVi: "Danh động từ & Động từ nguyên mẫu",
    nameEn: "Gerund & Infinitive",
    fullNameVi: "Danh động từ & Động từ nguyên mẫu (V-ing / To-V)",
    shortName: "V-ing & To-V",
    descriptionVi: "Quy tắc sử dụng V-ing và To-V theo sau các động từ và giới từ thông dụng.",
  },
  participles: {
    tagCode: "participles",
    nameVi: "Phân từ & Rút gọn mệnh đề",
    nameEn: "Participles",
    fullNameVi: "Phân từ & Rút gọn mệnh đề (Participles)",
    shortName: "Phân từ & Rút gọn",
    descriptionVi: "Hiện tại phân từ (V-ing), quá khứ phân từ (V-ed/V3) và mệnh đề phân từ rút gọn.",
  },
  relative_clauses: {
    tagCode: "relative_clauses",
    nameVi: "Mệnh đề quan hệ",
    nameEn: "Relative Clauses",
    fullNameVi: "Mệnh đề quan hệ (Relative Clauses)",
    shortName: "Mệnh đề quan hệ",
    descriptionVi: "Đại từ và trạng từ quan hệ (who, whom, which, that, whose, where, when) và rút gọn.",
  },
  conditionals: {
    tagCode: "conditionals",
    nameVi: "Câu điều kiện & Thể giả định",
    nameEn: "Conditionals & Subjunctive",
    fullNameVi: "Câu điều kiện & Thể giả định",
    shortName: "Câu điều kiện",
    descriptionVi: "Câu điều kiện loại 1, 2, 3, câu điều kiện hỗn hợp và đảo ngữ điều kiện.",
  },
  comparisons: {
    tagCode: "comparisons",
    nameVi: "Cấu trúc so sánh",
    nameEn: "Comparisons",
    fullNameVi: "Cấu trúc so sánh (Comparisons)",
    shortName: "Cấu trúc so sánh",
    descriptionVi: "So sánh bằng, so sánh hơn, so sánh nhất và so sánh kép (the more... the more...).",
  },
  conjunctions_prepositions: {
    tagCode: "conjunctions_prepositions",
    nameVi: "Liên từ & Giới từ",
    nameEn: "Conjunctions & Prepositions",
    fullNameVi: "Liên từ & Giới từ (Conjunctions & Prepositions)",
    shortName: "Liên từ & Giới từ",
    descriptionVi: "Phân biệt liên từ (although/because) và giới từ (despite/due to).",
  },
  nouns_pronouns: {
    tagCode: "nouns_pronouns",
    nameVi: "Danh từ & Đại từ",
    nameEn: "Nouns & Pronouns",
    fullNameVi: "Danh từ & Đại từ (Nouns & Pronouns)",
    shortName: "Danh từ & Đại từ",
    descriptionVi: "Danh từ đếm được, không đếm được, đại từ nhân xưng, phản thân, sở hữu.",
  },
  adjectives_adverbs: {
    tagCode: "adjectives_adverbs",
    nameVi: "Tính từ & Trạng từ",
    nameEn: "Adjectives & Adverbs",
    fullNameVi: "Tính từ & Trạng từ (Adjectives & Adverbs)",
    shortName: "Tính từ & Trạng từ",
    descriptionVi: "Vị trí tính từ, trạng từ chỉ tần suất/mức độ, trật tự từ bổ nghĩa.",
  },
  inversion: {
    tagCode: "inversion",
    nameVi: "Đảo ngữ",
    nameEn: "Inversion",
    fullNameVi: "Đảo ngữ (Inversion)",
    shortName: "Đảo ngữ",
    descriptionVi: "Đảo ngữ với từ phủ định (Never, Rarely), Only after, điều kiện rút gọn.",
  },
  word_form: {
    tagCode: "word_form",
    nameVi: "Từ loại",
    nameEn: "Word Form",
    fullNameVi: "Từ loại (Word Form)",
    shortName: "Từ loại",
    descriptionVi: "Nhận diện vị trí và chức năng của Danh từ, Động từ, Tính từ, Trạng từ.",
  },
  collocations: {
    tagCode: "collocations",
    nameVi: "Cụm từ cố định",
    nameEn: "Collocations",
    fullNameVi: "Cụm từ cố định (Collocations)",
    shortName: "Cụm từ cố định",
    descriptionVi: "Cụm từ đi liền nhau và cụm động từ (Phrasal Verbs) thường gặp trong môi trường công sở.",
  },
  parallel_structure: {
    tagCode: "parallel_structure",
    nameVi: "Cấu trúc song hành",
    nameEn: "Parallelism",
    fullNameVi: "Cấu trúc song hành (Parallelism)",
    shortName: "Cấu trúc song hành",
    descriptionVi: "Quy tắc đồng dạng giữa các thành phần nối bởi liên từ kết hợp (and, or, but).",
  },
};

/**
 * Lấy tên chuẩn học thuật cho chủ điểm ngữ pháp:
 * Tự động thay thế các từ ngữ thô, máy móc hoặc lỗi thời (như 'Thì thời' -> 'Thì động từ')
 */
export function formatGrammarTagName(tagCode: string, fallbackName: string = ""): string {
  const canonical = CANONICAL_GRAMMAR_TAGS[tagCode];
  if (canonical) {
    return canonical.fullNameVi;
  }

  // Fallback làm sạch nếu tagCode chưa có trong từ điển
  return fallbackName
    .replace(/Thì thời/g, "Thì động từ")
    .replace(/Cấu tạo từ/g, "Từ loại")
    .replace(/& Thành ngữ/g, "")
    .trim();
}
