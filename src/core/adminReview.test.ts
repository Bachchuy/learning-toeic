import { describe, it, expect } from "vitest";
import {
  validateStemBlank,
  validateOptions,
  validateCorrectIndex,
  runAutomatedValidator,
} from "./adminReview";

describe("Admin Review Validator Rules (M11)", () => {
  describe("validateStemBlank (S3)", () => {
    it("chấp nhận câu có đúng 1 chỗ trống", () => {
      expect(validateStemBlank("The manager decided to ______ the meeting.").valid).toBe(true);
      expect(validateStemBlank("Please submit the report by ___ Friday.").valid).toBe(true);
    });

    it("từ chối câu không có chỗ trống", () => {
      const res = validateStemBlank("The manager decided to postpone the meeting.");
      expect(res.valid).toBe(false);
      expect(res.blankCount).toBe(0);
      expect(res.error).toContain("phải có một chỗ trống");
    });

    it("từ chối câu có nhiều hơn 1 chỗ trống trong Part 5", () => {
      const res = validateStemBlank("The ______ decided to ______ the meeting.");
      expect(res.valid).toBe(false);
      expect(res.blankCount).toBe(2);
      expect(res.error).toContain("chỉ được có đúng 1 chỗ trống");
    });
  });

  describe("validateOptions (S4)", () => {
    it("chấp nhận 4 phương án phân biệt", () => {
      const res = validateOptions(["product", "production", "productive", "productively"]);
      expect(res.valid).toBe(true);
    });

    it("từ chối nếu thiếu phương án", () => {
      const res = validateOptions(["product", "production", "productive"]);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("phải có đúng 4 phương án");
    });

    it("từ chối nếu có phương án rỗng", () => {
      const res = validateOptions(["product", "", "productive", "productively"]);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("Phương án B không được để trống");
    });

    it("từ chối nếu có phương án trùng lặp", () => {
      const res = validateOptions(["product", "production", "Product", "productively"]);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("không được trùng lặp");
    });
  });

  describe("validateCorrectIndex (S5)", () => {
    it("chấp nhận index từ 0 đến 3", () => {
      expect(validateCorrectIndex(0)).toBe(true);
      expect(validateCorrectIndex(1)).toBe(true);
      expect(validateCorrectIndex(2)).toBe(true);
      expect(validateCorrectIndex(3)).toBe(true);
    });

    it("từ chối các giá trị ngoài phạm vi hoặc không nguyên", () => {
      expect(validateCorrectIndex(-1)).toBe(false);
      expect(validateCorrectIndex(4)).toBe(false);
      expect(validateCorrectIndex(1.5)).toBe(false);
    });
  });

  describe("runAutomatedValidator (S3 - S6)", () => {
    it("đánh giá pass toàn bộ khi câu hỏi chuẩn", () => {
      const report = runAutomatedValidator({
        stem: "The board members ______ voted to approve the merger.",
        option_a: "unanimous",
        option_b: "unanimously",
        option_c: "unanimity",
        option_d: "unanimities",
        correct_index: 1,
        explanation: {
          rule_vi: "Động từ 'voted' cần được bổ nghĩa bởi trạng từ.",
          why_correct_vi: "Phương án B (unanimously) là trạng từ thể cách phù hợp.",
        },
      });

      expect(report.overallPass).toBe(true);
      expect(report.checks.length).toBe(4);
      expect(report.checks.find((c) => c.id === "S3")?.status).toBe("pass");
      expect(report.checks.find((c) => c.id === "S4")?.status).toBe("pass");
      expect(report.checks.find((c) => c.id === "S5")?.status).toBe("pass");
      expect(report.checks.find((c) => c.id === "S6")?.status).toBe("pass");
    });

    it("báo lỗi nếu câu hỏi thiếu chỗ trống hoặc sai đáp án", () => {
      const report = runAutomatedValidator({
        stem: "The board members voted to approve the merger.",
        option_a: "unanimous",
        option_b: "unanimously",
        option_c: "unanimous", // trùng
        option_d: "unanimities",
        correct_index: 5, // sai index
        explanation: null,
      });

      expect(report.overallPass).toBe(false);
      expect(report.checks.find((c) => c.id === "S3")?.status).toBe("fail");
      expect(report.checks.find((c) => c.id === "S4")?.status).toBe("fail");
      expect(report.checks.find((c) => c.id === "S5")?.status).toBe("fail");
      expect(report.checks.find((c) => c.id === "S6")?.status).toBe("fail");
    });
  });
});
