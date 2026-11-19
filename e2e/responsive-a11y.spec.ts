import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PUBLIC_AUDIT_ROUTES = [
  { name: "Login", path: "/login" },
  { name: "Reset Password", path: "/reset-password" },
  { name: "Terms of Service", path: "/terms" },
  { name: "Privacy Policy", path: "/privacy" },
] as const;

test.describe("M12 E2E: Responsive Breakpoints & Accessibility (D-05, D-21, a11y)", () => {
  test("Desktop 1280px: Card đăng nhập hiển thị cân đối, không có thanh cuộn ngang", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/login");

    // Kiểm tra không bị tràn ngang màn hình
    const isHorizontalScrollable = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
      );
    });
    expect(isHorizontalScrollable).toBe(false);

    // Card đăng nhập có độ rộng tối đa chuẩn (max-w-md)
    const card = page.locator(".w-full.max-w-md");
    await expect(card).toBeVisible();
    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(448); // max-w-md là 28rem = 448px
    }
  });

  test("Mobile 360px (D-05): Đạt chuẩn vùng chạm (Tap target >= 44px) và không tràn màn hình", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/login");

    // 1. Kiểm tra không bị tràn ngang ở màn hình 360px
    const isHorizontalScrollable = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
      );
    });
    expect(isHorizontalScrollable).toBe(false);

    // 2. Kiểm tra chiều cao vùng chạm của các nút chuyển tab (role=tab) >= 44px
    const loginTab = page.getByRole("tab", { name: "Đăng nhập" });
    const signupTab = page.getByRole("tab", { name: "Đăng ký" });

    const loginBox = await loginTab.boundingBox();
    const signupBox = await signupTab.boundingBox();

    expect(loginBox).not.toBeNull();
    expect(signupBox).not.toBeNull();
    if (loginBox) expect(loginBox.height).toBeGreaterThanOrEqual(44);
    if (signupBox) expect(signupBox.height).toBeGreaterThanOrEqual(44);

    // 3. Kiểm tra nút Submit chính Primary button >= 44px (chuẩn thiết kế D-06)
    const submitBtn = page.getByRole("button", {
      name: "Đăng nhập",
      exact: true,
    });
    const submitBox = await submitBtn.boundingBox();
    expect(submitBox).not.toBeNull();
    if (submitBox) expect(submitBox.height).toBeGreaterThanOrEqual(44);
  });

  test("Bàn phím (Keyboard Navigation): Di chuyển tuần tự qua Tab key", async ({
    page,
  }) => {
    await page.goto("/login");

    // 1. Focus vào ô email
    const emailInput = page.locator('input[type="email"]');
    await emailInput.focus();
    await expect(emailInput).toBeFocused();

    // 2. Nhấn Tab sang password
    await page.keyboard.press("Tab");
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toBeFocused();

    // 3. Nhấn Tab sang nút toggle mật khẩu
    await page.keyboard.press("Tab");
    const toggleEye = page.locator('button[aria-label="Hiện mật khẩu"]');
    await expect(toggleEye).toBeFocused();

    // 4. Nhấn Tab qua nút "Quên mật khẩu?"
    await page.keyboard.press("Tab");
    const forgotBtn = page.getByRole("button", {
      name: "Quên mật khẩu?",
      exact: true,
    });
    await expect(forgotBtn).toBeFocused();

    // 5. Nhấn Tab sang nút Submit Đăng nhập
    await page.keyboard.press("Tab");
    const submitBtn = page.getByRole("button", {
      name: "Đăng nhập",
      exact: true,
    });
    await expect(submitBtn).toBeFocused();
  });

  for (const viewport of [
    { label: "Mobile 360px", width: 360, height: 740 },
    { label: "Desktop 1280px", width: 1280, height: 800 },
  ]) {
    for (const route of PUBLIC_AUDIT_ROUTES) {
      test(`WCAG 2.1 AA (${viewport.label}): ${route.name} (${route.path}) không có vi phạm axe và không tràn ngang`, async ({
        page,
      }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await page.goto(route.path);
        await page.waitForLoadState("networkidle");

        const isHorizontalScrollable = await page.evaluate(() => {
          return (
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth
          );
        });
        expect(isHorizontalScrollable).toBe(false);

        const axeResults = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();

        expect(axeResults.violations).toEqual([]);
      });
    }
  }
});
