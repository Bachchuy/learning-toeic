import { describe, it, expect } from "vitest";
import { parseExplanation, parseSessionReviewResponse } from "./schemas";

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

  it("bảo toàn why_wrong_vi ở cả dạng mảng OptionExplanation[] và dạng object legacy", () => {
    const withArray = parseExplanation({
      why_wrong_vi: [
        { option: "A", reason_vi: "Sai thì quá khứ." },
        { option: "C", reason_vi: "Sai từ loại." },
      ],
    });
    expect(withArray.why_wrong_vi).toEqual([
      { option: "A", reason_vi: "Sai thì quá khứ." },
      { option: "C", reason_vi: "Sai từ loại." },
    ]);

    const withRecord = parseExplanation({
      why_wrong_vi: {
        B: "Không hợp ngữ nghĩa.",
        D: "Thiếu tân ngữ.",
      },
    });
    expect(withRecord.why_wrong_vi).toEqual([
      { option: "B", reason_vi: "Không hợp ngữ nghĩa." },
      { option: "D", reason_vi: "Thiếu tân ngữ." },
    ]);
  });
});

describe("parseSessionReviewResponse", () => {
  it("từ chối (trả null) khi RPC trả về mảng legacy hoặc object thiếu trường bắt buộc", () => {
    expect(parseSessionReviewResponse([])).toBeNull();
    expect(parseSessionReviewResponse([{ question_id: "q-1" }])).toBeNull();
    expect(parseSessionReviewResponse(null)).toBeNull();
    expect(parseSessionReviewResponse({})).toBeNull();
  });

  it("parse hợp lệ object review và chuẩn hóa explanation + tag_name_vi", () => {
    const parsed = parseSessionReviewResponse({
      session_id: "sess-1",
      total_questions: 2,
      completed_at: "2026-11-19T12:00:00Z",
      created_at: "2026-11-19T11:55:00Z",
      correct_count: 1,
      attempts: [
        {
          question_id: "q-1",
          order_index: 1,
          stem: "She ______ the report yesterday.",
          option_a: "finish",
          option_b: "finished",
          option_c: "finishing",
          option_d: "finishes",
          tag_name_vi: "Thì động từ",
          selected_index: 0,
          correct_index: 1,
          is_correct: false,
          explanation: {
            why_correct_vi: "Dấu hiệu yesterday dùng thì quá khứ đơn.",
          },
        },
      ],
    });

    expect(parsed).not.toBeNull();
    expect(parsed!.session_id).toBe("sess-1");
    expect(parsed!.total_questions).toBe(2);
    expect(parsed!.correct_count).toBe(1);
    expect(parsed!.attempts).toHaveLength(1);
    expect(parsed!.attempts[0].explanation.rule_vi).toBeTruthy();
    expect(parsed!.attempts[0].explanation.why_correct_vi).toBe(
      "Dấu hiệu yesterday dùng thì quá khứ đơn."
    );
  });
});
