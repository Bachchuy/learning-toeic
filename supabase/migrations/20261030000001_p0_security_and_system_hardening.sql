-- ==============================================================================
-- Migration: 20261030000001_p0_security_and_system_hardening.sql
-- Mục đích: Khắc phục các lỗ hổng bảo mật cấp cao (P0) & Siết chặt RLS
-- Tuân thủ:
-- 1. Bổ sung SET search_path = public cho toàn bộ hàm SECURITY DEFINER (chống Privilege Escalation).
-- 2. Khắc phục hàm submit_passage_answers (thu hồi quyền anon, chống oracle lộ đáp án, chống nộp trùng).
-- 3. Nới lỏng practice_sessions_total_questions_check (chống crash khi ngân hàng câu hỏi còn < 10 câu).
-- 4. Thêm UNIQUE indexes để đảm bảo tính Idempotent cho attempts, review_cards, question_reports.
-- 5. Sửa lỗi 42P10 của dictionary_cache bằng unique constraint trên cột word.
-- 6. Thu hẹp các RLS policies quá rộng (attempts, exam_attempts, dictionary_cache).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CẬP NHẬT RÀNG BUỘC CHECK BẢNG PRACTICE_SESSIONS
-- ------------------------------------------------------------------------------
ALTER TABLE public.practice_sessions DROP CONSTRAINT IF EXISTS practice_sessions_total_questions_check;
ALTER TABLE public.practice_sessions ADD CONSTRAINT practice_sessions_total_questions_check CHECK (total_questions BETWEEN 1 AND 20);

-- ------------------------------------------------------------------------------
-- 2. UNIQUE CONSTRAINTS & INDEXES CHO TÍNH TOÀN VẸN DỮ LIỆU
-- ------------------------------------------------------------------------------
-- A. dictionary_cache: Cần UNIQUE constraint trực tiếp trên cột 'word' để hỗ trợ ON CONFLICT (word)
ALTER TABLE public.dictionary_cache DROP CONSTRAINT IF EXISTS uq_dictionary_cache_word;
ALTER TABLE public.dictionary_cache ADD CONSTRAINT uq_dictionary_cache_word UNIQUE (word);

-- B. review_cards: Đảm bảo 1 user chỉ có 1 thẻ ôn cho mỗi từ vựng
-- Giúp trigger ON CONFLICT (user_id, vocab_entry_id) DO NOTHING hoạt động chuẩn xác
CREATE UNIQUE INDEX IF NOT EXISTS idx_review_cards_user_vocab 
  ON public.review_cards (user_id, vocab_entry_id);

-- C. question_reports: 1 user chỉ được gửi 1 báo cáo cho 1 câu hỏi (chống spam 3 report kéo sập câu hỏi)
CREATE UNIQUE INDEX IF NOT EXISTS idx_question_reports_user_question 
  ON public.question_reports (user_id, question_id);

-- D. attempts: Tránh nộp trùng lặp câu hỏi trong cùng một session
CREATE UNIQUE INDEX IF NOT EXISTS idx_attempts_session_question 
  ON public.attempts (session_id, question_id) 
  WHERE session_id IS NOT NULL;

-- ------------------------------------------------------------------------------
-- 3. CẬP NHẬT CÁC HÀM SECURITY DEFINER VỚI SET search_path = public
-- ------------------------------------------------------------------------------

-- A. is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- B. handle_new_user()
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, target_score)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Học viên'),
    NEW.email,
    'student',
    650
  );
  RETURN NEW;
END;
$$;

-- C. prevent_role_modification() - Cho phép Service Role / Database Admin (khi auth.uid() IS NULL) sửa role
CREATE OR REPLACE FUNCTION public.prevent_role_modification()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Chỉ áp dụng chặn khi cuộc gọi đến từ client của người dùng đã xác thực (auth.uid() IS NOT NULL)
  IF auth.uid() IS NOT NULL AND NEW.role <> OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'LỖI BẢO MẬT: Người dùng không được phép tự sửa đổi quyền hạn (role)!';
  END IF;
  RETURN NEW;
END;
$$;

-- D. check_question_reports()
CREATE OR REPLACE FUNCTION public.check_question_reports()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_distinct_users INT;
BEGIN
  -- Đếm số người dùng khác nhau báo cáo câu hỏi này cùng một lý do
  SELECT COUNT(DISTINCT user_id) INTO v_distinct_users
  FROM public.question_reports
  WHERE question_id = NEW.question_id AND reason = NEW.reason;

  IF v_distinct_users >= 3 THEN
    UPDATE public.questions
    SET status = 'needs_review'
    WHERE id = NEW.question_id AND status = 'published';
  END IF;

  RETURN NEW;
END;
$$;

