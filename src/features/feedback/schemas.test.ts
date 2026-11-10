import { describe, it, expect } from "vitest";
import { SubmitFeedbackSchema } from "./schemas";

describe("SubmitFeedbackSchema", () => {
  it("chấp nhận góp ý hợp lệ với category, message, pagePath và viewport", () => {
    const parsed = SubmitFeedbackSchema.safeParse({
      category: "ux",
      message: "Nút lưu từ trên điện thoại 360px hơi sát lề phải.",
      pagePath: "/practice/123",
      viewport: "360x740",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.category).toBe("ux");
      expect(parsed.data.pagePath).toBe("/practice/123");
    }
  });

  it("từ chối nội dung quá ngắn (< 5 ký tự) hoặc category không hợp lệ", () => {
    const tooShort = SubmitFeedbackSchema.safeParse({
      category: "bug",
      message: "abc",
    });
    expect(tooShort.success).toBe(false);

    const invalidCategory = SubmitFeedbackSchema.safeParse({
      category: "unknown",
      message: "Góp ý có độ dài hợp lệ",
    });
    expect(invalidCategory.success).toBe(false);
  });
});
