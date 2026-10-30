import { test, expect } from "@playwright/test";

test.describe("M12 E2E: Rà soát Bất Biến & An Ninh Hệ Thống (Invariants & Security Audit)", () => {
  test("Bất biến AGENTS.md: Màn hình Đăng nhập chỉ có duy nhất 1 nút Primary", async ({
    page,
  }) => {
    await page.goto("/login");

    // Lấy tất cả các nút có style primary hoặc vai trò submit primary
    const primaryButtons = page.locator("button.bg-\\[\\#2563EB\\], button.bg-primary");
    const count = await primaryButtons.count();

    // Mỗi màn hình chỉ có duy nhất 1 nút Primary để tránh xung đột nhận thức
    expect(count).toBeLessThanOrEqual(1);
  });

  test("An toàn thông tin: Không để lộ token hay secret trên thuộc tính DOM", async ({
    page,
  }) => {
    await page.goto("/login");

    const pageContent = await page.content();

    // Không bao giờ chứa service_role key trên DOM client
    expect(pageContent).not.toContain("service_role");
    expect(pageContent).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  test("Tuân thủ Typography & Phông chữ: Body áp dụng font sans hoặc Be Vietnam Pro", async ({
    page,
  }) => {
    await page.goto("/login");

    const fontFamily = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });

    // Không được để font mặc định Times New Roman hoặc font lạ
    expect(fontFamily.toLowerCase()).toMatch(/be vietnam pro|sans-serif|system-ui/);
  });
});
