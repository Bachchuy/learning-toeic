-- ==============================================================================
-- TOEIC AI Platform — Migration 03: Bộ câu hỏi Part 5 Thực chiến Chuẩn ETS
-- Dạng Pure SQL Statements (Không dùng DO $$ block, không gây hiểu nhầm RLS)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- CÂU 1: CẤU TẠO TỪ (Word Form)
-- ------------------------------------------------------------------------------
INSERT INTO public.questions (id, stem, option_a, option_b, option_c, option_d, tag_id, difficulty, status, content_hash)
VALUES (
  '22222222-2222-2222-2222-222222222201'::uuid,
  'Mr. Tanaka presented a ____ summary of the quarterly financial results at yesterday''s board meeting.',
  'brief', 'briefly', 'briefed', 'briefing',
  (SELECT id FROM public.grammar_tags WHERE tag_code = 'word_form'),
  1, 'published', 'ets_q01_wordforms'
)
ON CONFLICT (content_hash) DO UPDATE SET
  stem = EXCLUDED.stem, option_a = EXCLUDED.option_a, option_b = EXCLUDED.option_b,
  option_c = EXCLUDED.option_c, option_d = EXCLUDED.option_d, tag_id = EXCLUDED.tag_id;

INSERT INTO public.question_answers (question_id, correct_index, explanation)
VALUES (
  '22222222-2222-2222-2222-222222222201'::uuid,
  0,
  '{
    "rule_vi": "Cấu trúc cụm danh từ: Mạo từ (a/an/the) + Tính từ (Adjective) + Danh từ (Noun).",
    "why_correct_vi": "Chỗ trống đứng sau mạo từ ''a'' và đứng trước danh từ ''summary'' (bản tóm tắt). Do đó, chỗ trống bắt buộc phải là một Tính từ (Adjective) để bổ nghĩa cho ''summary''. Từ ''brief'' (ngắn gọn) là tính từ chính xác.",
    "full_translation_vi": "Ông Tanaka đã trình bày một bản tóm tắt ngắn gọn về kết quả tài chính hàng quý tại cuộc họp hội đồng quản trị ngày hôm qua.",
    "options_analysis": {
      "A": "brief (adj): ngắn gọn, súc tích (Đúng: bổ nghĩa cho danh từ summary)",
      "B": "briefly (adv): một cách ngắn gọn (Sai: trạng từ không đứng trước bổ nghĩa danh từ)",
      "C": "briefed (v-ed): đã hướng dẫn, đã chỉ đạo (Sai: không hợp ngữ cảnh)",
      "D": "briefing (n): cuộc họp ngắn, buổi chỉ dẫn (Sai: ghép với summary không tự nhiên)"
    },
    "tip_vi": "Khi gặp vị trí [a/an/the] + ______ + [Noun], 90% đáp án là Tính từ mang đuôi: -ive, -able, -al, -ic, hoặc tính từ ngắn thông dụng như brief, broad, quick.",
    "example_en": "She gave a brief presentation on the new budget plan.",
    "vocab_hints": [
      {"word": "summary", "meaning_vi": "bản tóm tắt"},
      {"word": "quarterly", "meaning_vi": "hàng quý (3 tháng một lần)"},
      {"word": "board meeting", "meaning_vi": "cuộc họp hội đồng quản trị"}
    ]
  }'::jsonb
)
ON CONFLICT (question_id) DO UPDATE SET
  correct_index = EXCLUDED.correct_index, explanation = EXCLUDED.explanation;

-- ------------------------------------------------------------------------------
-- CÂU 2: THÌ ĐỘNG TỪ (Tenses)
-- ------------------------------------------------------------------------------
INSERT INTO public.questions (id, stem, option_a, option_b, option_c, option_d, tag_id, difficulty, status, content_hash)
VALUES (
  '22222222-2222-2222-2222-222222222202'::uuid,
  'Ms. Gomez ____ as the director of the marketing department since January of last year.',
  'works', 'has worked', 'worked', 'is working',
  (SELECT id FROM public.grammar_tags WHERE tag_code = 'tenses'),
  1, 'published', 'ets_q02_tenses'
)
ON CONFLICT (content_hash) DO UPDATE SET
  stem = EXCLUDED.stem, option_a = EXCLUDED.option_a, option_b = EXCLUDED.option_b,
  option_c = EXCLUDED.option_c, option_d = EXCLUDED.option_d, tag_id = EXCLUDED.tag_id;

INSERT INTO public.question_answers (question_id, correct_index, explanation)
VALUES (
  '22222222-2222-2222-2222-222222222202'::uuid,
  1,
  '{
    "rule_vi": "Dấu hiệu ''since + mốc thời gian trong quá khứ'' là cấu trúc điển hình của thì Hiện tại Hoàn thành (have/has + V3/ed).",
    "why_correct_vi": "Mệnh đề có cụm chỉ thời gian ''since January of last year'' (kể từ tháng 1 năm ngoái đến nay). Hành động làm việc bắt đầu từ quá khứ và vẫn đang tiếp diễn ở hiện tại. Với chủ ngữ số ít ''Ms. Gomez'', ta dùng ''has worked''.",
    "full_translation_vi": "Bà Gomez đã làm việc với tư cách là giám đốc bộ phận tiếp thị kể từ tháng Giêng năm ngoái.",
    "options_analysis": {
      "A": "works: thì Hiện tại đơn (Sai: hiện tại đơn diễn tả thói quen, không đi với since + mốc thời gian)",
      "B": "has worked: thì Hiện tại hoàn thành (Đúng: diễn tả hành động kéo dài từ quá khứ đến nay)",
      "C": "worked: thì Quá khứ đơn (Sai: quá khứ đơn chỉ dùng cho hành động đã chấm dứt hoàn toàn)",
      "D": "is working: thì Hiện tại tiếp diễn (Sai: không dùng để diễn tả khoảng thời gian kéo dài với since)"
    },
    "tip_vi": "Nhìn thấy ''since + mốc thời gian'' hoặc ''for + khoảng thời gian'' -> Hãy kiểm tra ngay các phương án có dạng have/has + V3/ed.",
    "example_en": "They have lived in Singapore since 2015.",
    "vocab_hints": [
      {"word": "director", "meaning_vi": "giám đốc, người quản lý"},
      {"word": "marketing department", "meaning_vi": "phòng tiếp thị"},
      {"word": "since", "meaning_vi": "kể từ khi"}
    ]
  }'::jsonb
)
ON CONFLICT (question_id) DO UPDATE SET
  correct_index = EXCLUDED.correct_index, explanation = EXCLUDED.explanation;

