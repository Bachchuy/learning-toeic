import { describe, it, expect } from "vitest";
import { parseExplanation } from "./schemas";

describe("QuestionExplanationSchema & parseExplanation", () => {
  it("trả về đầy đủ dữ liệu khi payload hợp lệ", () => {
    const raw = {
      rule_vi: "Quy tắc bị động.",
      why_correct_vi: "Vì có by tân ngữ.",
      full_translation_vi: "Bản dịch câu.",
      options_analysis: {
        A: "Giải thích A",
        B: "Giải thích B",
        C: "Giải thích C",
        D: "Giải thích D",
      },
      tip_vi: "Mẹo nhanh.",
      example_en: "Example sentence.",
      vocab_hints: [{ word: "brief", meaning_vi: "ngắn gọn" }],
    };

    const parsed = parseExplanation(raw);
    expect(parsed.rule_vi).toBe("Quy tắc bị động.");
    expect(parsed.why_correct_vi).toBe("Vì có by tân ngữ.");
    expect(parsed.full_translation_vi).toBe("Bản dịch câu.");
    expect(parsed.options_analysis?.A).toBe("Giải thích A");
    expect(parsed.vocab_hints).toHaveLength(1);
  });

  it("tự động gán giá trị dự phòng (fallback) khi dữ liệu rỗng {}", () => {
    const parsed = parseExplanation({});
    expect(parsed.rule_vi).toBe("Cấu trúc ngữ pháp trọng tâm theo chuẩn đề thi TOEIC Part 5.");
    expect(parsed.why_correct_vi).toBe(
      "Phương án này thỏa mãn hoàn toàn cấu trúc ngữ pháp và ngữ cảnh của câu."
    );
    expect(parsed.full_translation_vi).toBeUndefined();
    expect(parsed.vocab_hints).toBeUndefined();
  });

  it("không crash và trả về fallback khi đầu vào là null, undefined hoặc kiểu dữ liệu sai", () => {
    expect(parseExplanation(null).rule_vi).toBeTruthy();
    expect(parseExplanation(undefined).why_correct_vi).toBeTruthy();
    expect(parseExplanation("dữ liệu lỗi").rule_vi).toBeTruthy();
    expect(parseExplanation(12345).why_correct_vi).toBeTruthy();
  });

  it("giữ lại các trường hợp lệ nếu JSON bị thiếu một số trường (partial data)", () => {
    const partial = {
      why_correct_vi: "Đáp án A đúng.",
      tip_vi: "Mẹo nhỏ.",
    };

    const parsed = parseExplanation(partial);
    expect(parsed.why_correct_vi).toBe("Đáp án A đúng.");
    expect(parsed.tip_vi).toBe("Mẹo nhỏ.");
    expect(parsed.rule_vi).toBe("Cấu trúc ngữ pháp trọng tâm theo chuẩn đề thi TOEIC Part 5.");
  });
});
