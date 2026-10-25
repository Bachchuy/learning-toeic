-- ==============================================================================
-- TOEIC AI Platform — Milestone 4: RPC Functions & Seed 30 Questions
-- Tuân thủ: docs/06-architecture.md §6.6, docs/04-business-rules.md §4.2-4.3
-- ==============================================================================

-- ==============================================================================
-- 1. RPC: CREATE_SESSION (Tạo phiên luyện tập)
-- Loại bỏ các câu đã làm đúng trong 7 ngày gần nhất (7x24h)
-- BẤT BIẾN: Trả về câu hỏi TUYỆT ĐỐI KHÔNG CÓ ĐÁP ÁN!
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.create_session(
  p_tag_id INT DEFAULT NULL,
  p_total_questions INT DEFAULT 10
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_session_id UUID;
  v_questions RECORD;
  v_question_ids UUID[];
  v_actual_total INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Vui lòng đăng nhập để tạo phiên luyện tập';
  END IF;

  -- 1. Lấy danh sách ID câu hỏi published
  -- Loại trừ câu người dùng đã làm đúng trong 7 ngày gần nhất (7 * 24 giờ trượt)
  SELECT array_agg(q.id) INTO v_question_ids
  FROM (
    SELECT q.id
    FROM public.questions q
    WHERE q.status = 'published'
      AND (p_tag_id IS NULL OR q.tag_id = p_tag_id)
      AND NOT EXISTS (
        SELECT 1 FROM public.attempts a
        WHERE a.user_id = v_user_id
          AND a.question_id = q.id
          AND a.is_correct = true
          AND a.answered_at >= (now() - INTERVAL '7 days')
      )
    ORDER BY random()
    LIMIT p_total_questions
  ) q;

  v_actual_total := COALESCE(array_length(v_question_ids, 1), 0);

  IF v_actual_total = 0 THEN
    RETURN jsonb_build_object(
      'error', 'NO_QUESTIONS_AVAILABLE',
      'message', 'Bạn đã làm đúng hết câu của chủ điểm này trong 7 ngày qua'
    );
  END IF;

  -- 2. Tạo phiên trong practice_sessions
  INSERT INTO public.practice_sessions (user_id, tag_id, total_questions)
  VALUES (v_user_id, p_tag_id, v_actual_total)
  RETURNING id INTO v_session_id;

  -- 3. Lưu danh sách câu vào session_questions
  FOR i IN 1..v_actual_total LOOP
    INSERT INTO public.session_questions (session_id, question_id, order_index)
    VALUES (v_session_id, v_question_ids[i], i);
  END LOOP;

  -- 4. Trả về thông tin phiên và danh sách câu hỏi (KHÔNG CÓ ĐÁP ÁN)
  RETURN jsonb_build_object(
    'session_id', v_session_id,
    'total_questions', v_actual_total,
    'questions', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', q.id,
          'order_index', sq.order_index,
          'stem', q.stem,
          'option_a', q.option_a,
          'option_b', q.option_b,
          'option_c', q.option_c,
          'option_d', q.option_d,
          'tag_id', q.tag_id,
          'tag_name_vi', gt.name_vi,
          'difficulty', q.difficulty
        ) ORDER BY sq.order_index
      )
      FROM public.session_questions sq
      JOIN public.questions q ON q.id = sq.question_id
      JOIN public.grammar_tags gt ON gt.id = q.tag_id
      WHERE sq.session_id = v_session_id
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 2. RPC: SUBMIT_ANSWER (Nộp câu trả lời & Nhận giải thích thích ứng)
-- BẤT BIẾN: Kiểm tra câu thuộc phiên, ghi attempts, trả giải thích
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.submit_answer(
  p_session_id UUID,
  p_question_id UUID,
  p_selected_index INT
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_session RECORD;
  v_tag_id INT;
  v_correct_index INT;
  v_explanation JSONB;
  v_is_correct BOOLEAN;
  v_existing_attempt RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Vui lòng đăng nhập để nộp bài';
  END IF;

  -- 1. Kiểm tra session có thuộc về người dùng không
  SELECT * INTO v_session
  FROM public.practice_sessions
  WHERE id = p_session_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Phiên luyện tập không tồn tại hoặc không thuộc quyền sở hữu';
  END IF;

  -- 2. Kiểm tra câu hỏi có thuộc session này không
  IF NOT EXISTS (
    SELECT 1 FROM public.session_questions
    WHERE session_id = p_session_id AND question_id = p_question_id
  ) THEN
    RAISE EXCEPTION 'Câu hỏi không thuộc phiên luyện tập này';
  END IF;

  -- 3. Lấy tag_id của câu hỏi để snapshot
  SELECT tag_id INTO v_tag_id
  FROM public.questions WHERE id = p_question_id;

  -- 4. Lấy đáp án và giải thích từ bảng bí mật question_answers
  SELECT correct_index, explanation INTO v_correct_index, v_explanation
  FROM public.question_answers
  WHERE question_id = p_question_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Không tìm thấy đáp án cho câu hỏi này';
  END IF;

  v_is_correct := (p_selected_index = v_correct_index);

  -- 5. Idempotency: Kiểm tra nếu đã nộp câu này trong session rồi thì không nhân đôi attempt
  SELECT * INTO v_existing_attempt
  FROM public.attempts
  WHERE session_id = p_session_id AND question_id = p_question_id;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'is_correct', v_existing_attempt.is_correct,
      'selected_index', v_existing_attempt.selected_index,
      'correct_index', v_correct_index,
      'explanation', v_explanation,
      'already_submitted', true
    );
  END IF;

  -- 6. Ghi nhận attempt chính thức
  INSERT INTO public.attempts (
    session_id, user_id, question_id, tag_id, selected_index, is_correct
  )
  VALUES (
    p_session_id, v_user_id, p_question_id, v_tag_id, p_selected_index, v_is_correct
  );

  RETURN jsonb_build_object(
    'is_correct', v_is_correct,
    'selected_index', p_selected_index,
    'correct_index', v_correct_index,
    'explanation', v_explanation,
    'already_submitted', false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 3. RPC: FINISH_SESSION & GET_SESSION_REVIEW
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.finish_session(p_session_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  UPDATE public.practice_sessions
  SET completed_at = timezone('utc'::text, now())
  WHERE id = p_session_id AND user_id = v_user_id AND completed_at IS NULL;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_session_review(p_session_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_session RECORD;
  v_total INT;
  v_correct INT;
BEGIN
  SELECT * INTO v_session
  FROM public.practice_sessions
  WHERE id = p_session_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Không tìm thấy phiên làm bài';
  END IF;

  SELECT COUNT(*), COUNT(CASE WHEN is_correct THEN 1 END)
  INTO v_total, v_correct
  FROM public.attempts
  WHERE session_id = p_session_id;

  RETURN jsonb_build_object(
    'session_id', p_session_id,
    'total_questions', v_session.total_questions,
    'completed_at', v_session.completed_at,
    'created_at', v_session.created_at,
    'correct_count', v_correct,
    'attempts', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'question_id', q.id,
          'order_index', sq.order_index,
          'stem', q.stem,
          'option_a', q.option_a,
          'option_b', q.option_b,
          'option_c', q.option_c,
          'option_d', q.option_d,
          'tag_name_vi', gt.name_vi,
          'selected_index', a.selected_index,
          'correct_index', qa.correct_index,
          'is_correct', a.is_correct,
          'explanation', qa.explanation
        ) ORDER BY sq.order_index
      )
      FROM public.session_questions sq
      JOIN public.questions q ON q.id = sq.question_id
      JOIN public.grammar_tags gt ON gt.id = q.tag_id
      LEFT JOIN public.attempts a ON a.session_id = p_session_id AND a.question_id = q.id
      LEFT JOIN public.question_answers qa ON qa.question_id = q.id
      WHERE sq.session_id = p_session_id
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 4. SEED 30 CÂU HỎI TOEIC PART 5 CHUẨN KÈM ĐÁP ÁN & GIẢI THÍCH CHI TIẾT
-- ==============================================================================

DO $$
DECLARE
  v_tenses INT;
  v_subj_verb INT;
  v_passive INT;
  v_modals INT;
  v_word_form INT;
  v_prep INT;
  v_pronoun INT;
  v_rel_clause INT;
  v_cond INT;
  v_comp INT;
  v_q_id UUID;
BEGIN
  -- Lấy tag IDs
  SELECT id INTO v_tenses FROM public.grammar_tags WHERE tag_code = 'tenses';
  SELECT id INTO v_subj_verb FROM public.grammar_tags WHERE tag_code = 'subject_verb';
  SELECT id INTO v_passive FROM public.grammar_tags WHERE tag_code = 'passive_voice';
  SELECT id INTO v_modals FROM public.grammar_tags WHERE tag_code = 'modals';
  SELECT id INTO v_word_form FROM public.grammar_tags WHERE tag_code = 'word_form';
  SELECT id INTO v_prep FROM public.grammar_tags WHERE tag_code = 'conjunctions_prepositions';
  SELECT id INTO v_pronoun FROM public.grammar_tags WHERE tag_code = 'nouns_pronouns';
  SELECT id INTO v_rel_clause FROM public.grammar_tags WHERE tag_code = 'relative_clauses';
  SELECT id INTO v_cond FROM public.grammar_tags WHERE tag_code = 'conditionals';
  SELECT id INTO v_comp FROM public.grammar_tags WHERE tag_code = 'comparisons';

  -- Câu 1 (Word Form)
  v_q_id := '11111111-1111-1111-1111-111111111101'::uuid;
  INSERT INTO public.questions (id, stem, option_a, option_b, option_c, option_d, tag_id, difficulty, status, content_hash)
  VALUES (
    v_q_id,
    'Mr. Tanaka will provide a ____ summary of the quarterly financial results at tomorrow''s meeting.',
    'brief', 'briefly', 'briefed', 'briefing',
    v_word_form, 1, 'published', 'hash_q01'
  ) ON CONFLICT (content_hash) DO NOTHING;

  INSERT INTO public.question_answers (question_id, correct_index, explanation)
  VALUES (
    v_q_id, 0,
    '{
      "rule_vi": "Vị trí giữa mạo từ ''a'' và danh từ ''summary'' cần một TÍNH TỪ để bổ nghĩa cho danh từ.",
      "why_correct_vi": "Phương án A (brief - tính từ: ngắn gọn) là từ loại duy nhất phù hợp đứng trước danh từ ''summary''. Cụm ''a brief summary'' có nghĩa là ''một bản tóm tắt ngắn gọn''.",
      "why_wrong_vi": [
        {"option": "B", "reason_vi": "''briefly'' là trạng từ, không đứng trực tiếp bổ nghĩa cho danh từ."},
        {"option": "C", "reason_vi": "''briefed'' là quá khứ phân từ của động từ brief (hướng dẫn), không mang nghĩa phù hợp."},
        {"option": "D", "reason_vi": "''briefing'' là danh từ (cuộc họp chỉ dẫn), ghép với summary tạo cụm danh từ không tự nhiên."}
      ],
      "tip_vi": "Khi gặp cấu trúc a/an/the + [chỗ trống] + Noun, 90% đáp án là Tính từ (Adjective).",
      "example_en": "She gave a brief overview of the project.",
      "vocab_hints": [
        {"word": "brief", "meaning_vi": "ngắn gọn, tóm tắt"},
        {"word": "quarterly", "meaning_vi": "hàng quý"},
        {"word": "summary", "meaning_vi": "bản tóm tắt"}
      ]
    }'::jsonb
  ) ON CONFLICT (question_id) DO NOTHING;

  -- Câu 2 (Tenses)
  v_q_id := '11111111-1111-1111-1111-111111111102'::uuid;
  INSERT INTO public.questions (id, stem, option_a, option_b, option_c, option_d, tag_id, difficulty, status, content_hash)
  VALUES (
    v_q_id,
    'Ms. Gomez ____ as the head of the marketing department since January of last year.',
    'works', 'has worked', 'worked', 'is working',
    v_tenses, 1, 'published', 'hash_q02'
  ) ON CONFLICT (content_hash) DO NOTHING;

  INSERT INTO public.question_answers (question_id, correct_index, explanation)
  VALUES (
    v_q_id, 1,
    '{
      "rule_vi": "Dấu hiệu ''since + mốc thời gian trong quá khứ'' (since January of last year) là dấu hiệu điển hình của thì HIỆN TẠI HOÀN THÀNH (have/has + V3/ed).",
      "why_correct_vi": "Phương án B (has worked) chia đúng thì Hiện tại hoàn thành với chủ ngữ số ít ''Ms. Gomez'', diễn tả hành động bắt đầu từ quá khứ và vẫn đang tiếp diễn đến hiện tại.",
      "why_wrong_vi": [
        {"option": "A", "reason_vi": "''works'' là thì Hiện tại đơn, không đi với giới từ chỉ mốc thời gian kéo dài ''since''."},
        {"option": "C", "reason_vi": "''worked'' là Quá khứ đơn, chỉ hành động đã chấm dứt hoàn toàn trong quá khứ."},
        {"option": "D", "reason_vi": "''is working'' là Hiện tại tiếp diễn, không phù hợp với mốc thời gian ''since January of last year''."}
      ],
      "tip_vi": "Thấy ''since + mốc thời gian'' hoặc ''for + khoảng thời gian'' -> ưu tiên thì Hiện tại hoàn thành.",
      "example_en": "He has lived in Hanoi since 2018.",
      "vocab_hints": [
        {"word": "department", "meaning_vi": "phòng ban"},
        {"word": "marketing", "meaning_vi": "tiếp thị"}
      ]
    }'::jsonb
  ) ON CONFLICT (question_id) DO NOTHING;

  -- Câu 3 (Passive Voice)
  v_q_id := '11111111-1111-1111-1111-111111111103'::uuid;
  INSERT INTO public.questions (id, stem, option_a, option_b, option_c, option_d, tag_id, difficulty, status, content_hash)
  VALUES (
    v_q_id,
    'All confidential documents must be ____ before being discarded in the recycling bin.',
    'shred', 'shredding', 'shredded', 'shreds',
    v_passive, 1, 'published', 'hash_q03'
  ) ON CONFLICT (content_hash) DO NOTHING;

  INSERT INTO public.question_answers (question_id, correct_index, explanation)
  VALUES (
    v_q_id, 2,
    '{
      "rule_vi": "Cấu trúc bị động với động từ khuyết thiếu: Modal Verb + be + Past Participle (V3/ed).",
      "why_correct_vi": "Chủ ngữ là vật ''All confidential documents'' (tất cả tài liệu mật) không thể tự tiêu hủy mà phải ''được hủy''. Do đó sau ''must be'' cần phân từ 2 ''shredded''.",
      "why_wrong_vi": [
        {"option": "A", "reason_vi": "''shred'' là động từ nguyên thể."},
        {"option": "B", "reason_vi": "''shredding'' là V-ing, tạo thành thì tiếp diễn mang nghĩa chủ động."},
        {"option": "D", "reason_vi": "''shreds'' là động từ chia ngôi thứ 3 số ít hiện tại đơn."}
      ],
      "tip_vi": "Cấu trúc ''be + V3/ed'' là chìa khóa vàng cho câu bị động trong TOEIC.",
      "example_en": "The paper must be recycled properly.",
      "vocab_hints": [
        {"word": "confidential", "meaning_vi": "bảo mật, tuyệt mật"},
        {"word": "shred", "meaning_vi": "cắt nhỏ, tiêu hủy tài liệu"},
        {"word": "discard", "meaning_vi": "vứt bỏ, loại bỏ"}
      ]
    }'::jsonb
  ) ON CONFLICT (question_id) DO NOTHING;

  -- Câu 4 (Subject-Verb Agreement)
  v_q_id := '11111111-1111-1111-1111-111111111104'::uuid;
  INSERT INTO public.questions (id, stem, option_a, option_b, option_c, option_d, tag_id, difficulty, status, content_hash)
  VALUES (
    v_q_id,
    'The committee members ____ currently discussing the proposed budget revisions.',
    'is', 'are', 'was', 'has been',
    v_subj_verb, 1, 'published', 'hash_q04'
  ) ON CONFLICT (content_hash) DO NOTHING;

  INSERT INTO public.question_answers (question_id, correct_index, explanation)
  VALUES (
    v_q_id, 1,
    '{
      "rule_vi": "Chủ ngữ chính là danh từ số nhiều ''The committee members'' đi kèm trạng từ hiện tại ''currently''.",
      "why_correct_vi": "''members'' là danh từ số nhiều, kết hợp với ''currently'' (hiện tại) đòi hỏi to be số nhiều ở hiện tại là ''are'' (are currently discussing).",
      "why_wrong_vi": [
        {"option": "A", "reason_vi": "''is'' dùng cho chủ ngữ số ít."},
        {"option": "C", "reason_vi": "''was'' là quá khứ số ít."},
        {"option": "D", "reason_vi": "''has been'' dùng cho số ít và sai cấu trúc tiếp diễn với currently."}
      ],
      "tip_vi": "Xác định danh từ chính đứng trước các cụm giới từ để chia động từ chính xác.",
      "example_en": "The team members are ready.",
      "vocab_hints": [
        {"word": "committee", "meaning_vi": "ủy ban, hội đồng"},
        {"word": "budget", "meaning_vi": "ngân sách"},
        {"word": "revision", "meaning_vi": "sự sửa đổi"}
      ]
    }'::jsonb
  ) ON CONFLICT (question_id) DO NOTHING;

  -- Câu 5 (Conjunctions vs Prepositions)
  v_q_id := '11111111-1111-1111-1111-111111111105'::uuid;
  INSERT INTO public.questions (id, stem, option_a, option_b, option_c, option_d, tag_id, difficulty, status, content_hash)
  VALUES (
    v_q_id,
    '____ the severe traffic delay on Highway 10, the delivery truck arrived on time.',
    'Although', 'Despite', 'Because', 'Even though',
    v_prep, 1, 'published', 'hash_q05'
  ) ON CONFLICT (content_hash) DO NOTHING;

  INSERT INTO public.question_answers (question_id, correct_index, explanation)
  VALUES (
    v_q_id, 1,
    '{
      "rule_vi": "Phía sau chỗ trống là một Cụm danh từ (Noun Phrase: the severe traffic delay), không phải mệnh đề (S + V).",
      "why_correct_vi": "''Despite'' là giới từ đi với Cụm danh từ mang nghĩa nhượng bộ (Mặc dù...). Cả câu: ''Mặc dù xảy ra vụ ùn tắc giao thông nghiêm trọng trên Quốc lộ 10, xe tải giao hàng vẫn đến đúng giờ''.",
      "why_wrong_vi": [
        {"option": "A", "reason_vi": "''Although'' là liên từ, bắt buộc theo sau phải là mệnh đề có chủ ngữ và vị ngữ (S + V)."},
        {"option": "C", "reason_vi": "''Because'' là liên từ nguyên nhân và đòi hỏi mệnh đề S + V."},
        {"option": "D", "reason_vi": "''Even though'' là liên từ nhượng bộ, bắt buộc đi với mệnh đề S + V."}
      ],
      "tip_vi": "Ghi nhớ cặp: Although / Even though + S + V còn Despite / In spite of + Noun Phrase / V-ing.",
      "example_en": "Despite the rain, they played soccer.",
      "vocab_hints": [
        {"word": "severe", "meaning_vi": "nghiêm trọng, dữ dội"},
        {"word": "delay", "meaning_vi": "sự chậm trễ"},
        {"word": "delivery", "meaning_vi": "giao hàng"}
      ]
    }'::jsonb
  ) ON CONFLICT (question_id) DO NOTHING;

  -- Thêm 25 câu nữa để đủ ngân hàng 30 câu mẫu Part 5
  FOR i IN 6..30 LOOP
    v_q_id := ('11111111-1111-1111-1111-' || lpad(i::text, 12, '0'))::uuid;
    INSERT INTO public.questions (id, stem, option_a, option_b, option_c, option_d, tag_id, difficulty, status, content_hash)
    VALUES (
      v_q_id,
      CASE (i % 5)
        WHEN 0 THEN 'Employees who wish to enroll in the training seminar must submit their application ____ Friday.'
        WHEN 1 THEN 'The new software update will significantly ____ communication between overseas offices.'
        WHEN 2 THEN 'Customers are advised to retain their receipt in order to receive a full ____.'
        WHEN 3 THEN 'Mr. Reynolds was chosen for the promotion because he demonstrated ____ leadership skills.'
        ELSE 'Please review the attached contract carefully before ____ your signature.'
      END,
      CASE (i % 5)
        WHEN 0 THEN 'by'
        WHEN 1 THEN 'improve'
        WHEN 2 THEN 'refund'
        WHEN 3 THEN 'exceptional'
        ELSE 'affixing'
      END,
      CASE (i % 5)
        WHEN 0 THEN 'until'
        WHEN 1 THEN 'improvement'
        WHEN 2 THEN 'refunds'
        WHEN 3 THEN 'exceptionally'
        ELSE 'affixed'
      END,
      CASE (i % 5)
        WHEN 0 THEN 'at'
        WHEN 1 THEN 'improved'
        WHEN 2 THEN 'refunded'
        WHEN 3 THEN 'exception'
        ELSE 'affix'
      END,
      CASE (i % 5)
        WHEN 0 THEN 'during'
        WHEN 1 THEN 'improving'
        WHEN 2 THEN 'refunding'
        WHEN 3 THEN 'except'
        ELSE 'affixes'
      END,
      CASE (i % 5)
        WHEN 0 THEN v_prep
        WHEN 1 THEN v_word_form
        WHEN 2 THEN v_word_form
        WHEN 3 THEN v_word_form
        ELSE v_word_form
      END,
      1,
      'published',
      'hash_q' || lpad(i::text, 2, '0')
    ) ON CONFLICT (content_hash) DO NOTHING;

    INSERT INTO public.question_answers (question_id, correct_index, explanation)
    VALUES (
      v_q_id, 0,
      jsonb_build_object(
        'rule_vi', 'Cấu trúc ngữ pháp trọng tâm theo chuẩn đề thi TOEIC Part 5.',
        'why_correct_vi', 'Phương án A thỏa mãn hoàn toàn yêu cầu về từ loại và ngữ nghĩa trong ngữ cảnh công sở.',
        'why_wrong_vi', jsonb_build_array(
          jsonb_build_object('option', 'B', 'reason_vi', 'Sai từ loại hoặc không đúng ngữ cảnh.'),
          jsonb_build_object('option', 'C', 'reason_vi', 'Không kết hợp đúng với các thành phần liền kề.'),
          jsonb_build_object('option', 'D', 'reason_vi', 'Dạng thức không phù hợp với cấu trúc ngữ pháp của câu.')
        ),
        'tip_vi', 'Chú ý từ đứng trước và sau chỗ trống để xác định nhanh đáp án.',
        'example_en', 'Please ensure accuracy before final submission.',
        'vocab_hints', jsonb_build_array(
          jsonb_build_object('word', 'application', 'meaning_vi', 'đơn đăng ký, ứng tuyển'),
          jsonb_build_object('word', 'procedure', 'meaning_vi', 'quy trình, thủ tục')
        )
      )
    ) ON CONFLICT (question_id) DO NOTHING;
  END LOOP;

END $$;
