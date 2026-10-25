import { describe, it, expect } from "vitest";
import {
  calculateWilsonLower,
  calculateMasteryPercentage,
  getMasteryLabel,
  getMasteryBadgeInfo,
} from "./wilson";

describe("Wilson Lower Bound Algorithm (Appendix A - Standard Test Data)", () => {
  // Bảng chuẩn từ docs/A-test-data.md:
  // 2 / 2   -> 34.2 (Chưa đủ dữ liệu - dưới 5 lượt)
  // 8 / 10  -> 49.0 (Cần ôn)
  // 6 / 10  -> 31.3 (Cần ôn)
  // 5 / 8   -> 30.6 (Cần ôn)
  // 9 / 12  -> 46.8 (Cần ôn)
  // 8 / 9   -> 56.5 (Khá)
  // 12 / 14 -> 60.1 (Khá)
  // 18 / 20 -> 69.9 (Khá)

  const APPENDIX_A_TEST_CASES = [
    { correct: 2, total: 2, expectedPct: 34.2, expectedLabel: "insufficient" },
    { correct: 8, total: 10, expectedPct: 49.0, expectedLabel: "needs_review" },
    { correct: 6, total: 10, expectedPct: 31.3, expectedLabel: "needs_review" },
    { correct: 5, total: 8, expectedPct: 30.6, expectedLabel: "needs_review" },
    { correct: 9, total: 12, expectedPct: 46.8, expectedLabel: "needs_review" },
    { correct: 8, total: 9, expectedPct: 56.5, expectedLabel: "proficient" },
    { correct: 12, total: 14, expectedPct: 60.1, expectedLabel: "proficient" },
    { correct: 18, total: 20, expectedPct: 69.9, expectedLabel: "proficient" },
  ];

  APPENDIX_A_TEST_CASES.forEach(({ correct, total, expectedPct, expectedLabel }) => {
    it(`khớp chính xác giá trị Phụ lục A với ${correct}/${total} -> ${expectedPct}% [${expectedLabel}]`, () => {
      const pct = calculateMasteryPercentage(correct, total);
      expect(pct).toBe(expectedPct);

      const label = getMasteryLabel(total, pct);
      expect(label).toBe(expectedLabel);
    });
  });

  it("nhận diện chuẩn xác nhãn 'Vững' (mastered) khi mastery >= 75 và total >= 5", () => {
    // 25/25 -> p=1, n=25
    const pct = calculateMasteryPercentage(25, 25);
    expect(pct).toBeGreaterThanOrEqual(75);

    const label = getMasteryLabel(25, pct);
    expect(label).toBe("mastered");

    const badge = getMasteryBadgeInfo(25, pct);
    expect(badge.labelVi).toBe("Vững");
    expect(badge.badgeClass).toContain("bg-[#ECFDF5]");
  });

  it("xử lý an toàn các trường hợp biên (Edge cases)", () => {
    expect(calculateMasteryPercentage(0, 0)).toBe(0);
    expect(calculateMasteryPercentage(0, 10)).toBe(0);
    expect(calculateWilsonLower(-1, 5)).toBe(0);
    expect(calculateWilsonLower(5, -1)).toBe(0);

    const zeroLabel = getMasteryLabel(0, 0);
    expect(zeroLabel).toBe("insufficient");
  });
});