-- ------------------------------------------------------------------------------
-- CÂU 3: CÂU BỊ ĐỘNG (Passive Voice)
-- ------------------------------------------------------------------------------
INSERT INTO public.questions (id, stem, option_a, option_b, option_c, option_d, tag_id, difficulty, status, content_hash)
VALUES (
  '22222222-2222-2222-2222-222222222203'::uuid,
  'All confidential files must be ____ before being discarded in the recycling bin.',
  'shred', 'shredding', 'shredded', 'shreds',
  (SELECT id FROM public.grammar_tags WHERE tag_code = 'passive_voice'),
  1, 'published', 'ets_q03_passive'
)
ON CONFLICT (content_hash) DO UPDATE SET
  stem = EXCLUDED.stem, option_a = EXCLUDED.option_a, option_b = EXCLUDED.option_b,
  option_c = EXCLUDED.option_c, option_d = EXCLUDED.option_d, tag_id = EXCLUDED.tag_id;

INSERT INTO public.question_answers (question_id, correct_index, explanation)
VALUES (
  '22222222-2222-2222-2222-222222222203'::uuid,
  2,
  '{
    "rule_vi": "Cấu trúc bị động với Động từ khuyết thiếu: Modal Verb + be + Past Participle (V3/ed).",
    "why_correct_vi": "Chủ ngữ là danh từ chỉ vật ''All confidential files'' (tất cả hồ sơ mật) không thể tự hành động mà phải được xử lý. Sau động từ khuyết thiếu bị động ''must be'', ta cần một quá khứ phân từ V3/ed: ''shredded'' (được cắt nhỏ tiêu hủy).",
    "full_translation_vi": "Tất cả các tài liệu bảo mật phải được cắt vụn trước khi bị vứt vào thùng tái chế.",
    "options_analysis": {
      "A": "shred: động từ nguyên mẫu (Sai: sau ''must be'' không đi trực tiếp với V-inf)",
      "B": "shredding: V-ing (Sai: tạo thành dạng tiếp diễn mang nghĩa chủ động)",
      "C": "shredded: phân từ hai V3/ed (Đúng: tạo thành thể bị động ''must be shredded'')",
      "D": "shreds: động từ ngôi thứ 3 số ít (Sai: ngữ pháp sau must be)"
    },
    "tip_vi": "Khi chủ ngữ là đồ vật/văn bản/dự án và sau chỗ trống không có tân ngữ trực tiếp -> 95% là câu Bị động (be + V3/ed).",
    "example_en": "The contracts must be signed before Friday.",
    "vocab_hints": [
      {"word": "confidential", "meaning_vi": "bảo mật, tuyệt mật"},
      {"word": "shred", "meaning_vi": "cắt nhỏ, tiêu hủy giấy tờ"},
      {"word": "discard", "meaning_vi": "vứt bỏ, thải loại"}
    ]
  }'::jsonb
)
ON CONFLICT (question_id) DO UPDATE SET
  correct_index = EXCLUDED.correct_index, explanation = EXCLUDED.explanation;

-- ------------------------------------------------------------------------------
-- CÂU 4: HÒA HỢP CHỦ - VỊ (Subject-Verb Agreement)
-- ------------------------------------------------------------------------------
INSERT INTO public.questions (id, stem, option_a, option_b, option_c, option_d, tag_id, difficulty, status, content_hash)
VALUES (
  '22222222-2222-2222-2222-222222222204'::uuid,
  'The committee members ____ currently reviewing the proposed amendments to the safety policy.',
  'is', 'are', 'was', 'has been',
  (SELECT id FROM public.grammar_tags WHERE tag_code = 'subject_verb'),
  1, 'published', 'ets_q04_subj_verb'
)
ON CONFLICT (content_hash) DO UPDATE SET
  stem = EXCLUDED.stem, option_a = EXCLUDED.option_a, option_b = EXCLUDED.option_b,
  option_c = EXCLUDED.option_c, option_d = EXCLUDED.option_d, tag_id = EXCLUDED.tag_id;

INSERT INTO public.question_answers (question_id, correct_index, explanation)
VALUES (
  '22222222-2222-2222-2222-222222222204'::uuid,
  1,
  '{
    "rule_vi": "Chủ ngữ số nhiều đi với động từ số nhiều. Trạng từ ''currently'' báo hiệu thì hiện tại.",
    "why_correct_vi": "Chủ ngữ chính của câu là danh từ số nhiều ''The committee members'' (các thành viên ủy ban). Đi kèm trạng từ ''currently'' (hiện tại), động từ to be phải ở dạng số nhiều ở hiện tại là ''are'' (are currently reviewing).",
    "full_translation_vi": "Các thành viên trong ủy ban hiện đang xem xét các sửa đổi được đề xuất đối với chính sách an toàn.",
    "options_analysis": {
      "A": "is: to be số ít hiện tại (Sai: chủ ngữ members là danh từ số nhiều)",
      "B": "are: to be số nhiều hiện tại (Đúng: hòa hợp với chủ ngữ số nhiều members và trạng từ currently)",
      "C": "was: to be số ít quá khứ (Sai: không hòa hợp về cả số lượng lẫn thì hiện tại currently)",
      "D": "has been: thì hiện tại hoàn thành số ít (Sai: has chia theo chủ ngữ số ít)"
    },
    "tip_vi": "Hãy gạch chân danh từ đứng đầu cụm chủ ngữ (ở đây là members, bỏ qua các thành phần bổ ngữ) để xác định số ít hay số nhiều.",
    "example_en": "The board members are meeting in the conference room.",
    "vocab_hints": [
      {"word": "committee", "meaning_vi": "ủy ban, hội đồng"},
      {"word": "amendment", "meaning_vi": "sự sửa đổi, bổ sung"},
      {"word": "safety policy", "meaning_vi": "chính sách an toàn"}
    ]
  }'::jsonb
)
ON CONFLICT (question_id) DO UPDATE SET
  correct_index = EXCLUDED.correct_index, explanation = EXCLUDED.explanation;

