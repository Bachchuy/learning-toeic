# RECOVERY_PLAN.md — Approved Post-Audit Recovery Plan & Evidence Index

> **Layer:** Layer 2 (Active Execution Plan).  
> **Approval Status:** Recovery plan **APPROVED** (2026-11-19) incorporating all 7 adversarial review corrections (`MD-01..MD-07`). **Current Execution Status:** **Batches 0–8 (Đợt A, Đợt B, Đợt C)** + **F1** migrations (`20261119000001`, `20261119000002`) + **F5** Dashboard UI/UX Refresh all `READY_FOR_REVIEW`; báo cáo tổng kết từ đầu tại [PROGRESS_REPORT_2026-11-19.md](PROGRESS_REPORT_2026-11-19.md).  
> **Base Commit:** `main` @ `adc8b7e`.  
> **Usage Rule:** Read [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) first, then read **only the active batch** below before loading related specs and source files.

---

## 1. Batch Completion Tracker

| Batch | Priority | Title | Dependencies | Risk | Blocking Decisions | Status |
| :--- | :---: | :--- | :--- | :---: | :--- | :---: |
| **Batch 0** | P0 | Test Safety Gate (Isolate Live Prod DB) | None | Low | None (Safe to start) | `READY_FOR_REVIEW` |
| **Batch 1** | P0 | Atomic DB Security & Core RPC Migration + Reading Error Handling | Batch 0 | Med–High | **F1** (`APPROVED & APPLIED` on `etcpholhbhtpttbuackx`) | `READY_FOR_REVIEW` |
| **Batch 2** | P0 | Server Action Auth Bypass (`POST /login`) & Exam Anti-Oracle Hardening | Batch 0 | Medium | **F2** (Exam anti-oracle policy) | `READY_FOR_REVIEW` |
| **Batch 3** | P1 | Practice Retry, D-25 Stats Mastery & Profile JSON Export | Batch 0, Batch 1 | Medium | None | `READY_FOR_REVIEW` |
| **Batch 4** | P1 | Audio TTS Regex & Dictionary SSRF / Cache Hardening | Batch 0 | Low–Med | **F4** (`/api/audio/tts` auth policy) | `READY_FOR_REVIEW` |
| **Batch 5** | P1 | Vocab Pre-Filtered Import, Review FSRS & Admin State Integrity | Batch 0 | Medium | **F3** (Curated deck re-import policy) | `READY_FOR_REVIEW` |
| **Batch 6** | P1/P2 | Mobile 360px Layout, Admin Bar Overlap & A11y Markup (`<a><button>`) | Batch 0 | Low | **F5** (`APPROVED`: brand `"Tôi Yêu Em Íc"`, preserve colors, Figma audit) | `READY_FOR_REVIEW` |
| **Batch 7** | P2 | `/learn` Bundle Slimming, Dead Code Cleanup, `next` Patch & CI Build Gate | Batch 0–6 | Low–Med | **F7** (Dep upgrade / Prettier policy) | `READY_FOR_REVIEW` |
| **Batch 8** | P3 | Deferred Roadmap Parity & Quality Upgrades — **Wave A** (Legal, Rate Limit, Forgot Password, Exam History), **Đợt B** (Google OAuth, God Component split, `@axe-core/playwright`, `pgTAP`), **Đợt C** (Listening Part 1–4 Simulator) | Batch 0–7 | Medium | **F1** (`APPLIED`), **F6** (`WAVE A + ĐỢT B + ĐỢT C READY_FOR_REVIEW`) | `READY_FOR_REVIEW` |

---

## 2. Decisions & Approvals Log (`F1`–`F7`)

