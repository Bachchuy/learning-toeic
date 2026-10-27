import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Đọc biến môi trường từ .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  for (const line of envConfig.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...values] = trimmed.split("=");
      process.env[key.trim()] = values.join("=").trim();
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ LỖI: Thiếu biến môi trường NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface SeedQuestionData {
  id: string;
  stem: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  tag_code: string;
  difficulty: number;
  content_hash: string;
  correct_index: number;
  explanation: {
    rule_vi: string;
    why_correct_vi: string;
    full_translation_vi: string;
    options_analysis: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
    tip_vi?: string;
    example_en?: string;
    vocab_hints?: Array<{ word: string; meaning_vi: string }>;
  };
}

const QUESTIONS: SeedQuestionData[] = [
  // 1. WORD FORMS
  {
    id: "22222222-2222-2222-2222-222222222201",
    stem: "Mr. Tanaka presented a ____ summary of the quarterly financial results at yesterday's board meeting.",
    option_a: "brief",
    option_b: "briefly",
    option_c: "briefed",
    option_d: "briefing",
    tag_code: "word_form",
    difficulty: 1,
    content_hash: "ets_q01_wordforms",
    correct_index: 0,
    explanation: {
      rule_vi: "Cấu trúc cụm danh từ: Mạo từ (a/an/the) + Tính từ (Adjective) + Danh từ (Noun).",
      why_correct_vi: "Chỗ trống đứng sau mạo từ 'a' và đứng trước danh từ 'summary' (bản tóm tắt). Do đó vị trí này bắt buộc phải là một Tính từ (Adjective) để bổ nghĩa cho 'summary'. Từ 'brief' (ngắn gọn) là tính từ chính xác.",
      full_translation_vi: "Ông Tanaka đã trình bày một bản tóm tắt ngắn gọn về kết quả tài chính hàng quý tại cuộc họp hội đồng quản trị ngày hôm qua.",
      options_analysis: {
        A: "brief (adj): ngắn gọn, súc tích (Đúng: bổ nghĩa cho danh từ summary)",
        B: "briefly (adv): một cách ngắn gọn (Sai: trạng từ không đứng trước bổ nghĩa danh từ)",
        C: "briefed (v-ed): đã hướng dẫn, đã chỉ đạo (Sai: không hợp ngữ cảnh)",
        D: "briefing (n): cuộc họp ngắn, buổi chỉ dẫn (Sai: ghép với summary không tự nhiên)",
      },
      tip_vi: "Vị trí đứng trước danh từ bổ nghĩa trong cấu trúc [a/an/the] + ______ + [Noun] thường ưu tiên Tính từ (-ive, -able, -al, -ic hoặc tính từ ngắn thông dụng như brief, broad, quick), trừ trường hợp danh từ ghép.",
      example_en: "She gave a brief presentation on the new budget plan.",
      vocab_hints: [
        { word: "summary", meaning_vi: "bản tóm tắt" },
        { word: "quarterly", meaning_vi: "hàng quý (3 tháng một lần)" },
        { word: "board meeting", meaning_vi: "cuộc họp hội đồng quản trị" },
      ],
    },
  },

  // 2. TENSES
  {
    id: "22222222-2222-2222-2222-222222222202",
    stem: "Ms. Gomez ____ as the director of the marketing department since January of last year.",
    option_a: "works",
    option_b: "has worked",
    option_c: "worked",
    option_d: "is working",
    tag_code: "tenses",
    difficulty: 1,
    content_hash: "ets_q02_tenses",
    correct_index: 1,
    explanation: {
      rule_vi: "Dấu hiệu 'since + mốc thời gian trong quá khứ' là cấu trúc điển hình của thì Hiện tại Hoàn thành (have/has + V3/ed).",
      why_correct_vi: "Mệnh đề có cụm chỉ thời gian 'since January of last year' (kể từ tháng 1 năm ngoái đến nay). Hành động làm việc bắt đầu từ quá khứ và vẫn đang tiếp diễn ở hiện tại. Với chủ ngữ số ít 'Ms. Gomez', ta dùng 'has worked'.",
      full_translation_vi: "Bà Gomez đã làm việc với tư cách là giám đốc bộ phận tiếp thị kể từ tháng Giêng năm ngoái.",
      options_analysis: {
        A: "works: thì Hiện tại đơn (Sai: hiện tại đơn diễn tả thói quen, không đi với since + mốc thời gian)",
        B: "has worked: thì Hiện tại hoàn thành (Đúng: diễn tả hành động kéo dài từ quá khứ đến nay)",
        C: "worked: thì Quá khứ đơn (Sai: quá khứ đơn chỉ dùng cho hành động đã chấm dứt hoàn toàn)",
        D: "is working: thì Hiện tại tiếp diễn (Sai: không dùng để diễn tả khoảng thời gian kéo dài với since)",
      },
      tip_vi: "Nhìn thấy 'since + mốc thời gian' hoặc 'for + khoảng thời gian' -> Hãy kiểm tra ngay các phương án có dạng have/has + V3/ed.",
      example_en: "They have lived in Singapore since 2015.",
      vocab_hints: [
        { word: "director", meaning_vi: "giám đốc, người quản lý" },
        { word: "marketing department", meaning_vi: "phòng tiếp thị" },
        { word: "since", meaning_vi: "kể từ khi" },
      ],
    },
  },

  // 3. PASSIVE VOICE
  {
    id: "22222222-2222-2222-2222-222222222203",
    stem: "All confidential files must be ____ before being discarded in the recycling bin.",
    option_a: "shred",
    option_b: "shredding",
    option_c: "shredded",
    option_d: "shreds",
    tag_code: "passive_voice",
    difficulty: 1,
    content_hash: "ets_q03_passive",
    correct_index: 2,
    explanation: {
      rule_vi: "Cấu trúc bị động với Động từ khuyết thiếu: Modal Verb + be + Past Participle (V3/ed).",
      why_correct_vi: "Chủ ngữ là danh từ chỉ vật 'All confidential files' (tất cả hồ sơ mật) không thể tự hành động mà phải được xử lý. Sau động từ khuyết thiếu bị động 'must be', ta cần một quá khứ phân từ V3/ed: 'shredded' (được cắt nhỏ tiêu hủy).",
      full_translation_vi: "Tất cả các tài liệu bảo mật phải được cắt vụn trước khi bị vứt vào thùng tái chế.",
      options_analysis: {
        A: "shred: động từ nguyên mẫu (Sai: sau 'must be' không đi trực tiếp với V-inf)",
        B: "shredding: V-ing (Sai: tạo thành dạng tiếp diễn mang nghĩa chủ động)",
        C: "shredded: phân từ hai V3/ed (Đúng: tạo thành thể bị động 'must be shredded')",
        D: "shreds: động từ ngôi thứ 3 số ít (Sai: ngữ pháp sau must be)",
      },
      tip_vi: "Khi chủ ngữ là đồ vật/văn bản/dự án và sau chỗ trống không có tân ngữ trực tiếp -> 95% là câu Bị động (be + V3/ed).",
      example_en: "The contracts must be signed before Friday.",
      vocab_hints: [
        { word: "confidential", meaning_vi: "bảo mật, tuyệt mật" },
        { word: "shred", meaning_vi: "cắt nhỏ, tiêu hủy giấy tờ" },
        { word: "discard", meaning_vi: "vứt bỏ, thải loại" },
      ],
    },
  },

  // 4. SUBJECT-VERB AGREEMENT
  {
    id: "22222222-2222-2222-2222-222222222204",
    stem: "The committee members ____ currently reviewing the proposed amendments to the safety policy.",
    option_a: "is",
    option_b: "are",
    option_c: "was",
    option_d: "has been",
    tag_code: "subject_verb",
    difficulty: 1,
    content_hash: "ets_q04_subj_verb",
    correct_index: 1,
    explanation: {
      rule_vi: "Chủ ngữ số nhiều đi với động từ số nhiều. Trạng từ 'currently' báo hiệu thì hiện tại.",
      why_correct_vi: "Chủ ngữ chính của câu là danh từ số nhiều 'The committee members' (các thành viên ủy ban). Đi kèm trạng từ 'currently' (hiện tại), động từ to be phải ở dạng số nhiều ở hiện tại là 'are' (are currently reviewing).",
      full_translation_vi: "Các thành viên trong ủy ban hiện đang xem xét các sửa đổi được đề xuất đối với chính sách an toàn.",
      options_analysis: {
        A: "is: to be số ít hiện tại (Sai: chủ ngữ members là danh từ số nhiều)",
        B: "are: to be số nhiều hiện tại (Đúng: hòa hợp với chủ ngữ số nhiều members và trạng từ currently)",
        C: "was: to be số ít quá khứ (Sai: không hòa hợp về cả số lượng lẫn thì hiện tại currently)",
        D: "has been: thì hiện tại hoàn thành số ít (Sai: has chia theo chủ ngữ số ít)",
      },
      tip_vi: "Hãy gạch chân danh từ đứng đầu cụm chủ ngữ (ở đây là members, bỏ qua các thành phần bổ ngữ) để xác định số ít hay số nhiều.",
      example_en: "The board members are meeting in the conference room.",
      vocab_hints: [
        { word: "committee", meaning_vi: "ủy ban, hội đồng" },
        { word: "amendment", meaning_vi: "sự sửa đổi, bổ sung" },
        { word: "safety policy", meaning_vi: "chính sách an toàn" },
      ],
    },
  },

  // 5. PREPOSITIONS
  {
    id: "22222222-2222-2222-2222-222222222205",
    stem: "Employees who wish to enroll in the leadership seminar must submit their registration form ____ 5:00 P.M. on Friday.",
    option_a: "by",
    option_b: "until",
    option_c: "during",
    option_d: "between",
    tag_code: "conjunctions_prepositions",
    difficulty: 1,
    content_hash: "ets_q05_prepositions",
    correct_index: 0,
    explanation: {
      rule_vi: "Phân biệt 'by' (hạn chót - hoàn thành trước hoặc chậm nhất vào lúc) và 'until' (hành động duy trì liên tục cho tới lúc).",
      why_correct_vi: "Động từ 'submit' (nộp) là hành động dứt điểm, không phải hành động duy trì liên tục. Do đó, để chỉ thời hạn chót nộp đơn trước 5:00 P.M., ta dùng giới từ 'by'.",
      full_translation_vi: "Những nhân viên muốn đăng ký hội thảo lãnh đạo phải nộp đơn đăng ký trước 5 giờ chiều thứ Sáu.",
      options_analysis: {
        A: "by: trước hoặc chậm nhất tại một thời điểm (Đúng: chỉ hạn chót nộp đơn submit)",
        B: "until: cho đến khi (Sai: until chỉ dùng cho hành động kéo dài liên tục như wait, stay, delay)",
        C: "during: trong suốt (Sai: during phải đi với một khoảng thời gian/sự kiện, ví dụ during the meeting)",
        D: "between: ở giữa (Sai: between cần cấu trúc between A and B)",
      },
      tip_vi: "Thấy động từ chỉ hành động dứt điểm (submit, finish, complete, arrive) + mốc giờ/ngày -> Luôn chọn 'by'.",
      example_en: "Please finish the project by tomorrow afternoon.",
      vocab_hints: [
        { word: "enroll in", meaning_vi: "ghi danh, đăng ký tham gia" },
        { word: "seminar", meaning_vi: "hội thảo chuyên đề" },
        { word: "registration form", meaning_vi: "đơn đăng ký" },
      ],
    },
  },

  // 6. CONJUNCTIONS
  {
    id: "22222222-2222-2222-2222-222222222206",
    stem: "____ severe weather conditions caused flight cancellations, the keynote speaker managed to arrive on time.",
    option_a: "Although",
    option_b: "Despite",
    option_c: "Because of",
    option_d: "Therefore",
    tag_code: "conjunctions_prepositions",
    difficulty: 2,
    content_hash: "ets_q06_conjunctions",
    correct_index: 0,
    explanation: {
      rule_vi: "Although + S + V (mệnh đề chỉ sự tương phản). Phân biệt với Despite + Cụm danh từ.",
      why_correct_vi: "Phía sau chỗ trống là mệnh đề có Chủ ngữ 'severe weather conditions' và Động từ chính 'caused'. Hai vế câu mang nghĩa tương phản. Do đó cần liên từ 'Although'.",
      full_translation_vi: "Mặc dù điều kiện thời tiết khắc nghiệt khiến các chuyến bay bị hủy, diễn giả chính vẫn cố gắng đến đúng giờ.",
      options_analysis: {
        A: "Although: mặc dù (Đúng: liên từ đi kèm một mệnh đề S + V chỉ sự tương phản)",
        B: "Despite: mặc dù (Sai: despite là giới từ, chỉ đi sau cụm danh từ hoặc V-ing)",
        C: "Because of: bởi vì (Sai: là giới từ đi với danh từ, và sai logic nghĩa)",
        D: "Therefore: do đó (Sai: là trạng từ liên kết, thường có dấu phẩy đi kèm)",
      },
      tip_vi: "Bẫy kinh điển ETS: Nhìn thấy có Động từ chính (caused) -> Chọn Liên từ (Although/Because), LOẠI Giới từ (Despite/Because of).",
      example_en: "Although it was raining heavily, we attended the conference.",
      vocab_hints: [
        { word: "severe", meaning_vi: "khắc nghiệt, nghiêm trọng" },
        { word: "cancellation", meaning_vi: "sự hủy bỏ" },
        { word: "keynote speaker", meaning_vi: "diễn giả chính" },
      ],
    },
  },

  // 7. PRONOUNS
  {
    id: "22222222-2222-2222-2222-222222222207",
    stem: "All employees are reminded to keep ____ personal belongings in the designated lockers.",
    option_a: "their",
    option_b: "they",
    option_c: "them",
    option_d: "themselves",
    tag_code: "nouns_pronouns",
    difficulty: 1,
    content_hash: "ets_q07_pronouns",
    correct_index: 0,
    explanation: {
      rule_vi: "Tính từ sở hữu đứng trước danh từ: Possessive Adjective + (Adj) + Noun.",
      why_correct_vi: "Đứng ngay sau chỗ trống là cụm danh từ 'personal belongings' (đồ dùng cá nhân). Do đó vị trí này cần Tính từ sở hữu 'their' để bổ nghĩa.",
      full_translation_vi: "Tất cả nhân viên được nhắc nhở cất giữ đồ đạc cá nhân của họ trong các tủ khóa được chỉ định.",
      options_analysis: {
        A: "their: tính từ sở hữu 'của họ' (Đúng: đứng trước bổ nghĩa cụm danh từ personal belongings)",
        B: "they: đại từ chủ ngữ (Sai: chỉ làm chủ ngữ đứng trước động từ)",
        C: "them: đại từ tân ngữ (Sai: chỉ đứng sau động từ hoặc giới từ)",
        D: "themselves: đại từ phản thân (Sai: không đứng trước danh từ làm sở hữu)",
      },
      tip_vi: "Cứ thấy khoảng trống đứng trước [Tính từ + Danh từ] -> 99% chọn Tính từ sở hữu (my, your, his, her, their, our, its).",
      example_en: "Students must bring their own laptops to the exam.",
      vocab_hints: [
        { word: "belongings", meaning_vi: "đồ dùng cá nhân, hành lý" },
        { word: "designated", meaning_vi: "được chỉ định, được phân công" },
        { word: "locker", meaning_vi: "tủ có khóa" },
      ],
    },
  },

  // 8. GERUNDS & INFINITIVES
  {
    id: "22222222-2222-2222-2222-222222222208",
    stem: "The management team decided ____ the launch of the new product until customer feedback was analyzed.",
    option_a: "to postpone",
    option_b: "postponing",
    option_c: "postponed",
    option_d: "postpone",
    tag_code: "gerund_infinitive",
    difficulty: 1,
    content_hash: "ets_q08_gerund_inf",
    correct_index: 0,
    explanation: {
      rule_vi: "Cấu trúc động từ theo sau bởi to-V: decide + to-V (quyết định làm gì).",
      why_correct_vi: "Động từ 'decide' luôn đi kèm động từ nguyên mẫu có to (to-infinitive). Do đó đáp án chính xác là 'to postpone'.",
      full_translation_vi: "Đội ngũ quản lý đã quyết định hoãn việc ra mắt sản phẩm mới cho đến khi phản hồi của khách hàng được phân tích.",
      options_analysis: {
        A: "to postpone: động từ to-infinitive (Đúng: theo sau cấu trúc decide to do something)",
        B: "postponing: danh động từ V-ing (Sai: decide không đi trực tiếp với V-ing)",
        C: "postponed: phân từ V3/ed (Sai: không đúng ngữ pháp sau động từ decide)",
        D: "postpone: động từ nguyên mẫu không to (Sai: decide không phải bare infinitive verb)",
      },
      tip_vi: "Các động từ chỉ kế hoạch/quyết định luôn đi với TO-V: decide, plan, intend, promise, agree, refuse, hope, expect + TO-V.",
      example_en: "We decided to expand our business into Asian markets.",
      vocab_hints: [
        { word: "postpone", meaning_vi: "trì hoãn, dời lại" },
        { word: "product launch", meaning_vi: "sự ra mắt sản phẩm" },
        { word: "feedback", meaning_vi: "phản hồi, ý kiến đánh giá" },
      ],
    },
  },

  // 9. COMPARISONS
  {
    id: "22222222-2222-2222-2222-222222222209",
    stem: "The newly installed conveyor system operates much more ____ than the previous model.",
    option_a: "efficiently",
    option_b: "efficient",
    option_c: "efficiency",
    option_d: "more efficient",
    tag_code: "comparisons",
    difficulty: 2,
    content_hash: "ets_q09_comparisons",
    correct_index: 0,
    explanation: {
      rule_vi: "So sánh hơn của trạng từ: more + Trạng từ (Adv) + than khi bổ nghĩa cho động từ hành động.",
      why_correct_vi: "Động từ chính là động từ thường 'operates' (vận hành). Để bổ nghĩa cho động từ hành động trong so sánh hơn 'much more... than', ta cần một Trạng từ (Adverb) 'efficiently'.",
      full_translation_vi: "Hệ thống băng chuyền mới được lắp đặt vận hành hiệu quả hơn nhiều so với mẫu trước đây.",
      options_analysis: {
        A: "efficiently: trạng từ (Đúng: bổ nghĩa cho động từ hành động operates trong so sánh hơn)",
        B: "efficient: tính từ (Sai: không dùng tính từ để bổ nghĩa cho động từ thường operates)",
        C: "efficiency: danh từ hiệu quả (Sai: không đứng sau more trong cấu trúc này)",
        D: "more efficient: thừa từ more (Sai: câu đã có sẵn từ 'more' trước chỗ trống)",
      },
      tip_vi: "Để nhấn mạnh so sánh hơn, đề thi TOEIC hay dùng: much, far, significantly, substantially + more/tính từ ngắn.",
      example_en: "The automated machine works much faster than manual labor.",
      vocab_hints: [
        { word: "conveyor system", meaning_vi: "hệ thống băng chuyền" },
        { word: "operate", meaning_vi: "vận hành, hoạt động" },
        { word: "efficiently", meaning_vi: "một cách hiệu quả" },
      ],
    },
  },

  // 10. RELATIVE CLAUSES
  {
    id: "22222222-2222-2222-2222-222222222210",
    stem: "The architectural firm has hired an engineer ____ specialized expertise is in sustainable building design.",
    option_a: "whose",
    option_b: "whom",
    option_c: "which",
    option_d: "who",
    tag_code: "relative_clauses",
    difficulty: 2,
    content_hash: "ets_q10_rel_clauses",
    correct_index: 0,
    explanation: {
      rule_vi: "Đại từ quan hệ chỉ sở hữu: Noun (người/vật) + whose + Noun.",
      why_correct_vi: "Phía trước là danh từ chỉ người 'an engineer' (kỹ sư), phía sau là cụm danh từ 'specialized expertise' (chuyên môn) thuộc sở hữu của người kỹ sư đó. Do đó, ta phải dùng đại từ quan hệ sở hữu 'whose'.",
      full_translation_vi: "Công ty kiến trúc đã thuê một kỹ sư có chuyên môn chuyên sâu về thiết kế công trình bền vững.",
      options_analysis: {
        A: "whose: đại từ quan hệ sở hữu (Đúng: nối giữa engineer và danh từ chuyên môn expertise)",
        B: "whom: đại từ quan hệ tân ngữ (Sai: sau whom là S + V, không chỉ sở hữu danh từ)",
        C: "which: đại từ quan hệ chỉ vật (Sai: engineer là danh từ chỉ người)",
        D: "who: đại từ quan hệ chủ ngữ (Sai: who thay thế cho chủ ngữ và đi trực tiếp với động từ)",
      },
      tip_vi: "Dấu hiệu nhận biết đại từ 'whose': Đứng giữa hai Danh từ (Noun 1 + whose + Noun 2).",
      example_en: "I spoke to a client whose account was temporarily suspended.",
      vocab_hints: [
        { word: "architectural firm", meaning_vi: "công ty kiến trúc" },
        { word: "expertise", meaning_vi: "chuyên môn, kiến thức chuyên sâu" },
        { word: "sustainable", meaning_vi: "bền vững" },
      ],
    },
  },

  // 11. MODAL VERBS
  {
    id: "22222222-2222-2222-2222-222222222211",
    stem: "Visitors to the research facility must ____ a valid visitor badge at all times.",
    option_a: "display",
    option_b: "displays",
    option_c: "displayed",
    option_d: "displaying",
    tag_code: "modals",
    difficulty: 1,
    content_hash: "ets_q11_modals",
    correct_index: 0,
    explanation: {
      rule_vi: "Sau Động từ khuyết thiếu (Modal Verbs: can, could, will, would, shall, should, must, may, might) là Động từ nguyên thể không to (Bare Infinitive).",
      why_correct_vi: "Chỗ trống đứng ngay sau động từ khuyết thiếu 'must' (phải). Theo quy tắc ngữ pháp bắt buộc, động từ theo sau phải ở dạng nguyên mẫu không chia. Do đó chọn 'display'.",
      full_translation_vi: "Khách đến thăm cơ sở nghiên cứu phải đeo/hiển thị thẻ khách hợp lệ vào mọi thời điểm.",
      options_analysis: {
        A: "display: động từ nguyên thể không to (Đúng: theo sau động từ khuyết thiếu must)",
        B: "displays: động từ chia ngôi thứ 3 số ít (Sai: không chia s/es sau must)",
        C: "displayed: động từ quá khứ (Sai: không chia thì sau modal verb)",
        D: "displaying: dạng V-ing (Sai: sau must không dùng V-ing)",
      },
      tip_vi: "Quy tắc ăn điểm tuyệt đối trong 2 giây: Modal Verb + V-nguyên-mẫu (V-bare).",
      example_en: "You should check the schedule before leaving.",
      vocab_hints: [
        { word: "facility", meaning_vi: "cơ sở vật chất, tòa nhà" },
        { word: "valid", meaning_vi: "hợp lệ, có hiệu lực" },
        { word: "at all times", meaning_vi: "mọi lúc, luôn luôn" },
      ],
    },
  },

  // 12. CONDITIONALS & SUBJUNCTIVE
  {
    id: "22222222-2222-2222-2222-222222222212",
    stem: "The building inspector recommended that the emergency exits ____ unlocked during operating hours.",
    option_a: "remain",
    option_b: "remains",
    option_c: "remained",
    option_d: "remaining",
    tag_code: "conditionals",
    difficulty: 2,
    content_hash: "ets_q12_subjunctive",
    correct_index: 0,
    explanation: {
      rule_vi: "Thể giả định (Subjunctive): S1 + recommend/suggest/insist/demand + that + S2 + (should) + V-nguyên-thể.",
      why_correct_vi: "Mệnh đề chứa động từ yêu cầu/đề xuất 'recommended that'. Theo cấu trúc giả định thức của tiếng Anh chuẩn, động từ ở mệnh đề sau 'that' luôn ở dạng nguyên thể không chia (Bare Infinitive), dù chủ ngữ 'the emergency exits' là số ít hay số nhiều. Do đó ta chọn 'remain'.",
      full_translation_vi: "Thanh tra tòa nhà khuyến nghị rằng các lối thoát hiểm phải được giữ mở trong suốt giờ hoạt động.",
      options_analysis: {
        A: "remain: động từ nguyên thể (Đúng: thể giả định thức sau cấu trúc recommend that)",
        B: "remains: động từ thêm s (Sai: thể giả định không chia s/es)",
        C: "remained: động từ quá khứ (Sai: bẫy chia theo thì của recommended)",
        D: "remaining: dạng V-ing (Sai: mệnh đề bắt buộc cần động từ vị ngữ)",
      },
      tip_vi: "Bẫy điểm cao TOEIC: Gặp recommend / suggest / request / ask / insist + THAT -> Động từ mệnh đề sau luôn chọn DẠNG NGUYÊN MẪU (V-inf).",
      example_en: "The manager demanded that he apologize immediately.",
      vocab_hints: [
        { word: "inspector", meaning_vi: "thanh tra viên" },
        { word: "emergency exit", meaning_vi: "lối thoát hiểm khẩn cấp" },
        { word: "operating hours", meaning_vi: "giờ làm việc / giờ hoạt động" },
      ],
    },
  },

  // 13. PARTICIPIAL PHRASES
  {
    id: "22222222-2222-2222-2222-222222222213",
    stem: "____ by favorable exchange rates, overseas exports increased by 15 percent in the third quarter.",
    option_a: "Boosted",
    option_b: "Boosting",
    option_c: "Boost",
    option_d: "Booster",
    tag_code: "participles",
    difficulty: 2,
    content_hash: "ets_q13_participles",
    correct_index: 0,
    explanation: {
      rule_vi: "Rút gọn mệnh đề cùng chủ ngữ ở thể bị động dùng Quá khứ phân từ: Past Participle (V3/ed) + by + O, S + V.",
      why_correct_vi: "Chủ ngữ của mệnh đề chính là 'overseas exports' (hàng xuất khẩu ra nước ngoài). Hàng xuất khẩu không thể tự thúc đẩy mà 'được thúc đẩy bởi tỷ giá hối đoái thuận lợi' (thể bị động có kèm giới từ by). Khi rút gọn mệnh đề trạng ngữ ở dạng bị động, ta dùng V3/ed: 'Boosted'.",
      full_translation_vi: "Được thúc đẩy bởi tỷ giá hối đoái thuận lợi, kim ngạch xuất khẩu ra nước ngoài đã tăng 15% trong quý ba.",
      options_analysis: {
        A: "Boosted: phân từ hai V3/ed (Đúng: rút gọn mệnh đề bị động, được thúc đẩy bởi tỷ giá)",
        B: "Boosting: hiện tại phân từ V-ing (Sai: V-ing dùng cho nghĩa chủ động)",
        C: "Boost: động từ nguyên thể (Sai: đầu câu không có chủ ngữ)",
        D: "Booster: danh từ chất kích thích/bộ tăng áp (Sai: không tạo nghĩa hợp lý)",
      },
      tip_vi: "Đầu câu có dạng: [______ + by + Tân ngữ, S + V] -> Hãy chọn ngay V3/ed (bị động rút gọn).",
      example_en: "Encouraged by his supervisor, John applied for the promotion.",
      vocab_hints: [
        { word: "exchange rate", meaning_vi: "tỷ giá hối đoái" },
        { word: "favorable", meaning_vi: "thuận lợi, có lợi" },
        { word: "export", meaning_vi: "hàng xuất khẩu / xuất khẩu" },
      ],
    },
  },

  // 14. INVERSION
  {
    id: "22222222-2222-2222-2222-222222222214",
    stem: "Rarely ____ the accounting firm seen such a rapid increase in client acquisitions during the first quarter.",
    option_a: "has",
    option_b: "have",
    option_c: "is",
    option_d: "did",
    tag_code: "inversion",
    difficulty: 3,
    content_hash: "ets_q14_inversion",
    correct_index: 0,
    explanation: {
      rule_vi: "Đảo ngữ với trạng từ mang nghĩa phủ định/hiếm khi đứng đầu câu: Rarely/Seldom/Never + Trợ động từ + S + V.",
      why_correct_vi: "Trạng từ bán phủ định 'Rarely' đứng đầu câu gây ra hiện tượng đảo ngữ (đưa trợ động từ lên trước chủ ngữ). Chủ ngữ là danh từ số ít 'the accounting firm' (công ty kế toán) và động từ chính ở dạng phân từ 'seen' (V3). Do đó trợ động từ phù hợp là 'has' (has the firm seen).",
      full_translation_vi: "Hiếm khi công ty kế toán chứng kiến sự gia tăng nhanh chóng về lượng khách hàng mới như vậy trong quý đầu tiên.",
      options_analysis: {
        A: "has: trợ động từ hoàn thành số ít (Đúng: đảo ngữ với chủ ngữ số ít firm và động từ V3 seen)",
        B: "have: trợ động từ số nhiều (Sai: chủ ngữ firm là danh từ số ít)",
        C: "is: to be (Sai: to be không đi với động từ phân từ seen trong nghĩa chủ động này)",
        D: "did: trợ động từ quá khứ đơn (Sai: did phải đi với động từ nguyên mẫu see, không đi với seen)",
      },
      tip_vi: "Khi thấy các từ phủ định đứng đầu câu (Rarely, Seldom, Hardly, Scarcely, Never, Under no circumstances) -> Bắt buộc dùng ĐẢO NGỮ.",
      example_en: "Seldom have we witnessed such outstanding teamwork.",
      vocab_hints: [
        { word: "rarely", meaning_vi: "hiếm khi" },
        { word: "accounting firm", meaning_vi: "công ty kế toán" },
        { word: "acquisition", meaning_vi: "sự thu nạp, sự giành được" },
      ],
    },
  },

  // 15. COLLOCATIONS
  {
    id: "22222222-2222-2222-2222-222222222215",
    stem: "All manufacturing facilities are inspected on a regular basis to ensure compliance ____ international safety standards.",
    option_a: "with",
    option_b: "to",
    option_c: "for",
    option_d: "at",
    tag_code: "collocations",
    difficulty: 1,
    content_hash: "ets_q15_collocations",
    correct_index: 0,
    explanation: {
      rule_vi: "Cụm danh từ cố định trong đề thi TOEIC: compliance with something (sự tuân thủ theo cái gì).",
      why_correct_vi: "Danh từ 'compliance' (sự tuân thủ) luôn đi kèm với giới từ 'with' để tạo thành cụm kết hợp từ cố định 'compliance with' (sự tuân thủ các tiêu chuẩn). Do đó đáp án bắt buộc là 'with'.",
      full_translation_vi: "Tất cả các cơ sở sản xuất đều được thanh tra định kỳ nhằm đảm bảo sự tuân thủ các tiêu chuẩn an toàn quốc tế.",
      options_analysis: {
        A: "with: đi kèm compliance (Đúng: cụm cố định compliance with = tuân thủ theo)",
        B: "to: đến (Sai: không kết hợp với danh từ compliance)",
        C: "for: cho (Sai: không đi với compliance)",
        D: "at: tại (Sai: không tạo thành cụm giới từ hợp lệ)",
      },
      tip_vi: "Học thuộc lòng bộ 3 từ chỉ sự tuân thủ trong TOEIC: comply WITH = in compliance WITH = in accordance WITH.",
      example_en: "The building was constructed in full compliance with local regulations.",
      vocab_hints: [
        { word: "manufacturing facility", meaning_vi: "cơ sở sản xuất, nhà máy" },
        { word: "on a regular basis", meaning_vi: "một cách đều đặn, định kỳ" },
        { word: "compliance with", meaning_vi: "sự tuân thủ, tuân theo" },
      ],
    },
  },

  // 16. WORD FORMS (Câu trong ảnh 2 của người dùng - Mr. Reynolds)
  {
    id: "22222222-2222-2222-2222-222222222216",
    stem: "Mr. Reynolds was chosen for the promotion because he demonstrated ____ leadership skills.",
    option_a: "exceptional",
    option_b: "exceptionally",
    option_c: "exception",
    option_d: "except",
    tag_code: "word_form",
    difficulty: 1,
    content_hash: "ets_q16_reynolds_wordform",
    correct_index: 0,
    explanation: {
      rule_vi: "Cấu trúc bổ nghĩa danh từ: Tính từ (Adjective) đứng trước Cụm danh từ (Noun Phrase).",
      why_correct_vi: "Chỗ trống đứng sau ngoại động từ 'demonstrated' (thể hiện) và đứng trước cụm danh từ 'leadership skills' (kỹ năng lãnh đạo). Do đó vị trí này cần một Tính từ để bổ nghĩa trực tiếp cho danh từ 'leadership skills'. Từ 'exceptional' (xuất sắc, nổi bật) là tính từ chính xác.",
      full_translation_vi: "Ông Reynolds đã được chọn để thăng chức vì ông đã thể hiện những kỹ năng lãnh đạo xuất sắc.",
      options_analysis: {
        A: "exceptional (adj): xuất sắc, nổi bật (Đúng: tính từ đứng trước bổ nghĩa cho cụm danh từ leadership skills)",
        B: "exceptionally (adv): một cách xuất sắc (Sai: trạng từ không đứng trực tiếp bổ nghĩa danh từ)",
        C: "exception (n): sự ngoại lệ (Sai: danh từ ghép không tạo nghĩa tự nhiên)",
        D: "except (prep): ngoại trừ (Sai: giới từ không dùng trong vị trí này)",
      },
      tip_vi: "Khoảng trống đứng trước danh từ hoặc cụm danh từ thường là Tính từ bổ nghĩa (-al, -ive, -able, -ful, -ous), lưu ý kiểm tra ngữ nghĩa xem có phải danh từ ghép hay không.",
      example_en: "She demonstrated exceptional problem-solving abilities.",
      vocab_hints: [
        { word: "promotion", meaning_vi: "sự thăng chức, đề bạt" },
        { word: "demonstrate", meaning_vi: "thể hiện, chứng minh" },
        { word: "exceptional", meaning_vi: "xuất sắc, phi thường" },
        { word: "leadership skills", meaning_vi: "kỹ năng lãnh đạo" },
      ],
    },
  },

  // 17. WORD FORMS (Verb after Modal)
  {
    id: "22222222-2222-2222-2222-222222222217",
    stem: "The new software update will significantly ____ communication between overseas offices.",
    option_a: "improve",
    option_b: "improvement",
    option_c: "improved",
    option_d: "improving",
    tag_code: "word_form",
    difficulty: 1,
    content_hash: "ets_q17_software_improve",
    correct_index: 0,
    explanation: {
      rule_vi: "Sau trợ động từ 'will' (hoặc modal verb) + Trạng từ bổ nghĩa là Động từ nguyên thể (Bare Infinitive): will + (Adv) + V-bare.",
      why_correct_vi: "Câu có trợ động từ 'will' đi kèm trạng từ bổ nghĩa 'significantly'. Thành phần vị ngữ chính của câu bắt buộc phải là một Động từ nguyên thể không chia. Do đó chọn 'improve' (cải thiện).",
      full_translation_vi: "Bản cập nhật phần mềm mới sẽ cải thiện đáng kể sự giao tiếp giữa các văn phòng ở nước ngoài.",
      options_analysis: {
        A: "improve: động từ nguyên thể (Đúng: hoàn thiện cụm vị ngữ will significantly improve)",
        B: "improvement: danh từ sự cải tiến (Sai: vị trí này đang thiếu động từ chính)",
        C: "improved: động từ dạng V-ed (Sai: sau will không đi với V-ed)",
        D: "improving: dạng V-ing (Sai: sau will không đi trực tiếp với V-ing)",
      },
      tip_vi: "Thấy cấu trúc: Modal Verb (will/can/must) + [Trạng từ đuôi -ly] + ______ -> Chắc chắn chọn Động từ nguyên thể (V-bare).",
      example_en: "The strategy will greatly increase our market share.",
      vocab_hints: [
        { word: "significantly", meaning_vi: "đáng kể, có ý nghĩa lớn" },
        { word: "overseas", meaning_vi: "ở nước ngoài, hải ngoại" },
        { word: "communication", meaning_vi: "sự giao tiếp, liên lạc" },
      ],
    },
  },

  // 18. WORD FORMS (Noun after Adjective)
  {
    id: "22222222-2222-2222-2222-222222222218",
    stem: "Customers are advised to retain their receipt in order to receive a full ____.",
    option_a: "refund",
    option_b: "refunds",
    option_c: "refunded",
    option_d: "refunding",
    tag_code: "word_form",
    difficulty: 1,
    content_hash: "ets_q18_full_refund",
    correct_index: 0,
    explanation: {
      rule_vi: "Cấu trúc cụm danh từ: a/an + Tính từ (full) + Danh từ số ít (Noun).",
      why_correct_vi: "Chỗ trống đứng sau mạo từ 'a' và tính từ 'full' (đầy đủ). Vị trí này bắt buộc phải là một Danh từ số ít đếm được làm tân ngữ cho động từ 'receive'. Cụm 'a full refund' (khoản hoàn tiền đầy đủ 100%) là collocation cực kỳ thông dụng.",
      full_translation_vi: "Khách hàng được khuyên nên giữ lại biên lai để được hoàn tiền đầy đủ.",
      options_analysis: {
        A: "refund: danh từ số ít (Đúng: kết hợp với mạo từ 'a' tạo thành a full refund)",
        B: "refunds: danh từ số nhiều (Sai: không đi với mạo từ số ít 'a')",
        C: "refunded: phân từ V-ed (Sai: không đứng sau mạo từ 'a' làm danh từ)",
        D: "refunding: V-ing (Sai: không dùng gerund trong ngữ cảnh nhận khoản hoàn trả)",
      },
      tip_vi: "Học thuộc cụm từ cố định ETS: receive a full refund = nhận lại toàn bộ tiền hoàn lại.",
      example_en: "You are entitled to a full refund within 30 days.",
      vocab_hints: [
        { word: "retain", meaning_vi: "giữ lại, lưu giữ" },
        { word: "receipt", meaning_vi: "hóa đơn, biên lai" },
        { word: "refund", meaning_vi: "tiền hoàn lại / hoàn tiền" },
      ],
    },
  },

  // 19. GERUND AFTER PREPOSITION
  {
    id: "22222222-2222-2222-2222-222222222219",
    stem: "Please review the attached contract carefully before ____ your signature.",
    option_a: "affixing",
    option_b: "affixed",
    option_c: "affix",
    option_d: "affixes",
    tag_code: "gerund_infinitive",
    difficulty: 1,
    content_hash: "ets_q19_before_affixing",
    correct_index: 0,
    explanation: {
      rule_vi: "Sau giới từ (before/after/by/without/in) + Danh động từ (V-ing) mang tân ngữ.",
      why_correct_vi: "Từ 'before' ở đây đóng vai trò là giới từ chỉ thời gian, phía sau có tân ngữ danh từ 'your signature' (chữ ký của bạn). Theo quy tắc ngữ pháp, sau giới từ là V-ing đóng vai trò danh động từ: 'affixing your signature' (đặt bút ký).",
      full_translation_vi: "Vui lòng xem lại hợp đồng đính kèm một cách cẩn thận trước khi ký tên.",
      options_analysis: {
        A: "affixing: danh động từ V-ing (Đúng: đứng sau giới từ before và có tân ngữ signature)",
        B: "affixed: phân từ V-ed (Sai: không đứng sau giới từ before khi có tân ngữ theo sau)",
        C: "affix: động từ nguyên mẫu (Sai: sau giới từ không dùng V-inf)",
        D: "affixes: động từ chia ngôi thứ 3 (Sai: sau giới từ không chia động từ)",
      },
      tip_vi: "Công thức vàng: Giới từ + V-ing + Tân ngữ (Preposition + V-ing + Object).",
      example_en: "Please check the document before signing it.",
      vocab_hints: [
        { word: "attached", meaning_vi: "đính kèm" },
        { word: "contract", meaning_vi: "hợp đồng" },
        { word: "affix", meaning_vi: "đóng dấu, ký vào văn bản" },
        { word: "signature", meaning_vi: "chữ ký" },
      ],
    },
  },
];

