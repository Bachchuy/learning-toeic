import { describe, it, expect } from "vitest";
import {
  estimateListeningScore,
  estimateReadingScore,
  estimateTotalScore,
  calculateListeningScore,
  calculateReadingScore,
  calculateTotalScore,
} from "./toeicScoring";

describe("TOEIC Estimated Reference Scoring Core Module", () => {
  describe("1. Thang điểm biên tối thiểu và tối đa", () => {
    it("quy đổi điểm tối thiểu (0 câu đúng) thành 5 điểm cho từng kỹ năng và 10 điểm tổng", () => {
      expect(estimateListeningScore(0)).toBe(5);
      expect(estimateReadingScore(0)).toBe(5);
      const total = estimateTotalScore(0, 0);
      expect(total.listeningScore).toBe(5);
      expect(total.readingScore).toBe(5);
      expect(total.totalScore).toBe(10);
    });

    it("quy đổi điểm tối đa (100 câu đúng) thành 495 điểm cho từng kỹ năng và 990 điểm tổng", () => {
      expect(estimateListeningScore(100)).toBe(495);
      expect(estimateReadingScore(100)).toBe(495);
      const total = estimateTotalScore(100, 100);
      expect(total.listeningScore).toBe(495);
      expect(total.readingScore).toBe(495);
      expect(total.totalScore).toBe(990);
    });
  });

  describe("2. Xử lý các giá trị biên và đầu vào bất thường", () => {
    it("kẹp an toàn các giá trị âm về mức sàn 5 điểm", () => {
      expect(estimateListeningScore(-1)).toBe(5);
      expect(estimateListeningScore(-100)).toBe(5);
      expect(estimateReadingScore(-5)).toBe(5);
      expect(estimateReadingScore(-999)).toBe(5);
    });

    it("kẹp an toàn các giá trị vượt quá 100 về mức trần 495 điểm", () => {
      expect(estimateListeningScore(101)).toBe(495);
      expect(estimateListeningScore(250)).toBe(495);
      expect(estimateReadingScore(105)).toBe(495);
      expect(estimateReadingScore(1000)).toBe(495);
    });

    it("xử lý an toàn khi đầu vào là NaN, null hoặc float không nguyên", () => {
      // NaN hoặc type không hợp lệ trả về sàn 5 điểm
      expect(estimateListeningScore(NaN)).toBe(5);
      expect(estimateReadingScore(NaN)).toBe(5);

      // Float được làm tròn toán học
      expect(estimateListeningScore(70.2)).toBe(estimateListeningScore(70));
      expect(estimateListeningScore(70.8)).toBe(estimateListeningScore(71));
      expect(estimateReadingScore(45.4)).toBe(estimateReadingScore(45));
    });
  });

  describe("3. Tính chất chuẩn hóa của điểm thi TOEIC", () => {
    it("đảm bảo mọi điểm quy đổi đều là bội số của 5", () => {
      for (let raw = 0; raw <= 100; raw++) {
        const lScore = estimateListeningScore(raw);
        const rScore = estimateReadingScore(raw);
        expect(lScore % 5).toBe(0);
        expect(rScore % 5).toBe(0);
        expect(lScore).toBeGreaterThanOrEqual(5);
        expect(lScore).toBeLessThanOrEqual(495);
        expect(rScore).toBeGreaterThanOrEqual(5);
        expect(rScore).toBeLessThanOrEqual(495);
      }
    });

    it("đảm bảo tính đơn điệu không giảm (Monotonic Non-Decreasing): số câu đúng tăng thì điểm không giảm", () => {
      for (let raw = 0; raw < 100; raw++) {
        expect(estimateListeningScore(raw + 1)).toBeGreaterThanOrEqual(
          estimateListeningScore(raw)
        );
        expect(estimateReadingScore(raw + 1)).toBeGreaterThanOrEqual(
          estimateReadingScore(raw)
        );
      }
    });
  });

  describe("4. Tính tương thích ngược với các tên hàm cũ", () => {
    it("hỗ trợ hoàn toàn các alias calculateListeningScore, calculateReadingScore, calculateTotalScore", () => {
      expect(calculateListeningScore(70)).toBe(estimateListeningScore(70));
      expect(calculateReadingScore(70)).toBe(estimateReadingScore(70));
      const calcTotal = calculateTotalScore(70, 70);
      const estTotal = estimateTotalScore(70, 70);
      expect(calcTotal).toEqual(estTotal);
    });
  });
});
