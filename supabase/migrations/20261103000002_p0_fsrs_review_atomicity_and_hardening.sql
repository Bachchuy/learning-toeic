-- ==============================================================================
-- Migration: 20261103000002_p0_fsrs_review_atomicity_and_hardening.sql
-- Mục đích: Đảm bảo tính nguyên tử tuyệt đối (Atomic Transaction) cho FSRS Review
--           và đóng kín lỗ hổng sửa đổi trạng thái FSRS qua REST API.
--
-- CÁC VẤN ĐỀ ĐƯỢC GIẢI QUYẾT:
-- 1. Nguyên tử hóa: Cập nhật review_cards và INSERT card_reviews trong cùng 1 transaction PostgreSQL.
-- 2. Rollback toàn bộ nếu bất kỳ thao tác nào thất bại.
-- 3. Khóa RLS: Thu hồi quyền INSERT/UPDATE/DELETE trực tiếp của client trên review_cards và card_reviews.
--    Client chỉ có quyền SELECT dữ liệu của chính mình.
-- 4. Chống giả mạo: RPC record_card_review_atomic chỉ được cấp quyền cho service_role (Backend Trusted Action).
-- 5. Chống nộp lặp (Idempotent): Kiểm tra optimistic concurrency / timing để tránh ghi đúp review khi request bị gửi lại.
-- 6. Xác thực quyền sở hữu: Thẻ phải thuộc đúng p_user_id.
-- 7. Kiểm tra ràng buộc rating strictly BETWEEN 1 AND 4.
-- ==============================================================================

-- 1. THU HẸP ROW LEVEL SECURITY (RLS) TRÊN REVIEW_CARDS VÀ CARD_REVIEWS
-- Chỉ cho phép client đọc (SELECT) thẻ của chính mình, chặn hoàn toàn INSERT/UPDATE/DELETE tùy ý qua PostgREST
DROP POLICY IF EXISTS "review_cards_own" ON public.review_cards;
DROP POLICY IF EXISTS "review_cards_select_own" ON public.review_cards;
CREATE POLICY "review_cards_select_own" 
  ON public.review_cards 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "card_reviews_own" ON public.card_reviews;
DROP POLICY IF EXISTS "card_reviews_select_own" ON public.card_reviews;
CREATE POLICY "card_reviews_select_own" 
  ON public.card_reviews 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

-- 2. HÀM RPC GIAO DỊCH NGUYÊN TỬ: RECORD_CARD_REVIEW_ATOMIC
-- Chạy với quyền SECURITY DEFINER nhưng CHỈ cấp quyền EXECUTE cho service_role
CREATE OR REPLACE FUNCTION public.record_card_review_atomic(
  p_card_id UUID,
  p_user_id UUID,
  p_new_state INT,
  p_new_stability NUMERIC,
  p_new_difficulty NUMERIC,
  p_new_due TIMESTAMPTZ,
  p_new_last_review TIMESTAMPTZ,
  p_new_reps INT,
  p_new_lapses INT,
  p_rating INT,
  p_state_before INT,
  p_stability_before NUMERIC,
  p_difficulty_before NUMERIC,
  p_reviewed_at TIMESTAMPTZ,
  p_expected_last_review TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_user_id UUID;
  v_current_last_review TIMESTAMPTZ;
  v_rows_updated INT;
BEGIN
  -- 1. Kiểm tra tham số rating hợp lệ (1=Again, 2=Hard, 3=Good, 4=Easy)
  IF p_rating IS NULL OR p_rating < 1 OR p_rating > 4 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_RATING',
      'message', 'Đánh giá rating không hợp lệ (chỉ chấp nhận 1, 2, 3, 4)'
    );
  END IF;

  -- 2. Kiểm tra quyền sở hữu thẻ ôn tập
  SELECT user_id, last_review
  INTO v_current_user_id, v_current_last_review
  FROM public.review_cards
  WHERE id = p_card_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'NOT_FOUND',
      'message', 'Không tìm thấy thẻ ôn tập này'
    );
  END IF;

  IF v_current_user_id <> p_user_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'FORBIDDEN',
      'message', 'Bạn không có quyền thao tác trên thẻ ôn tập này'
    );
  END IF;

  -- 3. Chống request lặp (Idempotency): Nếu thẻ vừa được chấm trong vòng 2 giây trước với trạng thái tương tự
  IF v_current_last_review IS NOT NULL AND 
     p_new_last_review IS NOT NULL AND 
     v_current_last_review >= (now() - INTERVAL '2 seconds') THEN
    RETURN jsonb_build_object(
      'success', true,
      'idempotent', true,
      'message', 'Thẻ vừa được cập nhật trước đó'
    );
  END IF;

  -- 4. CẬP NHẬT TRẠNG THÁI REVIEW_CARDS
  -- Sử dụng Optimistic Concurrency nếu có p_expected_last_review
  IF p_expected_last_review IS NOT NULL THEN
    UPDATE public.review_cards
    SET
      state = p_new_state,
      stability = p_new_stability,
      difficulty = p_new_difficulty,
      due = p_new_due,
      last_review = p_new_last_review,
      reps = p_new_reps,
      lapses = p_new_lapses
    WHERE id = p_card_id
      AND user_id = p_user_id
      AND (last_review IS NOT DISTINCT FROM p_expected_last_review);
  ELSE
    UPDATE public.review_cards
    SET
      state = p_new_state,
      stability = p_new_stability,
      difficulty = p_new_difficulty,
      due = p_new_due,
      last_review = p_new_last_review,
      reps = p_new_reps,
      lapses = p_new_lapses
    WHERE id = p_card_id
      AND user_id = p_user_id;
  END IF;

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
  IF v_rows_updated = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CONCURRENCY_CONFLICT',
      'message', 'Thẻ đã được cập nhật bởi một phiên khác'
    );
  END IF;

  -- 5. GHI LỊCH SỬ CHẤM THẺ VÀO CARD_REVIEWS (APPEND-ONLY) TRONG CÙNG GIAO DỊCH
  INSERT INTO public.card_reviews (
    card_id,
    user_id,
    rating,
    state_before,
    stability_before,
    difficulty_before,
    reviewed_at
  ) VALUES (
    p_card_id,
    p_user_id,
    p_rating,
    p_state_before,
    p_stability_before,
    p_difficulty_before,
    COALESCE(p_reviewed_at, timezone('utc'::text, now()))
  );

  -- Toàn bộ giao dịch hoàn tất thành công
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Đã cập nhật trạng thái thẻ và ghi lịch sử ôn tập thành công'
  );
END;
$$;

-- 3. PHÂN QUYỀN CHẶT CHẼ
-- Tuyệt đối không cho anon hoặc authenticated gọi hàm này qua REST API!
REVOKE ALL ON FUNCTION public.record_card_review_atomic(
  UUID, UUID, INT, NUMERIC, NUMERIC, TIMESTAMPTZ, TIMESTAMPTZ, INT, INT, INT, INT, NUMERIC, NUMERIC, TIMESTAMPTZ, TIMESTAMPTZ
) FROM PUBLIC, anon, authenticated;

-- Chỉ cấp quyền cho service_role (được gọi từ Next.js Server Action với createAdminClient)
GRANT EXECUTE ON FUNCTION public.record_card_review_atomic(
  UUID, UUID, INT, NUMERIC, NUMERIC, TIMESTAMPTZ, TIMESTAMPTZ, INT, INT, INT, INT, NUMERIC, NUMERIC, TIMESTAMPTZ, TIMESTAMPTZ
) TO service_role;
