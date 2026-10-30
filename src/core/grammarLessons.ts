export interface GrammarLessonCheatSheetItem {
  signal: string;
  rule: string;
  example: string;
}

export interface GrammarTrap {
  title: string;
  trapDescription: string;
  correctRule: string;
  badExample: string;
  goodExample: string;
}

export interface WorkedExample {
  questionStem: string;
  options: [string, string, string, string];
  correctIndex: number;
  correctOption: string;
  explanationStepByStep: string[];
}

export interface GrammarLesson {
  tagCode: string;
  category: "verbs" | "clauses" | "words_phrases" | "structures";
  categoryVi: string;
  titleVi: string;
  taglineVi: string;
  estimatedMinutes: number;
  coreRule: {
    definition: string;
    keyFormulas: string[];
    deepInsight: string;
  };
  cheatSheet: GrammarLessonCheatSheetItem[];
  traps: GrammarTrap[];
  workedExample: WorkedExample;
}

export const GRAMMAR_LESSONS: Record<string, GrammarLesson> = {
  tenses: {
    tagCode: "tenses",
    category: "verbs",
    categoryVi: "Động từ & Thời gian",
    titleVi: "Thì động từ (Tenses)",
    taglineVi: "Bí quyết xác định mốc thời gian và phối hợp thì trong 5 giây",
    estimatedMinutes: 5,
    coreRule: {
      definition:
        "Trong đề thi TOEIC Part 5, câu hỏi về thì động từ chiếm từ 15-20%. Bản chất của thì là diễn tả thời điểm xảy ra hành động (quá khứ, hiện tại, tương lai) và tính chất của hành động (hoàn thành, tiếp diễn).",
      keyFormulas: [
        "Hiện tại hoàn thành: S + have/has + V3/V-ed (hành động bắt đầu trong quá khứ kéo dài đến hiện tại)",
        "Quá khứ đơn: S + V2/V-ed (hành động đã kết thúc dứt điểm trong quá khứ tại thời điểm rõ ràng)",
        "Tương lai đơn / gần: S + will / be going to + V-inf (dự báo kế hoạch, quyết định sắp tới)",
        "Hiện tại đơn: S + V(s/es) (chính sách, lịch trình cố định, sự thật hiển nhiên trong công sở)",
      ],
      deepInsight:
        "Không dịch từng từ! Hãy nhìn lướt qua câu để tìm 'trạng từ thời gian' (Tracer) trước. Nếu không có trạng từ thời gian, hãy nhìn vào động từ của mệnh đề phụ để xác định sự phối hợp thì (Sequence of Tenses).",
    },
    cheatSheet: [
      {
        signal: "since + mốc thời gian / for + khoảng thời gian",
        rule: "Chia Hiện tại hoàn thành (have/has + V3/V-ed)",
        example: "Ms. Tanaka has managed the marketing team for five years.",
      },
      {
        signal: "recently / lately / so far",
        rule: "Chia Hiện tại hoàn thành",
        example: "The company has recently updated its security protocols.",
      },
      {
        signal: "yesterday / ago / last week / in 2023",
        rule: "Chia Quá khứ đơn (V-ed / V2)",
        example: "The board approved the expansion proposal yesterday.",
      },
      {
        signal: "next week / upcoming / soon / tomorrow",
        rule: "Chia Tương lai (will + V-inf / be scheduled to)",
        example: "The keynote speaker will arrive tomorrow morning.",
      },
      {
        signal: "currently / now / at present",
        rule: "Chia Hiện tại tiếp diễn (be + V-ing) hoặc Hiện tại đơn",
        example: "We are currently reviewing candidate applications.",
      },
    ],
    traps: [
      {
        title: "Bẫy mệnh đề trạng ngữ chỉ thời gian (When / As soon as / Once / Before / After)",
        trapDescription:
          "ETS thường đặt chỗ trống trong mệnh đề phụ bắt đầu bằng When/As soon as/Once đi cùng một hành động tương lai ở mệnh đề chính. Học viên hay chọn 'will + V' theo quán tính.",
        correctRule:
          "Trong mệnh đề trạng ngữ chỉ thời gian/điều kiện, TUYỆT ĐỐI KHÔNG dùng 'will'. Phải dùng Hiện tại đơn hoặc Hiện tại hoàn thành để thay thế tương lai.",
        badExample: "As soon as Mr. Gomez will arrive, the conference will begin. (SAI)",
        goodExample: "As soon as Mr. Gomez arrives, the conference will begin. (ĐÚNG)",
      },
      {
        title: "Bẫy từ 'since' - Mệnh đề đi sau vs Mệnh đề chính",
        trapDescription:
          "Mệnh đề sau 'since' chia quá khứ đơn, nhưng mệnh đề chính phải chia hiện tại hoàn thành. Thí sinh hay chia đảo ngược hai vế.",
        correctRule: "S + have/has + V3/V-ed + SINCE + S + V2/V-ed (mốc bắt đầu).",
        badExample: "Since he has joined the company, sales increased. (SAI)",
        goodExample: "Sales have increased significantly since he joined the company. (ĐÚNG)",
      },
    ],
    workedExample: {
      questionStem:
        "The accounting department _______ the annual financial audit report by the end of this week.",
      options: [
        "A. complete",
        "B. will complete",
        "C. completed",
        "D. has been completed",
      ],
      correctIndex: 1,
      correctOption: "B. will complete",
      explanationStepByStep: [
        "Bước 1: Quét nhanh tìm trạng từ thời gian -> Thấy cụm 'by the end of this week' (vào cuối tuần này) -> Chỉ thời điểm trong tương lai.",
        "Bước 2: Loại trừ (C) 'completed' (quá khứ) và (A) 'complete' (chủ ngữ số ít 'department' không thể đi với động từ nguyên mẫu số nhiều).",
        "Bước 3: Xem xét thể chủ động / bị động -> Phòng kế toán tự thực hiện báo cáo kiểm toán (chủ động), loại (D) thể bị động.",
        "Kết luận: Chọn (B) will complete.",
      ],
    },
  },

  word_form: {
    tagCode: "word_form",
    category: "words_phrases",
    categoryVi: "Từ loại & Vị trí",
    titleVi: "Từ loại (Word Form)",
    taglineVi: "Quy tắc xác định vị trí Danh - Động - Tính - Trạng siêu tốc",
    estimatedMinutes: 5,
    coreRule: {
      definition:
        "Dạng bài Từ loại (Word Form) là dạng xuất hiện nhiều nhất trong TOEIC Part 5 (8-10 câu). 4 đáp án sẽ có cùng một gốc từ nhưng khác đuôi (hậu tố). Nhiệm vụ không phải dịch nghĩa mà là nhìn trước và sau chỗ trống để xác định từ loại còn thiếu.",
      keyFormulas: [
        "Cụm Danh từ: (a/an/the/tính từ sở hữu) + (Trạng từ) + (Tính từ) + DANH TỪ",
        "Vị trí Tính từ: Be/Linking Verb + TÍNH TỪ hoặc đứng trước bổ nghĩa cho Danh từ",
        "Vị trí Trạng từ: Đứng đầu câu trước dấu phẩy, đứng giữa Trợ động từ và Động từ chính (have + ADV + V3), hoặc đứng sau bổ nghĩa cho động từ thường",
        "Sau Giới từ (in/on/at/with/for...): GIỚI TỪ + V-ing / Danh từ",
      ],
      deepInsight:
        "Ghi nhớ thần chú: 'Danh từ làm lõi, Tính từ đứng trước bổ trợ, Trạng từ linh hoạt đứng cạnh Động từ hoặc Tính từ'. Chỗ trống đứng sau mạo từ/sở hữu cách mà chưa có danh từ -> Chắc chắn cần Danh từ.",
    },
    cheatSheet: [
      {
        signal: "Đuôi Danh từ phổ biến",
        rule: "-tion, -sion, -ment, -ance, -ence, -ity, -ness, -er/or (chỉ người)",
        example: "production, improvement, convenience, reliability, supervisor",
      },
      {
        signal: "Đuôi Tính từ phổ biến",
        rule: "-able, -ible, -ive, -al, -ous, -ful, -ic, -ent",
        example: "profitable, responsive, financial, continuous, successful",
      },
      {
        signal: "Đuôi Trạng từ",
        rule: "Tính từ + ly = Trạng từ chỉ cách thức",
        example: "efficient + ly = efficiently, prompt + ly = promptly",
      },
      {
        signal: "Be / Trợ động từ + _______ + V-ed/V-ing",
        rule: "Chỗ trống giữa 2 thành phần động từ LUÔN là TRẠNG TỪ (Adv)",
        example: "The system is currently operating at full capacity.",
      },
    ],
    traps: [
      {
        title: "Bẫy Danh từ chỉ Người (-er, -or, -ant) vs Danh từ chỉ Vật (-tion, -ment)",
        trapDescription:
          "Khi 4 đáp án có 2 danh từ (một chỉ người, một chỉ sự vật/khái niệm), học viên hay chọn bừa. Cần nhớ: Danh từ đếm được chỉ người KHÔNG ĐƯỢC đứng trơ trọi một mình mà phải có mạo từ (a/the) hoặc số nhiều (-s).",
        correctRule:
          "Nếu trước chỗ trống không có 'a/an' và không có 's' ở đuôi, thường là danh từ không đếm được chỉ sự việc. Nếu chỉ người cần có 'a/the' hoặc đuôi 's'.",
        badExample: "We need to hire an additional _______ (application / applicant). -> Chọn nhầm application.",
        goodExample: "We need to hire an additional applicant. (Người xin việc - có an).",
      },
      {
        title: "Bẫy Đuôi -ly của Tính từ (friendly, costly, timely, orderly)",
        trapDescription:
          "Học viên mặc định từ có đuôi -ly là trạng từ. Tuy nhiên: Danh từ + ly = TÍNH TỪ (costly = đắt đỏ, timely = kịp thời).",
        correctRule: "Trong cụm 'in a timely manner', 'timely' là tính từ bổ nghĩa cho 'manner'.",
        badExample: "The report was delivered in a timely efficiently. (SAI)",
        goodExample: "The report was delivered in a timely manner. (ĐÚNG)",
      },
    ],
    workedExample: {
      questionStem:
        "The executive director expressed complete _______ with the proposed expansion plan.",
      options: [
        "A. satisfy",
        "B. satisfaction",
        "C. satisfactory",
        "D. satisfactorily",
      ],
      correctIndex: 1,
      correctOption: "B. satisfaction",
      explanationStepByStep: [
        "Bước 1: Quan sát trước và sau chỗ trống -> Trước là tính từ 'complete', sau là giới từ 'with'.",
        "Bước 2: Áp dụng công thức: Tính từ đứng trước để bổ nghĩa cho DANH TỪ -> Vị trí này bắt buộc là Danh từ.",
        "Bước 3: Nhận diện đuôi từ loại: (A) satisfy: động từ; (B) satisfaction: danh từ (đuôi -tion); (C) satisfactory: tính từ (đuôi -ory); (D) satisfactorily: trạng từ (đuôi -ly).",
        "Kết luận: Chọn (B) satisfaction.",
      ],
    },
  },

  subject_verb: {
    tagCode: "subject_verb",
    category: "verbs",
    categoryVi: "Động từ & Thời gian",
    titleVi: "Hòa hợp Chủ ngữ - Động từ",
    taglineVi: "Quy tắc triệt tiêu thành phần phụ để tìm đúng chủ ngữ lõi",
    estimatedMinutes: 4,
    coreRule: {
      definition:
        "Động từ trong câu luôn phải chia tương ứng theo số ít hay số nhiều của Chủ ngữ chính. Điểm cốt lõi trong TOEIC là đề thi cố tình kéo dài chủ ngữ bằng các cụm giới từ, mệnh đề quan hệ hoặc cụm phân từ để làm thí sinh quên mất chủ ngữ gốc là gì.",
      keyFormulas: [
        "Chủ ngữ số ít / Danh từ không đếm được -> Động từ số ít (V-s/es, is, was, has)",
        "Chủ ngữ số nhiều -> Động từ số nhiều (V-inf, are, were, have)",
        "Quy tắc tách cụm giới từ: S + [preposition + noun] + V -> Động từ chia theo S đầu tiên",
        "Either A or B / Neither A nor B / Not only A but also B -> Động từ chia theo B (chủ ngữ gần nhất)",
      ],
      deepInsight:
        "Hãy đóng mở ngoặc toàn bộ cụm giới từ (ví dụ: 'in the warehouse', 'of our customers'). Động từ CHỈ hòa hợp với danh từ đứng trước giới từ đầu tiên!",
    },
    cheatSheet: [
      {
        signal: "Each / Every / Anyone / Everyone / Nobody",
        rule: "LUÔN đi với Động từ số ít",
        example: "Each of the participants receives a certificate.",
      },
      {
        signal: "A number of + N số nhiều",
        rule: "Nghĩa là 'Nhiều' -> Chia ĐỘNG TỪ SỐ NHIỀU",
        example: "A number of clients have voiced their satisfaction.",
      },
      {
        signal: "The number of + N số nhiều",
        rule: "Nghĩa là 'Số lượng của...' -> Chia ĐỘNG TỪ SỐ ÍT",
        example: "The number of online orders has doubled this quarter.",
      },
      {
        signal: "Danh từ nối bởi 'along with / together with / as well as'",
        rule: "Động từ chia theo CHỦ NGỮ THỨ NHẤT (trước cụm nối)",
        example: "The manager, along with his assistants, is attending the summit.",
      },
    ],
    traps: [
      {
        title: "Bẫy danh từ nằm trong cụm giới từ che mắt chủ ngữ thật",
        trapDescription:
          "Ví dụ: 'The quality of these manufactured components _______ critical.' Thí sinh thấy 'components' có -s liền chọn động từ số nhiều.",
        correctRule:
          "'of these manufactured components' chỉ là cụm giới từ phụ bổ nghĩa. Chủ ngữ chính là 'The quality' (số ít, không đếm được) -> Phải chia 'is'.",
        badExample: "The quality of these components are high. (SAI)",
        goodExample: "The quality of these components is high. (ĐÚNG)",
      },
    ],
    workedExample: {
      questionStem:
        "The list of candidates who passed the preliminary interview _______ posted on the intranet yesterday.",
      options: [
        "A. were",
        "B. was",
        "C. are",
        "D. have been",
      ],
      correctIndex: 1,
      correctOption: "B. was",
      explanationStepByStep: [
        "Bước 1: Phân tích thành phần câu: 'of candidates' là cụm giới từ, 'who passed...' là mệnh đề quan hệ phụ -> Bỏ qua hai thành phần này.",
        "Bước 2: Tìm chủ ngữ chính -> 'The list' (danh từ số ít đếm được).",
        "Bước 3: Nhìn thời gian: 'yesterday' -> Quá khứ đơn.",
        "Bước 4: Chủ ngữ số ít + thời gian quá khứ -> Dùng 'was'. Loại (A) were, (C) are, (D) have been.",
        "Kết luận: Chọn (B) was.",
      ],
    },
  },

  passive_voice: {
    tagCode: "passive_voice",
    category: "verbs",
    categoryVi: "Động từ & Thời gian",
    titleVi: "Câu bị động (Passive Voice)",
    taglineVi: "Phân biệt Thể Chủ động vs Bị động không cần dịch nghĩa",
    estimatedMinutes: 5,
    coreRule: {
      definition:
        "Câu bị động dùng khi chủ ngữ là đối tượng tiếp nhận hành động thay vì trực tiếp thực hiện hành động. Cấu trúc chuẩn mực của câu bị động luôn luôn là: BE + V3/V-ed.",
      keyFormulas: [
        "Công thức nền tảng: be + V3/V-ed (is/are/was/were/been/being + V3)",
        "Ngoại động từ chủ động: S + V(chủ động) + TÂN NGỮ (O)",
        "Ngoại động từ bị động: S + be + V3 (KHÔNG có tân ngữ phía sau, hoặc đi kèm by + O)",
        "Thể truyền khiến: Have/Get something + V3/V-ed (nhờ/thuê ai làm việc gì)",
      ],
      deepInsight:
        "Bí kíp 3 giây nhận biết: Nhìn ngay sau chỗ trống! Nếu sau chỗ trống KHÔNG CÓ TÂN NGỮ (chỉ có giới từ, trạng từ hoặc hết câu) -> 90% động từ đó phải chia ở thể BỊ ĐỘNG (be + V3).",
    },
    cheatSheet: [
      {
        signal: "Sau chỗ trống có Giới từ (by, in, for, at)",
        rule: "Chọn dạng Bị động (be + V3/V-ed)",
        example: "The new guidelines were approved by the steering committee.",
      },
      {
        signal: "Sau chỗ trống có Cụm Danh từ (Tân ngữ)",
        rule: "Chọn dạng Chủ động",
        example: "The committee approved the new guidelines yesterday.",
      },
      {
        signal: "Động từ luôn ở thể bị động trong công sở",
        rule: "be scheduled to, be required to, be expected to, be located in",
        example: "All employees are required to wear identification badges.",
      },
    ],
    traps: [
      {
        title: "Bẫy nội động từ (Intransitive Verbs) KHÔNG BAO GIỜ có bị động",
        trapDescription:
          "Các nội động từ như happen, occur, arrive, rise, exist, remain không bao giờ nhận tân ngữ nên TUYỆT ĐỐI KHÔNG chia bị động. Thí sinh hay chọn 'was occurred' vì dịch nghĩa tiếng Việt thấy hợp.",
        correctRule: "Nội động từ luôn chia ở thể chủ động.",
        badExample: "The incident was happened during the night shift. (SAI)",
        goodExample: "The incident happened during the night shift. (ĐÚNG)",
      },
    ],
    workedExample: {
      questionStem:
        "All warranty requests must be _______ by an authorized technician before processing.",
      options: [
        "A. verify",
        "B. verified",
        "C. verifying",
        "D. verification",
      ],
      correctIndex: 1,
      correctOption: "B. verified",
      explanationStepByStep: [
        "Bước 1: Nhìn trước chỗ trống có 'must be' -> Cấu trúc động từ khuyết thiếu ở thể bị động: must be + V3/V-ed hoặc tính từ.",
        "Bước 2: Nhìn sau chỗ trống có 'by an authorized technician' -> Dấu hiệu rõ ràng của câu bị động.",
        "Bước 3: Loại (A) động từ nguyên mẫu, (C) V-ing, (D) danh từ.",
        "Kết luận: Chọn (B) verified.",
      ],
    },
  },

  conjunctions_prepositions: {
    tagCode: "conjunctions_prepositions",
    category: "structures",
    categoryVi: "Cấu trúc & Liên kết",
    titleVi: "Liên từ & Giới từ (Conjunctions & Prepositions)",
    taglineVi: "Phân biệt Cặp Sinh Đôi: Liên từ nối Mệnh đề vs Giới từ nối Cụm từ",
    estimatedMinutes: 5,
    coreRule: {
      definition:
        "Dạng bài Liên từ và Giới từ thường kiểm tra khả năng phân biệt thành phần đi sau chỗ trống. Dù cùng mang nghĩa (như 'mặc dù' hoặc 'bởi vì'), nhưng Liên từ bắt buộc phải nối một MỆNH ĐỀ (S + V), còn Giới từ chỉ được phép đi với CỤM DANH TỪ hoặc V-ING.",
      keyFormulas: [
        "LIÊN TỪ (Conjunction) + Mệnh đề (S + V + O)",
        "GIỚI TỪ (Preposition) + Cụm Danh từ (Noun Phrase) / V-ing",
        "Nhóm 'Mặc dù': Although / Even though / While (+ S + V) VS Despite / In spite of (+ Noun/V-ing)",
        "Nhóm 'Bởi vì': Because / Since / As (+ S + V) VS Because of / Due to / Owing to (+ Noun/V-ing)",
      ],
      deepInsight:
        "Mẹo vàng kiểm tra: Nhìn ngay sau chỗ trống và tìm ĐỘNG TỪ CHIA THÌ. Có động từ chia thì -> Chọn Liên từ. Không có động từ chia thì (chỉ có cụm danh từ) -> Chọn Giới từ.",
    },
    cheatSheet: [
      {
        signal: "Because / Since / As / Now that",
        rule: "Liên từ chỉ nguyên nhân (+ MỆNH ĐỀ: S + V)",
        example: "The flight was delayed because severe weather affected the region.",
      },
      {
        signal: "Because of / Due to / Owing to",
        rule: "Giới từ chỉ nguyên nhân (+ CỤM DANH TỪ)",
        example: "The flight was delayed due to severe weather conditions.",
      },
      {
        signal: "Although / Even though / Though",
        rule: "Liên từ chỉ sự tương phản (+ MỆNH ĐỀ: S + V)",
        example: "Although the budget was limited, the campaign succeeded.",
      },
      {
        signal: "Despite / In spite of",
        rule: "Giới từ chỉ sự tương phản (+ CỤM DANH TỪ)",
        example: "Despite the limited budget, the campaign succeeded.",
      },
    ],
    traps: [
      {
        title: "Bẫy danh từ có tính từ hoặc mệnh đề quan hệ rút gọn dài ngoằng đi kèm",
        trapDescription:
          "Thí sinh thấy một cụm từ dài có chứa V-ed hoặc V-ing liền tưởng là mệnh đề có S + V nên vội chọn Liên từ (Because/Although).",
        correctRule:
          "Phải phân biệt động từ chính chia thì với phân từ bổ nghĩa. Nếu không có động từ chính của câu, đó chỉ là cụm danh từ.",
        badExample: "Although the heavy rain falling since morning, we went. (SAI vì chỉ có cụm danh từ)",
        goodExample: "Despite the heavy rain falling since morning, we went. (ĐÚNG)",
      },
    ],
    workedExample: {
      questionStem:
        "_______ the sudden increase in raw material costs, the manufacturing plant maintained its profit margin.",
      options: [
        "A. Although",
        "B. Despite",
        "C. Because",
        "D. Even if",
      ],
      correctIndex: 1,
      correctOption: "B. Despite",
      explanationStepByStep: [
        "Bước 1: Phân tích thành phần sau chỗ trống: 'the sudden increase in raw material costs' -> Đây hoàn toàn là một Cụm danh từ (Noun phrase), không có động từ chia thì.",
        "Bước 2: Loại trừ ngay các Liên từ đòi hỏi mệnh đề S+V: (A) Although, (C) Because, (D) Even if.",
        "Bước 3: Chỉ còn (B) Despite là Giới từ phù hợp đi cùng Cụm danh từ, đồng thời mang ý nghĩa tương phản thích hợp với vế sau.",
        "Kết luận: Chọn (B) Despite.",
      ],
    },
  },

  gerund_infinitive: {
    tagCode: "gerund_infinitive",
    category: "verbs",
    categoryVi: "Động từ & Thời gian",
    titleVi: "Danh động từ & Động từ nguyên mẫu",
    taglineVi: "Quy tắc chọn V-ing hay To-V theo sau các động từ và giới từ công sở",
    estimatedMinutes: 4,
    coreRule: {
      definition:
        "Khi một hành động đóng vai trò là chủ ngữ, tân ngữ hoặc đứng sau một động từ khác, nó phải ở dạng Danh động từ (V-ing) hoặc Động từ nguyên mẫu có 'to' (To-V). TOEIC kiểm tra danh sách các động từ chỉ đi với To-V hoặc chỉ đi với V-ing.",
      keyFormulas: [
        "Chỉ đi với To-V: decide, plan, promise, agree, refuse, offer, intend, attempt, afford",
        "Chỉ đi với V-ing: consider, suggest, avoid, postpone, mind, enjoy, delay, practice",
        "To-V chỉ mục đích: 'in order to / so as to / to + V-inf' (để làm gì)",
        "Giới từ + V-ing: in / on / about / without / after / before / instead of + V-ing",
      ],
      deepInsight:
        "Hầu hết các động từ hướng về tương lai, kế hoạch hoặc mục tiêu (plan, expect, hope, want, decide) đều đi với TO-V. Các động từ liên quan đến sự trì hoãn hoặc cân nhắc (delay, postpone, consider) đi với V-ING.",
    },
    cheatSheet: [
      {
        signal: "look forward to / be committed to / be used to",
        rule: "'To' ở đây là GIỚI TỪ -> Đi với V-ING (không phải V-inf)",
        example: "We look forward to receiving your constructive feedback.",
      },
      {
        signal: "in an effort to / in order to",
        rule: "Cụm chỉ mục đích -> Đi với ĐỘNG TỪ NGUYÊN MẪU (To-V)",
        example: "In an effort to reduce overhead costs, energy usage was trimmed.",
      },
      {
        signal: "by / without / upon + V-ing",
        rule: "Giới từ chỉ cách thức hoặc thời điểm",
        example: "Upon entering the building, guests must sign in.",
      },
    ],
    traps: [
      {
        title: "Bẫy từ 'To' là Giới từ chứ không phải To-infinitive",
        trapDescription:
          "Thí sinh thấy chữ 'to' là tự động chọn động từ nguyên thể (V-inf). Trong các cụm: 'look forward to', 'committed to', 'prior to', chữ 'to' là giới từ nên bắt buộc đi với V-ing.",
        correctRule: "Look forward to + V-ing; Prior to + V-ing/Noun.",
        badExample: "We look forward to meet you. (SAI)",
        goodExample: "We look forward to meeting you. (ĐÚNG)",
      },
    ],
    workedExample: {
      questionStem:
        "The board of directors is currently considering _______ the regional branch to Singapore.",
      options: [
        "A. relocate",
        "B. to relocate",
        "C. relocating",
        "D. relocation",
      ],
      correctIndex: 2,
      correctOption: "C. relocating",
      explanationStepByStep: [
        "Bước 1: Nhìn động từ chính đứng trước chỗ trống: 'considering' (gốc từ: consider - cân nhắc, xem xét).",
        "Bước 2: Quy tắc ngữ pháp: Động từ 'consider' luôn đi với Danh động từ (V-ing) đóng vai trò tân ngữ.",
        "Bước 3: Loại (A) V-inf, (B) To-V. Với (D) danh từ 'relocation', nó không thể nhận tân ngữ 'the regional branch' phía sau nếu không có giới từ 'of'.",
        "Kết luận: Chọn (C) relocating.",
      ],
    },
  },

  participles: {
    tagCode: "participles",
    category: "verbs",
    categoryVi: "Động từ & Thời gian",
    titleVi: "Phân từ & Rút gọn mệnh đề",
    taglineVi: "Phân biệt V-ing (chủ động) vs V-ed (bị động) trong 3 bước",
    estimatedMinutes: 5,
    coreRule: {
      definition:
        "Phân từ có 2 dạng: Hiện tại phân từ (V-ing) và Quá khứ phân từ (V-ed/V3). Chúng thường đóng vai trò như một tính từ bổ nghĩa cho danh từ hoặc dùng để rút gọn mệnh đề quan hệ / mệnh đề trạng ngữ có cùng chủ ngữ.",
      keyFormulas: [
        "Phân từ chủ động: V-ing + Tân ngữ (noun) -> thực hiện hành động",
        "Phân từ bị động: V-ed (không có tân ngữ phía sau) -> chịu tác động của hành động",
        "Rút gọn mệnh đề quan hệ: The man [who is speaking] -> The man speaking; The document [which was signed] -> The document signed",
        "Rút gọn mệnh đề trạng ngữ đầu câu: [V-ing/V-ed]..., S + V + O",
      ],
      deepInsight:
        "Nếu sau phân từ có tân ngữ là danh từ -> Chọn V-ing. Nếu sau phân từ là giới từ hoặc hết vế -> Chọn V-ed.",
    },
    cheatSheet: [
      {
        signal: "_______ + Noun (Danh từ chỉ đối tượng)",
        rule: "Tính từ phân từ chỉ tính chất chủ động -> V-ing",
        example: "an increasing number of consumers / leading provider",
      },
      {
        signal: "Danh từ + _______ + Giới từ (by, in, to)",
        rule: "Rút gọn mệnh đề quan hệ dạng bị động -> V-ed",
        example: "The items ordered online will be delivered tomorrow.",
      },
    ],
    traps: [
      {
        title: "Bẫy phân từ đứng đầu câu (Dangling Participle)",
        trapDescription:
          "Khi câu bắt đầu bằng V-ing hoặc V-ed trước dấu phẩy, chủ ngữ sau dấu phẩy phải là người/vật thực hiện hành động đó.",
        correctRule: "Chủ ngữ của mệnh đề chính quyết định dạng V-ing hay V-ed đứng đầu câu.",
        badExample: "Walking through the office, the lights were turned off. (SAI vì the lights không thể tự walk)",
        goodExample: "Walking through the office, the guard turned off the lights. (ĐÚNG)",
      },
    ],
    workedExample: {
      questionStem:
        "Any employee _______ in participating in the leadership training program should contact HR.",
      options: [
        "A. interest",
        "B. interested",
        "C. interesting",
        "D. interestingly",
      ],
      correctIndex: 1,
      correctOption: "B. interested",
      explanationStepByStep: [
        "Bước 1: Phân tích cấu trúc câu: Động từ chính là 'should contact'. Chỗ trống nằm trong cụm bổ nghĩa cho 'Any employee'.",
        "Bước 2: Cụm cố định chỉ cảm xúc / mối quan tâm của con người: 'be interested in' -> Khi rút gọn mệnh đề quan hệ: 'Any employee [who is] interested in...'.",
        "Bước 3: Loại (C) interesting (chỉ tính chất vật gây ra sự hứng thú), (A) động từ, (D) trạng từ.",
        "Kết luận: Chọn (B) interested.",
      ],
    },
  },

  relative_clauses: {
    tagCode: "relative_clauses",
    category: "clauses",
    categoryVi: "Mệnh đề & Câu phức",
    titleVi: "Mệnh đề quan hệ (Relative Clauses)",
    taglineVi: "Phân biệt Who, Whom, Which, That, Whose trong 5 giây",
    estimatedMinutes: 5,
    coreRule: {
      definition:
        "Mệnh đề quan hệ dùng để bổ nghĩa cho danh từ đứng trước nó. Đại từ quan hệ thay thế cho danh từ chỉ người, vật, hoặc quan hệ sở hữu.",
      keyFormulas: [
        "Chỉ Người làm chủ ngữ: N(người) + WHO + V",
        "Chỉ Người làm tân ngữ: N(người) + WHOM/WHO + S + V",
        "Chỉ Vật: N(vật) + WHICH + V hoặc S + V",
        "Chỉ Sở hữu: N + WHOSE + Noun (không có mạo từ a/the)",
        "Đại từ thay thế chung: THAT (thay cho Who/Which trong mệnh đề xác định, KHÔNG đứng sau dấu phẩy và giới từ)",
      ],
      deepInsight:
        "Nhìn từ liền trước và liền sau chỗ trống: Trước là Người + Sau là Động từ -> WHO. Trước là Người + Sau là S+V -> WHOM. Trước và sau đều là Danh từ không có 'the' -> WHOSE.",
    },
    cheatSheet: [
      {
        signal: "Noun + _______ + Noun (không có a/an/the)",
        rule: "Chỉ sở hữu -> Chọn WHOSE",
        example: "We interviewed candidates whose qualifications matched our needs.",
      },
      {
        signal: "Giới từ + _______",
        rule: "CHỈ ĐƯỢC DÙNG WHOM (người) hoặc WHICH (vật) — CẤM dùng That/Who",
        example: "The committee with which we collaborated was highly supportive.",
      },
      {
        signal: "Dấu phẩy + _______",
        rule: "Mệnh đề không xác định -> TUYỆT ĐỐI KHÔNG DÙNG THAT",
        example: "Mr. Patel, who joined last month, has made an immediate impact.",
      },
    ],
    traps: [
      {
        title: "Bẫy dùng 'THAT' sau dấu phẩy hoặc giới từ",
        trapDescription:
          "Học viên có thói quen chọn 'that' vì thấy tiện dụng. Nhưng trong tiếng Anh chuẩn, 'that' cấm đứng sau dấu phẩy và giới từ.",
        correctRule: "Sau giới từ: in which / to whom. Không có in that.",
        badExample: "The project in that we invested was successful. (SAI)",
        goodExample: "The project in which we invested was successful. (ĐÚNG)",
      },
    ],
    workedExample: {
      questionStem:
        "The freelance consultant _______ proposal was approved will begin work next Monday.",
      options: [
        "A. who",
        "B. whose",
        "C. which",
        "D. whom",
      ],
      correctIndex: 1,
      correctOption: "B. whose",
      explanationStepByStep: [
        "Bước 1: Nhìn từ liền trước: 'consultant' (danh từ chỉ người). Nhìn từ liền sau: 'proposal' (danh từ, bản đề xuất).",
        "Bước 2: Giữa 2 danh từ chỉ quan hệ sở hữu (bản đề xuất CỦA chuyên gia tư vấn) -> Cần đại từ quan hệ sở hữu 'whose'.",
        "Bước 3: Loại (A) who (cần động từ sau), (C) which (chỉ vật), (D) whom (cần đại từ tân ngữ).",
        "Kết luận: Chọn (B) whose.",
      ],
    },
  },

  conditionals: {
    tagCode: "conditionals",
    category: "clauses",
    categoryVi: "Mệnh đề & Câu phức",
    titleVi: "Câu điều kiện & Thể giả định",
    taglineVi: "Bộ công thức 3 loại câu điều kiện & mẹo Đảo ngữ kinh điển ETS",
    estimatedMinutes: 5,
    coreRule: {
      definition:
        "Câu điều kiện diễn tả một giả định và kết quả tương ứng. Trong TOEIC, ngoài 3 loại câu điều kiện cơ bản, đề thi cực kỳ chuộng dạng ĐẢO NGỮ (lược bỏ If) để tạo văn phong trang trọng trong công sở.",
      keyFormulas: [
        "Loại 1 (có thể xảy ra ở hiện tại/tương lai): If + S + V(hiện tại đơn), S + will/can + V-inf",
        "Loại 2 (trái thực tế hiện tại): If + S + V2/were, S + would/could + V-inf",
        "Loại 3 (trái thực tế quá khứ): If + S + had + V3/V-ed, S + would/could have + V3",
        "Đảo ngữ Loại 1: SHOULD + S + V-inf, S + will/can + V-inf (thay cho If S + V)",
        "Đảo ngữ Loại 2: WERE + S + to-V / Were + S..., S + would + V-inf",
        "Đảo ngữ Loại 3: HAD + S + V3/V-ed, S + would have + V3",
      ],
      deepInsight:
        "Nếu đầu câu có chỗ trống mà cuối vế có dấu phẩy, vế sau có 'will + V-inf' hoặc mệnh đề mệnh lệnh -> 95% là đảo ngữ câu điều kiện loại 1 với 'SHOULD'.",
    },
    cheatSheet: [
      {
        signal: "_______ you have any questions, please contact...",
        rule: "Đảo ngữ Loại 1 trang trọng trong thư từ -> Chọn SHOULD",
        example: "Should you need further assistance, please do not hesitate to call.",
      },
      {
        signal: "provided that / as long as / unless (= if not)",
        rule: "Các liên từ điều kiện tương đương IF",
        example: "You may take leave provided that your manager approves.",
      },
    ],
    traps: [
      {
        title: "Bẫy Đảo ngữ loại 1: Động từ sau 'Should + S' luôn NGUYÊN MẪU",
        trapDescription:
          "Dù chủ ngữ là số ít (he/she/it/anyone), động từ theo sau 'Should' luôn là V-inf, không chia s/es.",
        correctRule: "Should anyone require... (không phải requires).",
        badExample: "Should Mr. Smith needs help... (SAI)",
        goodExample: "Should Mr. Smith need help... (ĐÚNG)",
      },
    ],
    workedExample: {
      questionStem:
        "_______ you require additional information regarding the conference, please email the coordinator.",
      options: [
        "A. Unless",
        "B. Should",
        "C. Although",
        "D. Because",
      ],
      correctIndex: 1,
      correctOption: "B. Should",
      explanationStepByStep: [
        "Bước 1: Quan sát câu: Vế sau là câu mệnh lệnh 'please email...'. Vế trước bắt đầu bằng một chỗ trống và không có 'if'.",
        "Bước 2: Đây là cấu trúc đảo ngữ trang trọng của câu điều kiện loại 1: 'Should + S + V-inf' thay cho 'If you require'.",
        "Bước 3: Loại (A) Unless (mang nghĩa phủ định 'nếu không', không hợp lý), (C) Although, (D) Because.",
        "Kết luận: Chọn (B) Should.",
      ],
    },
  },

  comparisons: {
    tagCode: "comparisons",
    category: "structures",
    categoryVi: "Cấu trúc & Liên kết",
    titleVi: "Cấu trúc so sánh (Comparisons)",
    taglineVi: "Phân biệt so sánh bằng, hơn, nhất và các từ nhấn mạnh so sánh",
    estimatedMinutes: 4,
    coreRule: {
      definition:
        "Dạng bài so sánh kiểm tra dạng thức của Tính từ / Trạng từ (ngắn vs dài), các cấu trúc so sánh đặc biệt (the more... the more...), và từ nhấn mạnh so sánh hơn.",
      keyFormulas: [
        "So sánh bằng: as + adj/adv + as (ở giữa LUÔN là dạng nguyên thể)",
        "So sánh hơn: adj-er / more + adj/adv + THAN",
        "So sánh nhất: the + adj-est / the most + adj/adv",
        "So sánh kép: The + so sánh hơn..., the + so sánh hơn...",
        "Từ nhấn mạnh so sánh hơn: much, far, significantly, substantially + MORE / adj-er (KHÔNG dùng very)",
      ],
      deepInsight:
        "Thấy chữ 'THAN' trong câu -> Tìm ngay phương án có đuôi '-er' hoặc 'more'. Thấy 'as... as' -> Chọn tính từ/trạng từ dạng nguyên bản, tuyệt đối không chọn dạng có 'more' hay '-er'.",
    },
    cheatSheet: [
      {
        signal: "much / far / significantly / considerably + _______",
        rule: "Nhấn mạnh so sánh hơn -> Đi với SO SÁNH HƠN",
        example: "The revised plan is significantly more cost-effective.",
      },
      {
        signal: "as + _______ + as",
        rule: "Dạng nguyên mẫu của Tính từ hoặc Trạng từ",
        example: "Please reply as promptly as possible.",
      },
    ],
    traps: [
      {
        title: "Bẫy dùng 'very' để bổ nghĩa cho so sánh hơn",
        trapDescription:
          "Học viên hay nói 'very more expensive'. Trong ngữ pháp chuẩn, 'very' chỉ bổ nghĩa cho tính từ thường, cấm đi với so sánh hơn.",
        correctRule: "Dùng much / far / substantially thay vì very.",
        badExample: "This model is very faster than the old one. (SAI)",
        goodExample: "This model is much faster than the old one. (ĐÚNG)",
      },
    ],
    workedExample: {
      questionStem:
        "The updated database software operates _______ than the previous version.",
      options: [
        "A. more efficient",
        "B. more efficiently",
        "C. efficient",
        "D. most efficiently",
      ],
      correctIndex: 1,
      correctOption: "B. more efficiently",
      explanationStepByStep: [
        "Bước 1: Thấy từ 'than' -> Cần dạng so sánh hơn -> Loại (C) và (D).",
        "Bước 2: Nhìn động từ đứng trước: 'operates' là động từ thường -> Cần một TRẠNG TỪ bổ nghĩa, không thể dùng tính từ.",
        "Bước 3: Dạng so sánh hơn của trạng từ là 'more efficiently'.",
        "Kết luận: Chọn (B) more efficiently.",
      ],
    },
  },

  nouns_pronouns: {
    tagCode: "nouns_pronouns",
    category: "words_phrases",
    categoryVi: "Từ loại & Vị trí",
    titleVi: "Danh từ & Đại từ (Nouns & Pronouns)",
    taglineVi: "Quy tắc Đại từ phản thân, Đại từ sở hữu và Danh từ không đếm được",
    estimatedMinutes: 4,
    coreRule: {
      definition:
        "Đại từ thay thế cho danh từ để tránh lặp lại. Trong TOEIC, câu hỏi đại từ phản thân (myself, himself, themselves) và đại từ sở hữu (mine, theirs) xuất hiện đều đặn trong mỗi đề thi.",
      keyFormulas: [
        "Đại từ nhân xưng: I/He/She/They (làm S); Me/Him/Her/Them (làm O)",
        "Tính từ sở hữu: My/His/Her/Their + DANH TỪ",
        "Đại từ sở hữu: Mine/His/Hers/Theirs = Tính từ sở hữu + Danh từ (đứng độc lập)",
        "Đại từ phản thân: -self/-selves (nhấn mạnh chủ ngữ hoặc dùng khi S và O cùng là một đối tượng)",
        "Cụm 'by oneself' = on one's own = alone (tự mình làm)",
      ],
      deepInsight:
        "Đứng trước Danh từ -> Chọn Tính từ sở hữu (their/our/his). Đứng cuối câu sau mệnh đề hoàn chỉnh hoặc sau giới từ 'by' -> Chọn Đại từ phản thân (themselves/himself).",
    },
    cheatSheet: [
      {
        signal: "by + _______ (ở cuối câu)",
        rule: "Chọn Đại từ phản thân (-self / -selves)",
        example: "The software engineer resolved the server error by himself.",
      },
      {
        signal: "_______ + Danh từ",
        rule: "Chọn Tính từ sở hữu (our, their, his, her, its)",
        example: "All participants received their registration packets.",
      },
    ],
    traps: [
      {
        title: "Bẫy Đại từ sở hữu (Theirs/Hers) vs Tính từ sở hữu (Their/Her)",
        trapDescription:
          "Đại từ sở hữu đã bao gồm cả danh từ bên trong nó, nên KHÔNG ĐƯỢC có thêm danh từ theo sau.",
        correctRule: "their car = theirs. Không dùng: theirs car.",
        badExample: "We received theirs application. (SAI)",
        goodExample: "We received their application. (ĐÚNG)",
      },
    ],
    workedExample: {
      questionStem:
        "Because Ms. Watson had prior experience in event planning, she organized the annual gala by _______.",
      options: [
        "A. her",
        "B. herself",
        "C. hers",
        "D. she",
      ],
      correctIndex: 1,
      correctOption: "B. herself",
      explanationStepByStep: [
        "Bước 1: Nhìn vị trí chỗ trống: Nằm sau giới từ 'by' ở cuối câu hoàn chỉnh.",
        "Bước 2: Cụm thành ngữ cố định: 'by + đại từ phản thân' diễn đạt ý tự thân làm mà không cần ai giúp đỡ.",
        "Bước 3: Chủ ngữ là 'she' -> Đại từ phản thân tương ứng là 'herself'.",
        "Kết luận: Chọn (B) herself.",
      ],
    },
  },

  adjectives_adverbs: {
    tagCode: "adjectives_adverbs",
    category: "words_phrases",
    categoryVi: "Từ loại & Vị trí",
    titleVi: "Tính từ & Trạng từ",
    taglineVi: "Phân biệt Tính từ chỉ cảm xúc vs Tính từ chỉ tính chất, vị trí trạng từ",
    estimatedMinutes: 4,
    coreRule: {
      definition:
        "Tính từ bổ nghĩa cho Danh từ hoặc đi sau Động từ nối (Linking Verbs: be, remain, seem, appear, become). Trạng từ bổ nghĩa cho Động từ, Tính từ, hoặc một Trạng từ khác.",
      keyFormulas: [
        "Linking Verb + TÍNH TỪ: remain / become / seem / appear / feel + ADJ",
        "Cấu trúc Find/Keep/Make + O + TÍNH TỪ (giữ/khiến cho ai/cái gì như thế nào)",
        "Tính từ đuôi -ed: Diễn tả cảm xúc của con người (interested, excited, pleased)",
        "Tính từ đuôi -ing: Diễn tả tính chất của sự vật, sự việc (interesting, exciting, pleasing)",
      ],
      deepInsight:
        "Nhớ câu thần chú: 'Người cảm nhận (-ed), Vật tạo nên (-ing)'. Đứng sau Keep / Make / Find + Tân ngữ luôn là TÍNH TỪ (không chọn Trạng từ).",
    },
    cheatSheet: [
      {
        signal: "make / keep / find + O + _______",
        rule: "Chọn TÍNH TỪ (Adjective)",
        example: "Please keep the storage facility secure at all times.",
      },
      {
        signal: "remain / become + _______",
        rule: "Linking verb đi với TÍNH TỪ",
        example: "Fuel prices remain volatile due to global shortages.",
      },
    ],
    traps: [
      {
        title: "Bẫy chọn Trạng từ sau 'keep / make + Tân ngữ'",
        trapDescription:
          "Vì dịch sang tiếng Việt có chữ 'một cách...' nên học viên hay chọn trạng từ có -ly.",
        correctRule: "Cấu trúc cố định: keep + O + Adj. Không dùng Adv.",
        badExample: "We want to make the process easily. (SAI)",
        goodExample: "We want to make the process easy. (ĐÚNG)",
      },
    ],
    workedExample: {
      questionStem:
        "To ensure client confidentiality, the firm must keep all financial records _______.",
      options: [
        "A. confidential",
        "B. confidentially",
        "C. confidentiality",
        "D. confide",
      ],
      correctIndex: 0,
      correctOption: "A. confidential",
      explanationStepByStep: [
        "Bước 1: Nhận diện cấu trúc động từ 'keep': keep + Tân ngữ ('all financial records') + TÍNH TỪ.",
        "Bước 2: Cần tìm một tính từ mang nghĩa 'bảo mật'.",
        "Bước 3: Nhận diện từ loại: (A) confidential (tính từ đuôi -ial); (B) confidentially (trạng từ -ly); (C) danh từ; (D) động từ.",
        "Kết luận: Chọn (A) confidential.",
      ],
    },
  },

  modals: {
    tagCode: "modals",
    category: "verbs",
    categoryVi: "Động từ & Thời gian",
    titleVi: "Động từ khuyết thiếu (Modal Verbs)",
    taglineVi: "Quy tắc Động từ khuyết thiếu & Thể giả định trong công sở",
    estimatedMinutes: 4,
    coreRule: {
      definition:
        "Động từ khuyết thiếu (can, could, should, must, may, might) dùng để bổ trợ ý nghĩa về khả năng, sự bắt buộc hoặc lời khuyên. Theo sau động từ khuyết thiếu LUÔN là ĐỘNG TỪ NGUYÊN MẪU (V-inf).",
      keyFormulas: [
        "Modal verb + V-inf (không chia số ít/số nhiều, không to, không V-ing)",
        "Must / Have to: Bắt buộc (Must = bắt buộc theo quy định nội tại, Have to = hoàn cảnh ép buộc)",
        "Should / Ought to / Had better: Lời khuyên, khuyến nghị",
        "Should have + V3: Đáng lẽ ra nên làm trong quá khứ nhưng đã không làm",
      ],
      deepInsight:
        "Sau can/could/will/would/must/should -> 100% chọn động từ nguyên mẫu không 'to' (V-inf). Nếu có 'be' phía sau -> chọn V3/V-ed (bị động).",
    },
    cheatSheet: [
      {
        signal: "must / should / cannot + _______",
        rule: "Động từ nguyên mẫu V-inf",
        example: "All visitors must register at the reception desk.",
      },
      {
        signal: "suggest / recommend / require that + S + (should) + V-inf",
        rule: "Thể giả định trong văn phòng: Động từ luôn nguyên mẫu",
        example: "The auditor recommended that the CFO review the balance sheet.",
      },
    ],
    traps: [
      {
        title: "Bẫy thể giả định (Subjunctive): S số ít nhưng V vẫn nguyên mẫu",
        trapDescription:
          "Sau các động từ yêu cầu/đề xuất (suggest, recommend, demand, request, require, insist) + that + S, động từ đi sau KHÔNG chia s/es dù chủ ngữ là số ít vì ngầm có chữ 'should'.",
        correctRule: "recommend that he submit (không chia submits).",
        badExample: "The supervisor requested that John arrives on time. (SAI)",
        goodExample: "The supervisor requested that John arrive on time. (ĐÚNG)",
      },
    ],
    workedExample: {
      questionStem:
        "The committee suggested that each division director _______ a revised budget by Friday.",
      options: [
        "A. submits",
        "B. submit",
        "C. submitted",
        "D. will submit",
      ],
      correctIndex: 1,
      correctOption: "B. submit",
      explanationStepByStep: [
        "Bước 1: Nhận diện cấu trúc thể giả định: 'suggested that + S + (should) + V-inf'.",
        "Bước 2: Mặc dù chủ ngữ 'each division director' là số ít, động từ bắt buộc phải ở dạng nguyên mẫu không chia.",
        "Bước 3: Loại (A) submits (chia số ít), (C) quá khứ, (D) tương lai.",
        "Kết luận: Chọn (B) submit.",
      ],
    },
  },

  inversion: {
    tagCode: "inversion",
    category: "structures",
    categoryVi: "Cấu trúc & Liên kết",
    titleVi: "Đảo ngữ (Inversion)",
    taglineVi: "Nhận diện cấu trúc đảo ngữ với từ phủ định và Only",
    estimatedMinutes: 4,
    coreRule: {
      definition:
        "Đảo ngữ là hiện tượng đưa trợ động từ hoặc động từ to-be lên trước chủ ngữ nhằm mục đích nhấn mạnh. Trong TOEIC, đảo ngữ hay xuất hiện khi đầu câu có các trạng từ phủ định hoặc bán phủ định.",
      keyFormulas: [
        "Từ phủ định + Trợ động từ + S + V-inf (Never, Rarely, Seldom, Little, Hardly)",
        "Only when / Only after / Only by + Mệnh đề/Cụm từ + Trợ động từ + S + V-inf",
        "Under no circumstances / At no time + Trợ động từ + S + V",
        "Not only + Trợ động từ + S + V..., but also...",
      ],
      deepInsight:
        "Thấy trạng từ phủ định (Rarely, Never, Seldom) hoặc 'Under no circumstances' đứng đầu câu -> Ngay lập tức tìm cấu trúc ĐẢO NGỮ (Trợ động từ + S + V-inf).",
    },
    cheatSheet: [
      {
        signal: "Rarely / Seldom / Never đứng đầu câu",
        rule: "Đảo Trợ động từ lên trước Chủ ngữ",
        example: "Rarely has the firm achieved such rapid revenue growth.",
      },
      {
        signal: "Under no circumstances...",
        rule: "Tuyệt đối trong bất kỳ hoàn cảnh nào cũng không... (+ Đảo ngữ)",
        example: "Under no circumstances should confidential files be shared.",
      },
    ],
    traps: [
      {
        title: "Bẫy thứ tự từ trong câu đảo ngữ",
        trapDescription:
          "Thí sinh hay chọn theo thứ tự xuôi S + V bình thường mà quên mất phải đưa trợ động từ (do/does/did/has/have/should) lên trước chủ ngữ.",
        correctRule: "Never + have I... (không phải: Never I have...).",
        badExample: "Rarely we have seen such dedication. (SAI)",
        goodExample: "Rarely have we seen such dedication. (ĐÚNG)",
      },
    ],
    workedExample: {
      questionStem:
        "Seldom _______ the customer service department received so many commendations.",
      options: [
        "A. has",
        "B. have",
        "C. is",
        "D. having",
      ],
      correctIndex: 0,
      correctOption: "A. has",
      explanationStepByStep: [
        "Bước 1: Nhận diện từ 'Seldom' (hiếm khi - trạng từ phủ định) đứng ở đầu câu -> Áp dụng cấu trúc đảo ngữ.",
        "Bước 2: Cấu trúc: Seldom + Trợ động từ + S ('the customer service department') + V3 ('received').",
        "Bước 3: Chủ ngữ 'department' là danh từ số ít -> Trợ động từ của thì hiện tại hoàn thành phải là 'has'.",
        "Kết luận: Chọn (A) has.",
      ],
    },
  },

  collocations: {
    tagCode: "collocations",
    category: "words_phrases",
    categoryVi: "Từ loại & Vị trí",
    titleVi: "Cụm từ cố định (Collocations)",
    taglineVi: "Bảng vàng các cụm từ công sở ETS thường xuyên ra đề",
    estimatedMinutes: 5,
    coreRule: {
      definition:
        "Collocations là các cụm từ thường đi liền với nhau theo thói quen tự nhiên của người bản xứ trong môi trường làm việc công sở. Dạng bài này không dựa vào ngữ pháp máy móc mà dựa vào vốn từ và sự tích lũy cụm từ.",
      keyFormulas: [
        "Động từ + Danh từ: meet the deadline / satisfy requirements / conduct a survey / address concerns",
        "Tính từ + Danh từ: mutual benefit / competitive price / tentative schedule / substantial growth",
        "Trạng từ + Tính từ: highly qualified / conveniently located / readily available",
        "Cụm giới từ: in compliance with / on behalf of / in accordance with",
      ],
      deepInsight:
        "Đừng học từ đơn lẻ! Luôn học cả cụm: Ví dụ thấy 'deadline' -> nhớ ngay động từ 'meet' (kịp hạn) hoặc 'extend' (gia hạn); thấy 'conduct' -> nhớ ngay 'survey / research / inspection'.",
    },
    cheatSheet: [
      {
        signal: "meet the _______",
        rule: "deadline (hạn chót) / demand (nhu cầu) / requirements (yêu cầu)",
        example: "The team worked overtime to meet the tight deadline.",
      },
      {
        signal: "conduct a _______",
        rule: "survey (khảo sát) / study (nghiên cứu) / inspection (thanh tra)",
        example: "Management decided to conduct an employee survey.",
      },
      {
        signal: "conveniently _______",
        rule: "located / situated (tọa lạc ở vị trí thuận tiện)",
        example: "The new branch is conveniently located near the subway.",
      },
      {
        signal: "in compliance with",
        rule: "tuân thủ theo quy định / tiêu chuẩn",
        example: "The factory operates in compliance with safety standards.",
      },
    ],
    traps: [
      {
        title: "Bẫy dịch nghĩa đen từ tiếng Việt sang tiếng Anh",
        trapDescription:
          "Thí sinh người Việt hay dịch 'gặp hạn chót' bằng 'see deadline' hoặc 'chạy kịp hạn' bằng 'run deadline'. Trong tiếng Anh chuẩn bắt buộc là 'meet the deadline'.",
        correctRule: "meet the deadline / satisfy standards.",
        badExample: "We must see the deadline. (SAI)",
        goodExample: "We must meet the deadline. (ĐÚNG)",
      },
    ],
    workedExample: {
      questionStem:
        "The marketing research team will _______ an extensive survey to assess consumer preferences.",
      options: [
        "A. conduct",
        "B. behave",
        "C. proceed",
        "D. act",
      ],
      correctIndex: 0,
      correctOption: "A. conduct",
      explanationStepByStep: [
        "Bước 1: Quan sát tân ngữ sau chỗ trống: 'an extensive survey' (một cuộc khảo sát diện rộng).",
        "Bước 2: Cụm từ cố định trong công sở: 'conduct a survey' có nghĩa là tiến hành một cuộc khảo sát.",
        "Bước 3: Các từ khác: behave (cư xử), proceed (tiếp tục, nội động từ), act (hành động) không đi trực tiếp với tân ngữ survey.",
        "Kết luận: Chọn (A) conduct.",
      ],
    },
  },

  parallel_structure: {
    tagCode: "parallel_structure",
    category: "structures",
    categoryVi: "Cấu trúc & Liên kết",
    titleVi: "Cấu trúc song hành (Parallelism)",
    taglineVi: "Quy tắc đồng dạng giữa các vế nối bởi liên từ kết hợp",
    estimatedMinutes: 4,
    coreRule: {
      definition:
        "Cấu trúc song hành yêu cầu các từ hoặc cụm từ được nối bởi liên từ kết hợp (and, but, or, as well as) hoặc liên từ tương quan (both... and, either... or, neither... nor, not only... but also) phải cùng một dạng ngữ pháp.",
      keyFormulas: [
        "A and/or/but B: Nếu A là Danh từ thì B phải là Danh từ; A là V-ing thì B là V-ing",
        "Both A and B / Either A or B / Neither A nor B: A và B phải hoàn toàn đồng dạng",
        "Not only A but also B: Đồng dạng về mặt cấu trúc ngữ pháp",
      ],
      deepInsight:
        "Tìm liên từ kết hợp (AND, OR, BUT). Nhìn vế trước liên từ để xem nó là dạng gì (Noun, Adj, V-ing, hay To-V). Chỗ trống ở vế sau bắt buộc phải có dạng tương ứng hệt như vậy!",
    },
    cheatSheet: [
      {
        signal: "V-ing, V-ing, and _______",
        rule: "Bắt buộc điền V-ing để đồng dạng cấu trúc",
        example: "The duties include drafting reports, filing invoices, and answering inquiries.",
      },
      {
        signal: "Both Adj and _______",
        rule: "Bắt buộc điền Tính từ (Adj)",
        example: "The software is both reliable and user-friendly.",
      },
    ],
    traps: [
      {
        title: "Bẫy lệch dạng từ loại giữa hai vế của liên từ",
        trapDescription:
          "Ví dụ trước 'and' là tính từ nhưng đáp án lại chọn danh từ hoặc trạng từ.",
        correctRule: "A và B phải đồng đẳng từ loại.",
        badExample: "The campaign was creative and successfully. (SAI: Adj and Adv)",
        goodExample: "The campaign was creative and successful. (ĐÚNG: Adj and Adj)",
      },
    ],
    workedExample: {
      questionStem:
        "The human resources manager is looking for someone who is organized, reliable, and _______.",
      options: [
        "A. enthusiast",
        "B. enthusiastic",
        "C. enthusiasm",
        "D. enthusiastically",
      ],
      correctIndex: 1,
      correctOption: "B. enthusiastic",
      explanationStepByStep: [
        "Bước 1: Nhìn chuỗi liệt kê nối bởi liên từ 'and': 'organized' (tính từ), 'reliable' (tính từ), and _______.",
        "Bước 2: Theo quy tắc cấu trúc song hành (Parallelism), chỗ trống sau 'and' bắt buộc phải là một TÍNH TỪ.",
        "Bước 3: Nhận diện từ loại: (A) enthusiast: danh từ chỉ người; (B) enthusiastic: tính từ đuôi -ic; (C) enthusiasm: danh từ; (D) enthusiastically: trạng từ.",
        "Kết luận: Chọn (B) enthusiastic.",
      ],
    },
  },
};

/**
 * Trả về danh sách tất cả các bài học ngữ pháp sẵn sàng
 */
export function getAllGrammarLessons(): GrammarLesson[] {
  return Object.values(GRAMMAR_LESSONS);
}

/**
 * Lấy chi tiết bài học theo tagCode chuẩn
 */
export function getGrammarLessonByCode(tagCode: string): GrammarLesson | null {
  return GRAMMAR_LESSONS[tagCode] || null;
}

/**
 * Lấy danh sách bài học theo nhóm danh mục
 */
export function getGrammarLessonsByCategory(
  category: GrammarLesson["category"]
): GrammarLesson[] {
  return Object.values(GRAMMAR_LESSONS).filter((l) => l.category === category);
}

/**
 * Kiểm tra xem một tagCode đã có nội dung bài học chi tiết hay chưa
 */
export function hasGrammarLesson(tagCode: string): boolean {
  return tagCode in GRAMMAR_LESSONS;
}
