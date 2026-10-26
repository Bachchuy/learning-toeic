import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Milestone M12: Accessibility (WCAG 2.1 AA) & Keyboard Audit", () => {
  const srcDir = path.resolve(process.cwd(), "src");

  describe("1. Phím tắt thao tác (Keyboard Navigation & Productivity)", () => {
    it("màn hình làm bài (Practice Screen) hỗ trợ phím A, B, C, D chọn đáp án và Enter để nộp", () => {
      const practiceRunnerPath = path.join(srcDir, "features/practice/components/practice-runner.tsx");
      const content = fs.readFileSync(practiceRunnerPath, "utf-8");

      expect(content).toContain("handleKeyDown");
      expect(content).toContain('"a"');
      expect(content).toContain('"b"');
      expect(content).toContain('"c"');
      expect(content).toContain('"d"');
      expect(content).toContain('"Enter"');
    });

    it("màn hình ôn tập FSRS (Review Screen) hỗ trợ phím Space lật thẻ và phím 1-4 chấm thẻ", () => {
      const reviewViewPath = path.join(srcDir, "features/review/components/review-view.tsx");
      const flashcardPath = path.join(srcDir, "features/review/components/flashcard-mode-card.tsx");
      const content =
        fs.readFileSync(reviewViewPath, "utf-8") +
        (fs.existsSync(flashcardPath) ? fs.readFileSync(flashcardPath, "utf-8") : "");

      expect(content).toContain('"Space"');
      expect(content).toContain('"1"');
      expect(content).toContain('"2"');
      expect(content).toContain('"3"');
      expect(content).toContain('"4"');
    });

    it("màn hình kiểm duyệt Admin (/admin/review) hỗ trợ phím J/K di chuyển, Y duyệt, N từ chối, E sửa", () => {
      const adminViewPath = path.join(srcDir, "features/admin/components/admin-review-view.tsx");
      const content = fs.readFileSync(adminViewPath, "utf-8");

      expect(content).toContain('"y"');
      expect(content).toContain('"n"');
      expect(content).toContain('"j"');
      expect(content).toContain('"k"');
      expect(content).toContain('"e"');
      // Bắt buộc vô hiệu hóa phím tắt khi người dùng đang nhập văn bản trong modal/input
      expect(content).toContain("isEditModalOpen");
      expect(content).toContain("target.tagName === \"INPUT\"");
    });
  });

  describe("2. Khả năng tiếp cận Form & Input (WCAG 2.1 Labeling & Contrast)", () => {
    it("đảm bảo component Input bắt buộc có thuộc tính label và liên kết id/htmlFor", () => {
      const inputComponentPath = path.join(srcDir, "components/ui/input.tsx");
      const content = fs.readFileSync(inputComponentPath, "utf-8");

      // Label bắt buộc
      expect(content).toContain("label: string");
      // Có liên kết htmlFor và id
      expect(content).toContain("htmlFor={inputId}");
      expect(content).toContain("id={inputId}");
      // Có màu viền chuẩn theo Design Token: #8190A6 (border.input)
      expect(content).toContain("#8190A6");
    });
  });

  describe("3. Vùng thông báo động (Screen Reader Announcements via aria-live)", () => {
    it("đảm bảo phần giải thích thích ứng (Explanation) có aria-live='polite' cho trình đọc màn hình", () => {
      const expComponentPath = path.join(srcDir, "features/practice/components/adaptive-explanation.tsx");
      const content = fs.readFileSync(expComponentPath, "utf-8");

      expect(content).toContain('aria-live="polite"');
    });
  });

  describe("4. Chuẩn kích thước vùng chạm (Touch Target Size >= 44px / 48px)", () => {
    it("đảm bảo Button component có kích thước chuẩn 48px cho nút primary và 44px cho nút phụ", () => {
      const buttonPath = path.join(srcDir, "components/ui/button.tsx");
      const content = fs.readFileSync(buttonPath, "utf-8");

      // Kích thước chuẩn
      expect(content).toContain("h-12"); // 48px (Primary tap target)
      expect(content).toContain("h-11"); // 44px (Secondary / standard tap target)
    });
  });

  describe("5. Bất biến giao diện: Không màu ngoài bảng Design Tokens", () => {
    it("đảm bảo các file trong src/components/ không sử dụng mã hex màu tùy tiện", () => {
      const allowedHex = [
        "#2563EB", // color.primary.default
        "#1D4ED8", // color.primary.hover
        "#EFF6FF", // color.primary.subtle
        "#0F172A", // color.secondary.default
        "#F8FAFC", // color.bg.page
        "#FFFFFF", // color.bg.surface
        "#F1F5F9", // color.bg.muted
        "#475569", // color.text.secondary
        "#E2E8F0", // color.border.default
        "#8190A6", // color.border.input
        "#047857", // status.success text
        "#ECFDF5", // status.success bg
        "#A7F3D0", // status.success border
        "#BE123C", // status.error text
        "#FFF1F2", // status.error bg
        "#FECDD3", // status.error border
        "#FFE4E6", // status.error hover bg
        "#B45309", // status.warning text
        "#FFFBEB", // status.warning bg
        "#FDE68A", // status.warning border
        "#F59E0B", // bar progress proficient
        "#4338CA", // status.info text
        "#EEF2FF", // status.info bg
        "#C7D2FE", // status.info border
        "#CBD5E1", // bar progress insufficient
        "#065F46", // hover success button
      ].map((h) => h.toLowerCase());

      const uiDir = path.join(srcDir, "components/ui");
      const files = fs.readdirSync(uiDir).filter((f) => f.endsWith(".tsx"));

      for (const file of files) {
        const content = fs.readFileSync(path.join(uiDir, file), "utf-8");
        const hexMatches = Array.from(content.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g));
        for (const match of hexMatches) {
          const hex = match[0].toLowerCase();
          // Nếu có 3 chữ số, expand thành 6 chữ số
          const normalized = hex.length === 4
            ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
            : hex;
          expect(
            allowedHex.includes(normalized),
            `Phát hiện màu ngoài token: ${hex} trong file src/components/ui/${file}`
          ).toBe(true);
        }
      }
    });
  });
});
