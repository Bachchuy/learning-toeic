import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const TESTS_DIR = path.resolve(process.cwd(), "supabase/tests");

const EXPECTED_PUBLIC_TABLES = [
  "attempts",
  "card_reviews",
  "dictionary_cache",
  "events",
  "exam_attempts",
  "exam_set_answers",
  "exam_sets",
  "grammar_tags",
  "notebooks",
  "passages",
  "practice_sessions",
  "profiles",
  "question_answers",
  "question_reports",
  "questions",
  "review_cards",
  "review_log",
  "session_questions",
  "user_feedback",
  "vocab_entries",
] as const;

describe("pgTAP SQL test suite integrity", () => {
  it("kiểm tra đủ 2 file pgTAP với BEGIN / SELECT plan(N) / finish() / ROLLBACK khớp số assertion", () => {
    const files = fs
      .readdirSync(TESTS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    expect(files).toEqual([
      "01_rls_and_security_invariants.sql",
      "02_wilson_and_rpc_contracts.sql",
    ]);

    for (const file of files) {
      const sql = fs.readFileSync(path.join(TESTS_DIR, file), "utf-8");
      expect(sql).toMatch(/^\s*BEGIN;/);
      expect(sql).toMatch(/SELECT \* FROM finish\(\);/);
      expect(sql).toMatch(/ROLLBACK;\s*$/);

      const planMatch = sql.match(/SELECT plan\((\d+)\);/);
      expect(planMatch).not.toBeNull();
      const declaredCount = Number(planMatch![1]);

      const assertionMatches = sql.match(
        /^\s*SELECT\s+(?:is|ok|throws_ok|lives_ok)\s*\(/gm
      );
      expect(assertionMatches?.length).toBe(declaredCount);
    }
  });

  it("01_rls_and_security_invariants.sql bao phủ toàn bộ 20 bảng public và các bất biến P0", () => {
    const sql = fs.readFileSync(
      path.join(TESTS_DIR, "01_rls_and_security_invariants.sql"),
      "utf-8"
    );

    for (const tbl of EXPECTED_PUBLIC_TABLES) {
      expect(sql).toContain(`c.relname = '${tbl}'`);
    }

    expect(sql).toContain("public.question_answers");
    expect(sql).toContain("public.exam_set_answers");
    expect(sql).toContain("UPDATE public.profiles SET role = 'admin'");
    expect(sql).toContain("INSERT INTO public.practice_sessions");
  });

  it("02_wilson_and_rpc_contracts.sql bao phủ 8 mốc Wilson Phụ lục A và hợp đồng RPC", () => {
    const sql = fs.readFileSync(
      path.join(TESTS_DIR, "02_wilson_and_rpc_contracts.sql"),
      "utf-8"
    );

    const expectedScores = [
      "34.2",
      "49.0",
      "31.3",
      "30.6",
      "46.8",
      "56.5",
      "60.1",
      "69.9",
      "0.0",
    ];
    for (const score of expectedScores) {
      expect(sql).toContain(score);
    }
    expect(sql).toContain("submit_passage_answers");
    expect(sql).toContain("search_path=public");
  });
});
