import type { VocabMetadata } from "@/features/vocab/types";
import {
  getPosBadgeInfo,
  generateNaturalExplanation,
} from "./vocab";

/**
 * Ngân hàng từ điển học thuật chuyên sâu dành riêng cho các từ vựng TOEIC Part 5
 * Giúp người học có trọn vẹn Họ từ (Word Family), Đồng nghĩa, Trái nghĩa, Cụm từ và Ngữ cảnh.
 */
export const TOEIC_VOCAB_DICTIONARY: Record<
  string,
  {
    meaning_vi: string;
    part_of_speech: string;
    phonetic: string;
    detailed_explanation: string;
    topic: string;
    word_family: { pos: string; word: string; meaning_vi: string }[];
    synonyms: string[];
    antonyms: string[];
    collocations: string[];
    toeic_example: string;
    toeic_example_translation: string;
  }
> = {
  "keynote speaker": {
    meaning_vi: "Diễn giả chính, người thuyết trình chủ đạo",
    part_of_speech: "Cụm danh từ (Noun Phrase)",
    phonetic: "/ˈkiːnoʊt ˈspiːkər/",
    detailed_explanation:
      "Cụm danh từ chỉ nhân vật quan trọng nhất được mời thuyết trình tại một hội nghị, hội thảo hoặc đại hội cổ đông nhằm trình bày thông điệp cốt lõi hoặc định hướng chiến lược.",
    topic: "Conferences & Public Relations",
    word_family: [
      { pos: "noun", word: "keynote", meaning_vi: "bài phát biểu chủ đạo" },
      { pos: "noun", word: "speaker", meaning_vi: "diễn giả, người nói" },
      { pos: "verb", word: "speak", meaning_vi: "nói, phát biểu" },
    ],
    synonyms: ["main speaker", "featured speaker", "guest speaker", "headlining speaker"],
    antonyms: ["attendee", "audience member"],
    collocations: ["invite a keynote speaker", "delivered by keynote speaker", "renowned keynote speaker"],
    toeic_example: "Dr. Alvarez was invited as the keynote speaker for the annual marketing summit.",
    toeic_example_translation: "Tiến sĩ Alvarez đã được mời làm diễn giả chính cho hội nghị thượng đỉnh tiếp thị thường niên.",
  },

  keynote: {
    meaning_vi: "Bài diễn văn chính, ý chủ đạo",
    part_of_speech: "Danh từ (Noun)",
    phonetic: "/ˈkiːnoʊt/",
    detailed_explanation:
      "Danh từ chỉ bài phát biểu khai mạc hoặc ý tưởng cốt lõi làm nền tảng cho một sự kiện hội nghị, chiến dịch truyền thông.",
    topic: "Conferences & Media",
    word_family: [
      { pos: "noun", word: "keynote address", meaning_vi: "bài diễn văn khai mạc" },
      { pos: "noun", word: "keynote speech", meaning_vi: "bài phát biểu then chốt" },
    ],
    synonyms: ["main theme", "central idea", "core message"],
    antonyms: ["footnote", "minor detail"],
    collocations: ["deliver a keynote", "keynote address", "keynote speech"],
    toeic_example: "The CEO's keynote address outlined the company's five-year expansion roadmap.",
    toeic_example_translation: "Bài phát biểu chủ đạo của CEO đã phác thảo lộ trình mở rộng năm năm của công ty.",
  },

  speaker: {
    meaning_vi: "Diễn giả, người phát biểu",
    part_of_speech: "Danh từ (Noun)",
    phonetic: "/ˈspiːkər/",
    detailed_explanation:
      "Danh từ chỉ cá nhân được phân công hoặc mời phát biểu, chia sẻ kiến thức chuyên môn trước công chúng hoặc người tham dự hội thảo.",
    topic: "Conferences & Communication",
    word_family: [
      { pos: "verb", word: "speak", meaning_vi: "nói, phát biểu" },
      { pos: "noun", word: "speech", meaning_vi: "bài phát biểu" },
    ],
    synonyms: ["lecturer", "presenter", "orator"],
    antonyms: ["listener", "spectator"],
    collocations: ["guest speaker", "public speaker", "introduce the speaker"],
    toeic_example: "The conference will feature five distinguished speakers from the technology sector.",
    toeic_example_translation: "Hội nghị sẽ có sự tham gia của năm diễn giả xuất sắc đến từ ngành công nghệ.",
  },

  "exchange rate": {
    meaning_vi: "Tỷ giá hối đoái",
    part_of_speech: "Cụm danh từ (Noun Phrase)",
    phonetic: "/ɪksˈtʃeɪndʒ reɪt/",
    detailed_explanation:
      "Cụm danh từ chỉ giá trị quy đổi giữa hai đồng tiền tệ quốc gia, đóng vai trò quyết định trong việc định giá hàng hóa xuất nhập khẩu.",
    topic: "Finance & Foreign Trade",
    word_family: [
      { pos: "noun", word: "exchange", meaning_vi: "sự trao đổi, sàn giao dịch" },
      { pos: "noun", word: "rate", meaning_vi: "tỷ lệ, mức giá" },
    ],
    synonyms: ["currency rate", "foreign exchange rate", "conversion rate"],
    antonyms: ["fixed parity"],
    collocations: ["fluctuating exchange rate", "favorable exchange rate", "foreign exchange rate"],
    toeic_example: "Due to the unstable exchange rate, importing raw materials has become significantly more costly.",
    toeic_example_translation: "Do tỷ giá hối đoái không ổn định, việc nhập khẩu nguyên liệu thô đã trở nên tốn kém hơn đáng kể.",
  },

  exchange: {
    meaning_vi: "Trao đổi, chuyển đổi; sự trao đổi",
    part_of_speech: "Danh từ (Noun) · Động từ (Verb)",
    phonetic: "/ɪksˈtʃeɪndʒ/",
    detailed_explanation:
      "Vừa là danh từ chỉ sự trao đổi, sàn giao dịch ngoại tệ hoặc hàng hóa, vừa là động từ chỉ hành động đổi vật này lấy vật khác hoặc chuyển đổi tiền tệ.",
    topic: "Finance & Commerce",
    word_family: [
      { pos: "adjective", word: "exchangeable", meaning_vi: "có thể đổi được" },
    ],
    synonyms: ["trade", "swap", "convert", "interchange"],
    antonyms: ["keep", "withhold"],
    collocations: ["currency exchange", "exchange ideas", "in exchange for"],
    toeic_example: "Customers may exchange defective merchandise within thirty days of purchase.",
    toeic_example_translation: "Khách hàng có thể đổi hàng hóa bị lỗi trong vòng 30 ngày kể từ khi mua.",
  },

  rate: {
    meaning_vi: "Mức giá, tỷ lệ; đánh giá",
    part_of_speech: "Danh từ (Noun) · Động từ (Verb)",
    phonetic: "/reɪt/",
    detailed_explanation:
      "Vừa là danh từ chỉ mức chi phí, giá cả tính theo đơn vị hoặc tỷ lệ phần trăm, vừa là động từ đánh giá chất lượng sản phẩm dịch vụ.",
    topic: "Finance & Ratings",
    word_family: [
      { pos: "noun", word: "rating", meaning_vi: "sự xếp hạng, đánh giá" },
    ],
    synonyms: ["price", "tariff", "fee", "evaluate", "assess"],
    antonyms: [],
    collocations: ["interest rate", "hourly rate", "discount rate", "highly rated"],
    toeic_example: "The boutique hotel offers discounted room rates for corporate partners.",
    toeic_example_translation: "Khách sạn boutique cung cấp mức giá phòng ưu đãi cho các đối tác doanh nghiệp.",
  },

  "conveyor system": {
    meaning_vi: "Hệ thống băng chuyền",
    part_of_speech: "noun phrase",
    phonetic: "/kənˈveɪər ˈsɪstəm/",
    detailed_explanation:
      "Cụm danh từ chỉ một hệ thống cơ khí liên tục dùng để vận chuyển hàng hóa, bưu kiện hoặc nguyên vật liệu từ vị trí này sang vị trí khác trong nhà máy, kho bãi hoặc sân bay.",
    topic: "Manufacturing & Logistics",
    word_family: [
      { pos: "verb", word: "convey", meaning_vi: "vận chuyển, truyền tải" },
      { pos: "noun", word: "conveyor", meaning_vi: "băng tải, người truyền tải" },
      { pos: "adjective", word: "conveyable", meaning_vi: "có thể vận chuyển được" },
    ],
    synonyms: ["assembly line", "belt conveyor", "transport system", "production line"],
    antonyms: ["manual handling", "stationary storage"],
    collocations: ["install a conveyor system", "automated conveyor system", "conveyor belt maintenance"],
    toeic_example: "The warehouse upgraded its conveyor system to process shipments more efficiently.",
    toeic_example_translation: "Nhà kho đã nâng cấp hệ thống băng chuyền để xử lý các lô hàng một cách hiệu quả hơn.",
  },

  operate: {
    meaning_vi: "Vận hành, hoạt động",
    part_of_speech: "verb",
    phonetic: "/ˈɑːpəreɪt/",
    detailed_explanation:
      "Động từ diễn tả hành động điều khiển, chạy máy móc hoặc chỉ tình trạng một doanh nghiệp/tổ chức đang mở cửa thực hiện các hoạt động kinh doanh hàng ngày.",
    topic: "Operations & Business",
    word_family: [
      { pos: "noun", word: "operation", meaning_vi: "sự vận hành, hoạt động" },
      { pos: "noun", word: "operator", meaning_vi: "người vận hành, nhân viên tổng đài" },
      { pos: "adjective", word: "operational", meaning_vi: "thuộc về vận hành, sẵn sàng hoạt động" },
      { pos: "adverb", word: "operationally", meaning_vi: "về mặt vận hành" },
    ],
    synonyms: ["run", "function", "work", "manage", "perform"],
    antonyms: ["malfunction", "shut down", "cease", "stop"],
    collocations: ["operate smoothly", "operate efficiently", "operate under regulations", "hours of operation"],
    toeic_example: "The manufacturing facility operates twenty-four hours a day during peak season.",
    toeic_example_translation: "Cơ sở sản xuất vận hành 24 giờ mỗi ngày trong suốt mùa cao điểm.",
  },

  efficiently: {
    meaning_vi: "Một cách hiệu quả, năng suất",
    part_of_speech: "adverb",
    phonetic: "/ɪˈfɪʃntli/",
    detailed_explanation:
      "Trạng từ chỉ cách thức hoàn thành công việc một cách nhanh chóng, đúng quy trình mà không lãng phí thời gian, công sức hoặc ngân sách.",
    topic: "Productivity & Performance",
    word_family: [
      { pos: "adjective", word: "efficient", meaning_vi: "hiệu quả, có năng suất" },
      { pos: "noun", word: "efficiency", meaning_vi: "sự hiệu quả, hiệu suất" },
    ],
    synonyms: ["effectively", "productively", "competently", "successfully"],
    antonyms: ["inefficiently", "wastefully", "sluggishly"],
    collocations: ["run efficiently", "work efficiently", "manage tasks efficiently", "energy efficiently"],
    toeic_example: "The new software allows our staff to process customer orders much more efficiently.",
    toeic_example_translation: "Phần mềm mới cho phép nhân viên xử lý các đơn đặt hàng của khách hàng hiệu quả hơn nhiều.",
  },

  nervous: {
    meaning_vi: "Lo lắng, hồi hộp, bồn chồn",
    part_of_speech: "adjective",
    phonetic: "/ˈnɜːrvəs/",
    detailed_explanation:
      "Tính từ diễn tả trạng thái tâm lý lo âu, bồn chồn hoặc căng thẳng về mặt tinh thần, thường xuất hiện trước các sự kiện quan trọng như thuyết trình, phỏng vấn xin việc hoặc đối mặt với hạn chót áp lực.",
    topic: "Workplace Psychology & Communication",
    word_family: [
      { pos: "adverb", word: "nervously", meaning_vi: "một cách lo lắng, hồi hộp" },
      { pos: "noun", word: "nervousness", meaning_vi: "sự lo lắng, cảm giác bồn chồn" },
    ],
    synonyms: ["anxious", "jittery", "uneasy", "apprehensive", "tense"],
    antonyms: ["calm", "relaxed", "confident", "composed"],
    collocations: ["feel nervous", "nervous about an interview", "nervous breakdown", "make someone nervous"],
    toeic_example: "Candidates often feel nervous during the final round of executive interviews.",
    toeic_example_translation: "Các ứng viên thường cảm thấy hồi hộp trong vòng phỏng vấn điều hành cuối cùng.",
  },

  confidential: {
    meaning_vi: "Bảo mật, tuyệt mật",
    part_of_speech: "adjective",
    phonetic: "/ˌkɑːnfɪˈdenʃl/",
    detailed_explanation:
      "Tính từ chỉ các tài liệu, thông tin hoặc dữ liệu nhạy cảm được yêu cầu giữ bí mật tuyệt đối, chỉ những người có thẩm quyền được phân quyền mới được phép tiếp cận.",
    topic: "Corporate Security & Law",
    word_family: [
      { pos: "adverb", word: "confidentially", meaning_vi: "một cách bí mật" },
      { pos: "noun", word: "confidentiality", meaning_vi: "tính bảo mật, sự giữ kín" },
    ],
    synonyms: ["secret", "private", "classified", "restricted"],
    antonyms: ["public", "open", "unrestricted", "accessible"],
    collocations: ["confidential documents", "strictly confidential", "confidentiality agreement", "remain confidential"],
    toeic_example: "All customer account details must be kept strictly confidential according to company policy.",
    toeic_example_translation: "Mọi thông tin chi tiết về tài khoản khách hàng phải được giữ bí mật tuyệt đối theo chính sách công ty.",
  },

  shredded: {
    meaning_vi: "Được cắt nhỏ tiêu hủy, băm vụn",
    part_of_speech: "verb (past participle / adj)",
    phonetic: "/ˈʃredɪd/",
    detailed_explanation:
      "Dạng quá khứ phân từ của động từ shred, chỉ hành động cắt xé tài liệu, giấy tờ văn bản thành các dải nhỏ bằng máy hủy tài liệu nhằm bảo vệ thông tin mật không bị rò rỉ.",
    topic: "Office Administration & Safety",
    word_family: [
      { pos: "verb", word: "shred", meaning_vi: "cắt vụn, xé nhỏ" },
      { pos: "noun", word: "shredder", meaning_vi: "máy hủy tài liệu" },
    ],
    synonyms: ["destroyed", "cut up", "disposed of", "demolished"],
    antonyms: ["intact", "assembled", "preserved"],
    collocations: ["paper shredder", "shredded documents", "must be shredded before disposal"],
    toeic_example: "Financial records older than seven years were safely shredded by the compliance team.",
    toeic_example_translation: "Các hồ sơ tài chính lưu trữ quá 7 năm đã được đội tuân thủ tiêu hủy an toàn bằng máy cắt giấy.",
  },

  brief: {
    meaning_vi: "Ngắn gọn, súc tích",
    part_of_speech: "adjective",
    phonetic: "/briːf/",
    detailed_explanation:
      "Tính từ chỉ khoảng thời gian ngắn hoặc tài liệu/bài phát biểu chỉ tập trung vào các điểm mấu chốt một cách cô đọng, tiết kiệm thời gian của người nghe.",
    topic: "Meetings & Presentations",
    word_family: [
      { pos: "adverb", word: "briefly", meaning_vi: "một cách ngắn gọn, trong thời gian ngắn" },
      { pos: "noun", word: "briefing", meaning_vi: "cuộc họp chỉ đạo ngắn" },
      { pos: "noun", word: "brevity", meaning_vi: "sự súc tích, ngắn gọn" },
    ],
    synonyms: ["concise", "short", "succinct", "to the point"],
    antonyms: ["lengthy", "long", "detailed", "extended"],
    collocations: ["brief summary", "brief overview", "give a brief presentation", "in brief"],
    toeic_example: "Mr. Tanaka gave a brief presentation outlining the key achievements of the third quarter.",
    toeic_example_translation: "Ông Tanaka đã có một bài thuyết trình ngắn gọn phác thảo những thành tựu then chốt của quý 3.",
  },

  summary: {
    meaning_vi: "Bản tóm tắt, phần tổng kết",
    part_of_speech: "noun",
    phonetic: "/ˈsʌməri/",
    detailed_explanation:
      "Danh từ chỉ một báo cáo ngắn gọn bao quát những điểm chính của một văn bản, báo cáo tài chính hoặc cuộc họp dài.",
    topic: "Reports & Financials",
    word_family: [
      { pos: "verb", word: "summarize", meaning_vi: "tóm tắt, tổng kết" },
      { pos: "adverb", word: "summarily", meaning_vi: "ngay tức khắc, tóm tắt" },
    ],
    synonyms: ["overview", "abstract", "synopsis", "recap"],
    antonyms: ["full text", "exhaustive report"],
    collocations: ["executive summary", "financial summary", "provide a summary", "in summary"],
    toeic_example: "Please read the executive summary before attending tomorrow's shareholder conference.",
    toeic_example_translation: "Vui lòng đọc bản tóm tắt dành cho ban điều hành trước khi tham dự hội nghị cổ đông ngày mai.",
  },

  export: {
    meaning_vi: "Hàng xuất khẩu, sự xuất khẩu; xuất khẩu",
    part_of_speech: "Danh từ (Noun) / Động từ (Verb)",
    phonetic: "/ˈekspɔːrt/ (n) · /ɪkˈspɔːrt/ (v)",
    detailed_explanation:
      "Vừa là danh từ chỉ hàng hóa bán ra thị trường nước ngoài hoặc hoạt động thương mại quốc tế, vừa là động từ diễn tả hành vi bán hàng hóa và dịch vụ qua biên giới quốc gia nhằm gia tăng doanh thu.",
    topic: "International Trade & Logistics",
    word_family: [
      { pos: "noun", word: "exporter", meaning_vi: "nhà xuất khẩu, doanh nghiệp xuất khẩu" },
      { pos: "noun", word: "exportation", meaning_vi: "sự xuất khẩu hàng hóa" },
      { pos: "adjective", word: "exportable", meaning_vi: "có thể xuất khẩu được" },
    ],
    synonyms: ["shipment abroad", "overseas trade", "foreign sale"],
    antonyms: ["import", "domestic goods"],
    collocations: ["boost exports", "overseas exports", "export license", "export market"],
    toeic_example: "Boosted by favorable exchange rates, overseas exports increased by 15 percent in the third quarter.",
    toeic_example_translation: "Được thúc đẩy bởi tỷ giá hối đoái thuận lợi, kim ngạch xuất khẩu ra nước ngoài đã tăng 15% trong quý ba.",
  },

  favorable: {
    meaning_vi: "Thuận lợi, có lợi, tán thành",
    part_of_speech: "Tính từ (Adj)",
    phonetic: "/ˈfeɪvərəbl/",
    detailed_explanation:
      "Tính từ mô tả các điều kiện thương mại, thời tiết hoặc đánh giá tích cực mang lại lợi thế cạnh tranh hoặc cơ hội phát triển cho doanh nghiệp.",
    topic: "Business Economics",
    word_family: [
      { pos: "adverb", word: "favorably", meaning_vi: "một cách thuận lợi, tích cực" },
      { pos: "noun", word: "favor", meaning_vi: "sự ủng hộ, ân huệ" },
      { pos: "adjective", word: "favorite", meaning_vi: "được yêu thích nhất" },
    ],
    synonyms: ["advantageous", "beneficial", "positive", "promising"],
    antonyms: ["unfavorable", "adverse", "detrimental"],
    collocations: ["favorable exchange rates", "favorable conditions", "favorable review", "favorable outcome"],
    toeic_example: "The company reported strong profits thanks to favorable market conditions.",
    toeic_example_translation: "Công ty đã báo cáo mức lợi nhuận cao nhờ vào các điều kiện thị trường thuận lợi.",
  },

  "favorable exchange rates": {
    meaning_vi: "Tỷ giá hối đoái thuận lợi",
    part_of_speech: "Cụm từ (Phrase)",
    phonetic: "/ˈfeɪvərəbl ɪksˈtʃeɪndʒ reɪts/",
    detailed_explanation:
      "Cụm danh từ chỉ biến động tỷ giá tiền tệ mang lại lợi thế lớn cho các doanh nghiệp xuất khẩu khi chuyển đổi doanh thu ngoại tệ về đồng nội tệ.",
    topic: "Finance & Foreign Trade",
    word_family: [
      { pos: "adjective", word: "favorable", meaning_vi: "thuận lợi, có lợi" },
      { pos: "noun", word: "exchange rate", meaning_vi: "tỷ giá hối đoái" },
    ],
    synonyms: ["competitive currency rates", "advantageous exchange rate"],
    antonyms: ["unfavorable currency rates"],
    collocations: ["take advantage of favorable exchange rates", "due to favorable exchange rates"],
    toeic_example: "Boosted by favorable exchange rates, overseas exports increased by 15 percent in the third quarter.",
    toeic_example_translation: "Được thúc đẩy bởi tỷ giá hối đoái thuận lợi, kim ngạch xuất khẩu ra nước ngoài đã tăng 15% trong quý ba.",
  },

  boost: {
    meaning_vi: "Thúc đẩy, tăng cường, làm tăng",
    part_of_speech: "Động từ (Verb) / Danh từ (Noun)",
    phonetic: "/buːst/",
    detailed_explanation:
      "Động từ diễn tả hành động đẩy mạnh, kích thích hoặc làm tăng trưởng doanh số, tinh thần làm việc hoặc sản lượng sản xuất của một tổ chức.",
    topic: "Corporate Growth",
    word_family: [
      { pos: "noun", word: "booster", meaning_vi: "yếu tố thúc đẩy, động lực" },
    ],
    synonyms: ["enhance", "increase", "elevate", "strengthen", "stimulate"],
    antonyms: ["decrease", "diminish", "hinder", "reduce"],
    collocations: ["boost sales", "boost exports", "boost morale", "give a boost to"],
    toeic_example: "The marketing campaign helped boost retail sales by twenty percent.",
    toeic_example_translation: "Chiến dịch tiếp thị đã giúp đẩy mạnh doanh số bán lẻ tăng thêm 20%.",
  },

  overseas: {
    meaning_vi: "Ở nước ngoài, hải ngoại",
    part_of_speech: "Tính từ (Adj) / Trạng từ (Adv)",
    phonetic: "/ˌoʊvərˈsiːz/",
    detailed_explanation:
      "Tính từ hoặc trạng từ mô tả các hoạt động thương mại, thị trường, chi nhánh hoặc đối tác nằm ở nước ngoài qua đường biển/quốc tế.",
    topic: "Global Business",
    word_family: [
      { pos: "noun", word: "overseas market", meaning_vi: "thị trường hải ngoại" },
    ],
    synonyms: ["abroad", "international", "foreign", "global"],
    antonyms: ["domestic", "local", "internal"],
    collocations: ["overseas branches", "overseas clients", "expand overseas", "overseas exports"],
    toeic_example: "The corporation plans to open three new overseas branches next year.",
    toeic_example_translation: "Tập đoàn có kế hoạch mở thêm ba chi nhánh hải ngoại vào năm tới.",
  },
};

