import { test, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const hasLiveDb = Boolean(
  supabaseUrl &&
    anonKey &&
    serviceRoleKey &&
    !supabaseUrl.includes("placeholder")
);

async function assertNoHorizontalOverflow(page: Page, routeLabel: string) {
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(overflow, `Trang ${routeLabel} bị tràn ngang màn hình`).toBe(false);
}

test.describe.serial("Authenticated Golden Paths (Dogfood Bot — 360px & 1280px)", () => {
  let testUserId = "";
  let testEmail = "";
  let testPassword = "";

  const adminClient = hasLiveDb
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

  test.beforeAll(async ({}, testInfo) => {
    test.skip(!hasLiveDb || !adminClient, "Bỏ qua E2E cần live DB khi thiếu env Supabase.");

    const suffix = `${Date.now()}_${testInfo.project.name.replace(/[^a-z0-9]/gi, "")}_${Math.random()
      .toString(36)
      .slice(2, 7)}`;
    testEmail = `e2e_golden_${suffix}@example.com`;
    testPassword = `ToeicE2E!_${suffix}`;

    const { data, error } = await adminClient!.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { full_name: "E2E Golden Tester" },
    });

    if (error || !data.user) {
      throw new Error(`Không thể tạo user E2E tạm thời: ${error?.message}`);
    }
    testUserId = data.user.id;
  });

  test.afterAll(async () => {
    if (adminClient && testUserId) {
      await adminClient.auth.admin.deleteUser(testUserId);
    }
  });

  async function signInViaUi(page: Page) {
    await page.goto("/login");
    await page.locator('input[type="email"]').fill(testEmail);
    await page.locator('input[name="password"]').fill(testPassword);
    await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
    await page.waitForURL((url) => url.pathname === "/", { timeout: 15000 });
  }

  test("1. Đăng nhập, giữ phiên khi reload Dashboard, không lỗi JS và không tràn ngang", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await signInViaUi(page);
    await expect(page.locator("h1, h2").first()).toBeVisible();
    await assertNoHorizontalOverflow(page, "/");

    // Kiểm tra bất biến giữ phiên sau F5 / reload (REGRESSION R1.3)
    await page.reload();
    await expect(page).toHaveURL(/\/$/);
    await assertNoHorizontalOverflow(page, "/ (after reload)");
    expect(pageErrors).toEqual([]);
  });

  test("2. Đi qua toàn bộ màn hình chính (/learn, /vocab, /exam, /stats, /profile) + kiểm tra chặn Admin 403", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await signInViaUi(page);

    // /learn (SSR summary) -> /learn/tenses (SSG detail)
    await page.goto("/learn");
    await expect(page.locator("h1")).toContainText("Học lý thuyết");
    await assertNoHorizontalOverflow(page, "/learn");

    await page.goto("/learn/tenses");
    await expect(page.locator("h1")).toContainText("Thì động từ");
    await assertNoHorizontalOverflow(page, "/learn/tenses");

    // /vocab (đã tối ưu bundle Phase 2)
    await page.goto("/vocab");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    await assertNoHorizontalOverflow(page, "/vocab");

    // /exam
    await page.goto("/exam");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    await assertNoHorizontalOverflow(page, "/exam");

    // /stats & /profile
    await page.goto("/stats");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    await assertNoHorizontalOverflow(page, "/stats");

    await page.goto("/profile");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    await assertNoHorizontalOverflow(page, "/profile");

    // Bảo mật RBAC: Học viên thường vào /admin/review và /admin/insights phải bị chặn 403
    await page.goto("/admin/review");
    await expect(page.locator("h1")).toContainText("403");
    await page.goto("/admin/insights");
    await expect(page.locator("h1")).toContainText("403");

    expect(pageErrors).toEqual([]);
  });

  test("3. Luồng làm bài Part 5: Khởi tạo phiên, bảo vệ đáp án trước khi nộp và nhận giải thích thích ứng", async ({
    page,
  }) => {
    await signInViaUi(page);

    await page.goto("/practice/new");
    const startBtn = page.getByRole("button", { name: /Bắt đầu luyện/ });
    await expect(startBtn).toBeEnabled({ timeout: 15000 });
    await startBtn.click();

    await page.waitForURL(/\/practice\/[0-9a-f-]+$/i, { timeout: 15000 });
    await assertNoHorizontalOverflow(page, "/practice/[id]");

    // Bất biến R2.1: HTML trước khi nộp không chứa chuỗi correct_index
    const htmlBeforeSubmit = await page.content();
    expect(htmlBeforeSubmit).not.toContain("correct_index");

    // Chọn phương án đầu tiên và bấm Nộp đáp án
    const firstOption = page.getByRole("radio").first();
    await expect(firstOption).toBeVisible();
    await firstOption.click();

    const submitAnswerBtn = page.getByRole("button", { name: "Nộp đáp án" });
    await expect(submitAnswerBtn).toBeEnabled();
    await submitAnswerBtn.click();

    // Phản hồi ĐÚNG hoặc SAI phải xuất hiện từ server RPC
    await expect(page.locator("text=/^(ĐÚNG|SAI)$/").first()).toBeVisible({
      timeout: 15000,
    });
    await assertNoHorizontalOverflow(page, "/practice/[id] (after submit)");
  });

  test("4. Kênh Góp ý nhanh (FeedbackModal): Mở modal, gửi góp ý thật vào DB và nhận thông báo thành công", async ({
    page,
    isMobile,
  }) => {
    await signInViaUi(page);

    if (isMobile) {
      await page.getByRole("button", { name: "Mở hộp góp ý" }).click();
    } else {
      await page.getByRole("button", { name: /Góp ý & Báo lỗi/ }).click();
    }

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog
      .locator("#feedback-message")
      .fill("E2E test kiểm tra kênh góp ý tự động hoạt động ổn định.");
    await dialog.getByRole("button", { name: "Gửi góp ý" }).click();

    await expect(
      dialog.locator("text=Cảm ơn bạn! Góp ý đã được ghi nhận.")
    ).toBeVisible({ timeout: 15000 });
  });
});
