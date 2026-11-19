# HANDOFF REPORT: Supabase Infrastructure Recreation & Vercel Redeployment

## 1. Summary of Actions & Changes
- Deleted 2 obsolete/paused Supabase projects: `learning-chinese1` (`jweewhsjeeoynzxpxsfe`) and `learning-toeic` (`uagbwbqibvefhppmqeih`).
- Created 2 new active, healthy Supabase projects in region `ap-southeast-1` (Singapore):
  - **`learning-toeic`**: ID / Ref `etcpholhbhtpttbuackx`
  - **`learning-chinese`**: ID / Ref `xaitziaudtckgptocber`
- Executed all 24 schema migrations into `learning-toeic` via PostgreSQL query API:
  - Tables: `vocab_entries`, `review_cards`, `exam_sets`, `passages`, `questions`, `attempts`, `profiles`, `card_reviews`, etc.
  - RPCs: `submit_passage_answers`, `record_card_review`, etc.
  - RLS Policies & Triggers.
- Seeded 610 curated vocabulary cards and exam questions into `learning-toeic`.
- Executed schema migration `0000_dry_naoko.sql` and seeded 151 HSK 1 vocabulary cards and system decks into `learning-chinese`.
- Updated `.env.local` files in both projects with the new project URLs, anon keys, service role keys, and updated pooler connection strings (`aws-1-ap-southeast-1.pooler.supabase.com`).
- Connected to Vercel via Vercel MCP plugin:
  - Synchronized updated environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`) on both Vercel projects (`learning-toeic` and `learning-chinese`).
  - Triggered production redeployments on Vercel. Both reached `READY` state.

## 2. Tests Run & Actual Results
- `learning-toeic`:
  - `npm run typecheck`: **PASSED** (0 TypeScript errors).
  - `npm run test`: **PASSED** (27 test files passed, 237/237 tests passed, 100% green).
- `learning-chinese`:
  - `npm run db:seed`: **PASSED** (151 words and 151 cards seeded).
  - Next.js build compilation & static route generation: **PASSED** (15/15 static & partial prerender pages compiled).
- Live Production Verification:
  - `https://learning-toeic.vercel.app`: HTTP 307 (auth redirect to `/login`), fully operational.
  - `https://learning-chinese-bice.vercel.app`: HTTP 200, fully operational.

## 3. Status
- Task Status: **READY_FOR_CODEX_REVIEW**