/**
 * Bảng ánh xạ phiên âm chuẩn quốc tế (IPA) dành cho các từ vựng và cụm từ thông dụng trong TOEIC
 */
export const PHONETIC_WORD_MAP: Record<string, string> = {
  // Cụm từ & từ khóa cốt lõi Part 5
  keynote: "ˈkiːnoʊt",
  speaker: "ˈspiːkər",
  speakers: "ˈspiːkərz",
  "keynote speaker": "ˈkiːnoʊt ˈspiːkər",
  exchange: "ɪksˈtʃeɪndʒ",
  rate: "reɪt",
  rates: "reɪts",
  "exchange rate": "ɪksˈtʃeɪndʒ reɪt",
  "exchange rates": "ɪksˈtʃeɪndʒ reɪts",
  favorable: "ˈfeɪvərəbl",
  "favorable exchange rates": "ˈfeɪvərəbl ɪksˈtʃeɪndʒ reɪts",
  export: "ˈekspɔːrt",
  exports: "ˈekspɔːrts",
  import: "ˈɪmpɔːrt",
  imports: "ˈɪmpɔːrts",
  boost: "buːst",
  boosts: "buːsts",
  boosted: "ˈbuːstɪd",
  overseas: "ˌoʊvərˈsiːz",
  conveyor: "kənˈveɪər",
  system: "ˈsɪstəm",
  systems: "ˈsɪstəmz",
  "conveyor system": "kənˈveɪər ˈsɪstəm",
  operate: "ˈɑːpəreɪt",
  operates: "ˈɑːpəreɪts",
  operated: "ˈɑːpəreɪtɪd",
  operating: "ˈɑːpəreɪtɪŋ",
  efficient: "ɪˈfɪʃnt",
  efficiently: "ɪˈfɪʃntli",
  efficiency: "ɪˈfɪʃnsi",
  nervous: "ˈnɜːrvəs",
  confidential: "ˌkɑːnfɪˈdenʃl",
  shred: "ʃred",
  shredded: "ˈʃredɪd",
  brief: "briːf",
  briefly: "ˈbriːfli",
  summary: "ˈsʌməri",
  summaries: "ˈsʌməriz",
  customer: "ˈkʌstəmər",
  customers: "ˈkʌstəmərz",
  service: "ˈsɜːrvɪs",
  services: "ˈsɜːrvɪsɪz",
  "customer service": "ˈkʌstəmər ˈsɜːrvɪs",
  board: "bɔːrd",
  meeting: "ˈmiːtɪŋ",
  meetings: "ˈmiːtɪŋz",
  "board meeting": "bɔːrd ˈmiːtɪŋ",
  director: "daɪˈrektər",
  directors: "daɪˈrektərz",
  "board of directors": "bɔːrd əv daɪˈrektərz",
  annual: "ˈænjuəl",
  report: "rɪˈpɔːrt",
  reports: "rɪˈpɔːrts",
  "annual report": "ˈænjuəl rɪˈpɔːrt",
  "annual meeting": "ˈænjuəl ˈmiːtɪŋ",
  press: "pres",
  release: "rɪˈliːs",
  "press release": "pres rɪˈliːs",
  safety: "ˈseɪfti",
  regulation: "ˌreɡjuˈleɪʃn",
  regulations: "ˌreɡjuˈleɪʃnz",
  "safety regulations": "ˈseɪfti ˌreɡjuˈleɪʃnz",
  flight: "flaɪt",
  attendant: "əˈtendənt",
  "flight attendant": "flaɪt əˈtendənt",
  take: "teɪk",
  advantage: "ədˈvæntɪdʒ",
  of: "əv",
  "take advantage of": "teɪk ədˈvæntɪdʒ əv",
  due: "djuː",
  to: "tuː",
  "due to": "djuː tuː",
  in: "ɪn",
  order: "ˈɔːrdər",
  "in order to": "ɪn ˈɔːrdər tuː",
  charge: "tʃɑːrdʒ",
  "in charge of": "ɪn tʃɑːrdʒ əv",
  behalf: "bɪˈhæf",
  "on behalf of": "ɑːn bɪˈhæf əv",
  as: "æz",
  well: "wel",
  "as well as": "æz wel æz",
  prior: "ˈpraɪər",
  "prior to": "ˈpraɪər tuː",
  look: "lʊk",
  forward: "ˈfɔːrwərd",
  "look forward to": "lʊk ˈfɔːrwərd tuː",
  comply: "kəmˈplaɪ",
  with: "wɪð",
  "comply with": "kəmˈplaɪ wɪð",
  participate: "pɑːrˈtɪsɪpeɪt",
  "participate in": "pɑːrˈtɪsɪpeɪt ɪn",
  account: "əˈkaʊnt",
  for: "fɔːr",
  "account for": "əˈkaʊnt fɔːr",
  focus: "ˈfoʊkəs",
  on: "ɑːn",
  "focus on": "ˈfoʊkəs ɑːn",
  schedule: "ˈskedʒuːl",
  scheduled: "ˈskedʒuːld",
  increase: "ɪnˈkriːs",
  increased: "ɪnˈkriːst",
  decrease: "dɪˈkriːs",
  decreased: "dɪˈkriːst",
  revenue: "ˈrevənuː",
  profit: "ˈprɑːfɪt",
  profits: "ˈprɑːfɪts",
  quarter: "ˈkwɔːrtər",
  quarterly: "ˈkwɔːrtərli",
  growth: "ɡroʊθ",
  strategy: "ˈstrætədʒi",
  development: "dɪˈveləpmənt",
  investment: "ɪnˈvestmənt",
  contract: "ˈkɑːntrækt",
  agreement: "əˈɡriːmənt",
  proposal: "prəˈpoʊzl",
  presentation: "ˌpriːzenˈteɪʃn",
  conference: "ˈkɑːnfərəns",
  seminar: "ˈsemɪnɑːr",
  workshop: "ˈwɜːrkʃɑːp",
  facility: "fəˈsɪləti",
  facilities: "fəˈsɪlətiz",
  warehouse: "ˈwerhaʊs",
  equipment: "ɪˈkwɪpmənt",
  maintenance: "ˈmeɪntənəns",
  warranty: "ˈwɔːrənti",
  guarantee: "ˌɡærənˈtiː",
  client: "ˈklaɪənt",
  clients: "ˈklaɪənts",
  vendor: "ˈvendər",
  vendors: "ˈvendərz",
  supplier: "səˈplaɪər",
  suppliers: "səˈplaɪərz",
  shipment: "ˈʃɪpmənt",
  shipments: "ˈʃɪpmənts",
  delivery: "dɪˈlɪvəri",
  department: "dɪˈpɑːrtmənt",
  division: "dɪˈvɪʒn",
  employee: "ɪmˈplɔɪiː",
  employees: "ɪmˈplɔɪiːz",
  manager: "ˈmænɪdʒər",
  management: "ˈmænɪdʒmənt",
  executive: "ɪɡˈzekjətɪv",
  human: "ˈhjuːmən",
  resource: "ˈriːsɔːrs",
  resources: "rɪˈsɔːrsɪz",
  "human resources": "ˈhjuːmən rɪˈsɔːrsɪz",
  candidate: "ˈkændɪdeɪt",
  applicant: "ˈæplɪkənt",
  interview: "ˈɪntərvjuː",
  position: "pəˈzɪʃn",
  deadline: "ˈdedlaɪn",
  requirement: "rɪˈkwaɪərmənt",
  requirements: "rɪˈkwaɪərmənts",
  policy: "ˈpɑːləsi",
  procedure: "prəˈsiːdʒər",
  product: "ˈprɑːdʌkt",
  production: "prəˈdʌkʃn",
  quality: "ˈkwɑːləti",
  security: "səˈkjʊrəti",
  access: "ˈækses",
  request: "rɪˈkwest",
  refund: "ˈriːfʌnd",
  discount: "ˈdɪskaʊnt",
  delay: "dɪˈleɪ",
  notice: "ˈnoʊtɪs",
  information: "ˌɪnfərˈmeɪʃn",
  contact: "ˈkɑːntækt",
  support: "səˈpɔːrt",
  market: "ˈmɑːrkɪt",
  business: "ˈbɪznəs",
  company: "ˈkʌmpəni",
  corporation: "ˌkɔːrpəˈreɪʃn",
  firm: "fɜːrm",
  office: "ˈɑːfɪs",
  staff: "stæf",
  team: "tiːm",
  price: "praɪs",
  cost: "kɔːst",
  costs: "kɔːsts",
  sales: "seɪlz",
  budget: "ˈbʌdʒɪt",
  finance: "ˈfaɪnæns",
  financial: "faɪˈnænʃl",
  plan: "plæn",
  plans: "plænz",
  project: "ˈprɑːdʒekt",
  projects: "ˈprɑːdʒekts",
  condition: "kənˈdɪʃn",
  conditions: "kənˈdɪʃnz",
  standard: "ˈstændərd",
  standards: "ˈstændərdz",
  feedback: "ˈfiːdbæk",
  survey: "ˈsɜːrveɪ",
  inquiry: "ˈɪnkwəri",
  inquiries: "ˈɪnkwəriz",
  complaint: "kəmˈpleɪnt",
  complaints: "kəmˈpleɪnts",
  solution: "səˈluːʃn",
  solutions: "səˈluːʃnz",
  success: "səkˈses",
  successful: "səkˈsesfl",
  successfully: "səkˈsesfəli",
  effective: "ɪˈfektɪv",
  effectively: "ɪˈfektɪvli",
  available: "əˈveɪləbl",
  eligible: "ˈelɪdʒəbl",
  responsible: "rɪˈspɑːnsəbl",
  appropriate: "əˈproʊpriət",
  essential: "ɪˈsenʃl",
  critical: "ˈkrɪtɪkl",
  significant: "sɪɡˈnɪfɪkənt",
  significantly: "sɪɡˈnɪfɪkəntli",
  substantial: "səbˈstænʃl",
  substantially: "səbˈstænʃli",
  rapid: "ˈræpɪd",
  rapidly: "ˈræpɪdli",
  steady: "ˈstedi",
  steadily: "ˈstedɪli",
  temporary: "ˈtempəreri",
  temporarily: "ˌtempəˈrerəli",
  permanent: "ˈpɜːrmənənt",
  permanently: "ˈpɜːrmənəntli",
  initial: "ɪˈnɪʃl",
  initially: "ɪˈnɪʃəli",
  final: "ˈfaɪnl",
  finally: "ˈfaɪnəli",
  regular: "ˈreɡjələr",
  regularly: "ˈreɡjələrli",
  frequent: "ˈfriːkwənt",
  frequently: "ˈfriːkwəntli",
  recent: "ˈriːsnt",
  recently: "ˈriːsntli",
  current: "ˈkɜːrənt",
  currently: "ˈkɜːrəntli",
  direct: "dəˈrekt",
  directly: "dəˈrektli",
  immediate: "ɪˈmiːdiət",
  immediately: "ɪˈmiːdiətli",
  proper: "ˈprɑːpər",
  properly: "ˈprɑːpərli",
  thorough: "ˈθɜːroʊ",
  thoroughly: "ˈθɜːrəli",
  accurate: "ˈækjərət",
  accurately: "ˈækjərətli",
  convenient: "kənˈviːniənt",
  conveniently: "kənˈviːniəntli",
  suitable: "ˈsuːtəbl",
  reliable: "rɪˈlaɪəbl",
  flexible: "ˈfleksəbl",
  innovative: "ˈɪnəveɪtɪv",
  competitive: "kəmˈpetətɪv",
  beneficial: "ˌbenɪˈfɪʃl",
  promising: "ˈprɑːmɪsɪŋ",
  comprehensive: "ˌkɑːmprɪˈhensɪv",
  line: "laɪn",
  assembly: "əˈsembli",
  "assembly line": "əˈsembli laɪn",
  logistics: "ləˈdʒɪstɪks",
  supply: "səˈplaɪ",
  chain: "tʃeɪn",
  "supply chain": "səˈplaɪ tʃeɪn",
  inventory: "ˈɪnvəntɔːri",

  // Cụm từ và từ thông dụng trong giao tiếp & công sở TOEIC
  nice: "naɪs",
  meet: "miːt",
  you: "juː",
  "nice to meet you": "naɪs tuː miːt juː",
  good: "ɡʊd",
  morning: "ˈmɔːrnɪŋ",
  afternoon: "ˌæftərˈnuːn",
  evening: "ˈiːvnɪŋ",
  see: "siː",
  later: "ˈleɪtər",
  care: "ker",
  "take care": "teɪk ker",
  "take care of": "teɪk ker əv",
  far: "fɑːr",
  "so far": "soʊ fɑːr",
  such: "sʌtʃ",
  "such as": "sʌtʃ æz",
  thanks: "θæŋks",
  "thanks to": "θæŋks tuː",
  accordance: "əˈkɔːrdns",
  "in accordance with": "ɪn əˈkɔːrdns wɪð",
  compliance: "kəmˈplaɪəns",
  "in compliance with": "ɪn kəmˈplaɪəns wɪð",
  spite: "spaɪt",
  "in spite of": "ɪn spaɪt əv",
  view: "vjuː",
  point: "pɔɪnt",
  "point of view": "pɔɪnt əv vjuː",
  touch: "tʌtʃ",
  keep: "kiːp",
  "keep in touch": "kiːp ɪn tʌtʃ",
  mind: "maɪnd",
  "keep in mind": "kiːp ɪn maɪnd",
};

