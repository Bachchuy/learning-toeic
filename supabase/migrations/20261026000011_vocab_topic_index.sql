-- Migration 20261026000011_vocab_topic_index.sql
-- Tối ưu hóa truy vấn lọc và nhóm theo chủ đề (Thematic Topics) trong kho từ vựng
-- Giúp chia nhỏ 1000+ từ vựng thành các chủ điểm nhỏ 10-15 từ (Contracts, Marketing, HR...)

CREATE INDEX IF NOT EXISTS idx_vocab_entries_user_topic 
ON public.vocab_entries (user_id, ((metadata->>'topic')));

COMMENT ON INDEX idx_vocab_entries_user_topic IS 'B-Tree Index phục vụ chia nhỏ phiên ôn tập theo chủ điểm TOEIC';
