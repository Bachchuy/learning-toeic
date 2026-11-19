import type {
  GrammarLesson,
  TenseUsageDetail,
} from "./grammarLessons";

export interface ExtraRuleExample {
  en: string;
  vi: string;
  highlight?: string;
}

/**
 * Các ví dụ bổ sung được trích xuất & đối chiếu từ notebook "Ngữ pháp tiếng Anh cơ bản"
 * (English Grammar in Use & Barron's 600 Essential Words for the TOEIC)
 * cho các quy tắc hiện mới có 1 ví dụ, bảo đảm 100% quy tắc đều có >= 2 ví dụ.
 * Khóa map theo định dạng `${tagCode}::${rule.title}`.
 */
export const EXTRA_SECTION_EXAMPLES: Record<string, ExtraRuleExample[]> = {
  // ================= WORD FORM =================
  "word_form::Sau Mạo từ (a, an, the) hoặc Từ chỉ số lượng": [
    {
      en: "The cancellation clause appears at the back of the contract.",
      vi: "Điều khoản hủy bỏ xuất hiện ở mặt sau của hợp đồng.",
    },
    {
      en: "Each employee must conduct a careful inspection.",
      vi: "Mỗi nhân viên phải tiến hành một đợt kiểm tra cẩn thận.",
    },
  ],
  "word_form::Sau Tính từ sở hữu hoặc Sở hữu cách ('s)": [
    {
      en: "Her self-assurance showed clearly why she led the negotiations.",
      vi: "Sự tự tin của cô ấy cho thấy rõ lý do cô ấy dẫn dắt các cuộc đàm phán.",
    },
    {
      en: "The customer's specific complaint was not addressed in his e-mail.",
      vi: "Khiếu nại cụ thể của khách hàng chưa được giải quyết trong email của anh ấy.",
    },
  ],
  "word_form::Sau Giới từ": [
    {
      en: "The two parties agreed to a settlement in their contract dispute.",
      vi: "Hai bên đã đồng ý đạt được thỏa thuận dàn xếp trong vụ tranh chấp hợp đồng.",
    },
    {
      en: "Before engaging in a new business, it is important to do thorough research.",
      vi: "Trước khi tham gia vào một công việc kinh doanh mới, việc nghiên cứu kỹ lưỡng rất quan trọng.",
    },
  ],
  "word_form::Đứng trước Danh từ để bổ nghĩa": [
    {
      en: "The merger of the two companies established a powerful new corporation.",
      vi: "Sự sáp nhập của hai công ty đã tạo nên một tập đoàn mới đầy hùng mạnh.",
    },
    {
      en: "In a contract, one specific word can change the meaning dramatically.",
      vi: "Trong một bản hợp đồng, một từ ngữ cụ thể có thể làm thay đổi hoàn toàn ý nghĩa.",
    },
  ],
  "word_form::Đứng sau Động từ nối (Linking Verbs)": [
    {
      en: "The parties are agreeable to the terms of the revised contract.",
      vi: "Các bên đều sẵn lòng đồng ý với các điều khoản của hợp đồng sửa đổi.",
    },
    {
      en: "Garments become wrinkled after they have been tried on several times at the store.",
      vi: "Quần áo trở nên nhăn nhúm sau khi được thử nhiều lần tại cửa hàng.",
    },
  ],
  "word_form::Cấu trúc: Make / Keep / Find + Tân ngữ + Tính từ": [
    {
      en: "Some people find it difficult to concentrate when there is loud noise nearby.",
      vi: "Một số người nhận thấy thật khó để tập trung khi có nhiều tiếng ồn xung quanh.",
    },
    {
      en: "A quality raincoat can repel rain and keep you dry.",
      vi: "Một chiếc áo mưa chất lượng có thể chống thấm và giữ cho bạn luôn khô ráo.",
    },
  ],
  "word_form::Đứng giữa Trợ động từ và Động từ chính": [
    {
      en: "The numbers in the computer log should accurately reflect the actual stock on the shelf.",
      vi: "Số liệu trong nhật ký máy tính phải phản ánh chính xác lượng hàng thực tế trên kệ.",
    },
    {
      en: "Warranties for this kind of appliance are frequently limited in their coverage.",
      vi: "Chế độ bảo hành cho loại thiết bị này thường bị giới hạn về phạm vi.",
    },
  ],
  "word_form::Đứng trước Tính từ hoặc Trạng từ khác để nhấn mạnh": [
    {
      en: "The conference center manager was extremely accommodating during our stay.",
      vi: "Người quản lý trung tâm hội nghị cực kỳ niềm nở, chu đáo trong suốt kỳ lưu trú của chúng tôi.",
    },
    {
      en: "He negotiates so skillfully that both parties feel satisfied with the outcome.",
      vi: "Anh ấy đàm phán khéo léo đến mức cả hai bên đều cảm thấy hài lòng với kết quả.",
    },
  ],
  "word_form::Đứng đầu câu trước dấu phẩy hoặc cuối câu hoàn chỉnh": [
    {
      en: "Technically, the contractor was dismissed from the project due to missed deadlines.",
      vi: "Về mặt nguyên tắc kỹ thuật, nhà thầu đã bị chấm dứt hợp đồng do trễ hạn.",
    },
    {
      en: "Sam drove carefully along the narrow road after the evening storm.",
      vi: "Sam đã lái xe cẩn thận dọc theo con đường hẹp sau cơn bão tối.",
    },
  ],
  "word_form::Vị trí chuẩn của Động từ chính (Main Verb)": [
    {
      en: "The mediator resolved the problem to everyone's satisfaction.",
      vi: "Người hòa giải đã giải quyết vấn đề trước sự hài lòng của mọi người.",
    },
    {
      en: "The auditor carefully scrutinized the quarterly financial records.",
      vi: "Kiểm toán viên đã xem xét kỹ lưỡng các hồ sơ tài chính hàng quý.",
    },
  ],

  // ================= SUBJECT-VERB AGREEMENT =================
  "subject_verb::Cụm giới từ chèn giữa (Prepositional Phrases)": [
    {
      en: "The shipment from the supplier was short a number of items, so we complained.",
      vi: "Lô hàng gửi từ nhà cung cấp bị thiếu một số mặt hàng nên chúng tôi đã khiếu nại.",
    },
    {
      en: "A compilation of factors led us to inspect the missing warehouse inventory.",
      vi: "Sự tổng hợp của nhiều yếu tố đã khiến chúng tôi kiểm tra lượng hàng tồn thất thoát.",
    },
  ],
  "subject_verb::Mệnh đề quan hệ hoặc Cụm phân từ bổ nghĩa": [
    {
      en: "The building that was destroyed in the fire has now been rebuilt.",
      vi: "Tòa nhà bị phá hủy trong vụ hỏa hoạn hiện nay đã được xây dựng lại.",
    },
    {
      en: "The brochure containing the information I needed was very helpful.",
      vi: "Cuốn tài liệu chứa những thông tin tôi cần đã rất hữu ích.",
    },
  ],
  "subject_verb::Đại từ bất định luôn chia ĐỘNG TỪ SỐ ÍT": [
    {
      en: "Every seat in the theatre was taken before the keynote speech began.",
      vi: "Mọi chỗ ngồi trong khán phòng đều đã kín trước khi bài phát biểu chính bắt đầu.",
    },
    {
      en: "Neither of the restaurants we went to was expensive.",
      vi: "Cả hai nhà hàng mà chúng tôi đã đến đều không hề đắt đỏ.",
    },
  ],
  "subject_verb::Either... or, Neither... nor, Not only... but also (Chia theo B gần nhất)":
    [
      {
        en: "Neither Joe nor Sam has a car to commute to the regional office.",
        vi: "Cả Joe lẫn Sam đều không có ô tô để đi làm tới văn phòng khu vực.",
      },
      {
        en: "Not only the project manager but also the junior engineers are attending the workshop.",
        vi: "Không chỉ quản lý dự án mà các kỹ sư trẻ cũng đang tham dự buổi hội thảo.",
      },
    ],
  "subject_verb::As well as, Along with, Together with (Chia theo A đầu tiên)": [
    {
      en: "The executive director, as well as the department supervisors, is attending the trade conference.",
      vi: "Giám đốc điều hành cùng các trưởng bộ phận đang tham dự hội nghị thương mại.",
    },
    {
      en: "The revised contract, together with all associated invoices, was delivered yesterday.",
      vi: "Bản hợp đồng sửa đổi, cùng với toàn bộ hóa đơn liên quan, đã được giao hôm qua.",
    },
  ],
  "subject_verb::Danh từ Tập hợp doanh nghiệp (staff, committee, board, management)":
    [
      {
        en: "The planning committee was very selective about who received invitations.",
        vi: "Ban kế hoạch đã rất chọn lọc về những người nhận được giấy mời.",
      },
      {
        en: "The hotel staff was able to accommodate our many needs for the conference.",
        vi: "Đội ngũ nhân viên khách sạn đã đáp ứng tốt nhiều nhu cầu hội nghị của chúng tôi.",
      },
    ],

  // ================= PASSIVE VOICE =================
  "passive_voice::Bị động với Động từ khuyết thiếu (Modal Verbs)": [
    {
      en: "The situation is serious. Something must be done before it is too late.",
      vi: "Tình hình rất nghiêm trọng. Cần phải thực hiện biện pháp ngay trước khi quá muộn.",
    },
    {
      en: "The assumed results should be kept confidential until the product is retested.",
      vi: "Các kết quả giả định nên được giữ bí mật cho đến khi sản phẩm được kiểm nghiệm lại.",
    },
  ],
  "passive_voice::Bị động với Động từ 2 tân ngữ (give, send, offer, provide, grant)":
    [
      {
        en: "I have been offered the job, but I am still reviewing the relocation package.",
        vi: "Tôi đã được mời nhận công việc đó, nhưng tôi vẫn đang xem xét gói hỗ trợ chuyển chỗ.",
      },
      {
        en: "I didn't see the original document, but I was shown a certified copy.",
        vi: "Tôi không nhìn thấy bản tài liệu gốc, nhưng tôi đã được cho xem một bản sao.",
      },
    ],
  "passive_voice::Thể truyền khiến bị động (Causative Form)": [
    {
      en: "Lisa had the roof repaired yesterday before the heavy rain season began.",
      vi: "Hôm qua Lisa đã thuê người đến sửa mái nhà trước khi mùa mưa bắt đầu.",
    },
    {
      en: "You need to get this document translated into English as soon as possible.",
      vi: "Bạn cần đem tài liệu này đi dịch sang tiếng Anh càng sớm càng tốt.",
    },
  ],

  // ================= CONJUNCTIONS & PREPOSITIONS =================
  "conjunctions_prepositions::Unless (= If not: Trừ phi, nếu không)": [
    {
      en: "You cannot enter the restricted lab unless you are an authorized member.",
      vi: "Bạn không thể vào phòng thí nghiệm hạn chế trừ phi bạn là thành viên được ủy quyền.",
    },
    {
      en: "The company will have to close its branch unless business improves soon.",
      vi: "Công ty sẽ phải đóng cửa chi nhánh trừ khi tình hình kinh doanh sớm khởi sắc.",
    },
  ],
  "conjunctions_prepositions::Provided that / Providing that / As long as (Miễn là, chỉ khi)":
    [
      {
        en: "Travelling by car is convenient provided that you have somewhere to park.",
        vi: "Đi lại bằng ô tô rất thuận tiện miễn là bạn có chỗ để đỗ xe.",
      },
      {
        en: "You can borrow the company vehicle as long as you promise to return it by 6 PM.",
        vi: "Bạn có thể mượn xe công ty miễn là bạn hứa trả xe trước 6 giờ tối.",
      },
    ],
  "conjunctions_prepositions::In case (Phòng khi, dự phòng tình huống)": [
    {
      en: "Your delivery van should carry a spare wheel in case you have a puncture.",
      vi: "Xe giao hàng nên mang theo bánh dự phòng phòng khi bạn bị thủng lốp.",
    },
    {
      en: "I will write down my security password in case I forget it next week.",
      vi: "Tôi sẽ ghi lại mật khẩu bảo mật phòng khi tôi quên vào tuần tới.",
    },
  ],

  // ================= GERUND & INFINITIVE =================
  "gerund_infinitive::Cụm 'have difficulty/trouble (in)' & 'spend time/money'": [
    {
      en: "I had no trouble finding a reliable supplier for our packaging materials.",
      vi: "Tôi không gặp trở ngại nào trong việc tìm nhà cung cấp bao bì đáng tin cậy.",
    },
    {
      en: "The technician spent two hours trying to repair the main office printer.",
      vi: "Kỹ thuật viên đã dành hai giờ đồng hồ cố gắng sửa chiếc máy in chính của văn phòng.",
    },
  ],

  // ================= PARTICIPLES =================
  "participles::Mệnh đề Phân từ hoàn thành: Having + V3/V-ed": [
    {
      en: "Having finished her quarterly audit report, the accountant went home.",
      vi: "Sau khi đã hoàn thành xong báo cáo kiểm toán quý, kế toán viên đã ra về.",
    },
    {
      en: "Having seen the training presentation twice, the team mastered the workflow.",
      vi: "Vì đã xem bài thuyết trình đào tạo hai lần, cả nhóm đã nắm vững quy trình.",
    },
  ],

  // ================= RELATIVE CLAUSES =================
  "relative_clauses::Đại từ sở hữu: WHOSE": [
    {
      en: "We helped a woman whose company car had broken down near the highway.",
      vi: "Chúng tôi đã giúp đỡ một phụ nữ có chiếc xe công ty bị hỏng gần đường cao tốc.",
    },
    {
      en: "The firm prefers recruiting candidates whose leadership background fits our culture.",
      vi: "Công ty ưu tiên tuyển những ứng viên có nền tảng lãnh đạo phù hợp văn hóa công ty.",
    },
  ],
  "relative_clauses::Không dùng 'THAT' sau dấu phẩy và sau Giới từ": [
    {
      en: "The telecommunications firm for which she works operates across Asia.",
      vi: "Công ty viễn thông nơi cô ấy làm việc hoạt động khắp châu Á.",
    },
    {
      en: "The new headquarters, which cost millions of dollars, will open next week.",
      vi: "Trụ sở mới, công trình tiêu tốn hàng triệu đô la, sẽ mở cửa vào tuần tới.",
    },
  ],
  "relative_clauses::Mệnh đề Không Xác định (Extra Information Clauses with Commas)":
    [
      {
        en: "John, who speaks French fluently, applied for the overseas position.",
        vi: "John, người nói tiếng Pháp lưu loát, đã nộp đơn ứng tuyển vị trí ở nước ngoài.",
      },
      {
        en: "The annual report, which was published yesterday, outlines our five-year goals.",
        vi: "Báo cáo thường niên, được công bố hôm qua, phác thảo các mục tiêu năm năm của chúng tôi.",
      },
    ],

  // ================= CONDITIONALS & SUBJUNCTIVE =================
  "conditionals::Đảo ngữ Câu điều kiện Loại 1 với SHOULD": [
    {
      en: "Should the situation change, our customer team will let you know immediately.",
      vi: "Nếu tình hình có thay đổi, đội ngũ chăm sóc khách hàng sẽ báo ngay cho bạn.",
    },
    {
      en: "Should there be any technical problems, please call the IT helpdesk right away.",
      vi: "Nếu có bất kỳ sự cố kỹ thuật nào, vui lòng gọi bộ phận hỗ trợ IT ngay lập tức.",
    },
  ],
  "conditionals::Đảo ngữ Câu điều kiện Loại 3 với HAD": [
    {
      en: "Had we known about the flight delay, we would not have arrived so early.",
      vi: "Nếu như chúng tôi biết trước về việc chuyến bay bị hoãn, chúng tôi đã không đến sớm như vậy.",
    },
    {
      en: "Had the committee approved the funds earlier, the renovation would have started in June.",
      vi: "Nếu ủy ban phê duyệt ngân sách sớm hơn, việc tu sửa đã bắt đầu từ tháng Sáu.",
    },
  ],
  "conditionals::Cấu trúc với Động từ Khuyến nghị / Yêu cầu": [
    {
      en: "The committee suggested that something be done about the parking shortage.",
      vi: "Ủy ban đã đề xuất rằng cần phải có biện pháp giải quyết tình trạng thiếu chỗ đỗ xe.",
    },
    {
      en: "It is essential that everyone be here on time for the safety briefing.",
      vi: "Điều cốt yếu là mọi người bắt buộc phải có mặt đúng giờ tại buổi tập huấn an toàn.",
    },
  ],
  "conditionals::Loại 1: Có thật ở hiện tại hoặc tương lai (Real Condition)": [
    {
      en: "If it does not rain tomorrow morning, we will organize the outdoor event.",
      vi: "Nếu sáng mai trời không mưa, chúng tôi sẽ tổ chức sự kiện ngoài trời.",
    },
  ],
  "conditionals::Loại 2: Trái ngược với thực tế ở hiện tại (Unreal Present)": [
    {
      en: "If I were responsible for purchasing, I would negotiate a lower unit price.",
      vi: "Nếu tôi phụ trách mua hàng, tôi sẽ thương lượng một mức đơn giá thấp hơn.",
    },
  ],
  "conditionals::Loại 3: Trái ngược với thực tế trong quá khứ (Unreal Past)": [
    {
      en: "If I had known our partner was visiting, I would have booked a larger suite.",
      vi: "Nếu tôi mà biết đối tác sắp ghé thăm, tôi đã đặt một phòng lớn hơn rồi.",
    },
  ],
  "conditionals::Cấu trúc Ao ước với WISH / IF ONLY": [
    {
      en: "I wish I had a detailed schedule before entering the afternoon meeting.",
      vi: "Ước gì bây giờ tôi có lịch trình chi tiết trước khi bước vào cuộc họp buổi chiều.",
    },
    {
      en: "We wish we had checked the invoice total before transferring the deposit.",
      vi: "Chúng tôi ước gì đã kiểm tra lại tổng hóa đơn trước khi chuyển khoản đặt cọc.",
    },
  ],

  // ================= COMPARISONS =================
  "comparisons::Trạng từ chỉ mức độ đi với So sánh hơn": [
    {
      en: "Our updated packaging is significantly less expensive than the previous design.",
      vi: "Bao bì cập nhật của chúng tôi rẻ hơn đáng kể so với thiết kế trước đây.",
    },
    {
      en: "Her new managerial job is much more demanding than the previous one.",
      vi: "Công việc quản lý mới của cô ấy đòi hỏi nhiều áp lực hơn nhiều so với công việc trước.",
    },
  ],
  "comparisons::So sánh bằng với AS... AS": [
    {
      en: "Can you send me the verified shipping figures as soon as possible, please?",
      vi: "Làm ơn gửi cho tôi số liệu vận chuyển đã xác minh càng sớm càng tốt nhé?",
    },
  ],
  "comparisons::So sánh kép (The more... the more...)": [
    {
      en: "The more our sales representatives practiced, the more confident they became.",
      vi: "Đội ngũ kinh doanh càng luyện tập nhiều, họ lại càng trở nên tự tin hơn.",
    },
  ],
  "comparisons::So sánh Bội số (Multiple Comparisons)": [
    {
      en: "Petrol is twice as expensive as it was a few years ago.",
      vi: "Giá xăng hiện tại đắt gấp đôi so với giá cách đây vài năm.",
    },
    {
      en: "Their new logistics hub is about three times as big as our old warehouse.",
      vi: "Trung tâm hậu cần mới của họ to gấp khoảng ba lần nhà kho cũ của chúng tôi.",
    },
  ],

  // ================= NOUNS & PRONOUNS =================
  "nouns_pronouns::Đại từ phản thân (-self, -selves)": [
    {
      en: "Dr. Wan established herself as an authority on conflict resolution.",
      vi: "Tiến sĩ Wan đã khẳng định bản thân mình như một chuyên gia đầu ngành về giải quyết xung đột.",
    },
    {
      en: "I am not going to do that audit report for you; you can complete it yourself.",
      vi: "Tôi sẽ không làm báo cáo kiểm toán thay cho bạn đâu; bạn có thể tự mình hoàn thành nó.",
    },
  ],
  "nouns_pronouns::Lượng từ đi với Danh từ Không đếm được": [
    {
      en: "It is refreshing to see a manager with so much confidence in her employees.",
      vi: "Thật tuyệt vời khi thấy một người quản lý có nhiều niềm tin đến thế vào nhân viên của mình.",
    },
    {
      en: "Anna is very busy these days and has very little free time.",
      vi: "Dạo này Anna rất bận và có rất ít thời gian rảnh rỗi.",
    },
  ],
  "nouns_pronouns::Lượng từ đi với Danh từ Đếm được Số nhiều": [
    {
      en: "The warehouse manager ordered several new scanners for the shipping team.",
      vi: "Quản lý kho đã đặt mua vài máy quét mã vạch mới cho đội giao nhận.",
    },
    {
      en: "How many corporate clients attended the annual technology exhibition?",
      vi: "Có bao nhiêu khách hàng doanh nghiệp đã tham dự triển lãm công nghệ thường niên?",
    },
  ],

  // ================= ADJECTIVES & ADVERBS =================
  "adjectives_adverbs::Cấu trúc Keep / Make / Find + Tân ngữ + Tính từ": [
    {
      en: "Many analysts find it difficult to forecast seasonal demand accurately.",
      vi: "Nhiều chuyên viên phân tích thấy khó dự báo chính xác nhu cầu theo mùa.",
    },
  ],
  "adjectives_adverbs::Near (gần về khoảng cách) vs Nearly (gần như = almost)": [
    {
      en: "Anna lives quite near our office, so she rarely misses early briefings.",
      vi: "Anna sống khá gần văn phòng nên cô ấy hiếm khi bỏ lỡ các cuộc họp đầu giờ.",
    },
    {
      en: "We had spent nearly all our quarterly budget before the trade fair opened.",
      vi: "Chúng tôi đã tiêu gần như toàn bộ ngân sách quý trước khi hội chợ thương mại mở cửa.",
    },
  ],
  "adjectives_adverbs::High (vị trí cao) vs Highly (rất, ở mức độ cao)": [
    {
      en: "The company's recruitment resulted in ten highly qualified new employees.",
      vi: "Đợt tuyển dụng của công ty đã mang về mười nhân viên mới có trình độ rất cao.",
    },
    {
      en: "The wall around the loading bay was too high to climb over.",
      vi: "Bức tường quanh khu bốc dỡ hàng quá cao để có thể trèo qua.",
    },
  ],

  // ================= MODALS =================
  "modals::May / Might / Could (Có khả năng, không chắc chắn 50/50)": [
    {
      en: "Take an umbrella with you because it might rain later this afternoon.",
      vi: "Hãy mang theo một chiếc ô vì lát nữa vào buổi chiều trời có thể sẽ mưa đấy.",
    },
    {
      en: "There may not be enough time to discuss every proposal at today's meeting.",
      vi: "Có thể sẽ không đủ thời gian để thảo luận mọi đề xuất tại cuộc họp hôm nay.",
    },
  ],

  // ================= INVERSION =================
  "inversion::Trạng từ bán phủ định: Seldom, Rarely, Never, Hardly": [
    {
      en: "Rarely has an applicant demonstrated such exceptional qualifications.",
      vi: "Hiếm khi có một ứng viên nào thể hiện được năng lực chuyên môn xuất sắc đến như vậy.",
    },
    {
      en: "Never have we seen such strong demand for a newly released product.",
      vi: "Chưa bao giờ chúng tôi chứng kiến nhu cầu mạnh mẽ như vậy cho một sản phẩm mới ra mắt.",
    },
  ],
  "inversion::Cụm phủ định tuyệt đối: Under no circumstances": [
    {
      en: "Under no circumstances will refunds be issued without the original receipt.",
      vi: "Dưới bất kỳ hoàn cảnh nào tiền hoàn trả cũng sẽ không được cấp nếu thiếu hóa đơn gốc.",
    },
  ],

  // ================= COLLOCATIONS =================
  "collocations::Trạng từ + Tính từ thông dụng": [
    {
      en: "Extra supplies of the printer toner are readily available upon request.",
      vi: "Nguồn cung dự phòng mực máy in luôn sẵn có để cung cấp ngay khi có yêu cầu.",
    },
    {
      en: "The company is constantly recruiting highly qualified software engineers.",
      vi: "Công ty liên tục tuyển dụng các kỹ sư phần mềm có trình độ chuyên môn cao.",
    },
  ],
  "collocations::Cụm Giới từ cố định": [
    {
      en: "The vice president signed the merger documents on behalf of the board of directors.",
      vi: "Phó chủ tịch đã thay mặt hội đồng quản trị ký các văn kiện sáp nhập chính thức.",
    },
    {
      en: "The work was completed strictly in accordance with our technical specifications.",
      vi: "Công việc đã được hoàn thành đúng theo các chỉ số kỹ thuật quy định của chúng tôi.",
    },
  ],

  // ================= PARALLEL STRUCTURE =================
  "parallel_structure::Cặp liên từ tương quan chuẩn": [
    {
      en: "The facility provides training for both new recruits and experienced supervisors.",
      vi: "Cơ sở này cung cấp khóa đào tạo cho cả nhân viên mới lẫn các giám sát viên giàu kinh nghiệm.",
    },
    {
      en: "The seminar was not only informative but also inspiring for the entire sales team.",
      vi: "Buổi hội thảo không những đem lại nhiều thông tin bổ ích mà còn truyền cảm hứng cho cả đội ngũ.",
    },
  ],
};

