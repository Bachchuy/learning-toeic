import { describe, it, expect } from "vitest";
import {
  tokenizePart6Content,
  getPassageTypeLabel,
  getPassageTypeBadgeClass,
} from "./passages";

describe("Passages Core Engine (Part 6 & Part 7)", () => {
  describe("1. Bóc tách chỗ đục lỗ Part 6 (tokenizePart6Content)", () => {
    it("tách chính xác văn bản và 4 chỗ đục lỗ chuẩn định dạng TOEIC [131] - [134]", () => {
      const text =
        "Please be advised that the main office building [131] renovations. " +
        "During this phase, noise will be [132] unavoidable. " +
        "Submit forms [133] Wednesday. [134]. Thank you for your cooperation.";

      const tokens = tokenizePart6Content(text);

      expect(tokens.length).toBe(9); // 5 text segments + 4 blanks
      expect(tokens[0]).toEqual({
        type: "text",
        value: "Please be advised that the main office building ",
      });
      expect(tokens[1]).toEqual({
        type: "blank",
        blankIndex: 131,
        rawText: "[131]",
      });
      expect(tokens[3]).toEqual({
        type: "blank",
        blankIndex: 132,
        rawText: "[132]",
      });
      expect(tokens[5]).toEqual({
        type: "blank",
        blankIndex: 133,
        rawText: "[133]",
      });
      expect(tokens[7]).toEqual({
        type: "blank",
        blankIndex: 134,
        rawText: "[134]",
      });
    });

    it("xử lý an toàn chuỗi rỗng và chuỗi không có chỗ đục lỗ", () => {
      expect(tokenizePart6Content("")).toEqual([]);
      expect(tokenizePart6Content("No blanks here")).toEqual([
        { type: "text", value: "No blanks here" },
      ]);
    });
  });

  describe("2. Nhãn và Huy hiệu thể loại bài đọc (getPassageTypeLabel)", () => {
    it("trả về đúng định dạng tiếng Việt cho các thể loại bài đọc thực tế", () => {
      expect(getPassageTypeLabel("email")).toContain("E-mail");
      expect(getPassageTypeLabel("memo")).toContain("Memorandum");
      expect(getPassageTypeLabel("notice")).toContain("Notice");
      expect(getPassageTypeLabel("article")).toContain("Article");
      expect(getPassageTypeLabel("advertisement")).toContain("Advertisement");
    });

    it("cung cấp class badge tuân thủ token thiết kế", () => {
      const emailClass = getPassageTypeBadgeClass("email");
      expect(emailClass).toContain("bg-blue-50");
      expect(emailClass).toContain("text-blue-700");
    });
  });
});
