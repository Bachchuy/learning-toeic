import path from "path";
import { build, type Plugin } from "esbuild";
import { chromium, type Browser } from "@playwright/test";

/**
 * Bundles a real React 19 browser harness in memory via esbuild (already installed),
 * with zero temp files on disk and zero Supabase connections.
 */
export async function bundleBrowserHarness(
  entryCode: string,
  plugins: Plugin[] = []
): Promise<string> {
  const result = await build({
    stdin: {
      contents: entryCode,
      resolveDir: process.cwd(),
      loader: "tsx",
    },
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
    jsx: "automatic",
    tsconfig: path.resolve(process.cwd(), "tsconfig.json"),
    define: {
      "process.env.NODE_ENV": '"development"',
    },
    plugins,
  });

  const bundled = result.outputFiles[0]?.text;
  if (!bundled) {
    throw new Error("esbuild produced no bundled output for browser harness.");
  }
  return bundled;
}

/**
 * Launches real headless Chromium via @playwright/test for real React + real DOM tests.
 */
export async function launchTestChromium(): Promise<Browser> {
  return chromium.launch({ headless: true });
}