/**
 * Bổ sung thêm cách dùng / ví dụ cho 4 thì hiện mới có 1 ví dụ trong `tenses`.
 */
export const EXTRA_TENSE_USAGES: Record<string, TenseUsageDetail[]> = {
  present_perfect_continuous: [
    {
      context:
        "Hành động vừa mới dừng lại nhưng để lại dấu vết hoặc kết quả rõ ràng ở hiện tại",
      explanation:
        "Thường dùng trong hội thoại thực tế khi nhìn thấy dấu hiệu mệt mỏi, quần áo lấm bẩn hoặc kết quả vừa xong.",
      exampleEn: "You are out of breath. Have you been running up the stairs?",
      exampleVi:
        "Bạn đang thở dốc kìa. Có phải bạn vừa mới chạy bộ lên cầu thang không?",
    },
  ],
  past_perfect: [
    {
      context:
        "Kinh nghiệm đã từng hoặc chưa từng xảy ra tính đến một mốc thời gian trong quá khứ",
      explanation:
        "Diễn tả trải nghiệm trước thời điểm quá khứ được nhắc tới, thường đi cùng 'before' hoặc 'never'.",
      exampleEn:
        "The man sitting next to me on the plane was nervous because he had never flown before.",
      exampleVi:
        "Người đàn ông ngồi cạnh tôi trên máy bay rất lo lắng vì trước đó ông ấy chưa từng đi máy bay.",
    },
  ],
  future_continuous: [
    {
      context:
        "Hoạt động hoặc lịch trình công việc sẽ diễn ra tự nhiên theo kế hoạch định sẵn",
      explanation:
        "Thường gặp trong email thông báo lịch kiểm kê, bảo trì hoặc hỏi thăm lịch trình tương lai một cách lịch sự.",
      exampleEn:
        "Our warehouse team will be running the inventory check next weekend, so finalize orders early.",
      exampleVi:
        "Đội kho của chúng tôi sẽ tiến hành kiểm kê hàng tồn kho cuối tuần tới, vì vậy hãy chốt đơn sớm.",
    },
  ],
  future_perfect_continuous: [
    {
      context:
        "Nhấn mạnh quãng thời gian vận hành hoặc gắn bó liên tục tính đến mốc tương lai",
      explanation:
        "Phổ biến trong báo cáo doanh nghiệp kết hợp 'By next month/year' + 'for + khoảng thời gian'.",
      exampleEn:
        "By next month, our support team will have been operating this data center for ten years.",
      exampleVi:
        "Tính đến tháng sau, đội ngũ hỗ trợ của chúng tôi sẽ vận hành trung tâm dữ liệu này tròn mười năm.",
    },
  ],
};

