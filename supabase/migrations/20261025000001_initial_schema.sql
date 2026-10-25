-- ==============================================================================
-- TOEIC AI Platform — Initial Schema Migration
-- Tuân thủ triệt để: docs/06-architecture.md §6.6-6.7 & docs/03-decisions/D-log.md
-- ==============================================================================

-- 0. Extension hỗ trợ
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. Bảng PROFILES (Hồ sơ người dùng)
-- 1-1 với auth.users, tự tạo thông qua trigger khi đăng ký
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  target_score INT NOT NULL DEFAULT 650 CHECK (target_score >= 10 AND target_score <= 990),
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 2. Hàm kiểm tra Admin (Helper Function)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 3. Bảng GRAMMAR_TAGS (16 chủ điểm ngữ pháp cố định)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.grammar_tags (
  id SERIAL PRIMARY KEY,
  tag_code TEXT UNIQUE NOT NULL,
  name_vi TEXT NOT NULL,
  description TEXT DEFAULT '',
  order_index INT NOT NULL
);

-- Seed 16 chủ điểm ngữ pháp TOEIC Part 5
INSERT INTO public.grammar_tags (tag_code, name_vi, description, order_index) VALUES
('tenses', 'Thì thời (Tenses)', 'Các thì đơn, tiếp diễn, hoàn thành và phối hợp thì', 1),
('subject_verb', 'Hòa hợp Chủ - Vị', 'Quy tắc chia động từ theo chủ ngữ đơn, số nhiều, tập hợp', 2),
('passive_voice', 'Câu bị động (Passive Voice)', 'Dạng bị động các thì, thể truyền khiến (have/get something done)', 3),
('modals', 'Động từ khuyết thiếu', 'Modal verbs, giả định thức (Subjunctive) sau recommend, demand', 4),
('gerund_infinitive', 'V-ing và To-V', 'Danh động từ, động từ nguyên mẫu có to và không to', 5),
('participles', 'Phân từ & Mệnh đề rút gọn', 'Hiện tại phân từ, quá khứ phân từ, mệnh đề phân từ', 6),
('relative_clauses', 'Mệnh đề quan hệ', 'Đại từ quan hệ who, whom, which, that, whose và rút gọn', 7),
('conditionals', 'Câu điều kiện & Giả định', 'Điều kiện loại 1, 2, 3, hỗn hợp, đảo ngữ điều kiện', 8),
('comparisons', 'Câu so sánh', 'So sánh bằng, hơn, nhất, kép (the more... the more...)', 9),
('conjunctions_prepositions', 'Liên từ & Giới từ', 'Phân biệt liên từ (although/because) và giới từ (despite/due to)', 10),
('nouns_pronouns', 'Danh từ & Đại từ', 'Danh từ đếm được, không đếm được, đại từ nhân xưng, phản thân', 11),
('adjectives_adverbs', 'Tính từ & Trạng từ', 'Vị trí tính từ, trạng từ chỉ tần suất/mức độ, đuôi từ loại', 12),
('inversion', 'Đảo ngữ (Inversion)', 'Đảo ngữ với từ phủ định (Never, Rarely), Only after, v.v.', 13),
('word_form', 'Cấu tạo từ (Word Form)', 'Nhận diện gốc từ, tiền tố, hậu tố để chọn đúng dạng từ', 14),
('collocations', 'Cụm từ cố định & Thành ngữ', 'Cụm động từ (phrasal verbs), collocations thường gặp trong công sở', 15),
('parallel_structure', 'Cấu trúc song hành', 'Cấu trúc đối xứng giữa các thành phần nối bởi and, or, but', 16)
ON CONFLICT (tag_code) DO NOTHING;

-- ==============================================================================
-- 4. Bảng QUESTIONS (Ngân hàng câu hỏi)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stem TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  tag_id INT NOT NULL REFERENCES public.grammar_tags(id),
  difficulty INT NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'needs_review', 'published', 'retired')),
  content_hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 5. Bảng QUESTION_ANSWERS (Đáp án & Giải thích)
