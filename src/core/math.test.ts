import { describe, it, expect } from "vitest";
import { calculateAccuracy } from "./math";

describe("calculateAccuracy", () => {
  it("trả về 0 khi tổng số câu hỏi bằng 0", () => {
    expect(calculateAccuracy(0, 0)).toBe(0);
  });

  it("tính chính xác tỷ lệ phần trăm làm tròn", () => {
    expect(calculateAccuracy(5, 10)).toBe(50);
    expect(calculateAccuracy(1, 3)).toBe(33);
    expect(calculateAccuracy(2, 3)).toBe(67);
  });

  it("trả về 100 khi số câu đúng bằng hoặc vượt tổng số", () => {
    expect(calculateAccuracy(10, 10)).toBe(100);
    expect(calculateAccuracy(11, 10)).toBe(100);
  });

  it("trả về 0 khi số câu đúng là số âm", () => {
    expect(calculateAccuracy(-1, 10)).toBe(0);
  });
});
