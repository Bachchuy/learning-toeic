-- ==============================================================================
-- Migration: 20261026000007_performance_indexes.sql
-- Mục đích: Bổ sung các chỉ mục hiệu năng (Composite & B-tree Indexes)
-- Khắc phục triệt để tình trạng Full Table Scan khi dữ liệu tăng trưởng quy mô lớn
-- ==============================================================================

-- 1. Bảng ATTEMPTS: Tối ưu tính toán Độ thành thạo (v_skill_mastery) & Biểu đồ 14 ngày
CREATE INDEX IF NOT EXISTS idx_attempts_user_tag 
  ON public.attempts (user_id, tag_id);

CREATE INDEX IF NOT EXISTS idx_attempts_user_answered_at 
  ON public.attempts (user_id, answered_at DESC);

CREATE INDEX IF NOT EXISTS idx_attempts_session_id 
  ON public.attempts (session_id);

-- 2. Bảng QUESTIONS: Tối ưu lọc câu hỏi theo chủ điểm và trạng thái (create_session RPC)
CREATE INDEX IF NOT EXISTS idx_questions_tag_status 
  ON public.questions (tag_id, status);

CREATE INDEX IF NOT EXISTS idx_questions_status_difficulty 
  ON public.questions (status, difficulty);

-- 3. Bảng REVIEW_CARDS: Tối ưu truy vấn thẻ đến hạn ôn tập FSRS (/review & dashboard)
CREATE INDEX IF NOT EXISTS idx_review_cards_user_due 
  ON public.review_cards (user_id, due ASC);

-- 4. Bảng CARD_REVIEWS: Tối ưu lịch sử ôn tập theo thẻ
CREATE INDEX IF NOT EXISTS idx_card_reviews_card_id 
  ON public.card_reviews (card_id, reviewed_at DESC);

-- 5. Bảng VOCAB_ENTRIES: Tối ưu danh sách sổ từ vựng và tìm kiếm theo người dùng (/vocab)
CREATE INDEX IF NOT EXISTS idx_vocab_entries_user_created 
  ON public.vocab_entries (user_id, created_at DESC);

-- 6. Bảng PRACTICE_SESSIONS: Tối ưu lấy phiên làm bài gần nhất của người dùng
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_created 
  ON public.practice_sessions (user_id, created_at DESC);

-- 7. Bảng QUESTION_REPORTS: Tối ưu kiểm tra số lượng báo cáo lỗi (trigger chuyển needs_review)
CREATE INDEX IF NOT EXISTS idx_question_reports_question_reason 
  ON public.question_reports (question_id, reason);
