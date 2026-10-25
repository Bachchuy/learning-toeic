import { describe, it, expect } from "vitest";
import {
  validateTargetScore,
  validateDisplayName,
  validateDeleteConfirmation,
  buildUserExportJson,
  type UserExportPayload,
} from "./profile";

describe("Profile Business Rules & Validation (M10)", () => {
  describe("validateTargetScore", () => {
    it("chấp nhận điểm mục tiêu hợp lệ từ 10 đến 990", () => {
      expect(validateTargetScore(10)).toEqual({ valid: true, validatedScore: 10 });
      expect(validateTargetScore(650)).toEqual({ valid: true, validatedScore: 650 });
      expect(validateTargetScore(990)).toEqual({ valid: true, validatedScore: 990 });
      expect(validateTargetScore(" 750 ")).toEqual({ valid: true, validatedScore: 750 });
    });

    it("từ chối điểm dưới 10", () => {
      const res1 = validateTargetScore(9);
      expect(res1.valid).toBe(false);
      expect(res1.error).toContain("khoảng từ 10 đến 990");

      const res2 = validateTargetScore(0);
      expect(res2.valid).toBe(false);

      const res3 = validateTargetScore(-100);
      expect(res3.valid).toBe(false);
    });

    it("từ chối điểm vượt quá 990", () => {
      const res1 = validateTargetScore(995);
      expect(res1.valid).toBe(false);
      expect(res1.error).toContain("khoảng từ 10 đến 990");

      const res2 = validateTargetScore(1000);
      expect(res2.valid).toBe(false);
    });

    it("từ chối giá trị không phải số", () => {
      const res = validateTargetScore("abc");
      expect(res.valid).toBe(false);
      expect(res.error).toContain("phải là một số nguyên");
    });
  });

  describe("validateDisplayName", () => {
    it("làm sạch khoảng trắng thừa và chấp nhận tên hợp lệ", () => {
      const res = validateDisplayName("  Nguyễn Văn A  ");
      expect(res.valid).toBe(true);
      expect(res.cleaned).toBe("Nguyễn Văn A");
    });

    it("mặc định là 'Học viên' nếu tên để trống", () => {
      const res = validateDisplayName("   ");
      expect(res.valid).toBe(true);
      expect(res.cleaned).toBe("Học viên");
    });

    it("báo lỗi nếu tên vượt quá 50 ký tự", () => {
      const longName = "A".repeat(55);
      const res = validateDisplayName(longName);
      expect(res.valid).toBe(false);
      expect(res.cleaned.length).toBe(50);
    });
  });

  describe("validateDeleteConfirmation (D-17)", () => {
    it("trả về true khi nhập chính xác 'XOA' (không phân biệt hoa thường)", () => {
      expect(validateDeleteConfirmation("XOA")).toBe(true);
      expect(validateDeleteConfirmation("xoa")).toBe(true);
      expect(validateDeleteConfirmation("  XOA  ")).toBe(true);
      expect(validateDeleteConfirmation("Xoa")).toBe(true);
    });

    it("trả về false với các chuỗi khác hoặc để trống", () => {
      expect(validateDeleteConfirmation("")).toBe(false);
      expect(validateDeleteConfirmation("DELETE")).toBe(false);
      expect(validateDeleteConfirmation("XOA_TAI_KHOAN")).toBe(false);
      expect(validateDeleteConfirmation("xoa " + "a")).toBe(false);
    });
  });

  describe("buildUserExportJson", () => {
    it("tạo chuỗi JSON hợp lệ và chứa đầy đủ trường dữ liệu", () => {
      const payload: UserExportPayload = {
        exportedAt: "2026-10-26T00:00:00.000Z",
        version: "1.0",
        profile: {
          id: "user-123",
          email: "test@example.com",
          displayName: "Nguyễn Văn Test",
          targetScore: 750,
          role: "student",
          createdAt: "2026-10-25T10:00:00.000Z",
        },
        summary: {
          totalVocab: 1,
          totalAttempts: 2,
          totalCards: 1,
        },
        vocabList: [
          {
            word: "expedite",
            pos: "verb",
            meaning: "xúc tiến, đẩy nhanh tiến độ",
            savedAt: "2026-10-25T12:00:00.000Z",
          },
        ],
        reviewCards: [],
        recentAttempts: [],
      };

      const jsonStr = buildUserExportJson(payload);
      const parsed = JSON.parse(jsonStr);

      expect(parsed.version).toBe("1.0");
      expect(parsed.profile.targetScore).toBe(750);
      expect(parsed.vocabList[0].word).toBe("expedite");
    });
  });
});
