import { describe, it, expect } from "vitest";
import {
  formatExamTime,
  getExamTimerColorClass,
  calculateTimeSpentSeconds,
  ETS_READING_DURATION_MINUTES,
  ETS_READING_TOTAL_SECONDS,
} from "./examTimer";

describe("Core Exam Timer Utilities", () => {
  it("khởi tạo đúng các hằng số ETS Reading 75 phút", () => {
    expect(ETS_READING_DURATION_MINUTES).toBe(75);
    expect(ETS_READING_TOTAL_SECONDS).toBe(4500);
  });

  describe("formatExamTime", () => {
    it("format đúng 75 phút ban đầu (4500s -> 75:00)", () => {
      expect(formatExamTime(4500)).toBe("75:00");
    });

    it("format đúng các mốc thời gian lẻ", () => {
      expect(formatExamTime(595)).toBe("09:55");
      expect(formatExamTime(65)).toBe("01:05");
      expect(formatExamTime(9)).toBe("00:09");
      expect(formatExamTime(0)).toBe("00:00");
    });

    it("xử lý an toàn số âm hoặc số thập phân", () => {
      expect(formatExamTime(-10)).toBe("00:00");
      expect(formatExamTime(59.9)).toBe("00:59");
    });
  });

  describe("getExamTimerColorClass", () => {
    it("trả về màu bình thường khi thời gian >= 10 phút (>= 600s)", () => {
      const cls = getExamTimerColorClass(600);
      expect(cls).toContain("text-[#0F172A]");
      expect(cls).not.toContain("animate-pulse");

      const cls4500 = getExamTimerColorClass(4500);
      expect(cls4500).toContain("text-[#0F172A]");
    });

    it("trả về màu vàng cam cảnh báo khi thời gian < 10 phút và >= 5 phút (300s <= t < 600s)", () => {
      const cls599 = getExamTimerColorClass(599);
      expect(cls599).toContain("text-[#B45309]");
      expect(cls599).not.toContain("animate-pulse");

      const cls300 = getExamTimerColorClass(300);
      expect(cls300).toContain("text-[#B45309]");
    });

    it("trả về màu đỏ nguy hiểm và animate-pulse khi thời gian < 5 phút (< 300s)", () => {
      const cls299 = getExamTimerColorClass(299);
      expect(cls299).toContain("text-[#BE123C]");
      expect(cls299).toContain("animate-pulse");

      const cls0 = getExamTimerColorClass(0);
      expect(cls0).toContain("text-[#BE123C]");
      expect(cls0).toContain("animate-pulse");
    });
  });

  describe("calculateTimeSpentSeconds", () => {
    it("tính chính xác số giây đã làm", () => {
      // 75 phút, còn 4000s -> đã làm 500s
      expect(calculateTimeSpentSeconds(75, 4000)).toBe(500);
      // Hết giờ -> đã làm trọn 4500s
      expect(calculateTimeSpentSeconds(75, 0)).toBe(4500);
      // Vừa bắt đầu -> đã làm 0s
      expect(calculateTimeSpentSeconds(75, 4500)).toBe(0);
    });

    it("chặn số âm", () => {
      expect(calculateTimeSpentSeconds(75, 5000)).toBe(0);
    });
  });
});
