-- ==============================================================================
-- Migration: 20261119000001_p0_rpc_and_rls_hardening.sql
-- Batch 1 (Post-Audit Recovery P0):
--   1. Drop legacy 2-arg submit_passage_answers(UUID, JSONB) overload (RC-02).
--   2. Tighten practice_sessions & session_questions RLS from FOR ALL to FOR SELECT (MD-02).
--   3. Restore get_session_review(UUID) object contract & enforce completion/attempt gate (RC-01, MD-02).
--   4. Restrict create_session() strictly to Part 5 (part = 5 AND passage_id IS NULL) (RC-05, MD-07).
--   5. Filter check_question_reports() trigger to pending reports only (RC-10, MD-07).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. DROP LEGACY 2-ARG submit_passage_answers OVERLOAD
--    Keep only hardened 3-arg signature (UUID, JSONB, UUID DEFAULT NULL).
-- ------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.submit_passage_answers(UUID, JSONB);

-- ------------------------------------------------------------------------------
-- 2. TIGHTEN RLS ON practice_sessions & session_questions (FOR SELECT ONLY)
--    All writes occur through SECURITY DEFINER RPCs (create_session, finish_session).
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "sessions_own" ON public.practice_sessions;
DROP POLICY IF EXISTS "sessions_select_own" ON public.practice_sessions;
CREATE POLICY "sessions_select_own"
  ON public.practice_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "session_questions_own" ON public.session_questions;
DROP POLICY IF EXISTS "session_questions_select_own" ON public.session_questions;
CREATE POLICY "session_questions_select_own"
  ON public.session_questions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.practice_sessions ps
      WHERE ps.id = session_id AND ps.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 3. RESTORE get_session_review(UUID) OBJECT CONTRACT & CLOSE ANSWER LEAK
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_session_review(p_session_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_session RECORD;
  v_correct INT := 0;
  v_attempts JSONB := '[]'::jsonb;
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

  IF v_session.completed_at IS NULL THEN
    RAISE EXCEPTION 'Phiên luyện tập chưa hoàn thành';
  END IF;

  SELECT COALESCE(COUNT(*) FILTER (WHERE is_correct = true), 0)::INT
  INTO v_correct
  FROM public.attempts
  WHERE session_id = p_session_id AND user_id = v_user_id;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'question_id', q.id,
        'order_index', sq.order_index,
        'stem', q.stem,
        'option_a', q.option_a,
        'option_b', q.option_b,
        'option_c', q.option_c,
        'option_d', q.option_d,
        'tag_name_vi', COALESCE(gt.name_vi, 'Ngữ pháp tổng hợp'),
        'selected_index', a.selected_index,
        'correct_index', qa.correct_index,
        'is_correct', a.is_correct,
        'explanation', COALESCE(qa.explanation, '{}'::jsonb)
      ) ORDER BY sq.order_index
    ),
    '[]'::jsonb
  )
  INTO v_attempts
  FROM public.session_questions sq
  JOIN public.questions q ON q.id = sq.question_id
  INNER JOIN public.attempts a
    ON a.session_id = p_session_id
    AND a.question_id = sq.question_id
    AND a.user_id = v_user_id
  LEFT JOIN public.grammar_tags gt ON gt.id = q.tag_id
  INNER JOIN public.question_answers qa ON qa.question_id = sq.question_id
  WHERE sq.session_id = p_session_id;

  RETURN jsonb_build_object(
    'session_id', v_session.id,
    'total_questions', v_session.total_questions,
    'completed_at', v_session.completed_at,
    'created_at', v_session.created_at,
    'correct_count', v_correct,
    'attempts', v_attempts
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_session_review(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_session_review(UUID) TO authenticated;

-- ------------------------------------------------------------------------------
-- 4. RESTRICT create_session() STRICTLY TO PART 5 (part = 5 AND passage_id IS NULL)
-- ------------------------------------------------------------------------------
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
  v_requested_total INT := LEAST(GREATEST(COALESCE(p_total_questions, 10), 1), 20);
  v_actual_total INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Vui lòng đăng nhập để tạo phiên luyện tập';
  END IF;

  SELECT array_agg(q.id) INTO v_question_ids
  FROM (
    SELECT q.id
    FROM public.questions q
    WHERE q.status = 'published'
      AND q.part = 5
      AND q.passage_id IS NULL
      AND (p_tag_id IS NULL OR q.tag_id = p_tag_id)
      AND NOT EXISTS (
        SELECT 1 FROM public.attempts a
        WHERE a.user_id = v_user_id
          AND a.question_id = q.id
          AND a.is_correct = true
          AND a.answered_at >= (now() - INTERVAL '7 days')
      )
    ORDER BY random()
    LIMIT v_requested_total
  ) q;

  v_actual_total := COALESCE(array_length(v_question_ids, 1), 0);

  IF v_actual_total = 0 THEN
    RETURN jsonb_build_object(
      'error', 'NO_QUESTIONS_AVAILABLE',
      'message', 'Bạn đã làm đúng hết câu của chủ điểm này trong 7 ngày qua'
    );
  END IF;

  INSERT INTO public.practice_sessions (user_id, tag_id, total_questions)
  VALUES (v_user_id, p_tag_id, v_actual_total)
  RETURNING id INTO v_session_id;

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

REVOKE ALL ON FUNCTION public.create_session(INT, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_session(INT, INT) TO authenticated;

-- ------------------------------------------------------------------------------
-- 5. COUNT ONLY PENDING REPORTS IN check_question_reports() TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_question_reports()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_distinct_users INT;
BEGIN
  SELECT COUNT(DISTINCT user_id) INTO v_distinct_users
  FROM public.question_reports
  WHERE question_id = NEW.question_id
    AND reason = NEW.reason
    AND status = 'pending';

  IF v_distinct_users >= 3 THEN
    UPDATE public.questions
    SET status = 'needs_review'
    WHERE id = NEW.question_id AND status = 'published';
  END IF;

  RETURN NEW;
END;
$$;
