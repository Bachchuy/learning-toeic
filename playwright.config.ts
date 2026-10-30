import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 * Cấu hình Playwright tuân thủ Milestone M12 & Breakpoints D-05 (360px mobile / 1280px desktop)
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "Desktop Chrome (1280px)",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "Mobile Small (360px - D-05)",
      use: {
        viewport: { width: 360, height: 740 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],

  /* Chạy server dev tự động nếu chưa có server */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