-- ------------------------------------------------------------------------------
-- CÂU 5: LIÊN TỪ & GIỚI TỪ (Prepositions)
-- ------------------------------------------------------------------------------
INSERT INTO public.questions (id, stem, option_a, option_b, option_c, option_d, tag_id, difficulty, status, content_hash)
VALUES (
  '22222222-2222-2222-2222-222222222205'::uuid,
  'Employees who wish to enroll in the leadership seminar must submit their registration form ____ 5:00 P.M. on Friday.',
  'by', 'until', 'during', 'between',
  (SELECT id FROM public.grammar_tags WHERE tag_code = 'conjunctions_prepositions'),
  1, 'published', 'ets_q05_prepositions'
)
ON CONFLICT (content_hash) DO UPDATE SET
  stem = EXCLUDED.stem, option_a = EXCLUDED.option_a, option_b = EXCLUDED.option_b,
  option_c = EXCLUDED.option_c, option_d = EXCLUDED.option_d, tag_id = EXCLUDED.tag_id;

INSERT INTO public.question_answers (question_id, correct_index, explanation)
VALUES (
  '22222222-2222-2222-2222-222222222205'::uuid,
  0,
  '{
    "rule_vi": "Phân biệt ''by'' (hạn chót - hành động hoàn thành trước hoặc chậm nhất vào lúc) và ''until'' (hành động duy trì liên tục cho tới lúc).",
    "why_correct_vi": "Động từ ''submit'' (nộp) là hành động diễn ra tại một thời điểm dứt điểm, không phải hành động duy trì liên tục. Do đó, để chỉ thời hạn chót nộp bài trước hoặc tại mốc 5:00 P.M., ta dùng giới từ ''by''.",
    "full_translation_vi": "Những nhân viên muốn đăng ký hội thảo lãnh đạo phải nộp đơn đăng ký trước 5 giờ chiều thứ Sáu.",
    "options_analysis": {
      "A": "by: trước hoặc chậm nhất tại một thời điểm (Đúng: chỉ hạn chót nộp đơn submit)",
      "B": "until: cho đến khi (Sai: until chỉ dùng cho hành động kéo dài liên tục như wait, stay, delay)",
      "C": "during: trong suốt (Sai: during phải đi với một khoảng thời gian/sự kiện, ví dụ during the meeting)",
      "D": "between: ở giữa (Sai: between cần cấu trúc between A and B)"
    },
    "tip_vi": "Thấy động từ chỉ hành động dứt điểm (submit, finish, complete, arrive) + mốc giờ/ngày -> Luôn chọn ''by''.",
    "example_en": "Please finish the project by tomorrow afternoon.",
    "vocab_hints": [
      {"word": "enroll in", "meaning_vi": "ghi danh, đăng ký tham gia"},
      {"word": "seminar", "meaning_vi": "hội thảo chuyên đề"},
      {"word": "registration form", "meaning_vi": "đơn đăng ký"}
    ]
  }'::jsonb
)
ON CONFLICT (question_id) DO UPDATE SET
  correct_index = EXCLUDED.correct_index, explanation = EXCLUDED.explanation;

-- ------------------------------------------------------------------------------
-- CÂU 6: LIÊN TỪ (Conjunctions)
-- ------------------------------------------------------------------------------
INSERT INTO public.questions (id, stem, option_a, option_b, option_c, option_d, tag_id, difficulty, status, content_hash)
VALUES (
  '22222222-2222-2222-2222-222222222206'::uuid,
  '____ severe weather conditions caused flight cancellations, the keynote speaker managed to arrive on time.',
  'Although', 'Despite', 'Because of', 'Therefore',
  (SELECT id FROM public.grammar_tags WHERE tag_code = 'conjunctions_prepositions'),
  2, 'published', 'ets_q06_conjunctions'
)
ON CONFLICT (content_hash) DO UPDATE SET
  stem = EXCLUDED.stem, option_a = EXCLUDED.option_a, option_b = EXCLUDED.option_b,
  option_c = EXCLUDED.option_c, option_d = EXCLUDED.option_d, tag_id = EXCLUDED.tag_id;