/**
 * Ví dụ bổ sung cho 6 quy tắc Phối hợp thì (Sequence of Tenses).
 */
export const EXTRA_SEQUENCE_EXAMPLES: Record<
  string,
  { en: string; vi: string }[]
> = {
  "Mệnh đề trạng ngữ chỉ thời gian (When, As soon as, Once, Before, After)": [
    {
      en: "I will send you an update as soon as I receive the signed inspection report.",
      vi: "Tôi sẽ gửi cập nhật cho bạn ngay sau khi tôi nhận được báo cáo kiểm tra đã ký.",
    },
    {
      en: "The warranty no longer covers your product once it expires.",
      vi: "Chế độ bảo hành sẽ không còn chi trả cho sản phẩm của bạn một khi nó hết hạn.",
    },
  ],
  "By the time + Hiện tại đơn  →  Tương lai hoàn thành": [
    {
      en: "By the time we get to the conference hall, the keynote speech will already have started.",
      vi: "Vào thời điểm chúng ta đến hội trường, bài phát biểu chính chắc chắn sẽ đã bắt đầu rồi.",
    },
  ],
  "By the time + Quá khứ đơn  →  Quá khứ hoàn thành": [
    {
      en: "By the time the delivery truck arrived at the warehouse, the staff had already left.",
      vi: "Vào thời điểm xe giao hàng đến kho, các nhân viên đã ra về từ trước đó rồi.",
    },
  ],
  "Hiện tại hoàn thành  +  SINCE  +  Quá khứ đơn": [
    {
      en: "Ms. Henderson has worked as accounting head since the firm opened five years ago.",
      vi: "Bà Henderson đã làm trưởng phòng kế toán kể từ khi công ty thành lập cách đây năm năm.",
    },
  ],
  "While  +  Quá khứ tiếp diễn,  Quá khứ đơn": [
    {
      en: "The office manager received an urgent message while she was reviewing the monthly budget.",
      vi: "Quản lý văn phòng đã nhận được tin nhắn khẩn trong khi cô ấy đang xem xét ngân sách tháng.",
    },
  ],
  "Used to + V-inf  VS  Be/Get used to + V-ing": [
    {
      en: "Lisa has lived in London for three years, so she is used to driving on the left.",
      vi: "Lisa đã sống ở Luân Đôn ba năm nên cô ấy đã quen với việc lái xe bên tay trái.",
    },
    {
      en: "Before electronic spreadsheets were adopted, clerks used to calculate totals by hand.",
      vi: "Trước khi bảng tính điện tử được áp dụng, nhân viên đã từng tính tổng hoàn toàn bằng tay.",
    },
  ],
};

