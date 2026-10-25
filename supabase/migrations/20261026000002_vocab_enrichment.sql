-- ==============================================================================
-- Migration: Bổ sung các trường ngữ nghĩa quan trọng cho Sổ từ vựng (Vocab Enrichment)
-- Tuân thủ: docs/04-business-rules.md §4.6 & docs/05-design/screens.md M6
-- ==============================================================================

ALTER TABLE public.vocab_entries
  ADD COLUMN IF NOT EXISTS part_of_speech TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS phonetic TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS context_translation TEXT DEFAULT '';

COMMENT ON COLUMN public.vocab_entries.part_of_speech IS 'Từ loại: noun, verb, adjective, adverb, phrase, etc.';
COMMENT ON COLUMN public.vocab_entries.phonetic IS 'Phiên âm quốc tế IPA nếu có';
COMMENT ON COLUMN public.vocab_entries.context_translation IS 'Bản dịch tiếng Việt của câu ngữ cảnh';