INSERT INTO public.question_answers (question_id, correct_index, explanation)
VALUES (
  '22222222-2222-2222-2222-222222222206'::uuid,
  0,
  '{
    "rule_vi": "Although + S + V (mệnh đề chỉ sự tương phản nhượng bộ). Phân biệt với Despite + Cụm danh từ.",
    "why_correct_vi": "Phía sau chỗ trống là một mệnh đề hoàn chỉnh gồm Chủ ngữ ''severe weather conditions'' và Động từ chính ''caused''. Hai vế câu mang nghĩa tương phản (thời tiết xấu nhưng vẫn đến đúng giờ). Do đó cần liên từ ''Although''.",
    "full_translation_vi": "Mặc dù điều kiện thời tiết khắc nghiệt khiến các chuyến bay bị hủy, diễn giả chính vẫn cố gắng đến đúng giờ.",
    "options_analysis": {
      "A": "Although: mặc dù (Đúng: liên từ đi kèm một mệnh đề S + V chỉ sự tương phản)",
      "B": "Despite: mặc dù (Sai: despite là giới từ, chỉ đi sau cụm danh từ hoặc V-ing, không đi sau mệnh đề có caused)",
      "C": "Because of: bởi vì (Sai: là giới từ đi với danh từ, và sai logic nghĩa chỉ nguyên nhân)",
      "D": "Therefore: do đó (Sai: là trạng từ liên kết, thường đứng sau dấu chấm phẩy hoặc đầu câu có dấu phẩy)"
    },
    "tip_vi": "Bẫy kinh điển ETS: Nhìn thấy có Động từ chính (caused) -> Chắc chắn là Mệnh đề -> Chọn Liên từ (Although/Because), LOẠI Giới từ (Despite/Because of).",
    "example_en": "Although it was raining heavily, we attended the conference.",
    "vocab_hints": [
      {"word": "severe", "meaning_vi": "khắc nghiệt, nghiêm trọng"},
      {"word": "cancellation", "meaning_vi": "sự hủy bỏ"},
      {"word": "keynote speaker", "meaning_vi": "diễn giả chính"}
    ]
  }'::jsonb
)
ON CONFLICT (question_id) DO UPDATE SET
  correct_index = EXCLUDED.correct_index, explanation = EXCLUDED.explanation;

-- ------------------------------------------------------------------------------
-- CÂU 7: ĐẠI TỪ (Pronouns)
-- ------------------------------------------------------------------------------
INSERT INTO public.questions (id, stem, option_a, option_b, option_c, option_d, tag_id, difficulty, status, content_hash)
VALUES (
  '22222222-2222-2222-2222-222222222207'::uuid,
  'All employees are reminded to keep ____ personal belongings in the designated lockers.',
  'their', 'they', 'them', 'themselves',
  (SELECT id FROM public.grammar_tags WHERE tag_code = 'nouns_pronouns'),
  1, 'published', 'ets_q07_pronouns'
)
ON CONFLICT (content_hash) DO UPDATE SET
  stem = EXCLUDED.stem, option_a = EXCLUDED.option_a, option_b = EXCLUDED.option_b,
  option_c = EXCLUDED.option_c, option_d = EXCLUDED.option_d, tag_id = EXCLUDED.tag_id;

INSERT INTO public.question_answers (question_id, correct_index, explanation)
VALUES (
  '22222222-2222-2222-2222-222222222207'::uuid,
  0,
  '{
    "rule_vi": "Tính từ sở hữu đứng trước danh từ: Possessive Adjective + (Adj) + Noun.",
    "why_correct_vi": "Đứng ngay sau chỗ trống là cụm danh từ ''personal belongings'' (đồ dùng cá nhân). Do đó vị trí này cần một Tính từ sở hữu để chỉ quyền sở hữu của ''All employees''. Ta chọn ''their''.",
    "full_translation_vi": "Tất cả nhân viên được nhắc nhở cất giữ đồ đạc cá nhân của họ trong các tủ khóa được chỉ định.",
    "options_analysis": {
      "A": "their: tính từ sở hữu ''của họ'' (Đúng: đứng trước bổ nghĩa cho cụm danh từ personal belongings)",
      "B": "they: đại từ nhân xưng chủ ngữ (Sai: chỉ làm chủ ngữ đứng trước động từ)",
      "C": "them: đại từ nhân xưng tân ngữ (Sai: chỉ đứng sau động từ hoặc giới từ làm tân ngữ)",
      "D": "themselves: đại từ phản thân (Sai: dùng khi chủ ngữ và tân ngữ cùng là một đối tượng)"
    },
    "tip_vi": "Cứ thấy khoảng trống đứng trước [Tính từ + Danh từ] -> 99% chọn Tính từ sở hữu (my, your, his, her, their, our, its).",
    "example_en": "Students must bring their own laptops to the exam.",
    "vocab_hints": [
      {"word": "belongings", "meaning_vi": "đồ dùng cá nhân, hành lý"},
      {"word": "designated", "meaning_vi": "được chỉ định, được phân công"},
      {"word": "locker", "meaning_vi": "tủ có khóa"}
    ]
  }'::jsonb
)
ON CONFLICT (question_id) DO UPDATE SET
  correct_index = EXCLUDED.correct_index, explanation = EXCLUDED.explanation;

-- ------------------------------------------------------------------------------
-- CÂU 8: V-ING VÀ TO-V (Gerunds & Infinitives)
-- ------------------------------------------------------------------------------
INSERT INTO public.questions (id, stem, option_a, option_b, option_c, option_d, tag_id, difficulty, status, content_hash)
VALUES (
  '22222222-2222-2222-2222-222222222208'::uuid,
  'The management team decided ____ the launch of the new product until customer feedback was analyzed.',
  'to postpone', 'postponing', 'postponed', 'postpone',
  (SELECT id FROM public.grammar_tags WHERE tag_code = 'gerund_infinitive'),
  1, 'published', 'ets_q08_gerund_inf'
)
ON CONFLICT (content_hash) DO UPDATE SET
  stem = EXCLUDED.stem, option_a = EXCLUDED.option_a, option_b = EXCLUDED.option_b,
  option_c = EXCLUDED.option_c, option_d = EXCLUDED.option_d, tag_id = EXCLUDED.tag_id;

