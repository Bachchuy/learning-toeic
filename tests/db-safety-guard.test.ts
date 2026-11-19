import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  assertSafePlaywrightSupabaseConfig,
  isProductionSupabaseUrl,
  readEnvFile,
  resolveLiveDbTestConfig,
} from "./db-safety-guard";

describe("Batch 0: DB & E2E Production Safety Guard", () => {
  it("mặc định offline: trả về enabled = false khi RUN_LIVE_DB_TESTS chưa bật dù .env.local tồn tại", () => {
    const config = resolveLiveDbTestConfig({
      env: {},
      cwd: process.cwd(),
    });

    expect(config).toEqual({
      enabled: false,
      supabaseUrl: "",
      anonKey: "",
      serviceRoleKey: "",
    });
  });

  it("chặn cứng (fail-closed) khi RUN_LIVE_DB_TESTS=1 trỏ tới project production mặc định", () => {
    expect(() =>
      resolveLiveDbTestConfig({
        env: {
          RUN_LIVE_DB_TESTS: "1",
          NEXT_PUBLIC_SUPABASE_URL: "https://etcpholhbhtpttbuackx.supabase.co",
          NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
          SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
        },
        cwd: os.tmpdir(),
      })
    ).toThrow(/\[SAFETY BLOCK\]/);
  });

  it("chặn cứng (fail-closed) khi RUN_LIVE_DB_TESTS=1 khớp PRODUCTION_SUPABASE_REF tùy biến", () => {
    expect(() =>
      resolveLiveDbTestConfig({
        env: {
          RUN_LIVE_DB_TESTS: "1",
          PRODUCTION_SUPABASE_REF: "customprod123",
          NEXT_PUBLIC_SUPABASE_URL: "https://customprod123.supabase.co",
          NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
          SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
        },
        cwd: os.tmpdir(),
      })
    ).toThrow(/\[SAFETY BLOCK\]/);
  });

  it("ưu tiên TEST_SUPABASE_URL (local/staging) hơn NEXT_PUBLIC_SUPABASE_URL khi RUN_LIVE_DB_TESTS=1", () => {
    const config = resolveLiveDbTestConfig({
      env: {
        RUN_LIVE_DB_TESTS: "1",
        TEST_SUPABASE_URL: "http://127.0.0.1:54321",
        TEST_SUPABASE_ANON_KEY: "local-anon-key",
        TEST_SUPABASE_SERVICE_ROLE_KEY: "local-service-key",
        NEXT_PUBLIC_SUPABASE_URL: "https://etcpholhbhtpttbuackx.supabase.co",
      },
      cwd: os.tmpdir(),
    });

    expect(config).toEqual({
      enabled: true,
      supabaseUrl: "http://127.0.0.1:54321",
      anonKey: "local-anon-key",
      serviceRoleKey: "local-service-key",
    });
  });

  it("Playwright guard: chặn production ref và cho phép URL rỗng, placeholder hoặc local", () => {
    const emptyTmp = fs.mkdtempSync(path.join(os.tmpdir(), "pw-guard-empty-"));
    try {
      expect(() =>
        assertSafePlaywrightSupabaseConfig({
          env: {
            NEXT_PUBLIC_SUPABASE_URL: "https://etcpholhbhtpttbuackx.supabase.co",
          },
          cwd: emptyTmp,
        })
      ).toThrow(/\[SAFETY BLOCK\]/);

      expect(() =>
        assertSafePlaywrightSupabaseConfig({
          env: {},
          cwd: emptyTmp,
        })
      ).not.toThrow();

      expect(() =>
        assertSafePlaywrightSupabaseConfig({
          env: {
            NEXT_PUBLIC_SUPABASE_URL: "https://placeholder.supabase.co",
          },
          cwd: emptyTmp,
        })
      ).not.toThrow();

      expect(() =>
        assertSafePlaywrightSupabaseConfig({
          env: {
            NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
          },
          cwd: emptyTmp,
        })
      ).not.toThrow();
    } finally {
      fs.rmSync(emptyTmp, { recursive: true, force: true });
    }
  });

  it("isProductionSupabaseUrl & readEnvFile xử lý đúng chuỗi quote và case-insensitive", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "env-parser-"));
    try {
      const envFile = path.join(tmpDir, ".env.test");
      fs.writeFileSync(
        envFile,
        '# comment\nNEXT_PUBLIC_SUPABASE_URL="https://example.supabase.co"\nTEST_KEY=\'val=with=equals\'\n',
        "utf-8"
      );
      expect(readEnvFile(envFile)).toEqual({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        TEST_KEY: "val=with=equals",
      });
      expect(isProductionSupabaseUrl("https://ETCPHOLHBHTPTTBUACKX.supabase.co")).toBe(true);
      expect(isProductionSupabaseUrl("http://127.0.0.1:54321")).toBe(false);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
