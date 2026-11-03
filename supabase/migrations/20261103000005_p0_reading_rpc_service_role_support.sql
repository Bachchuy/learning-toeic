-- ==============================================================================
-- Migration: 20261103000005_p0_reading_rpc_service_role_support.sql
-- Mục đích: Cập nhật chữ ký hàm submit_passage_answers với p_user_id cho service_role / test harness
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.submit_passage_answers(
  p_passage_id UUID,
  p_answers JSONB,
  p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_jwt_user_id UUID := auth.uid();
  v_user_id UUID;
  v_answer JSONB;
  v_raw_qid TEXT;
  v_raw_idx TEXT;
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
  v_processed_qids UUID[] := ARRAY[]::UUID[];
  v_already_attempted BOOLEAN;
BEGIN
  -- 1. BẮT BUỘC XÁC THỰC NGƯỜI DÙNG:
  -- Nếu gọi từ phiên học viên đăng nhập (JWT): v_user_id luôn lấy từ auth.uid() (không tin p_user_id).
  -- Nếu gọi từ backend service_role / postgres (test harness / batch): cho phép dùng p_user_id.
  -- Nếu là anon không có session: từ chối tuyệt đối.
  IF v_jwt_user_id IS NOT NULL THEN
    v_user_id := v_jwt_user_id;
  ELSIF (current_setting('role', true) = 'service_role' OR current_user IN ('postgres', 'service_role')) AND p_user_id IS NOT NULL THEN
    v_user_id := p_user_id;
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'UNAUTHORIZED',
      'message', 'Vui lòng đăng nhập để nộp bài và lưu kết quả'
    );
  END IF;

  -- 2. Kiểm tra bài đọc tồn tại và đang xuất bản
  IF NOT EXISTS (
    SELECT 1 FROM public.passages WHERE id = p_passage_id AND status = 'published'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'NOT_FOUND',
      'message', 'Bài đọc không tồn tại hoặc chưa được xuất bản'
    );
  END IF;

  -- 3. Kiểm tra định dạng payload
  IF p_answers IS NULL OR jsonb_typeof(p_answers) <> 'array' OR jsonb_array_length(p_answers) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'EMPTY_PAYLOAD',
      'message', 'Không có câu trả lời nào'
    );
  END IF;

  -- 4. Lặp qua từng câu trả lời trong payload để lọc và chấm điểm an toàn
  FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers)
  LOOP
    -- Bỏ qua nếu phần tử không phải là JSON object
    IF jsonb_typeof(v_answer) <> 'object' THEN
      CONTINUE;
    END IF;

    -- Trích xuất questionId / question_id dạng văn bản
    v_raw_qid := COALESCE(v_answer->>'questionId', v_answer->>'question_id');
    -- Trích xuất selectedIndex / selected_index dạng văn bản
    v_raw_idx := COALESCE(v_answer->>'selectedIndex', v_answer->>'selected_index');

    -- Kiểm tra cú pháp UUID an toàn bằng Regex (chống 22P02 invalid input syntax for type uuid)
    IF v_raw_qid IS NULL OR v_raw_qid !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      CONTINUE;
    END IF;

    -- Kiểm tra cú pháp selected_index là số nguyên
    IF v_raw_idx IS NULL OR v_raw_idx !~ '^-?[0-9]+$' THEN
      CONTINUE;
    END IF;

    v_question_id := v_raw_qid::UUID;
    v_selected_index := v_raw_idx::INT;

    -- CHỐNG ORACLE & BẢO VỆ DỮ LIỆU:
    -- Chỉ chấm điểm và ghi nhận attempt cho câu hỏi THỰC SỰ ĐƯỢC CHỌN ĐÁP ÁN (0, 1, 2, 3 tương ứng A, B, C, D).
    -- Nếu selected_index = -1 (bỏ qua / chưa trả lời) hoặc ngoài [0, 3]:
    -- TUYỆT ĐỐI KHÔNG ghi attempt, KHÔNG tính là câu sai, KHÔNG tiết lộ đáp án/giải thích!
    IF v_selected_index < 0 OR v_selected_index > 3 THEN
      CONTINUE;
    END IF;

    -- DEDUPLICATION: Nếu payload gửi lặp cùng 1 question_id, chỉ xử lý lần đầu tiên
    IF v_question_id = ANY(v_processed_qids) THEN
      CONTINUE;
    END IF;
    v_processed_qids := array_append(v_processed_qids, v_question_id);

    -- Xác minh question_id thuộc đúng bài đọc p_passage_id và lấy đáp án bảo mật
    SELECT q.tag_id, qa.correct_index, qa.explanation
    INTO v_tag_id, v_correct_index, v_explanation
    FROM public.questions q
    INNER JOIN public.question_answers qa ON qa.question_id = q.id
    WHERE q.id = v_question_id 
      AND q.passage_id = p_passage_id
      AND q.status = 'published';

    -- Nếu câu hỏi hợp lệ thuộc bài đọc và có đáp án bảo mật
    IF FOUND AND v_correct_index IS NOT NULL THEN
      v_total := v_total + 1;
      v_is_correct := (v_selected_index = v_correct_index);

      IF v_is_correct THEN
        v_score := v_score + 1;
      END IF;

      -- Chống nộp lặp spam cày mastery trong vòng 1 giờ cho cùng bài đọc
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

      -- Đóng gói kết quả cho câu hỏi ĐÃ ĐƯỢC TRẢ LỜI HỢP LỆ
      v_result_item := jsonb_build_object(
        'question_id', v_question_id,
        'is_correct', v_is_correct,
        'correct_index', v_correct_index,
        'user_selected', v_selected_index,
        'explanation', COALESCE(v_explanation, '{}'::jsonb)
      );

      v_results := v_results || jsonb_build_array(v_result_item);
    END IF;
  END LOOP;

  -- Nếu không có câu hỏi nào thực sự được trả lời hợp lệ
  IF v_total = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_SUBMISSION',
      'message', 'Bạn chưa chọn phương án trả lời cho bất kỳ câu hỏi nào trong bài đọc'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'score', v_score,
    'total', v_total,
    'results', v_results
  );
END;
$$;

-- Phân quyền: Thu hồi hoàn toàn quyền từ anon, chỉ cấp cho authenticated và service_role
REVOKE ALL ON FUNCTION public.submit_passage_answers(UUID, JSONB, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_passage_answers(UUID, JSONB, UUID) TO authenticated, service_role;