INSERT INTO public.question_answers (question_id, correct_index, explanation)
VALUES (
  '22222222-2222-2222-2222-222222222208'::uuid,
  0,
  '{
    "rule_vi": "Cấu trúc động từ theo sau bởi to-V: decide + to-V (quyết định làm gì).",
    "why_correct_vi": "Động từ ''decide'' luôn đi kèm động từ nguyên mẫu có to (to-infinitive) khi diễn tả dự định/quyết định thực hiện hành động gì. Do đó đáp án chính xác là ''to postpone''.",
    "full_translation_vi": "Đội ngũ quản lý đã quyết định hoãn việc ra mắt sản phẩm mới cho đến khi phản hồi của khách hàng được phân tích.",
    "options_analysis": {
      "A": "to postpone: động từ to-infinitive (Đúng: theo sau cấu trúc decide to do something)",
      "B": "postponing: danh động từ V-ing (Sai: decide không đi trực tiếp với V-ing)",
      "C": "postponed: phân từ V3/ed (Sai: không đúng ngữ pháp sau động từ decide)",
      "D": "postpone: động từ nguyên mẫu không to (Sai: decide không phải bare infinitive verb)"
    },
    "tip_vi": "Các động từ chỉ kế hoạch/quyết định luôn đi với TO-V: decide, plan, intend, promise, agree, refuse, hope, expect + TO-V.",
    "example_en": "We decided to expand our business into Asian markets.",
    "vocab_hints": [
      {"word": "postpone", "meaning_vi": "trì hoãn, dời lại"},
      {"word": "product launch", "meaning_vi": "sự ra mắt sản phẩm"},
      {"word": "feedback", "meaning_vi": "phản hồi, ý kiến đánh giá"}
    ]
  }'::jsonb
)
ON CONFLICT (question_id) DO UPDATE SET
  correct_index = EXCLUDED.correct_index, explanation = EXCLUDED.explanation;

-- ------------------------------------------------------------------------------
-- CÂU 9: CÂU SO SÁNH (Comparisons)
-- ------------------------------------------------------------------------------
INSERT INTO public.questions (id, stem, option_a, option_b, option_c, option_d, tag_id, difficulty, status, content_hash)
VALUES (
  '22222222-2222-2222-2222-222222222209'::uuid,
  'The newly installed conveyor system operates much more ____ than the previous model.',
  'efficiently', 'efficient', 'efficiency', 'more efficient',
  (SELECT id FROM public.grammar_tags WHERE tag_code = 'comparisons'),
  2, 'published', 'ets_q09_comparisons'
)
ON CONFLICT (content_hash) DO UPDATE SET
  stem = EXCLUDED.stem, option_a = EXCLUDED.option_a, option_b = EXCLUDED.option_b,
  option_c = EXCLUDED.option_c, option_d = EXCLUDED.option_d, tag_id = EXCLUDED.tag_id;

INSERT INTO public.question_answers (question_id, correct_index, explanation)
VALUES (
  '22222222-2222-2222-2222-222222222209'::uuid,
  0,
  '{
    "rule_vi": "So sánh hơn của trạng từ: more + Trạng từ (Adv) + than khi bổ nghĩa cho động từ hành động.",
    "why_correct_vi": "Động từ chính của mệnh đề là động từ thường ''operates'' (vận hành). Để bổ nghĩa cho động từ hành động trong cấu trúc so sánh hơn ''much more... than'', ta cần một Trạng từ (Adverb) ''efficiently''. Trạng từ ''much'' đóng vai trò nhấn mạnh mức độ so sánh hơn.",
    "full_translation_vi": "Hệ thống băng chuyền mới được lắp đặt vận hành hiệu quả hơn nhiều so với mẫu trước đây.",
    "options_analysis": {
      "A": "efficiently: trạng từ (Đúng: bổ nghĩa cho động từ hành động operates trong so sánh hơn)",
      "B": "efficient: tính từ (Sai: không dùng tính từ để bổ nghĩa cho động từ thường operates)",
      "C": "efficiency: danh từ hiệu quả (Sai: không đứng sau more trong cấu trúc này)",
      "D": "more efficient: thừa từ more (Sai: câu đã có sẵn từ ''more'' trước chỗ trống)"
    },
    "tip_vi": "Để nhấn mạnh so sánh hơn, đề thi TOEIC hay dùng: much, far, significantly, substantially + more/tính từ ngắn.",
    "example_en": "The automated machine works much faster than manual labor.",
    "vocab_hints": [
      {"word": "conveyor system", "meaning_vi": "hệ thống băng chuyền"},
      {"word": "operate", "meaning_vi": "vận hành, hoạt động"},
      {"word": "efficiently", "meaning_vi": "một cách hiệu quả"}
    ]
  }'::jsonb
)
ON CONFLICT (question_id) DO UPDATE SET
  correct_index = EXCLUDED.correct_index, explanation = EXCLUDED.explanation;

-- ------------------------------------------------------------------------------
-- CÂU 10: MỆNH ĐỀ QUAN HỆ (Relative Clauses)
-- ------------------------------------------------------------------------------
INSERT INTO public.questions (id, stem, option_a, option_b, option_c, option_d, tag_id, difficulty, status, content_hash)
VALUES (
  '22222222-2222-2222-2222-222222222210'::uuid,
  'The architectural firm has hired an engineer ____ specialized expertise is in sustainable building design.',
  'whose', 'whom', 'which', 'who',
  (SELECT id FROM public.grammar_tags WHERE tag_code = 'relative_clauses'),
  2, 'published', 'ets_q10_rel_clauses'
)
ON CONFLICT (content_hash) DO UPDATE SET
  stem = EXCLUDED.stem, option_a = EXCLUDED.option_a, option_b = EXCLUDED.option_b,
  option_c = EXCLUDED.option_c, option_d = EXCLUDED.option_d, tag_id = EXCLUDED.tag_id;

