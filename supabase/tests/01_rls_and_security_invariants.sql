BEGIN;

SELECT plan(36);

-- ==============================================================================
-- 1. Mọi bảng public đều bật Row Level Security (20 bảng + tổng kiểm = 21 assertions)
-- ==============================================================================
SELECT is((SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'attempts'), true, 'attempts has RLS enabled');
SELECT is((SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'card_reviews'), true, 'card_reviews has RLS enabled');
SELECT is((SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'dictionary_cache'), true, 'dictionary_cache has RLS enabled');
SELECT is((SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'events'), true, 'events has RLS enabled');
SELECT is((SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'exam_attempts'), true, 'exam_attempts has RLS enabled');
SELECT is((SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'exam_set_answers'), true, 'exam_set_answers has RLS enabled');
SELECT is((SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'exam_sets'), true, 'exam_sets has RLS enabled');
SELECT is((SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'grammar_tags'), true, 'grammar_tags has RLS enabled');
SELECT is((SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'notebooks'), true, 'notebooks has RLS enabled');
SELECT is((SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'passages'), true, 'passages has RLS enabled');
SELECT is((SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'practice_sessions'), true, 'practice_sessions has RLS enabled');
SELECT is((SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'profiles'), true, 'profiles has RLS enabled');
SELECT is((SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'question_answers'), true, 'question_answers has RLS enabled');
SELECT is((SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'question_reports'), true, 'question_reports has RLS enabled');
SELECT is((SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'questions'), true, 'questions has RLS enabled');
SELECT is((SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'review_cards'), true, 'review_cards has RLS enabled');
SELECT is((SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'review_log'), true, 'review_log has RLS enabled');
SELECT is((SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'session_questions'), true, 'session_questions has RLS enabled');
SELECT is((SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'user_feedback'), true, 'user_feedback has RLS enabled');
SELECT is((SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'vocab_entries'), true, 'vocab_entries has RLS enabled');

SELECT is(
  (SELECT COUNT(*)::int FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity),
  0,
  'Zero public base tables exist without RLS'
);

-- ==============================================================================
-- 2. Thu hồi quyền EXECUTE của anon trên các hàm SECURITY DEFINER nhạy cảm (6 assertions)
-- ==============================================================================
SELECT ok(NOT has_function_privilege('anon', 'public.create_session(integer, integer)', 'EXECUTE'), 'anon cannot EXECUTE create_session');
SELECT ok(NOT has_function_privilege('anon', 'public.submit_answer(uuid, uuid, integer)', 'EXECUTE'), 'anon cannot EXECUTE submit_answer');
SELECT ok(NOT has_function_privilege('anon', 'public.finish_session(uuid)', 'EXECUTE'), 'anon cannot EXECUTE finish_session');
SELECT ok(NOT has_function_privilege('anon', 'public.get_session_review(uuid)', 'EXECUTE'), 'anon cannot EXECUTE get_session_review');
SELECT ok(NOT has_function_privilege('anon', 'public.submit_passage_answers(uuid, jsonb, uuid)', 'EXECUTE'), 'anon cannot EXECUTE submit_passage_answers');
SELECT ok(NOT has_function_privilege('anon', 'public.is_admin()', 'EXECUTE'), 'anon cannot EXECUTE is_admin');