-- BẤT BIẾN: RLS BẬT, KHÔNG CÓ POLICY SELECT CHO CLIENT!
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.question_answers (
  question_id UUID PRIMARY KEY REFERENCES public.questions(id) ON DELETE CASCADE,
  correct_index INT NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  explanation JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 6. Bảng PRACTICE_SESSIONS & SESSION_QUESTIONS (Phiên làm bài)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_id INT REFERENCES public.grammar_tags(id),
  total_questions INT NOT NULL CHECK (total_questions IN (5, 10, 20)),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.session_questions (
  session_id UUID NOT NULL REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  order_index INT NOT NULL,
  PRIMARY KEY (session_id, question_id)
);

-- ==============================================================================
-- 7. Bảng ATTEMPTS (Lần nộp bài chính thức — Nguồn sự thật cho Thống kê)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  tag_id INT NOT NULL REFERENCES public.grammar_tags(id),
  selected_index INT NOT NULL CHECK (selected_index BETWEEN 0 AND 3),
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 8. Bảng VOCAB_ENTRIES (Sổ từ vựng cá nhân)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.vocab_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  lemma TEXT NOT NULL,
  meaning TEXT NOT NULL,
  context_sentence TEXT NOT NULL DEFAULT '',
  source_question_id UUID REFERENCES public.questions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (user_id, lemma)
);

-- ==============================================================================
-- 9. Bảng REVIEW_CARDS & CARD_REVIEWS (FSRS Spaced Repetition)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.review_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vocab_entry_id UUID NOT NULL REFERENCES public.vocab_entries(id) ON DELETE CASCADE,
  state INT NOT NULL DEFAULT 0, -- 0=New, 1=Learning, 2=Review, 3=Relearning
  stability NUMERIC NOT NULL DEFAULT 0,
  difficulty NUMERIC NOT NULL DEFAULT 0,
  due TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  last_review TIMESTAMPTZ,
  reps INT NOT NULL DEFAULT 0,
  lapses INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.card_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.review_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 4), -- 1=Again, 2=Hard, 3=Good, 4=Easy
  state_before INT NOT NULL,
  stability_before NUMERIC NOT NULL,
  difficulty_before NUMERIC NOT NULL,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 10. Bảng QUESTION_REPORTS (Báo lỗi câu hỏi) & EVENTS (Sự kiện)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.question_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL CHECK (event_name IN (
    'explanation_viewed', 'explanation_expand_clicked', 'report_opened', 'vocab_saved', 'review_started'
  )),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 11. BẢN VÁ BẢO MẬT & TRIGGERS
-- ==============================================================================

-- A. Trigger tự động tạo hồ sơ (Profile) khi người dùng đăng ký Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, target_score, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    650,
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- B. BẢN VÁ BẢO MẬT: Ngăn chặn người dùng tự sửa cột 'role' thành admin!
CREATE OR REPLACE FUNCTION public.prevent_role_modification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role <> OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'LỖI BẢO MẬT: Người dùng không được phép tự sửa đổi quyền hạn (role)!';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_protect_role ON public.profiles;
CREATE TRIGGER trigger_protect_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_modification();

-- C. Trigger tự động chuyển trạng thái câu hỏi khi có 3 báo cáo cùng lý do
CREATE OR REPLACE FUNCTION public.check_question_reports()
RETURNS TRIGGER AS $$
DECLARE
  report_count INT;
BEGIN
  SELECT COUNT(*) INTO report_count
  FROM public.question_reports
  WHERE question_id = NEW.question_id AND reason = NEW.reason;

  IF report_count >= 3 THEN
    UPDATE public.questions
    SET status = 'needs_review'
    WHERE id = NEW.question_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_check_reports ON public.question_reports;
CREATE TRIGGER trigger_check_reports
  AFTER INSERT ON public.question_reports
  FOR EACH ROW EXECUTE FUNCTION public.check_question_reports();