INSERT INTO public.question_answers (question_id, correct_index, explanation)
VALUES (
  '22222222-2222-2222-2222-222222222210'::uuid,
  0,
  '{
    "rule_vi": "Đại từ quan hệ chỉ sở hữu: Noun (người/vật) + whose + Noun.",
    "why_correct_vi": "Phía trước là danh từ chỉ người ''an engineer'' (kỹ sư), phía sau là cụm danh từ ''specialized expertise'' (chuyên môn đặc biệt) thuộc sở hữu của người kỹ sư đó (expertise của engineer). Do đó, ta phải dùng đại từ quan hệ sở hữu ''whose''.",
    "full_translation_vi": "Công ty kiến trúc đã thuê một kỹ sư có chuyên môn chuyên sâu về thiết kế công trình bền vững.",
    "options_analysis": {
      "A": "whose: đại từ quan hệ sở hữu (Đúng: nối giữa engineer và danh từ chuyên môn expertise)",
      "B": "whom: đại từ quan hệ tân ngữ (Sai: sau whom là S + V, không chỉ sở hữu danh từ)",
      "C": "which: đại từ quan hệ chỉ vật (Sai: engineer là danh từ chỉ người)",
      "D": "who: đại từ quan hệ chủ ngữ (Sai: who thay thế cho chủ ngữ và đi trực tiếp với động từ, không đi với danh từ chuyên môn)"
    },
    "tip_vi": "Dấu hiệu nhận biết đại từ ''whose'': Đứng giữa hai Danh từ (Noun 1 + whose + Noun 2) thể hiện mối quan hệ sở hữu (Noun 2 của Noun 1).",
    "example_en": "I spoke to a client whose account was temporarily suspended.",
    "vocab_hints": [
      {"word": "architectural firm", "meaning_vi": "công ty kiến trúc"},
      {"word": "expertise", "meaning_vi": "chuyên môn, kiến thức chuyên sâu"},
      {"word": "sustainable", "meaning_vi": "bền vững (môi trường)"}
    ]
  }'::jsonb
)
ON CONFLICT (question_id) DO UPDATE SET
  correct_index = EXCLUDED.correct_index, explanation = EXCLUDED.explanation;

-- ------------------------------------------------------------------------------
-- CÂU 11: ĐỘNG TỪ KHUYẾT THIẾU (Modal Verbs)
-- ------------------------------------------------------------------------------
INSERT INTO public.questions (id, stem, option_a, option_b, option_c, option_d, tag_id, difficulty, status, content_hash)
VALUES (
  '22222222-2222-2222-2222-222222222211'::uuid,
  'Visitors to the research facility must ____ a valid visitor badge at all times.',
  'display', 'displays', 'displayed', 'displaying',
  (SELECT id FROM public.grammar_tags WHERE tag_code = 'modals'),
  1, 'published', 'ets_q11_modals'
)
ON CONFLICT (content_hash) DO UPDATE SET
  stem = EXCLUDED.stem, option_a = EXCLUDED.option_a, option_b = EXCLUDED.option_b,
  option_c = EXCLUDED.option_c, option_d = EXCLUDED.option_d, tag_id = EXCLUDED.tag_id;

INSERT INTO public.question_answers (question_id, correct_index, explanation)
VALUES (
  '22222222-2222-2222-2222-222222222211'::uuid,
  0,
  '{
    "rule_vi": "Sau Động từ khuyết thiếu (Modal Verbs: can, could, will, would, shall, should, must, may, might) là Động từ nguyên thể không to (Bare Infinitive).",
    "why_correct_vi": "Chỗ trống đứng ngay sau động từ khuyết thiếu ''must'' (phải). Theo quy tắc ngữ pháp bắt buộc, động từ theo sau phải ở dạng nguyên mẫu không chia. Do đó chọn ''display''.",
    "full_translation_vi": "Khách đến thăm cơ sở nghiên cứu phải đeo/hiển thị thẻ khách hợp lệ vào mọi thời điểm.",
    "options_analysis": {
      "A": "display: động từ nguyên thể không to (Đúng: theo sau động từ khuyết thiếu must)",
      "B": "displays: động từ chia ngôi thứ 3 số ít (Sai: không chia s/es sau must)",
      "C": "displayed: động từ quá khứ (Sai: không chia thì sau modal verb)",
      "D": "displaying: dạng V-ing (Sai: sau must không dùng V-ing)"
    },
    "tip_vi": "Quy tắc ăn điểm tuyệt đối trong 2 giây: Modal Verb + V-nguyên-mẫu (V-bare).",
    "example_en": "You should check the schedule before leaving.",
    "vocab_hints": [
      {"word": "facility", "meaning_vi": "cơ sở vật chất, tòa nhà"},
      {"word": "valid", "meaning_vi": "hợp lệ, có hiệu lực"},
      {"word": "at all times", "meaning_vi": "mọi lúc, luôn luôn"}
    ]
  }'::jsonb
)
ON CONFLICT (question_id) DO UPDATE SET
  correct_index = EXCLUDED.correct_index, explanation = EXCLUDED.explanation;

-- ------------------------------------------------------------------------------
-- CÂU 12: CÂU ĐIỀU KIỆN & GIẢ ĐỊNH (Conditionals & Subjunctive)
-- ------------------------------------------------------------------------------
INSERT INTO public.questions (id, stem, option_a, option_b, option_c, option_d, tag_id, difficulty, status, content_hash)
VALUES (
  '22222222-2222-2222-2222-222222222212'::uuid,
  'The building inspector recommended that the emergency exits ____ unlocked during operating hours.',
  'remain', 'remains', 'remained', 'remaining',
  (SELECT id FROM public.grammar_tags WHERE tag_code = 'conditionals'),
  2, 'published', 'ets_q12_subjunctive'
)
ON CONFLICT (content_hash) DO UPDATE SET
  stem = EXCLUDED.stem, option_a = EXCLUDED.option_a, option_b = EXCLUDED.option_b,
  option_c = EXCLUDED.option_c, option_d = EXCLUDED.option_d, tag_id = EXCLUDED.tag_id;