- **F1 (`APPROVED & APPLIED` on `etcpholhbhtpttbuackx`):** Applied `20261119000001_p0_rpc_and_rls_hardening.sql` (`p0_rpc_and_rls_hardening`) and `20261119000002_p1_security_advisors_hardening.sql` (`p1_security_advisors_hardening`) via Supabase MCP. Live `get_advisors("security")` verified **0** `function_search_path_mutable` (`wilson_lower` pinned) and **0** `anon_security_definer_function_executable` findings (only 6 intentional `authenticated` RPC/RLS helpers + 1 external Auth Dashboard leaked-password toggle remain).
- **F2 (`APPLIED DEFAULT — Option A`):** Incomplete `/exam/[slug]` submissions mask answer keys/evidence/explanations for unanswered questions (`isAnswerHidden: true`).
- **F3 (`APPLIED DEFAULT — Non-destructive`):** Curated deck import pre-filters existing user `lemma`s, preserves custom edits/notebooks, and counts net-new additions only.
- **F4 (`APPLIED DEFAULT — Authenticated`):** `/api/audio/tts` and `lookupWordAction` enforce authenticated sessions.
- **F5 (`APPROVED`):** Official brand name unified to **"Tôi Yêu Em Íc"** across layout, `BrandLogo`, `/login`, and metadata titles (duplicate `| TOEIC` / `| TOEIC AI` suffixes removed). Existing color palette preserved 100%; UI/UX refinement review board created in Figma (`https://www.figma.com/design/fJfE9orMurMSbNJFV34Z9K`).
- **F6 (`READY_FOR_REVIEW` — Wave A, Đợt B & Đợt C complete):**
  - **Wave A:** `/terms`, `/privacy`, `/auth/callback`, `/reset-password` & `/login` forgot-password mode, `src/lib/rateLimit.ts`, `/exam#history` UI, Dashboard Page 2 flat Streak & history link refresh.
  - **Đợt B:** Google OAuth (`signInWithGoogleAction`, UI `/login`, `/auth/callback` backslash guard), God Component split (`vocab-list-view.tsx` `2,829 -> 1,972L`, `lesson-detail-view.tsx` `1,701 -> 697L`), `@axe-core/playwright` WCAG 2.1 AA suite (`e2e/responsive-a11y.spec.ts`), và bộ test `pgTAP` (`supabase/tests/*.sql` + `tests/pgtap-suite-contract.test.ts`).
  - **Đợt C:** TOEIC Listening Part 1–4 Simulator (`src/core/examListening.ts`, `getListeningExamAction`/`submitListeningExamAction`, `/exam/[slug]/listening`, audio player + transcript toggle + result review + `/exam` integration).
- **F7 (`APPLIED DEFAULT`):** `next` & `eslint-config-next` patched to `16.4.6`; 176 Prettier formatting diffs and stale branch `feat/learning-hub` left untouched.

---

## 3. Verified Facts vs Unknowns (Pre-Execution Baseline)

- **Verified (Static / Offline):**
  - `npx tsc --noEmit --incremental false`: PASS (0 errors; `scripts/` excluded).
  - `npm run lint`: PASS (0 errors/warnings; `scripts/` excluded).
  - `npx vitest run --exclude tests/remediation-integration.test.ts`: PASS (26/26 files, 213/213 tests; `__dirname` Vite warning in `vitest.config.mts:12`).
  - `npx prettier --list-different .`: FAIL (176 files).
  - `npm audit`: FAIL (8 moderate: 1 runtime in `next@16.4.3`, 7 dev in `@typescript-eslint/*`; 0 occurrences of `unstable_cache`/`'use cache'` in `src/`).
- **Unknown (Not Executed for Safety):**
  - Live Supabase DB behavior on `submit_passage_answers` overload (PostgREST `PGRST203` vs silent 2-arg fallback).
  - Live `tests/remediation-integration.test.ts` and Playwright E2E results against isolated staging.
  - Current `npm run build` result on `adc8b7e` (`.next/BUILD_ID` predates `adc8b7e`).

---

## 4. Approved Recovery Batches (Surgical Execution Specs)

### Batch 0 [P0 — Safety Gate]: Isolate Integration & E2E Tests from Production DB
- **Objective:** Prevent any test run (`npm test`, `npx vitest`, `npm run test:e2e`) from mutating live production Supabase (`etcpholhbhtpttbuackx`), and remove tautological invariant tests.
- **Root Causes:** `RC-03`.
- **In-Scope:**
  - Add hard in-file safety guards in `tests/remediation-integration.test.ts` (require explicit `RUN_LIVE_DB_TESTS=1` + refuse execution if target URL contains prod ref `etcpholhbhtpttbuackx`, even when run directly via `npx vitest`).
  - Refactor FSRS test in `tests/remediation-integration.test.ts` to use synthetic test user/card with `afterAll` cleanup instead of mutating `review_cards.limit(1)`.
  - Replace tautological `const recordToDb = false` test in `tests/invariants-integration.test.ts:34-47` with real module/import boundary verification for Drill.
  - Split `package.json` scripts (`test` = deterministic offline suite; `test:db` = explicit live staging suite) and add prod-ref guard to `playwright.config.ts`.
