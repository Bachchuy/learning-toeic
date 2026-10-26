-- ==============================================================================
-- Migration: Bảng review_log và hoàn thiện quyền quản trị (M11 /admin/review)
-- BẤT BIẾN §6.6: Ghi nhật ký quyết định duyệt/loại/sửa của Admin (review_log)
-- ==============================================================================

-- 1. Bảng REVIEW_LOG
CREATE TABLE IF NOT EXISTS public.review_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'edited')),
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Bật RLS cho review_log
ALTER TABLE public.review_log ENABLE ROW LEVEL SECURITY;

-- Chỉ Admin mới có quyền truy cập review_log (§6.6)
DROP POLICY IF EXISTS "review_log_admin_all" ON public.review_log;
CREATE POLICY "review_log_admin_all" ON public.review_log FOR ALL USING (public.is_admin());

-- 2. Cấp quyền đọc/ghi toàn bộ question_reports cho Admin
DROP POLICY IF EXISTS "reports_admin_all" ON public.question_reports;
CREATE POLICY "reports_admin_all" ON public.question_reports FOR ALL USING (public.is_admin());

-- 3. Đưa 2 câu hỏi mẫu vào trạng thái needs_review để kiểm thử hàng đợi duyệt
-- (Chỉ thực hiện nếu hàng đợi needs_review đang trống)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE status = 'needs_review') THEN
    UPDATE public.questions
    SET status = 'needs_review'
    WHERE id IN (
      SELECT id FROM public.questions
      ORDER BY created_at DESC
      LIMIT 2
    );
  END IF;
END $$;
