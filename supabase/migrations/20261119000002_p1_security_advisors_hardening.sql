-- ==============================================================================
-- Migration: 20261119000002_p1_security_advisors_hardening.sql
-- Batch 8 (Security Advisors Hardening):
--   1. Scope legacy {public} admin policies to TO authenticated.
--   2. Set immutable search_path on public.wilson_lower.
--   3. Revoke PUBLIC/anon execute on RPCs and trigger-only SECURITY DEFINER fns.
-- ==============================================================================

-- 1. Scope 6 legacy admin policies TO authenticated
ALTER POLICY "grammar_tags_admin_write" ON public.grammar_tags TO authenticated;
ALTER POLICY "profiles_admin_all" ON public.profiles TO authenticated;
ALTER POLICY "question_answers_admin_all" ON public.question_answers TO authenticated;
ALTER POLICY "reports_admin_all" ON public.question_reports TO authenticated;
ALTER POLICY "questions_admin_all" ON public.questions TO authenticated;
ALTER POLICY "review_log_admin_all" ON public.review_log TO authenticated;

-- 2. Immutable search_path on wilson_lower
ALTER FUNCTION public.wilson_lower(integer, integer, numeric) SET search_path = public;

-- 3. Restrict SECURITY DEFINER function execution
REVOKE ALL ON FUNCTION public.submit_answer(uuid, uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_answer(uuid, uuid, integer) TO authenticated;

REVOKE ALL ON FUNCTION public.finish_session(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.finish_session(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE ALL ON FUNCTION public.check_question_reports() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_vocab_entry() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_role_modification() FROM PUBLIC, anon, authenticated;