-- E. handle_new_vocab_entry()
CREATE OR REPLACE FUNCTION public.handle_new_vocab_entry()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.review_cards (
    user_id,
    vocab_entry_id,
    state,
    stability,
    difficulty,
    due,
    reps,
    lapses
  )
  VALUES (
    NEW.user_id,
    NEW.id,
    0,
    0,
    0,
    timezone('utc'::text, now()),
    0,
    0
  )
  ON CONFLICT (user_id, vocab_entry_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- F. create_session()
CREATE OR REPLACE FUNCTION public.create_session(
  p_tag_id INT DEFAULT NULL,
  p_total_questions INT DEFAULT 10
)
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_session_id UUID;
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

  -- 2. Tạo phiên trong practice_sessions (v_actual_total đã được kiểm tra CHECK 1..20)
  INSERT INTO public.practice_sessions (user_id, tag_id, total_questions)
  VALUES (v_user_id, p_tag_id, v_actual_total)
  RETURNING id INTO v_session_id;

  -- 3. Lưu danh sách câu vào session_questions
  FOR i IN 1..v_actual_total LOOP
    INSERT INTO public.session_questions (session_id, question_id, order_index)
    VALUES (v_session_id, v_question_ids[i], i);
  END LOOP;

  RETURN jsonb_build_object(
    'session_id', v_session_id,
    'total_questions', v_actual_total
  );
END;
$$;

-- G. submit_answer()
CREATE OR REPLACE FUNCTION public.submit_answer(
  p_session_id UUID,
  p_question_id UUID,
  p_selected_index INT
)
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- H. finish_session() & get_session_review()
CREATE OR REPLACE FUNCTION public.finish_session(p_session_id UUID)
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_session RECORD;
  v_total INT;
  v_correct INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Vui lòng đăng nhập';
  END IF;

  SELECT * INTO v_session
  FROM public.practice_sessions
  WHERE id = p_session_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Phiên không tồn tại hoặc không thuộc quyền sở hữu';
  END IF;

  IF v_session.completed_at IS NOT NULL THEN
    RETURN jsonb_build_object('already_completed', true, 'completed_at', v_session.completed_at);
  END IF;

  UPDATE public.practice_sessions
  SET completed_at = timezone('utc'::text, now())
  WHERE id = p_session_id;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_correct = true)
  INTO v_total, v_correct
  FROM public.attempts
  WHERE session_id = p_session_id;

  RETURN jsonb_build_object(
    'completed_at', now(),
    'total_answered', v_total,
    'correct_count', v_correct
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_session_review(p_session_id UUID)
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_session RECORD;
  v_results JSONB;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Vui lòng đăng nhập';
  END IF;

  SELECT * INTO v_session
  FROM public.practice_sessions
  WHERE id = p_session_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Phiên không tồn tại hoặc không thuộc quyền sở hữu';
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'question_id', q.id,
      'order_index', sq.order_index,
      'stem', q.stem,
      'option_a', q.option_a,
      'option_b', q.option_b,
      'option_c', q.option_c,
      'option_d', q.option_d,
      'selected_index', a.selected_index,
      'is_correct', a.is_correct,
      'correct_index', qa.correct_index,
      'explanation', qa.explanation
    ) ORDER BY sq.order_index
  ) INTO v_results
  FROM public.session_questions sq
  JOIN public.questions q ON q.id = sq.question_id
  LEFT JOIN public.attempts a ON a.session_id = p_session_id AND a.question_id = sq.question_id
  LEFT JOIN public.question_answers qa ON qa.question_id = sq.question_id
  WHERE sq.session_id = p_session_id;

  RETURN COALESCE(v_results, '[]'::jsonb);
END;
$$;

-- I. submit_passage_answers() - BẢO MẬT & CHỐNG ORACLE & CHỐNG NỘP TRÙNG
CREATE OR REPLACE FUNCTION public.submit_passage_answers(
  p_passage_id UUID,
  p_answers JSONB
)
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_answer JSONB;
  v_question_id UUID;
  v_selected_index INT;
  v_correct_index INT;
  v_explanation JSONB;
  v_tag_id INT;
  v_is_correct BOOLEAN;
  v_score INT := 0;
  v_total INT := 0;
  v_valid_answers_count INT := 0;
  v_results JSONB := '[]'::jsonb;
  v_result_item JSONB;
  v_already_attempted BOOLEAN;
