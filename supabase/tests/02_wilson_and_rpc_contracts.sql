BEGIN;

SELECT plan(11);

-- ==============================================================================
-- 1. Đối chiếu public.wilson_lower(correct, total, 1.96) với Phụ lục A (docs/A-test-data.md)
-- ==============================================================================
SELECT is(ROUND((public.wilson_lower(2, 2, 1.96) * 100)::numeric, 1), 34.2::numeric, 'Wilson(2,2,1.96) matches 34.2');
SELECT is(ROUND((public.wilson_lower(8, 10, 1.96) * 100)::numeric, 1), 49.0::numeric, 'Wilson(8,10,1.96) matches 49.0');
SELECT is(ROUND((public.wilson_lower(6, 10, 1.96) * 100)::numeric, 1), 31.3::numeric, 'Wilson(6,10,1.96) matches 31.3');
SELECT is(ROUND((public.wilson_lower(5, 8, 1.96) * 100)::numeric, 1), 30.6::numeric, 'Wilson(5,8,1.96) matches 30.6');
SELECT is(ROUND((public.wilson_lower(9, 12, 1.96) * 100)::numeric, 1), 46.8::numeric, 'Wilson(9,12,1.96) matches 46.8');
SELECT is(ROUND((public.wilson_lower(8, 9, 1.96) * 100)::numeric, 1), 56.5::numeric, 'Wilson(8,9,1.96) matches 56.5');
SELECT is(ROUND((public.wilson_lower(12, 14, 1.96) * 100)::numeric, 1), 60.1::numeric, 'Wilson(12,14,1.96) matches 60.1');
SELECT is(ROUND((public.wilson_lower(18, 20, 1.96) * 100)::numeric, 1), 69.9::numeric, 'Wilson(18,20,1.96) matches 69.9');
SELECT is(ROUND((public.wilson_lower(0, 0, 1.96) * 100)::numeric, 1), 0.0::numeric, 'Wilson(0,0,1.96) safely returns 0.0');

-- ==============================================================================
-- 2. Hợp đồng pg_proc sau Batch 1 & Wave A migration
-- ==============================================================================
SELECT is(
  (SELECT COUNT(*)::int FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = 'submit_passage_answers'),
  1,
  'Exactly 1 submit_passage_answers overload exists (3-arg only)'
);

SELECT ok(
  COALESCE(
    (SELECT 'search_path=public' = ANY(p.proconfig) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = 'wilson_lower' LIMIT 1),
    false
  ),
  'wilson_lower sets immutable search_path=public'
);

SELECT * FROM finish();

ROLLBACK;
