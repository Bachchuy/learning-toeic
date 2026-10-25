-- ==============================================================================
-- Migration: Trigger tự động tạo thẻ review_cards khi người dùng lưu từ vựng
-- Tuân thủ: docs/04-business-rules.md §4.6
-- "Lưu từ tự tạo thẻ ôn (đến hạn ngay). Xóa từ xóa luôn thẻ (CASCADE)."
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_vocab_entry()
RETURNS TRIGGER AS $$
BEGIN
  -- Tự động tạo một thẻ ôn FSRS với trạng thái ban đầu:
  -- state = 0 (New), stability = 0, difficulty = 0, due = now() (Đến hạn ôn ngay lập tức)
  INSERT INTO public.review_cards (
    user_id,
    vocab_entry_id,
    state,
    stability,
    difficulty,
    due,
    reps,
    lapses
  )
  VALUES (
    NEW.user_id,
    NEW.id,
    0,
    0,
    0,
    timezone('utc'::text, now()),
    0,
    0
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_vocab_entry_created ON public.vocab_entries;
CREATE TRIGGER on_vocab_entry_created
  AFTER INSERT ON public.vocab_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_vocab_entry();
