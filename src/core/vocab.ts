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
  "lease",
  "license",
  "market",
  "measure",
  "mix",
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
  "slump",
  "step",
  "structure",
  "supply",
  "support",
  "surge",
  "survey",
  "target",
  "track",
  "transfer",
  "transport",
  "update",
  "value",
  "visit",
  "volunteer",
  "witness",
  "work",
  "follow up",
  "credit",
  "fine",
  "debit",
  "dispute",
  "exchange",
  "guarantee",
  "grant",
  "breach",
  "default",
  "boom",
  "dip",
  "revamp",
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
  delegate: {
    nounIpa: "/ˈdelɪɡət/",
    verbIpa: "/ˈdelɪɡeɪt/",
    nounMeaning: "đại biểu, người đại diện",
    verbMeaning: "ủy quyền, giao phó (nhiệm vụ)",
    nounAudioUrl: "/api/audio/tts?word=delegate&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=delegate&pos=verb",
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
  lease: {
    nounIpa: "/liːs/",
    verbIpa: "/liːs/",
    nounMeaning: "khế ước, hợp đồng cho thuê (tài sản, văn phòng, nhà xưởng)",
    verbMeaning: "thuê, cho thuê (tài sản, xe cộ, bất động sản)",
    nounAudioUrl: "/api/audio/tts?word=lease&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=lease&pos=verb",
  },
  mix: {
    nounIpa: "/mɪks/",
    verbIpa: "/mɪks/",
    nounMeaning: "hỗn hợp, sự phối hợp, cơ cấu kết hợp",
    verbMeaning: "trộn lẫn, hòa vào, kết hợp lại",
    nounAudioUrl: "/api/audio/tts?word=mix&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=mix&pos=verb",
  },
  "follow up": {
    nounIpa: "/ˈfɑːloʊ ʌp/",
    verbIpa: "/ˌfɑːloʊ ˈʌp/",
    nounMeaning: "bước tiếp theo, cuộc hẹn theo dõi, sự tiếp nối",
    verbMeaning: "theo sát, bám riết, tiếp tục thực hiện",
    nounAudioUrl: "/api/audio/tts?word=follow%20up&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=follow%20up&pos=verb",
  },
  finance: {
    nounIpa: "/ˈfaɪnæns/",
    verbIpa: "/faɪˈnæns/",
    nounMeaning: "tài chính, nguồn tài chính",
    verbMeaning: "cấp vốn, tài trợ tài chính",
    nounAudioUrl: "/api/audio/tts?word=finance&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=finance&pos=verb",
  },
  market: {
    nounIpa: "/ˈmɑːrkɪt/",
    verbIpa: "/ˈmɑːrkɪt/",
    nounMeaning: "thị trường, chợ, nơi tiêu thụ sản phẩm",
    verbMeaning: "tiếp thị, quảng bá, tung ra thị trường",
    nounAudioUrl: "/api/audio/tts?word=market&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=market&pos=verb",
  },
  function: {
    nounIpa: "/ˈfʌŋkʃn/",
    verbIpa: "/ˈfʌŋkʃn/",
    nounMeaning: "chức năng, nhiệm vụ; buổi tiệc/lễ kỷ niệm",
    verbMeaning: "vận hành, hoạt động, thực hiện chức năng",
    nounAudioUrl: "/api/audio/tts?word=function&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=function&pos=verb",
  },
  contact: {
    nounIpa: "/ˈkɑːntækt/",
    verbIpa: "/ˈkɑːntækt/",
    nounMeaning: "đầu mối liên lạc, người quen, sự tiếp xúc",
    verbMeaning: "liên hệ, liên lạc với đối tác/khách hàng",
    nounAudioUrl: "/api/audio/tts?word=contact&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=contact&pos=verb",
  },
  range: {
    nounIpa: "/reɪndʒ/",
    verbIpa: "/reɪndʒ/",
    nounMeaning: "phạm vi, chuỗi đa dạng, tầm giá",
    verbMeaning: "dao động trong khoảng, trải rộng từ... đến...",
    nounAudioUrl: "/api/audio/tts?word=range&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=range&pos=verb",
  },
  display: {
    nounIpa: "/dɪˈspleɪ/",
    verbIpa: "/dɪˈspleɪ/",
    nounMeaning: "sự trưng bày, màn hình hiển thị",
    verbMeaning: "trưng bày, hiển thị, phô bày",
    nounAudioUrl: "/api/audio/tts?word=display&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=display&pos=verb",
  },
  search: {
    nounIpa: "/sɜːrtʃ/",
    verbIpa: "/sɜːrtʃ/",
    nounMeaning: "cuộc tìm kiếm, sự tra cứu",
    verbMeaning: "tìm kiếm, lùng sục, tra cứu",
    nounAudioUrl: "/api/audio/tts?word=search&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=search&pos=verb",
  },
  supply: {
    nounIpa: "/səˈplaɪ/",
    verbIpa: "/səˈplaɪ/",
    nounMeaning: "nguồn cung cấp, hàng dự trữ, vật tư",
    verbMeaning: "cung cấp, tiếp tế hàng hóa",
    nounAudioUrl: "/api/audio/tts?word=supply&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=supply&pos=verb",
  },
  estimate: {
    nounIpa: "/ˈestɪmət/",
    verbIpa: "/ˈestɪmeɪt/",
    nounMeaning: "bản ước tính, dự toán chi phí",
    verbMeaning: "ước lượng, dự toán, ước tính",
    nounAudioUrl: "/api/audio/tts?word=estimate&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=estimate&pos=verb",
  },
  rate: {
    nounIpa: "/reɪt/",
    verbIpa: "/reɪt/",
    nounMeaning: "mức giá, tỉ lệ, cước phí",
    verbMeaning: "đánh giá, xếp hạng, định mức",
    nounAudioUrl: "/api/audio/tts?word=rate&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=rate&pos=verb",
  },
  target: {
    nounIpa: "/ˈtɑːrɡɪt/",
    verbIpa: "/ˈtɑːrɡɪt/",
    nounMeaning: "mục tiêu, chỉ tiêu doanh số",
    verbMeaning: "nhắm tới, hướng tới đối tượng mục tiêu",
    nounAudioUrl: "/api/audio/tts?word=target&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=target&pos=verb",
  },
  monitor: {
    nounIpa: "/ˈmɑːnɪtər/",
    verbIpa: "/ˈmɑːnɪtər/",
    nounMeaning: "màn hình hiển thị; người giám sát",
    verbMeaning: "giám sát, theo dõi chặt chẽ",
    nounAudioUrl: "/api/audio/tts?word=monitor&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=monitor&pos=verb",
  },
  value: {
    nounIpa: "/ˈvæljuː/",
    verbIpa: "/ˈvæljuː/",
    nounMeaning: "giá trị, giá cả, ý nghĩa",
    verbMeaning: "định giá, coi trọng, quý trọng",
    nounAudioUrl: "/api/audio/tts?word=value&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=value&pos=verb",
  },
  cost: {
    nounIpa: "/kɔːst/",
    verbIpa: "/kɔːst/",
    nounMeaning: "chi phí, tổn phí, giá tiền",
    verbMeaning: "trị giá, tốn kém, tiêu tốn",
    nounAudioUrl: "/api/audio/tts?word=cost&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=cost&pos=verb",
  },
  notice: {
    nounIpa: "/ˈnoʊtɪs/",
    verbIpa: "/ˈnoʊtɪs/",
    nounMeaning: "thông báo, sự chú ý, kỳ hạn báo trước",
    verbMeaning: "chú ý, nhận thấy, để ý",
    nounAudioUrl: "/api/audio/tts?word=notice&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=notice&pos=verb",
  },
  place: {
    nounIpa: "/pleɪs/",
    verbIpa: "/pleɪs/",
    nounMeaning: "nơi chốn, địa điểm, vị trí",
    verbMeaning: "đặt (đơn hàng, quảng cáo), bố trí",
    nounAudioUrl: "/api/audio/tts?word=place&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=place&pos=verb",
  },
  purchase: {
    nounIpa: "/ˈpɜːrtʃəs/",
    verbIpa: "/ˈpɜːrtʃəs/",
    nounMeaning: "món hàng mua, việc mua bán",
    verbMeaning: "mua sắm, tậu, chi tiền mua",
    nounAudioUrl: "/api/audio/tts?word=purchase&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=purchase&pos=verb",
  },
  report: {
    nounIpa: "/rɪˈpɔːrt/",
    verbIpa: "/rɪˈpɔːrt/",
    nounMeaning: "bản báo cáo, bản tin phúc trình",
    verbMeaning: "báo cáo, trình báo, có mặt",
    nounAudioUrl: "/api/audio/tts?word=report&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=report&pos=verb",
  },
  share: {
    nounIpa: "/ʃer/",
    verbIpa: "/ʃer/",
    nounMeaning: "cổ phần, thị phần; phần chia",
    verbMeaning: "chia sẻ, cùng gánh vác",
    nounAudioUrl: "/api/audio/tts?word=share&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=share&pos=verb",
  },
  shift: {
    nounIpa: "/ʃɪft/",
    verbIpa: "/ʃɪft/",
    nounMeaning: "ca làm việc; sự thay đổi, chuyển dịch",
    verbMeaning: "thay đổi, chuyển đổi ca/vị trí",
    nounAudioUrl: "/api/audio/tts?word=shift&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=shift&pos=verb",
  },
  step: {
    nounIpa: "/step/",
    verbIpa: "/step/",
    nounMeaning: "bước đi, công đoạn thực hiện, biện pháp",
    verbMeaning: "bước đi, sải bước",
    nounAudioUrl: "/api/audio/tts?word=step&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=step&pos=verb",
  },
  structure: {
    nounIpa: "/ˈstrʌktʃər/",
    verbIpa: "/ˈstrʌktʃər/",
    nounMeaning: "cơ cấu, cấu trúc, tòa công trình",
    verbMeaning: "xây dựng cơ cấu, sắp xếp cấu trúc",
    nounAudioUrl: "/api/audio/tts?word=structure&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=structure&pos=verb",
  },
  track: {
    nounIpa: "/træk/",
    verbIpa: "/træk/",
    nounMeaning: "dấu vết, đường ray, tiến trình theo dõi",
    verbMeaning: "theo dõi, bám sát tiến độ",
    nounAudioUrl: "/api/audio/tts?word=track&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=track&pos=verb",
  },
  work: {
    nounIpa: "/wɜːrk/",
    verbIpa: "/wɜːrk/",
    nounMeaning: "công việc, việc làm, tác phẩm",
    verbMeaning: "làm việc, hoạt động, vận hành",
    nounAudioUrl: "/api/audio/tts?word=work&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=work&pos=verb",
  },
  aim: {
    nounIpa: "/eɪm/",
    verbIpa: "/eɪm/",
    nounMeaning: "mục đích, ý định, mục tiêu",
    verbMeaning: "nhắm vào, hướng mục tiêu tới",
    nounAudioUrl: "/api/audio/tts?word=aim&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=aim&pos=verb",
  },
  boost: {
    nounIpa: "/buːst/",
    verbIpa: "/buːst/",
    nounMeaning: "sự thúc đẩy, cú hích, sự gia tăng",
    verbMeaning: "thúc đẩy, gia tăng, nâng cao",
    nounAudioUrl: "/api/audio/tts?word=boost&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=boost&pos=verb",
  },
  cause: {
    nounIpa: "/kɔːz/",
    verbIpa: "/kɔːz/",
    nounMeaning: "nguyên nhân, lý do; sự nghiệp vì cộng đồng",
    verbMeaning: "gây ra, dẫn đến, tạo nên",
    nounAudioUrl: "/api/audio/tts?word=cause&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=cause&pos=verb",
  },
  challenge: {
    nounIpa: "/ˈtʃælɪndʒ/",
    verbIpa: "/ˈtʃælɪndʒ/",
    nounMeaning: "thử thách, thách thức cam go",
    verbMeaning: "thách thức, nghi ngờ tính đúng đắn",
    nounAudioUrl: "/api/audio/tts?word=challenge&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=challenge&pos=verb",
  },
  design: {
    nounIpa: "/dɪˈzaɪn/",
    verbIpa: "/dɪˈzaɪn/",
    nounMeaning: "bản thiết kế, kiểu dáng, đồ họa",
    verbMeaning: "thiết kế, lên phương án mẫu",
    nounAudioUrl: "/api/audio/tts?word=design&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=design&pos=verb",
  },
  impact: {
    nounIpa: "/ˈɪmpækt/",
    verbIpa: "/ɪmˈpækt/",
    nounMeaning: "sự tác động, ảnh hưởng mạnh, va chạm",
    verbMeaning: "tác động đến, ảnh hưởng tới",
    nounAudioUrl: "/api/audio/tts?word=impact&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=impact&pos=verb",
  },
  issue: {
    nounIpa: "/ˈɪʃuː/",
    verbIpa: "/ˈɪʃuː/",
    nounMeaning: "vấn đề nan giải; số báo, kỳ phát hành",
    verbMeaning: "ban hành, phát hành (hóa đơn, chứng chỉ)",
    nounAudioUrl: "/api/audio/tts?word=issue&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=issue&pos=verb",
  },
  launch: {
    nounIpa: "/lɔːntʃ/",
    verbIpa: "/lɔːntʃ/",
    nounMeaning: "buổi ra mắt (sản phẩm), lễ khai trương",
    verbMeaning: "ra mắt, tung ra thị trường, khởi chạy",
    nounAudioUrl: "/api/audio/tts?word=launch&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=launch&pos=verb",
  },
  measure: {
    nounIpa: "/ˈmeʒər/",
    verbIpa: "/ˈmeʒər/",
    nounMeaning: "biện pháp, phương sách, quy chuẩn",
    verbMeaning: "đo lường, định lượng, đánh giá",
    nounAudioUrl: "/api/audio/tts?word=measure&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=measure&pos=verb",
  },
  license: {
    nounIpa: "/ˈlaɪsns/",
    verbIpa: "/ˈlaɪsns/",
    nounMeaning: "giấy phép, chứng chỉ hành nghề",
    verbMeaning: "cấp phép, cho phép bản quyền",
    nounAudioUrl: "/api/audio/tts?word=license&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=license&pos=verb",
  },
  grant: {
    nounIpa: "/ɡrænt/",
    verbIpa: "/ɡrænt/",
    nounMeaning: "khoản tài trợ, tiền trợ cấp chính phủ",
    verbMeaning: "cấp, ban cho, chấp thuận (yêu cầu)",
    nounAudioUrl: "/api/audio/tts?word=grant&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=grant&pos=verb",
  },
  credit: {
    nounIpa: "/ˈkredɪt/",
    verbIpa: "/ˈkredɪt/",
    nounMeaning: "tín dụng; số dư có; sự ghi nhận công trạng",
    verbMeaning: "ghi có, cộng tiền vào tài khoản; quy công trạng",
    nounAudioUrl: "/api/audio/tts?word=credit&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=credit&pos=verb",
  },
  fine: {
    nounIpa: "/faɪn/",
    verbIpa: "/faɪn/",
    nounMeaning: "khoản tiền phạt vi phạm",
    verbMeaning: "phạt tiền, xử phạt tài chính",
    nounAudioUrl: "/api/audio/tts?word=fine&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=fine&pos=verb",
  },
  dispute: {
    nounIpa: "/ˈdɪspjuːt/",
    verbIpa: "/dɪˈspjuːt/",
    nounMeaning: "cuộc tranh chấp, khiếu nại thương mại",
    verbMeaning: "tranh cãi, khiếu nại, phản đối",
    nounAudioUrl: "/api/audio/tts?word=dispute&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=dispute&pos=verb",
  },
  exchange: {
    nounIpa: "/ɪksˈtʃeɪndʒ/",
    verbIpa: "/ɪksˈtʃeɪndʒ/",
    nounMeaning: "sự trao đổi, việc đổi hàng",
    verbMeaning: "trao đổi, đổi trả hàng hóa",
    nounAudioUrl: "/api/audio/tts?word=exchange&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=exchange&pos=verb",
  },
  guarantee: {
    nounIpa: "/ˌɡærənˈtiː/",
    verbIpa: "/ˌɡærənˈtiː/",
    nounMeaning: "giấy bảo hành, sự cam kết bảo đảm",
    verbMeaning: "bảo đảm, cam đoan, bảo hành",
    nounAudioUrl: "/api/audio/tts?word=guarantee&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=guarantee&pos=verb",
  },
  witness: {
    nounIpa: "/ˈwɪtnəs/",
    verbIpa: "/ˈwɪtnəs/",
    nounMeaning: "người làm chứng, nhân chứng",
    verbMeaning: "chứng kiến, làm chứng (ký kết văn bản)",
    nounAudioUrl: "/api/audio/tts?word=witness&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=witness&pos=verb",
  },
  volunteer: {
    nounIpa: "/ˌvɑːlənˈtɪr/",
    verbIpa: "/ˌvɑːlənˈtɪr/",
    nounMeaning: "tình nguyện viên, người xung phong",
    verbMeaning: "tình nguyện, tự nguyện làm gì",
    nounAudioUrl: "/api/audio/tts?word=volunteer&pos=noun",
    verbAudioUrl: "/api/audio/tts?word=volunteer&pos=verb",
  },
};

