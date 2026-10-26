-- ==============================================================================
-- Migration: 20261026000006_adaptive_rolling_mastery.sql
-- Mục đích: Nâng cấp mô hình đánh giá sang Adaptive Rolling Mastery (ARM)
-- Quyết định Kiến trúc: D-25 (thay thế D-04 và cập nhật Invariant 3)
-- docs/03-decisions/D-log.md & docs/04-business-rules.md §4.7
-- ==============================================================================

-- 1. Cập nhật hàm wilson_lower sang z = 1.0 và hỗ trợ cửa sổ trượt max_window = 20
CREATE OR REPLACE FUNCTION public.wilson_lower(
  p_correct INT,
  p_total INT,
  p_z NUMERIC DEFAULT 1.0,
  p_max_window INT DEFAULT 20
)
RETURNS NUMERIC AS $$
DECLARE
  v_total INT := p_total;
  v_correct INT := p_correct;
  z NUMERIC := p_z;
  z2 NUMERIC;
  p_hat NUMERIC;
  denominator NUMERIC;
  center NUMERIC;
  spread NUMERIC;
BEGIN
  IF p_total <= 0 OR p_correct < 0 THEN
    RETURN 0;
  END IF;

  -- Giới hạn cửa sổ trượt tối đa (mặc định 20 câu theo D-25)
  IF p_max_window > 0 AND p_total > p_max_window THEN
    v_total := p_max_window;
    v_correct := ROUND((p_correct::NUMERIC / p_total::NUMERIC) * p_max_window::NUMERIC)::INT;
  END IF;

  IF v_correct > v_total THEN
    v_correct := v_total;
  END IF;

  z2 := z * z;
  p_hat := v_correct::NUMERIC / v_total::NUMERIC;
  denominator := 1.0 + (z2 / v_total::NUMERIC);
  center := p_hat + (z2 / (2.0 * v_total::NUMERIC));
  spread := z * SQRT((p_hat * (1.0 - p_hat) + (z2 / (4.0 * v_total::NUMERIC))) / v_total::NUMERIC);

  RETURN ROUND(((center - spread) / denominator), 4);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Cập nhật View v_skill_mastery với cơ chế Fast-Track và Cửa sổ trượt D-25
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
    COUNT(a.id)::INT,
    1.0,
    20
  ) AS mastery_score,
  CASE
    -- Tầng 1: Khởi động (dưới 5 câu)
    WHEN COUNT(a.id) < 5 THEN 'insufficient'
    -- Tầng 2: Fast-Track cho học viên xuất sắc (>= 8 câu và tỉ lệ đúng >= 90%)
    WHEN COUNT(a.id) >= 8 AND (COUNT(CASE WHEN a.is_correct THEN 1 END)::NUMERIC / COUNT(a.id)::NUMERIC) >= 0.90 THEN 'mastered'
    -- Tầng 3: Cửa sổ trượt chuẩn hóa z = 1.0
    WHEN public.wilson_lower(
      COUNT(CASE WHEN a.is_correct THEN 1 END)::INT,
      COUNT(a.id)::INT,
      1.0,
      20
    ) >= 0.75 THEN 'mastered'
    WHEN public.wilson_lower(
      COUNT(CASE WHEN a.is_correct THEN 1 END)::INT,
      COUNT(a.id)::INT,
      1.0,
      20
    ) >= 0.50 THEN 'proficient'
    ELSE 'needs_review'
  END AS mastery_label
FROM public.attempts a
JOIN public.grammar_tags gt ON gt.id = a.tag_id
GROUP BY a.user_id, a.tag_id, gt.tag_code, gt.name_vi;