INSERT INTO public.question_answers (question_id, correct_index, explanation)
VALUES (
  '22222222-2222-2222-2222-222222222212'::uuid,
  0,
  '{
    "rule_vi": "Thể giả định (Subjunctive): S1 + recommend/suggest/insist/demand + that + S2 + (should) + V-nguyên-thể.",
    "why_correct_vi": "Mệnh đề chứa động từ yêu cầu/đề xuất ''recommended that''. Theo cấu trúc giả định thức của tiếng Anh chuẩn, động từ ở mệnh đề sau ''that'' luôn ở dạng nguyên thể không chia (Bare Infinitive), dù chủ ngữ ''the emergency exits'' là số ít hay số nhiều. Do đó ta chọn ''remain''.",
    "full_translation_vi": "Thanh tra tòa nhà khuyến nghị rằng các lối thoát hiểm phải được giữ mở trong suốt giờ hoạt động.",
    "options_analysis": {
      "A": "remain: động từ nguyên thể (Đúng: thể giả định thức sau cấu trúc recommend that)",
      "B": "remains: động từ thêm s (Sai: thể giả định không chia s/es)",
      "C": "remained: động từ quá khứ (Sai: bẫy chia theo thì của recommended)",
      "D": "remaining: dạng V-ing (Sai: mệnh đề bắt buộc cần động từ vị ngữ)"
    },
    "tip_vi": "Bẫy điểm cao TOEIC: Gặp recommend / suggest / request / ask / insist + THAT -> Động từ mệnh đề sau luôn chọn DẠNG NGUYÊN MẪU (V-inf).",
    "example_en": "The manager demanded that he apologize immediately.",
    "vocab_hints": [
      {"word": "inspector", "meaning_vi": "thanh tra viên"},
      {"word": "emergency exit", "meaning_vi": "lối thoát hiểm khẩn cấp"},
      {"word": "operating hours", "meaning_vi": "giờ làm việc / giờ hoạt động"}
    ]
  }'::jsonb
)
ON CONFLICT (question_id) DO UPDATE SET
  correct_index = EXCLUDED.correct_index, explanation = EXCLUDED.explanation;

-- ------------------------------------------------------------------------------
-- CÂU 13: PHÂN TỪ & RÚT GỌN (Participles)
-- ------------------------------------------------------------------------------
INSERT INTO public.questions (id, stem, option_a, option_b, option_c, option_d, tag_id, difficulty, status, content_hash)
VALUES (
  '22222222-2222-2222-2222-222222222213'::uuid,
  '____ by favorable exchange rates, overseas exports increased by 15 percent in the third quarter.',
  'Boosted', 'Boosting', 'Boost', 'Booster',
  (SELECT id FROM public.grammar_tags WHERE tag_code = 'participles'),
  2, 'published', 'ets_q13_participles'
)
ON CONFLICT (content_hash) DO UPDATE SET
  stem = EXCLUDED.stem, option_a = EXCLUDED.option_a, option_b = EXCLUDED.option_b,
  option_c = EXCLUDED.option_c, option_d = EXCLUDED.option_d, tag_id = EXCLUDED.tag_id;

INSERT INTO public.question_answers (question_id, correct_index, explanation)
VALUES (
  '22222222-2222-2222-2222-222222222213'::uuid,
  0,
  '{
    "rule_vi": "Rút gọn mệnh đề cùng chủ ngữ ở thể bị động dùng Quá khứ phân từ: Past Participle (V3/ed) + by + O, S + V.",
    "why_correct_vi": "Chủ ngữ của mệnh đề chính là ''overseas exports'' (hàng xuất khẩu ra nước ngoài). Hàng xuất khẩu không thể tự thúc đẩy mà ''được thúc đẩy bởi tỷ giá hối đoái thuận lợi'' (thể bị động có kèm giới từ by). Khi rút gọn mệnh đề trạng ngữ ở dạng bị động, ta dùng V3/ed: ''Boosted''.",
    "full_translation_vi": "Được thúc đẩy bởi tỷ giá hối đoái thuận lợi, kim ngạch xuất khẩu ra nước ngoài đã tăng 15% trong quý ba.",
    "options_analysis": {
      "A": "Boosted: phân từ hai V3/ed (Đúng: rút gọn mệnh đề bị động, được thúc đẩy bởi tỷ giá)",
      "B": "Boosting: hiện tại phân từ V-ing (Sai: V-ing dùng cho nghĩa chủ động)",
      "C": "Boost: động từ nguyên thể (Sai: đầu câu không có chủ ngữ)",
      "D": "Booster: danh từ chất kích thích/bộ tăng áp (Sai: không tạo nghĩa hợp lý)"
    },
    "tip_vi": "Đầu câu có dạng: [______ + by + Tân ngữ, S + V] -> Hãy chọn ngay V3/ed (bị động rút gọn).",
    "example_en": "Encouraged by his supervisor, John applied for the promotion.",
    "vocab_hints": [
      {"word": "exchange rate", "meaning_vi": "tỷ giá hối đoái"},
      {"word": "favorable", "meaning_vi": "thuận lợi, có lợi"},
      {"word": "export", "meaning_vi": "hàng xuất khẩu / xuất khẩu"}
    ]
  }'::jsonb
)
ON CONFLICT (question_id) DO UPDATE SET
  correct_index = EXCLUDED.correct_index, explanation = EXCLUDED.explanation;

