-- ==============================================================================
-- Migration: Bảng USER_FEEDBACK (Kênh thu thập góp ý sản phẩm & UX từ người dùng)
-- 20261110000001_user_feedback.sql
--
-- BẤT BIẾN BẢO MẬT:
-- 1. Bật RLS 100%
-- 2. Người dùng chỉ được INSERT/SELECT góp ý của chính mình (auth.uid() = user_id)
-- 3. Chỉ Admin (public.is_admin()) được xem toàn bộ & cập nhật trạng thái xử lý
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('bug', 'ux', 'content', 'feature', 'other')),
  message TEXT NOT NULL CHECK (char_length(trim(message)) BETWEEN 5 AND 2000),
  page_path TEXT NOT NULL DEFAULT '',
  viewport TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_user_feedback_status_created
  ON public.user_feedback (status, created_at DESC);

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_feedback_insert_own" ON public.user_feedback;
CREATE POLICY "user_feedback_insert_own"
  ON public.user_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_feedback_select_own" ON public.user_feedback;
CREATE POLICY "user_feedback_select_own"
  ON public.user_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_feedback_admin_all" ON public.user_feedback;
CREATE POLICY "user_feedback_admin_all"
  ON public.user_feedback
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
