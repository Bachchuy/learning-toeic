-- ==============================================================================
-- Migration: 20261026000008_dictionary_cache.sql
-- Mục đích: Bảng bộ nhớ đệm từ điển thông minh dùng chung toàn hệ thống (Global Shared Cache)
-- Hỗ trợ tra cứu tức thì dưới 1ms, phát âm US Audio, họ từ và cụm từ công sở TOEIC
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.dictionary_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  phonetic TEXT DEFAULT '',
  part_of_speech TEXT DEFAULT '',
  meaning_vi TEXT NOT NULL DEFAULT '',
  definition_en TEXT DEFAULT '',
  audio_url TEXT DEFAULT '',
  examples JSONB DEFAULT '[]'::jsonb,
  word_family JSONB DEFAULT '[]'::jsonb,
  collocations JSONB DEFAULT '[]'::jsonb,
  lookup_count INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Tối ưu hóa truy vấn O(log N) và chống trùng lặp từ khóa
CREATE UNIQUE INDEX IF NOT EXISTS idx_dict_word_lower 
  ON public.dictionary_cache (LOWER(TRIM(word)));

-- Hỗ trợ tìm kiếm tiền tố (Prefix search / Autocomplete)
CREATE INDEX IF NOT EXISTS idx_dict_word_prefix 
  ON public.dictionary_cache (word text_pattern_ops);

-- BẬT ROW LEVEL SECURITY THEO BẤT BIẾN PROJECT (§0)
ALTER TABLE public.dictionary_cache ENABLE ROW LEVEL SECURITY;

-- Chính sách RLS: Từ điển là kho tri thức dùng chung, tất cả người dùng (authenticated & anon) đều được đọc
CREATE POLICY "Allow public read dictionary_cache" 
  ON public.dictionary_cache 
  FOR SELECT 
  USING (true);

-- Cho phép người dùng đã đăng nhập thêm từ mới vào bộ nhớ đệm
CREATE POLICY "Allow authenticated insert dictionary_cache" 
  ON public.dictionary_cache 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Cho phép cập nhật số lượt tra cứu và bản dịch
CREATE POLICY "Allow authenticated update dictionary_cache" 
  ON public.dictionary_cache 
  FOR UPDATE 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);