/**
 * Làm giàu danh sách bài học gốc bằng các ví dụ bổ sung đã được chuẩn hóa từ NotebookLM.
 * Hoàn toàn bất biến (immutable): không làm mất bất kỳ trường/ví dụ gốc nào.
 */
export function enrichGrammarLessonsWithExtraExamples(
  rawLessons: Record<string, GrammarLesson>
): Record<string, GrammarLesson> {
  const enriched: Record<string, GrammarLesson> = {};

  for (const [tagCode, lesson] of Object.entries(rawLessons)) {
    const nextLesson: GrammarLesson = { ...lesson };

    if (lesson.detailedSections) {
      nextLesson.detailedSections = lesson.detailedSections.map((sec) => ({
        ...sec,
        rules: sec.rules.map((rule) => {
          const extras = EXTRA_SECTION_EXAMPLES[`${tagCode}::${rule.title}`];
          if (!extras || extras.length === 0) {
            return rule;
          }
          return {
            ...rule,
            examples: [...rule.examples, ...extras],
          };
        }),
      }));
    }

    if (lesson.tensesDetail) {
      nextLesson.tensesDetail = {
        ...lesson.tensesDetail,
        tenses: lesson.tensesDetail.tenses.map((tense) => {
          const extraUsages = EXTRA_TENSE_USAGES[tense.id];
          if (!extraUsages || extraUsages.length === 0) {
            return tense;
          }
          return {
            ...tense,
            usages: [...tense.usages, ...extraUsages],
          };
        }),
        sequenceRules: lesson.tensesDetail.sequenceRules.map((seq) => {
          const extras = EXTRA_SEQUENCE_EXAMPLES[seq.pattern];
          if (!extras || extras.length === 0) {
            return seq;
          }
          return {
            ...seq,
            extraExamples: [...(seq.extraExamples ?? []), ...extras],
          };
        }),
      };
    }

    enriched[tagCode] = nextLesson;
  }

  return enriched;
}
