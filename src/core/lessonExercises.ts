import { EXTRA_PRACTICE_EXERCISES } from "./lessonExtraExercises";
import type { LessonPracticeExercise } from "./lessonExerciseUtils";

export {
  isFillBlankExercise,
  normalizeFillBlankAnswer,
  checkFillBlankAnswer,
  type LessonMcqExercise,
  type LessonFillBlankExercise,
  type LessonPracticeExercise,
} from "./lessonExerciseUtils";

/**
 * Ngân hàng bài tập áp dụng ngay tại chỗ cho 16 chủ điểm ngữ pháp.
 * Chú ý: Các bài tập này chạy hoàn toàn phía client để rèn luyện ngay sau từng học phần,
 * không ghi vào bảng attempts và không làm thay đổi chỉ số thành thạo chính thức.
 */
export const LESSON_PRACTICE_EXERCISES: Record<
  string,
  LessonPracticeExercise[]
> = {
  tenses: [
    {
      id: "tenses-ex-1",
      moduleIndex: 0,
      skillFocus: "Hiện tại đơn diễn tả lịch trình lặp lại",
      questionStem:
        "The regional sales director usually _______ our branch office on Mondays to review weekly performance figures.",
      options: ["A. visit", "B. visits", "C. is visiting", "D. visited"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Trạng từ tần suất 'usually' và mốc lặp lại 'on Mondays' chỉ thói quen, lịch trình đều đặn → dùng Hiện tại đơn.",
        "Bước 2: Chủ ngữ 'The regional sales director' là ngôi thứ 3 số ít nên động từ thêm -s.",
        "Kết luận: Chọn (B) visits.",
      ],
    },
    {
      id: "tenses-ex-2",
      moduleIndex: 1,
      skillFocus: "Hiện tại hoàn thành đi với mệnh đề Since",
      questionStem:
        "Mr. Henderson _______ as the head of the accounting department since the firm opened five years ago.",
      options: [
        "A. worked",
        "B. works",
        "C. has worked",
        "D. is working",
      ],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Mệnh đề sau 'since' chia Quá khứ đơn ('opened'), chỉ mốc bắt đầu trong quá khứ.",
        "Bước 2: Hành động kéo dài liên tục từ quá khứ đến hiện tại phải chia Hiện tại hoàn thành (have/has + V3/ed).",
        "Kết luận: Chủ ngữ số ít → Chọn (C) has worked.",
      ],
    },
    {
      id: "tenses-ex-3",
      moduleIndex: 1,
      skillFocus: "Quá khứ hoàn thành với By the time",
      questionStem:
        "By the time the delivery truck arrived at the warehouse, the staff _______ for the day.",
      options: [
        "A. already left",
        "B. had already left",
        "C. have already left",
        "D. were already leaving",
      ],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Cụm 'By the time + Quá khứ đơn (arrived)' đặt ra một mốc thời gian trong quá khứ.",
        "Bước 2: Việc nhân viên rời đi đã hoàn tất TRƯỚC khi xe tải tới → chia Quá khứ hoàn thành (had + V3).",
        "Kết luận: Chọn (B) had already left.",
      ],
    },
    {
      id: "tenses-ex-4",
      moduleIndex: 1,
      skillFocus: "Quá khứ tiếp diễn bị cắt ngang bởi Quá khứ đơn",
      questionStem:
        "Mr. Vance _______ the quarterly financial presentation when the conference projector suddenly stopped working.",
      options: [
        "A. delivered",
        "B. was delivering",
        "C. delivers",
        "D. has delivered",
      ],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Vế sau 'when' là hành động đột ngột chen ngang ở quá khứ ('suddenly stopped working').",
        "Bước 2: Hành động đang diễn ra liên tục tại thời điểm đó chia Quá khứ tiếp diễn (was/were + V-ing).",
        "Kết luận: Chọn (B) was delivering.",
      ],
    },
    {
      id: "tenses-ex-5",
      moduleIndex: 1,
      skillFocus: "Thói quen quá khứ Used to + V-inf",
      questionStem:
        "Before modern computer spreadsheets were introduced, accountants _______ financial statements by hand.",
      options: [
        "A. used to prepare",
        "B. are used to preparing",
        "C. were preparing",
        "D. use to prepare",
      ],
      correctIndex: 0,
      explanationStepByStep: [
        "Bước 1: Mệnh đề 'Before modern computer spreadsheets were introduced' nói về giai đoạn đã qua.",
        "Bước 2: 'used to + V-inf' diễn tả thói quen từng làm trong quá khứ nay không còn nữa; còn 'be used to + V-ing' nghĩa là quen với việc gì ở hiện tại.",
        "Kết luận: Chọn (A) used to prepare.",
      ],
    },
    {
      id: "tenses-ex-6",
      moduleIndex: 2,
      skillFocus: "Tương lai hoàn thành với By + mốc tương lai",
      questionStem:
        "By the end of next month, the logistics team _______ the construction of the new distribution facility.",
      options: [
        "A. completes",
        "B. will complete",
        "C. will have completed",
        "D. is completing",
      ],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Cụm 'By the end of next month' đánh dấu thời điểm hoàn tất trong tương lai.",
        "Bước 2: Hành động hoàn thành trước một mốc tương lai chia Tương lai hoàn thành (will have + V3/ed).",
        "Kết luận: Chọn (C) will have completed.",
      ],
    },
    {
      id: "tenses-ex-7",
      moduleIndex: 3,
      skillFocus: "Mệnh đề thời gian tương lai không dùng Will",
      questionStem:
        "The procurement officer will finalize the purchase order as soon as the financial director _______ the budget.",
      options: [
        "A. approves",
        "B. will approve",
        "C. approved",
        "D. is approving",
      ],
      correctIndex: 0,
      explanationStepByStep: [
        "Bước 1: Mệnh đề sau 'as soon as' là mệnh đề trạng ngữ chỉ thời gian.",
        "Bước 2: Trong mệnh đề thời gian tương lai, tuyệt đối không dùng 'will', mà mượn Hiện tại đơn để thay thế.",
        "Kết luận: Chủ ngữ số ít → Chọn (A) approves.",
      ],
    },
  ],

  word_form: [
    {
      id: "word-form-ex-1",
      moduleIndex: 0,
      skillFocus: "Danh từ làm tân ngữ sau ngoại động từ",
      questionStem:
        "The new marketing campaign failed to attract _______ to the downtown store during the holiday season.",
      options: [
        "A. consume",
        "B. consumption",
        "C. consumers",
        "D. consumable",
      ],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Sau ngoại động từ 'attract' (thu hút) cần một danh từ làm tân ngữ.",
        "Bước 2: Xét nghĩa: cửa hàng cần thu hút 'người tiêu dùng' (consumers), không phải 'sự tiêu thụ' (consumption).",
        "Kết luận: Chọn (C) consumers.",
      ],
    },
    {
      id: "word-form-ex-2",
      moduleIndex: 1,
      skillFocus: "Tính từ bổ nghĩa đứng trước danh từ",
      questionStem:
        "The legal department drafted a very _______ agreement that satisfies the requirements of both corporations.",
      options: [
        "A. specify",
        "B. specific",
        "C. specifically",
        "D. specification",
      ],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Cụm 'a very _______ agreement' có mạo từ 'a', trạng từ 'very' và danh từ 'agreement' ở cuối.",
        "Bước 2: Vị trí giữa trạng từ chỉ mức độ và danh từ bắt buộc là Tính từ.",
        "Kết luận: Chọn (B) specific (đuôi -ic).",
      ],
    },
    {
      id: "word-form-ex-3",
      moduleIndex: 2,
      skillFocus: "Trạng từ thể cách bổ nghĩa cho động từ thường",
      questionStem:
        "The manager spoke _______ to the press about the upcoming merger, revealing very few details.",
      options: [
        "A. caution",
        "B. cautious",
        "C. cautiously",
        "D. cautiousness",
      ],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Câu đã có chủ ngữ 'The manager' và động từ hành động 'spoke'.",
        "Bước 2: Cần một Trạng từ đứng sau để bổ nghĩa cho cách thức phát biểu của động từ 'spoke'.",
        "Kết luận: Chọn (C) cautiously (đuôi -ly).",
      ],
    },
    {
      id: "word-form-ex-4",
      moduleIndex: 3,
      skillFocus: "Động từ nguyên mẫu sau trợ động từ khuyết thiếu",
      questionStem:
        "Under the terms of the updated warranty, the manufacturer must _______ defective components free of charge.",
      options: [
        "A. replace",
        "B. replacement",
        "C. replaceable",
        "D. replacing",
      ],
      correctIndex: 0,
      explanationStepByStep: [
        "Bước 1: Ngay trước chỗ trống là động từ khuyết thiếu 'must'.",
        "Bước 2: Sau 'must / can / should' luôn là Động từ nguyên mẫu không 'to'.",
        "Kết luận: Chọn (A) replace.",
      ],
    },
  ],

  nouns_pronouns: [
    {
      id: "nouns-pronouns-ex-1",
      moduleIndex: 0,
      skillFocus: "Đại từ phản thân nhấn mạnh chủ thể tự thực hiện",
      questionStem:
        "Because the company refused to hire an outside mediator, the two department heads resolved the dispute _______.",
      options: ["A. them", "B. their", "C. themselves", "D. theirs"],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Mệnh đề đã đủ Chủ ngữ ('the two department heads'), Động từ ('resolved') và Tân ngữ ('the dispute').",
        "Bước 2: Cần đại từ phản thân ở cuối câu để nhấn mạnh chính họ đã tự mình giải quyết.",
        "Kết luận: Chọn (C) themselves.",
      ],
    },
    {
      id: "nouns-pronouns-ex-2",
      moduleIndex: 0,
      skillFocus: "Đại từ sở hữu đứng độc lập làm chủ ngữ",
      questionStem:
        "Your proposal highlights the long-term benefits clearly, but _______ focuses primarily on the immediate operational costs.",
      options: ["A. our", "B. us", "C. we", "D. ours"],
      correctIndex: 3,
      explanationStepByStep: [
        "Bước 1: Chỗ trống đứng trước động từ chia số ít 'focuses' và làm chủ ngữ cho mệnh đề sau 'but'.",
        "Bước 2: 'our' cần danh từ đi sau; 'ours' (= our proposal) là đại từ sở hữu thay thế trọn cụm danh từ.",
        "Kết luận: Chọn (D) ours.",
      ],
    },
    {
      id: "nouns-pronouns-ex-3",
      moduleIndex: 1,
      skillFocus: "Danh từ không đếm được kinh điển",
      questionStem:
        "The human resources director gave us some useful _______ on how to prepare for the panel interview.",
      options: ["A. advise", "B. advices", "C. advice", "D. advising"],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Sau 'some useful' cần một danh từ.",
        "Bước 2: 'advice' (lời khuyên) là danh từ không đếm được, không thêm -s; còn 'advise' là động từ.",
        "Kết luận: Chọn (C) advice.",
      ],
    },
    {
      id: "nouns-pronouns-ex-4",
      moduleIndex: 2,
      skillFocus: "Phân biệt lượng từ Little vs Few",
      questionStem:
        "There was _______ interest in the newly launched product line, so the marketing team decided to revise its strategy.",
      options: ["A. few", "B. little", "C. a few", "D. many"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Danh từ 'interest' (sự quan tâm) là danh từ không đếm được → loại 'few, a few, many'.",
        "Bước 2: Ngữ cảnh vế sau phải đổi chiến lược cho thấy mức quan tâm rất ít, hầu như không có.",
        "Kết luận: Chọn (B) little.",
      ],
    },
  ],

  adjectives_adverbs: [
    {
      id: "adj-adv-ex-1",
      moduleIndex: 0,
      skillFocus: "Tính từ đuôi -ing vs -ed",
      questionStem:
        "The employees found the workshop on international trade regulations extremely _______ and informative.",
      options: [
        "A. interest",
        "B. interested",
        "C. interesting",
        "D. interestingly",
      ],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Cấu trúc 'find + tân ngữ (the workshop) + tính từ' nối song song với 'informative'.",
        "Bước 2: Tính từ mô tả bản chất thú vị của sự vật/hội thảo dùng đuôi -ing (cảm xúc con người dùng -ed).",
        "Kết luận: Chọn (C) interesting.",
      ],
    },
    {
      id: "adj-adv-ex-2",
      moduleIndex: 0,
      skillFocus: "Cấu trúc Keep + Tân ngữ + Tính từ",
      questionStem:
        "To maintain high production standards, the quality control team must keep the testing equipment _______.",
      options: ["A. clean", "B. cleanly", "C. cleanliness", "D. cleanse"],
      correctIndex: 0,
      explanationStepByStep: [
        "Bước 1: Nhận diện cấu trúc 'keep + Object + Adjective' (giữ cho thiết bị ở trạng thái sạch sẽ).",
        "Bước 2: Tránh bẫy chọn trạng từ 'cleanly' theo thói quen.",
        "Kết luận: Chọn tính từ (A) clean.",
      ],
    },
    {
      id: "adj-adv-ex-3",
      moduleIndex: 1,
      skillFocus: "Cặp dễ nhầm Hard vs Hardly",
      questionStem:
        "Ms. Davis _______ ever attends the weekly briefing meetings because her travel schedule is so demanding.",
      options: ["A. hard", "B. hardly", "C. harder", "D. hardness"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: 'hard' = chăm chỉ/vất vả; 'hardly' = hầu như không.",
        "Bước 2: Cụm 'hardly ever' nghĩa là 'hầu như không bao giờ', khớp với lý do lịch trình dày đặc.",
        "Kết luận: Chọn (B) hardly.",
      ],
    },
    {
      id: "adj-adv-ex-4",
      moduleIndex: 2,
      skillFocus: "Vị trí trạng từ giữa trợ động từ và động từ chính",
      questionStem:
        "The financial analysts have _______ submitted their annual revenue projections to the board of directors.",
      options: ["A. yet", "B. already", "C. still", "D. ago"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Câu khẳng định ở thì Hiện tại hoàn thành ('have _______ submitted').",
        "Bước 2: 'already' đặt giữa trợ động từ 'have' và V3 'submitted' (còn 'yet' đứng cuối câu phủ định/nghi vấn).",
        "Kết luận: Chọn (B) already.",
      ],
    },
  ],

  subject_verb: [
    {
      id: "sv-ex-1",
      moduleIndex: 0,
      skillFocus: "Gạch bỏ cụm giới từ chèn giữa Chủ ngữ và Động từ",
      questionStem:
        "The detailed report on the company's regional sales and expenditures _______ submitted to the accounting office this morning.",
      options: ["A. was", "B. were", "C. are", "D. have been"],
      correctIndex: 0,
      explanationStepByStep: [
        "Bước 1: Gạch bỏ cụm giới từ 'on the company's regional sales and expenditures'. Chủ ngữ lõi là 'The detailed report' (số ít).",
        "Bước 2: Cụm 'this morning' chỉ sự việc đã nộp trong quá khứ.",
        "Kết luận: Chọn (A) was.",
      ],
    },
    {
      id: "sv-ex-2",
      moduleIndex: 1,
      skillFocus: "Đại từ bất định luôn chia động từ số ít",
      questionStem:
        "According to the safety protocol, everyone entering the construction zone _______ required to wear a hard hat.",
      options: ["A. are", "B. is", "C. were", "D. have been"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Chủ ngữ chính là đại từ bất định 'everyone'.",
        "Bước 2: Các đại từ bất định (everyone, someone, each, nobody...) luôn chia động từ số ít.",
        "Kết luận: Chọn (B) is.",
      ],
    },
    {
      id: "sv-ex-3",
      moduleIndex: 1,
      skillFocus: "Phân biệt A number of vs The number of",
      questionStem:
        "_______ of applicants for the management position has increased significantly over the past two quarters.",
      options: ["A. A number", "B. The number", "C. Many", "D. Several"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Động từ chính là 'has increased' (chia ở ngôi số ít).",
        "Bước 2: 'The number of + N(nhiều) + V(số ít)' khác với 'A number of / Many / Several + N(nhiều) + V(số nhiều)'.",
        "Kết luận: Chọn (B) The number.",
      ],
    },
    {
      id: "sv-ex-4",
      moduleIndex: 2,
      skillFocus: "Cấu trúc kết nối As well as chia theo chủ ngữ thứ nhất",
      questionStem:
        "The chief executive officer, as well as several board members, _______ in favor of expanding into overseas markets.",
      options: ["A. is", "B. are", "C. were", "D. have been"],
      correctIndex: 0,
      explanationStepByStep: [
        "Bước 1: Với 'S1, as well as S2', động từ chia theo S1 ('The chief executive officer' — số ít).",
        "Bước 2: Phần ', as well as several board members,' chỉ là cụm bổ sung xen giữa.",
        "Kết luận: Chọn (A) is.",
      ],
    },
    {
      id: "sv-ex-5",
      moduleIndex: 3,
      skillFocus: "Chủ ngữ giả There is / There are theo danh từ phía sau",
      questionStem:
        "There _______ several unresolved technical discrepancies in the quarterly financial audit.",
      options: ["A. is", "B. are", "C. was", "D. has been"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Trong cấu trúc 'There + be + Noun', động từ chia theo danh từ đứng sau nó.",
        "Bước 2: Danh từ đứng sau là 'several unresolved technical discrepancies' (số nhiều).",
        "Kết luận: Chọn (B) are.",
      ],
    },
  ],

  modals: [
    {
      id: "modals-ex-1",
      moduleIndex: 0,
      skillFocus: "Tiếc nuối/trách móc quá khứ: Should have + V3",
      questionStem:
        "The contract dispute escalated because we _______ consulted our legal advisor before signing the agreement.",
      options: [
        "A. must have",
        "B. can have",
        "C. should have",
        "D. might have",
      ],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Tình huống tranh chấp leo thang vì trước đó đã không hỏi cố vấn pháp lý.",
        "Bước 2: 'should have + V3' dùng để diễn đạt việc 'lẽ ra nên làm' trong quá khứ nhưng đã không làm.",
        "Kết luận: Chọn (C) should have.",
      ],
    },
    {
      id: "modals-ex-2",
      moduleIndex: 1,
      skillFocus: "Phân biệt Cấm đoán (Mustn't) vs Không cần (Don't have to)",
      questionStem:
        "Visitors _______ enter the server room without authorization from the technical supervisor.",
      options: ["A. don't have to", "B. mustn't", "C. couldn't", "D. needn't"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Cụm 'without authorization' nêu quy định an ninh nghiêm ngặt đối với khách.",
        "Bước 2: 'mustn't' nghĩa là CẤM tuyệt đối; còn 'don't have to / needn't' nghĩa là không bắt buộc.",
        "Kết luận: Chọn (B) mustn't.",
      ],
    },
    {
      id: "modals-ex-3",
      moduleIndex: 1,
      skillFocus: "Nghĩa vụ khách quan từ quy định: Have to",
      questionStem:
        "According to the new tax policy, all corporations _______ submit their annual financial statements by the end of March.",
      options: ["A. must", "B. have to", "C. should", "D. ought"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Cụm 'According to the new tax policy' chỉ quy định bắt buộc từ luật pháp/bên ngoài.",
        "Bước 2: 'have to' ưu tiên cho nghĩa vụ khách quan do nội quy/luật định; 'ought' thiếu 'to' nên loại.",
        "Kết luận: Chọn (B) have to.",
      ],
    },
    {
      id: "modals-ex-4",
      moduleIndex: 2,
      skillFocus: "Suy đoán phủ định chắc chắn: Can't have + V3",
      questionStem:
        "The package _______ arrived yet because the courier service only picked it up an hour ago.",
      options: [
        "A. must have",
        "B. can't have",
        "C. should have",
        "D. might have",
      ],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Vế sau đưa bằng chứng kiện hàng mới được nhận đi một giờ trước.",
        "Bước 2: Suy đoán gần như chắc chắn KHÔNG THỂ đã xảy ra dùng 'can't have + V3'.",
        "Kết luận: Chọn (B) can't have.",
      ],
    },
  ],

  passive_voice: [
    {
      id: "passive-ex-1",
      moduleIndex: 0,
      skillFocus: "Bị động thì Hiện tại hoàn thành",
      questionStem:
        "All incoming complaints from clients _______ by the customer service department since Monday.",
      options: [
        "A. have handled",
        "B. have been handled",
        "C. are handling",
        "D. were handled",
      ],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Chủ ngữ 'All incoming complaints' là vật (khiếu nại được xử lý) và có tác nhân 'by the customer service department' → thể bị động.",
        "Bước 2: Dấu hiệu 'since Monday' yêu cầu thì Hiện tại hoàn thành bị động (have/has been + V3).",
        "Kết luận: Chủ ngữ số nhiều → Chọn (B) have been handled.",
      ],
    },
    {
      id: "passive-ex-2",
      moduleIndex: 0,
      skillFocus: "Bị động với Động từ khuyết thiếu",
      questionStem:
        "The terms of the lease agreement _______ only with the written consent of both parties.",
      options: [
        "A. can modify",
        "B. can be modified",
        "C. modify",
        "D. can be modifying",
      ],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Chủ ngữ 'The terms' (các điều khoản) không thể tự sửa đổi mà phải 'được sửa đổi'.",
        "Bước 2: Công thức bị động với modal verb là 'Modal + be + V3/ed'.",
        "Kết luận: Chọn (B) can be modified.",
      ],
    },
    {
      id: "passive-ex-3",
      moduleIndex: 1,
      skillFocus: "Thể sai khiến bị động: Have + vật + V3/ed",
      questionStem:
        "Because the factory copier was making unusual noises, the office manager had the machine _______ by a technician.",
      options: ["A. inspect", "B. inspecting", "C. inspected", "D. inspection"],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Nhận diện cấu trúc nhờ/thuê làm gì: 'had + the machine (vật) + _______ + by a technician'.",
        "Bước 2: Công thức 'have/get + something + V3/ed' (nhờ kỹ thuật viên kiểm tra máy).",
        "Kết luận: Chọn (C) inspected.",
      ],
    },
    {
      id: "passive-ex-4",
      moduleIndex: 2,
      skillFocus: "Bị động khách quan: be expected to + V-inf",
      questionStem:
        "The economic delegation from Singapore _______ to arrive at the international airport by 3:00 P.M.",
      options: ["A. expects", "B. expecting", "C. is expected", "D. has expected"],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Theo lịch trình, đoàn đại biểu 'được dự kiến là sẽ đến' lúc 3 giờ chiều.",
        "Bước 2: Cấu trúc bị động tường thuật/dự kiến: 'S + be expected/supposed + to-V'.",
        "Kết luận: Chủ ngữ số ít → Chọn (C) is expected.",
      ],
    },
  ],

  comparisons: [
    {
      id: "comparisons-ex-1",
      moduleIndex: 0,
      skillFocus: "Trạng từ nhấn mạnh trước So sánh hơn",
      questionStem:
        "The newly designed packaging is _______ more eye-catching than that of our competitors.",
      options: ["A. very", "B. much", "C. too", "D. so"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Câu dùng so sánh hơn 'more eye-catching than'.",
        "Bước 2: Không dùng 'very, too, so' trước so sánh hơn; phải dùng 'much / far / even / significantly'.",
        "Kết luận: Chọn (B) much.",
      ],
    },
    {
      id: "comparisons-ex-2",
      moduleIndex: 1,
      skillFocus: "So sánh kép (The more..., the more...)",
      questionStem:
        "The more thoroughly you review the financial statements, _______ you will detect discrepancies in the budget.",
      options: [
        "A. the easier",
        "B. easier",
        "C. more easily",
        "D. the more easily",
      ],
      correctIndex: 3,
      explanationStepByStep: [
        "Bước 1: Vế đầu có dạng 'The + so sánh hơn' → vế sau bắt buộc phải mở đầu bằng 'the + so sánh hơn'.",
        "Bước 2: Động từ chính vế sau là động từ thường 'detect' nên cần Trạng từ 'more easily'.",
        "Kết luận: Chọn (D) the more easily.",
      ],
    },
    {
      id: "comparisons-ex-3",
      moduleIndex: 2,
      skillFocus: "So sánh bội số: twice as many + N + as",
      questionStem:
        "Last month, the regional distribution center processed _______ orders as the local branch.",
      options: [
        "A. twice as many",
        "B. twice more",
        "C. as twice many",
        "D. twice as much",
      ],
      correctIndex: 0,
      explanationStepByStep: [
        "Bước 1: Công thức so sánh bội số: 'Số lần (twice) + as + many/much + N + as'.",
        "Bước 2: Danh từ 'orders' là đếm được số nhiều nên phải dùng 'many' (loại 'much').",
        "Kết luận: Chọn (A) twice as many.",
      ],
    },
    {
      id: "comparisons-ex-4",
      moduleIndex: 2,
      skillFocus: "Tính từ trong cấu trúc So sánh nhất",
      questionStem:
        "This is by far the most _______ proposal that the board of directors has evaluated this year.",
      options: [
        "A. innovate",
        "B. innovative",
        "C. innovatively",
        "D. innovation",
      ],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Cụm 'the most _______ proposal' cần một tính từ đứng trước bổ nghĩa cho danh từ 'proposal'.",
        "Bước 2: (B) 'innovative' là tính từ đuôi -ive.",
        "Kết luận: Chọn (B) innovative.",
      ],
    },
  ],

  gerund_infinitive: [
    {
      id: "gerund-ex-0",
      moduleIndex: 0,
      skillFocus: "Động từ bắt buộc đi với To-V (agree / decide / plan)",
      questionStem:
        "Both regional suppliers agreed _______ the revised delivery schedule before signing the contract.",
      options: ["A. accept", "B. accepting", "C. to accept", "D. accepted"],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Động từ chính đứng trước là 'agreed' (đồng ý).",
        "Bước 2: Nhóm động từ 'agree, decide, plan, expect, promise' luôn đi với động từ nguyên mẫu có 'to' (to-V).",
        "Kết luận: Chọn (C) to accept.",
      ],
    },
    {
      id: "gerund-ex-1",
      moduleIndex: 1,
      skillFocus: "Động từ bắt buộc đi với V-ing (avoid)",
      questionStem:
        "To avoid _______ confidential customer data, the firm has updated its cybersecurity software.",
      options: [
        "A. compromise",
        "B. to compromise",
        "C. compromising",
        "D. compromised",
      ],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Động từ đứng trước là 'avoid' (né tránh).",
        "Bước 2: Sau nhóm động từ 'avoid, consider, suggest, delay' luôn dùng V-ing.",
        "Kết luận: Chọn (C) compromising.",
      ],
    },
    {
      id: "gerund-ex-2",
      moduleIndex: 2,
      skillFocus: "Giới từ 'to' đi với V-ing (look forward to)",
      questionStem:
        "The executive board is looking forward to _______ the prospective investors at tomorrow's banquet.",
      options: ["A. meet", "B. meeting", "C. met", "D. meets"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Cụm 'look forward to' có từ 'to' là GIỚI TỪ chứ không phải 'to-V'.",
        "Bước 2: Sau giới từ luôn là Danh từ hoặc V-ing.",
        "Kết luận: Chọn (B) meeting.",
      ],
    },
    {
      id: "gerund-ex-3",
      moduleIndex: 2,
      skillFocus: "Cấu trúc quen thuộc: be used to + V-ing",
      questionStem:
        "Although transferring to the foreign branch was challenging initially, Ms. Taylor is now used to _______ in a multicultural environment.",
      options: ["A. work", "B. working", "C. worked", "D. be working"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Có động từ 'is' đứng trước 'used to' → cấu trúc 'be used to + V-ing' (quen với việc gì).",
        "Bước 2: Không nhầm với 'used to + V-bare' (từng làm gì trong quá khứ).",
        "Kết luận: Chọn (B) working.",
      ],
    },
    {
      id: "gerund-ex-4",
      moduleIndex: 3,
      skillFocus: "Động từ đổi nghĩa: Stop + To-V vs Stop + V-ing",
      questionStem:
        "After negotiating continuously for four hours, the committee members stopped _______ lunch before reviewing the final clauses.",
      options: ["A. have", "B. to have", "C. having", "D. had"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: 'stop + V-ing' = bỏ hẳn việc đang làm; 'stop + to-V' = tạm dừng việc đang làm ĐỂ làm việc khác.",
        "Bước 2: Ủy ban tạm dừng đàm phán để ăn trưa rồi mới quay lại xem tiếp điều khoản.",
        "Kết luận: Chọn (B) to have.",
      ],
    },
    {
      id: "gerund-ex-5",
      moduleIndex: 3,
      skillFocus: "Động từ đổi nghĩa: Remember + To-V",
      questionStem:
        "Please remember _______ all office computers and lock the archive room before leaving the building tonight.",
      options: [
        "A. shut down",
        "B. shutting down",
        "C. to shut down",
        "D. shut",
      ],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: 'remember + to-V' = nhớ phải làm một nhiệm vụ sắp tới; 'remember + V-ing' = nhớ lại chuyện đã làm.",
        "Bước 2: Đây là lời dặn dò việc cần làm tối nay trước khi rời văn phòng.",
        "Kết luận: Chọn (C) to shut down.",
      ],
    },
    {
      id: "gerund-ex-6",
      moduleIndex: 4,
      skillFocus: "Thành ngữ bắt buộc đi kèm V-ing (have difficulty + V-ing)",
      questionStem:
        "Several overseas clients had difficulty _______ the newly launched customer portal yesterday.",
      options: ["A. access", "B. to access", "C. accessing", "D. accessed"],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Nhận diện cấu trúc cố định 'have difficulty / trouble (in) + V-ing' (gặp khó khăn khi làm gì).",
        "Bước 2: Không dùng 'to-V' sau cụm từ này.",
        "Kết luận: Chọn (C) accessing.",
      ],
    },
  ],

  conjunctions_prepositions: [
    {
      id: "conj-ex-1",
      moduleIndex: 0,
      skillFocus: "Phân biệt Although (+ Mệnh đề) vs Despite (+ V-ing/Cụm N)",
      questionStem:
        "_______ experiencing severe shipment delays due to bad weather, the retailer managed to satisfy all holiday orders.",
      options: ["A. Although", "B. Despite", "C. Because", "D. Even though"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Sau chỗ trống là cụm V-ing 'experiencing severe shipment delays...', không có S + V chia thì.",
        "Bước 2: Cần giới từ chỉ sự tương phản (+ V-ing / Cụm N) → loại 'Although, Even though, Because'.",
        "Kết luận: Chọn (B) Despite.",
      ],
    },
    {
      id: "conj-ex-2",
      moduleIndex: 0,
      skillFocus: "Phân biệt Because (+ Mệnh đề) vs Because of (+ Cụm N)",
      questionStem:
        "The seminar on international accounting standards was postponed _______ several keynote speakers were unable to attend.",
      options: [
        "A. because of",
        "B. due to",
        "C. because",
        "D. in spite of",
      ],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Phía sau có mệnh đề hoàn chỉnh 'several keynote speakers (S) were (V) unable to attend'.",
        "Bước 2: 'because of, due to, in spite of' là giới từ chỉ đi với cụm danh từ; cần liên từ chỉ nguyên nhân.",
        "Kết luận: Chọn (C) because.",
      ],
    },
    {
      id: "conj-ex-3",
      moduleIndex: 0,
      skillFocus: "Phân biệt While (+ Mệnh đề) vs During (+ Cụm danh từ)",
      questionStem:
        "All mobile phones and recording devices must remain switched off _______ the conference presentation.",
      options: ["A. while", "B. during", "C. as", "D. since"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Đứng sau chỗ trống là cụm danh từ sự kiện 'the conference presentation'.",
        "Bước 2: 'while / as / since' là liên từ cần mệnh đề S + V; 'during' là giới từ đi với cụm danh từ.",
        "Kết luận: Chọn (B) during.",
      ],
    },
    {
      id: "conj-ex-4",
      moduleIndex: 1,
      skillFocus: "Phân biệt hạn chót By vs liên tục Until",
      questionStem:
        "All department managers must submit their revised annual budget proposals _______ 5:00 P.M. on Friday.",
      options: ["A. until", "B. by", "C. as", "D. during"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Động từ 'submit' (nộp) là hành động hoàn tất tại một thời điểm, không phải hành động kéo dài.",
        "Bước 2: Hạn chót (deadline) chậm nhất phải xong dùng 'by + mốc thời gian'.",
        "Kết luận: Chọn (B) by.",
      ],
    },
    {
      id: "conj-ex-5",
      moduleIndex: 2,
      skillFocus: "Liên từ điều kiện phòng ngừa: In case",
      questionStem:
        "Please keep a printed copy of your registration confirmation _______ the online ticketing system experiences technical difficulties.",
      options: ["A. in case", "B. unless", "C. so that", "D. although"],
      correctIndex: 0,
      explanationStepByStep: [
        "Bước 1: Xét nghĩa: giữ bản in để 'phòng khi / đề phòng' hệ thống trực tuyến gặp lỗi.",
        "Bước 2: 'in case' = phòng khi; 'unless' = trừ phi; 'so that' = để mà.",
        "Kết luận: Chọn (A) in case.",
      ],
    },
  ],

  relative_clauses: [
    {
      id: "rel-ex-1",
      moduleIndex: 0,
      skillFocus: "Đại từ quan hệ sở hữu: whose + Noun",
      questionStem:
        "We are looking for an experienced software developer _______ analytical skills can help optimize our database systems.",
      options: ["A. who", "B. whom", "C. whose", "D. which"],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Trước chỗ trống là danh từ chỉ người 'developer', ngay sau là danh từ 'analytical skills'.",
        "Bước 2: Quan hệ sở hữu ('kỹ năng phân tích CỦA lập trình viên đó') dùng đại từ 'whose'.",
        "Kết luận: Chọn (C) whose.",
      ],
    },
    {
      id: "rel-ex-2",
      moduleIndex: 1,
      skillFocus: "Cấm dùng 'that' trong mệnh đề quan hệ không xác định",
      questionStem:
        "The new commercial complex, _______ was designed by a world-renowned architect, will open to the public next month.",
      options: ["A. that", "B. which", "C. who", "D. what"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Có dấu phẩy trước chỗ trống → mệnh đề quan hệ không xác định, CẤM dùng 'that'.",
        "Bước 2: Danh từ được bổ nghĩa là vật ('The new commercial complex').",
        "Kết luận: Chọn (B) which.",
      ],
    },
    {
      id: "rel-ex-3",
      moduleIndex: 2,
      skillFocus: "Giới từ đi trước đại từ quan hệ chỉ người (to whom)",
      questionStem:
        "The senior consultant to _______ the client sent the confidential files has agreed to review the proposal immediately.",
      options: ["A. who", "B. that", "C. which", "D. whom"],
      correctIndex: 3,
      explanationStepByStep: [
        "Bước 1: Ngay trước chỗ trống là giới từ 'to' và danh từ chỉ người 'The senior consultant'.",
        "Bước 2: Sau giới từ, đại từ quan hệ chỉ người bắt buộc dùng 'whom' (cấm 'who' và 'that').",
        "Kết luận: Chọn (D) whom.",
      ],
    },
    {
      id: "rel-ex-4",
      moduleIndex: 2,
      skillFocus: "Trạng từ quan hệ nơi chốn Where vs Which",
      questionStem:
        "The central logistics warehouse, _______ the goods are inspected before shipment, operates twenty-four hours a day.",
      options: ["A. which", "B. where", "C. that", "D. when"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Mệnh đề sau 'the goods (S) are inspected (V bị động)' đã đủ thành phần chính, thiếu trạng ngữ nơi chốn ('tại nhà kho đó').",
        "Bước 2: Thay cho danh từ địa điểm đóng vai trò nơi diễn ra hành động (= at which) dùng 'where'.",
        "Kết luận: Chọn (B) where.",
      ],
    },
  ],

  conditionals: [
    {
      id: "cond-ex-0",
      moduleIndex: 0,
      skillFocus: "Đảo ngữ Câu điều kiện loại 3 với Had",
      questionStem:
        "_______ the supplier delivered the replacement components on schedule, the factory would have met its quarterly deadline.",
      options: ["A. If", "B. Should", "C. Were", "D. Had"],
      correctIndex: 3,
      explanationStepByStep: [
        "Bước 1: Vế chính dùng 'would have met' → Câu điều kiện loại 3.",
        "Bước 2: Sau chỗ trống có chủ ngữ 'the supplier' + V3 'delivered' nhưng không có 'If' → dùng đảo ngữ loại 3 'Had + S + V3/ed'.",
        "Kết luận: Chọn (D) Had.",
      ],
    },
    {
      id: "cond-ex-1",
      moduleIndex: 1,
      skillFocus: "Thức giả định (Subjunctive) sau recommend",
      questionStem:
        "The audit committee strongly recommended that the financial director _______ the quarterly expenditures immediately.",
      options: ["A. review", "B. reviews", "C. reviewed", "D. will review"],
      correctIndex: 0,
      explanationStepByStep: [
        "Bước 1: Động từ 'recommend + that + S + V' thuộc thức giả định.",
        "Bước 2: Trong thức giả định, động từ luôn giữ nguyên mẫu không 'to', bất kể chủ ngữ số ít hay thì quá khứ phía trước.",
        "Kết luận: Chọn (A) review.",
      ],
    },
    {
      id: "cond-ex-2",
      moduleIndex: 1,
      skillFocus: "Thức giả định với It is essential that",
      questionStem:
        "It is essential that every new employee _______ the mandatory safety training program within their first week.",
      options: [
        "A. completes",
        "B. complete",
        "C. completed",
        "D. has completed",
      ],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Nhận diện mẫu câu 'It is essential/necessary/crucial that + S + (should) + V-bare'.",
        "Bước 2: Chủ ngữ 'every new employee' số ít nhưng động từ vẫn giữ nguyên mẫu.",
        "Kết luận: Chọn (B) complete.",
      ],
    },
    {
      id: "cond-ex-3",
      moduleIndex: 2,
      skillFocus: "Câu điều kiện loại 2 trái thực tế hiện tại",
      questionStem:
        "If our regional branch _______ more qualified technical support staff, we would be able to resolve client inquiries much faster.",
      options: ["A. has", "B. had", "C. will have", "D. have had"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Mệnh đề chính dùng 'would be able to' → Câu điều kiện loại 2.",
        "Bước 2: Mệnh đề 'If' của điều kiện loại 2 lùi về Quá khứ đơn.",
        "Kết luận: Chọn (B) had.",
      ],
    },
    {
      id: "cond-ex-4",
      moduleIndex: 2,
      skillFocus: "Câu điều kiện loại 3 trái thực tế quá khứ (bị động)",
      questionStem:
        "If the supervisor had verified the invoice details, the accounting error _______ discovered before the audit.",
      options: [
        "A. will be",
        "B. would be",
        "C. would have been",
        "D. had been",
      ],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Mệnh đề 'If' chia Quá khứ hoàn thành ('had verified') → Câu điều kiện loại 3.",
        "Bước 2: Mệnh đề chính ở thể bị động dùng 'would have been + V3/ed'.",
        "Kết luận: Chọn (C) would have been.",
      ],
    },
    {
      id: "cond-ex-5",
      moduleIndex: 2,
      skillFocus: "Cấu trúc ước muốn Wish + would + V-bare",
      questionStem:
        "Many small business owners wish that the municipal government _______ commercial taxes to support local enterprises.",
      options: [
        "A. reduces",
        "B. will reduce",
        "C. would reduce",
        "D. is reducing",
      ],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Mệnh đề sau 'wish' luôn lùi thì, không dùng Hiện tại đơn hay 'will'.",
        "Bước 2: Mong muốn một chủ thể khác thay đổi hành động/chính sách trong tương lai dùng 'would + V-bare'.",
        "Kết luận: Chọn (C) would reduce.",
      ],
    },
  ],

  participles: [
    {
      id: "part-ex-0",
      moduleIndex: 0,
      skillFocus: "Tính từ phân từ: V-ed (bị động/hoàn tất) trước danh từ",
      questionStem:
        "Please review the _______ document carefully before joining tomorrow's budget conference call.",
      options: ["A. attach", "B. attaching", "C. attached", "D. attachment"],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Giữa mạo từ 'the' và danh từ 'document' cần một tính từ bổ nghĩa.",
        "Bước 2: Tài liệu 'được đính kèm' (trạng thái bị tác động đã hoàn tất) → dùng quá khứ phân từ V-ed.",
        "Kết luận: Chọn (C) attached.",
      ],
    },
    {
      id: "part-ex-1",
      moduleIndex: 1,
      skillFocus: "Rút gọn mệnh đề quan hệ bị động (V3/ed)",
      questionStem:
        "The warranty covers all replacement parts _______ by an authorized technician during the initial six-month period.",
      options: [
        "A. install",
        "B. installing",
        "C. installed",
        "D. were installed",
      ],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Câu đã có động từ chính 'covers', không chia thêm động từ thì 'were installed' (thiếu đại từ quan hệ).",
        "Bước 2: Linh kiện thay thế 'được lắp đặt bởi kỹ thuật viên' (bị động) → rút gọn còn V3/ed.",
        "Kết luận: Chọn (C) installed.",
      ],
    },
    {
      id: "part-ex-2",
      moduleIndex: 1,
      skillFocus: "Rút gọn mệnh đề quan hệ chủ động (V-ing)",
      questionStem:
        "Conference attendees _______ to register for the afternoon workshop should contact the coordinator before noon.",
      options: ["A. wish", "B. wishing", "C. wished", "D. are wishing"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Động từ chính của câu là 'should contact' → chỗ trống là phần rút gọn bổ nghĩa cho 'attendees'.",
        "Bước 2: Người tham dự chủ động mong muốn đăng ký ('who wish to register') → rút gọn chủ động dùng V-ing.",
        "Kết luận: Chọn (B) wishing.",
      ],
    },
    {
      id: "part-ex-3",
      moduleIndex: 1,
      skillFocus: "Mệnh đề phân từ hoàn thành: Having + V3/ed",
      questionStem:
        "_______ the terms of the updated lease agreement, the tenant decided to renew for another year.",
      options: [
        "A. Review",
        "B. Having reviewed",
        "C. Reviewed",
        "D. Was reviewing",
      ],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Cụm phân từ đầu câu chung chủ ngữ 'the tenant' (người thuê nhà chủ động xem xét).",
        "Bước 2: Việc xem xét xong trước khi quyết định gia hạn → dùng 'Having + V3' để nhấn mạnh trình tự trước sau.",
        "Kết luận: Chọn (B) Having reviewed.",
      ],
    },
    {
      id: "part-ex-4",
      moduleIndex: 1,
      skillFocus: "Mệnh đề phân từ chỉ nguyên nhân đầu câu",
      questionStem:
        "_______ that market competition would intensify, the company launched a new advertising campaign.",
      options: [
        "A. Anticipate",
        "B. Anticipating",
        "C. Anticipated",
        "D. Having anticipate",
      ],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Chủ ngữ vế chính là 'the company' (công ty chủ động dự đoán thị trường cạnh tranh).",
        "Bước 2: Rút gọn mệnh đề nguyên nhân chủ động cùng chủ ngữ đầu câu dùng hiện tại phân từ V-ing.",
        "Kết luận: Chọn (B) Anticipating.",
      ],
    },
  ],

  parallel_structure: [
    {
      id: "parallel-ex-1",
      moduleIndex: 0,
      skillFocus: "Chuỗi liệt kê đồng dạng với And",
      questionStem:
        "The new supervisor is responsible for delegating daily tasks, evaluating employee performance, and _______ monthly sales targets.",
      options: [
        "A. establish",
        "B. establishing",
        "C. established",
        "D. to establish",
      ],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Sau giới từ 'for' là chuỗi 3 hành động nối bằng 'and': 'delegating..., evaluating..., and _______'.",
        "Bước 2: Quy tắc song hành yêu cầu các thành phần cùng dạng thức V-ing.",
        "Kết luận: Chọn (B) establishing.",
      ],
    },
    {
      id: "parallel-ex-2",
      moduleIndex: 1,
      skillFocus: "Cặp liên từ tương quan: Not only... but also...",
      questionStem:
        "The product demonstration was not only engaging _______ highly educational for the visiting delegates.",
      options: ["A. and also", "B. but also", "C. as well", "D. or else"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Nhận diện cụm mở đầu 'not only' phía trước.",
        "Bước 2: Cặp liên từ tương quan chuẩn là 'not only ... but also ...'.",
        "Kết luận: Chọn (B) but also.",
      ],
    },
    {
      id: "parallel-ex-3",
      moduleIndex: 1,
      skillFocus: "Cặp liên từ tương quan: Both... and...",
      questionStem:
        "The corporate merger will affect both the headquarters in Chicago _______ the regional distribution centers.",
      options: ["A. or", "B. nor", "C. and", "D. but"],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Có từ 'both' đứng trước đối tượng thứ nhất.",
        "Bước 2: Cặp tương quan cố định là 'both ... and ...'.",
        "Kết luận: Chọn (C) and.",
      ],
    },
    {
      id: "parallel-ex-4",
      moduleIndex: 2,
      skillFocus: "Song hành với Prefer V-ing to V-ing",
      questionStem:
        "Most marketing associates prefer analyzing data electronically to _______ paper-based invoices manually.",
      options: [
        "A. process",
        "B. processing",
        "C. processed",
        "D. be processing",
      ],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Cấu trúc sở thích 'prefer V-ing to V-ing' có 'analyzing' đứng trước 'to'.",
        "Bước 2: Vế sau 'to' phải song hành cùng dạng danh động từ V-ing.",
        "Kết luận: Chọn (B) processing.",
      ],
    },
  ],

  inversion: [
    {
      id: "inv-ex-1",
      moduleIndex: 0,
      skillFocus: "Đảo ngữ với trạng từ bán phủ định đầu câu (Rarely)",
      questionStem:
        "Rarely _______ an applicant demonstrated such exceptional technical and interpersonal skills.",
      options: ["A. has", "B. had", "C. is", "D. did"],
      correctIndex: 0,
      explanationStepByStep: [
        "Bước 1: 'Rarely' đứng đầu câu → đảo trợ động từ lên trước chủ ngữ 'an applicant'.",
        "Bước 2: Động từ chính phía sau là quá khứ phân từ 'demonstrated' (thì Hiện tại hoàn thành).",
        "Kết luận: Chọn trợ động từ (A) has.",
      ],
    },
    {
      id: "inv-ex-2",
      moduleIndex: 1,
      skillFocus: "Đảo ngữ điều kiện loại 1 với Should",
      questionStem:
        "_______ the shipment not arrive by tomorrow afternoon, please notify the warehouse manager immediately.",
      options: ["A. If", "B. Should", "C. Were", "D. Had"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Động từ sau chủ ngữ ở dạng 'not arrive' (nguyên mẫu không chia), vế sau là câu mệnh lệnh.",
        "Bước 2: Đây là đảo ngữ điều kiện loại 1: 'Should + S + (not) + V-bare, ...'.",
        "Kết luận: Chọn (B) Should.",
      ],
    },
    {
      id: "inv-ex-3",
      moduleIndex: 1,
      skillFocus: "Đảo ngữ điều kiện loại 2 với Were",
      questionStem:
        "_______ the company to lower its wholesale prices, more retailers would stock its merchandise.",
      options: ["A. If", "B. Had", "C. Were", "D. Should"],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Vế chính dùng 'would stock' (điều kiện loại 2) và sau chủ ngữ là 'to lower'.",
        "Bước 2: Đảo ngữ điều kiện loại 2: 'Were + S + to-V, S + would + V-bare'.",
        "Kết luận: Chọn (C) Were.",
      ],
    },
    {
      id: "inv-ex-4",
      moduleIndex: 1,
      skillFocus: "Đảo ngữ với Only after (chỉ đảo ở mệnh đề chính)",
      questionStem:
        "Only after the auditor examined the receipts _______ discover the accounting discrepancy.",
      options: [
        "A. the manager did",
        "B. did the manager",
        "C. the manager was",
        "D. was the manager",
      ],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: 'Only after + mệnh đề' đứng đầu câu → đảo ngữ ở MỆNH ĐỀ CHÍNH phía sau.",
        "Bước 2: Động từ chính là động từ thường nguyên mẫu 'discover' ở quá khứ → mượn trợ động từ 'did' lên trước chủ ngữ.",
        "Kết luận: Chọn (B) did the manager.",
      ],
    },
  ],

  collocations: [
    {
      id: "coll-ex-0",
      moduleIndex: 0,
      skillFocus: "Cụm Động từ + Danh từ: meet the deadline / conduct a survey",
      questionStem:
        "The research department will _______ a comprehensive customer survey next month to collect product feedback.",
      options: ["A. make", "B. conduct", "C. meet", "D. address"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Danh từ tân ngữ phía sau là 'a comprehensive customer survey' (cuộc khảo sát).",
        "Bước 2: Động từ kết hợp tự nhiên với 'survey / research / inspection' là 'conduct' (tiến hành).",
        "Kết luận: Chọn (B) conduct.",
      ],
    },
    {
      id: "coll-ex-1",
      moduleIndex: 1,
      skillFocus: "Tính từ đi kèm giới từ cố định (eligible for)",
      questionStem:
        "Only employees who have completed the introductory training period are _______ for paid sick leave benefits.",
      options: ["A. capable", "B. eligible", "C. aware", "D. confident"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Quan sát giới từ 'for' đứng ngay sau chỗ trống.",
        "Bước 2: Cụm cố định 'eligible for + quyền lợi' nghĩa là đủ điều kiện hưởng; còn 'capable of', 'aware of', 'confident in/about'.",
        "Kết luận: Chọn (B) eligible.",
      ],
    },
    {
      id: "coll-ex-2",
      moduleIndex: 1,
      skillFocus: "Động từ đi với giới từ cố định (abide by)",
      questionStem:
        "All contractors participating in the bidding process must agree to _______ by the regulations set forth in the manual.",
      options: ["A. comply", "B. abide", "C. conform", "D. adhere"],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Đứng ngay sau chỗ trống là giới từ 'by'.",
        "Bước 2: Chỉ có 'abide by' (tuân thủ) đi với 'by'; các từ đồng nghĩa đi với giới từ khác: 'comply with', 'conform to', 'adhere to'.",
        "Kết luận: Chọn (B) abide.",
      ],
    },
    {
      id: "coll-ex-3",
      moduleIndex: 2,
      skillFocus: "Phân biệt Phrasal Verb: Put off (hoãn) vs Call off (hủy)",
      questionStem:
        "Because the factory equipment malfunctioned, the production manager decided to _______ the maintenance review until Thursday.",
      options: [
        "A. call off",
        "B. put off",
        "C. carry out",
        "D. look into",
      ],
      correctIndex: 1,
      explanationStepByStep: [
        "Bước 1: Cụm 'until Thursday' (cho đến thứ Năm) cho thấy lịch kiểm tra chỉ dời sang ngày khác chứ không hủy vĩnh viễn.",
        "Bước 2: 'put off' = tạm hoãn; 'call off' = hủy bỏ hoàn toàn; 'carry out' = tiến hành; 'look into' = điều tra.",
        "Kết luận: Chọn (B) put off.",
      ],
    },
    {
      id: "coll-ex-4",
      moduleIndex: 2,
      skillFocus: "Cụm động từ công sở: Carry out an inspection",
      questionStem:
        "The quality control team must _______ a thorough safety inspection before the assembly line resumes operations.",
      options: [
        "A. turn down",
        "B. give in",
        "C. carry out",
        "D. keep up",
      ],
      correctIndex: 2,
      explanationStepByStep: [
        "Bước 1: Danh từ theo sau là 'safety inspection' (cuộc thanh tra an toàn).",
        "Bước 2: Cụm chuẩn đi với inspection/survey/investigation là 'carry out' (tiến hành, thực hiện).",
        "Kết luận: Chọn (C) carry out.",
      ],
    },
  ],
};

/**
 * Lấy danh sách bài tập thực hành tại chỗ cho một chủ điểm
 * (bao gồm cả câu trắc nghiệm A–D và bài tập điền từ vào chỗ trống).
 */
export function getLessonPracticeExercises(
  tagCode: string
): LessonPracticeExercise[] {
  const base = LESSON_PRACTICE_EXERCISES[tagCode] ?? [];
  const extra = EXTRA_PRACTICE_EXERCISES[tagCode] ?? [];
  return [...base, ...extra];
}
