import { test, expect } from "@playwright/test";

test.describe("M12 E2E: Xác thực & Điều hướng bảo vệ (Auth & Protected Routes)", () => {
  test("Chưa đăng nhập khi truy cập route bảo vệ (/) phải chuyển hướng sang /login kèm param next", async ({
    page,
  }) => {
    // 1. Truy cập trang chủ /
    await page.goto("/");

    // 2. Kiểm tra middleware chuyển hướng sang /login?next=%2F
    await expect(page).toHaveURL(/\/login\?next=%2F/);

    // 3. Kiểm tra tiêu đề và brand header
    await expect(page.locator("h1")).toContainText("Tôi Em Íc");

    // 4. Kiểm tra sự hiện diện của 2 tabs chuyển đổi Đăng nhập / Đăng ký
    const loginTab = page.getByRole("tab", { name: "Đăng nhập" });
    const signupTab = page.getByRole("tab", { name: "Đăng ký" });

    await expect(loginTab).toBeVisible();
    await expect(signupTab).toBeVisible();
    await expect(loginTab).toHaveAttribute("aria-selected", "true");
  });

  test("Chuyển đổi linh hoạt giữa tab Đăng nhập và Đăng ký", async ({ page }) => {
    await page.goto("/login");

    const loginTab = page.getByRole("tab", { name: "Đăng nhập" });
    const signupTab = page.getByRole("tab", { name: "Đăng ký" });

    // Bấm sang tab Đăng ký
    await signupTab.click();
    await expect(signupTab).toHaveAttribute("aria-selected", "true");
    await expect(loginTab).toHaveAttribute("aria-selected", "false");
    await expect(page.locator("text=Tạo tài khoản mới")).toBeVisible();

    // Bấm quay lại tab Đăng nhập
    await loginTab.click();
    await expect(loginTab).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("text=Chào mừng bạn trở lại")).toBeVisible();
  });

  test("Kiểm tra form validation và thông báo lỗi khi thông tin không hợp lệ", async ({ page }) => {
    await page.goto("/login");

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitBtn = page.getByRole("button", { name: "Đăng nhập", exact: true });

    // Kiểm tra các trường bắt buộc
    await expect(emailInput).toHaveAttribute("required", "");
    await expect(passwordInput).toHaveAttribute("required", "");

    // Thử nhập email không tồn tại hoặc sai mật khẩu
    await emailInput.fill("nonexistent_user_test@example.com");
    await passwordInput.fill("wrongpassword123");
    await submitBtn.click();

    // Form sẽ xử lý và hiển thị thông báo lỗi
    // Có thể gặp lỗi mạng hoặc lỗi Supabase invalid credentials
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible({ timeout: 10000 });
  });

  test("Kiểm tra khả năng hiển thị nút ẩn/hiện mật khẩu", async ({ page }) => {
    await page.goto("/login");

    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill("MySecurePassword123!");

    // Mặc định type là password
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Bấm nút toggle hiện mật khẩu
    const toggleBtn = page.locator('button[aria-label="Hiện mật khẩu"]');
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();

    // Type chuyển sang text
    await expect(passwordInput).toHaveAttribute("type", "text");
  });
});
