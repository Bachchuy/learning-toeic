-- ==============================================================================
-- Migration: 20261103000003_p1_align_adaptive_rolling_mastery.sql
-- Mục đích: Đồng nhất tuyệt đối thuật toán Adaptive Rolling Mastery (ARM) giữa SQL và TypeScript
-- Quyết định Kiến trúc: D-25 (thay thế D-04 và cập nhật Invariant 3)
--
-- CÁC ĐIỂM CHUẨN HÓA:
-- 1. Hàm wilson_lower: Tính toán chuẩn xác cận dưới khoảng tin cậy Wilson z = 1.0 (68% CI).
-- 2. View v_skill_mastery: Áp dụng CHUẨN CỬA SỔ TRƯỢT 20 CÂU GẦN NHẤT theo thời gian (ROW_NUMBER)
--    thay vì ép tỉ lệ toàn bộ lịch sử về mẫu 20.
-- 3. Ngưỡng phân loại chuẩn hóa:
--    - Dưới 5 câu (< 5): 'insufficient' ("Đang khởi động")
--    - Fast-Track: n >= 8 và tỉ lệ đúng >= 90% -> 'mastered' ("Thành thạo")
--    - Điểm >= 75.0 -> 'mastered'
--    - Điểm >= 50.0 -> 'proficient' ("Khá chắc")
--    - Dưới 50.0 -> 'needs_review' ("Cần củng cố")
-- ==============================================================================

-- 0. Dọn dẹp các overload cũ tránh lỗi 42725 (function is not unique)
DROP VIEW IF EXISTS public.v_skill_mastery CASCADE;
DROP FUNCTION IF EXISTS public.wilson_lower(INT, INT, NUMERIC, INT) CASCADE;
DROP FUNCTION IF EXISTS public.wilson_lower(INT, INT, NUMERIC) CASCADE;
DROP FUNCTION IF EXISTS public.wilson_lower(INT, INT) CASCADE;

-- 1. Hàm tính Cận dưới Wilson thuần túy (Wilson Lower Bound)
CREATE OR REPLACE FUNCTION public.wilson_lower(
  p_correct INT,
  p_total INT,
  p_z NUMERIC DEFAULT 1.0
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
  v_lower NUMERIC;
BEGIN
  IF p_total <= 0 OR p_correct < 0 THEN
    RETURN 0.0;
  END IF;

  IF v_correct > v_total THEN
    v_correct := v_total;
  END IF;

  z2 := z * z;
  p_hat := v_correct::NUMERIC / v_total::NUMERIC;
  denominator := 1.0 + (z2 / v_total::NUMERIC);
  center := p_hat + (z2 / (2.0 * v_total::NUMERIC));
  spread := z * SQRT((p_hat * (1.0 - p_hat) + (z2 / (4.0 * v_total::NUMERIC))) / v_total::NUMERIC);

  v_lower := (center - spread) / denominator;
  IF v_lower < 0.0 THEN
    v_lower := 0.0;
  END IF;

  -- Trả về cận dưới chuẩn hóa (tỷ lệ 0.0 -> 1.0, làm tròn 4 chữ số thập phân)
  RETURN ROUND(v_lower, 4);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Cập nhật View v_skill_mastery: Cửa sổ trượt 20 câu gần nhất qua Window Function
CREATE OR REPLACE VIEW public.v_skill_mastery
WITH (security_invoker = true) AS
WITH ranked_attempts AS (
  -- Đánh số thứ tự các lần làm bài gần nhất của từng user theo từng chủ điểm
  SELECT
    a.user_id,
    a.tag_id,
    a.is_correct,
    ROW_NUMBER() OVER (
      PARTITION BY a.user_id, a.tag_id 
      ORDER BY a.answered_at DESC, a.id DESC
    ) AS rn
  FROM public.attempts a
  WHERE a.tag_id IS NOT NULL
),
window_stats AS (
  -- Thu thập thống kê chính xác trong cửa sổ trượt tối đa 20 câu gần nhất
  SELECT
    user_id,
    tag_id,
    COUNT(*)::INT AS window_total,
    COUNT(CASE WHEN is_correct THEN 1 END)::INT AS window_correct
  FROM ranked_attempts
  WHERE rn <= 20
  GROUP BY user_id, tag_id
),
lifetime_stats AS (
  -- Thu thập tổng số câu đã làm trong toàn bộ lịch sử
  SELECT
    a.user_id,
    a.tag_id,
    COUNT(*)::INT AS total_attempts,
    COUNT(CASE WHEN a.is_correct THEN 1 END)::INT AS correct_attempts
  FROM public.attempts a
  WHERE a.tag_id IS NOT NULL
  GROUP BY a.user_id, a.tag_id
)
SELECT
  l.user_id,
  l.tag_id,
  gt.tag_code,
  gt.name_vi,
  l.total_attempts,
  l.correct_attempts,
  w.window_total,
  w.window_correct,
  -- Điểm phần trăm độ vững tính trên cửa sổ trượt (thang điểm 0 - 100, làm tròn 1 số thập phân)
  ROUND(public.wilson_lower(w.window_correct, w.window_total, 1.0) * 100.0, 1) AS mastery_score,
  CASE
    -- Tầng 1: Đang khởi động (dưới 5 câu trong cửa sổ trượt)
    WHEN w.window_total < 5 THEN 'insufficient'
    -- Tầng 2: Fast-Track cho học viên xuất sắc (từ 8 câu và tỉ lệ đúng >= 90%)
    WHEN w.window_total >= 8 AND (w.window_correct::NUMERIC / w.window_total::NUMERIC) >= 0.90 THEN 'mastered'
    -- Tầng 3: Phân loại theo ngưỡng điểm Wilson cận dưới z = 1.0
    WHEN ROUND(public.wilson_lower(w.window_correct, w.window_total, 1.0) * 100.0, 1) >= 75.0 THEN 'mastered'
    WHEN ROUND(public.wilson_lower(w.window_correct, w.window_total, 1.0) * 100.0, 1) >= 50.0 THEN 'proficient'
    ELSE 'needs_review'
  END AS mastery_label
FROM lifetime_stats l
INNER JOIN window_stats w ON w.user_id = l.user_id AND w.tag_id = l.tag_id
INNER JOIN public.grammar_tags gt ON gt.id = l.tag_id;
