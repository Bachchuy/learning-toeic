import type { LessonPracticeExercise } from "./lessonExercises";

/**
 * Ngân hàng bài tập bổ sung (kết hợp Chọn đáp án A–D & Điền từ vào chỗ trống)
 * được đối chiếu từ notebook "Ngữ pháp tiếng Anh cơ bản" (English Grammar in Use & Barron's 600 Words)
 * và tài liệu ngữ pháp tham chiếu uy tín, bảo đảm MỌI học phần nhỏ đều có >= 3 câu luyện tập.
 */
export const EXTRA_PRACTICE_EXERCISES: Record<
  string,
  LessonPracticeExercise[]
> = {
  // ================= 1. TENSES (5 mods: 0..4) =================
  tenses: [
    {
      id: "tenses-ex-x1",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Hiện tại tiếp diễn diễn tả việc tạm thời tuần này",
      questionStem:
        "The customer service manager usually reviews return requests in the morning, but this week she _______ an executive conference.",
      wordCue: "attend",
      acceptedAnswers: ["is attending", "'s attending"],
      explanationStepByStep: [
        "Bước 1: Cụm 'but this week' diễn tả sự việc đang diễn ra tạm thời xung quanh hiện tại (khác thói quen 'usually').",
        "Bước 2: Chủ ngữ ngôi thứ 3 số ít 'she' + Hiện tại tiếp diễn → chia 'is attending'.",
        "Đáp án chuẩn: is attending.",
      ],
    },
    {
      id: "tenses-ex-x2",
      moduleIndex: 0,
      skillFocus: "Hiện tại hoàn thành với trạng từ chỉ tần suất kinh nghiệm",
      questionStem:
        "Our regional marketing team _______ three major trade shows in Europe since January.",
      options: [
        "A. attends",
        "B. is attending",
        "C. has attended",
        "D. will attend",
      ],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Mốc 'since January' + số lượng lần ('three major trade shows') kéo dài từ đầu năm đến hiện tại.",
        "Bước 2: Thì Hiện tại hoàn thành với chủ ngữ số ít 'team' (khối thống nhất) → 'has attended'.",
        "Kết luận: Chọn (C) has attended.",
      ],
    },
    {
      id: "tenses-ex-x3",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "Quá khứ hoàn thành trước mốc quá khứ",
      questionStem:
        "Ms. Davis _______ for that accounting firm for five years before she started her own consulting practice.",
      wordCue: "work",
      acceptedAnswers: ["had worked", "had been working"],
      explanationStepByStep: [
        "Bước 1: Hành động làm việc 5 năm xảy ra và hoàn tất TRƯỚC một hành động quá khứ khác ('before she started').",
        "Bước 2: Chia Quá khứ hoàn thành 'had worked' (hoặc nhấn mạnh liên tục 'had been working').",
        "Đáp án chuẩn: had worked.",
      ],
    },
    {
      id: "tenses-ex-x4",
      kind: "fill_blank",
      moduleIndex: 2,
      skillFocus: "Tương lai hoàn thành với By the end of + mốc tương lai",
      questionStem:
        "By the end of next month, our corporate headquarters _______ the annual budget plan for all overseas branches.",
      wordCue: "finalize",
      acceptedAnswers: ["will have finalized"],
      explanationStepByStep: [
        "Bước 1: Dấu hiệu 'By the end of next month' chỉ một hành động hoàn tất trước mốc thời gian trong tương lai.",
        "Bước 2: Công thức Tương lai hoàn thành: 'will have + V3/ed' → 'will have finalized'.",
        "Đáp án chuẩn: will have finalized.",
      ],
    },
    {
      id: "tenses-ex-x5",
      moduleIndex: 2,
      skillFocus: "Phân biệt Be going to (kế hoạch có sẵn) vs Will",
      questionStem:
        "Look at those dark storm clouds gathering near the port; the outdoor launch event _______ be postponed.",
      options: [
        "A. is going to",
        "B. will have",
        "C. has been",
        "D. would be",
      ],
      correctIndex: 0,
      explanationStepByStep: [
        "Bước 1: Có dấu hiệu trực quan rõ ràng ở hiện tại ('Look at those dark storm clouds').",
        "Bước 2: Dự đoán có căn cứ ở hiện tại dùng 'be going to + V-inf'. Phía sau đã có 'be postponed' nên điền 'is going to'.",
        "Kết luận: Chọn (A) is going to.",
      ],
    },
    {
      id: "tenses-ex-x6",
      kind: "fill_blank",
      moduleIndex: 3,
      skillFocus: "Phối hợp Hiện tại hoàn thành + SINCE + Quá khứ đơn (bị động)",
      questionStem:
        "The logistics department has not received any client complaints since the new shipping policy _______ last spring.",
      wordCue: "implement",
      acceptedAnswers: ["was implemented"],
      explanationStepByStep: [
        "Bước 1: Vế trước dùng Hiện tại hoàn thành ('has not received'), mệnh đề sau 'since' chia ở Quá khứ đơn.",
        "Bước 2: 'the new shipping policy' (chính sách giao hàng) là đối tượng được áp dụng → bị động Quá khứ đơn 'was implemented'.",
        "Đáp án chuẩn: was implemented.",
      ],
    },
    {
      id: "tenses-ex-x7",
      kind: "fill_blank",
      moduleIndex: 3,
      skillFocus: "Thói quen quá khứ: Used to + V-inf",
      questionStem:
        "Before electronic spreadsheets became standard, clerks _______ financial balances completely by hand.",
      wordCue: "use / calculate",
      acceptedAnswers: ["used to calculate"],
      explanationStepByStep: [
        "Bước 1: Ngữ cảnh kể về thói quen cũ trong quá khứ ('Before electronic spreadsheets...') nay không còn nữa.",
        "Bước 2: Cấu trúc 'used to + V-inf' → 'used to calculate'.",
        "Đáp án chuẩn: used to calculate.",
      ],
    },
    {
      id: "tenses-ex-x8",
      kind: "fill_blank",
      moduleIndex: 4,
      skillFocus: "Phối hợp By the time + Quá khứ đơn -> Quá khứ hoàn thành",
      questionStem:
        "By the time the delivery truck arrived at the loading bay, the warehouse staff _______ for the day.",
      wordCue: "already / leave",
      acceptedAnswers: ["had already left"],
      explanationStepByStep: [
        "Bước 1: 'By the time + S + V2/ed (arrived)' yêu cầu mệnh đề chính chia ở Quá khứ hoàn thành.",
        "Bước 2: Trạng từ 'already' đứng giữa 'had' và phân từ 3 'left' → 'had already left'.",
        "Đáp án chuẩn: had already left.",
      ],
    },
    {
      id: "tenses-ex-x9",
      moduleIndex: 4,
      skillFocus: "Bẫy Used to + V-inf vs Be/Get used to + V-ing",
      questionStem:
        "Lisa has lived in London for three years, so she is completely used to _______ on the left side of the road.",
      options: ["A. drive", "B. drives", "C. driving", "D. drove"],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Trước chỗ trống là cụm 'be used to' (đã quen với việc gì ở hiện tại).",
        "Bước 2: Chữ 'to' trong 'be/get used to' là giới từ nên đi kèm danh động từ V-ing ('driving').",
        "Kết luận: Chọn (C) driving.",
      ],
    },
  ],

  // ================= 2. WORD FORM (5 mods: 0..4) =================
  word_form: [
    {
      id: "wf-ex-x1",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Danh từ đứng sau mạo từ 'an'",
      questionStem:
        "The two companies reached an _______ after several days of intense negotiations regarding contract terms.",
      wordCue: "AGREE",
      acceptedAnswers: ["agreement"],
      explanationStepByStep: [
        "Bước 1: Chỗ trống đứng sau mạo từ 'an' và ngoại động từ 'reached' nên bắt buộc là danh từ đếm được số ít.",
        "Bước 2: Danh từ của 'agree' là 'agreement' (thỏa thuận), khớp với âm đầu nguyên âm đi sau 'an'.",
        "Đáp án chuẩn: agreement.",
      ],
    },
    {
      id: "wf-ex-x2",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Danh từ đứng sau tính từ sở hữu 'their'",
      questionStem:
        "Many retail customers expressed their _______ with the sudden price increase on household items.",
      wordCue: "DISSATISFY",
      acceptedAnswers: ["dissatisfaction"],
      explanationStepByStep: [
        "Bước 1: Sau tính từ sở hữu 'their' cần một danh từ làm tân ngữ cho động từ 'expressed'.",
        "Bước 2: Danh từ của 'dissatisfy' là 'dissatisfaction' (sự không hài lòng).",
        "Đáp án chuẩn: dissatisfaction.",
      ],
    },
    {
      id: "wf-ex-x3",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "Tính từ đứng giữa mạo từ 'a' và cụm danh từ",
      questionStem:
        "The director emphasized that clear communication is essential to maintain a _______ working relationship with suppliers.",
      wordCue: "PRODUCT",
      acceptedAnswers: ["productive"],
      explanationStepByStep: [
        "Bước 1: Cấu trúc 'a + _______ + working relationship' yêu cầu một tính từ bổ nghĩa cho danh từ phía sau.",
        "Bước 2: Tính từ mang nghĩa 'hiệu quả, có năng suất' từ gốc PRODUCT là 'productive'.",
        "Đáp án chuẩn: productive.",
      ],
    },
    {
      id: "wf-ex-x4",
      moduleIndex: 1,
      skillFocus: "Tính từ đứng sau Linking Verb (remain)",
      questionStem:
        "After the latest software patch, the customer billing portal remained _______ throughout the holiday rush.",
      options: [
        "A. operate",
        "B. operational",
        "C. operationally",
        "D. operation",
      ],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Động từ nối 'remained' (duy trì trạng thái) đòi hỏi một TÍNH TỪ theo sau.",
        "Bước 2: (B) operational (hoạt động trơn tru, có thể vận hành) là tính từ; (C) trạng từ, (D) danh từ.",
        "Kết luận: Chọn (B) operational.",
      ],
    },
    {
      id: "wf-ex-x5",
      kind: "fill_blank",
      moduleIndex: 2,
      skillFocus: "Trạng từ thể cách bổ nghĩa cho động từ thường",
      questionStem:
        "The human resources associate spoke _______ to the press to avoid misrepresenting the updated pension policy.",
      wordCue: "CAUTION",
      acceptedAnswers: ["cautiously"],
      explanationStepByStep: [
        "Bước 1: Cần một trạng từ bổ nghĩa cho hành động 'spoke' (nói như thế nào).",
        "Bước 2: Tính từ của 'caution' là 'cautious' → trạng từ đuôi -ly là 'cautiously' (một cách thận trọng).",
        "Đáp án chuẩn: cautiously.",
      ],
    },
    {
      id: "wf-ex-x6",
      moduleIndex: 2,
      skillFocus: "Trạng từ đứng giữa Be và Quá khứ phân từ (V3)",
      questionStem:
        "Warranties for this model of industrial printer are _______ limited in their overseas coverage.",
      options: ["A. frequency", "B. frequent", "C. frequently", "D. frequented"],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Chỗ trống nằm giữa động từ 'are' và phân từ 'limited' (be + ADV + V3/Adj).",
        "Bước 2: Cần điền trạng từ đuôi -ly → 'frequently'.",
        "Kết luận: Chọn (C) frequently.",
      ],
    },
    {
      id: "wf-ex-x7",
      kind: "fill_blank",
      moduleIndex: 3,
      skillFocus: "Động từ nguyên mẫu sau 'be obligated to'",
      questionStem:
        "Under the updated warranty terms, the manufacturer is obligated to _______ any defective components without extra charge.",
      wordCue: "REPLACEMENT",
      acceptedAnswers: ["replace"],
      explanationStepByStep: [
        "Bước 1: Sau cấu trúc 'be obligated to' cần một động từ nguyên mẫu (V-bare).",
        "Bước 2: Động từ gốc của danh từ 'replacement' là 'replace' (thay thế).",
        "Đáp án chuẩn: replace.",
      ],
    },
    {
      id: "wf-ex-x8",
      moduleIndex: 3,
      skillFocus: "Nhận diện hậu tố Động từ (-ize / -ify / -ate)",
      questionStem:
        "To prepare for the annual audit, the accounting department must _______ all electronic expense receipts by Friday.",
      options: ["A. category", "B. categorical", "C. categorize", "D. categorization"],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Sau động từ khuyết thiếu 'must' cần một ĐỘNG TỪ nguyên mẫu.",
        "Bước 2: Hậu tố '-ize' tạo động từ → 'categorize' (phân loại).",
        "Kết luận: Chọn (C) categorize.",
      ],
    },
    {
      id: "wf-ex-x9",
      kind: "fill_blank",
      moduleIndex: 4,
      skillFocus: "Danh từ đứng sau tính từ sở hữu + tính từ",
      questionStem:
        "The keynote speaker's unexpected _______ at the afternoon workshop created a lot of excitement among the attendees.",
      wordCue: "ARRIVE",
      acceptedAnswers: ["arrival"],
      explanationStepByStep: [
        "Bước 1: Cụm chủ ngữ 'The keynote speaker's unexpected _______' cần một DANH TỪ đứng làm trung tâm.",
        "Bước 2: Danh từ của động từ 'arrive' là 'arrival' (sự xuất hiện/đến nơi).",
        "Đáp án chuẩn: arrival.",
      ],
    },
    {
      id: "wf-ex-x10",
      moduleIndex: 4,
      skillFocus: "Cấu trúc Keep / Make / Find + Object + ADJECTIVE",
      questionStem:
        "The compliance manual reminds staff to keep all client banking credentials strictly _______.",
      options: [
        "A. confidentiality",
        "B. confidential",
        "C. confidentially",
        "D. confide",
      ],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Cấu trúc 'keep + Object (credentials) + ADJECTIVE' dùng tính từ miêu tả trạng thái của tân ngữ.",
        "Bước 2: Trạng từ 'strictly' đứng trước để nhấn mạnh cho tính từ 'confidential' (bảo mật).",
        "Kết luận: Chọn (B) confidential.",
      ],
    },
  ],

  // ================= 3. SUBJECT-VERB AGREEMENT (5 mods: 0..4) =================
  subject_verb: [
    {
      id: "sv-ex-x1",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Chia động từ số ít qua cụm giới từ chèn giữa",
      questionStem:
        "A compilation of quarterly sales reports _______ led the board to adjust its distribution strategy.",
      wordCue: "has / have",
      acceptedAnswers: ["has"],
      explanationStepByStep: [
        "Bước 1: Gạch bỏ cụm giới từ chèn giữa 'of quarterly sales reports'. Chủ ngữ chính là danh từ số ít 'A compilation'.",
        "Bước 2: Chủ ngữ số ít đi với trợ động từ 'has' ('has led').",
        "Đáp án chuẩn: has.",
      ],
    },
    {
      id: "sv-ex-x2",
      moduleIndex: 0,
      skillFocus: "Chủ ngữ tách bởi Mệnh đề quan hệ chèn giữa",
      questionStem:
        "The manufacturing plant that suffered minor flood damage last autumn _______ now fully operational.",
      options: ["A. are", "B. were", "C. is", "D. have been"],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Gạch bỏ mệnh đề quan hệ chèn giữa 'that suffered minor flood damage last autumn'.",
        "Bước 2: Chủ ngữ chính là 'The manufacturing plant' (số ít) + dấu hiệu 'now' → chọn 'is'.",
        "Kết luận: Chọn (C) is.",
      ],
    },
    {
      id: "sv-ex-x3",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "Each of + N(số nhiều) luôn chia động từ số ít",
      questionStem:
        "Each of the participants entering the regional seminar _______ given a personalized welcome folder upon arrival.",
      wordCue: "was / were",
      acceptedAnswers: ["was"],
      explanationStepByStep: [
        "Bước 1: Cụm chủ ngữ bắt đầu bằng 'Each of + N(số nhiều)' luôn mang nghĩa từng cá nhân riêng lẻ → chia số ít.",
        "Bước 2: Chọn động từ to be số ít ở quá khứ 'was'.",
        "Đáp án chuẩn: was.",
      ],
    },
    {
      id: "sv-ex-x4",
      kind: "fill_blank",
      moduleIndex: 2,
      skillFocus: "Neither A nor B chia động từ theo chủ ngữ B gần nhất",
      questionStem:
        "Neither the marketing director nor the sales associates _______ satisfied with the initial campaign results.",
      wordCue: "was / were",
      acceptedAnswers: ["were"],
      explanationStepByStep: [
        "Bước 1: Quy tắc 'Neither A nor B' chia động từ theo chủ ngữ B đứng liền kề.",
        "Bước 2: Chủ ngữ B là 'the sales associates' (danh từ số nhiều) → chia 'were'.",
        "Đáp án chuẩn: were.",
      ],
    },
    {
      id: "sv-ex-x5",
      moduleIndex: 2,
      skillFocus: "Either A or B chia theo chủ ngữ gần động từ nhất",
      questionStem:
        "Either the regional offices or the central warehouse _______ expected to ship the spare parts today.",
      options: ["A. are", "B. is", "C. were", "D. have"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Cấu trúc 'Either A or B' chia động từ theo chủ ngữ gần nhất là B ('the central warehouse' — số ít).",
        "Bước 2: Chọn 'is' ('is expected to ship').",
        "Kết luận: Chọn (B) is.",
      ],
    },
    {
      id: "sv-ex-x6",
      kind: "fill_blank",
      moduleIndex: 3,
      skillFocus: "Danh từ tập hợp (committee) chia số ít khi thống nhất hành động",
      questionStem:
        "The executive committee _______ approved the budget allocation for the new research laboratory.",
      wordCue: "has / have",
      acceptedAnswers: ["has"],
      explanationStepByStep: [
        "Bước 1: 'The executive committee' (ủy ban điều hành) hành động như một tập thể thống nhất ra quyết định.",
        "Bước 2: Chia động từ số ít → 'has'.",
        "Đáp án chuẩn: has.",
      ],
    },
    {
      id: "sv-ex-x7",
      kind: "fill_blank",
      moduleIndex: 3,
      skillFocus: "There is / There are theo cụm danh từ không đếm được phía sau",
      questionStem:
        "There _______ a large amount of research data that needs to be verified before Friday's board meeting.",
      wordCue: "is / are",
      acceptedAnswers: ["is"],
      explanationStepByStep: [
        "Bước 1: Trong cấu trúc 'There + be', động từ chia theo danh từ thật đứng ngay sau nó.",
        "Bước 2: 'a large amount of research data' là cụm danh từ không đếm được → chia số ít 'is'.",
        "Đáp án chuẩn: is.",
      ],
    },
    {
      id: "sv-ex-x8",
      kind: "fill_blank",
      moduleIndex: 4,
      skillFocus: "Phân biệt The number of (số ít) vs A number of (số nhiều)",
      questionStem:
        "The number of international visitors at our flagship branch _______ increased steadily this quarter.",
      wordCue: "has / have",
      acceptedAnswers: ["has"],
      explanationStepByStep: [
        "Bước 1: Cụm 'The number of + N(số nhiều)' chỉ 'số lượng...' → luôn chia động từ SỐ ÍT.",
        "Bước 2: Chọn 'has' ('has increased').",
        "Đáp án chuẩn: has.",
      ],
    },
    {
      id: "sv-ex-x9",
      moduleIndex: 4,
      skillFocus: "Together with / Along with chia theo Chủ ngữ A",
      questionStem:
        "The revised partnership agreement, together with all associated invoices, _______ delivered to accounting yesterday.",
      options: ["A. were", "B. are", "C. was", "D. have been"],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Thành phần giữa hai dấu phẩy 'together with all associated invoices' là cụm phụ bổ sung, không làm thay đổi chủ ngữ chính.",
        "Bước 2: Chủ ngữ A là 'The revised partnership agreement' (số ít) + dấu hiệu 'yesterday' → chọn 'was'.",
        "Kết luận: Chọn (C) was.",
      ],
    },
  ],

  // ================= 4. PASSIVE VOICE (4 mods: 0..3) =================
  passive_voice: [
    {
      id: "pv-ex-x1",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Bị động Quá khứ đơn với chủ ngữ số nhiều",
      questionStem:
        "The promotional brochures _______ by a local printing firm yesterday and are ready for distribution.",
      wordCue: "print",
      acceptedAnswers: ["were printed"],
      explanationStepByStep: [
        "Bước 1: Chủ ngữ 'The promotional brochures' (số nhiều) chịu tác động ('by a local printing firm') + mốc thời gian quá khứ 'yesterday'.",
        "Bước 2: Công thức Quá khứ đơn bị động số nhiều: 'were + V3/ed' → 'were printed'.",
        "Đáp án chuẩn: were printed.",
      ],
    },
    {
      id: "pv-ex-x2",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Bị động với Động từ khuyết thiếu (must be + V3)",
      questionStem:
        "All confidential financial records must _______ in a locked cabinet overnight.",
      wordCue: "keep",
      acceptedAnswers: ["be kept"],
      explanationStepByStep: [
        "Bước 1: Sau động từ khuyết thiếu 'must' với chủ ngữ chỉ vật ('records') cần dạng bị động.",
        "Bước 2: Công thức: 'must + be + V3' → 'be kept' (phân từ 3 của keep là kept).",
        "Đáp án chuẩn: be kept.",
      ],
    },
    {
      id: "pv-ex-x3",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "Thể truyền khiến bị động: have + vật + V3/ed",
      questionStem:
        "The office manager had the air-conditioning system _______ by a certified technician last Friday.",
      wordCue: "service",
      acceptedAnswers: ["serviced"],
      explanationStepByStep: [
        "Bước 1: Cấu trúc nhờ/thuê làm gì bị động: 'have + something (air-conditioning system) + V3/ed'.",
        "Bước 2: Động từ 'service' là động từ có quy tắc → thêm -ed thành 'serviced'.",
        "Đáp án chuẩn: serviced.",
      ],
    },
    {
      id: "pv-ex-x4",
      moduleIndex: 1,
      skillFocus: "Bị động với Động từ 2 tân ngữ (offer / give / show)",
      questionStem:
        "I did not see the original signed agreement, but I _______ a certified copy by the legal assistant.",
      options: ["A. showed", "B. was shown", "C. showing", "D. have shown"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Động từ 'show' có 2 tân ngữ; chủ ngữ 'I' là người được cho xem ('by the legal assistant').",
        "Bước 2: Bị động Quá khứ đơn với 'I' → 'was shown'.",
        "Kết luận: Chọn (B) was shown.",
      ],
    },
    {
      id: "pv-ex-x5",
      kind: "fill_blank",
      moduleIndex: 2,
      skillFocus: "Cấu trúc bị động lịch trình: be scheduled + to-V",
      questionStem:
        "The keynote speaker is scheduled _______ her presentation on market competition at 10:00 A.M. tomorrow.",
      wordCue: "deliver",
      acceptedAnswers: ["to deliver"],
      explanationStepByStep: [
        "Bước 1: Cấu trúc 'be scheduled + to + V-inf' (được lên lịch làm gì).",
        "Bước 2: Chủ ngữ 'speaker' là người chủ động trình bày ('her presentation') → dùng 'to deliver'.",
        "Đáp án chuẩn: to deliver.",
      ],
    },
    {
      id: "pv-ex-x6",
      kind: "fill_blank",
      moduleIndex: 2,
      skillFocus: "Bị động nguyên mẫu: be expected + to be V3",
      questionStem:
        "New safety measures are expected _______ by the manufacturing division before the end of the week.",
      wordCue: "implement",
      acceptedAnswers: ["to be implemented"],
      explanationStepByStep: [
        "Bước 1: Cấu trúc 'be expected + to-V'. Tuy nhiên chủ ngữ 'New safety measures' (các biện pháp) là đối tượng được áp dụng ('by the division').",
        "Bước 2: Do mang nghĩa bị động sau 'expected', dùng nguyên mẫu bị động 'to be implemented'.",
        "Đáp án chuẩn: to be implemented.",
      ],
    },
    {
      id: "pv-ex-x7",
      kind: "fill_blank",
      moduleIndex: 3,
      skillFocus: "Bị động thì Hiện tại tiếp diễn (is being + V3)",
      questionStem:
        "The revised merger proposal _______ by the executive committee right now.",
      wordCue: "review",
      acceptedAnswers: ["is being reviewed"],
      explanationStepByStep: [
        "Bước 1: Dấu hiệu 'right now' chỉ hành động đang diễn ra ở hiện tại; chủ ngữ vật 'proposal' không tự xem xét ('by the committee').",
        "Bước 2: Hiện tại tiếp diễn bị động số ít → 'is being reviewed'.",
        "Đáp án chuẩn: is being reviewed.",
      ],
    },
    {
      id: "pv-ex-x8",
      moduleIndex: 3,
      skillFocus: "Bẫy nội động từ (occur/happen/arrive) không có bị động",
      questionStem:
        "A minor power outage _______ in the third-floor server room shortly after midnight yesterday.",
      options: [
        "A. was occurred",
        "B. occurred",
        "C. has been occurred",
        "D. is occurring",
      ],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Động từ 'occur' (xảy ra) là nội động từ không có tân ngữ nên TUYỆT ĐỐI không chia ở dạng bị động ('was occurred' luôn sai).",
        "Bước 2: Có mốc 'yesterday' → chọn Quá khứ đơn chủ động 'occurred'.",
        "Kết luận: Chọn (B) occurred.",
      ],
    },
  ],

  // ================= 5. CONJUNCTIONS & PREPOSITIONS (4 mods: 0..3) =================
  conjunctions_prepositions: [
    {
      id: "cp-ex-x1",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Giới từ tương phản Despite + V-ing / Cụm danh từ",
      questionStem:
        "_______ receiving slightly lower revenues this quarter, the retail brand continued expanding into new cities.",
      wordCue: "Although / Despite",
      acceptedAnswers: ["despite"],
      explanationStepByStep: [
        "Bước 1: Theo sau chỗ trống là cụm danh động từ 'receiving slightly lower revenues...' (không có chủ ngữ + động từ chia thì).",
        "Bước 2: 'Although' chỉ đi với mệnh đề (S + V); giới từ 'Despite' đi với cụm danh từ / V-ing.",
        "Đáp án chuẩn: Despite.",
      ],
    },
    {
      id: "cp-ex-x2",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Liên từ nguyên nhân Because + Mệnh đề (S + V)",
      questionStem:
        "The workshop on tax deductions was postponed _______ the guest speaker was delayed by heavy traffic.",
      wordCue: "because / because of",
      acceptedAnswers: ["because"],
      explanationStepByStep: [
        "Bước 1: Phía sau chỗ trống là một mệnh đề hoàn chỉnh gồm Chủ ngữ 'the guest speaker' + Động từ 'was delayed'.",
        "Bước 2: Dùng liên từ 'because' trước mệnh đề (loại 'because of' vì là giới từ).",
        "Đáp án chuẩn: because.",
      ],
    },
    {
      id: "cp-ex-x3",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "Phân biệt Giới từ hạn chót 'by' vs 'until'",
      questionStem:
        "All departmental expense reports must be submitted to the accounting office _______ 5:00 P.M. on Friday.",
      wordCue: "by / until",
      acceptedAnswers: ["by"],
      explanationStepByStep: [
        "Bước 1: Hành động 'must be submitted' (phải nộp) diễn ra một lần, hoàn tất chậm nhất tại thời hạn chót.",
        "Bước 2: Chỉ hạn chót (deadline) dùng giới từ 'by'.",
        "Đáp án chuẩn: by.",
      ],
    },
    {
      id: "cp-ex-x4",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "Phân biệt During + Sự kiện vs For + Khoảng thời gian",
      questionStem:
        "Dr. Kelly will be attending international medical conferences in Europe _______ two consecutive weeks.",
      wordCue: "during / for",
      acceptedAnswers: ["for"],
      explanationStepByStep: [
        "Bước 1: Phía sau chỗ trống là khoảng thời gian đo đếm được ('two consecutive weeks' — 2 tuần liên tiếp).",
        "Bước 2: Đi với khoảng thời gian có số đếm dùng giới từ 'for' ('during' chỉ đi với danh từ sự kiện/kỳ hạn).",
        "Đáp án chuẩn: for.",
      ],
    },
    {
      id: "cp-ex-x5",
      kind: "fill_blank",
      moduleIndex: 2,
      skillFocus: "Liên từ dự phòng 'in case' vs điều kiện phủ định 'unless'",
      questionStem:
        "You should keep a backup copy of the financial spreadsheet _______ the company server experiences downtime.",
      wordCue: "unless / in case",
      acceptedAnswers: ["in case"],
      explanationStepByStep: [
        "Bước 1: Hành động sao lưu dữ liệu được thực hiện trước nhằm phòng ngừa rủi ro có thể xảy ra sau đó.",
        "Bước 2: Mang nghĩa 'phòng khi, đề phòng' dùng 'in case' (không dùng 'unless' = trừ khi).",
        "Đáp án chuẩn: in case.",
      ],
    },
    {
      id: "cp-ex-x6",
      moduleIndex: 2,
      skillFocus: "Provided that / As long as + Hiện tại đơn (không dùng Will)",
      questionStem:
        "Employees may request remote work on Fridays provided that all project milestones _______ on schedule.",
      options: ["A. meet", "B. will be met", "C. are met", "D. would meet"],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: 'provided that' là liên từ điều kiện tương đương 'if', nên mệnh đề sau nó KHÔNG chia 'will/would'.",
        "Bước 2: Chủ ngữ 'all project milestones' (các cột mốc) mang nghĩa bị động ở hiện tại → 'are met'.",
        "Kết luận: Chọn (C) are met.",
      ],
    },
    {
      id: "cp-ex-x7",
      kind: "fill_blank",
      moduleIndex: 3,
      skillFocus: "Unless (= If not) trong câu điều kiện",
      questionStem:
        "The regional branch will have to reduce operating hours _______ sales performance improves next month.",
      wordCue: "unless / although",
      acceptedAnswers: ["unless"],
      explanationStepByStep: [
        "Bước 1: Mệnh đề sau chia khẳng định 'sales performance improves', mang nghĩa 'trừ phi / nếu không cải thiện'.",
        "Bước 2: Liên từ mang nghĩa 'trừ phi' (= if not) là 'unless'.",
        "Đáp án chuẩn: unless.",
      ],
    },
    {
      id: "cp-ex-x8",
      moduleIndex: 3,
      skillFocus: "While (+ V-ing/Mệnh đề) vs During (+ Danh từ sự kiện)",
      questionStem:
        "Please keep your mobile devices switched to silent mode _______ the keynote presentation.",
      options: ["A. while", "B. during", "C. since", "D. until"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Sau chỗ trống là cụm danh từ chỉ sự kiện 'the keynote presentation' (không có động từ).",
        "Bước 2: Trước danh từ chỉ sự kiện dùng giới từ 'during' (loại 'while').",
        "Kết luận: Chọn (B) during.",
      ],
    },
  ],

  // ================= 6. GERUND & INFINITIVE (6 mods: 0..5) =================
  gerund_infinitive: [
    {
      id: "gi-ex-x1",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Động từ bắt buộc đi với To-V (decide)",
      questionStem:
        "The executive committee decided _______ the product launch until market research data was finalized.",
      wordCue: "postpone",
      acceptedAnswers: ["to postpone"],
      explanationStepByStep: [
        "Bước 1: Động từ 'decide' (quyết định) theo sau bắt buộc bằng động từ nguyên mẫu có 'to'.",
        "Bước 2: 'decide + to-V' → 'to postpone'.",
        "Đáp án chuẩn: to postpone.",
      ],
    },
    {
      id: "gi-ex-x2",
      moduleIndex: 0,
      skillFocus: "Nhóm động từ cam kết / hứa / từ chối + To-V",
      questionStem:
        "The logistics vendor promised _______ all replacement components to our central warehouse within 48 hours.",
      options: ["A. deliver", "B. delivering", "C. to deliver", "D. delivered"],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Động từ 'promise' (hứa hẹn) luôn đi kèm cấu trúc 'promise + to + V-inf'.",
        "Bước 2: Chọn (C) to deliver.",
      ],
    },
    {
      id: "gi-ex-x3",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "Động từ cân nhắc / đề xuất + V-ing (consider / recommend)",
      questionStem:
        "Management is currently considering _______ the downtown branch to a larger commercial building.",
      wordCue: "relocate",
      acceptedAnswers: ["relocating"],
      explanationStepByStep: [
        "Bước 1: Động từ 'consider' (cân nhắc) bắt buộc theo sau là danh động từ (V-ing).",
        "Bước 2: Bỏ -e cuối 'relocate' và thêm -ing → 'relocating'.",
        "Đáp án chuẩn: relocating.",
      ],
    },
    {
      id: "gi-ex-x4",
      moduleIndex: 1,
      skillFocus: "Động từ cảm kích / trì hoãn + V-ing (appreciate / postpone)",
      questionStem:
        "We sincerely appreciate your _______ the online customer satisfaction survey before Friday.",
      options: [
        "A. complete",
        "B. completed",
        "C. completing",
        "D. to complete",
      ],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Động từ 'appreciate' (cảm kích) bắt buộc đi kèm V-ing (có thể có tính từ sở hữu 'your' đứng trước V-ing).",
        "Bước 2: Chọn (C) completing.",
      ],
    },
    {
      id: "gi-ex-x5",
      kind: "fill_blank",
      moduleIndex: 2,
      skillFocus: "Cụm cố định có giới từ 'to': look forward to + V-ing",
      questionStem:
        "We look forward to _______ your detailed feedback regarding the revised partnership agreement.",
      wordCue: "receive",
      acceptedAnswers: ["receiving"],
      explanationStepByStep: [
        "Bước 1: Cụm 'look forward to' có 'to' là GIỚI TỪ chứ không phải to-infinitive.",
        "Bước 2: Sau giới từ luôn dùng danh động từ V-ing → 'receiving'.",
        "Đáp án chuẩn: receiving.",
      ],
    },
    {
      id: "gi-ex-x6",
      kind: "fill_blank",
      moduleIndex: 3,
      skillFocus: "Remember + V-ing (nhớ việc đã làm trong quá khứ)",
      questionStem:
        "The HR manager clearly remembers _______ that candidate at last year's job fair, though she forgot his surname.",
      wordCue: "meet",
      acceptedAnswers: ["meeting"],
      explanationStepByStep: [
        "Bước 1: Cụm 'at last year's job fair' cho thấy đây là hồi ức về sự việc ĐÃ XẢY RA.",
        "Bước 2: 'remember + V-ing' diễn tả việc nhớ lại chuyện đã làm → 'meeting'.",
        "Đáp án chuẩn: meeting.",
      ],
    },
    {
      id: "gi-ex-x7",
      kind: "fill_blank",
      moduleIndex: 3,
      skillFocus: "Stop + to-V (tạm dừng việc đang làm ĐỂ làm việc khác)",
      questionStem:
        "After three hours of contract negotiations, the team stopped _______ lunch before resuming work.",
      wordCue: "have",
      acceptedAnswers: ["to have"],
      explanationStepByStep: [
        "Bước 1: Sau ba tiếng họp liên tục, nhóm tạm dừng cuộc họp lại ĐỂ đi ăn trưa rồi mới làm tiếp.",
        "Bước 2: Diễn tả mục đích dừng lại để làm việc khác dùng 'stop + to-V' → 'to have'.",
        "Đáp án chuẩn: to have.",
      ],
    },
    {
      id: "gi-ex-x8",
      kind: "fill_blank",
      moduleIndex: 4,
      skillFocus: "Thành ngữ have difficulty (in) + V-ing",
      questionStem:
        "The audit team had difficulty _______ several misplaced shipping receipts in the digital archive.",
      wordCue: "locate",
      acceptedAnswers: ["locating"],
      explanationStepByStep: [
        "Bước 1: Cấu trúc chuẩn: 'have difficulty / trouble (in) + V-ing'.",
        "Bước 2: Chuyển 'locate' sang V-ing → 'locating'.",
        "Đáp án chuẩn: locating.",
      ],
    },
    {
      id: "gi-ex-x9",
      kind: "fill_blank",
      moduleIndex: 4,
      skillFocus: "Thành ngữ there is no point in + V-ing",
      questionStem:
        "There is no point in _______ about the shipping delay because the cargo truck has already departed.",
      wordCue: "complain",
      acceptedAnswers: ["complaining"],
      explanationStepByStep: [
        "Bước 1: Cụm thành ngữ 'there is no point in + V-ing' (vô ích khi làm gì).",
        "Bước 2: Sau giới từ 'in' dùng danh động từ 'complaining'.",
        "Đáp án chuẩn: complaining.",
      ],
    },
    {
      id: "gi-ex-x10",
      kind: "fill_blank",
      moduleIndex: 5,
      skillFocus: "Cụm spend time + V-ing",
      questionStem:
        "The IT specialist spent two full hours _______ to restore the damaged database index.",
      wordCue: "try",
      acceptedAnswers: ["trying"],
      explanationStepByStep: [
        "Bước 1: Cấu trúc 'spend + time/money + (on) + V-ing'.",
        "Bước 2: Chia V-ing cho 'try' → 'trying'.",
        "Đáp án chuẩn: trying.",
      ],
    },
    {
      id: "gi-ex-x11",
      moduleIndex: 5,
      skillFocus: "Phân biệt Regret + to-V (tiếc phải báo) vs V-ing (hối hận)",
      questionStem:
        "We regret _______ you that your membership renewal request could not be processed due to an expired card.",
      options: ["A. informing", "B. inform", "C. to inform", "D. informed"],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Trong văn phong thư từ kinh doanh trang trọng, cấu trúc 'regret to inform / tell / say' nghĩa là 'lấy làm tiếc phải thông báo tin không vui'.",
        "Bước 2: Chọn (C) to inform.",
      ],
    },
  ],

  // ================= 7. PARTICIPLES (3 mods: 0..2) =================
  participles: [
    {
      id: "part-ex-x1",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Tính từ phân từ đuôi -ing miêu tả tính chất sự vật",
      questionStem:
        "The financial consultant delivered a very _______ presentation that persuaded all members of the board.",
      wordCue: "convince",
      acceptedAnswers: ["convincing"],
      explanationStepByStep: [
        "Bước 1: Chỗ trống bổ nghĩa cho danh từ chỉ vật 'presentation' (bài thuyết trình mang tính thuyết phục).",
        "Bước 2: Tính từ phân từ miêu tả tính chất chủ động của sự vật dùng đuôi -ing → 'convincing'.",
        "Đáp án chuẩn: convincing.",
      ],
    },
    {
      id: "part-ex-x2",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Tính từ phân từ đuôi -ed miêu tả cảm xúc của con người",
      questionStem:
        "Many staff members felt _______ with management's decision to postpone the annual training retreat.",
      wordCue: "disappoint",
      acceptedAnswers: ["disappointed"],
      explanationStepByStep: [
        "Bước 1: Chỗ trống miêu tả cảm xúc chủ quan của con người ('Many staff members felt...').",
        "Bước 2: Tả cảm xúc con người dùng tính từ phân từ đuôi -ed → 'disappointed'.",
        "Đáp án chuẩn: disappointed.",
      ],
    },
    {
      id: "part-ex-x3",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "Rút gọn mệnh đề quan hệ bị động (V3/ed)",
      questionStem:
        "Any merchandise _______ during transit will be replaced by the supplier free of charge.",
      wordCue: "damage",
      acceptedAnswers: ["damaged"],
      explanationStepByStep: [
        "Bước 1: Rút gọn từ mệnh đề đầy đủ 'Any merchandise that is damaged during transit...'.",
        "Bước 2: Bỏ 'that is', giữ lại quá khứ phân từ bị động → 'damaged'.",
        "Đáp án chuẩn: damaged.",
      ],
    },
    {
      id: "part-ex-x4",
      kind: "fill_blank",
      moduleIndex: 2,
      skillFocus: "Rút gọn mệnh đề quan hệ chủ động (V-ing)",
      questionStem:
        "The supervisor spoke directly to the technicians _______ the new accounting software on the third floor.",
      wordCue: "install",
      acceptedAnswers: ["installing"],
      explanationStepByStep: [
        "Bước 1: Rút gọn từ mệnh đề chủ động 'the technicians who are installing the new accounting software'.",
        "Bước 2: Lược bỏ 'who are', giữ lại hiện tại phân từ → 'installing'.",
        "Đáp án chuẩn: installing.",
      ],
    },
    {
      id: "part-ex-x5",
      moduleIndex: 2,
      skillFocus: "Phân biệt Động từ chính vs Cụm phân từ rút gọn",
      questionStem:
        "The new safety guidelines _______ by the oversight board last Friday will take effect next week.",
      options: ["A. approving", "B. approved", "C. were approved", "D. approve"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Câu đã có động từ chia thì chính là 'will take effect' → cụm trước đó chỉ là bổ nghĩa rút gọn.",
        "Bước 2: 'guidelines' được phê duyệt ('by the oversight board') nên dùng rút gọn bị động 'approved'.",
        "Kết luận: Chọn (B) approved.",
      ],
    },
  ],

  // ================= 8. RELATIVE CLAUSES (4 mods: 0..3) =================
  relative_clauses: [
    {
      id: "rc-ex-x1",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Đại từ sở hữu quan hệ WHOSE trước danh từ",
      questionStem:
        "We are looking for an experienced graphic designer _______ portfolio demonstrates strong branding expertise.",
      wordCue: "who / whose",
      acceptedAnswers: ["whose"],
      explanationStepByStep: [
        "Bước 1: Trước chỗ trống là danh từ 'designer', sau chỗ trống là danh từ 'portfolio' (hồ sơ của nhà thiết kế).",
        "Bước 2: Chỉ quan hệ sở hữu dùng đại từ quan hệ 'whose'.",
        "Đáp án chuẩn: whose.",
      ],
    },
    {
      id: "rc-ex-x2",
      moduleIndex: 0,
      skillFocus: "Phân biệt WHO (làm Chủ ngữ + Verb) vs WHOM (+ S + V)",
      questionStem:
        "The systems engineer _______ developed our automated billing software received an innovation award.",
      options: ["A. whom", "B. whose", "C. which", "D. who"],
      correctIndex: 3,
      explanationStepByStep: [
        "Bước 1: Danh từ tiền ngữ là người ('The systems engineer'), ngay sau chỗ trống là động từ chia thì 'developed'.",
        "Bước 2: Cần đại từ làm chủ ngữ chỉ người → chọn (D) who.",
      ],
    },
    {
      id: "rc-ex-x3",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "Mệnh đề quan hệ không xác định sau dấu phẩy (chỉ vật)",
      questionStem:
        "The central logistics hub, _______ was constructed two years ago, processes thousands of parcels daily.",
      wordCue: "that / which",
      acceptedAnswers: ["which"],
      explanationStepByStep: [
        "Bước 1: Có dấu phẩy tách biệt mệnh đề quan hệ không xác định bổ nghĩa cho danh từ chỉ vật ('hub').",
        "Bước 2: Tuyệt đối KHÔNG dùng 'that' sau dấu phẩy → bắt buộc dùng 'which'.",
        "Đáp án chuẩn: which.",
      ],
    },
    {
      id: "rc-ex-x4",
      moduleIndex: 1,
      skillFocus: "Cấm dùng THAT ngay sau Giới từ",
      questionStem:
        "The consulting agency with _______ we signed a three-year contract is headquartered in Singapore.",
      options: ["A. that", "B. what", "C. which", "D. whose"],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Ngay trước chỗ trống là giới từ 'with', danh từ tiền ngữ là 'agency' (tổ chức/vật).",
        "Bước 2: Sau giới từ chỉ vật chỉ được dùng 'which' (tuyệt đối cấm 'that').",
        "Kết luận: Chọn (C) which.",
      ],
    },
    {
      id: "rc-ex-x5",
      kind: "fill_blank",
      moduleIndex: 2,
      skillFocus: "Giới từ đi trước Đại từ quan hệ chỉ người (to whom)",
      questionStem:
        "The senior sales consultant to _______ you sent the inquiry is currently out of the office.",
      wordCue: "who / whom",
      acceptedAnswers: ["whom"],
      explanationStepByStep: [
        "Bước 1: Ngay trước chỗ trống có giới từ 'to', danh từ chỉ người là 'consultant'.",
        "Bước 2: Sau giới từ chỉ người bắt buộc dùng tân ngữ 'whom' (không dùng 'who').",
        "Đáp án chuẩn: whom.",
      ],
    },
    {
      id: "rc-ex-x6",
      kind: "fill_blank",
      moduleIndex: 3,
      skillFocus: "Trạng từ quan hệ nơi chốn WHERE (= in which)",
      questionStem:
        "The hotel conference hall _______ the annual shareholder meeting was held offers modern audiovisual equipment.",
      wordCue: "where / which",
      acceptedAnswers: ["where", "in which"],
      explanationStepByStep: [
        "Bước 1: Mệnh đề sau ('the annual shareholder meeting was held') đã đủ chủ ngữ và động từ bị động (thiếu trạng ngữ chỉ địa điểm).",
        "Bước 2: Dùng trạng từ quan hệ 'where' (hoặc 'in which').",
        "Đáp án chuẩn: where.",
      ],
    },
    {
      id: "rc-ex-x7",
      moduleIndex: 3,
      skillFocus: "Đại từ quan hệ làm chủ ngữ cho danh từ chỉ vật",
      questionStem:
        "Legal counsel reviewed the contract clauses _______ had caused disputes between the two partners.",
      options: ["A. who", "B. whom", "C. which", "D. where"],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Danh từ phía trước là sự vật ('contract clauses'), phía sau thiếu chủ ngữ cho động từ 'had caused'.",
        "Bước 2: Chọn đại từ quan hệ chỉ vật làm chủ ngữ → (C) which.",
      ],
    },
  ],

  // ================= 9. CONDITIONALS & SUBJUNCTIVE (4 mods: 0..3) =================
  conditionals: [
    {
      id: "cond-ex-x1",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Đảo ngữ Câu điều kiện Loại 1 với SHOULD",
      questionStem:
        "_______ you require any additional details regarding warranty coverage, please contact our office.",
      wordCue: "Should / If",
      acceptedAnswers: ["should"],
      explanationStepByStep: [
        "Bước 1: Chủ ngữ 'you' đứng trước động từ nguyên mẫu 'require' (nếu có 'If', không có cấu trúc đảo hay câu mệnh lệnh trang trọng dạng này; động từ sau 'you' không chia với ngôi khác cũng vẫn nguyên thể nhờ trợ động từ đảo).",
        "Bước 2: Đảo ngữ loại 1 trang trọng: 'Should + S + V-inf, please + V-inf' → điền 'Should'.",
        "Đáp án chuẩn: Should.",
      ],
    },
    {
      id: "cond-ex-x2",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Đảo ngữ Câu điều kiện Loại 3 với HAD",
      questionStem:
        "_______ management known about the software glitch earlier, they would have postponed the system rollout.",
      wordCue: "Had / Were",
      acceptedAnswers: ["had"],
      explanationStepByStep: [
        "Bước 1: Vế chính có 'would have postponed' (điều kiện loại 3), mệnh đề đầu lược bỏ 'If' và dùng phân từ 3 'known'.",
        "Bước 2: Đảo ngữ loại 3 dùng 'Had' đứng đầu câu: 'Had + S + V3/ed'.",
        "Đáp án chuẩn: Had.",
      ],
    },
    {
      id: "cond-ex-x3",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "Thức giả định (Subjunctive) sau 'recommended that'",
      questionStem:
        "The committee strongly recommended that every department head _______ their revised budget by Friday.",
      wordCue: "submit",
      acceptedAnswers: ["submit", "should submit"],
      explanationStepByStep: [
        "Bước 1: Động từ 'recommended that' mở đầu thức giả định.",
        "Bước 2: Dù chủ ngữ là số ít 'every department head', động từ vẫn ở dạng nguyên mẫu không -s → 'submit' (hoặc 'should submit').",
        "Đáp án chuẩn: submit.",
      ],
    },
    {
      id: "cond-ex-x4",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "Thức giả định với 'It is essential that + S + V-bare'",
      questionStem:
        "It is essential that the manufacturing process _______ with newly enacted environmental regulations.",
      wordCue: "comply",
      acceptedAnswers: ["comply", "should comply"],
      explanationStepByStep: [
        "Bước 1: Cấu trúc giả định tính từ bắt buộc: 'It is essential that + S + (should) + V-bare'.",
        "Bước 2: Không chia -s sau chủ ngữ số ít 'the manufacturing process' → 'comply'.",
        "Đáp án chuẩn: comply.",
      ],
    },
    {
      id: "cond-ex-x5",
      kind: "fill_blank",
      moduleIndex: 2,
      skillFocus: "Thức giả định 'were' trong câu Wish / Loại 2",
      questionStem:
        "Many local business owners wish that commercial interest rates _______ lower so they could expand.",
      wordCue: "be",
      acceptedAnswers: ["were"],
      explanationStepByStep: [
        "Bước 1: Câu ước trái với thực tế ở hiện tại dùng Quá khứ giả định.",
        "Bước 2: Động từ 'to be' trong câu điều kiện loại 2 và câu 'wish' chuẩn dùng 'were' cho mọi ngôi.",
        "Đáp án chuẩn: were.",
      ],
    },
    {
      id: "cond-ex-x6",
      kind: "fill_blank",
      moduleIndex: 3,
      skillFocus: "Điều kiện Loại 3 với vế chính phủ định (would not have + V3)",
      questionStem:
        "If our branch had received the shipment on time, we _______ lost our primary retail client.",
      wordCue: "would not have",
      acceptedAnswers: ["would not have", "wouldn't have"],
      explanationStepByStep: [
        "Bước 1: Mệnh đề 'If' chia Quá khứ hoàn thành ('had received') → Câu điều kiện loại 3.",
        "Bước 2: Phía sau đã có phân từ 3 'lost', cần điền 'would not have' (hoặc 'wouldn't have').",
        "Đáp án chuẩn: would not have.",
      ],
    },
    {
      id: "cond-ex-x7",
      moduleIndex: 3,
      skillFocus: "Đảo ngữ Loại 2 trang trọng: Were + S + to-V",
      questionStem:
        "_______ our company to lose that government contract, several regional offices would face downsizing.",
      options: ["A. Should", "B. Were", "C. Had", "D. If"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Mệnh đề chính dùng 'would face' (Loại 2), vế đầu có cấu trúc 'to lose'.",
        "Bước 2: Đảo ngữ câu điều kiện loại 2 cho động từ thường: 'Were + S + to + V-inf'.",
        "Kết luận: Chọn (B) Were.",
      ],
    },
  ],

  // ================= 10. COMPARISONS (4 mods: 0..3) =================
  comparisons: [
    {
      id: "comp-ex-x1",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Trạng từ nhấn mạnh trước So sánh hơn (significantly / much)",
      questionStem:
        "The updated beverage packaging is _______ more eye-catching than that of our major competitor.",
      wordCue: "significantly / very",
      acceptedAnswers: ["significantly"],
      explanationStepByStep: [
        "Bước 1: Trong cấu trúc so sánh hơn ('more eye-catching'), KHÔNG dùng trạng từ 'very'.",
        "Bước 2: Dùng trạng từ mức độ dành cho so sánh hơn → 'significantly'.",
        "Đáp án chuẩn: significantly.",
      ],
    },
    {
      id: "comp-ex-x2",
      moduleIndex: 0,
      skillFocus: "Nhấn mạnh so sánh hơn ngắn với far / much / considerably",
      questionStem:
        "With the automated sorting line installed, delivery times are _______ shorter than last quarter.",
      options: ["A. very", "B. so", "C. considerably", "D. too"],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: 'shorter than' là tính từ so sánh hơn.",
        "Bước 2: Chỉ 'much / far / considerably / significantly' mới đứng trước nhấn mạnh so sánh hơn (loại very, so, too).",
        "Kết luận: Chọn (C) considerably.",
      ],
    },
    {
      id: "comp-ex-x3",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "So sánh bằng dùng Trạng từ cho động từ thường (as... as)",
      questionStem:
        "The hotline was upgraded so that client inquiries could be resolved as _______ as possible.",
      wordCue: "PROMPT",
      acceptedAnswers: ["promptly"],
      explanationStepByStep: [
        "Bước 1: Cấu trúc 'as + Adj/Adv + as possible'. Chỗ trống bổ nghĩa cho động từ 'be resolved' (giải quyết như thế nào).",
        "Bước 2: Bổ nghĩa động từ thường dùng trạng từ → 'promptly'.",
        "Đáp án chuẩn: promptly.",
      ],
    },
    {
      id: "comp-ex-x4",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "So sánh kép với Trạng từ: The more + Adv + S + V",
      questionStem:
        "The _______ you analyze the financial balance sheet, the more discrepancies you will detect.",
      wordCue: "carefully",
      acceptedAnswers: ["more carefully"],
      explanationStepByStep: [
        "Bước 1: Cấu trúc so sánh kép: 'The + so sánh hơn + S + V, the + so sánh hơn...'.",
        "Bước 2: Bổ nghĩa cho động từ 'analyze' dùng so sánh hơn của trạng từ dài 'carefully' → 'more carefully'.",
        "Đáp án chuẩn: more carefully.",
      ],
    },
    {
      id: "comp-ex-x5",
      kind: "fill_blank",
      moduleIndex: 2,
      skillFocus: "So sánh bội số với Danh từ đếm được số nhiều (as many + N + as)",
      questionStem:
        "Last month, our automated hub processed three times as _______ shipping orders as the manual facility.",
      wordCue: "many / much",
      acceptedAnswers: ["many"],
      explanationStepByStep: [
        "Bước 1: Sau chỗ trống là danh từ đếm được số nhiều 'shipping orders'.",
        "Bước 2: Công thức so sánh bội số: 'three times as + many + N(đếm được số nhiều) + as' → điền 'many'.",
        "Đáp án chuẩn: many.",
      ],
    },
    {
      id: "comp-ex-x6",
      kind: "fill_blank",
      moduleIndex: 3,
      skillFocus: "So sánh nhất nhấn mạnh với 'by far the most'",
      questionStem:
        "Among all the proposals submitted this year, Ms. Lee's marketing plan was by far the _______ innovative.",
      wordCue: "more / most",
      acceptedAnswers: ["most"],
      explanationStepByStep: [
        "Bước 1: Cụm 'Among all the proposals...' (trong tất cả) và 'by far' là dấu hiệu của So sánh nhất.",
        "Bước 2: Tính từ dài 'innovative' dùng 'the most innovative' → điền 'most'.",
        "Đáp án chuẩn: most.",
      ],
    },
    {
      id: "comp-ex-x7",
      moduleIndex: 3,
      skillFocus: "Tránh lỗi ghép hai lần so sánh hơn (Double Comparative trap)",
      questionStem:
        "The newly released accounting software is _______ to navigate than the legacy desktop version.",
      options: [
        "A. more simpler",
        "B. simplest",
        "C. much simpler",
        "D. most simple",
      ],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: 'simple' là tính từ 2 âm tiết đổi sang so sánh hơn là 'simpler' — TUYỆT ĐỐI KHÔNG viết 'more simpler'.",
        "Bước 2: Có thể đặt 'much' trước để nhấn mạnh ('much simpler than').",
        "Kết luận: Chọn (C) much simpler.",
      ],
    },
  ],

  // ================= 11. NOUNS & PRONOUNS (4 mods: 0..3) =================
  nouns_pronouns: [
    {
      id: "np-ex-x1",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Đại từ phản thân số nhiều sau giới từ 'by'",
      questionStem:
        "Because the external consultants were unavailable, the two managers drafted the final report by _______.",
      wordCue: "they",
      acceptedAnswers: ["themselves"],
      explanationStepByStep: [
        "Bước 1: Cụm 'by + đại từ phản thân' mang nghĩa 'tự mình làm, không có ai hỗ trợ'.",
        "Bước 2: Chủ ngữ số nhiều 'the two managers' (tương ứng 'they') → dùng 'themselves'.",
        "Đáp án chuẩn: themselves.",
      ],
    },
    {
      id: "np-ex-x2",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "Danh từ không đếm được 'information' (không thêm -s)",
      questionStem:
        "The customs inspector asked the traveler to provide detailed _______ about the commercial samples.",
      wordCue: "information / informations",
      acceptedAnswers: ["information"],
      explanationStepByStep: [
        "Bước 1: Trong tiếng Anh chuẩn, 'information' là danh từ KHÔNG đếm được.",
        "Bước 2: Không bao giờ thêm -s thành 'informations' → điền 'information'.",
        "Đáp án chuẩn: information.",
      ],
    },
    {
      id: "np-ex-x3",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "Danh từ không đếm được 'equipment' (không thêm -s)",
      questionStem:
        "We need to upgrade the laboratory _______ because several diagnostic machines malfunctioned last month.",
      wordCue: "equipment / equipments",
      acceptedAnswers: ["equipment"],
      explanationStepByStep: [
        "Bước 1: 'equipment' (trang thiết bị) là danh từ không đếm được tương tự luggage, advice, furniture.",
        "Bước 2: Không thêm -s → điền 'equipment'.",
        "Đáp án chuẩn: equipment.",
      ],
    },
    {
      id: "np-ex-x4",
      kind: "fill_blank",
      moduleIndex: 2,
      skillFocus: "Lượng từ tích cực 'a few' trước Danh từ đếm được số nhiều",
      questionStem:
        "The coordinator invited _______ senior engineers to the planning session because their input was essential.",
      wordCue: "a few / few",
      acceptedAnswers: ["a few"],
      explanationStepByStep: [
        "Bước 1: Sau chỗ trống là danh từ đếm được số nhiều 'senior engineers' nên dùng 'few / a few'.",
        "Bước 2: Ngữ cảnh mang nghĩa tích cực ('ý kiến của họ rất cần thiết' nên đã mời được một vài người) → chọn 'a few'.",
        "Đáp án chuẩn: a few.",
      ],
    },
    {
      id: "np-ex-x5",
      moduleIndex: 2,
      skillFocus: "Lượng từ 'much / little' trước Danh từ không đếm được",
      questionStem:
        "Management spent _______ time evaluating vendor bids before awarding the five-year IT contract.",
      options: ["A. many", "B. several", "C. a large deal of", "D. a great deal of"],
      correctIndex: 3,
      explanationStepByStep: [
        "Bước 1: Danh từ 'time' (thời gian) không đếm được → loại 'many' và 'several'.",
        "Bước 2: Cụm định lượng chuẩn là 'a great deal of' (không dùng 'a large deal of').",
        "Kết luận: Chọn (D) a great deal of.",
      ],
    },
    {
      id: "np-ex-x6",
      kind: "fill_blank",
      moduleIndex: 3,
      skillFocus: "Chia động từ số ít với danh từ không đếm được (luggage)",
      questionStem:
        "All passenger luggage checked at Terminal 2 _______ screened electronically before boarding.",
      wordCue: "is / are",
      acceptedAnswers: ["is", "was"],
      explanationStepByStep: [
        "Bước 1: 'luggage' (hành lý) là danh từ không đếm được nên luôn chia động từ số ít.",
        "Bước 2: Chọn động từ số ít 'is' (hoặc 'was').",
        "Đáp án chuẩn: is.",
      ],
    },
    {
      id: "np-ex-x7",
      moduleIndex: 3,
      skillFocus: "Phân biệt Tính từ sở hữu (our) vs Đại từ sở hữu (ours)",
      questionStem:
        "The Tokyo team completed their quarterly inventory check two days earlier than we completed _______.",
      options: ["A. our", "B. us", "C. ours", "D. ourselves"],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Cuối câu không có danh từ theo sau (thay thế cho 'our quarterly inventory check').",
        "Bước 2: Cần đại từ sở hữu đứng độc lập → chọn (C) ours.",
      ],
    },
  ],

  // ================= 12. ADJECTIVES & ADVERBS (4 mods: 0..3) =================
  adjectives_adverbs: [
    {
      id: "aa-ex-x1",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Cấu trúc make + Tân ngữ + Tính từ",
      questionStem:
        "The ergonomic design of the new office chairs makes them extremely _______ for staff working long hours.",
      wordCue: "comfortable / comfortably",
      acceptedAnswers: ["comfortable"],
      explanationStepByStep: [
        "Bước 1: Cấu trúc 'make + Object (them) + ADJECTIVE', trạng từ 'extremely' đứng trước bổ nghĩa cho tính từ.",
        "Bước 2: Điền tính từ 'comfortable'.",
        "Đáp án chuẩn: comfortable.",
      ],
    },
    {
      id: "aa-ex-x2",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "Phân biệt Late (muộn) vs Lately (gần đây)",
      questionStem:
        "The regional sales manager has _______ received several inquiries regarding the updated product warranty.",
      wordCue: "late / lately",
      acceptedAnswers: ["lately"],
      explanationStepByStep: [
        "Bước 1: Câu chia thì Hiện tại hoàn thành ('has ___ received') và đứng giữa trợ động từ với phân từ 3.",
        "Bước 2: 'lately' mang nghĩa 'gần đây' (= recently), rất hay đi cùng Hiện tại hoàn thành.",
        "Đáp án chuẩn: lately.",
      ],
    },
    {
      id: "aa-ex-x3",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "Phân biệt Near (khoảng cách gần) vs Nearly (gần như = almost)",
      questionStem:
        "The factory spent _______ all its quarterly budget on upgrading the automated assembly line.",
      wordCue: "near / nearly",
      acceptedAnswers: ["nearly"],
      explanationStepByStep: [
        "Bước 1: Trước cụm số lượng 'all its quarterly budget' mang nghĩa 'gần như toàn bộ'.",
        "Bước 2: 'nearly' (= almost) bổ nghĩa mức độ/số lượng; 'near' chỉ khoảng cách địa lý.",
        "Đáp án chuẩn: nearly.",
      ],
    },
    {
      id: "aa-ex-x4",
      moduleIndex: 1,
      skillFocus: "Phân biệt High vs Highly trong cụm từ cố định",
      questionStem:
        "The company's recent recruitment drive resulted in hiring five _______ qualified financial analysts.",
      options: ["A. high", "B. higher", "C. highly", "D. height"],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Trước tính từ/phân từ 'qualified' (có trình độ chuyên môn) cần trạng từ chỉ mức độ.",
        "Bước 2: Cụm chuẩn là 'highly qualified' (trình độ cao).",
        "Kết luận: Chọn (C) highly.",
      ],
    },
    {
      id: "aa-ex-x5",
      kind: "fill_blank",
      moduleIndex: 2,
      skillFocus: "Vị trí Trạng từ tần suất trước Động từ thường",
      questionStem:
        "The senior auditor _______ at the office before 8:00 A.M. to review the daily transaction logs.",
      wordCue: "always arrive",
      acceptedAnswers: ["always arrives"],
      explanationStepByStep: [
        "Bước 1: Trạng từ tần suất ('always') đứng TRƯỚC động từ thường ('arrives').",
        "Bước 2: Chủ ngữ số ít 'The senior auditor' → chia 'always arrives'.",
        "Đáp án chuẩn: always arrives.",
      ],
    },
    {
      id: "aa-ex-x6",
      moduleIndex: 2,
      skillFocus: "Vị trí Trạng từ đứng sau To Be / Động từ khuyết thiếu",
      questionStem:
        "Emergency exit doors _______ unobstructed during all business hours.",
      options: [
        "A. must always remain",
        "B. always must remain",
        "C. must remain always",
        "D. remaining always",
      ],
      correctIndex: 0,
      explanationStepByStep: [
        "Bước 1: Khi câu có trợ động từ hoặc động từ khuyết thiếu ('must'), trạng từ tần suất đứng NGAY SAU trợ động từ đó và trước động từ chính.",
        "Bước 2: Thứ tự chuẩn: 'must + always + remain'.",
        "Kết luận: Chọn (A) must always remain.",
      ],
    },
    {
      id: "aa-ex-x7",
      kind: "fill_blank",
      moduleIndex: 3,
      skillFocus: "Phân biệt Hard (nỗ lực hết sức) vs Hardly (hầu như không)",
      questionStem:
        "Mr. Vance had to work _______ all week to meet the strict production deadline set by the client.",
      wordCue: "hard / hardly",
      acceptedAnswers: ["hard"],
      explanationStepByStep: [
        "Bước 1: Ngữ cảnh 'to meet the strict production deadline' thể hiện sự làm việc vất vả, nỗ lực.",
        "Bước 2: 'work hard' = làm việc chăm chỉ ('hardly' mang nghĩa phủ định = hầu như không).",
        "Đáp án chuẩn: hard.",
      ],
    },
    {
      id: "aa-ex-x8",
      moduleIndex: 3,
      skillFocus: "Cấu trúc Find + it + ADJ + to-V",
      questionStem:
        "New interns often find it _______ to master the proprietary inventory software during their first week.",
      options: [
        "A. challenge",
        "B. challenging",
        "C. challengingly",
        "D. challenged",
      ],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Cấu trúc 'find it + ADJECTIVE + to-V' dùng tính từ miêu tả tính chất của việc 'to master...'.",
        "Bước 2: Tính từ miêu tả tính chất thử thách → (B) challenging.",
      ],
    },
  ],

  // ================= 13. MODALS (4 mods: 0..3) =================
  modals: [
    {
      id: "mod-ex-x1",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Suy luận chắc chắn trong quá khứ: must have + V3",
      questionStem:
        "The flight from Tokyo landed two hours ago, so the executives _______ arrived at the hotel by now.",
      wordCue: "must have / should have",
      acceptedAnswers: ["must have"],
      explanationStepByStep: [
        "Bước 1: Có bằng chứng rõ ràng ('landed two hours ago') để đưa ra suy đoán hợp lý ở quá khứ.",
        "Bước 2: Dùng 'must have + V3/ed (arrived)' mang nghĩa 'chắc hẳn đã đến nơi rồi'.",
        "Đáp án chuẩn: must have.",
      ],
    },
    {
      id: "mod-ex-x2",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Trách móc/tiếc nuối quá khứ: should have + V3",
      questionStem:
        "We _______ verified the shipping address before dispatching the cargo, but unfortunately we forgot.",
      wordCue: "should have / must have",
      acceptedAnswers: ["should have"],
      explanationStepByStep: [
        "Bước 1: Vế sau 'but unfortunately we forgot' cho thấy hành động đáng lẽ nên làm nhưng đã không làm.",
        "Bước 2: Dùng 'should have + V3/ed' → 'should have verified'.",
        "Đáp án chuẩn: should have.",
      ],
    },
    {
      id: "mod-ex-x3",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "Cấm đoán tuyệt đối (must not / mustn't)",
      questionStem:
        "According to corporate cybersecurity policy, employees _______ share their access passwords with anyone.",
      wordCue: "must not / don't have to",
      acceptedAnswers: ["must not", "mustn't"],
      explanationStepByStep: [
        "Bước 1: Chia sẻ mật khẩu an ninh mạng là hành vi BỊ CẤM theo quy định.",
        "Bước 2: Diễn tả sự cấm đoán dùng 'must not' hoặc 'mustn't' ('don't have to' chỉ là không cần thiết).",
        "Đáp án chuẩn: must not.",
      ],
    },
    {
      id: "mod-ex-x4",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "Không cần thiết / tùy chọn (don't have to / needn't)",
      questionStem:
        "You _______ print the financial statement because an electronic copy is already uploaded on the portal.",
      wordCue: "must not / don't have to",
      acceptedAnswers: ["don't have to", "do not have to", "needn't"],
      explanationStepByStep: [
        "Bước 1: Bản điện tử đã có sẵn trên cổng thông tin nên việc in giấy là KHÔNG CẦN THIẾT (không phải bị cấm).",
        "Bước 2: Dùng 'don't have to' (hoặc 'do not have to' / 'needn't').",
        "Đáp án chuẩn: don't have to.",
      ],
    },
    {
      id: "mod-ex-x5",
      kind: "fill_blank",
      moduleIndex: 2,
      skillFocus: "Khả năng không chắc chắn: may / might",
      questionStem:
        "Take a printed copy of the contract; you _______ need it during the afternoon negotiations if Wi-Fi fails.",
      wordCue: "might / must",
      acceptedAnswers: ["might", "may"],
      explanationStepByStep: [
        "Bước 1: Ngữ cảnh 'if Wi-Fi fails' chỉ tình huống có thể xảy ra (50/50), không chắc chắn.",
        "Bước 2: Dùng 'might' hoặc 'may' diễn tả khả năng không chắc chắn.",
        "Đáp án chuẩn: might.",
      ],
    },
    {
      id: "mod-ex-x6",
      moduleIndex: 2,
      skillFocus: "Suy đoán phủ định ở hiện tại: can't + be",
      questionStem:
        "That invoice figure _______ correct because it shows triple our actual order volume for June.",
      options: ["A. mustn't be", "B. can't be", "C. shouldn't", "D. needn't be"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Suy luận logic phủ định chắc chắn ở hiện tại ('Không đời nào / chắc chắn không thể đúng').",
        "Bước 2: Tiếng Anh dùng 'can't + V-inf' (không dùng 'mustn't' để suy đoán).",
        "Kết luận: Chọn (B) can't be.",
      ],
    },
    {
      id: "mod-ex-x7",
      kind: "fill_blank",
      moduleIndex: 3,
      skillFocus: "Khả năng xảy ra với 'could' (tương đương may/might)",
      questionStem:
        "I am not sure when the regional director arrives, as her train _______ be delayed by maintenance work.",
      wordCue: "could / can",
      acceptedAnswers: ["could", "might", "may"],
      explanationStepByStep: [
        "Bước 1: Phỏng đoán khả năng một sự việc cụ thể xảy ra hiện tại/tương lai (không dùng 'can' khẳng định để đoán sự việc đơn lẻ).",
        "Bước 2: Dùng 'could' (hoặc may/might).",
        "Đáp án chuẩn: could.",
      ],
    },
    {
      id: "mod-ex-x8",
      moduleIndex: 3,
      skillFocus: "Phân biệt sắc thái nghĩa Mustn't vs Doesn't have to",
      questionStem:
        "Since Mr. Park already completed safety orientation last year, he _______ attend Friday's introductory session.",
      options: [
        "A. must not",
        "B. doesn't have to",
        "C. shouldn't have",
        "D. cannot",
      ],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Đã hoàn thành tập huấn từ năm ngoái nên anh ấy KHÔNG BẮT BUỘC tham dự buổi giới thiệu lại.",
        "Bước 2: Không cần thiết dùng 'doesn't have to' (loại 'must not' mang nghĩa cấm).",
        "Kết luận: Chọn (B) doesn't have to.",
      ],
    },
  ],

  // ================= 14. INVERSION (3 mods: 0..2) =================
  inversion: [
    {
      id: "inv-ex-x1",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Đảo ngữ với Seldom đầu câu (Seldom + aux + S)",
      questionStem:
        "Seldom _______ faced such a complex decision regarding overseas resource allocation.",
      wordCue: "the committee has / has the committee",
      acceptedAnswers: ["has the committee"],
      explanationStepByStep: [
        "Bước 1: Trạng từ bán phủ định 'Seldom' đứng đầu câu đòi hỏi đảo trợ động từ lên trước chủ ngữ.",
        "Bước 2: Đảo 'has' lên trước 'the committee' → 'has the committee' (giữ phân từ 'faced' phía sau).",
        "Đáp án chuẩn: has the committee.",
      ],
    },
    {
      id: "inv-ex-x2",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Đảo ngữ với Under no circumstances",
      questionStem:
        "Under no circumstances _______ disclose proprietary product designs to external contractors.",
      wordCue: "should employees / employees should",
      acceptedAnswers: ["should employees"],
      explanationStepByStep: [
        "Bước 1: Cụm phủ định tuyệt đối 'Under no circumstances' đứng đầu câu kích hoạt đảo ngữ.",
        "Bước 2: Đảo 'should' lên trước chủ ngữ 'employees' → 'should employees'.",
        "Đáp án chuẩn: should employees.",
      ],
    },
    {
      id: "inv-ex-x3",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "Đảo ngữ Only after (đảo ở mệnh đề chính phía sau)",
      questionStem:
        "Only after reviewing the quarterly audit _______ the proposed expansion budget.",
      wordCue: "did the board approve / the board approved",
      acceptedAnswers: ["did the board approve"],
      explanationStepByStep: [
        "Bước 1: 'Only after + cụm V-ing' đứng đầu câu nên MỆNH ĐỀ CHÍNH phía sau phải đảo ngữ.",
        "Bước 2: Mượn trợ động từ quá khứ 'did' đưa lên trước 'the board' + động từ nguyên mẫu → 'did the board approve'.",
        "Đáp án chuẩn: did the board approve.",
      ],
    },
    {
      id: "inv-ex-x4",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "Đảo ngữ đồng tình phủ định với Neither",
      questionStem:
        '"Our downtown branch did not reach its monthly target." — "Neither _______."',
      wordCue: "did ours / ours did",
      acceptedAnswers: ["did ours"],
      explanationStepByStep: [
        "Bước 1: Đồng tình với vế phủ định quá khứ ('did not reach') dùng cấu trúc 'Neither + trợ động từ + S'.",
        "Bước 2: Đảo trợ động từ 'did' lên trước đại từ 'ours' → 'did ours'.",
        "Đáp án chuẩn: did ours.",
      ],
    },
    {
      id: "inv-ex-x5",
      kind: "fill_blank",
      moduleIndex: 2,
      skillFocus: "Đảo ngữ với Barely / Hardly ... when",
      questionStem:
        "Barely _______ stepped into the conference hall when the fire alarm unexpectedly sounded.",
      wordCue: "we had / had we",
      acceptedAnswers: ["had we"],
      explanationStepByStep: [
        "Bước 1: Trạng từ bán phủ định 'Barely / Hardly' đầu câu đi cùng cấu trúc '...when...' yêu cầu đảo ngữ Quá khứ hoàn thành.",
        "Bước 2: Đảo trợ động từ 'had' lên trước chủ ngữ 'we' → 'had we'.",
        "Đáp án chuẩn: had we.",
      ],
    },
    {
      id: "inv-ex-x6",
      moduleIndex: 2,
      skillFocus: "Bẫy thứ tự từ: KHÔNG đảo ngữ nếu mệnh đề Only nằm trong vế phụ",
      questionStem:
        "Only after the supplier signs the revised addendum _______ to release the advance payment.",
      options: [
        "A. accounting will agree",
        "B. will accounting agree",
        "C. accounting agreed",
        "D. agrees accounting",
      ],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Mệnh đề 'Only after the supplier signs...' đứng đầu câu → giữ trật tự bình thường ở vế phụ, và ĐẢO NGỮ ở mệnh đề chính phía sau.",
        "Bước 2: Đảo 'will' lên trước chủ ngữ 'accounting' + V-inf → (B) will accounting agree.",
      ],
    },
  ],

  // ================= 15. COLLOCATIONS (4 mods: 0..3) =================
  collocations: [
    {
      id: "coll-ex-x1",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Cụm động từ cố định: meet a deadline",
      questionStem:
        "The software engineering team had to work overtime every evening to _______ the strict client deadline.",
      wordCue: "meet / catch",
      acceptedAnswers: ["meet"],
      explanationStepByStep: [
        "Bước 1: Cụm kết hợp từ kinh điển trong công sở: 'meet a deadline' (kịp hạn chót).",
        "Bước 2: Không dùng 'catch a deadline' → điền 'meet'.",
        "Đáp án chuẩn: meet.",
      ],
    },
    {
      id: "coll-ex-x2",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Cụm động từ cố định: conduct a survey",
      questionStem:
        "The marketing division plans to _______ a comprehensive customer satisfaction survey next month.",
      wordCue: "conduct / make",
      acceptedAnswers: ["conduct"],
      explanationStepByStep: [
        "Bước 1: Động từ trang trọng chuyên đi kèm 'survey / research / inspection / study' là 'conduct' (tiến hành).",
        "Bước 2: Sau 'plans to' dùng nguyên mẫu → 'conduct'.",
        "Đáp án chuẩn: conduct.",
      ],
    },
    {
      id: "coll-ex-x3",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "Cụm Trạng từ + Tính từ: conveniently located",
      questionStem:
        "The new branch office is _______ located within walking distance of the central subway station.",
      wordCue: "conveniently / convenience",
      acceptedAnswers: ["conveniently"],
      explanationStepByStep: [
        "Bước 1: Cụm từ cố định mô tả vị trí bất động sản/văn phòng: 'conveniently located' (tọa lạc thuận tiện).",
        "Bước 2: Cần trạng từ bổ nghĩa cho tính từ/phân từ 'located' → 'conveniently'.",
        "Đáp án chuẩn: conveniently.",
      ],
    },
    {
      id: "coll-ex-x4",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "Cụm giới từ pháp lý: in compliance with",
      questionStem:
        "All protective gear worn inside the factory must be in strict _______ with federal safety standards.",
      wordCue: "compliance / agreement",
      acceptedAnswers: ["compliance"],
      explanationStepByStep: [
        "Bước 1: Cụm giới từ mang nghĩa 'tuân thủ quy định / tiêu chuẩn' là 'in compliance with'.",
        "Bước 2: Điền danh từ 'compliance'.",
        "Đáp án chuẩn: compliance.",
      ],
    },
    {
      id: "coll-ex-x5",
      kind: "fill_blank",
      moduleIndex: 2,
      skillFocus: "Phân biệt Put off (hoãn lại) vs Call off (hủy bỏ)",
      questionStem:
        "Due to heavy snow, the organizers had to _______ the morning seminar until next Friday.",
      wordCue: "put off / call off",
      acceptedAnswers: ["put off"],
      explanationStepByStep: [
        "Bước 1: Cụm 'until next Friday' cho thấy sự kiện chỉ dời lịch chứ không hủy vĩnh viễn.",
        "Bước 2: 'put off' = hoãn lại (= postpone); 'call off' = hủy bỏ hoàn toàn (= cancel).",
        "Đáp án chuẩn: put off.",
      ],
    },
    {
      id: "coll-ex-x6",
      kind: "fill_blank",
      moduleIndex: 3,
      skillFocus: "Cụm động từ thương mại: turn down (từ chối đề nghị)",
      questionStem:
        "Although the salary was competitive, Ms. Patel _______ the job offer because she preferred not to relocate.",
      wordCue: "turned down / carried out",
      acceptedAnswers: ["turned down"],
      explanationStepByStep: [
        "Bước 1: Vế sau 'preferred not to relocate' cho biết cô ấy từ chối lời mời nhận việc.",
        "Bước 2: 'turn down' (quá khứ: 'turned down') = từ chối lời đề nghị / ứng tuyển.",
        "Đáp án chuẩn: turned down.",
      ],
    },
    {
      id: "coll-ex-x7",
      moduleIndex: 3,
      skillFocus: "Cụm giới từ trang trọng: on behalf of (thay mặt cho)",
      questionStem:
        "The vice president signed the international partnership charter _______ the entire board of directors.",
      options: [
        "A. in case of",
        "B. on behalf of",
        "C. regardless of",
        "D. instead of",
      ],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Phó chủ tịch ký văn kiện đại diện/thay mặt cho cả hội đồng quản trị.",
        "Bước 2: Cụm giới từ 'on behalf of' nghĩa là 'thay mặt cho, đại diện cho'.",
        "Kết luận: Chọn (B) on behalf of.",
      ],
    },
  ],

  // ================= 16. PARALLEL STRUCTURE (4 mods: 0..3) =================
  parallel_structure: [
    {
      id: "par-ex-x1",
      kind: "fill_blank",
      moduleIndex: 0,
      skillFocus: "Chuỗi liệt kê đồng dạng V-ing sau giới từ",
      questionStem:
        "The administrative assistant is responsible for sorting incoming mail, answering inquiries, and _______ conference rooms.",
      wordCue: "prepare",
      acceptedAnswers: ["preparing"],
      explanationStepByStep: [
        "Bước 1: Liên từ kết hợp 'and' nối chuỗi 3 hành động song hành sau giới từ 'for': 'sorting...', 'answering...', and '_______'.",
        "Bước 2: Bắt buộc chia dạng V-ing đồng dạng → 'preparing'.",
        "Đáp án chuẩn: preparing.",
      ],
    },
    {
      id: "par-ex-x2",
      moduleIndex: 0,
      skillFocus: "Song hành Tính từ trong chuỗi liệt kê",
      questionStem:
        "Our clients consistently describe the upgraded mobile banking app as fast, secure, and _______.",
      options: [
        "A. rely",
        "B. reliability",
        "C. reliable",
        "D. reliably",
      ],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Chuỗi liệt kê nối bởi 'and' gồm toàn tính từ: 'fast' (Adj), 'secure' (Adj), and '_______'.",
        "Bước 2: Cần tính từ tương ứng → (C) reliable.",
      ],
    },
    {
      id: "par-ex-x3",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "Cặp tương quan: not only ... but also ...",
      questionStem:
        "The annual leadership seminar was _______ informative but also packed with practical case studies.",
      wordCue: "not only / neither",
      acceptedAnswers: ["not only"],
      explanationStepByStep: [
        "Bước 1: Phía sau có vế đối ứng 'but also'.",
        "Bước 2: Cặp liên từ tương quan chuẩn là 'not only ... but also ...'.",
        "Đáp án chuẩn: not only.",
      ],
    },
    {
      id: "par-ex-x4",
      kind: "fill_blank",
      moduleIndex: 1,
      skillFocus: "Cặp tương quan phủ định: neither ... nor ...",
      questionStem:
        "Because of strict budget cuts, the branch can afford _______ salary bonuses nor office renovations this year.",
      wordCue: "neither / either",
      acceptedAnswers: ["neither"],
      explanationStepByStep: [
        "Bước 1: Vế sau dùng liên từ 'nor' ('nor office renovations').",
        "Bước 2: Đi cặp với 'nor' luôn là 'neither' ('neither A nor B').",
        "Đáp án chuẩn: neither.",
      ],
    },
    {
      id: "par-ex-x5",
      kind: "fill_blank",
      moduleIndex: 2,
      skillFocus: "Song hành prefer V-ing TO V-ing",
      questionStem:
        "Many project managers prefer communicating via email to _______ lengthy unscheduled meetings.",
      wordCue: "hold",
      acceptedAnswers: ["holding"],
      explanationStepByStep: [
        "Bước 1: Cấu trúc 'prefer + V-ing + TO + V-ing' ('communicating ... to ...'). Chữ 'to' là giới từ so sánh.",
        "Bước 2: Đồng dạng với 'communicating' → dùng danh động từ 'holding'.",
        "Đáp án chuẩn: holding.",
      ],
    },
    {
      id: "par-ex-x6",
      kind: "fill_blank",
      moduleIndex: 2,
      skillFocus: "Song hành would rather V-bare THAN V-bare",
      questionStem:
        "The board would rather invest surplus revenue in R&D than _______ funds on short-term advertisements.",
      wordCue: "waste / wasting",
      acceptedAnswers: ["waste"],
      explanationStepByStep: [
        "Bước 1: Cấu trúc 'would rather + V-bare (invest) + THAN + V-bare'.",
        "Bước 2: Sau 'than' giữ nguyên mẫu không to đồng dạng với 'invest' → 'waste'.",
        "Đáp án chuẩn: waste.",
      ],
    },
    {
      id: "par-ex-x7",
      kind: "fill_blank",
      moduleIndex: 3,
      skillFocus: "Cặp tương quan: both ... and ...",
      questionStem:
        "The executive training program was created to benefit _______ entry-level recruits and senior supervisors.",
      wordCue: "both / either",
      acceptedAnswers: ["both"],
      explanationStepByStep: [
        "Bước 1: Phía sau có liên từ 'and' ('and senior supervisors').",
        "Bước 2: Cặp liên từ tương quan đi cùng 'and' là 'both' ('both A and B').",
        "Đáp án chuẩn: both.",
      ],
    },
    {
      id: "par-ex-x8",
      moduleIndex: 3,
      skillFocus: "Song hành hai cụm To-infinitive",
      questionStem:
        "The restructuring plan aims both to streamline internal communication and _______ annual operating expenses.",
      options: [
        "A. reducing",
        "B. reduce",
        "C. to reduce",
        "D. reduction",
      ],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Sau 'both' là cụm động từ nguyên mẫu có to ('to streamline internal communication').",
        "Bước 2: Vế sau 'and' phải giữ đồng dạng 'to reduce' (tuy có thể lược 'to' trong văn nói, TOEIC chuẩn song hành ưu tiên lặp 'to reduce' đối xứng tuyệt đối với 'to streamline').",
        "Kết luận: Chọn (C) to reduce.",
      ],
    },
  ],
};