- **Out-of-Scope:** No DB migrations, no runtime code changes, no `pgTAP` setup.
- **Affected Modules:** `tests/remediation-integration.test.ts`, `tests/invariants-integration.test.ts`, `package.json`, `playwright.config.ts`.
- **Dependencies:** None.
- **Acceptance Criteria:**
  1. `npm run test` and `npx vitest run` make 0 network requests to prod Supabase and pass 100%.
  2. Live DB suite refuses to run against `etcpholhbhtpttbuackx` and never mutates real users' `review_cards`.
  3. Invariant #2 test validates real Drill code rather than a local constant.
- **Verification:** `npm run typecheck && npm run lint && npm run test` + inspect diff for zero secrets.
- **Rollback:** Single `git revert`; zero schema/data impact.

---

### Batch 1 [P0 — Atomic DB Security & Core RPC Migration]: Fix `get_session_review`, `submit_passage_answers`, Session RLS, `create_session`, `check_question_reports`
- **Objective:** Restore `/practice/[id]/result` + Drill, close all Part 5/6/7 DB answer-leak vectors, eliminate Part 6/7 leakage into Part 5, and fix Part 6/7 submission error handling in one atomic SQL migration.
- **Root Causes & Corrections:** `RC-01`, `RC-02`, `RC-05` (SQL part), `RC-10` (trigger part), `MD-02`, `MD-07`, `MD-08`.
- **In-Scope:**
  - **One new SQL migration** (`supabase/migrations/<ts>_p0_rpc_and_rls_hardening.sql`):
    1. Restore `get_session_review(UUID)` object contract (`session_id`, `total_questions`, `correct_count`, `created_at`, `completed_at`, `attempts` with `tag_name_vi` via **`LEFT JOIN grammar_tags`**), and only expose `correct_index`/`explanation` when `v_session.completed_at IS NOT NULL AND a.id IS NOT NULL`.
    2. `DROP FUNCTION IF EXISTS public.submit_passage_answers(UUID, JSONB);` leaving only the hardened 3-arg `(UUID, JSONB, UUID DEFAULT NULL)` overload.
    3. Replace `FOR ALL` policies (`sessions_own`, `session_questions_own`) on `practice_sessions` and `session_questions` with **`FOR SELECT`** policies (`MD-02`).
    4. Add `AND q.part = 5 AND q.passage_id IS NULL` in `create_session()` (`MD-07`).
    5. Add `AND status = 'pending'` in `check_question_reports()` (`MD-07`).
  - **App glue:** Validate runtime object shape in `src/features/practice/actions.ts:110-124`; check `submitResult.success` in `part6-view.tsx` and `part7-view.tsx` before showing score/results.
  - **Tests:** Add static SQL contract assertions in `tests/security-compliance.test.ts` (`MD-08`) + unit tests for Part 6/7 error rendering.
- **Out-of-Scope:** Do not edit historical migration files; do not redesign Part 5/6/7 UI.
- **Affected Modules:** 1 new migration SQL, `src/features/practice/actions.ts`, `src/features/reading/components/{part6-view,part7-view}.tsx`, `tests/{security-compliance,reading-grading}.test.ts`.
- **Dependencies:** Batch 0 + **F1** human approval before applying migration.
- **Acceptance Criteria:**
  1. Completed Part 5 session renders valid score, non-`NaN` accuracy, attempt list, and working Drill button.
  2. Uncompleted session or unanswered question never returns `correct_index`/`explanation`; client cannot `INSERT`/`UPDATE` `practice_sessions` or `session_questions`.
  3. Postgres has exactly 1 `submit_passage_answers` signature; Part 6/7 UI surfaces RPC errors instead of `0/0`.
  4. `create_session` returns strictly Part 5 (`passage_id IS NULL`) questions; resolved reports no longer trip `check_question_reports`.
- **Verification:** Offline unit/SQL contract tests + live staging RPC verification as `authenticated` user.
- **Rollback:** Prepare reversible migration (restore prior RPCs/policies) tested on staging first; no table drops or data loss.

