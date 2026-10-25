-- ==============================================================================
-- Migration: Bổ sung metadata JSONB cho vocab_entries (Họ từ, Đồng nghĩa, Trái nghĩa, Cụm từ)
-- Khớp với mẫu thiết kế từ điển chuyên sâu của người dùng
-- ==============================================================================

ALTER TABLE public.vocab_entries
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.vocab_entries.metadata IS 'Chứa các trường từ điển chi tiết: word_family, synonyms, antonyms, collocations, detailed_explanation, topic, phonetic';
