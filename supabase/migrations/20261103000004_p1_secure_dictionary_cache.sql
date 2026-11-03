-- ==============================================================================
-- Migration: 20261103000004_p1_secure_dictionary_cache.sql
-- Mục đích: Đóng kín lỗ hổng Cache Poisoning trên bảng dictionary_cache
--
-- CÁC ĐIỂM BẢO MẬT:
-- 1. Xóa bỏ hoàn toàn quyền INSERT/UPDATE của role authenticated trên dictionary_cache.
-- 2. Đảm bảo dictionary_cache là Global Read-Only đối với mọi người dùng client (anon, authenticated).
-- 3. Chỉ có Backend tin cậy (service_role) mới có quyền ghi/cập nhật bộ nhớ đệm từ điển.
-- ==============================================================================

-- 1. Xóa tất cả các policy cũ có thể cho phép client ghi/sửa dữ liệu cache
DROP POLICY IF EXISTS "Allow public read dictionary_cache" ON public.dictionary_cache;
DROP POLICY IF EXISTS "Allow authenticated insert dictionary_cache" ON public.dictionary_cache;
DROP POLICY IF EXISTS "Allow authenticated update dictionary_cache" ON public.dictionary_cache;
DROP POLICY IF EXISTS "Allow admin update dictionary_cache" ON public.dictionary_cache;
DROP POLICY IF EXISTS "dictionary_cache_read_all" ON public.dictionary_cache;

-- 2. Bật Row Level Security (RLS)
ALTER TABLE public.dictionary_cache ENABLE ROW LEVEL SECURITY;

-- 3. Policy SELECT: Mọi người dùng (kể cả khách vãng lai và học viên) đều có quyền đọc từ điển
CREATE POLICY "dictionary_cache_read_all" 
  ON public.dictionary_cache 
  FOR SELECT 
  USING (true);

-- 4. Thu hồi các quyền INSERT, UPDATE, DELETE trực tiếp từ anon và authenticated
REVOKE INSERT, UPDATE, DELETE ON TABLE public.dictionary_cache FROM anon, authenticated;
GRANT SELECT ON TABLE public.dictionary_cache TO anon, authenticated;

-- Service role vẫn giữ toàn quyền thông qua chính sách mặc định của Supabase