---

### Batch 2 [P0 — Server Action Auth Bypass & Exam Anti-Oracle]: Lock `POST /login` Bypass & Harden `/exam`
- **Objective:** Close unauthenticated Server Action execution via `POST /login` (`Next-Action`), enforce auth before `createAdminClient()`, stop the 1-answer → 100-answer exam oracle, remove ungradable JSON fallback, and add ETS disclaimer.
- **Root Causes & Corrections:** `RC-04`, `MD-01`, `MD-06`.
- **In-Scope:**
  - `src/proxy.ts`: Restrict `!hasAuthCookie && isLoginPage` fast-pass so unauthenticated `POST` requests with `Next-Action` do not bypass session/action boundary (`MD-01`, while keeping `/login` auth actions functional).
  - `src/features/exam/actions.ts`: Require authenticated user **before** `createAdminClient()` in `submitReadingExamAction`; remove ungradable `getMockTestBySlug` fallback in `getReadingExamAction` (`MD-06`).
  - `src/features/dictionary/actions.ts`: Add auth check **before** `createAdminClient()` in `lookupWordAction` (`MD-01`).
  - `src/core/examReading.ts`: Apply user-approved anti-oracle rule (**F2**) so unanswered questions cannot dump all 100 answers/explanations.
  - `src/features/exam/components/{reading-exam-simulator,exam-result-view}.tsx`: Add mandatory ETS non-affiliation & reference-score disclaimer (§4.11, D-27); replace `alert()` with inline error banner and surface auto-submit errors.
- **Out-of-Scope:** No `exam_attempts` history UI, no Listening Part 1–4, no F5 draft persistence.
- **Affected Modules:** `src/proxy.ts`, `src/features/exam/{actions.ts,components/reading-exam-simulator.tsx,components/exam-result-view.tsx}`, `src/core/examReading.ts`, `src/core/examReading.test.ts`, `src/features/dictionary/actions.ts`.
- **Dependencies:** Batch 0 + **F2** human approval.
- **Acceptance Criteria:**
  1. Unauthenticated `submitReadingExamAction` and `lookupWordAction` return auth error without invoking `createAdminClient()`.
  2. Submitting 1 dummy answer cannot leak answers/explanations for unanswered questions (per F2).
  3. `/exam/[slug]` never opens an ungradable local-only exam; no `alert()` calls remain; ETS disclaimer is visible on result screen.
- **Verification:** Unit tests in `examReading.test.ts` + manual auth/login/signup/exam regression verification (confirming `/login` sign-in/sign-up still work cleanly).
- **Rollback:** Pure app code; instant `git revert`.

---

### Batch 3 [P1 — Core Practice, D-25 Stats & Profile Export]: Fix Retry, Mastery Window & JSON Export
- **Objective:** Fix broken network retry in Part 5, fix mastery freeze > 2,000 attempts while strictly preserving D-25 Adaptive Rolling Mastery, fix `/stats` deep-links, and repair Profile JSON export.
- **Root Causes & Corrections:** `RC-05` (app part), `RC-06`, `RC-08`, `RC-09`, `MD-03`.
- **In-Scope:**
  - Practice: Allow retry from `status === "error"` in `practiceReducer.ts` & `practice-runner.tsx`; preserve `why_wrong_vi` in `parseExplanation` (`schemas.ts`); filter `part = 5` & paginate/aggregate `getPracticeTopicsAction`.
  - Stats/Dashboard: **Do NOT query obsolete `v_skill_mastery` (`MD-03`)**. Query `attempts` with `.not("tag_id", "is", null).order("answered_at", { ascending: false }).limit(2000)` and **`.reverse()` to chronological order (`ASC`)** before passing to `calculateAdaptiveMastery(tagAttempts, 20)`. Remove unsafe 500-row cap risk in `getUserStreakAction`. Fix `/stats` links from `?tagId=` → `?topic=` / `?tag_code=`; align Dashboard `"10 câu"` CTA with `/practice/new`.
  - Profile: Fix `pos` → `part_of_speech`, handle export query errors, include `card_reviews` (D-23), remove `"Wilson"` label on UI (`profile-view.tsx:407`, D-25).
