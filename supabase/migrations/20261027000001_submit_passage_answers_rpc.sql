-- ==============================================================================
-- Migration: RPC submit_passage_answers & Cập nhật Schema bảng Attempts
-- 20261027000001_submit_passage_answers_rpc.sql
--
-- BẤT BIẾN DỰ ÁN:
-- 1. Đáp án không rời server trước khi nộp (question_answers không lộ cho client).
-- 2. Học viên thường (role 'student') nộp bài và chấm điểm qua RPC SECURITY DEFINER.
-- 3. Cho phép session_id và tag_id là NULL cho bài làm Part 6 & Part 7.
-- ==============================================================================

-- 1. Nới lỏng ràng buộc bảng ATTEMPTS cho các bài làm độc lập ngoài Practice Session (Part 6 / Part 7)
ALTER TABLE public.attempts ALTER COLUMN session_id DROP NOT NULL;
ALTER TABLE public.attempts ALTER COLUMN tag_id DROP NOT NULL;

-- Nới lỏng check constraint selected_index để hỗ trợ trường hợp bỏ qua câu hỏi (-1)
ALTER TABLE public.attempts DROP CONSTRAINT IF EXISTS attempts_selected_index_check;
ALTER TABLE public.attempts ADD CONSTRAINT attempts_selected_index_check CHECK (selected_index BETWEEN -1 AND 3);

-- 2. RPC: SUBMIT_PASSAGE_ANSWERS (Chấm điểm Part 6 / Part 7 bảo mật trên server)
CREATE OR REPLACE FUNCTION public.submit_passage_answers(
  p_passage_id UUID,
  p_answers JSONB
)
RETURNS JSONB AS $$
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
  v_results JSONB := '[]'::jsonb;
  v_result_item JSONB;
BEGIN
  -- Kiểm tra bài đọc tồn tại và đang ở trạng thái xuất bản
  IF NOT EXISTS (
    SELECT 1 FROM public.passages WHERE id = p_passage_id AND status = 'published'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'score', 0,
      'total', 0,
      'results', '[]'::jsonb,
      'message', 'Bài đọc không tồn tại hoặc chưa được xuất bản'
    );
  END IF;

  IF p_answers IS NULL OR jsonb_array_length(p_answers) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'score', 0,
      'total', 0,
      'results', '[]'::jsonb,
      'message', 'Không có câu trả lời nào'
    );
  END IF;

  FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers)
  LOOP
    -- Hỗ trợ cả camelCase (questionId, selectedIndex) lẫn snake_case (question_id, selected_index)
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
      -- Lấy tag_id từ questions và đáp án bảo mật từ question_answers
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

        -- Ghi nhận attempt vào DB nếu người dùng đã đăng nhập (hỗ trợ cả tài khoản student)
        IF v_user_id IS NOT NULL THEN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cấp quyền thực thi RPC cho học viên đã đăng nhập và khách vãng lai
GRANT EXECUTE ON FUNCTION public.submit_passage_answers(UUID, JSONB) TO authenticated, anon;
