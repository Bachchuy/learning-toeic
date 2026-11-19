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
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const val = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = val;
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
    return (
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
    );
  });
  expect(overflow, `Trang ${routeLabel} bị tràn ngang màn hình`).toBe(false);
}

test.describe.serial("Learn UI/UX Optimization E2E (360px & 1280px)", () => {
  let testUserId = "";
  let testEmail = "";
  let testPassword = "";

  const adminClient = hasLiveDb
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

  test.beforeAll(async ({}, testInfo) => {
    test.skip(
      !hasLiveDb || !adminClient,
      "Bỏ qua E2E cần live DB khi thiếu env Supabase."
    );

    const suffix = `${Date.now()}_${testInfo.project.name.replace(/[^a-z0-9]/gi, "")}_${Math.random()
      .toString(36)
      .slice(2, 7)}`;
    testEmail = `e2e_learn_ux_${suffix}@example.com`;
    testPassword = `ToeicE2E!_${suffix}`;

    const { data, error } = await adminClient!.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { full_name: "E2E Learn UX Tester" },
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

  test("1. /learn: Lộ trình & tìm kiếm 16 chủ điểm gọn, không tràn ngang", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await signInViaUi(page);
    await page.goto("/learn");

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("Học lý thuyết theo lộ trình");
    await expect(page.locator("#next-roadmap-step-heading")).toBeVisible();
    await assertNoHorizontalOverflow(page, "/learn (roadmap)");

    // Chuyển sang tab 16 chủ điểm và kiểm tra tìm kiếm
    await page.getByRole("tab", { name: /16 chủ điểm/ }).click();
    const searchInput = page.locator("#learn-search-input");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("tenses");
    await expect(
      page.getByRole("heading", { name: "Thì động từ (Tenses)" })
    ).toBeVisible();
    await assertNoHorizontalOverflow(page, "/learn (all lessons)");

    expect(pageErrors).toEqual([]);
  });

  test("2. /learn/tenses: Workspace 2 cột / Mobile stepper, Ẩn dịch & lưu bài tập localStorage", async ({
    page,
    isMobile,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await signInViaUi(page);
    await page.goto("/learn/tenses");

    // Đảm bảo chỉ có duy nhất 1 thẻ <h1> ngoài Suspense
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("Thì động từ");
    await assertNoHorizontalOverflow(page, "/learn/tenses");

    if (isMobile) {
      // Mobile: Có các nút điều khiển và mở được bảng Tra nhanh 5 giây
      const cheatBtn = page.getByRole("button", { name: "Tra 5s" });
      await expect(cheatBtn).toBeVisible();
      await cheatBtn.click();
      await expect(
        page.locator('section[aria-label="Tra nhanh dấu hiệu 5 giây"]').first()
      ).toBeVisible();

      // Bật chế độ Ẩn dịch trên Mobile
      await page.getByRole("button", { name: "Ẩn dịch", exact: true }).click();
    } else {
      // Desktop: Sticky Rail phải hiển thị Mục lục & Tra nhanh 5 giây
      const aside = page.locator('aside[aria-label="Mục lục học phần và bảng tra nhanh"]');
      await expect(aside).toBeVisible();
      await expect(aside.getByText("Mục lục bài học")).toBeVisible();
      await expect(aside.getByText(/Tra nhanh 5 giây/)).toBeVisible();

      // Bật chế độ Ẩn dịch trên Desktop
      await aside.getByRole("button", { name: /Chế độ Ẩn dịch/ }).click();
    }

    // Kiểm tra Active Recall: bản dịch ví dụ ẩn sau nút Chạm để xem nghĩa
    const revealViBtn = page
      .getByRole("button", { name: /Chạm để xem nghĩa tiếng Việt/ })
      .first();
    await expect(revealViBtn).toBeVisible();
    await revealViBtn.click();

    // Làm bài tập đầu tiên (Keycap A/B/C/D) và xác nhận lưu vào localStorage qua reload
    const firstRadio = page.getByRole("radio").first();
    await firstRadio.click();
    await page.getByRole("button", { name: "Kiểm tra đáp án" }).first().click();

    await expect(page.getByText("Giải thích từng bước").first()).toBeVisible();
    await page.reload();

    // Sau khi F5, tiến độ làm câu 1 và Chế độ Ẩn dịch vẫn được giữ nguyên
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByText("Giải thích từng bước").first()).toBeVisible();
    await expect(
      page.getByText(/Chế độ Ẩn dịch đang bật/)
    ).toBeVisible();
    await assertNoHorizontalOverflow(page, "/learn/tenses (after reload)");

    // Kiểm tra gạch chân / đánh dấu từ khóa + nhiều ví dụ + bài tập điền từ trong /learn/word_form
    await page.goto("/learn/word_form");
    await expect(
      page.locator("mark", { hasText: "The recent expansion" })
    ).toBeVisible();
    await expect(
      page.locator("mark", { hasText: "The cancellation clause" })
    ).toBeVisible();
    await expect(
      page.locator("mark", { hasText: "Each employee" })
    ).toBeVisible();
    await expect(
      page.locator("mark", { hasText: "her outstanding performance" })
    ).toBeVisible();

    // Mỗi học phần đều có >= 3 câu luyện tập thực hành (MCQ + Điền từ)
    expect(await page.getByText(/Câu \d{2} ·/).count()).toBeGreaterThanOrEqual(
      3
    );

    // Thực hành câu Điền từ (AGREE -> agreement) và kiểm tra lưu localStorage qua F5
    const fillForm = page
      .locator("form")
      .filter({ has: page.getByText("AGREE", { exact: true }) });
    await fillForm.getByRole("textbox").fill("agreement");
    await fillForm.getByRole("button", { name: "Kiểm tra đáp án" }).click();

    await expect(page.getByText("[✓] Chính xác").first()).toBeVisible();
    await expect(page.getByText("Đáp án chuẩn: agreement.")).toBeVisible();
    await page.reload();

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByText("[✓] Chính xác").first()).toBeVisible();
    await expect(page.getByText("Đáp án chuẩn: agreement.")).toBeVisible();
    await assertNoHorizontalOverflow(page, "/learn/word_form (after fill_blank reload)");

    // Kiểm tra thêm ví dụ & gạch chân trong Phối hợp thì (/learn/tenses?part=4)
    await page.goto("/learn/tenses?part=4");
    await expect(
      page.locator("mark", { hasText: "has worked" })
    ).toBeVisible();

    // Kiểm tra deep link ?part=2 mở thẳng Học phần 2
    await page.goto("/learn/word_form?part=2");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("Từ loại");
    await expect(
      page.locator("mark", { hasText: "comprehensive training" })
    ).toBeVisible();
    await assertNoHorizontalOverflow(page, "/learn/word_form?part=2");

    expect(pageErrors).toEqual([]);
  });
});