- **Out-of-Scope:** No UI redesign of `/stats` or `/profile`; no change to D-25 math constants.
- **Affected Modules:** `src/core/practiceReducer.ts`, `src/features/practice/{actions.ts,schemas.ts,components/practice-runner.tsx}`, `src/features/stats/{actions.ts,components/stats-view.tsx}`, `src/features/dashboard/components/dashboard-view.tsx`, `src/app/practice/new/page.tsx`, `src/features/profile/{actions.ts,components/profile-view.tsx}`.
- **Dependencies:** Batch 0, Batch 1.
- **Acceptance Criteria:**
  1. Retry button works after `SUBMIT_ERROR`.
  2. Users with > 2,000 attempts see mastery computed from the latest 20 attempts per tag (chronological order verified by unit test).
  3. Clicking weak-topic CTA on `/stats` pre-selects the exact topic on `/practice/new`.
  4. Profile JSON export includes populated `vocabList` (`part_of_speech`) and `cardReviews`, with no `"Wilson"` label on UI.
- **Verification:** Unit tests (`practiceReducer`, `schemas`, mastery ordering test) + typecheck/lint/test + manual check.
- **Rollback:** Pure app code; instant `git revert`.

---

### Batch 4 [P1 — Audio TTS & Dictionary Hardening]: Fix Regex, Preserve CDN Audio & Block Cache Pollution
- **Objective:** Fix `/api/audio/tts` word truncation bug, close SSRF host-whitelist bypass without breaking 1,230 `audio.tflat.vn` assets or dual-POS audio, and stop `dictionary_cache` pollution.
- **Root Causes & Corrections:** `RC-07`, `MD-04`.
- **In-Scope:**
  - `src/app/api/audio/tts/route.ts`: Fix `/^[to\s]+/i` → `/^to\s+/i`; enforce input length cap (`<= 200`); cap `dictAudioUrlCache` Map size; restrict outbound `fetch` (`redirect: "error"` + external HTTPS allowlisted URLs only); apply auth per **F4**.
  - `src/core/dictionary.ts`: Add `"audio.tflat.vn"` to `ALLOWED_HOSTS` **before** changing `isAllowedHost || hasAudioExtension` → `isAllowedHost && hasAudioExtension` (`MD-04`); preserve internal `/api/audio/tts?...` URLs for dual-POS words in `dictionary/actions.ts`.
  - `src/features/dictionary/actions.ts`: Skip `dictionary_cache` upsert when lookup finds neither curated term nor dictionary definition/phonetic.
- **Out-of-Scope:** No Redis/distributed rate limiter (deferred to Batch 8).
- **Affected Modules:** `src/app/api/audio/tts/route.ts`, `src/core/dictionary.ts`, `src/core/dictionary.test.ts`, `src/features/dictionary/actions.ts`, `src/proxy.ts` (if F4 requires auth).
- **Dependencies:** Batch 0 + **F4** human approval.
- **Acceptance Criteria:**
  1. `"office"` → `"office"`, `"order"` → `"order"`, `"to offer"` → `"offer"`.
  2. `validateSafeAudioUrl("https://evil.example/x.mp3") === ""`, while 100% of `audio.tflat.vn` URLs in `src/data/curated-decks/` remain valid.
  3. Dual-POS relative URLs (`dual.nounAudioUrl`) are preserved; nonexistent words are not persisted to `dictionary_cache`.
- **Verification:** Expanded `src/core/dictionary.test.ts` + automated assertion over all curated-deck `audio_url` values.
- **Rollback:** Pure app code; instant `git revert`.

---

