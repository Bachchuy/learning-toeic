-- ==============================================================================
-- Migration: Bảng PASSAGES và Nâng Cấp Schema cho TOEIC Part 6 & Part 7
-- 20261026000010_passages_part6_part7.sql
-- ==============================================================================

-- 1. Bảng PASSAGES (Lưu trữ bài đọc cho Part 6 và Part 7)
CREATE TABLE IF NOT EXISTS public.passages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part INT NOT NULL CHECK (part IN (6, 7)),
  passage_type TEXT NOT NULL CHECK (passage_type IN (
    'email', 'memo', 'notice', 'article', 'advertisement',
    'letter', 'form', 'schedule', 'chat', 'multi_passage'
  )),
  title TEXT NOT NULL DEFAULT '',
  context_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  content TEXT NOT NULL,
  content_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'needs_review', 'published', 'retired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Bật Row Level Security (RLS)
ALTER TABLE public.passages ENABLE ROW LEVEL SECURITY;

-- Policy SELECT: Người dùng công khai có thể đọc các bài đọc đã xuất bản (published)
CREATE POLICY "Allow public read published passages"
  ON public.passages
  FOR SELECT
  TO public
  USING (status = 'published');

-- Policy ALL: Chỉ admin mới có quyền tạo, sửa, xóa bài đọc
CREATE POLICY "Allow admin manage passages"
  ON public.passages
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2. Nâng cấp bảng QUESTIONS để hỗ trợ Part 6 & Part 7
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS part INT NOT NULL DEFAULT 5 CHECK (part IN (5, 6, 7)),
  ADD COLUMN IF NOT EXISTS passage_id UUID REFERENCES public.passages(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS order_in_passage INT DEFAULT NULL CHECK (order_in_passage IS NULL OR (order_in_passage BETWEEN 1 AND 5)),
  ADD COLUMN IF NOT EXISTS question_sub_type TEXT DEFAULT NULL;

-- Cho phép tag_id là NULL cho các câu hỏi đọc hiểu kỹ năng Part 7
ALTER TABLE public.questions ALTER COLUMN tag_id DROP NOT NULL;

-- 3. Tạo Indexes tối ưu hóa truy vấn
CREATE INDEX IF NOT EXISTS idx_questions_part_status ON public.questions (part, status);
CREATE INDEX IF NOT EXISTS idx_questions_passage_id ON public.questions (passage_id) WHERE passage_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_passages_part_status ON public.passages (part, status);

-- ==============================================================================
-- 4. SEED DỮ LIỆU MẪU CHUẨN MỰC
-- ==============================================================================

-- 4.1 BỘ ĐỀ PART 6: MEMORANDUM CÔNG SỞ (4 Chỗ đục lỗ [131] - [134])
DO $$
DECLARE
  v_passage_id UUID := '00000000-0000-0000-0000-000000000061'::uuid;
  v_q1_id UUID := '00000000-0000-0000-0000-000000000131'::uuid;
  v_q2_id UUID := '00000000-0000-0000-0000-000000000132'::uuid;
  v_q3_id UUID := '00000000-0000-0000-0000-000000000133'::uuid;
  v_q4_id UUID := '00000000-0000-0000-0000-000000000134'::uuid;
BEGIN
  -- Insert Passage Part 6
  INSERT INTO public.passages (
    id,
    part,
    passage_type,
    title,
    context_info,
    content,
    status
  ) VALUES (
    v_passage_id,
    6,
    'memo',
    'Renovation of the Central Office Facilities',
    jsonb_build_object(
      'to', 'All Staff Members',
      'from', 'Facilities Management Division',
      'date', 'October 27, 2026',
      'subject', 'Upcoming Renovation Schedule and Remote Work Option'
    ),
    'MEMORANDUM

TO: All Staff Members
FROM: Facilities Management Division
DATE: October 27, 2026
SUBJECT: Upcoming Renovation Schedule and Remote Work Option

Please be advised that the main office building [131] comprehensive renovations starting on Monday, November 3. The primary objective of this project is to modernize the heating, ventilation, and air conditioning (HVAC) systems across all three floors.

During the initial phase of construction, high levels of noise and dust [132] unavoidable in the east wing. Consequently, department supervisors are authorized to approve remote work arrangements for affected team members. Employees who wish to work from home should submit an official request form [133] Wednesday, October 29.

[134]. We greatly appreciate your patience and cooperation as we strive to enhance our workplace environment.',
    'published'
  ) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content;

  -- Câu 131: Thì động từ (Tenses)
  INSERT INTO public.questions (
    id, part, passage_id, order_in_passage, question_sub_type,
    stem, option_a, option_b, option_c, option_d,
    tag_id, difficulty, status, content_hash
  ) VALUES (
    v_q1_id, 6, v_passage_id, 1, 'grammar_tenses',
    'Please be advised that the main office building [131] comprehensive renovations starting on Monday, November 3.',
    'underwent', 'will undergo', 'undergoing', 'is undergone',
    1, 1, 'published', 'part6_q131_undergo_renovations_hash'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.question_answers (
    question_id, correct_index, explanation
  ) VALUES (
    v_q1_id, 1,
    jsonb_build_object(
      'translation', 'Xin lưu ý rằng tòa nhà văn phòng chính sẽ trải qua đợt cải tạo toàn diện bắt đầu từ thứ Hai, ngày 3 tháng 11.',
      'analysis', 'Căn cứ vào trạng từ chỉ tương lai "starting on Monday, November 3", mệnh đề sau "that" cần một động từ chia ở thì tương lai đơn (will + V-bare). Phương án (B) "will undergo" là đáp án chính xác duy nhất.',
      'key_clue', 'starting on Monday, November 3 (dấu hiệu thời gian trong tương lai)'
    )
  ) ON CONFLICT (question_id) DO NOTHING;

  -- Câu 132: Sự hòa hợp Chủ - Vị & Khuyết thiếu (Modals)
  INSERT INTO public.questions (
    id, part, passage_id, order_in_passage, question_sub_type,
    stem, option_a, option_b, option_c, option_d,
    tag_id, difficulty, status, content_hash
  ) VALUES (
    v_q2_id, 6, v_passage_id, 2, 'grammar_modals',
    'During the initial phase of construction, high levels of noise and dust [132] unavoidable in the east wing.',
    'will be', 'are been', 'have', 'were being',
    1, 2, 'published', 'part6_q132_noise_dust_unavoidable_hash'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.question_answers (
    question_id, correct_index, explanation
  ) VALUES (
    v_q2_id, 0,
    jsonb_build_object(
      'translation', 'Trong giai đoạn đầu của quá trình thi công, tiếng ồn lớn và bụi bẩn sẽ là điều không thể tránh khỏi ở cánh phía đông.',
      'analysis', 'Chủ ngữ "high levels of noise and dust" đi sau cụm thời gian "During the initial phase of construction" (diễn ra trong tương lai). Cần động từ to be ở thì tương lai "will be" kết hợp với tính từ "unavoidable" (không thể tránh khỏi).',
      'key_clue', 'will be + unavoidable (sẽ không thể tránh khỏi)'
    )
  ) ON CONFLICT (question_id) DO NOTHING;

  -- Câu 133: Giới từ chỉ hạn chót (Prepositions)
  INSERT INTO public.questions (
    id, part, passage_id, order_in_passage, question_sub_type,
    stem, option_a, option_b, option_c, option_d,
    tag_id, difficulty, status, content_hash
  ) VALUES (
    v_q3_id, 6, v_passage_id, 3, 'preposition_deadline',
    'Employees who wish to work from home should submit an official request form [133] Wednesday, October 29.',
    'between', 'by', 'until', 'among',
    10, 2, 'published', 'part6_q133_submit_form_by_deadline_hash'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.question_answers (
    question_id, correct_index, explanation
  ) VALUES (
    v_q3_id, 1,
    jsonb_build_object(
      'translation', 'Những nhân viên có nguyện vọng làm việc tại nhà nên nộp biểu mẫu yêu cầu chính thức trước hoặc muộn nhất vào thứ Tư, ngày 29 tháng 10.',
      'analysis', 'Hành động nộp biểu mẫu (submit) là hành động dứt điểm diễn ra trước một mốc thời hạn chót, nên ta dùng giới từ "by" (trước/muộn nhất là lúc). "Until" chỉ dùng cho hành động kéo dài liên tục đến một mốc thời gian.',
      'key_clue', 'submit ... by [mốc thời gian] (hạn chót nộp tài liệu)'
    )
  ) ON CONFLICT (question_id) DO NOTHING;

  -- Câu 134: Dạng câu đặc trưng của Part 6: Điền cả câu hoàn chỉnh (Sentence Insertion)
  INSERT INTO public.questions (
    id, part, passage_id, order_in_passage, question_sub_type,
    stem, option_a, option_b, option_c, option_d,
    tag_id, difficulty, status, content_hash
  ) VALUES (
    v_q4_id, 6, v_passage_id, 4, 'sentence_insertion',
    '[134]. We greatly appreciate your patience and cooperation as we strive to enhance our workplace environment.',
    'The cafeteria will introduce a brand-new breakfast menu next month.',
    'Temporary workstations will also be available on the second floor for those remaining on-site.',
    'All completed contracts must be signed in duplicate by both parties.',
    'Parking fees will be deducted directly from your monthly paycheck.',
    NULL, 2, 'published', 'part6_q134_sentence_insertion_hash'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.question_answers (
    question_id, correct_index, explanation
  ) VALUES (
    v_q4_id, 1,
    jsonb_build_object(
      'translation', 'Các bàn làm việc tạm thời cũng sẽ có sẵn ở tầng hai cho những người tiếp tục làm việc tại văn phòng.',
      'analysis', 'Đoạn văn trước đó đề cập đến phương án làm việc tại nhà (remote work) cho những ai bị ảnh hưởng bởi công trường. Câu điền tiếp theo cần bổ sung giải pháp cho những nhân viên còn lại làm việc tại chỗ. Phương án (B) là câu văn khớp hoàn hảo về mặt logic ngữ cảnh.',
      'key_clue', 'Temporary workstations will also be available ... for those remaining on-site (sự liền mạch ngữ nghĩa)'
    )
  ) ON CONFLICT (question_id) DO NOTHING;
END $$;


-- 4.2 BỘ ĐỀ PART 7: EMAIL DOANH NGHIỆP & ĐỌC HIỂU (3 Câu hỏi: Mục đích, Chi tiết, Từ vựng ngữ cảnh)
DO $$
DECLARE
  v_passage_id UUID := '00000000-0000-0000-0000-000000000071'::uuid;
  v_q1_id UUID := '00000000-0000-0000-0000-000000000147'::uuid;
  v_q2_id UUID := '00000000-0000-0000-0000-000000000148'::uuid;
  v_q3_id UUID := '00000000-0000-0000-0000-000000000149'::uuid;
BEGIN
  -- Insert Passage Part 7 (E-mail thương mại)
  INSERT INTO public.passages (
    id,
    part,
    passage_type,
    title,
    context_info,
    content,
    status
  ) VALUES (
    v_passage_id,
    7,
    'email',
    'Customer Feedback on Warehouse Logistics Software Upgrade',
    jsonb_build_object(
      'from', 'Clara Hughes <c.hughes@apexlogistics.com>',
      'to', 'Marcus Vance <m.vance@vancetechsolutions.com>',
      'date', 'October 24, 2026',
      'subject', 'Initial Performance Review: Inventory Pro v4.2'
    ),
    'Dear Mr. Vance,

I am writing to share our preliminary evaluation of the Inventory Pro v4.2 software suite, which your technical team installed across our regional distribution centers two weeks ago.

Overall, the automated barcode scanning functionality has accelerated our sorting procedures by roughly twenty percent. Warehouse personnel have expressed enthusiasm regarding the streamlined tablet interface, which requires considerably fewer manual inputs than our previous database.

However, we have encountered an unexpected issue with the automated invoice generation module. When processing overseas bulk shipments involving multiple currencies, the system occasionally freezes and fails to calculate applicable customs tariffs accurately. Because our European dispatch deadline is strictly set for 5:00 P.M. daily, this recurring glitch has caused slight delays in dispatching afternoon orders.

We would appreciate it if your senior developer could examine this error remotely tomorrow morning. Our IT coordinator, Mr. Liam Ortiz, will be available to provide temporary system access and demonstrate the error logs.

Thank you for your prompt attention to this matter.

Sincerely,

Clara Hughes
Director of Warehouse Operations
Apex Global Logistics',
    'published'
  ) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content;

  -- Câu 147: Mục đích chính của Email (Main Purpose)
  INSERT INTO public.questions (
    id, part, passage_id, order_in_passage, question_sub_type,
    stem, option_a, option_b, option_c, option_d,
    tag_id, difficulty, status, content_hash
  ) VALUES (
    v_q1_id, 7, v_passage_id, 1, 'reading_main_idea',
    'What is the primary purpose of the e-mail?',
    'To request reimbursement for damaged merchandise',
    'To provide feedback and report a software defect',
    'To negotiate the price of a maintenance contract',
    'To inquire about job openings in the technical support division',
    NULL, 1, 'published', 'part7_q147_email_purpose_hash'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.question_answers (
    question_id, correct_index, explanation
  ) VALUES (
    v_q1_id, 1,
    jsonb_build_object(
      'translation', 'Mục đích chính của bức thư điện tử là gì?',
      'analysis', 'Ngay đoạn mở đầu, bà Hughes nêu rõ: "I am writing to share our preliminary evaluation... Overall... However, we have encountered an unexpected issue...". Bức thư vừa chia sẻ đánh giá phản hồi, vừa báo cáo lỗi phần mềm gặp phải. Do đó phương án (B) là đáp án đúng.',
      'key_clue', 'share our preliminary evaluation ... encountered an unexpected issue (cung cấp phản hồi và báo lỗi)'
    )
  ) ON CONFLICT (question_id) DO NOTHING;

  -- Câu 148: Chi tiết bài đọc (Detail Question)
  INSERT INTO public.questions (
    id, part, passage_id, order_in_passage, question_sub_type,
    stem, option_a, option_b, option_c, option_d,
    tag_id, difficulty, status, content_hash
  ) VALUES (
    v_q2_id, 7, v_passage_id, 2, 'reading_detail',
    'What feature of the new software has received positive feedback from warehouse personnel?',
    'The automatic backup to external hard drives',
    'The voice-activated inventory tracking command',
    'The user-friendly interface requiring fewer manual inputs',
    'The ability to process payments in thirty different currencies',
    NULL, 2, 'published', 'part7_q148_positive_feedback_feature_hash'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.question_answers (
    question_id, correct_index, explanation
  ) VALUES (
    v_q2_id, 2,
    jsonb_build_object(
      'translation', 'Tính năng nào của phần mềm mới đã nhận được phản hồi tích cực từ nhân viên kho?',
      'analysis', 'Trong đoạn 2 có ghi: "Warehouse personnel have expressed enthusiasm regarding the streamlined tablet interface, which requires considerably fewer manual inputs than our previous database." Khớp chính xác với phương án (C).',
      'key_clue', 'streamlined tablet interface, which requires considerably fewer manual inputs'
    )
  ) ON CONFLICT (question_id) DO NOTHING;

  -- Câu 149: Từ vựng trong ngữ cảnh (Vocabulary in Context)
  INSERT INTO public.questions (
    id, part, passage_id, order_in_passage, question_sub_type,
    stem, option_a, option_b, option_c, option_d,
    tag_id, difficulty, status, content_hash
  ) VALUES (
    v_q3_id, 7, v_passage_id, 3, 'reading_vocab_context',
    'In the e-mail, the word "prompt" in paragraph 5 is closest in meaning to',
    'immediate', 'cautious', 'inexpensive', 'formal',
    NULL, 2, 'published', 'part7_q149_word_prompt_hash'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.question_answers (
    question_id, correct_index, explanation
  ) VALUES (
    v_q3_id, 0,
    jsonb_build_object(
      'translation', 'Trong bức thư, từ "prompt" ở đoạn 5 gần nghĩa nhất với từ nào?',
      'analysis', 'Cụm từ "prompt attention" mang nghĩa "sự quan tâm/xử lý nhanh chóng, tức thì". Trong 4 đáp án: (A) immediate (ngay lập tức), (B) cautious (cẩn trọng), (C) inexpensive (không đắt), (D) formal (trang trọng). Vì vậy "immediate" là từ đồng nghĩa chính xác nhất.',
      'key_clue', 'prompt attention = immediate attention (sự giải quyết khẩn trương, kịp thời)'
    )
  ) ON CONFLICT (question_id) DO NOTHING;
END $$;
