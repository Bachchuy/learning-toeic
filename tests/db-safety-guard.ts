import * as fs from "node:fs";
import * as path from "node:path";

export const BLOCKED_PRODUCTION_SUPABASE_REFS = ["etcpholhbhtpttbuackx"] as const;

export interface LiveDbTestConfig {
  enabled: boolean;
  supabaseUrl: string;
  anonKey: string;
  serviceRoleKey: string;
}

/**
 * Non-mutating .env file parser. Returns key-value pairs without altering process.env.
 */
export function readEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const parsed: Record<string, string> = {};
  const content = fs.readFileSync(filePath, "utf-8");

  for (const rawLine of content.split(/\r?\n/)) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }

    if (key) {
      parsed[key] = value;
    }
  }

  return parsed;
}

/**
 * Checks whether a Supabase URL references a blocked production project ref.
 */
export function isProductionSupabaseUrl(
  url: string,
  extraBlockedRefs: string[] = []
): boolean {
  const normalizedUrl = url.trim().toLowerCase();
  if (!normalizedUrl) {
    return false;
  }

  const blockedRefs = [...BLOCKED_PRODUCTION_SUPABASE_REFS, ...extraBlockedRefs]
    .map((ref) => ref.trim().toLowerCase())
    .filter((ref) => ref.length > 0);

  return blockedRefs.some((ref) => normalizedUrl.includes(ref));
}

function collectExtraBlockedRefs(
  env: EnvMap,
  fileEnv: Record<string, string>
): string[] {
  const refs: string[] = [];
  const fromEnv = env.PRODUCTION_SUPABASE_REF?.trim();
  const fromFile = fileEnv.PRODUCTION_SUPABASE_REF?.trim();
  if (fromEnv) refs.push(fromEnv);
  if (fromFile) refs.push(fromFile);
  return refs;
}

/**
 * Resolves live DB integration test configuration.
 * Offline by default unless RUN_LIVE_DB_TESTS === "1", and fails closed on production refs.
 */
export type EnvMap = Record<string, string | undefined>;

export function resolveLiveDbTestConfig(options?: {
  env?: EnvMap;
  cwd?: string;
}): LiveDbTestConfig {
  const env = options?.env ?? process.env;
  const cwd = options?.cwd ?? process.cwd();

  if (env.RUN_LIVE_DB_TESTS !== "1") {
    return {
      enabled: false,
      supabaseUrl: "",
      anonKey: "",
      serviceRoleKey: "",
    };
  }

  const fileEnv = readEnvFile(path.join(cwd, ".env.local"));
  const supabaseUrl = (
    env.TEST_SUPABASE_URL ||
    env.NEXT_PUBLIC_SUPABASE_URL ||
    fileEnv.TEST_SUPABASE_URL ||
    fileEnv.NEXT_PUBLIC_SUPABASE_URL ||
    ""
  ).trim();
  const anonKey = (
    env.TEST_SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    fileEnv.TEST_SUPABASE_ANON_KEY ||
    fileEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  ).trim();
  const serviceRoleKey = (
    env.TEST_SUPABASE_SERVICE_ROLE_KEY ||
    env.SUPABASE_SERVICE_ROLE_KEY ||
    fileEnv.TEST_SUPABASE_SERVICE_ROLE_KEY ||
    fileEnv.SUPABASE_SERVICE_ROLE_KEY ||
    ""
  ).trim();

  const extraRefs = collectExtraBlockedRefs(env, fileEnv);
  if (isProductionSupabaseUrl(supabaseUrl, extraRefs)) {
    throw new Error(
      `[SAFETY BLOCK] Refusing to run live DB tests against production Supabase project (${supabaseUrl}). Configure an isolated staging/local database via TEST_SUPABASE_URL.`
    );
  }

  return {
    enabled: Boolean(supabaseUrl && anonKey && serviceRoleKey),
    supabaseUrl,
    anonKey,
    serviceRoleKey,
  };
}

/**
 * Ensures Playwright E2E configuration never runs against a blocked production Supabase URL.
 */
export function assertSafePlaywrightSupabaseConfig(options?: {
  env?: EnvMap;
  cwd?: string;
}): void {
  const env = options?.env ?? process.env;
  const cwd = options?.cwd ?? process.cwd();
  const fileEnv = readEnvFile(path.join(cwd, ".env.local"));
  const extraRefs = collectExtraBlockedRefs(env, fileEnv);

  const candidates = [
    env.TEST_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_URL,
    fileEnv.TEST_SUPABASE_URL,
    fileEnv.NEXT_PUBLIC_SUPABASE_URL,
  ]
    .map((value) => (value ?? "").trim())
    .filter((value) => value.length > 0);

  for (const candidateUrl of candidates) {
    if (isProductionSupabaseUrl(candidateUrl, extraRefs)) {
      throw new Error(
        `[SAFETY BLOCK] Refusing to run Playwright E2E tests against production Supabase project (${candidateUrl}). Point NEXT_PUBLIC_SUPABASE_URL to an isolated staging or local Supabase instance.`
      );
    }
  }
}