-- ------------------------------------------------------------------------------
-- CÂU 14: ĐẢO NGỮ (Inversion)
-- ------------------------------------------------------------------------------
INSERT INTO public.questions (id, stem, option_a, option_b, option_c, option_d, tag_id, difficulty, status, content_hash)
VALUES (
  '22222222-2222-2222-2222-222222222214'::uuid,
  'Rarely ____ the accounting firm seen such a rapid increase in client acquisitions during the first quarter.',
  'has', 'have', 'is', 'did',
  (SELECT id FROM public.grammar_tags WHERE tag_code = 'inversion'),
  3, 'published', 'ets_q14_inversion'
)
ON CONFLICT (content_hash) DO UPDATE SET
  stem = EXCLUDED.stem, option_a = EXCLUDED.option_a, option_b = EXCLUDED.option_b,
  option_c = EXCLUDED.option_c, option_d = EXCLUDED.option_d, tag_id = EXCLUDED.tag_id;

INSERT INTO public.question_answers (question_id, correct_index, explanation)
VALUES (
  '22222222-2222-2222-2222-222222222214'::uuid,
  0,
  '{
    "rule_vi": "Đảo ngữ với trạng từ mang nghĩa phủ định/hiếm khi đứng đầu câu: Rarely/Seldom/Never + Trợ động từ + S + V.",
    "why_correct_vi": "Trạng từ bán phủ định ''Rarely'' đứng đầu câu gây ra hiện tượng đảo ngữ (đưa trợ động từ lên trước chủ ngữ). Chủ ngữ là danh từ số ít ''the accounting firm'' (công ty kế toán) và động từ chính ở dạng phân từ ''seen'' (V3). Do đó trợ động từ phù hợp là ''has'' (has the firm seen).",
    "full_translation_vi": "Hiếm khi công ty kế toán chứng kiến sự gia tăng nhanh chóng về lượng khách hàng mới như vậy trong quý đầu tiên.",
    "options_analysis": {
      "A": "has: trợ động từ hoàn thành số ít (Đúng: đảo ngữ với chủ ngữ số ít firm và động từ V3 seen)",
      "B": "have: trợ động từ số nhiều (Sai: chủ ngữ firm là danh từ số ít)",
      "C": "is: to be (Sai: to be không đi với động từ phân từ seen trong nghĩa chủ động này)",
      "D": "did: trợ động từ quá khứ đơn (Sai: did phải đi với động từ nguyên mẫu see, không đi với seen)"
    },
    "tip_vi": "Khi thấy các từ phủ định đứng đầu câu (Rarely, Seldom, Hardly, Scarcely, Never, Under no circumstances) -> Bắt buộc dùng ĐẢO NGỮ.",
    "example_en": "Seldom have we witnessed such outstanding teamwork.",
    "vocab_hints": [
      {"word": "rarely", "meaning_vi": "hiếm khi"},
      {"word": "accounting firm", "meaning_vi": "công ty kế toán"},
      {"word": "acquisition", "meaning_vi": "sự thu nạp, sự giành được"}
    ]
  }'::jsonb
)
ON CONFLICT (question_id) DO UPDATE SET
  correct_index = EXCLUDED.correct_index, explanation = EXCLUDED.explanation;

-- ------------------------------------------------------------------------------
-- CÂU 15: COLLOCATIONS & THÀNH NGỮ (Collocations)
-- ------------------------------------------------------------------------------
INSERT INTO public.questions (id, stem, option_a, option_b, option_c, option_d, tag_id, difficulty, status, content_hash)
VALUES (
  '22222222-2222-2222-2222-222222222215'::uuid,
  'All manufacturing facilities are inspected on a regular basis to ensure compliance ____ international safety standards.',
  'with', 'to', 'for', 'at',
  (SELECT id FROM public.grammar_tags WHERE tag_code = 'collocations'),
  1, 'published', 'ets_q15_collocations'
)
ON CONFLICT (content_hash) DO UPDATE SET
  stem = EXCLUDED.stem, option_a = EXCLUDED.option_a, option_b = EXCLUDED.option_b,
  option_c = EXCLUDED.option_c, option_d = EXCLUDED.option_d, tag_id = EXCLUDED.tag_id;

INSERT INTO public.question_answers (question_id, correct_index, explanation)
VALUES (
  '22222222-2222-2222-2222-222222222215'::uuid,
  0,
  '{
    "rule_vi": "Cụm danh từ cố định trong đề thi TOEIC: compliance with something (sự tuân thủ theo cái gì).",
    "why_correct_vi": "Danh từ ''compliance'' (sự tuân thủ) luôn đi kèm với giới từ ''with'' để tạo thành cụm kết hợp từ cố định ''in compliance with'' hoặc ''ensure compliance with something'' (đảm bảo sự tuân thủ các tiêu chuẩn). Do đó đáp án bắt buộc là ''with''.",
    "full_translation_vi": "Tất cả các cơ sở sản xuất đều được thanh tra định kỳ nhằm đảm bảo sự tuân thủ các tiêu chuẩn an toàn quốc tế.",
    "options_analysis": {
      "A": "with: đi kèm compliance (Đúng: cụm cố định compliance with = tuân thủ theo)",
      "B": "to: đến (Sai: không kết hợp với danh từ compliance)",
      "C": "for: cho (Sai: không đi với compliance)",
      "D": "at: tại (Sai: không tạo thành cụm giới từ hợp lệ)"
    },
    "tip_vi": "Học thuộc lòng bộ 3 từ chỉ sự tuân thủ trong TOEIC: comply WITH = in compliance WITH = in accordance WITH.",
    "example_en": "The building was constructed in full compliance with local regulations.",
    "vocab_hints": [
      {"word": "manufacturing facility", "meaning_vi": "cơ sở sản xuất, nhà máy"},
      {"word": "on a regular basis", "meaning_vi": "một cách đều đặn, định kỳ"},
      {"word": "compliance with", "meaning_vi": "sự tuân thủ, tuân theo"}
    ]
  }'::jsonb
)
ON CONFLICT (question_id) DO UPDATE SET
  correct_index = EXCLUDED.correct_index, explanation = EXCLUDED.explanation;
