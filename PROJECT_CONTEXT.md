# PROJECT_CONTEXT.md — Durable Entry-Point Context

> **Layer 1 Entry Point** for future AI and developer sessions. Keep concise (500–800 words); reference authoritative sources instead of copying implementation details.  
> **Consolidated:** 2026-11-19 (base commit `adc8b7e` on `main`).

---

## 1. Context Loading Strategy (Read in Order)

1. **First:** Read `PROJECT_CONTEXT.md` (goals, invariants, verified state, safety guardrails).
2. **Second:** Read **only the active batch** in [docs/RECOVERY_PLAN.md](docs/RECOVERY_PLAN.md) (scope, dependencies, acceptance criteria, audit pointers).
3. **Third:** Open **only relevant specs** via [docs/INDEX.md](docs/INDEX.md) and the target `src/` or `supabase/migrations/` files.
4. **Fourth:** Load historical or auxiliary docs (`docs/05-design/*`, `docs/FEATURE_INVENTORY.md`, `docs/qa/*`) only when needed.

Do **not** preload all documents in `docs/` for routine tasks.

---

## 2. Product Goal & Verified Stack

**Goal:** Adaptive TOEIC learning platform built around *"understand why an answer is wrong"*, server-side answer shielding, FSRS spaced repetition, and Adaptive Rolling Mastery.

**Actual Stack (`package.json`, `src/`):**
- **Frontend:** Next.js `16.4.6` (App Router, Turbopack), React 19, TypeScript strict, Tailwind CSS v4, Lucide React.
- **Backend:** Supabase Postgres (26 SQL migrations including `20261119000001` & `20261119000002`), `@supabase/ssr` cookie auth, `src/proxy.ts` guard, RLS on 100% of tables, `SECURITY DEFINER` RPCs (`SET search_path = public`).
- **Pure Core (`src/core/`):** `ts-fsrs` `5.4.2` (server-side), Adaptive Rolling Mastery (`wilson.ts`), practice reducer, drill, ETS Reading & Listening exam scoring/timer, dictionary helpers.
- **Testing:** Vitest (`37` test files), Playwright + `@axe-core/playwright` (WCAG 2.1 AA), and `pgTAP` SQL test suite (`supabase/tests/*.sql`).

**Implemented Modules (beyond MVP spec):** Auth (`/login`, `/reset-password`, `/auth/callback`, Google OAuth), Dashboard (`/`), Part 5 Practice & Drill (`/practice/*`), Reading Part 6/7 (`/reading/[id]`), Reading & Listening Exam Simulators (`/exam/*`, `/exam/[slug]/listening`, `/exam#history`), Vocab & Curated Decks (`/vocab`), FSRS Review (`/review`), Stats (`/stats`), Learning Hub (`/learn/*`), Profile (`/profile`), Legal (`/terms`, `/privacy`), Admin (`/admin/*`), Audio TTS Proxy (`/api/audio/tts`).

---

## 3. Approved Invariants & Safety Guardrails

1. Answer keys (`question_answers`, `exam_set_answers`) never leave the server before valid submission.
2. Drill is 100% client-side — never writes DB or changes mastery.
3. Mastery uses **Adaptive Rolling Mastery (D-25)**: `z = 1.0`, sliding window of 20 most recent attempts, fast-track `n >= 8` & `>= 90%`, thresholds `5 / 50 / 75`. **Never query obsolete SQL view `v_skill_mastery`** (still uses D-03 `z = 1.96` all-time).
4. No timer in daily Part 5 practice (Exam Simulator `/exam` uses 75 min per D-27).
5. One Primary button per screen; WCAG 2.1 AA; preserve 100% of curated CDN `audio_url` assets (`audio.tflat.vn`, etc.).
6. RLS enabled on all tables; clients cannot self-escalate `profiles.role`; `src/core/` stays pure (no DB/React/DOM); `createAdminClient()` is server-only; schema/RLS edits go through timestamped `supabase/migrations/`.

