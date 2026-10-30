import { test, expect } from "@playwright/test";

test.describe("Full Reading Test Simulation (Part 5 + 6 + 7): 100 câu / 75 phút / Thang 5-495", () => {
  test("Bảo mật phân quyền: Chưa đăng nhập khi truy cập /exam phải chuyển hướng sang /login kèm param next=%2Fexam", async ({
    page,
  }) => {
    // 1. Vào trang danh sách đề thi /exam khi chưa đăng nhập
    await page.goto("/exam");

    // 2. Middleware chuyển hướng an toàn sang /login?next=%2Fexam
    await expect(page).toHaveURL(/\/login\?next=%2Fexam/);
    await expect(page.locator("h1")).toContainText("Tôi Em Íc");

    // 3. Hiển thị form đăng nhập đầy đủ
    await expect(page.getByRole("tab", { name: "Đăng nhập" })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("Bảo mật phân quyền: Chưa đăng nhập khi truy cập chi tiết đề /exam/[slug] phải chuyển hướng sang /login", async ({
    page,
  }) => {
    await page.goto("/exam/ets-2024-full-test-1");
    await expect(page).toHaveURL(/\/login\?next=%2Fexam%2Fets-2024-full-test-1/);
    await expect(page.locator("h1")).toContainText("Tôi Em Íc");
  });
});