async function main() {
  console.log("🚀 Bắt đầu quá trình đồng bộ tự động dữ liệu ngân hàng câu hỏi...");

  // 1. Lấy danh sách tag ID từ bảng grammar_tags
  const { data: tags, error: tagErr } = await supabase
    .from("grammar_tags")
    .select("id, tag_code");

  if (tagErr || !tags) {
    console.error("❌ Không thể lấy danh sách grammar_tags:", tagErr?.message);
    process.exit(1);
  }

  const tagMap = new Map<string, number>();
  for (const t of tags) {
    tagMap.set(t.tag_code, t.id);
  }

  // 2. Dọn sạch TẤT CẢ các câu hỏi placeholder cũ của migration 2 (chuyển sang 'retired')
  console.log("🧹 Đang dọn dẹp các câu hỏi placeholder cũ...");
  
  // Retire theo content_hash hash_q%
  await supabase
    .from("questions")
    .update({ status: "retired" })
    .like("content_hash", "hash_q%")
    .eq("status", "published");

  // Retire theo id bắt đầu bằng 11111111- (id cũ của migration 2)
  await supabase
    .from("questions")
    .update({ status: "retired" })
    .gte("id", "11111111-0000-0000-0000-000000000000")
    .lte("id", "11111111-ffff-ffff-ffff-ffffffffffff")
    .eq("status", "published");

  console.log("✅ Đã đưa toàn bộ câu hỏi cũ chưa đạt chuẩn vào trạng thái 'retired'.");

  // 3. Upsert toàn bộ câu hỏi chất lượng cao mới
  console.log(`📦 Đang nạp ${QUESTIONS.length} câu hỏi Part 5 chuẩn ETS...`);

  let successCount = 0;
  for (const q of QUESTIONS) {
    const tagId = tagMap.get(q.tag_code);
    if (!tagId) {
      console.warn(`⚠️ Không tìm thấy tag_code: ${q.tag_code}`);
      continue;
    }

    // Upsert bảng questions theo ID
    const { error: qErr } = await supabase.from("questions").upsert(
      {
        id: q.id,
        stem: q.stem,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        tag_id: tagId,
        difficulty: q.difficulty,
        status: "published",
        content_hash: q.content_hash,
      },
      { onConflict: "id" }
    );

    if (qErr) {
      console.error(`❌ Lỗi khi nạp câu hỏi ${q.content_hash}:`, qErr.message);
      continue;
    }

    // Upsert bảng question_answers theo question_id
    const { error: aErr } = await supabase.from("question_answers").upsert(
      {
        question_id: q.id,
        correct_index: q.correct_index,
        explanation: q.explanation,
      },
      { onConflict: "question_id" }
    );

    if (aErr) {
      console.error(`❌ Lỗi khi nạp đáp án ${q.content_hash}:`, aErr.message);
      continue;
    }

    successCount++;
  }

  console.log(`\n🎉 HOÀN TẤT THÀNH CÔNG!`);
  console.log(`✅ Đã đồng bộ ${successCount}/${QUESTIONS.length} câu hỏi Part 5 chuẩn mực vào database.`);
  console.log(`✨ Các câu hỏi cũ đã được tự động loại bỏ, không còn xuất hiện trong phiên luyện tập.`);
}

main().catch((err) => {
  console.error("❌ Lỗi ngoại lệ trong quá trình seed:", err);
  process.exit(1);
});
