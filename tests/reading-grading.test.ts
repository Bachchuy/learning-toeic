import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Milestone A1: Reading Passages Grading & RLS Compliance Audit", () => {
  const migrationsDir = path.resolve(process.cwd(), "supabase/migrations");
  const readingActionsPath = path.resolve(process.cwd(), "src/features/reading/actions.ts");

  describe("1. Database Schema & RPC submit_passage_answers", () => {
    it("đảm bảo tồn tại RPC submit_passage_answers với thuộc tính SECURITY DEFINER", () => {
      const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));
      const allSql = files.map((f) => fs.readFileSync(path.join(migrationsDir, f), "utf-8")).join("\n");

      // RPC submit_passage_answers phải tồn tại
      expect(allSql).toContain("submit_passage_answers");

      // Bắt buộc phải là SECURITY DEFINER để học viên (role 'student') có thể chấm điểm
      // mà không cần quyền SELECT trực tiếp vào bảng bí mật question_answers
      const rpcSecurityDefiner = /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.submit_passage_answers[\s\S]*?SECURITY\s+DEFINER/i;
      expect(rpcSecurityDefiner.test(allSql)).toBe(true);

      // Phải cấp quyền EXECUTE cho authenticated
      expect(allSql).toMatch(/GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.submit_passage_answers[\s\S]*?TO\s+authenticated/i);
    });

    it("đảm bảo bảng attempts đã nới lỏng session_id và tag_id (DROP NOT NULL) cho Part 6 / 7", () => {
      const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));
      const allSql = files.map((f) => fs.readFileSync(path.join(migrationsDir, f), "utf-8")).join("\n");

      expect(allSql).toMatch(/ALTER\s+TABLE\s+(?:public\.)?attempts\s+ALTER\s+COLUMN\s+session_id\s+DROP\s+NOT\s+NULL/i);
      expect(allSql).toMatch(/ALTER\s+TABLE\s+(?:public\.)?attempts\s+ALTER\s+COLUMN\s+tag_id\s+DROP\s+NOT\s+NULL/i);
    });
  });

  describe("2. Server Action submitPassageAnswersAction Compliance", () => {
    it("tuyệt đối KHÔNG SELECT trực tiếp bảng question_answers từ server action client", () => {
      const actionContent = fs.readFileSync(readingActionsPath, "utf-8");

      // Bất biến: Không được query .from("question_answers") trong submitPassageAnswersAction
      const directSelectQa = /\.from\(["']question_answers["']\)/i;
      expect(directSelectQa.test(actionContent)).toBe(false);

      // Phải ủy quyền chấm điểm cho RPC submit_passage_answers
      expect(actionContent).toContain('rpc("submit_passage_answers"');
    });

    it("không chứa fire-and-forget .then(() => {}) nuốt lỗi", () => {
      const actionContent = fs.readFileSync(readingActionsPath, "utf-8");
      expect(actionContent).not.toContain(".then(() => {})");
    });

    it("fail-closed khi parse RPC submit_passage_answers (không fallback success ?? true)", () => {
      const actionContent = fs.readFileSync(readingActionsPath, "utf-8");
      expect(actionContent).toContain("parsePassageSubmitResult");
      expect(actionContent).not.toContain("?? true");
    });

    it("migration Batch 1 xóa overload 2 tham số cũ submit_passage_answers(UUID, JSONB)", () => {
      const batch1Sql = fs.readFileSync(
        path.join(migrationsDir, "20261119000001_p0_rpc_and_rls_hardening.sql"),
        "utf-8"
      );
      expect(batch1Sql).toMatch(
        /DROP\s+FUNCTION\s+IF\s+EXISTS\s+public\.submit_passage_answers\s*\(\s*UUID\s*,\s*JSONB\s*\)/i
      );
    });
  });

  describe("3. Reading UI Part 6 & Part 7 Error Handling", () => {
    it("part6-view và part7-view kiểm tra res.success trước khi lưu kết quả và hiển thị role=alert khi lỗi", () => {
      for (const relPath of [
        "src/features/reading/components/part6-view.tsx",
        "src/features/reading/components/part7-view.tsx",
      ]) {
        const uiContent = fs.readFileSync(path.resolve(process.cwd(), relPath), "utf-8");
        expect(uiContent).toContain("if (!res.success)");
        expect(uiContent).toContain('role="alert"');
        expect(uiContent).toContain("submitResult.total > 0 && submitResult.score === submitResult.total");
      }
    });
  });
});
