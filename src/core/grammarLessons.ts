

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

export interface TenseUsageDetail {
  context: string;
  explanation: string;
  exampleEn: string;
  exampleVi: string;
  contextNote?: string;
}

export interface TenseItem {
  id: string;
  nameVi: string;
  nameEn: string;
  group: "present" | "past" | "future";
  groupVi: string;
  formula: {
    affirmative: string;
    negative: string;
    question: string;
  };
  usages: TenseUsageDetail[];
  signals: string[];
  stativeVerbNote?: string;
  toeicTip: string;
}

export interface SequenceOfTensesRule {
  pattern: string;
  ruleVi: string;
  exampleEn: string;
  exampleVi: string;
  trapNote?: string;
}

export interface DetailedTopicSection {
  title: string;
  description?: string;
  rules: {
    title: string;
    formula?: string;
    explanation: string;
    examples: {
      en: string;
      vi: string;
      highlight?: string;
    }[];
    signals?: string[];
    tip?: string;
  }[];
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
  tensesDetail?: {
    tenses: TenseItem[];
    sequenceRules: SequenceOfTensesRule[];
  };
  detailedSections?: DetailedTopicSection[];
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
    taglineVi: "Giáo trình toàn diện 11 thì TOEIC, cấu trúc (+ / - / ?), cách dùng & quy tắc phối hợp thì",
    estimatedMinutes: 12,
    coreRule: {
      definition:
        "Trong đề thi TOEIC Part 5, các câu hỏi về Thì động từ chiếm từ 15-20% (trung bình 4-6 câu mỗi đề). Bản chất của thì là diễn đạt hai thông tin cốt lõi: THỜI ĐIỂM hành động diễn ra (quá khứ, hiện tại, tương lai) và TÍNH CHẤT của hành động (đơn, tiếp diễn, hoàn thành, hoàn thành tiếp diễn).",
      keyFormulas: [
        "Hiện tại: Diễn tả chân lý tự nhiên, sự thật hiển nhiên, thói quen sinh hoạt hoặc lịch trình cố định.",
        "Quá khứ: Diễn tả sự việc đã hoàn tất dứt điểm trong quá khứ tại mốc thời gian xác định.",
        "Tương lai: Diễn tả dự đoán, lời hứa, kế hoạch hoặc sự kiện sắp diễn ra.",
        "Hoàn thành: Diễn tả hành động diễn ra trước một thời điểm hoặc kéo dài liên tục qua thời gian.",
      ],
      deepInsight:
        "Bí kíp 3 bước giải nhanh: (1) Quét tìm trạng từ thời gian (since, ago, recently, tomorrow); (2) Nếu không có trạng từ, xét sự phối hợp thì với mệnh đề còn lại; (3) Loại trừ ngay các phương án không phù hợp với ngữ cảnh thời gian và tính chất hành động.",
    },
    tensesDetail: {
      tenses: [
        {
          id: "present_simple",
          nameVi: "Hiện tại đơn",
          nameEn: "Present Simple",
          group: "present",
          groupVi: "Nhóm Hiện Tại",
          formula: {
            affirmative: "S + V(s/es) / be (am/is/are)",
            negative: "S + do/does + not + V-inf / am/is/are + not",
            question: "Do/Does + S + V-inf? / Am/Is/Are + S...?",
          },
          usages: [
            {
              context: "Chân lý khoa học & sự thật hiển nhiên",
              explanation: "Dùng để diễn tả các quy luật tự nhiên, sự thật hiển nhiên hoặc thực tế khách quan không đổi theo thời gian.",
              exampleEn: "Water boils at 100 degrees Celsius and freezes at 0 degrees.",
              exampleVi: "Nước sôi ở 100 độ C và đóng băng ở 0 độ C.",
            },
            {
              context: "Thói quen sinh hoạt & hành động lặp đi lặp lại",
              explanation: "Diễn tả nếp sống thường ngày, sở thích hoặc hành động có tính chu kỳ đều đặn.",
              exampleEn: "Sarah jogs in the central park every morning before having breakfast.",
              exampleVi: "Sarah chạy bộ ở công viên trung tâm mỗi buổi sáng trước khi ăn sáng.",
            },
            {
              context: "Lịch trình tàu xe, máy bay, thời gian biểu cố định",
              explanation: "Dù sự kiện diễn ra ở tương lai, nếu theo lịch trình cố định của phương tiện giao thông, rạp phim hay sự kiện công cộng thì vẫn dùng Hiện tại đơn.",
              exampleEn: "The express train to Chicago departs at 8:30 AM tomorrow.",
              exampleVi: "Chuyến tàu tốc hành đi Chicago khởi hành lúc 8:30 sáng ngày mai.",
            },
            {
              context: "Trạng thái, nhận thức & cảm xúc ở hiện tại",
              explanation: "Diễn tả suy nghĩ, cảm nhận, mong muốn hoặc thực tế sẵn có ở thời điểm hiện tại.",
              exampleEn: "The public library offers free Internet access to all registered members.",
              exampleVi: "Thư viện công cộng cung cấp truy cập Internet miễn phí cho tất cả các hội viên đã đăng ký.",
            },
          ],
          signals: ["always", "usually", "frequently", "regularly", "often", "sometimes", "every day/week/month", "once a week"],
          toeicTip: "Khi thấy câu nói về lịch trình chuyến bay, tàu xe, giờ mở cửa thư viện/bảo tàng hoặc thói quen có trạng từ tần suất (usually, every day), ưu tiên kiểm tra thì Hiện tại đơn trước.",
        },
        {
          id: "present_continuous",
          nameVi: "Hiện tại tiếp diễn",
          nameEn: "Present Continuous",
          group: "present",
          groupVi: "Nhóm Hiện Tại",
          formula: {
            affirmative: "S + am/is/are + V-ing",
            negative: "S + am/is/are + not + V-ing",
            question: "Am/Is/Are + S + V-ing?",
          },
          usages: [
            {
              context: "Hành động đang diễn ra ngay tại thời điểm nói",
              explanation: "Nhấn mạnh sự việc đang diễn biến xung quanh hoặc ngay lúc người nói phát biểu.",
              exampleEn: "The barista is currently preparing fresh coffee for waiting customers.",
              exampleVi: "Người pha chế hiện đang chuẩn bị cà phê tươi cho những khách hàng đang đợi.",
            },
            {
              context: "Kế hoạch đã được chuẩn bị cụ thể trong tương lai gần",
              explanation: "Diễn tả lịch hẹn, chuyến đi hoặc kế hoạch đã chốt thời gian và địa điểm rõ ràng.",
              exampleEn: "We are having dinner with our college friends at an Italian restaurant tonight.",
              exampleVi: "Tối nay chúng tôi sẽ đi ăn tối với những người bạn đại học tại một nhà hàng Ý.",
            },
            {
              context: "Xu hướng phát triển, sự biến đổi trong xã hội",
              explanation: "Miêu tả xu hướng mới hoặc sự thay đổi đang diễn ra trong cuộc sống hiện đại.",
              exampleEn: "More and more consumers are buying groceries through smartphone apps these days.",
              exampleVi: "Ngày càng có nhiều người tiêu dùng mua hàng tạp hóa qua ứng dụng điện thoại dạo gần đây.",
            },
          ],
          signals: ["now", "right now", "at the moment", "currently", "at present", "these days"],
          stativeVerbNote:
            "LƯU Ý CỰC KỲ QUAN TRỌNG: Các động từ chỉ trạng thái, nhận thức, cảm xúc (Stative Verbs) KHÔNG chia ở tiếp diễn: contain, belong to, own, possess, understand, recognize, believe, know, agree, prefer.",
          toeicTip: "Từ 'currently' (hiện tại) và 'now' là dấu hiệu vàng chỉ hành động đang diễn ra hoặc xu hướng đang phát triển trong đề thi.",
        },
        {
          id: "present_perfect",
          nameVi: "Hiện tại hoàn thành",
          nameEn: "Present Perfect",
          group: "present",
          groupVi: "Nhóm Hiện Tại",
          formula: {
            affirmative: "S + have/has + V3/V-ed",
            negative: "S + have/has + not + V3/V-ed",
            question: "Have/Has + S + V3/V-ed?",
          },
          usages: [
            {
              context: "Hành động bắt đầu trong quá khứ kéo dài liên tục đến hiện tại",
              explanation: "Rất thường dùng với 'since' (mốc thời gian bắt đầu) hoặc 'for' (khoảng thời gian tích lũy).",
              exampleEn: "Emma has lived in this beautiful coastal town for more than eight years.",
              exampleVi: "Emma đã sống ở thị trấn ven biển xinh đẹp này trong hơn tám năm qua.",
            },
            {
              context: "Trải nghiệm hoặc kinh nghiệm sống (đã từng / chưa từng)",
              explanation: "Nhấn mạnh vào việc đã trải qua hay chưa, không quan trọng mốc thời gian cụ thể.",
              exampleEn: "I have visited Japan twice, but I have never climbed Mount Fuji.",
              exampleVi: "Tôi đã từng đến Nhật Bản hai lần, nhưng tôi chưa bao giờ leo núi Phú Sĩ.",
            },
            {
              context: "Hành động vừa mới diễn ra, kết quả còn lưu lại ở hiện tại",
              explanation: "Thường đi cùng các phó từ: 'just' (vừa mới), 'already' (đã... rồi), 'recently' (gần đây).",
              exampleEn: "The delivery courier has just dropped off the package at the front desk.",
              exampleVi: "Người giao hàng vừa mới gửi kiện hàng tại bàn lễ tân.",
            },
          ],
          signals: ["since + mốc", "for + khoảng", "recently", "lately", "so far", "up to now", "already", "yet", "just", "over the past/last..."],
          toeicTip: "Cụm 'since + mốc' hoặc 'over the past/last + [khoảng thời gian]' LUÔN chia Hiện tại hoàn thành.",
        },
        {
          id: "present_perfect_continuous",
          nameVi: "Hiện tại hoàn thành tiếp diễn",
          nameEn: "Present Perfect Continuous",
          group: "present",
          groupVi: "Nhóm Hiện Tại",
          formula: {
            affirmative: "S + have/has + been + V-ing",
            negative: "S + have/has + not + been + V-ing",
            question: "Have/Has + S + been + V-ing?",
          },
          usages: [
            {
              context: "Nhấn mạnh tính liên tục không ngắt quãng của một hành động từ quá khứ tới nay",
              explanation: "Nhấn mạnh vào quá trình nỗ lực, sự kéo dài không ngừng nghỉ của hành động hơn là kết quả.",
              exampleEn: "Lucas has been practicing the guitar all afternoon for the upcoming school concert.",
              exampleVi: "Lucas đã liên tục tập đàn ghi-ta suốt cả buổi chiều cho buổi hòa nhạc sắp tới của trường.",
            },
          ],
          signals: ["all day", "all morning", "all afternoon", "for hours", "since morning"],
          toeicTip: "Thường đi kèm từ 'all' (all morning/all day/all afternoon) để nhấn mạnh sự kéo dài không gián đoạn của hành động.",
        },
        {
          id: "past_simple",
          nameVi: "Quá khứ đơn",
          nameEn: "Past Simple",
          group: "past",
          groupVi: "Nhóm Quá Khứ",
          formula: {
            affirmative: "S + V2/V-ed / was/were",
            negative: "S + did + not + V-inf / was/were + not",
            question: "Did + S + V-inf? / Was/Were + S...?",
          },
          usages: [
            {
              context: "Hành động đã xảy ra và chấm dứt hoàn toàn tại thời điểm xác định trong quá khứ",
              explanation: "Sự việc đã kết thúc hẳn, không còn dính dáng đến hiện tại và bắt buộc có mốc thời gian quá khứ rõ ràng.",
              exampleEn: "We booked our flight tickets to London two days ago.",
              exampleVi: "Chúng tôi đã đặt vé máy bay đi Luân Đôn cách đây hai ngày.",
            },
            {
              context: "Chuỗi hành động liên tiếp đã diễn ra trong quá khứ",
              explanation: "Kể lại một chuỗi việc đã xảy ra nối tiếp nhau theo trình tự thời gian.",
              exampleEn: "Daniel finished his homework, packed his backpack, and walked to the bus stop.",
              exampleVi: "Daniel làm xong bài tập về nhà, xếp ba lô rồi đi bộ ra trạm xe buýt.",
            },
          ],
          signals: ["yesterday", "ago", "last week/month/year", "in 2022", "previously", "originally"],
          toeicTip: "Thấy 'in + năm quá khứ' hoặc 'ago', 'yesterday' thì 100% là Quá khứ đơn, không bao giờ dùng Hiện tại hoàn thành.",
        },
        {
          id: "past_continuous",
          nameVi: "Quá khứ tiếp diễn",
          nameEn: "Past Continuous",
          group: "past",
          groupVi: "Nhóm Quá Khứ",
          formula: {
            affirmative: "S + was/were + V-ing",
            negative: "S + was/were + not + V-ing",
            question: "Was/Were + S + V-ing?",
          },
          usages: [
            {
              context: "Hành động đang xảy ra tại một thời điểm cụ thể trong quá khứ",
              explanation: "Có thời điểm chính xác (giờ + ngày trong quá khứ mà sự việc đang diễn biến).",
              exampleEn: "At 8:00 PM yesterday, our family was watching a comedy film together.",
              exampleVi: "Lúc 8:00 tối hôm qua, gia đình chúng tôi đang cùng nhau xem một bộ phim hài.",
            },
            {
              context: "Hành động đang diễn ra thì hành động khác cắt ngang",
              explanation: "Hành động đang diễn ra dùng Quá khứ tiếp diễn (sau While), hành động cắt ngang dùng Quá khứ đơn (sau When).",
              exampleEn: "While she was walking home from the supermarket, it suddenly started to rain.",
              exampleVi: "Trong khi cô ấy đang đi bộ từ siêu thị về nhà thì trời đột ngột đổ mưa.",
            },
          ],
          signals: ["at this time yesterday", "at 8:00 PM last night", "while", "when"],
          toeicTip: "Cấu trúc kinh điển: While + was/were V-ing (đang diễn ra), S + V2/V-ed (hành động xen vào).",
        },
        {
          id: "past_perfect",
          nameVi: "Quá khứ hoàn thành",
          nameEn: "Past Perfect",
          group: "past",
          groupVi: "Nhóm Quá Khứ",
          formula: {
            affirmative: "S + had + V3/V-ed",
            negative: "S + had + not + V3/V-ed",
            question: "Had + S + V3/V-ed?",
          },
          usages: [
            {
              context: "Hành động xảy ra và kết thúc TRƯỚC một hành động hoặc mốc thời gian khác trong quá khứ",
              explanation: "So sánh hai hành động trong quá khứ: hành động xảy ra trước chia Quá khứ hoàn thành (had + V3); hành động xảy ra sau chia Quá khứ đơn (V2/V-ed).",
              exampleEn: "By the time we arrived at the cinema, the movie had already started.",
              exampleVi: "Trước khi chúng tôi đến rạp chiếu phim, bộ phim đã bắt đầu chiếu rồi.",
            },
          ],
          signals: ["by the time + QKĐ", "before + QKĐ", "after + QKHT", "by + mốc quá khứ"],
          toeicTip: "Công thức vàng: By the time + S + V2/V-ed, S + had + V3/V-ed.",
        },
        {
          id: "future_simple",
          nameVi: "Tương lai đơn",
          nameEn: "Future Simple",
          group: "future",
          groupVi: "Nhóm Tương Lai",
          formula: {
            affirmative: "S + will + V-inf",
            negative: "S + will + not (won't) + V-inf",
            question: "Will + S + V-inf?",
          },
          usages: [
            {
              context: "Quyết định, lời hứa hoặc đề nghị giúp đỡ đưa ra ngay tại thời điểm nói",
              explanation: "Quyết định tức thì, không có kế hoạch tính toán từ trước; rất hay gặp trong giao tiếp và phản hồi hỗ trợ khách hàng.",
              exampleEn: "Don't worry about those heavy bags; I will carry them upstairs for you.",
              exampleVi: "Đừng lo về những chiếc túi nặng đó, tôi sẽ xách chúng lên lầu giúp bạn.",
            },
            {
              context: "Dự đoán tương lai hoặc thông báo sự kiện sắp tới",
              explanation: "Dùng để dự đoán theo cảm nhận hoặc thông báo thời gian khai trương, lịch biểu sự kiện.",
              exampleEn: "The newly renovated sports center will open to the community next Monday.",
              exampleVi: "Trung tâm thể thao mới được tân trang sẽ mở cửa phục vụ người dân vào thứ Hai tới.",
            },
          ],
          signals: ["tomorrow", "next week/month", "soon", "shortly", "upcoming", "in the future"],
          toeicTip: "Hai trạng từ 'shortly' và 'soon' là bạn đồng hành số 1 của 'will + V-inf'.",
        },
        {
          id: "near_future",
          nameVi: "Tương lai gần (Be going to)",
          nameEn: "Near Future (Be going to)",
          group: "future",
          groupVi: "Nhóm Tương Lai",
          formula: {
            affirmative: "S + am/is/are + going to + V-inf",
            negative: "S + am/is/are + not + going to + V-inf",
            question: "Am/Is/Are + S + going to + V-inf?",
          },
          usages: [
            {
              context: "Kế hoạch hoặc dự định đã được chuẩn bị và quyết định từ trước",
              explanation: "Hành động đã được lên kế hoạch, sắp xếp từ trước thời điểm nói.",
              exampleEn: "We are going to visit our grandparents in the countryside this weekend.",
              exampleVi: "Chúng tôi dự định sẽ về thăm ông bà ở quê vào cuối tuần này.",
            },
            {
              context: "Dự đoán tương lai có căn cứ hoặc dấu hiệu trực quan ở hiện tại",
              explanation: "Có hiện tượng quan sát được ngay trước mắt chỉ ra sự việc sắp xảy ra.",
              exampleEn: "Look at those dark clouds in the sky; it is going to rain very soon.",
              exampleVi: "Hãy nhìn những đám mây đen kịt trên bầu trời kìa; trời sắp sửa mưa rồi.",
            },
          ],
          signals: ["already decided", "in advance", "evidence in present", "look at that"],
          toeicTip: "Phân biệt với 'will': 'be going to' dùng cho kế hoạch đã có sự chuẩn bị từ trước hoặc dự đoán có bằng chứng cụ thể ngay trước mắt.",
        },
        {
          id: "future_continuous",
          nameVi: "Tương lai tiếp diễn",
          nameEn: "Future Continuous",
          group: "future",
          groupVi: "Nhóm Tương Lai",
          formula: {
            affirmative: "S + will + be + V-ing",
            negative: "S + will + not + be + V-ing",
            question: "Will + S + be + V-ing?",
          },
          usages: [
            {
              context: "Hành động sẽ đang diễn ra tại một thời điểm cụ thể trong tương lai",
              explanation: "Có mốc giờ hoặc thời điểm cụ thể trong tương lai mà tại đó hành động đang tiếp diễn.",
              exampleEn: "At this time tomorrow, they will be relaxing on the sunny beach in Da Nang.",
              exampleVi: "Vào thời điểm này ngày mai, họ sẽ đang thư giãn trên bãi biển đầy nắng ở Đà Nẵng.",
            },
          ],
          signals: ["at this time tomorrow", "at this time next week", "at + giờ + thời gian tương lai"],
          toeicTip: "Thấy cụm 'At this time next...' hoặc 'At this time tomorrow' -> chọn ngay 'will be + V-ing'.",
        },
        {
          id: "future_perfect",
          nameVi: "Tương lai hoàn thành",
          nameEn: "Future Perfect",
          group: "future",
          groupVi: "Nhóm Tương Lai",
          formula: {
            affirmative: "S + will + have + V3/V-ed",
            negative: "S + will + not + have + V3/V-ed",
            question: "Will + S + have + V3/V-ed?",
          },
          usages: [
            {
              context: "Hành động sẽ hoàn tất TRƯỚC một thời điểm hoặc hành động khác trong tương lai",
              explanation: "ĐIỂM NÓNG PART 5: Luôn đi cùng 'by the time' hoặc 'by + mốc thời gian tương lai'.",
              exampleEn: "By the end of this semester, students will have completed all their course projects.",
              exampleVi: "Trước khi kết thúc học kỳ này, các sinh viên sẽ hoàn thành xong tất cả các dự án môn học.",
            },
            {
              context: "Kết hợp với mệnh đề chỉ thời gian ở hiện tại đơn",
              explanation: "By the time + S + V(hiện tại đơn), S + will have + V3/V-ed.",
              exampleEn: "By the time your train arrives tomorrow morning, we will have prepared your guest room.",
              exampleVi: "Trước khi chuyến tàu của bạn đến vào sáng mai, chúng tôi sẽ chuẩn bị xong phòng dành cho bạn.",
            },
          ],
          signals: ["by the time + S + V(hiện tại)", "by the end of next month", "by 2028", "by Friday"],
          toeicTip: "BẤT BIẾN KINH ĐIỂN: By + mốc thời gian tương lai -> Chọn ngay 'will have + V3/V-ed'.",
        },
      ],
      sequenceRules: [
        {
          pattern: "Mệnh đề trạng ngữ chỉ thời gian (When, As soon as, Once, Before, After)",
          ruleVi: "Mệnh đề phụ chỉ thời gian KHÔNG DÙNG WILL, bắt buộc chia Hiện tại đơn; Mệnh đề chính dùng Tương lai đơn.",
          exampleEn: "As soon as you confirm your reservation, we will send you the flight tickets.",
          exampleVi: "Ngay khi bạn xác nhận đặt chỗ, chúng tôi sẽ gửi vé máy bay cho bạn.",
          trapNote: "ETS rất hay cho phương án bẫy 'will confirm' trong mệnh đề sau As soon as / Once / When.",
        },
        {
          pattern: "By the time + Hiện tại đơn  →  Tương lai hoàn thành",
          ruleVi: "By the time + S + V(hiện tại đơn), S + will have + V3/V-ed.",
          exampleEn: "By the time the music concert starts, the venue staff will have arranged all the seats.",
          exampleVi: "Trước khi buổi hòa nhạc bắt đầu, nhân viên khán phòng sẽ hoàn tất việc sắp xếp toàn bộ chỗ ngồi.",
        },
        {
          pattern: "By the time + Quá khứ đơn  →  Quá khứ hoàn thành",
          ruleVi: "By the time + S + V2/V-ed, S + had + V3/V-ed.",
          exampleEn: "By the time the doctor arrived, the nurse had already checked the patient's temperature.",
          exampleVi: "Trước khi bác sĩ đến, y tá đã kịp kiểm tra xong nhiệt độ của bệnh nhân.",
        },
        {
          pattern: "Hiện tại hoàn thành  +  SINCE  +  Quá khứ đơn",
          ruleVi: "S + have/has + V3/V-ed + since + S + V2/V-ed (hoặc mốc thời gian quá khứ).",
          exampleEn: "David has played the acoustic guitar since he was in high school.",
          exampleVi: "David đã chơi đàn ghi-ta thùng kể từ khi anh ấy còn học trung học.",
        },
        {
          pattern: "While  +  Quá khứ tiếp diễn,  Quá khứ đơn",
          ruleVi: "While + S + was/were + V-ing (hành động đang diễn ra), S + V2/V-ed (hành động xen vào).",
          exampleEn: "While Laura was reading a novel in the garden, her phone suddenly rang.",
          exampleVi: "Trong khi Laura đang đọc tiểu thuyết ngoài vườn thì điện thoại của cô ấy đột ngột reo.",
        },
      ],
    },
    cheatSheet: [
      {
        signal: "since + mốc / for + khoảng / recently / so far",
        rule: "Chia Hiện tại hoàn thành (have/has + V3/V-ed)",
        example: "Emma has lived in this coastal town for eight years.",
      },
      {
        signal: "yesterday / ago / last week / in 2023",
        rule: "Chia Quá khứ đơn (V-ed / V2)",
        example: "We booked our flight tickets to London two days ago.",
      },
      {
        signal: "next week / upcoming / soon / shortly",
        rule: "Chia Tương lai đơn (will + V-inf)",
        example: "The new community center will open to visitors tomorrow morning.",
      },
      {
        signal: "currently / right now / at present",
        rule: "Chia Hiện tại tiếp diễn (am/is/are + V-ing)",
        example: "The barista is currently preparing fresh beverages.",
      },
      {
        signal: "by the end of next month / by next year",
        rule: "Chia Tương lai hoàn thành (will have + V3/V-ed)",
        example: "By next Friday, the repair crew will have finished the road renovations.",
      },
      {
        signal: "by the time + S + V2/V-ed",
        rule: "Chia Quá khứ hoàn thành (had + V3/V-ed)",
        example: "By the time the guests arrived, we had set up the dinner table.",
      },
    ],
    traps: [
      {
        title: "Bẫy mệnh đề trạng ngữ chỉ thời gian (When / As soon as / Once / Before / After)",
        trapDescription:
          "ETS thường đặt chỗ trống trong mệnh đề phụ bắt đầu bằng When/As soon as/Once đi cùng một hành động tương lai ở mệnh đề chính. Học viên hay chọn 'will + V' theo quán tính.",
        correctRule:
          "Trong mệnh đề trạng ngữ chỉ thời gian/điều kiện, TUYỆT ĐỐI KHÔNG dùng 'will'. Phải dùng Hiện tại đơn hoặc Hiện tại hoàn thành để thay thế tương lai.",
        badExample: "As soon as Mr. Gomez will arrive, the movie will begin. (SAI)",
        goodExample: "As soon as Mr. Gomez arrives, the movie will begin. (ĐÚNG)",
      },
      {
        title: "Bẫy từ 'since' - Mệnh đề đi sau vs Mệnh đề chính",
        trapDescription:
          "Mệnh đề sau 'since' chia quá khứ đơn, nhưng mệnh đề chính phải chia hiện tại hoàn thành. Thí sinh hay chia đảo ngược hai vế.",
        correctRule: "S + have/has + V3/V-ed + SINCE + S + V2/V-ed (mốc bắt đầu).",
        badExample: "Since he has moved to this city, he made many friends. (SAI)",
        goodExample: "He has made many friends since he moved to this city. (ĐÚNG)",
      },
      {
        title: "Bẫy 'over the past/last + thời gian' tưởng là quá khứ đơn",
        trapDescription:
          "Thấy từ 'past' hoặc 'last' liền vội vàng chọn quá khứ đơn (V-ed). Tuy nhiên cụm 'over the past 5 years' có nghĩa là 'xuyên suốt 5 năm qua tính đến nay', hành động vẫn chưa kết thúc.",
        correctRule: "Over/In/During the past/last + [khoảng thời gian] LUÔN chia Hiện tại hoàn thành (have/has + V3).",
        badExample: "Over the last two years, consumer interest dropped. (SAI)",
        goodExample: "Over the last two years, consumer interest has increased steadily. (ĐÚNG)",
      },
    ],
    workedExample: {
      questionStem:
        "The airline _______ the updated international flight schedule to passengers by the end of this week.",
      options: [
        "A. announce",
        "B. will announce",
        "C. announced",
        "D. has been announced",
      ],
      correctIndex: 1,
      correctOption: "B. will announce",
      explanationStepByStep: [
        "Bước 1: Quét nhanh tìm trạng từ thời gian -> Thấy cụm 'by the end of this week' (vào cuối tuần này) -> Chỉ một sự việc sẽ xảy ra trong tương lai.",
        "Bước 2: Loại trừ (C) 'announced' (quá khứ) và (A) 'announce' (chủ ngữ số ít 'The airline' không thể đi với động từ nguyên mẫu số nhiều).",
        "Bước 3: Xem xét thể chủ động / bị động -> Hãng hàng không tự thông báo lịch bay đến hành khách (chủ động), loại (D) thể bị động.",
        "Kết luận: Chọn (B) will announce.",
      ],
    },
  },

  word_form: {
    tagCode: "word_form",
    category: "words_phrases",
    categoryVi: "Từ loại & Vị trí",
    titleVi: "Từ loại (Word Form)",
    taglineVi: "Quy tắc xác định vị trí Danh - Động - Tính - Trạng siêu tốc",
    estimatedMinutes: 8,
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
    detailedSections: [
      {
        title: "Vị trí & Cách dùng của Danh từ (Nouns)",
        description: "Danh từ đóng vai trò làm Chủ ngữ (S), Tân ngữ (O) hoặc Bổ ngữ (C) trong câu.",
        rules: [
          {
            title: "Sau Mạo từ (a, an, the) hoặc Từ chỉ số lượng",
            formula: "a/an/the/many/several + (Adj) + NOUN",
            explanation: "Nếu sau mạo từ đã có tính từ nhưng chưa có danh từ thì chỗ trống bắt buộc là danh từ.",
            examples: [
              {
                en: "The recent expansion has created several job opportunities.",
                vi: "Sự mở rộng gần đây đã tạo ra nhiều cơ hội việc làm.",
              },
            ],
            signals: ["a", "an", "the", "many", "several", "each", "every", "all"],
            tip: "Nếu chỗ trống đứng ngay sau mạo từ/tính từ và chưa có danh từ kết thúc cụm, 100% chọn Danh từ.",
          },
          {
            title: "Sau Tính từ sở hữu hoặc Sở hữu cách ('s)",
            formula: "my / your / our / their / his / her / company's + NOUN",
            explanation: "Tính từ sở hữu không bao giờ đứng một mình, phải có danh từ đi kèm.",
            examples: [
              {
                en: "The supervisor commended her outstanding performance.",
                vi: "Người giám sát đã khen ngợi hiệu suất làm việc xuất sắc của cô ấy.",
              },
            ],
            tip: "Đuôi sở hữu cách ('s) luôn kéo theo một Danh từ làm trung tâm.",
          },
          {
            title: "Sau Giới từ",
            formula: "Preposition (in, on, at, for, with, about...) + NOUN / V-ing",
            explanation: "Sau giới từ chỉ có thể là Danh từ hoặc Danh động từ (V-ing).",
            examples: [
              {
                en: "Thank you for your warm hospitality during our visit.",
                vi: "Cảm ơn sự hiếu khách nồng hậu của bạn trong suốt chuyến thăm của chúng tôi.",
              },
            ],
          },
        ],
      },
      {
        title: "Vị trí & Cách dùng của Tính từ (Adjectives)",
        description: "Tính từ dùng để miêu tả đặc điểm, tính chất của danh từ hoặc đại từ.",
        rules: [
          {
            title: "Đứng trước Danh từ để bổ nghĩa",
            formula: "Adj + NOUN",
            explanation: "Vị trí phổ biến nhất trong đề thi Part 5.",
            examples: [
              {
                en: "We offer comprehensive training for new recruits.",
                vi: "Chúng tôi cung cấp chương trình đào tạo toàn diện cho nhân viên mới.",
              },
            ],
            tip: "Nếu trước chỗ trống là mạo từ và sau chỗ trống là danh từ, chỗ trống chắc chắn là Tính từ.",
          },
          {
            title: "Đứng sau Động từ nối (Linking Verbs)",
            formula: "be / remain / stay / seem / appear / become + ADJECTIVE",
            explanation: "Không chia trạng từ sau các động từ nối này.",
            examples: [
              {
                en: "The conference room remains available for today's seminar.",
                vi: "Phòng hội nghị vẫn còn trống cho buổi hội thảo hôm nay.",
              },
            ],
            signals: ["remain", "stay", "seem", "appear", "become", "look"],
            tip: "Gặp 'remain' hoặc 'become' thì loại ngay trạng từ (-ly), chọn Tính từ.",
          },
          {
            title: "Cấu trúc: Make / Keep / Find + Tân ngữ + Tính từ",
            formula: "make / keep / find + Object + ADJECTIVE",
            explanation: "Giữ cho/làm cho ai/cái gì ở trạng thái như thế nào.",
            examples: [
              {
                en: "Please keep all personal identification details confidential.",
                vi: "Vui lòng giữ bảo mật tất cả các thông tin định danh cá nhân.",
              },
            ],
            tip: "Mặc dù dịch sang tiếng Việt có nghĩa 'một cách...', nhưng công thức bắt buộc dùng Tính từ.",
          },
        ],
      },
      {
        title: "Vị trí & Cách dùng của Trạng từ (Adverbs)",
        description: "Trạng từ bổ nghĩa cho Động từ, Tính từ hoặc một Trạng từ khác.",
        rules: [
          {
            title: "Đứng giữa Trợ động từ và Động từ chính",
            formula: "have/has + ADV + V3 / be + ADV + V-ing / modal + ADV + V-inf",
            explanation: "Vị trí độc quyền của trạng từ trong câu.",
            examples: [
              {
                en: "The software has successfully completed the data migration.",
                vi: "Phần mềm đã hoàn tất thành công quá trình di chuyển dữ liệu.",
              },
            ],
            tip: "Giữa 2 thành phần động từ (have ... V3) LUÔN LUÔN điền Trạng từ.",
          },
          {
            title: "Đứng trước Tính từ hoặc Trạng từ khác để nhấn mạnh",
            formula: "ADV + Adj / ADV + Adv",
            explanation: "Trạng từ chỉ mức độ bổ nghĩa cho tính từ.",
            examples: [
              {
                en: "The head chef has remarkably extensive culinary experience.",
                vi: "Bếp trưởng có kinh nghiệm ẩm thực phong phú đáng kinh ngạc.",
              },
            ],
          },
          {
            title: "Đứng đầu câu trước dấu phẩy hoặc cuối câu hoàn chỉnh",
            formula: "ADV, S + V + O  hoặc  S + V + O + ADV",
            explanation: "Bổ nghĩa cho toàn bộ mệnh đề của câu.",
            examples: [
              {
                en: "Unfortunately, the flight was delayed due to heavy fog.",
                vi: "Thật không may, chuyến bay đã bị hoãn do sương mù dày đặc.",
              },
            ],
            tip: "Chỗ trống đứng đầu câu trước dấu phẩy -> 95% là Trạng từ (-ly).",
          },
        ],
      },
    ],
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
    estimatedMinutes: 9,
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
    detailedSections: [
      {
        title: "1. Kỹ thuật triệt tiêu thành phần chèn giữa Chủ ngữ và Động từ",
        description: "ETS luôn tìm cách làm dài chủ ngữ bằng cách chèn thêm các cụm từ bổ nghĩa.",
        rules: [
          {
            title: "Cụm giới từ chèn giữa (Prepositional Phrases)",
            formula: "S (chính) + [giới từ + N phụ] + VERB",
            explanation: "Động từ luôn chia theo danh từ đứng trước giới từ đầu tiên. Bỏ qua toàn bộ phần trong ngoặc vuông.",
            examples: [
              {
                en: "The shipment of electronic components has arrived at the warehouse.",
                vi: "Lô hàng linh kiện điện tử đã cập bến nhà kho. (Chủ ngữ là 'The shipment' số ít, không phải 'components').",
              },
            ],
            signals: ["of", "in", "for", "with", "from", "between", "among"],
            tip: "Gạch chân danh từ đứng trước giới từ đầu tiên để xác định số ít/số nhiều.",
          },
          {
            title: "Mệnh đề quan hệ hoặc Cụm phân từ bổ nghĩa",
            formula: "S (chính) + [who / which / that / V-ing / V-ed...] + VERB chính",
            explanation: "Mệnh đề phụ xen vào không làm thay đổi số lượng của chủ ngữ chính.",
            examples: [
              {
                en: "The supervisor who oversees the regional sales teams attends every quarterly review.",
                vi: "Người giám sát quản lý các đội kinh doanh khu vực tham dự mọi buổi đánh giá quý. (Chủ ngữ là 'The supervisor' số ít).",
              },
            ],
          },
        ],
      },
      {
        title: "2. Quy tắc Đại từ bất định & Cụm từ chỉ lượng",
        description: "Các chủ ngữ đặc biệt luôn chia số ít hoặc số nhiều cố định.",
        rules: [
          {
            title: "Đại từ bất định luôn chia ĐỘNG TỪ SỐ ÍT",
            formula: "Each / Every / Anyone / Everyone / Somebody / Nobody / Either of / Neither of + V(số ít)",
            explanation: "Dù dịch nghĩa có thể là 'mọi người' nhưng về mặt ngữ pháp luôn đi với động từ số ít.",
            examples: [
              {
                en: "Each of the participants receives a certificate upon completion.",
                vi: "Mỗi người tham gia đều nhận được giấy chứng nhận sau khi hoàn thành.",
              },
            ],
            signals: ["each", "every", "everyone", "anybody", "nobody", "neither of", "either of"],
            tip: "Thấy 'Each of' hoặc 'Every' là chọn ngay động từ đuôi -s/es hoặc is/was/has.",
          },
          {
            title: "Phân biệt 'A number of' vs 'The number of'",
            formula: "A number of + N(số nhiều) + V(số nhiều)  vs  The number of + N(số nhiều) + V(số ít)",
            explanation: "'A number of' mang nghĩa 'Nhiều' (chia số nhiều). 'The number of' mang nghĩa 'Số lượng của...' (chia số ít).",
            examples: [
              {
                en: "A number of international investors have visited the factory this week.",
                vi: "Nhiều nhà đầu tư quốc tế đã đến tham quan nhà máy trong tuần này.",
              },
              {
                en: "The number of registered attendees has reached 500.",
                vi: "Số lượng người tham dự đã đăng ký đã đạt mốc 500 người.",
              },
            ],
            tip: "Nhớ mẹo: A = nhiều (Plural) -> V số nhiều; The = số lượng (Singular) -> V số ít.",
          },
        ],
      },
      {
        title: "3. Quy tắc Liên từ nối kép & Cụm nối đặc biệt",
        description: "Chia động từ theo chủ ngữ gần nhất hoặc chủ ngữ đứng trước.",
        rules: [
          {
            title: "Either... or, Neither... nor, Not only... but also (Chia theo B gần nhất)",
            formula: "Either A or B / Neither A nor B / Not only A but also B + VERB (chia theo B)",
            explanation: "Động từ chia theo danh từ đứng gần nó nhất.",
            examples: [
              {
                en: "Neither the director nor his assistants were aware of the regulation change.",
                vi: "Cả giám đốc lẫn các trợ lý của ông đều không biết về sự thay đổi quy định. (Chia theo 'assistants' số nhiều).",
              },
            ],
          },
          {
            title: "As well as, Along with, Together with (Chia theo A đầu tiên)",
            formula: "A + (as well as / together with / along with) + B + VERB (chia theo A)",
            explanation: "Cụm 'as well as B' chỉ là thành phần phụ chèn thêm, động từ vẫn chia theo A.",
            examples: [
              {
                en: "The CEO, along with several department heads, is attending the summit.",
                vi: "Tổng giám đốc cùng với một số trưởng bộ phận đang tham dự hội nghị thượng đỉnh. (Chia theo 'The CEO' số ít).",
              },
            ],
            tip: "Gặp as well as / along with, hãy gạch bỏ toàn bộ cụm đó và chia theo chủ ngữ đầu câu.",
          },
        ],
      },
    ],
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
    estimatedMinutes: 8,
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
    detailedSections: [
      {
        title: "1. Bảng công thức Bị động chuẩn 8 thì trong TOEIC",
        description: "Nguyên tắc bất biến: Mọi câu bị động đều phải có dạng Động từ BE + V3/V-ed.",
        rules: [
          {
            title: "Bị động các thì đơn (Hiện tại đơn, Quá khứ đơn, Tương lai đơn)",
            formula: "am/is/are + V3  |  was/were + V3  |  will be + V3",
            explanation: "Diễn tả hành động diễn ra thường xuyên, đã xong trong quá khứ hoặc sẽ diễn ra.",
            examples: [
              {
                en: "All invoices are processed electronically by the finance division.",
                vi: "Tất cả hóa đơn đều được phòng tài chính xử lý điện tử.",
              },
              {
                en: "The confidential contract was signed by both parties yesterday.",
                vi: "Hợp đồng bảo mật đã được cả hai bên ký kết vào hôm qua.",
              },
            ],
          },
          {
            title: "Bị động các thì hoàn thành & tiếp diễn",
            formula: "have/has/had + been + V3  |  am/is/are/was/were + being + V3",
            explanation: "Bị động hoàn thành luôn có 'been', bị động tiếp diễn luôn có 'being'.",
            examples: [
              {
                en: "The hotel policy has been revised to provide complimentary breakfast for all guests.",
                vi: "Chính sách của khách sạn đã được điều chỉnh nhằm phục vụ bữa sáng miễn phí cho mọi khách lưu trú.",
              },
              {
                en: "The auditorium is being prepared for the evening music concert.",
                vi: "Hội trường hiện đang được chuẩn bị cho buổi hòa nhạc tối nay.",
              },
            ],
            tip: "Thấy 'being' đứng trước V3/V-ed là bị động tiếp diễn (đang được làm).",
          },
          {
            title: "Bị động với Động từ khuyết thiếu (Modal Verbs)",
            formula: "modal (can, must, should, may) + be + V3/V-ed",
            explanation: "Theo sau modal verb luôn là 'be' nguyên mẫu kết hợp với V3.",
            examples: [
              {
                en: "Safety helmets must be worn at all times inside the construction site.",
                vi: "Mũ bảo hộ bắt buộc phải được đội mọi lúc bên trong công trường xây dựng.",
              },
            ],
          },
        ],
      },
      {
        title: "2. Bị động với Động từ 2 Tân ngữ & Thể truyền khiến",
        description: "Các dạng bị động nâng cao thường xuyên xuất hiện ở các câu 120-130 của Part 5.",
        rules: [
          {
            title: "Bị động với Động từ 2 tân ngữ (give, send, offer, provide, grant)",
            formula: "S(người) + be + V3 + Object(vật)  hoặc  S(vật) + be + V3 + to/for + Object(người)",
            explanation: "Khi chuyển bị động với chủ ngữ chỉ người, phía sau V3 vẫn có thể còn 1 tân ngữ chỉ vật.",
            examples: [
              {
                en: "All team leaders were granted administrative access to the client database.",
                vi: "Tất cả các trưởng nhóm đã được cấp quyền truy cập quản trị vào cơ sở dữ liệu khách hàng.",
              },
            ],
            tip: "Thấy 'grant, offer, award' thì dù sau chỗ trống có danh từ, vẫn có thể là dạng bị động với chủ ngữ chỉ người.",
          },
          {
            title: "Thể truyền khiến bị động (Causative Form)",
            formula: "have / get + Something + V3/V-ed",
            explanation: "Nhờ vả hoặc thuê chuyên gia làm dịch vụ cho mình.",
            examples: [
              {
                en: "The manager had the promotional brochures reprinted before the convention.",
                vi: "Người quản lý đã nhờ in lại các tờ rơi quảng cáo trước hội nghị.",
              },
            ],
          },
        ],
      },
    ],
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
        signal: "Các cấu trúc bị động phổ biến trong đề thi",
        rule: "be scheduled to, be required to, be expected to, be located in",
        example: "All visitors are required to wear identification badges.",
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
    estimatedMinutes: 8,
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
    detailedSections: [
      {
        title: "1. Bảng đối chiếu Cặp Sinh Đôi theo 4 nhóm nghĩa lớn",
        description: "Tuyệt đối không dịch nghĩa đơn thuần! Hãy xem vế sau có S+V hay chỉ là Cụm danh từ.",
        rules: [
          {
            title: "Nhóm Tương phản ('Mặc dù')",
            formula: "LIÊN TỪ: Although / Even though / Though (+ S + V)  |  GIỚI TỪ: Despite / In spite of (+ Noun/V-ing)",
            explanation: "Dù cùng mang nghĩa tương phản nhưng cấu trúc ngữ pháp hoàn toàn trái ngược.",
            examples: [
              {
                en: "Although the budget was severely constrained, the campaign succeeded.",
                vi: "Mặc dù ngân sách bị hạn chế nghiêm ngặt, chiến dịch vẫn thành công. (Sau Although là S+V: 'the budget was...').",
              },
              {
                en: "Despite severe budget constraints, the marketing campaign succeeded.",
                vi: "Mặc dù gặp hạn chế ngân sách nghiêm trọng, chiến dịch tiếp thị vẫn thành công. (Sau Despite là Cụm danh từ: 'severe budget constraints').",
              },
            ],
            tip: "Thấy 'Despite' hoặc 'In spite of' mà có động từ chia thì phía sau là đáp án sai.",
          },
          {
            title: "Nhóm Nguyên nhân ('Bởi vì')",
            formula: "LIÊN TỪ: Because / Since / As / Now that (+ S + V)  |  GIỚI TỪ: Because of / Due to / Owing to (+ Noun/V-ing)",
            explanation: "Diễn tả nguyên nhân dẫn tới kết quả ở mệnh đề chính.",
            examples: [
              {
                en: "The flight was delayed because severe storms struck the coast.",
                vi: "Chuyến bay bị hoãn vì bão lớn đổ bộ vào bờ biển. (Có động từ 'struck' -> Chọn liên từ Because).",
              },
              {
                en: "The flight was delayed due to severe weather conditions.",
                vi: "Chuyến bay bị hoãn do điều kiện thời tiết xấu. (Chỉ có cụm danh từ -> Chọn giới từ Due to).",
              },
            ],
          },
          {
            title: "Nhóm Thời gian: While vs During",
            formula: "While + S + V (hoặc While + V-ing)  |  During + Danh từ chỉ sự kiện / thời kỳ",
            explanation: "'During' chỉ đi với một danh từ chỉ thời gian hoặc sự kiện (during the meeting, during the summer).",
            examples: [
              {
                en: "Please keep your mobile phones silenced during the presentation.",
                vi: "Vui lòng giữ điện thoại ở chế độ im lặng trong suốt buổi thuyết trình.",
              },
              {
                en: "While the speaker was presenting, audience members took detailed notes.",
                vi: "Trong khi diễn giả đang thuyết trình, các khán giả đã ghi chép chi tiết.",
              },
            ],
            tip: "CẤM dùng 'During + S + V'. Chỉ có 'While + S + V'.",
          },
        ],
      },
    ],
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
    taglineVi: "Bản chất mục đích vs trải nghiệm & Bảng động từ To-V / V-ing chuẩn quốc tế",
    estimatedMinutes: 8,
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
    detailedSections: [
      {
        title: "1. Bảng 15 Động từ thông dụng bắt buộc đi với TO-V",
        description: "Hầu hết các động từ hướng về mục tiêu, kế hoạch hoặc dự định tương lai.",
        rules: [
          {
            title: "Nhóm động từ dự định, quyết định, cam kết",
            formula: "decide / plan / intend / agree / refuse / promise / offer / afford / manage + TO-V",
            explanation: "Sau các động từ này không bao giờ dùng V-ing.",
            examples: [
              {
                en: "The student club decided to organize a charity book drive this weekend.",
                vi: "Câu lạc bộ sinh viên đã quyết định tổ chức một buổi quyên góp sách từ thiện vào cuối tuần này.",
              },
              {
                en: "The airline offers to compensate passengers affected by flight delays.",
                vi: "Hãng hàng không đề nghị bồi thường cho hành khách bị ảnh hưởng bởi việc chuyến bay bị hoãn.",
              },
            ],
            tip: "Gặp 'decide, plan, hope, agree, refuse' -> Tìm ngay đáp án có 'To + V-inf'.",
          },
        ],
      },
      {
        title: "2. Bảng 15 Động từ thông dụng bắt buộc đi với V-ING",
        description: "Nhóm động từ liên quan đến sự cân nhắc, đề xuất, trì hoãn hoặc hoàn thành.",
        rules: [
          {
            title: "Nhóm động từ cân nhắc & trì hoãn",
            formula: "consider / suggest / recommend / postpone / delay / avoid / finish / appreciate + V-ING",
            explanation: "Đóng vai trò là danh động từ làm tân ngữ trực tiếp.",
            examples: [
              {
                en: "My family is currently considering traveling to Da Nang for our summer vacation.",
                vi: "Gia đình tôi hiện đang cân nhắc đi du lịch Đà Nẵng cho kỳ nghỉ hè năm nay.",
              },
              {
                en: "We sincerely appreciate your completing the customer feedback questionnaire.",
                vi: "Chúng tôi chân thành cảm kích việc bạn hoàn thành bảng câu hỏi phản hồi khách hàng.",
              },
            ],
            signals: ["consider", "suggest", "recommend", "postpone", "delay", "avoid", "appreciate"],
            tip: "Cực kỳ chú ý: 'suggest, recommend, consider' LUÔN đi với V-ing khi đứng làm tân ngữ trực tiếp.",
          },
        ],
      },
      {
        title: "3. Các cụm từ mà 'TO' là GIỚI TỪ (Đi với V-ing, cấm dùng V-inf)",
        description: "Điểm bẫy kinh điển nhất trong đề thi Part 5.",
        rules: [
          {
            title: "Cụm thành ngữ thông dụng với giới từ 'To'",
            formula: "look forward to / be committed to / be dedicated to / prior to + V-ING / NOUN",
            explanation: "Chữ 'to' ở đây là giới từ chỉ hướng hoặc cam kết, do đó thành phần theo sau phải là danh từ hoặc danh động từ.",
            examples: [
              {
                en: "We look forward to welcoming you to our coastal resort next weekend.",
                vi: "Chúng tôi rất mong được chào đón bạn đến với khu nghỉ dưỡng ven biển vào cuối tuần tới.",
              },
              {
                en: "Our organization is firmly committed to reducing plastic waste in the community.",
                vi: "Tổ chức của chúng tôi cam kết mạnh mẽ trong việc giảm thiểu rác thải nhựa trong cộng đồng.",
              },
            ],
            tip: "Thấy 'look forward to' hay 'committed to' -> 100% chọn đáp án đuôi V-ing.",
          },
        ],
      },
    ],
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
    estimatedMinutes: 8,
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
    detailedSections: [
      {
        title: "1. Tính từ phân từ (Participle Adjectives): V-ing vs V-ed",
        description: "Cách phân biệt tính từ chỉ tính chất chủ động (-ing) và tính từ chỉ trạng thái bị động (-ed).",
        rules: [
          {
            title: "Hiện tại phân từ (V-ing) làm Tính từ",
            formula: "V-ing + NOUN (Tính chất chủ động, gây ra tác động)",
            explanation: "Dùng để miêu tả bản chất của sự vật, hiện tượng hoặc xu hướng.",
            examples: [
              {
                en: "The survey reported an increasing demand for organic food options.",
                vi: "Khảo sát báo cáo nhu cầu ngày càng tăng đối với các lựa chọn thực phẩm hữu cơ.",
              },
              {
                en: "Bright Vision is a leading provider of digital photography services.",
                vi: "Bright Vision là nhà cung cấp hàng đầu về dịch vụ nhiếp ảnh kỹ thuật số.",
              },
            ],
            signals: ["increasing", "growing", "leading", "demanding", "promising", "existing"],
          },
          {
            title: "Quá khứ phân từ (V-ed) làm Tính từ",
            formula: "V-ed + NOUN (Trạng thái đã hoàn tất hoặc chịu tác động)",
            explanation: "Diễn tả đối tượng đã nhận tác động từ người khác.",
            examples: [
              {
                en: "Please review the attached document before tomorrow's conference call.",
                vi: "Vui lòng xem lại tài liệu đính kèm trước cuộc gọi hội nghị ngày mai.",
              },
              {
                en: "We need to hire an experienced project manager for the infrastructure project.",
                vi: "Chúng tôi cần thuê một giám đốc dự án giàu kinh nghiệm cho dự án hạ tầng.",
              },
            ],
            signals: ["attached", "enclosed", "revised", "detailed", "approved", "experienced", "customized"],
          },
        ],
      },
      {
        title: "2. Rút gọn mệnh đề quan hệ & Mệnh đề trạng ngữ",
        description: "Kỹ thuật lược bỏ đại từ quan hệ và to-be để câu văn súc tích.",
        rules: [
          {
            title: "Rút gọn Mệnh đề quan hệ thành Cụm phân từ",
            formula: "N + [who/which is + V-ing] -> N + V-ING  |  N + [which is + V-ed] -> N + V-ED",
            explanation: "Nếu mang nghĩa chủ động thì rút thành V-ing; nếu mang nghĩa bị động thì rút thành V-ed/V3.",
            examples: [
              {
                en: "Anyone requesting special travel accommodations should notify HR immediately.",
                vi: "Bất kỳ ai yêu cầu sắp xếp phương tiện di chuyển đặc biệt nên thông báo cho phòng nhân sự ngay.",
              },
              {
                en: "The revised budget approved by the board will take effect next quarter.",
                vi: "Ngân sách sửa đổi được hội đồng quản trị phê duyệt sẽ có hiệu lực vào quý tới.",
              },
            ],
          },
        ],
      },
    ],
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
    estimatedMinutes: 8,
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
    detailedSections: [
      {
        title: "1. Bảng tra cứu Đại từ quan hệ theo Chức năng",
        description: "Xác định nhanh đại từ quan hệ dựa vào danh từ phía trước và thành phần phía sau.",
        rules: [
          {
            title: "Đại từ chỉ người: WHO vs WHOM",
            formula: "N(người) + WHO + VERB  |  N(người) + WHOM + S + V",
            explanation: "'Who' đóng vai trò chủ ngữ nên theo sau là Động từ; 'Whom' đóng vai trò tân ngữ nên theo sau là một Mệnh đề (S+V).",
            examples: [
              {
                en: "The engineer who designed the automated sorting system received an award.",
                vi: "Kỹ sư người thiết kế hệ thống phân loại tự động đã nhận được giải thưởng.",
              },
              {
                en: "The candidate whom we interviewed this morning has exceptional qualifications.",
                vi: "Ứng viên mà chúng tôi phỏng vấn sáng nay có trình độ chuyên môn đặc biệt xuất sắc.",
              },
            ],
            tip: "Sau chỗ trống là Động từ -> Chọn WHO; Sau chỗ trống là S+V -> Chọn WHOM.",
          },
          {
            title: "Đại từ sở hữu: WHOSE",
            formula: "Noun + WHOSE + Noun (không có mạo từ a/an/the)",
            explanation: "'Whose' thay thế cho sở hữu cách của cả người và vật.",
            examples: [
              {
                en: "We signed a contract with a vendor whose prices were highly competitive.",
                vi: "Chúng tôi đã ký hợp đồng với một nhà cung cấp có mức giá hết sức cạnh tranh.",
              },
            ],
            tip: "Đặc điểm nhận dạng: Hai bên chỗ trống đều là Danh từ, và danh từ phía sau KHÔNG có mạo từ.",
          },
        ],
      },
      {
        title: "2. Hai quy tắc CẤM KỴ tuyệt đối với 'THAT'",
        description: "Điểm bẫy phổ biến nhất trong đề thi Part 5.",
        rules: [
          {
            title: "Không dùng 'THAT' sau dấu phẩy và sau Giới từ",
            formula: "Dấu phẩy (,) + THAT (SAI!)  |  Giới từ + THAT (SAI!)",
            explanation: "Sau giới từ chỉ được dùng WHOM (cho người) hoặc WHICH (cho vật). Không bao giờ dùng 'in that' hay 'with that' làm mệnh đề quan hệ.",
            examples: [
              {
                en: "The project in which we invested yielded substantial returns.",
                vi: "Dự án mà chúng tôi đầu tư vào đã mang lại lợi nhuận đáng kể. (Dùng in which, không dùng in that).",
              },
            ],
          },
        ],
      },
    ],
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
    estimatedMinutes: 8,
    coreRule: {
      definition:
        "Câu điều kiện diễn tả một giả định và kết quả tương ứng. Trong TOEIC, ngoài 3 loại câu điều kiện cơ bản, đề thi cực kỳ chuộng dạng ĐẢO NGỮ (lược bỏ If) để tạo văn phong trang trọng, lịch sự trong thư từ và giao tiếp quốc tế.",
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
    detailedSections: [
      {
        title: "1. Đảo ngữ Câu điều kiện (Đặc sản đề thi TOEIC)",
        description: "Văn phong trang trọng thường lược bỏ chữ 'IF' và đảo trợ động từ lên đầu câu.",
        rules: [
          {
            title: "Đảo ngữ Câu điều kiện Loại 1 với SHOULD",
            formula: "SHOULD + S + V-inf, S + will/can + V-inf (hoặc Câu mệnh lệnh: Please + V-inf)",
            explanation: "Thường dùng trong các thông báo hỗ trợ khách hàng hoặc thư từ trang trọng.",
            examples: [
              {
                en: "Should you have any inquiries regarding your booking, please contact customer support.",
                vi: "Nếu quý khách có bất kỳ câu hỏi nào liên quan đến việc đặt chỗ, xin vui lòng liên hệ bộ phận hỗ trợ khách hàng.",
              },
            ],
            signals: ["Should", "please contact", "do not hesitate"],
            tip: "Chỗ trống đứng đầu câu + vế sau có 'please' -> Chọn ngay 'Should'. Động từ sau S luôn nguyên mẫu.",
          },
          {
            title: "Đảo ngữ Câu điều kiện Loại 3 với HAD",
            formula: "HAD + S + V3/V-ed, S + would have + V3/V-ed",
            explanation: "Diễn tả sự tiếc nuối hoặc giả định trái ngược với quá khứ.",
            examples: [
              {
                en: "Had the supplier delivered the components on schedule, we would have met our deadline.",
                vi: "Nếu nhà cung cấp giao linh kiện đúng lịch trình, chúng tôi đã kịp hạn chót.",
              },
            ],
          },
        ],
      },
      {
        title: "2. Thể giả định thức (Subjunctive Mood) - Yêu cầu & Khuyến nghị",
        description: "Dùng sau các động từ hoặc tính từ thể hiện sự khẩn cấp, yêu cầu, khuyến nghị.",
        rules: [
          {
            title: "Cấu trúc với Động từ Khuyến nghị / Yêu cầu",
            formula: "S1 + (suggest / recommend / request / require / insist / mandate) + that + S2 + (should) + V-INF",
            explanation: "Động từ của mệnh đề sau 'that' LUÔN ở dạng nguyên mẫu không chia (V-inf), bất kể S2 là số ít hay số nhiều.",
            examples: [
              {
                en: "The doctor strongly recommended that the patient take adequate rest and drink plenty of fluids.",
                vi: "Bác sĩ khuyến nghị mạnh mẽ rằng bệnh nhân nên nghỉ ngơi đầy đủ và uống nhiều nước.",
              },
            ],
            signals: ["recommend that", "suggest that", "require that", "mandate that", "imperative that"],
            tip: "Thấy 'recommend that he...' thì động từ đi sau KHÔNG chia s/es, chọn nguyên mẫu V-inf.",
          },
        ],
      },
    ],
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
    estimatedMinutes: 7,
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
    detailedSections: [
      {
        title: "1. Các Trạng từ nhấn mạnh So sánh hơn (Điểm nóng đề thi)",
        description: "ETS rất hay kiểm tra từ đứng trước dạng so sánh hơn để tăng mức độ.",
        rules: [
          {
            title: "Trạng từ chỉ mức độ đi với So sánh hơn",
            formula: "much / far / significantly / considerably / substantially + MORE / Adj-er",
            explanation: "Các từ này mang nghĩa 'nhiều hơn đáng kể'. TUYỆT ĐỐI KHÔNG dùng 'very' trước so sánh hơn.",
            examples: [
              {
                en: "The upgraded server system is significantly faster than the old setup.",
                vi: "Hệ thống máy chủ được nâng cấp nhanh hơn đáng kể so với cấu hình cũ.",
              },
            ],
            signals: ["much", "far", "significantly", "considerably", "substantially"],
            tip: "Thấy 'than' mà trước chỗ trống có 'faster/more expensive', đáp án luôn là 'much / significantly'.",
          },
        ],
      },
      {
        title: "2. So sánh bằng & So sánh kép",
        description: "Cấu trúc đồng đẳng và cấu trúc 'càng... càng...'.",
        rules: [
          {
            title: "So sánh bằng với AS... AS",
            formula: "as + ADJ / ADV (nguyên mẫu) + as",
            explanation: "Giữa hai chữ 'as' bắt buộc là tính từ hoặc trạng từ ở dạng nguyên thể, không thêm -er hay more.",
            examples: [
              {
                en: "Please return the signed agreement as promptly as possible.",
                vi: "Vui lòng gửi lại thỏa thuận đã ký càng nhanh càng tốt.",
              },
            ],
          },
          {
            title: "So sánh kép (The more... the more...)",
            formula: "The + so sánh hơn (+ S + V), the + so sánh hơn (+ S + V)",
            explanation: "Càng... thì càng...",
            examples: [
              {
                en: "The more thoroughly you analyze the market data, the better your strategic decisions will be.",
                vi: "Bạn phân tích dữ liệu thị trường càng kỹ lưỡng thì các quyết định chiến lược sẽ càng chuẩn xác.",
              },
            ],
          },
        ],
      },
    ],
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
    estimatedMinutes: 8,
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
    detailedSections: [
      {
        title: "1. Bảng phân biệt các dạng Đại từ",
        description: "Nắm vững chức năng của từng dạng đại từ để điền đúng vào chỗ trống.",
        rules: [
          {
            title: "Tính từ sở hữu vs Đại từ sở hữu",
            formula: "Tính từ sở hữu + NOUN  |  Đại từ sở hữu = Tính từ sở hữu + Noun (đứng độc lập)",
            explanation: "Tính từ sở hữu (their, our, his, her) bắt buộc phải có danh từ theo sau; Đại từ sở hữu (theirs, ours, hers) đứng một mình.",
            examples: [
              {
                en: "Our sales figures exceeded their expectations.",
                vi: "Số liệu doanh thu của chúng tôi đã vượt quá kỳ vọng của họ. (their + danh từ).",
              },
              {
                en: "Your presentation was informative, and ours was equally well received.",
                vi: "Bài thuyết trình của bạn rất nhiều thông tin, và bài của chúng tôi (ours) cũng được đón nhận tốt không kém.",
              },
            ],
          },
          {
            title: "Đại từ phản thân (-self, -selves)",
            formula: "by + oneself = on one's own (tự thân làm)  |  S + V + O + oneself (nhấn mạnh)",
            explanation: "Dùng để nhấn mạnh chủ ngữ tự làm việc mà không cần ai giúp đỡ.",
            examples: [
              {
                en: "The software engineer resolved the complex network glitch by himself.",
                vi: "Kỹ sư phần mềm đã tự mình giải quyết sự cố mạng phức tạp.",
              },
            ],
            signals: ["by himself", "by herself", "by themselves", "on their own"],
          },
        ],
      },
      {
        title: "2. Danh từ không đếm được phổ biến trong đời sống & đề thi",
        description: "Các danh từ này KHÔNG BAO GIỜ có đuôi -s/es và KHÔNG đi với mạo từ a/an.",
        rules: [
          {
            title: "Danh sách Danh từ không đếm được kinh điển",
            formula: "information, equipment, luggage, baggage, advice, furniture, merchandise, machinery",
            explanation: "Luôn đi với động từ số ít và không có dạng số nhiều.",
            examples: [
              {
                en: "Passengers were advised to keep their luggage within the weight limit.",
                vi: "Hành khách được khuyên nên giữ hành lý (luggage) trong giới hạn trọng lượng quy định.",
              },
              {
                en: "The visitor asked the front desk for detailed tourist information about the city.",
                vi: "Khách tham quan đã hỏi quầy lễ tân để xin thông tin du lịch chi tiết về thành phố.",
              },
            ],
            tip: "Từ 'equipment' và 'information' không bao giờ có đuôi -s trong tiếng Anh chuẩn.",
          },
        ],
      },
    ],
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
    estimatedMinutes: 8,
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
    detailedSections: [
      {
        title: "1. Vị trí & Cấu trúc đặc biệt của Tính từ",
        description: "Các cấu trúc tính từ hay bẫy trong đề thi TOEIC.",
        rules: [
          {
            title: "Cấu trúc Keep / Make / Find + Tân ngữ + Tính từ",
            formula: "keep / make / find / leave + Object + ADJECTIVE",
            explanation: "Dù dịch sang tiếng Việt có từ 'một cách...', cấu trúc ngữ pháp bắt buộc dùng Tính từ.",
            examples: [
              {
                en: "The automated security system keeps customer credentials completely secure.",
                vi: "Hệ thống bảo mật tự động giữ cho thông tin đăng nhập của khách hàng hoàn toàn an toàn.",
              },
            ],
          },
          {
            title: "Phân biệt Tính từ đuôi -ed (cảm xúc) vs -ing (bản chất)",
            formula: "Người + feel + V-ed  |  Vật/Sự việc + is + V-ing",
            explanation: "-ed diễn tả cảm nhận của con người; -ing diễn tả tính chất của đối tượng.",
            examples: [
              {
                en: "The employees were satisfied with the annual bonus package.",
                vi: "Các nhân viên cảm thấy hài lòng với gói tiền thưởng hàng năm.",
              },
              {
                en: "The financial forecast showed satisfying growth figures.",
                vi: "Dự báo tài chính cho thấy các số liệu tăng trưởng đáng hài lòng.",
              },
            ],
          },
        ],
      },
    ],
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
    taglineVi: "Quy tắc Động từ khuyết thiếu & Cấu trúc giả định thức diễn đạt nguyện vọng",
    estimatedMinutes: 7,
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
    detailedSections: [
      {
        title: "1. Cấu trúc Động từ khuyết thiếu trong Quá khứ",
        description: "Diễn tả sự suy đoán hoặc nuối tiếc về một việc đã xảy ra.",
        rules: [
          {
            title: "Should have + V3/V-ed vs Must have + V3/V-ed",
            formula: "should have + V3 (đáng lẽ nên làm)  |  must have + V3 (chắc hẳn đã xảy ra)",
            explanation: "Thường gặp trong các đoạn hội thoại giải trình công việc hoặc báo cáo sự cố.",
            examples: [
              {
                en: "The technician should have checked the wiring before activating the machine.",
                vi: "Kỹ thuật viên đáng lẽ ra nên kiểm tra dây điện trước khi kích hoạt máy móc.",
              },
              {
                en: "Mr. Lee must have missed the announcement because he was not in the auditorium.",
                vi: "Ông Lee chắc hẳn đã bỏ lỡ thông báo vì ông không có mặt trong hội trường.",
              },
            ],
          },
        ],
      },
    ],
    cheatSheet: [
      {
        signal: "must / should / cannot + _______",
        rule: "Động từ nguyên mẫu V-inf",
        example: "All visitors must register at the reception desk.",
      },
      {
        signal: "suggest / recommend / require that + S + (should) + V-inf",
        rule: "Thể giả định: Động từ mệnh đề sau 'that' luôn ở dạng nguyên mẫu",
        example: "The doctor recommended that the patient get plenty of rest.",
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
    estimatedMinutes: 7,
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
    detailedSections: [
      {
        title: "1. Đảo ngữ với Trạng từ phủ định đứng đầu câu",
        description: "Khi các từ phủ định đứng đầu câu, trợ động từ được đưa lên trước chủ ngữ.",
        rules: [
          {
            title: "Trạng từ bán phủ định: Seldom, Rarely, Never, Hardly",
            formula: "Seldom / Rarely / Never + Trợ động từ (do/does/did/has/have) + S + V-inf",
            explanation: "Dùng để nhấn mạnh mức độ hiếm hoi, bất ngờ hoặc thành tích đặc biệt.",
            examples: [
              {
                en: "Rarely has a young athlete achieved such outstanding success so quickly.",
                vi: "Hiếm khi một vận động viên trẻ đạt được thành tích xuất sắc và nhanh chóng đến như vậy.",
              },
            ],
            signals: ["Rarely", "Seldom", "Never", "Hardly"],
          },
          {
            title: "Cụm phủ định tuyệt đối: Under no circumstances",
            formula: "Under no circumstances + modal / trợ động từ + S + V",
            explanation: "Tuyệt đối trong bất kỳ trường hợp nào cũng không được làm gì.",
            examples: [
              {
                en: "Under no circumstances should confidential patient records be disclosed to third parties.",
                vi: "Trong bất kỳ trường hợp nào, hồ sơ bảo mật của bệnh nhân cũng không được tiết lộ cho bên thứ ba.",
              },
            ],
          },
        ],
      },
    ],
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
    taglineVi: "Bảng vàng các cụm từ cố định tự nhiên ETS thường xuyên ra đề",
    estimatedMinutes: 8,
    coreRule: {
      definition:
        "Collocations là các cụm từ thường đi liền với nhau theo thói quen tự nhiên của người bản xứ trong đời sống và giao tiếp quốc tế. Dạng bài này không dựa vào ngữ pháp máy móc mà dựa vào vốn từ và sự tích lũy cụm từ tự nhiên.",
      keyFormulas: [
        "Động từ + Danh từ: meet the deadline / satisfy requirements / conduct a survey / address concerns",
        "Tính từ + Danh từ: mutual benefit / competitive price / tentative schedule / substantial growth",
        "Trạng từ + Tính từ: highly qualified / conveniently located / readily available",
        "Cụm giới từ: in compliance with / on behalf of / in accordance with",
      ],
      deepInsight:
        "Đừng học từ đơn lẻ! Luôn học cả cụm: Ví dụ thấy 'deadline' -> nhớ ngay động từ 'meet' (kịp hạn) hoặc 'extend' (gia hạn); thấy 'conduct' -> nhớ ngay 'survey / research / inspection'.",
    },
    detailedSections: [
      {
        title: "1. Các Cụm Động từ + Danh từ thông dụng nhất",
        description: "Học trọn cụm để xử lý câu hỏi từ vựng trong 3 giây.",
        rules: [
          {
            title: "Cụm với deadline, demand, requirements, survey",
            formula: "meet the deadline / satisfy demand / conduct a survey / address concerns",
            explanation: "Các động từ này đi kèm tân ngữ cố định theo quy ước thương mại quốc tế.",
            examples: [
              {
                en: "The development team worked overtime to meet the tight deadline.",
                vi: "Nhóm phát triển đã làm việc thêm giờ để kịp hạn chót gấp gáp.",
              },
              {
                en: "We will conduct a comprehensive survey to gather user feedback.",
                vi: "Chúng tôi sẽ tiến hành một cuộc khảo sát toàn diện để thu thập phản hồi của người dùng.",
              },
            ],
            signals: ["meet the deadline", "conduct a survey", "address concerns", "exceed expectations"],
          },
        ],
      },
      {
        title: "2. Cụm Trạng từ + Tính từ & Cụm Giới từ cố định",
        description: "Các cụm từ cố định kiểm tra độ nhạy ngôn ngữ của thí sinh.",
        rules: [
          {
            title: "Trạng từ + Tính từ thông dụng",
            formula: "conveniently located / highly qualified / readily available / strictly prohibited",
            explanation: "Thường miêu tả vị trí khách sạn/chi nhánh hoặc bằng cấp của ứng viên.",
            examples: [
              {
                en: "The newly opened conference hotel is conveniently located near the subway station.",
                vi: "Khách sạn hội nghị mới khai trương tọa lạc ở vị trí rất thuận tiện gần ga tàu điện ngầm.",
              },
            ],
          },
          {
            title: "Cụm Giới từ cố định",
            formula: "in compliance with (tuân thủ) / on behalf of (thay mặt) / in accordance with (phù hợp với)",
            explanation: "Thường xuất hiện trong các thông báo pháp lý và thư từ kinh doanh.",
            examples: [
              {
                en: "The plant operates in strict compliance with federal environmental regulations.",
                vi: "Nhà máy hoạt động tuân thủ nghiêm ngặt các quy định môi trường của liên bang.",
              },
            ],
          },
        ],
      },
    ],
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
        "Bước 2: Cụm từ cố định tự nhiên: 'conduct a survey' có nghĩa là tiến hành một cuộc khảo sát.",
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
    estimatedMinutes: 7,
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
    detailedSections: [
      {
        title: "1. Song hành với Liên từ kết hợp (And, Or, But)",
        description: "Các thành phần nối với nhau phải đồng đẳng về mặt từ loại và cấu trúc.",
        rules: [
          {
            title: "Chuỗi liệt kê đồng dạng",
            formula: "Noun, Noun, and NOUN  |  Adj, Adj, and ADJECTIVE  |  V-ing, V-ing, and V-ING",
            explanation: "Nếu hai vế đầu là tính từ thì vế thứ ba cũng bắt buộc là tính từ.",
            examples: [
              {
                en: "The candidate's presentation was clear, concise, and persuasive.",
                vi: "Bài thuyết trình của ứng viên rất rõ ràng, súc tích và có sức thuyết phục.",
              },
              {
                en: "Her responsibilities include drafting contracts, negotiating terms, and managing client accounts.",
                vi: "Trách nhiệm của cô ấy bao gồm soạn thảo hợp đồng, đàm phán điều khoản và quản lý tài khoản khách hàng.",
              },
            ],
            signals: ["and", "or", "but"],
            tip: "Nhìn từ trước 'and' là dạng gì (V-ing hay Adj), chọn đáp án cùng dạng đó.",
          },
        ],
      },
      {
        title: "2. Song hành với Liên từ tương quan (Correlative Conjunctions)",
        description: "Các cặp liên từ luôn đi đôi với nhau.",
        rules: [
          {
            title: "Cặp liên từ tương quan chuẩn",
            formula: "Both A and B  |  Not only A but also B  |  Either A or B  |  Neither A nor B",
            explanation: "Thành phần sau A và sau B phải hoàn toàn cùng dạng ngữ pháp.",
            examples: [
              {
                en: "The initiative aimed both to expand market share and to enhance brand loyalty.",
                vi: "Sáng kiến này nhằm vừa mở rộng thị phần vừa nâng cao lòng trung thành với thương hiệu.",
              },
            ],
            signals: ["both... and", "not only... but also", "either... or", "neither... nor"],
          },
        ],
      },
    ],
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
