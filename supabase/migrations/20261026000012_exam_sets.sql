-- ==============================================================================
-- Migration: Bảng Đề Thi Thử (Exam Sets), Đáp Án Bảo Mật & Kết Quả Thi Thử
-- 20261026000012_exam_sets.sql
--
-- BẤT BIẾN DỰ ÁN:
-- 1. Đáp án không rời server trước khi nộp (tách riêng exam_set_answers có RLS bảo vệ)
-- 2. Mọi bảng đều bật RLS
-- ==============================================================================

-- 1. Bảng EXAM_SETS (Lưu thông tin đề thi, bài đọc, câu hỏi & các phương án A/B/C/D)
CREATE TABLE IF NOT EXISTS public.exam_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  exam_type TEXT NOT NULL DEFAULT 'full_test' CHECK (exam_type IN ('full_test', 'mini_test', 'reading_only', 'listening_only')),
  target_score INT NOT NULL DEFAULT 800,
  duration_minutes INT NOT NULL DEFAULT 120,
  total_questions INT NOT NULL DEFAULT 200,
  parts_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  content JSONB NOT NULL DEFAULT '{}'::jsonb, -- Chứa bài đọc, transcript, câu hỏi, 4 phương án (KHÔNG CÓ ĐÁP ÁN)
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'retired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.exam_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read published exam sets"
  ON public.exam_sets
  FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Allow admin manage exam sets"
  ON public.exam_sets
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2. Bảng EXAM_SET_ANSWERS (Lưu đáp án đúng, trích dẫn bằng chứng và giải thích sư phạm)
CREATE TABLE IF NOT EXISTS public.exam_set_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_set_id UUID NOT NULL REFERENCES public.exam_sets(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL, -- e.g. "t1_p1_01", "t1_p5_101", "t1_p7_147"
  part INT NOT NULL CHECK (part BETWEEN 1 AND 7),
  correct_answer TEXT NOT NULL, -- "A", "B", "C", "D"
  correct_index INT NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  evidence TEXT, -- Câu trích dẫn bằng chứng trong bài đọc hoặc audio script
  explanation TEXT NOT NULL DEFAULT '',
  explanation_vi TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (exam_set_id, question_id)
);

ALTER TABLE public.exam_set_answers ENABLE ROW LEVEL SECURITY;

-- Chỉ Admin mới được SELECT/ALL trực tiếp bảng này (Học viên thường tuyệt đối không được đọc trực tiếp)
CREATE POLICY "Allow admin read exam set answers"
  ON public.exam_set_answers
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Allow admin manage exam set answers"
  ON public.exam_set_answers
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Bảng EXAM_ATTEMPTS (Lưu phiên làm bài thi của học viên)
CREATE TABLE IF NOT EXISTS public.exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_set_id UUID NOT NULL REFERENCES public.exam_sets(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  submitted_at TIMESTAMPTZ,
  time_spent_seconds INT NOT NULL DEFAULT 0,
  user_answers JSONB NOT NULL DEFAULT '{}'::jsonb, -- {"t1_p1_01": 1, ...}
  correct_count_listening INT NOT NULL DEFAULT 0,
  correct_count_reading INT NOT NULL DEFAULT 0,
  score_listening INT NOT NULL DEFAULT 0, -- Thang điểm 5-495
  score_reading INT NOT NULL DEFAULT 0,   -- Thang điểm 5-495
  total_score INT NOT NULL DEFAULT 0,     -- Thang điểm 10-990
  detailed_results JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own exam attempts"
  ON public.exam_attempts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exam attempts"
  ON public.exam_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exam attempts"
  ON public.exam_attempts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Chỉ mục tối ưu hóa hiệu năng truy vấn đề thi
CREATE INDEX IF NOT EXISTS idx_exam_sets_slug ON public.exam_sets(slug);
CREATE INDEX IF NOT EXISTS idx_exam_set_answers_set_id ON public.exam_set_answers(exam_set_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_id ON public.exam_attempts(user_id, created_at DESC);