### Batch 5 [P1 — Vocab, Review FSRS & Admin Integrity]: Preserve Edits & Sync State
- **Objective:** Prevent curated-deck re-import from overwriting user edits or miscounting imports, sanitize PostgREST `.or()` filters, fix `/review` topic/preview bugs, and fix Admin audit logs/UI sync.
- **Root Causes & Corrections:** `RC-10`, `MD-05`.
- **In-Scope:**
  - Vocab: Pre-fetch existing user `lemma`s before chunked insert in `importCuratedDeckAction` so only net-new lemmas are inserted (per **F3** & `MD-05`, guaranteeing accurate `importedCount`/`existingCount`); escape PostgREST filter metacharacters in `.or()` (`vocab/actions.ts:319,378`); replace `alert()` in `vocab-list-view.tsx:1129,1133`.
  - Review: Return `notebookName`/`topicName` in `getReviewCardsAction`; paginate `getReviewTopicsAction` past 1,000 rows; clamp `limit` (`1..100`) in `review/page.tsx`; fix default `activeTopic` highlight in `review-view.tsx` when no `?topic=` param is set; refresh/clear stale `previews` on re-queued cards.
  - Admin: Fetch actual `previous_status` before updating in `approve/reject/editQuestionAction`; check errors on `question_answers.update` & `review_log.insert`; update local `questions` state in `admin-review-view.tsx` after `EditQuestionModal` saves; align `why_wrong_vi` types across admin/practice.
- **Out-of-Scope:** No God Component splitting (`vocab-list-view.tsx`, `review-view.tsx`).
- **Affected Modules:** `src/features/vocab/{actions.ts,components/vocab-list-view.tsx}`, `src/features/review/{actions.ts,components/review-view.tsx}`, `src/app/review/page.tsx`, `src/features/admin/{actions.ts,types.ts,components/admin-review-view.tsx}`, `src/core/adminReview.ts`.
- **Dependencies:** Batch 0 + **F3** human approval.
- **Acceptance Criteria:**
  1. Re-importing a curated deck preserves edited meanings/notebooks and reports exact net-new count.
  2. Vocab search with `,`, `(`, `)` does not throw PostgREST errors.
  3. `/review` allows clicking `topics[0]` by default and does not display stale FSRS previews after `Again`.
  4. Admin edit updates UI immediately without reload; `review_log` records real `previous_status`; answer-update failures never return `{ success: true }`.
- **Verification:** Unit tests for `.or()` sanitizer, import delta logic, and admin/review reducers + manual staging QA.
- **Rollback:** Split into 3 small commits (`vocab`, `review`, `admin`) for granular rollback.

---

### Batch 6 [P1/P2 — Mobile 360px Layout & A11y Markup]: Fix Nav Overflow, Overlap & Nested Interactive Elements
- **Objective:** Fix mobile 360px horizontal overflow and overlapping fixed bars, remove invalid nested `<a><button>` markup across 6 views, and apply token alignment only as approved in **F5**.
- **Root Causes:** `RC-11`.
- **In-Scope:**
  - `src/components/layout/app-nav.tsx`: Fit 6 bottom-nav items cleanly inside `360px` (remove `min-w-[64px]` overflow).
  - `src/features/admin/components/admin-review-view.tsx`: Resolve `fixed bottom-0 z-40` collision with `AppNav` on mobile.
  - Replace `<Link><Button>` (`<a><button>`) in 6 views with valid single interactive element (`buttonVariants` on `Link` or `asChild`).
  - Reconcile `#FAFAF7`/gradients/emojis/brand name **only per F5 approval**.
- **Out-of-Scope:** No layout redesign; no copy rewrite outside F5.
- **Affected Modules:** `src/components/layout/app-nav.tsx`, `src/features/admin/components/admin-review-view.tsx`, `src/components/ui/button.tsx`, 6 views with nested `<Link><Button>`, `src/app/globals.css` (if F5).
- **Dependencies:** Batch 0 + **F5** (for visual/brand portion; 360px overflow & `<a><button>` fixes are unconditional).
- **Acceptance Criteria:** 0 horizontal overflow at 360px; `/admin/review` action bar unobstructed on mobile; 0 `<button>` inside `<a>` across `src/`.
- **Verification:** Static grep for nested `<Link><Button>` + viewport check at `360px` / `768px` / `1280px` + Taste Gate R2 review.
- **Rollback:** Pure UI/CSS; instant `git revert`.

---

