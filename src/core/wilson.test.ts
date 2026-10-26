import { describe, it, expect } from "vitest";
import {
  calculateWilsonLower,
  calculateMasteryPercentage,
  getMasteryLabel,
  getMasteryBadgeInfo,
  calculateAdaptiveMastery,
} from "./wilson";

describe("Adaptive Rolling Mastery (ARM) Algorithm - Decision D-25", () => {
  describe("1. Độ vững với z = 1.0 (Chuẩn Đo Lường Giáo Dục & Sư Phạm)", () => {
    it("giải quyết triệt để bất cập: 4/5 câu đúng (80%) được đánh giá xứng đáng Khá chắc (57.9%)", () => {
      const pct = calculateMasteryPercentage(4, 5);
      expect(pct).toBe(57.9);

      const label = getMasteryLabel(5, pct);
      expect(label).toBe("proficient");

      const badge = getMasteryBadgeInfo(5, pct);
      expect(badge.labelVi).toBe("Khá chắc");
      expect(badge.badgeClass).toContain("bg-[#FFFBEB]");
    });

    it("đánh giá 8/10 câu đúng (80%) đạt 64.9% (Khá chắc, không còn bị dán nhãn Cần ôn)", () => {
      const pct = calculateMasteryPercentage(8, 10);
      expect(pct).toBe(64.9);

      const label = getMasteryLabel(10, pct);
      expect(label).toBe("proficient");
    });

    it("nhận diện chuẩn xác phong độ yếu: 6/10 câu (60%) đạt 44.3% -> Cần củng cố", () => {
      const pct = calculateMasteryPercentage(6, 10);
      expect(pct).toBe(44.3);

      const label = getMasteryLabel(10, pct);
      expect(label).toBe("needs_review");

      const badge = getMasteryBadgeInfo(10, pct);
      expect(badge.labelVi).toBe("Cần củng cố");
      expect(badge.badgeClass).toContain("bg-[#FFF1F2]");
    });

    it("đạt Thành thạo khi duy trì phong độ giỏi: 17/20 câu (85%) đạt 75.4%", () => {
      const pct = calculateMasteryPercentage(17, 20);
      expect(pct).toBe(75.4);
      expect(pct).toBeGreaterThanOrEqual(75);

      const label = getMasteryLabel(20, pct);
      expect(label).toBe("mastered");

      const badge = getMasteryBadgeInfo(20, pct);
      expect(badge.labelVi).toBe("Thành thạo");
      expect(badge.badgeClass).toContain("bg-[#ECFDF5]");
    });

    it("phong độ xuất sắc 18/20 câu (90%) đạt 81.3% Thành thạo vững vàng", () => {
      const pct = calculateMasteryPercentage(18, 20);
      expect(pct).toBe(81.3);

      const label = getMasteryLabel(20, pct);
      expect(label).toBe("mastered");
    });
  });

  describe("2. Cơ chế Fast-Track cho học viên xuất sắc (D-25 Tầng 2)", () => {
    it("thăng hạng Thành thạo ngay khi làm đúng 8/8 câu liên tiếp", () => {
      const pct = calculateMasteryPercentage(8, 8);
      expect(pct).toBe(88.9);

      const label = getMasteryLabel(8, pct, 8 / 8);
      expect(label).toBe("mastered");
    });

    it("thăng hạng Thành thạo khi làm đúng 9/10 câu (90%)", () => {
      const pct = calculateMasteryPercentage(9, 10);
      expect(pct).toBe(76.6);

      const label = getMasteryLabel(10, pct, 9 / 10);
      expect(label).toBe("mastered");
    });
  });

  describe("3. Cổng tin cậy khởi động (Tầng 1: n < 5)", () => {
    it("dưới 5 câu luôn ở trạng thái 'Đang khởi động' (insufficient), không phán xét", () => {
      expect(getMasteryLabel(0, 0)).toBe("insufficient");
      expect(getMasteryLabel(2, 66.7)).toBe("insufficient");
      expect(getMasteryLabel(4, 57.9)).toBe("insufficient");

      const badge = getMasteryBadgeInfo(3, 50.0);
      expect(badge.labelVi).toBe("Đang khởi động");
      expect(badge.badgeClass).toContain("bg-[#F1F5F9]");
    });
  });

  describe("4. Thuật toán calculateAdaptiveMastery với Cửa sổ trượt 20 câu", () => {
    it("xóa bỏ hình phạt quá khứ: 5 câu sai lúc mới học bị loại bỏ khi có 20 câu mới giỏi", () => {
      // 5 câu sai lúc đầu
      const pastAttempts = Array.from({ length: 5 }, () => ({ is_correct: false }));
      // 20 câu đúng gần nhất
      const recentAttempts = Array.from({ length: 20 }, () => ({ is_correct: true }));

      const allAttempts = [...pastAttempts, ...recentAttempts]; // Tổng 25 câu

      const result = calculateAdaptiveMastery(allAttempts, 20);

      expect(result.windowTotal).toBe(20);
      expect(result.windowCorrect).toBe(20);
      expect(result.accuracy).toBe(100);
      expect(result.label).toBe("mastered");
      expect(result.score).toBeGreaterThan(90);
    });

    it("xử lý an toàn khi mảng attempts rỗng", () => {
      const result = calculateAdaptiveMastery([]);
      expect(result.score).toBe(0);
      expect(result.label).toBe("insufficient");
      expect(result.windowTotal).toBe(0);
    });
  });

  describe("5. Edge Cases & Khả năng tương thích ngược", () => {
    it("xử lý an toàn các giá trị biên âm hoặc 0", () => {
      expect(calculateMasteryPercentage(0, 0)).toBe(0);
      expect(calculateMasteryPercentage(0, 10)).toBe(0);
      expect(calculateWilsonLower(-1, 5)).toBe(0);
      expect(calculateWilsonLower(5, -1)).toBe(0);
    });

    it("vẫn hỗ trợ truyền z tùy chỉnh nếu cần kiểm chứng z=1.96", () => {
      const pctOld = calculateMasteryPercentage(8, 10, 1.96, 0);
      expect(pctOld).toBe(49.0); // Khớp chuẩn thống kê y tế cũ
    });
  });
});
