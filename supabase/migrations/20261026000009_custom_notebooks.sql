-- ==============================================================================
-- Migration: 20261026000009_custom_notebooks.sql
-- Mục đích: Hệ thống Sổ từ vựng tự tạo (Custom Notebooks / Decks)
-- Cho phép người học phân nhóm từ vựng theo chuyên đề TOEIC (Hợp đồng, Kế toán, Nhân sự...)
-- ==============================================================================

-- 1. Bảng lưu trữ Sổ từ vựng của người dùng
CREATE TABLE IF NOT EXISTS public.notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT NOT NULL DEFAULT '#2563EB',
  icon TEXT NOT NULL DEFAULT 'folder',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Bật RLS: Bất biến của project (§0)
ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;

-- Chính sách RLS: Người dùng có toàn quyền quản lý sổ của chính mình
CREATE POLICY "Users can manage their own notebooks"
  ON public.notebooks
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 2. Thêm khóa ngoại notebook_id vào bảng vocab_entries hiện tại
ALTER TABLE public.vocab_entries 
  ADD COLUMN IF NOT EXISTS notebook_id UUID REFERENCES public.notebooks(id) ON DELETE SET NULL;

-- 3. Tạo các chỉ mục tối ưu truy vấn
CREATE INDEX IF NOT EXISTS idx_notebooks_user 
  ON public.notebooks (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vocab_entries_user_notebook 
  ON public.vocab_entries (user_id, notebook_id);