### Batch 7 [P2 — Performance, Hygiene, `next` Patch & CI Gate]: Slim `/learn`, Remove Dead Code & Harden CI
- **Objective:** Eliminate ~9,100-line client bundle regression on `/learn`, deduplicate metadata/page queries, delete verified 0-ref dead code, clear `npm audit`, and add `build` to CI.
- **Root Causes:** `RC-12`, `RC-13`, `RC-14` (dead code portion).
- **In-Scope:**
  - Move `grammarLessons.ts`/`lessonExercises.ts` imports to Server Components (`learn/page.tsx`, `learn/[tagCode]/page.tsx`) and pass serialized lesson props to client views.
  - Wrap shared metadata/page loaders in `React.cache()` for `exam/[slug]/page.tsx` and `reading/[id]/page.tsx`.
  - Delete verified 0-ref dead code (`src/features/vocab/components/curated-decks-modal.tsx`, `src/lib/supabase/client.ts`, `src/shared/index.ts`, 4 `.gitkeep` files) and stale branch `feat/learning-hub` (per **F7**).
  - Upgrade `next` (`16.4.3` → `16.4.6+`) and dev `@typescript-eslint/*` (per **F7**); fix `__dirname` warning in `vitest.config.mts`; add `npm run build` to `.github/workflows/ci.yml`.
- **Out-of-Scope:** No God Component refactors; do not mix bulk Prettier formatting (176 files) into logic PRs.
- **Affected Modules:** `src/app/learn/**`, `src/features/learn/components/**`, `src/app/{exam/[slug],reading/[id]}/page.tsx`, `package.json`, `package-lock.json`, `vitest.config.mts`, `.github/workflows/ci.yml`, 3 dead files.
- **Dependencies:** Batch 0–6 + **F7** human approval.
- **Acceptance Criteria:** `npm run build` green; client chunk on `/learn` reduced; `npm audit --omit=dev` = 0 vulnerabilities; CI runs `typecheck`, `lint`, `test` (offline), `build`.
- **Verification:** `npm run typecheck && npm run lint && npm run test && npm run build && npm audit --omit=dev`.
- **Rollback:** Split into PR-7A (bundle/cache/dead code) and PR-7B (deps/CI) for clean revert.

---

### Batch 8 [P3 — Deferred Roadmap Parity & Quality Upgrades]: Post-Recovery Scope
- **Objective:** Deliver missing spec features and real automated accessibility/RLS test suites only after Batches 0–7 stabilize the platform.
- **Root Causes:** `RC-13` (advanced test tooling), `RC-14` (God Components), `RC-15`.
- **Candidate Scope (gated by F1 & F6):** `/terms` & `/privacy`, Forgot Password, Google OAuth, API rate limiting (§6.7), `exam_attempts` history UI, Listening Part 1–4, real `@axe-core/playwright` + `pgTAP` suites on staging DB, incremental decomposition of `vocab-list-view.tsx` (2,804L) and `lesson-detail-view.tsx` (1,687L).

---

## 5. Compact Audit Evidence Index (On-Demand Reference)

Use this index instead of loading full audit transcripts into future sessions.