**CRITICAL TEST GUARDRAIL (UNTIL BATCH 0 COMPLETES):**  
`.env.local` targets **live production Supabase (`etcpholhbhtpttbuackx`)**. Unfiltered `npm run test` or `npm run test:e2e` mutates real user `review_cards`. Until Batch 0 finishes, run offline tests only:  
`npx vitest run --exclude tests/remediation-integration.test.ts`

---

## 4. State Separation: Verified · Unknown · Unresolved · Planned

- **Verified Working (Offline):** `tsc --noEmit` (PASS), `npm run lint` (PASS), offline Vitest (26 files / 213 tests PASS), pure `src/core/` math/FSRS/scoring, SSR email/password auth.
- **Verified Broken / Vulnerable (P0–P1):**
  - **P0:** `get_session_review` returns array (breaks `/practice/[id]/result` & Drill) and leaks `question_answers`; `practice_sessions`/`session_questions` keep `FOR ALL` RLS.
  - **P0:** `submit_passage_answers` has duplicate 2-arg (vulnerable) + 3-arg overloads; Part 6/7 UI ignores failed RPCs.
  - **P0:** Unauthenticated `POST /login` with `Next-Action` bypasses `src/proxy.ts`, exposing `submitReadingExamAction` (1-answer → 100-answer oracle) and `lookupWordAction` (`service_role`).
  - **P0 (Ops):** Live prod DB mutation hazard in integration/E2E tests.
  - **P1:** Part 6/7 leakage into Part 5; dead retry in `practice-runner`; `/api/audio/tts` regex bug (`/^[to\s]+/i`) & audio whitelist bypass; mastery freeze > 2,000 attempts; broken Profile JSON export (`pos` vs `part_of_speech`); Vocab re-import overwrite; Review/Admin state bugs; 360px Bottom Nav overflow.
- **Unknown (Not Run):** Live Postgres overload behavior on `submit_passage_answers`; live E2E; `npm run build` on `adc8b7e`.
- **Unresolved Human Decisions (Do Not Assume):** `F1` staging DB/migration flow, `F2` exam anti-oracle rule, `F3` deck re-import policy, `F4` `/api/audio/tts` auth, `F5` brand (`Tôi Em Íc` vs `TOEIC AI`) & token strictness, `F6` deferred scope (Listening P1–4, OAuth, `/terms`, rate limits), `F7` dep upgrade/Prettier. Details in [docs/RECOVERY_PLAN.md](docs/RECOVERY_PLAN.md#2-unresolved-decisions-requiring-human-approval).
- **Approved Planned Work:** Recovery **Batch 0 → Batch 8** + Codex Review Remediation (`adc8b7e → 7f238f4`) all implemented and verified offline (`READY_FOR_CODEX_REVIEW`; details in [.ai/HANDOFF.md](.ai/HANDOFF.md) and [docs/RECOVERY_PLAN.md](docs/RECOVERY_PLAN.md)).

---

## 5. Layer 2 & Layer 3 References

| Layer | Path | Use When |
| :--- | :--- | :--- |
| **Layer 2** | [docs/RECOVERY_PLAN.md](docs/RECOVERY_PLAN.md) | Checking active recovery batch, status, dependencies, and compact audit index (`RC-01..15`, `MD-01..07`). |
| **Layer 3** | [docs/INDEX.md](docs/INDEX.md) | Navigating detailed specs, design tokens, and agent skills. |
| **Layer 3** | [docs/03-decisions/D-log.md](docs/03-decisions/D-log.md), [PD-log.md](docs/03-decisions/PD-log.md) | Verifying approved architectural/product decisions. |
| **Layer 3** | [docs/04-business-rules.md](docs/04-business-rules.md), [docs/06-architecture.md](docs/06-architecture.md) | Checking domain rules, DB schema, RLS, and RPC contracts. |
| **Layer 3** | [tests/REGRESSION_CHECKLIST.md](tests/REGRESSION_CHECKLIST.md) | Running mandatory pre-completion regression checks. |
| **Historical** | [docs/qa/m12-audit-report.md](docs/qa/m12-audit-report.md), [docs/FEATURE_INVENTORY.md](docs/FEATURE_INVENTORY.md) | Preserved pre-audit snapshots (explicitly superseded). |
