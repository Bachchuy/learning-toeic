-- ==============================================================================
-- Migration: Fix handle_new_user() trigger schema mismatch
-- 20261110000002_fix_handle_new_user_trigger.sql
--
-- Nguyên nhân lỗi: Migration 20261030000001 chèn vào cột không tồn tại (full_name, email)
-- thay vì cột thực tế của public.profiles là (display_name), khiến thao tác
-- tạo user mới bị lỗi "Database error creating new user".
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, target_score, role)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
      'Học viên'
    ),
    650,
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