-- ==============================================================================
-- 3. Nạp dữ liệu tổng hợp trong transaction tạm (ROLLBACK cuối test)
-- ==============================================================================
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, created_at, updated_at, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated', 'pgtap-user-a@example.com', 'hash', now(), now(), '{"full_name":"User A"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated', 'pgtap-user-b@example.com', 'hash', now(), now(), '{"full_name":"User B"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.grammar_tags (tag_code, name_vi, order_index)
VALUES ('pgtap_tag', 'pgTAP Tag', 99)
ON CONFLICT (tag_code) DO NOTHING;

INSERT INTO public.questions (id, stem, option_a, option_b, option_c, option_d, tag_id, difficulty, status, content_hash)
VALUES (
  'dddd1111-1111-4111-8111-111111111111',
  'The contract _____ yesterday.',
  'sign',
  'signed',
  'was signed',
  'signing',
  (SELECT id FROM public.grammar_tags ORDER BY id LIMIT 1),
  1,
  'published',
  'pgtap-hash-0001'
);

INSERT INTO public.question_answers (question_id, correct_index, explanation)
VALUES (
  'dddd1111-1111-4111-8111-111111111111',
  2,
  '{"core":"Passive past"}'::jsonb
);

INSERT INTO public.vocab_entries (id, user_id, word, lemma, meaning, context_sentence)
VALUES (
  'aaaa1111-1111-4111-8111-111111111111',
  '11111111-1111-4111-8111-111111111111',
  'negotiate',
  'negotiate',
  'đàm phán',
  'We negotiate contracts carefully.'
);

INSERT INTO public.exam_sets (id, slug, title, status)
VALUES (
  'bbbb1111-1111-4111-8111-111111111111',
  'pgtap-dummy-exam',
  'pgTAP Dummy Exam',
  'published'
);

INSERT INTO public.exam_set_answers (exam_set_id, question_id, part, correct_answer, correct_index, explanation, explanation_vi)
VALUES (
  'bbbb1111-1111-4111-8111-111111111111',
  'pgtap_q_101',
  5,
  'B',
  1,
  'Subject-verb agreement',
  'Hòa hợp chủ vị'
);

INSERT INTO public.exam_attempts (id, user_id, exam_set_id, status, score_reading, total_score)
VALUES (
  'cccc1111-1111-4111-8111-111111111111',
  '11111111-1111-4111-8111-111111111111',
  'bbbb1111-1111-4111-8111-111111111111',
  'completed',
  350,
  350
);

-- ==============================================================================
-- 4. Kiểm thử hành vi RLS với anon (2 assertions)
-- ==============================================================================
SET LOCAL ROLE anon;

SELECT is(
  (SELECT COUNT(*)::int FROM public.question_answers),
  0,
  'anon reads 0 rows from question_answers under RLS'
);

SELECT is(
  (SELECT COUNT(*)::int FROM public.exam_set_answers),
  0,
  'anon reads 0 rows from exam_set_answers under RLS'
);

RESET ROLE;

-- ==============================================================================
-- 5. Kiểm thử hành vi RLS với authenticated User B (student) (7 assertions)
-- ==============================================================================
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
SELECT set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}', true);

SELECT is(
  (SELECT COUNT(*)::int FROM public.question_answers),
  0,
  'student reads 0 rows from question_answers under RLS'
);

SELECT is(
  (SELECT COUNT(*)::int FROM public.exam_set_answers),
  0,
  'student reads 0 rows from exam_set_answers under RLS'
);

SELECT is(
  (SELECT COUNT(*)::int FROM public.vocab_entries WHERE id = 'aaaa1111-1111-4111-8111-111111111111'),
  0,
  'User B cannot read User A vocab_entries'
);

SELECT is(
  (SELECT COUNT(*)::int FROM public.exam_attempts WHERE id = 'cccc1111-1111-4111-8111-111111111111'),
  0,
  'User B cannot read User A exam_attempts'
);

SELECT is(
  (SELECT COUNT(*)::int FROM public.profiles WHERE id = '11111111-1111-4111-8111-111111111111'),
  0,
  'User B cannot read User A profile'
);

SELECT throws_ok(
  $$UPDATE public.profiles SET role = 'admin' WHERE id = '22222222-2222-4222-8222-222222222222'$$,
  'P0001',
  'LỖI BẢO MẬT: Người dùng không được phép tự sửa đổi quyền hạn (role)!',
  'Authenticated user cannot self-escalate profile role'
);

SELECT throws_ok(
  $$INSERT INTO public.practice_sessions (user_id, total_questions) VALUES ('22222222-2222-4222-8222-222222222222', 10)$$,
  '42501',
  NULL,
  'Authenticated user cannot directly INSERT into practice_sessions (FOR SELECT RLS MD-02)'
);

SELECT * FROM finish();

ROLLBACK;