/**
 * Trích xuất phần IPA cốt lõi từ chuỗi phiên âm (bỏ dấu gạch / và chú thích)
 */
function extractCoreIpa(ipaString?: string): string {
  if (!ipaString) return "";
  const firstSlashMatch = ipaString.match(/\/([^\/]+)\//);
  if (firstSlashMatch) {
    return firstSlashMatch[1].trim();
  }
  return ipaString.replace(/^\/+|\/+$/g, "").trim();
}

/**
 * Giải quyết và sinh phiên âm ngữ âm chuẩn IPA cho từ vựng và CỤM TỪ (Phrases):
 * - Ưu tiên phiên âm đã lưu nếu hợp lệ
 * - Tra cứu từ điển trực tiếp
 * - Tự động ghép nối IPA từ các từ thành phần cho cụm từ (Phrases / Compound words)
 */
export function resolvePhonetic(
  term: string,
  existingPhonetic?: string
): string {
  const existing = (existingPhonetic || "").trim();
  if (existing && existing !== "//" && existing !== "/") {
    return existing;
  }

  if (!term || !term.trim()) return "";

  const clean = term.trim().toLowerCase();

  // 1. Kiểm tra trực tiếp trong kho từ điển TOEIC chính
  if (TOEIC_VOCAB_DICTIONARY[clean]?.phonetic) {
    return TOEIC_VOCAB_DICTIONARY[clean].phonetic;
  }

  // 2. Kiểm tra trực tiếp trong PHONETIC_WORD_MAP
  if (PHONETIC_WORD_MAP[clean]) {
    const raw = PHONETIC_WORD_MAP[clean];
    return raw.startsWith("/") ? raw : `/${raw}/`;
  }

  // 3. Xử lý số nhiều hoặc biến thể đuôi s, es, ed của từ đơn
  if (!clean.includes(" ") && !clean.includes("-")) {
    if (clean.endsWith("s")) {
      const base = clean.endsWith("es") ? clean.slice(0, -2) : clean.slice(0, -1);
      const baseIpa =
        extractCoreIpa(TOEIC_VOCAB_DICTIONARY[base]?.phonetic) ||
        PHONETIC_WORD_MAP[base];
      if (baseIpa) {
        return `/${baseIpa}s/`;
      }
    }
    if (clean.endsWith("ed")) {
      const base = clean.slice(0, -2);
      const baseIpa =
        extractCoreIpa(TOEIC_VOCAB_DICTIONARY[base]?.phonetic) ||
        PHONETIC_WORD_MAP[base];
      if (baseIpa) {
        return `/${baseIpa}d/`;
      }
    }
  }

  // 4. Xử lý CỤM TỪ (Phrases): Ghép nối phiên âm IPA từ các từ thành phần
  if (clean.includes(" ") || clean.includes("-")) {
    const tokens = clean.split(/[\s\-]+/);
    const resolvedTokens: string[] = [];

    for (const token of tokens) {
      if (!token) continue;
      let tokenIpa =
        extractCoreIpa(TOEIC_VOCAB_DICTIONARY[token]?.phonetic) ||
        PHONETIC_WORD_MAP[token];

      if (!tokenIpa && token.endsWith("s")) {
        const base = token.endsWith("es") ? token.slice(0, -2) : token.slice(0, -1);
        const baseIpa =
          extractCoreIpa(TOEIC_VOCAB_DICTIONARY[base]?.phonetic) ||
          PHONETIC_WORD_MAP[base];
        if (baseIpa) {
          tokenIpa = `${baseIpa}s`;
        }
      }

      if (tokenIpa) {
        resolvedTokens.push(tokenIpa);
      } else {
        resolvedTokens.push(token);
      }
    }

    if (resolvedTokens.length > 0) {
      return `/${resolvedTokens.join(" ")}/`;
    }
  }

  return "";
}

/**
 * Hàm làm giàu dữ liệu từ vựng (Enrichment):
 * Tra cứu kho từ điển học thuật hoặc tự động suy luận các trường quan trọng
 */
export function enrichVocabMetadata(
  word: string,
  meaningVi: string,
  contextSentence: string = ""
): {
  part_of_speech: string;
  phonetic: string;
  context_translation: string;
  metadata: VocabMetadata;
} {
  const normalizedKey = word.trim().toLowerCase();
  const dictItem =
    TOEIC_VOCAB_DICTIONARY[normalizedKey] ||
    (normalizedKey.endsWith("s")
      ? TOEIC_VOCAB_DICTIONARY[normalizedKey.slice(0, -1)]
      : undefined) ||
    (normalizedKey.endsWith("es")
      ? TOEIC_VOCAB_DICTIONARY[normalizedKey.slice(0, -2)]
      : undefined);

  const resolvedIpa = dictItem?.phonetic || resolvePhonetic(word);

  if (dictItem) {
    return {
      part_of_speech: dictItem.part_of_speech,
      phonetic: resolvedIpa,
      context_translation: dictItem.toeic_example_translation,
      metadata: {
        phonetic: resolvedIpa,
        detailed_explanation: dictItem.detailed_explanation,
        topic: dictItem.topic,
        word_family: dictItem.word_family,
        synonyms: dictItem.synonyms,
        antonyms: dictItem.antonyms,
        collocations: dictItem.collocations,
        toeic_example: dictItem.toeic_example,
        toeic_example_translation: dictItem.toeic_example_translation,
      },
    };
  }

  // Fallback thông minh theo từ loại: Sinh giải thích tự nhiên, tránh rập khuôn máy móc
  const posInfo = getPosBadgeInfo(undefined, meaningVi, word);
  const naturalExplanation = generateNaturalExplanation(
    word,
    meaningVi,
    posInfo.category
  );

  return {
    part_of_speech: posInfo.labelFull,
    phonetic: resolvedIpa,
    context_translation: "",
    metadata: {
      phonetic: resolvedIpa,
      detailed_explanation: naturalExplanation,
      topic: "TOEIC Essential Vocabulary",
      word_family: [
        { pos: posInfo.shortBadge, word, meaning_vi: meaningVi },
      ],
      synonyms: [],
      antonyms: [],
      collocations: [`essential ${word}`, `key ${word}`],
      toeic_example: contextSentence || `The management emphasized the importance of ${word}.`,
      toeic_example_translation: meaningVi ? `Ban quản lý đã nhấn mạnh tầm quan trọng của ${meaningVi.toLowerCase()}.` : "",
    },
  };
}