-- ==============================================================================
-- 12. THUẬT TOÁN KHOẢNG TIN CẬY WILSON (Wilson Lower Bound)
-- z = 1.96 (Mức tin cậy 95%) — docs/A-test-data.md §A.1
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.wilson_lower(p_correct INT, p_total INT)
RETURNS NUMERIC AS $$
DECLARE
  z CONSTANT NUMERIC := 1.96;
  z2 CONSTANT NUMERIC := 3.8416; -- 1.96^2
  p_hat NUMERIC;
  denominator NUMERIC;
  center NUMERIC;
  spread NUMERIC;
BEGIN
  IF p_total <= 0 THEN
    RETURN 0;
  END IF;

  p_hat := p_correct::NUMERIC / p_total::NUMERIC;
  denominator := 1.0 + (z2 / p_total::NUMERIC);
  center := p_hat + (z2 / (2.0 * p_total::NUMERIC));
  spread := z * SQRT((p_hat * (1.0 - p_hat) + (z2 / (4.0 * p_total::NUMERIC))) / p_total::NUMERIC);

  RETURN ROUND(((center - spread) / denominator), 4);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- View tính độ vững kỹ năng (v_skill_mastery) với security_invoker
CREATE OR REPLACE VIEW public.v_skill_mastery
WITH (security_invoker = true) AS
SELECT
  a.user_id,
  a.tag_id,
  gt.tag_code,
  gt.name_vi,
  COUNT(a.id) AS total_attempts,
  COUNT(CASE WHEN a.is_correct THEN 1 END) AS correct_attempts,
  public.wilson_lower(
    COUNT(CASE WHEN a.is_correct THEN 1 END)::INT,
    COUNT(a.id)::INT
  ) AS mastery_score,
  CASE
    WHEN COUNT(a.id) < 5 THEN 'insufficient'
    WHEN public.wilson_lower(COUNT(CASE WHEN a.is_correct THEN 1 END)::INT, COUNT(a.id)::INT) >= 0.75 THEN 'mastered'
    WHEN public.wilson_lower(COUNT(CASE WHEN a.is_correct THEN 1 END)::INT, COUNT(a.id)::INT) >= 0.50 THEN 'proficient'
    ELSE 'needs_review'
  END AS mastery_label
FROM public.attempts a
JOIN public.grammar_tags gt ON gt.id = a.tag_id
GROUP BY a.user_id, a.tag_id, gt.tag_code, gt.name_vi;

-- ==============================================================================
-- 13. BẬT ROW LEVEL SECURITY (RLS) TRÊN TOÀN BỘ 100% CÁC BẢNG
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grammar_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocab_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- RLS POLICIES
-- ------------------------------------------------------------------------------

-- A. Profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (public.is_admin());

-- B. Grammar Tags
CREATE POLICY "grammar_tags_read_all" ON public.grammar_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "grammar_tags_admin_write" ON public.grammar_tags FOR ALL USING (public.is_admin());

-- C. Questions
CREATE POLICY "questions_read_published" ON public.questions FOR SELECT TO authenticated USING (status = 'published');
CREATE POLICY "questions_admin_all" ON public.questions FOR ALL USING (public.is_admin());

-- D. Question Answers: BẤT BIẾN — KHÔNG CHO HỌC VIÊN SELECT TRỰC TIẾP!
CREATE POLICY "question_answers_admin_all" ON public.question_answers FOR ALL USING (public.is_admin());

-- E. Practice Sessions & Session Questions
CREATE POLICY "sessions_own" ON public.practice_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "session_questions_own" ON public.session_questions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.practice_sessions ps
    WHERE ps.id = session_id AND ps.user_id = auth.uid()
  )
);

-- F. Attempts
CREATE POLICY "attempts_read_own" ON public.attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "attempts_insert_own" ON public.attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- G. Vocab Entries, Review Cards, Card Reviews
CREATE POLICY "vocab_own" ON public.vocab_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "review_cards_own" ON public.review_cards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "card_reviews_own" ON public.card_reviews FOR ALL USING (auth.uid() = user_id);

-- H. Reports & Events
CREATE POLICY "reports_own" ON public.question_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "events_own" ON public.events FOR ALL USING (auth.uid() = user_id);
