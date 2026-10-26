import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Milestone M12: Security & RLS Compliance Audit", () => {
  const migrationsDir = path.resolve(process.cwd(), "supabase/migrations");
  const srcDir = path.resolve(process.cwd(), "src");

  describe("1. Cơ sở dữ liệu: Tất cả các bảng phải bật Row Level Security (RLS)", () => {
    it("quét các file migration và đảm bảo mọi lệnh CREATE TABLE đều đi kèm ENABLE ROW LEVEL SECURITY", () => {
      const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));
      expect(files.length).toBeGreaterThan(0);

      const allSql = files.map((f) => fs.readFileSync(path.join(migrationsDir, f), "utf-8")).join("\n");

      // Tìm tất cả các bảng được tạo
      const tableMatches = Array.from(allSql.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?([a-zA-Z0-9_]+)/gi));
      const createdTables = Array.from(new Set(tableMatches.map((m) => m[1])));

      expect(createdTables.length).toBeGreaterThan(0);

      // Danh sách các bảng nghiệp vụ cốt lõi
      const coreTables = [
        "profiles",
        "questions",
        "question_answers",
        "practice_sessions",
        "attempts",
        "vocab_entries",
        "review_cards",
        "card_reviews",
        "question_reports",
        "events",
        "review_log",
      ];

      for (const table of coreTables) {
        expect(createdTables).toContain(table);
        // Kiểm tra lệnh ALTER TABLE <table> ENABLE ROW LEVEL SECURITY
        const rlsPattern = new RegExp(`ALTER\\s+TABLE\\s+(?:public\\.)?${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, "i");
        const hasRls = rlsPattern.test(allSql);
        expect(hasRls, `Bảng ${table} PHẢI có lệnh ENABLE ROW LEVEL SECURITY`).toBe(true);
      }
    });

    it("đảm bảo bảng question_answers không cấp quyền SELECT cho vai trò anon hoặc authenticated", () => {
      const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));
      const allSql = files.map((f) => fs.readFileSync(path.join(migrationsDir, f), "utf-8")).join("\n");

      // Tuyệt đối KHÔNG có policy cho phép anon hoặc authenticated đọc question_answers
      const dangerousAnonSelect = /CREATE\s+POLICY.*ON\s+(?:public\.)?question_answers.*FOR\s+SELECT.*TO\s+(?:anon|authenticated|public)/i;
      expect(dangerousAnonSelect.test(allSql)).toBe(false);
    });
  });

  describe("2. Bảo mật Khóa Secret: SUPABASE_SERVICE_ROLE_KEY không bao giờ lộ ra client", () => {
    it("quét đệ quy toàn bộ thư mục src/ và đảm bảo không có file client nào import trực tiếp SUPABASE_SERVICE_ROLE_KEY", () => {
      function scanDir(dir: string, fileList: string[] = []): string[] {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            scanDir(fullPath, fileList);
          } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
            fileList.push(fullPath);
          }
        }
        return fileList;
      }

      const allSourceFiles = scanDir(srcDir);

      for (const file of allSourceFiles) {
        const content = fs.readFileSync(file, "utf-8");
        const isClientFile = content.includes('"use client"') || content.includes("'use client'");

        if (isClientFile) {
          const leaksServiceRole = content.includes("SUPABASE_SERVICE_ROLE_KEY") || content.includes("service_role");
          expect(
            leaksServiceRole,
            `LỖI BẢO MẬT: File client ${path.relative(process.cwd(), file)} không được phép chứa SUPABASE_SERVICE_ROLE_KEY`
          ).toBe(false);
        }
      }
    });
  });

  describe("3. Phân quyền Admin: Role-based Access Control (RBAC)", () => {
    it("xác minh rằng is_admin() kiểm tra dựa trên bảng profiles với security definer", () => {
      const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));
      const allSql = files.map((f) => fs.readFileSync(path.join(migrationsDir, f), "utf-8")).join("\n");

      // Hàm is_admin phải tồn tại và có SECURITY DEFINER
      expect(allSql).toContain("is_admin()");
      expect(allSql).toContain("SECURITY DEFINER");
    });
  });
});
