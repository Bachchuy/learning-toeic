import { describe, it, expect } from "vitest";
import {
  calculateLevenshteinDistance,
  evaluateSpellingInput,
  generateHintDisplay,
  generateQuizOptions,
} from "./reviewQuiz";

describe("reviewQuiz: Versatile Multi-Mode Review Utilities", () => {
  describe("calculateLevenshteinDistance", () => {
    it("should return 0 for identical strings", () => {
      expect(calculateLevenshteinDistance("speaker", "speaker")).toBe(0);
      expect(calculateLevenshteinDistance("SPEAKER", "speaker")).toBe(0);
    });

    it("should return 1 for a single typo substitution or deletion", () => {
      expect(calculateLevenshteinDistance("speeker", "speaker")).toBe(1);
      expect(calculateLevenshteinDistance("speake", "speaker")).toBe(1);
      expect(calculateLevenshteinDistance("speakers", "speaker")).toBe(1);
    });

    it("should handle multi-character differences", () => {
      expect(calculateLevenshteinDistance("parent", "child")).toBe(6);
    });
  });

  describe("evaluateSpellingInput", () => {
    it("should recognize exact match regardless of case and trimming", () => {
      const res = evaluateSpellingInput("  SPEAKER  ", "speaker");
      expect(res.isExact).toBe(true);
      expect(res.isClose).toBe(false);
      expect(res.distance).toBe(0);
    });

    it("should recognize 1-typo as close match for words with 4+ chars", () => {
      const res = evaluateSpellingInput("speeker", "speaker");
      expect(res.isExact).toBe(false);
      expect(res.isClose).toBe(true);
      expect(res.distance).toBe(1);
    });

    it("should not consider completely wrong answers as close", () => {
      const res = evaluateSpellingInput("listen", "speaker");
      expect(res.isExact).toBe(false);
      expect(res.isClose).toBe(false);
      expect(res.distance).toBeGreaterThan(1);
    });

    it("should handle empty inputs gracefully", () => {
      const res = evaluateSpellingInput("", "speaker");
      expect(res.isExact).toBe(false);
      expect(res.isClose).toBe(false);
    });
  });

  describe("generateHintDisplay", () => {
    it("level 0 should mask all letters with asterisks preserving spaces", () => {
      expect(generateHintDisplay("speaker", 0)).toBe("*******");
      expect(generateHintDisplay("key note", 0)).toBe("*** ****");
    });

    it("level 1 should reveal the first letter", () => {
      expect(generateHintDisplay("speaker", 1)).toBe("s******");
    });

    it("level 2 should reveal first and last letter", () => {
      expect(generateHintDisplay("speaker", 2)).toBe("s*****r");
    });

    it("level 3 should reveal middle letter as well", () => {
      expect(generateHintDisplay("speaker", 3)).toBe("s**a**r");
    });

    it("should reveal first letter of each word in multi-word phrases for level 1+", () => {
      expect(generateHintDisplay("key note", 1)).toBe("k** n***");
      expect(generateHintDisplay("come up with", 1)).toBe("c*** u* w***");
    });
  });

  describe("generateQuizOptions", () => {
    const cards = [
      { word: "speaker", meaning: "diễn giả" },
      { word: "reimburse", meaning: "hoàn tiền" },
      { word: "negotiate", meaning: "đàm phán" },
      { word: "inventory", meaning: "kiểm kê hàng" },
    ];

    it("should generate 4 options with exactly 1 correct option in en_to_vi mode", () => {
      const options = generateQuizOptions(cards[0], cards, "en_to_vi");
      expect(options).toHaveLength(4);

      const correctOptions = options.filter((o) => o.isCorrect);
      expect(correctOptions).toHaveLength(1);
      expect(correctOptions[0].label).toBe("diễn giả");
    });

    it("should generate 4 options with exactly 1 correct option in vi_to_en mode", () => {
      const options = generateQuizOptions(cards[0], cards, "vi_to_en");
      expect(options).toHaveLength(4);

      const correctOptions = options.filter((o) => o.isCorrect);
      expect(correctOptions).toHaveLength(1);
      expect(correctOptions[0].label).toBe("speaker");
    });
  });
});