BEGIN
  -- 1. BẮT BUỘC ĐĂNG NHẬP (Chặn hoàn toàn anon khai thác làm bài thi công khai)
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'UNAUTHORIZED',
      'message', 'Vui lòng đăng nhập để nộp bài và lưu kết quả'
    );
  END IF;

  -- 2. Kiểm tra bài đọc tồn tại và published
  IF NOT EXISTS (
    SELECT 1 FROM public.passages WHERE id = p_passage_id AND status = 'published'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'NOT_FOUND',
      'message', 'Bài đọc không tồn tại hoặc chưa được xuất bản'
    );
  END IF;

  IF p_answers IS NULL OR jsonb_array_length(p_answers) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'EMPTY_PAYLOAD',
      'message', 'Không có câu trả lời nào'
    );
  END IF;

  -- 3. Kiểm tra xem người dùng có thực sự làm bài hay gửi probe payload toàn -1
  FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers)
  LOOP
    v_selected_index := COALESCE(
      (v_answer->>'selectedIndex')::int,
      (v_answer->>'selected_index')::int,
      -1
    );
    IF v_selected_index >= 0 THEN
      v_valid_answers_count := v_valid_answers_count + 1;
    END IF;
  END LOOP;

  -- Nếu không có bất kỳ câu trả lời nào được chọn (toàn bộ là -1 hoặc probe payload), từ chối lộ đáp án
  IF v_valid_answers_count = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_SUBMISSION',
      'message', 'Bạn chưa chọn phương án trả lời cho bất kỳ câu hỏi nào'
    );
  END IF;

  -- 4. Chấm điểm từng câu hỏi và ghi nhận attempt có kiểm tra trùng lặp
  FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers)
  LOOP
    v_question_id := COALESCE(
      (v_answer->>'questionId')::uuid,
      (v_answer->>'question_id')::uuid
    );
    v_selected_index := COALESCE(
      (v_answer->>'selectedIndex')::int,
      (v_answer->>'selected_index')::int,
      -1
    );

    IF v_question_id IS NOT NULL THEN
      SELECT q.tag_id, qa.correct_index, qa.explanation
      INTO v_tag_id, v_correct_index, v_explanation
      FROM public.questions q
      LEFT JOIN public.question_answers qa ON qa.question_id = q.id
      WHERE q.id = v_question_id AND q.passage_id = p_passage_id;

      IF FOUND AND v_correct_index IS NOT NULL THEN
        v_total := v_total + 1;
        v_is_correct := (v_selected_index = v_correct_index);

        IF v_is_correct THEN
          v_score := v_score + 1;
        END IF;

        -- Kiểm tra xem câu này người dùng đã nộp gần đây chưa (trong vòng 1 giờ cho bài đọc này)
        -- Tránh việc nộp lại liên tiếp để cày mastery
        SELECT EXISTS (
          SELECT 1 FROM public.attempts 
          WHERE user_id = v_user_id 
            AND question_id = v_question_id 
            AND session_id IS NULL
            AND answered_at >= (now() - INTERVAL '1 hour')
        ) INTO v_already_attempted;

        IF NOT v_already_attempted THEN
          INSERT INTO public.attempts (
            user_id,
            question_id,
            tag_id,
            selected_index,
            is_correct,
            answered_at
          ) VALUES (
            v_user_id,
            v_question_id,
            v_tag_id,
            v_selected_index,
            v_is_correct,
            timezone('utc'::text, now())
          );
        END IF;

        v_result_item := jsonb_build_object(
          'question_id', v_question_id,
          'is_correct', v_is_correct,
          'correct_index', v_correct_index,
          'user_selected', v_selected_index,
          'explanation', COALESCE(v_explanation, '{}'::jsonb)
        );

        v_results := v_results || jsonb_build_array(v_result_item);
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'score', v_score,
    'total', v_total,
    'results', v_results
  );
END;
$$;

-- Thu hồi quyền anon khỏi submit_passage_answers, chỉ cấp cho authenticated
REVOKE EXECUTE ON FUNCTION public.submit_passage_answers(UUID, JSONB) FROM anon;
GRANT EXECUTE ON FUNCTION public.submit_passage_answers(UUID, JSONB) TO authenticated;

-- ------------------------------------------------------------------------------
-- 4. THU HẸP ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- A. Bảng attempts: Bỏ hoàn toàn policy attempts_insert_own
-- Tuyệt đối không cho client tự chèn attempt qua REST API (toàn bộ phải qua RPC submit_answer / submit_passage_answers)
DROP POLICY IF EXISTS "attempts_insert_own" ON public.attempts;

-- B. Bảng exam_attempts: Bỏ quyền tự INSERT / UPDATE trực tiếp từ client
-- Chấm thi qua Server Action an toàn bằng Service Role
DROP POLICY IF EXISTS "Users can insert own exam attempts" ON public.exam_attempts;
DROP POLICY IF EXISTS "Users can update own exam attempts" ON public.exam_attempts;

-- C. Bảng dictionary_cache: Chỉ cho phép Admin sửa cache, không cho phép mọi authenticated user sửa tự do
DROP POLICY IF EXISTS "Allow authenticated update dictionary_cache" ON public.dictionary_cache;
CREATE POLICY "Allow admin update dictionary_cache" 
  ON public.dictionary_cache 
  FOR UPDATE 
  USING (public.is_admin());