/**
 * Tự động phân tích vai trò ngữ pháp của từ vựng trong câu ví dụ TOEIC (Danh từ hay Động từ)
 */
export function detectWordRoleInSentence(
  word: string,
  sentence?: string
): "noun" | "verb" | "other" {
  if (!word || !sentence) return "other";
  const cleanWord = word.trim().toLowerCase();
  const s = sentence.toLowerCase();

  // Pattern động từ rõ ràng: to + word, modal verb + word, trợ động từ + word
  const verbRegex = new RegExp(
    `\\b(to|will|would|can|could|should|must|may|might|decided to|agreed to|plan to|plans to|planned to|need to|needs to|needed to|failed to|began to|try to|tries to|tried to|manage to|managed to)\\s+${cleanWord}\\b`,
    "i"
  );
  if (verbRegex.test(s)) return "verb";

  // Pattern động từ chia thì quá khứ/hiện tại: S + word + O (ví dụ: "we lease the office", "they leased the property")
  const verbPastRegex = new RegExp(`\\b${cleanWord}(d|ed|ing)\\b`, "i");
  if (verbPastRegex.test(s)) return "verb";

  // Pattern danh từ: mạo từ/tính từ sở hữu + (tính từ bổ nghĩa optional) + word
  // Ví dụ: "a lease", "the lease", "their lease", "a full refund", "three-year lease", "signed a lease"
  const nounRegex = new RegExp(
    `\\b(a|an|the|this|that|these|those|my|your|his|her|its|our|their|no|any|each|every|some|signed|renew|renewed|terminate|terminated|demand|demanded|request|requested|issue|issued|receive|received)\\s+(?:[\\w-]+\\s+){0,2}${cleanWord}\\b`,
    "i"
  );
  if (nounRegex.test(s)) return "noun";

  // Pattern danh từ đứng sau giới từ: under the lease, during the lease, on lease, for a refund
  const prepNounRegex = new RegExp(
    `\\b(under|during|for|in|on|with|without|through)\\s+(?:(the|a|an)\\s+)?(?:[\\w-]+\\s+)?${cleanWord}\\b`,
    "i"
  );
  if (prepNounRegex.test(s)) return "noun";

  return "other";
}

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
  meaning?: string,
  contextSentence?: string
): DualMeaningDetails {
  const cleanWord = (word || "").trim().toLowerCase();
  const dual = DUAL_PRONUNCIATION_MAP[cleanWord];
  const p = (posString || "").toLowerCase().trim();
  const m = (meaning || "").trim();

  // Nhận diện vai trò ngữ cảnh trong thẻ bài học hiện tại
  const isVerbExplicit = /\b(verb|động)\b|\bv(\.|\b)|v\/|\/v|\(v\)|phr\.?\s*v/i.test(p);
  const isNounExplicit = /\b(noun|danh)\b|\bn(\.|\b)|n\/|\/n|\(n\)/i.test(p);
  const isBothInP =
    (isVerbExplicit && isNounExplicit) ||
    p.includes("n,v") ||
    p.includes("v,n") ||
    p.includes("n/v") ||
    p.includes("v/n") ||
    p.includes("noun_verb");

  // Phát hiện vai trò ngữ cảnh dựa trên posString hoặc câu ví dụ
  let primaryRole: "noun" | "verb" | "other" =
    isVerbExplicit && !isNounExplicit
      ? "verb"
      : isNounExplicit && !isVerbExplicit
      ? "noun"
      : "other";

  if (primaryRole === "other" && contextSentence) {
    const roleFromSentence = detectWordRoleInSentence(cleanWord, contextSentence);
    if (roleFromSentence !== "other") {
      primaryRole = roleFromSentence;
    }
  }

  // 1. Tách nét nghĩa kép nếu chuỗi meaning chứa cả [n] và [v] hoặc (n) và (v) (Ưu tiên tùy biến của người dùng/đề thi)
  const dualMatch =
    m.match(/(?:\[n\]|\(n\.?\)|\bdanh từ:?)\s*([^·;(\[]+)(?:[·;]|\s+)\s*(?:\[v\]|\(v\.?\)|\bđộng từ:?)\s*(.+)/i) ||
    m.match(/(?:\[v\]|\(v\.?\)|\bđộng từ:?)\s*([^·;(\[]+)(?:[·;]|\s+)\s*(?:\[n\]|\(n\.?\)|\bdanh từ:?)\s*(.+)/i);

  if (dualMatch) {
    const isFirstNoun = /(?:\[n\]|\(n\.?\)|\bdanh từ)/i.test(m.slice(0, 15));
    return {
      isDual: true,
      nounIpa: dual?.nounIpa,
      verbIpa: dual?.verbIpa,
      nounMeaning: (isFirstNoun ? dualMatch[1] : dualMatch[2]).trim(),
      verbMeaning: (isFirstNoun ? dualMatch[2] : dualMatch[1]).trim(),
      nounAudioUrl:
        dual?.nounAudioUrl ||
        `/api/audio/tts?word=${encodeURIComponent(cleanWord)}&pos=noun&text=${encodeURIComponent(cleanWord)}`,
      verbAudioUrl:
        dual?.verbAudioUrl ||
        `/api/audio/tts?word=${encodeURIComponent(cleanWord)}&pos=verb&text=${encodeURIComponent("to " + cleanWord)}`,
      primaryRole,
    };
  }

  // 2. Trường hợp có trong DUAL_PRONUNCIATION_MAP
  if (dual) {
    return {
      isDual: true,
      nounIpa: dual.nounIpa,
      verbIpa: dual.verbIpa,
      nounMeaning: dual.nounMeaning || m,
      verbMeaning: dual.verbMeaning || m,
      nounAudioUrl:
        dual.nounAudioUrl ||
        `/api/audio/tts?word=${encodeURIComponent(cleanWord)}&pos=noun&text=${encodeURIComponent(cleanWord)}`,
      verbAudioUrl:
        dual.verbAudioUrl ||
        `/api/audio/tts?word=${encodeURIComponent(cleanWord)}&pos=verb&text=${encodeURIComponent("to " + cleanWord)}`,
      primaryRole,
    };
  }

  // 3. Nếu từ vựng có posString là n/v, v/n, n,v. hoặc DUAL_NOUN_VERB_WORDS và meaning có dấu chấm phẩy ; hoặc ·
  if (isBothInP || DUAL_NOUN_VERB_WORDS.has(cleanWord)) {
    const parts = m.split(/[;·]+/).map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const isFirstVerb = p.startsWith("v") || p.startsWith("động");
      return {
        isDual: true,
        nounMeaning: isFirstVerb ? parts.slice(1).join("; ") : parts[0],
        verbMeaning: isFirstVerb ? parts[0] : parts.slice(1).join("; "),
        nounAudioUrl: `/api/audio/tts?word=${encodeURIComponent(cleanWord)}&pos=noun&text=${encodeURIComponent(cleanWord)}`,
        verbAudioUrl: `/api/audio/tts?word=${encodeURIComponent(cleanWord)}&pos=verb&text=${encodeURIComponent("to " + cleanWord)}`,
        primaryRole,
      };
    }
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
