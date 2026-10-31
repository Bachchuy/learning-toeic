/**
 * Chuẩn hóa một từ tiếng Anh về dạng lemma cơ sở:
 * - Chuyển về chữ thường
 * - Cắt bỏ khoảng trắng thừa ở hai đầu và giữa các từ
 * - Bỏ các dấu câu bám dính ở đầu hoặc cuối từ (như dấu phẩy, chấm, ngoặc kép)
 */
export function normalizeLemma(rawWord: string): string {
  if (!rawWord) return "";

  return rawWord
    .trim()
    .toLowerCase()
    .replace(/^["'.,!?;:()]+|["'.,!?;:()]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tự động thay thế chỗ trống (____) trong đề bài TOEIC bằng đáp án đúng
 * để tạo thành câu hoàn chỉnh 100% ngữ pháp, không còn vết đục lỗ.
 */
export function completeStemWithAnswer(stem: string, answerText: string): string {
  if (!stem) return "";
  if (!answerText) return stem;

  const replaced = stem.replace(/_{2,}/g, answerText.trim());
  return replaced.replace(/\s+/g, " ").trim();
}

export type PosCategory =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "phrase"
  | "noun_verb"
  | "noun_adj"
  | "adj_adv"
  | "other";

export interface PosInfo {
  category: PosCategory;
  labelVi: string;
  labelFull: string;
  shortBadge: string;
  badgeClass: string;
}

export const POS_CATEGORY_MAP: Record<PosCategory, PosInfo> = {
  noun: {
    category: "noun",
    labelVi: "Danh từ",
    labelFull: "Danh từ (Noun)",
    shortBadge: "DANH TỪ",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  verb: {
    category: "verb",
    labelVi: "Động từ",
    labelFull: "Động từ (Verb)",
    shortBadge: "ĐỘNG TỪ",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  adjective: {
    category: "adjective",
    labelVi: "Tính từ",
    labelFull: "Tính từ (Adj)",
    shortBadge: "TÍNH TỪ",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
  },
  adverb: {
    category: "adverb",
    labelVi: "Trạng từ",
    labelFull: "Trạng từ (Adv)",
    shortBadge: "TRẠNG TỪ",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  phrase: {
    category: "phrase",
    labelVi: "Cụm từ",
    labelFull: "Cụm từ (Phrase)",
    shortBadge: "CỤM TỪ",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  noun_verb: {
    category: "noun_verb",
    labelVi: "Danh từ & Động từ",
    labelFull: "Danh từ (Noun) · Động từ (Verb)",
    shortBadge: "DANH TỪ · ĐỘNG TỪ",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  noun_adj: {
    category: "noun_adj",
    labelVi: "Danh từ & Tính từ",
    labelFull: "Danh từ (Noun) · Tính từ (Adj)",
    shortBadge: "DANH TỪ · TÍNH TỪ",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
  },
  adj_adv: {
    category: "adj_adv",
    labelVi: "Tính từ & Trạng từ",
    labelFull: "Tính từ (Adj) · Trạng từ (Adv)",
    shortBadge: "TÍNH TỪ · TRẠNG TỪ",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  other: {
    category: "other",
    labelVi: "Từ vựng",
    labelFull: "Từ vựng (Word)",
    shortBadge: "TỪ VỰNG",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

/**
 * Danh sách các từ vựng kinh doanh TOEIC đóng vai trò từ loại kép (vừa là Danh từ vừa là Động từ)
 */
export const DUAL_NOUN_VERB_WORDS = new Set([
  "access",
  "address",
  "aim",
  "boost",
  "cause",
  "challenge",
  "change",
  "charge",
  "conduct",
  "contact",
  "contract",
  "cost",
  "decrease",
  "delay",
  "demand",
  "design",
  "discount",
  "display",
  "estimate",
  "experience",
  "export",
  "feature",
  "finance",
  "function",
  "guarantee",
  "hold",
  "impact",
  "import",
  "increase",
  "issue",
  "launch",
  "market",
  "measure",
  "monitor",
  "notice",
  "offer",
  "order",
  "permit",
  "place",
  "plan",
  "present",
  "process",
  "produce",
  "project",
  "purchase",
  "question",
  "range",
  "rate",
  "record",
  "refund",
  "report",
  "request",
  "review",
  "schedule",
  "search",
  "share",
  "shift",
  "step",
  "structure",
  "supply",
  "support",
  "survey",
  "target",
  "track",
  "transfer",
  "transport",
  "update",
  "value",
  "visit",
  "work",
]);

/**
 * Danh sách các từ vựng TOEIC vừa là Tính từ vừa là Trạng từ
 */
export const DUAL_ADJ_ADV_WORDS = new Set([
  "overseas",
  "fast",
  "hard",
  "early",
  "late",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "direct",
]);

export interface DualPronunciation {
  nounIpa: string;
  verbIpa: string;
  nounMeaning?: string;
  verbMeaning?: string;
  nounAudioUrl?: string;
  verbAudioUrl?: string;
}

/**
 * Bảng tra cứu phát âm và ngữ nghĩa chuẩn kép cho các từ TOEIC vừa là Danh từ vừa là Động từ
 * (Đặc biệt xử lý hiện tượng Initial-stress derivation: danh từ nhấn âm 1, động từ nhấn âm 2)
 */
export const DUAL_PRONUNCIATION_MAP: Record<string, DualPronunciation> = {
  record: {
    nounIpa: "/ˈrekərd/",
    verbIpa: "/rɪˈkɔːrd/",
    nounMeaning: "bản ghi, hồ sơ, kỷ lục",
    verbMeaning: "ghi âm, ghi chép lại",
    nounAudioUrl: "/api/audio/tts?word=record&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=record&pos=verb",
  },
  present: {
    nounIpa: "/ˈpreznt/",
    verbIpa: "/prɪˈzent/",
    nounMeaning: "món quà, thời điểm hiện tại",
    verbMeaning: "thuyết trình, trình bày, giới thiệu",
    nounAudioUrl: "/api/audio/tts?word=present&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=present&pos=verb",
  },
  contract: {
    nounIpa: "/ˈkɑːntrækt/",
    verbIpa: "/kənˈtrækt/",
    nounMeaning: "bản hợp đồng, giao kèo thương mại",
    verbMeaning: "ký hợp đồng; co lại, thu hẹp",
    nounAudioUrl: "/api/audio/tts?word=contract&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=contract&pos=verb",
  },
  conduct: {
    nounIpa: "/ˈkɑːndʌkt/",
    verbIpa: "/kənˈdʌkt/",
    nounMeaning: "hạnh kiểm, tư cách đạo đức",
    verbMeaning: "tiến hành, chỉ đạo, thực hiện khảo sát",
    nounAudioUrl: "/api/audio/tts?word=conduct&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=conduct&pos=verb",
  },
  produce: {
    nounIpa: "/ˈprɑːduːs/",
    verbIpa: "/prəˈduːs/",
    nounMeaning: "nông sản, sản vật",
    verbMeaning: "sản xuất, chế tạo, tạo ra",
    nounAudioUrl: "/api/audio/tts?word=produce&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=produce&pos=verb",
  },
  project: {
    nounIpa: "/ˈprɑːdʒekt/",
    verbIpa: "/prəˈdʒekt/",
    nounMeaning: "dự án, đề án, kế hoạch",
    verbMeaning: "dự đoán, phóng chiếu số liệu",
    nounAudioUrl: "/api/audio/tts?word=project&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=project&pos=verb",
  },
  increase: {
    nounIpa: "/ˈɪŋkriːs/",
    verbIpa: "/ɪnˈkriːs/",
    nounMeaning: "sự gia tăng, mức tăng trưởng",
    verbMeaning: "tăng lên, gia tăng",
    nounAudioUrl: "/api/audio/tts?word=increase&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=increase&pos=verb",
  },
  decrease: {
    nounIpa: "/ˈdiːkriːs/",
    verbIpa: "/dɪˈkriːs/",
    nounMeaning: "sự sụt giảm, mức suy giảm",
    verbMeaning: "giảm bớt, sụt giảm",
    nounAudioUrl: "/api/audio/tts?word=decrease&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=decrease&pos=verb",
  },
  permit: {
    nounIpa: "/ˈpɜːrmɪt/",
    verbIpa: "/pərˈmɪt/",
    nounMeaning: "giấy phép, sự cho phép chính thức",
    verbMeaning: "cho phép, cấp phép",
    nounAudioUrl: "/api/audio/tts?word=permit&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=permit&pos=verb",
  },
  export: {
    nounIpa: "/ˈekspɔːrt/",
    verbIpa: "/ɪkˈspɔːrt/",
    nounMeaning: "hàng xuất khẩu, kim ngạch xuất khẩu",
    verbMeaning: "xuất khẩu ra thị trường quốc tế",
    nounAudioUrl: "/api/audio/tts?word=export&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=export&pos=verb",
  },
  import: {
    nounIpa: "/ˈɪmpɔːrt/",
    verbIpa: "/ɪmˈpɔːrt/",
    nounMeaning: "hàng nhập khẩu, sự nhập khẩu",
    verbMeaning: "nhập khẩu từ nước ngoài",
    nounAudioUrl: "/api/audio/tts?word=import&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=import&pos=verb",
  },
  refund: {
    nounIpa: "/ˈriːfʌnd/",
    verbIpa: "/rɪˈfʌnd/",
    nounMeaning: "tiền hoàn lại, khoản bồi hoàn",
    verbMeaning: "hoàn tiền, trả lại tiền cho khách",
    nounAudioUrl: "/api/audio/tts?word=refund&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=refund&pos=verb",
  },
  transport: {
    nounIpa: "/ˈtrænspɔːrt/",
    verbIpa: "/trænˈspɔːrt/",
    nounMeaning: "phương tiện vận chuyển, giao thông",
    verbMeaning: "vận chuyển, chuyên chở hàng hóa",
    nounAudioUrl: "/api/audio/tts?word=transport&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=transport&pos=verb",
  },
  transfer: {
    nounIpa: "/ˈtrænsfɜːr/",
    verbIpa: "/trænsˈfɜːr/",
    nounMeaning: "sự chuyển nhượng, điều chuyển công tác",
    verbMeaning: "chuyển giao, điều chuyển nhân sự",
    nounAudioUrl: "/api/audio/tts?word=transfer&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=transfer&pos=verb",
  },
  discount: {
    nounIpa: "/ˈdɪskaʊnt/",
    verbIpa: "/dɪsˈkaʊnt/",
    nounMeaning: "khoản chiết khấu, mức giảm giá",
    verbMeaning: "chiết khấu, giảm giá bán",
    nounAudioUrl: "/api/audio/tts?word=discount&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=discount&pos=verb",
  },
  conflict: {
    nounIpa: "/ˈkɑːnflɪkt/",
    verbIpa: "/kənˈflɪkt/",
    nounMeaning: "sự xung đột, mối bất đồng",
    verbMeaning: "xung đột, mâu thuẫn, đối lập",
    nounAudioUrl: "/api/audio/tts?word=conflict&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=conflict&pos=verb",
  },
  progress: {
    nounIpa: "/ˈprɑːɡres/",
    verbIpa: "/prəˈɡres/",
    nounMeaning: "sự tiến bộ, tiến độ công việc",
    verbMeaning: "tiến bộ, phát triển",
    nounAudioUrl: "/api/audio/tts?word=progress&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=progress&pos=verb",
  },
  survey: {
    nounIpa: "/ˈsɜːrveɪ/",
    verbIpa: "/sərˈveɪ/",
    nounMeaning: "cuộc khảo sát, phiếu thăm dò ý kiến",
    verbMeaning: "khảo sát, nhìn nhận, đánh giá tổng quan",
    nounAudioUrl: "/api/audio/tts?word=survey&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=survey&pos=verb",
  },
  schedule: {
    nounIpa: "/ˈskedʒuːl/",
    verbIpa: "/ˈskedʒuːl/",
    nounMeaning: "lịch trình, thời gian biểu",
    verbMeaning: "lên lịch, sắp xếp thời gian",
    nounAudioUrl: "/api/audio/tts?word=schedule&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=schedule&pos=verb",
  },
  plan: {
    nounIpa: "/plæn/",
    verbIpa: "/plæn/",
    nounMeaning: "kế hoạch, dự tính",
    verbMeaning: "lập kế hoạch, lên phương án",
    nounAudioUrl: "/api/audio/tts?word=plan&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=plan&pos=verb",
  },
  experience: {
    nounIpa: "/ɪkˈspɪriəns/",
    verbIpa: "/ɪkˈspɪriəns/",
    nounMeaning: "kinh nghiệm, trải nghiệm",
    verbMeaning: "trải nghiệm, trải qua",
    nounAudioUrl: "/api/audio/tts?word=experience&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=experience&pos=verb",
  },
  access: {
    nounIpa: "/ˈækses/",
    verbIpa: "/ˈækses/",
    nounMeaning: "quyền truy cập, lối vào",
    verbMeaning: "truy cập, tiếp cận dữ liệu",
    nounAudioUrl: "/api/audio/tts?word=access&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=access&pos=verb",
  },
  address: {
    nounIpa: "/ˈædres/",
    verbIpa: "/əˈdres/",
    nounMeaning: "địa chỉ; bài diễn văn",
    verbMeaning: "giải quyết vấn đề; gửi đến",
    nounAudioUrl: "/api/audio/tts?word=address&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=address&pos=verb",
  },
  support: {
    nounIpa: "/səˈpɔːrt/",
    verbIpa: "/səˈpɔːrt/",
    nounMeaning: "sự hỗ trợ, trợ giúp",
    verbMeaning: "hỗ trợ, ủng hộ",
    nounAudioUrl: "/api/audio/tts?word=support&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=support&pos=verb",
  },
  review: {
    nounIpa: "/rɪˈvjuː/",
    verbIpa: "/rɪˈvjuː/",
    nounMeaning: "bản đánh giá, sự xem xét",
    verbMeaning: "đánh giá, xem xét lại",
    nounAudioUrl: "/api/audio/tts?word=review&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=review&pos=verb",
  },
  update: {
    nounIpa: "/ˈʌpdeɪt/",
    verbIpa: "/ʌpˈdeɪt/",
    nounMeaning: "bản cập nhật, thông tin mới nhất",
    verbMeaning: "cập nhật, bổ sung dữ liệu mới",
    nounAudioUrl: "/api/audio/tts?word=update&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=update&pos=verb",
  },
  hold: {
    nounIpa: "/hoʊld/",
    verbIpa: "/hoʊld/",
    nounMeaning: "sự nắm giữ, sự tạm dừng (on hold); khoang chứa",
    verbMeaning: "chứa đựng, tổ chức (cuộc họp), nắm giữ",
    nounAudioUrl: "/api/audio/tts?word=hold&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=hold&pos=verb",
  },
  demand: {
    nounIpa: "/dɪˈmænd/",
    verbIpa: "/dɪˈmænd/",
    nounMeaning: "nhu cầu thị trường, sự đòi hỏi",
    verbMeaning: "đòi hỏi, yêu cầu mạnh mẽ",
    nounAudioUrl: "/api/audio/tts?word=demand&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=demand&pos=verb",
  },
  delay: {
    nounIpa: "/dɪˈleɪ/",
    verbIpa: "/dɪˈleɪ/",
    nounMeaning: "sự chậm trễ, sự hoãn lại",
    verbMeaning: "trì hoãn, làm chậm tiến độ",
    nounAudioUrl: "/api/audio/tts?word=delay&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=delay&pos=verb",
  },
  charge: {
    nounIpa: "/tʃɑːrdʒ/",
    verbIpa: "/tʃɑːrdʒ/",
    nounMeaning: "khoản phí, giá tiền; trách nhiệm phụ trách",
    verbMeaning: "tính phí, đòi tiền; giao nhiệm vụ",
    nounAudioUrl: "/api/audio/tts?word=charge&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=charge&pos=verb",
  },
  order: {
    nounIpa: "/ˈɔːrdər/",
    verbIpa: "/ˈɔːrdər/",
    nounMeaning: "đơn đặt hàng; thứ tự, trật tự",
    verbMeaning: "đặt hàng, ra lệnh, yêu cầu",
    nounAudioUrl: "/api/audio/tts?word=order&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=order&pos=verb",
  },
  offer: {
    nounIpa: "/ˈɔːfər/",
    verbIpa: "/ˈɔːfər/",
    nounMeaning: "lời đề nghị, chào hàng, cơ hội giảm giá",
    verbMeaning: "đưa ra, đề xuất, cung cấp",
    nounAudioUrl: "/api/audio/tts?word=offer&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=offer&pos=verb",
  },
  request: {
    nounIpa: "/rɪˈkwest/",
    verbIpa: "/rɪˈkwest/",
    nounMeaning: "lời thỉnh cầu, yêu cầu chính thức",
    verbMeaning: "yêu cầu, đề nghị, thỉnh cầu",
    nounAudioUrl: "/api/audio/tts?word=request&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=request&pos=verb",
  },
  process: {
    nounIpa: "/ˈprɑːses/",
    verbIpa: "/ˈprɑːses/",
    nounMeaning: "quy trình, tiến trình, quy chuẩn",
    verbMeaning: "xử lý (hồ sơ, dữ liệu, hàng hóa)",
    nounAudioUrl: "/api/audio/tts?word=process&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=process&pos=verb",
  },
  visit: {
    nounIpa: "/ˈvɪzɪt/",
    verbIpa: "/ˈvɪzɪt/",
    nounMeaning: "chuyến thăm, cuộc viếng thăm",
    verbMeaning: "đến thăm, ghé thăm",
    nounAudioUrl: "/api/audio/tts?word=visit&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=visit&pos=verb",
  },
};

export interface DualMeaningDetails {
  isDual: boolean;
  nounIpa?: string;
  verbIpa?: string;
  nounMeaning?: string;
  verbMeaning?: string;
  nounAudioUrl?: string;
  verbAudioUrl?: string;
  primaryRole: "noun" | "verb" | "other";
}

/**
 * Trích xuất chi tiết hai nét nghĩa (Danh từ & Động từ) cho từ vựng kép
 */
export function resolveDualDetails(
  word: string,
  posString?: string,
  meaning?: string
): DualMeaningDetails {
  const cleanWord = (word || "").trim().toLowerCase();
  const dual = DUAL_PRONUNCIATION_MAP[cleanWord];
  const p = (posString || "").toLowerCase().trim();
  const m = (meaning || "").trim();

  // Nhận diện vai trò ngữ cảnh trong thẻ bài học hiện tại
  const isVerbContext = /\b(verb|động)\b|\bv(\.|\b)|v\/|\/v|\(v\)|phr\.?\s*v/i.test(p);
  const isNounContext = /\b(noun|danh)\b|\bn(\.|\b)|n\/|\/n|\(n\)/i.test(p);

  const primaryRole: "noun" | "verb" | "other" =
    isVerbContext && !isNounContext
      ? "verb"
      : isNounContext && !isVerbContext
      ? "noun"
      : "other";

  if (dual) {
    return {
      isDual: true,
      nounIpa: dual.nounIpa,
      verbIpa: dual.verbIpa,
      nounMeaning: dual.nounMeaning || m,
      verbMeaning: dual.verbMeaning || m,
      nounAudioUrl:
        dual.nounAudioUrl ||
        `/api/audio/tts?word=${encodeURIComponent(cleanWord)}&pos=noun`,
      verbAudioUrl:
        dual.verbAudioUrl ||
        `/api/audio/tts?word=${encodeURIComponent(cleanWord)}&pos=verb`,
      primaryRole,
    };
  }

  // Tách nét nghĩa kép nếu chuỗi meaning chứa cả [n] và [v] hoặc (n) và (v)
  const dualMatch =
    m.match(/(?:\[n\]|\(n\.?\)|\bdanh từ:?)\s*([^·;(\[]+)(?:[·;]|\s+)\s*(?:\[v\]|\(v\.?\)|\bđộng từ:?)\s*(.+)/i) ||
    m.match(/(?:\[v\]|\(v\.?\)|\bđộng từ:?)\s*([^·;(\[]+)(?:[·;]|\s+)\s*(?:\[n\]|\(n\.?\)|\bdanh từ:?)\s*(.+)/i);

  if (dualMatch) {
    const isFirstNoun = /(?:\[n\]|\(n\.?\)|\bdanh từ)/i.test(m.slice(0, 15));
    return {
      isDual: true,
      nounMeaning: (isFirstNoun ? dualMatch[1] : dualMatch[2]).trim(),
      verbMeaning: (isFirstNoun ? dualMatch[2] : dualMatch[1]).trim(),
      nounAudioUrl: `/api/audio/tts?word=${encodeURIComponent(cleanWord)}&pos=noun`,
      verbAudioUrl: `/api/audio/tts?word=${encodeURIComponent(cleanWord)}&pos=verb`,
      primaryRole,
    };
  }

  return {
    isDual: false,
    primaryRole,
  };
}

export function getDualPronunciation(word: string): DualPronunciation | null {
  if (!word) return null;
  const clean = word.trim().toLowerCase();
  return DUAL_PRONUNCIATION_MAP[clean] || null;
}

/**
 * Phân loại từ loại (POS Category) chuẩn hóa:
 * - Hỗ trợ đầy đủ từ loại kép (noun_verb: DANH TỪ · ĐỘNG TỪ, noun_adj, adj_adv)
 * - Tuyệt đối không để từ vựng tiếng Anh hợp lệ bị rơi vào nhãn chung chung "TỪ VỰNG"
 */
export function getPosCategory(
  posString?: string,
  hintMeaning: string = "",
  word: string = ""
): PosCategory {
  const p = (posString || "").toLowerCase().trim();
  const m = hintMeaning.toLowerCase().trim();
  const w = word.toLowerCase().trim();

  // 1. Kiểm tra cụm từ trước (chứa từ khóa phrase/cụm/idiom)
  const isPhraseInP =
    p.includes("phrase") ||
    p.includes("cụm") ||
    p.includes("idiom") ||
    p.includes("collocation");

  // 2. Nhận diện các cờ từ loại trong posString chuẩn xác (hỗ trợ v., n., adj., adv., prep., conj.)
  const hasNounInP = /\b(noun|danh)\b|\bn(\.|\b)|n\/|\/n|\(n\)/i.test(p);
  const hasVerbInP = /\b(verb|động)\b|\bv(\.|\b)|v\/|\/v|\(v\)|phr\.?\s*v/i.test(p);
  const hasAdjInP = /\b(adj|adjective|tính)\b|\badj(\.|\b)|adj\/|\/adj|\(adj\)/i.test(p);
  const hasAdvInP = /\b(adv|adverb|trạng)\b|\badv(\.|\b)|adv\/|\/adv|\(adv\)/i.test(p);
  const hasPrepInP = /\b(prep|preposition|giới)\b|\bprep(\.|\b)|perp\./i.test(p);
  const hasConjInP = /\b(conj|conjunction|liên)\b|\bconj(\.|\b)/i.test(p);

  // 3. Kiểm tra từ loại kép trực tiếp từ posString
  if (hasNounInP && hasVerbInP) return "noun_verb";
  if (hasNounInP && hasAdjInP) return "noun_adj";
  if (hasAdjInP && hasAdvInP) return "adj_adv";

  // 4. Nếu từ vựng có khoảng trắng (nhiều từ) nhưng không có nhãn n. hoặc v.
  if (
    isPhraseInP ||
    (w.includes(" ") && !hasNounInP && !hasVerbInP) ||
    (w.includes("-") && !hasNounInP && !hasVerbInP)
  ) {
    return "phrase";
  }

  // 5. Kiểm tra danh sách từ loại kép từ vựng kinh doanh TOEIC
  const lemma = w.replace(/^(to\s+|the\s+|a\s+|an\s+)/, "").replace(/s$/, "");
  const isDualNounVerb = DUAL_NOUN_VERB_WORDS.has(w) || DUAL_NOUN_VERB_WORDS.has(lemma);
  if (isDualNounVerb && !hasAdjInP && !hasAdvInP) {
    return "noun_verb";
  }

  const isDualAdjAdv = DUAL_ADJ_ADV_WORDS.has(w) || DUAL_ADJ_ADV_WORDS.has(lemma);
  if (isDualAdjAdv) {
    return "adj_adv";
  }

  // 6. Kiểm tra đơn lẻ từ posString
  if (hasVerbInP && !hasNounInP) return "verb";
  if (hasNounInP && !hasVerbInP) return "noun";
  if (hasAdjInP && !hasAdvInP) return "adjective";
  if (hasAdvInP && !hasAdjInP) return "adverb";
  if (hasPrepInP || hasConjInP) return "phrase";

  // 7. Kiểm tra từ gợi ý nghĩa tiếng Việt mang tính hai mặt (noun + verb)
  const hasNounInM =
    m.includes("(n)") ||
    m.includes("danh từ") ||
    /^(hàng|sự|việc|người|nhà|bản|mức|tỷ lệ|quy trình|tài liệu)\b/.test(m);
  const hasVerbInM =
    m.includes("(v)") ||
    m.includes("động từ") ||
    /^(chứa|đựng|tổ chức|chuẩn bị|cung cấp|hướng dẫn|thông báo|tham dự|xem xét|xuất khẩu|nhập khẩu|tăng|giảm|vận hành|thúc đẩy|làm|thực hiện)\b/.test(m);

  if (hasNounInM && hasVerbInM && (m.includes("/") || m.includes(";") || m.includes(","))) {
    return "noun_verb";
  }

  // 8. Suy luận đơn lẻ từ hintMeaning
  if (m.includes("(adj)") || m.includes("tính từ")) return "adjective";
  if (m.includes("(adv)") || m.includes("trạng từ")) return "adverb";
  if (m.includes("(v)") || m.includes("động từ") || hasVerbInM) return "verb";
  if (m.includes("(n)") || m.includes("danh từ") || hasNounInM) return "noun";

  // 9. Suy luận từ hậu tố tiếng Anh (Suffixes)
  if (w.endsWith("ly") && w.length > 3) return "adverb";
  if (
    w.endsWith("tion") ||
    w.endsWith("sion") ||
    w.endsWith("ment") ||
    w.endsWith("ness") ||
    w.endsWith("ity") ||
    w.endsWith("ance") ||
    w.endsWith("ence") ||
    w.endsWith("ship") ||
    w.endsWith("hood") ||
    w.endsWith("er") ||
    w.endsWith("or")
  ) {
    return "noun";
  }
  if (
    w.endsWith("ful") ||
    w.endsWith("able") ||
    w.endsWith("ible") ||
    w.endsWith("ive") ||
    w.endsWith("ous") ||
    w.endsWith("al") ||
    w.endsWith("ic") ||
    w.endsWith("less")
  ) {
    return "adjective";
  }
  if (
    w.endsWith("ate") ||
    w.endsWith("ize") ||
    w.endsWith("ise") ||
    w.endsWith("ify") ||
    w.endsWith("en") ||
    w.endsWith("ed") ||
    w.endsWith("ing")
  ) {
    return "verb";
  }

  // 10. Suy luận từ tiền tố tiếng Việt của nghĩa (Vietnamese semantic clues)
  if (
    /^(sự|việc|người|nhà|hệ thống|bản|mức|tỷ lệ|quy trình|tài liệu|thiết bị|kho|nhà máy)\b/.test(
      m
    )
  ) {
    return "noun";
  }
  if (
    /^(làm|vận hành|thực hiện|cắt|tiêu hủy|thúc đẩy|nâng|hạ|thay đổi|liên hệ|hỗ trợ|yêu cầu)\b/.test(
      m
    )
  ) {
    return "verb";
  }
  if (
    /^(thuận lợi|lo lắng|ngắn gọn|bảo mật|tuyệt mật|quan trọng|cần thiết|nhanh chóng|chính xác)\b/.test(
      m
    )
  ) {
    return "adjective";
  }
  if (/^(một cách|rất|hoàn toàn|ngay lập tức)\b/.test(m)) {
    return "adverb";
  }

  // 11. Mặc định là danh từ cho từ đơn (từ loại chiếm tỉ lệ cao nhất trong từ vựng TOEIC)
  return w ? "noun" : "other";
}

/**
 * Lấy thông tin huy hiệu màu sắc và nhãn hiển thị cho từ loại
 */
export function getPosBadgeInfo(
  posString?: string,
  hintMeaning: string = "",
  word: string = ""
): PosInfo {
  const category = getPosCategory(posString, hintMeaning, word);
  return POS_CATEGORY_MAP[category];
}

/**
 * Tự động nhận diện từ loại dạng chuỗi hiển thị
 */
export function inferPartOfSpeech(word: string, hintMeaning: string = ""): string {
  const info = getPosBadgeInfo(undefined, hintMeaning, word);
  return info.labelFull;
}

/**
 * Sinh giải thích ngữ nghĩa tự nhiên, học thuật theo từ loại,
 * TRÁNH HOÀN TOÀN mẫu câu rập khuôn máy móc "Thuật ngữ chuyên môn X có nghĩa là Y, thường xuất hiện..."
 */
export function generateNaturalExplanation(
  word: string,
  meaningVi: string,
  posCategory: PosCategory
): string {
  const cleanMeaning = meaningVi.trim().replace(/^["']+|["']+$/g, "");

  switch (posCategory) {
    case "noun":
      return `Danh từ mang nghĩa "${cleanMeaning}", thường làm chủ ngữ hoặc tân ngữ trong thư từ và hợp đồng thương mại.`;
    case "verb":
      return `Động từ diễn tả hành động "${cleanMeaning}", thường đi kèm tân ngữ chỉ công việc, quy trình hoặc mục tiêu dự án.`;
    case "adjective":
      return `Tính từ mô tả đặc tính hoặc trạng thái "${cleanMeaning}", dùng bổ nghĩa cho danh từ trong báo cáo kinh doanh.`;
    case "adverb":
      return `Trạng từ chỉ mức độ hoặc cách thức "${cleanMeaning}", bổ nghĩa cho động từ hoặc tính từ để làm rõ sắc thái nghĩa.`;
    case "noun_verb":
      return `Từ đa năng (Danh từ & Động từ) mang nghĩa "${cleanMeaning}", dùng linh hoạt trong ngữ cảnh thương mại.`;
    case "noun_adj":
      return `Từ linh hoạt vừa là danh từ vừa là tính từ mang nghĩa "${cleanMeaning}", thường gặp trong báo cáo kinh tế.`;
    case "adj_adv":
      return `Từ đóng vai trò tính từ hoặc trạng từ với nghĩa "${cleanMeaning}", biến đổi linh hoạt theo vị trí ngữ pháp.`;
    case "phrase":
      return `Cụm từ thông dụng mang nghĩa "${cleanMeaning}", xuất hiện thường xuyên trong giao tiếp công sở và thông báo nội bộ.`;
    default:
      return `Từ vựng mang nghĩa "${cleanMeaning}", phổ biến trong môi trường làm việc chuyên nghiệp.`;
  }
}