| ID | Type | Status | Exact Evidence |
| :--- | :--- | :--- | :--- |
| **RC-01** | Bug + Security (P0) | `VERIFIED` | `supabase/migrations/20261030000001_p0_security_and_system_hardening.sql:355-401` (`get_session_review` returns array, no `completed_at` check); `20261025000001:347-353` (`FOR ALL` RLS); `src/features/practice/components/practice-result-view.tsx:53-57`; `src/core/math.ts:5-10`. |
| **RC-02** | Bug + Security (P0) | `VERIFIED` / `LIKELY` live | `20261030000001:404-559` (2-arg overload) vs `20261103000001:18-201` & `20261103000005:6-189` (3-arg, no `DROP FUNCTION`); `src/features/reading/actions.ts:152-155`; `part6-view.tsx:48-50`, `part7-view.tsx:39-41`. |
| **RC-03** | Ops Blocker (P0) | `VERIFIED` | `tests/remediation-integration.test.ts:24-49,139-146,239-372` (mutates prod `.env.local` `review_cards`); `tests/invariants-integration.test.ts:34-47` (`const recordToDb = false`). |
| **RC-04** | Security + Bug (P0) | `VERIFIED` | `src/proxy.ts:20-37` (`POST /login` `Next-Action` bypass); `src/features/exam/actions.ts:143-148,227-359`; `src/core/examReading.ts:103-131`; `reading-exam-simulator.tsx:51-62,113`; `exam-result-view.tsx:102`; `src/data/mock-tests/*.json` (0 answer keys). |
| **RC-05** | Bug (P1) | `VERIFIED` | `20261030000001:179-181` (`create_session` omits `part = 5`); `src/features/practice/actions.ts:270-273`; `src/app/practice/[id]/page.tsx:45-58` (`grammar_tags!inner`). |
| **RC-06** | Bug (P1 / P2) | `VERIFIED` | `practice-runner.tsx:47` & `src/core/practiceReducer.ts:45-64` (retry dead at `status === "error"`); `src/features/practice/schemas.ts:96-113` drops `why_wrong_vi` (`practice-runner.tsx:187-188` fallback #2; type mismatch with `adminReview.ts:102`). |
| **RC-07** | Bug + Security (P1) | `VERIFIED` | `src/app/api/audio/tts/route.ts:8,31,66` (`/^[to\s]+/i`, unbounded Map, unauthenticated); `src/core/dictionary.ts:73-107` (`\|\|` bypass, missing `audio.tflat.vn`); `src/features/dictionary/actions.ts:22-155` (no auth, empty cache upsert, wipes `dual.nounAudioUrl`). |
| **RC-08** | Bug (P1) | `VERIFIED` | `src/features/stats/actions.ts:71-76` (`ascending: true`, `.limit(2000)`), `L271-283` (500 cap); `20261025000001:263-308` (`v_skill_mastery` obsolete D-03 `z=1.96`); `stats-view.tsx:59,185,498,577` (`?tagId=`) vs `practice/new/page.tsx:21`; `dashboard-view.tsx:169`. |
| **RC-09** | Bug (P1) | `VERIFIED` | `src/features/profile/actions.ts:131-135` (selects `pos` instead of `part_of_speech`, omits `card_reviews`); `profile-view.tsx:407` (`"Wilson"`). |
| **RC-10** | Bug (P1) | `VERIFIED` | `src/features/vocab/actions.ts:319,378,773-834`; `vocab-list-view.tsx:1129,1133`; `review/actions.ts:330-334,464-483`; `review-view.tsx:65-67,107,192-194`; `review/page.tsx:30`; `admin/actions.ts:207-260,343-359`; `admin-review-view.tsx:632-634`; `20261030000001:96-108`. |
| **RC-11** | UI / A11y (P1/P2) | `VERIFIED` | `src/components/layout/app-nav.tsx:260-285` (`6 * 64 + 16 = 400px > 360px`); `admin-review-view.tsx:590` (`fixed bottom-0 z-40` overlap); nested `<Link><Button>` in 6 views; `#FAFAF7`/gradients/emojis. |
| **RC-12** | Perf (P2) | `VERIFIED` | Commit `adc8b7e` `/learn` client bundle (~9,100L lesson data imported in client graph); uncached `generateMetadata` + page queries in `exam/[slug]` & `reading/[id]`. |
| **RC-13** | CI / Deps (P2) | `VERIFIED` | `.github/workflows/ci.yml` omits `build`; 176 Prettier diffs; 8 moderate `npm audit` advisories (`next@16.4.3`, 0 `'use cache'`/`unstable_cache` refs); `axe-core` & `pgTAP` not installed. |
| **RC-14** | Tech Debt (P2/P3) | `VERIFIED` | 0-ref dead code: `curated-decks-modal.tsx`, `src/lib/supabase/client.ts`, `src/shared/index.ts`, 4 `.gitkeep`, stale branch `feat/learning-hub`; God Components: `vocab-list-view.tsx` (2,804L), `lesson-detail-view.tsx` (1,687L). |
| **RC-15** | Missing Scope (P3) | `VERIFIED` | Unimplemented vs docs: Listening Part 1–4, Google OAuth, Forgot Password, `/terms` & `/privacy`, Rate Limiting (§6.7), `exam_attempts` history UI. |
| **MD-01..07** | Review Corrections | `VERIFIED` | Adversarial plan fixes embedded above: `POST /login` `Next-Action` bypass (`MD-01`), `FOR SELECT` RLS on sessions (`MD-02`), reject obsolete `v_skill_mastery` & `.reverse()` `DESC` attempts (`MD-03`), add `audio.tflat.vn` + preserve `/api/audio/tts` (`MD-04`), pre-filter existing lemmas in deck import (`MD-05`), remove ungradable JSON exam fallback (`MD-06`), single atomic SQL migration in Batch 1 (`MD-07`). |
