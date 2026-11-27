import { describe, it, expect } from "vitest";
import { parsePassageSubmitResult } from "./schemas";

describe("parsePassageSubmitResult", () => {
  it("trả về success = true khi RPC phản hồi hợp lệ", () => {
    const parsed = parsePassageSubmitResult(
      {
        success: true,
        score: 3,
        total: 4,
        results: [
          {
            question_id: "q-131",
            is_correct: true,
            correct_index: 1,
            user_selected: 1,
            explanation: {
              translation: "Dịch nghĩa",
              analysis: "Phân tích",
              key_clue: "Dấu hiệu",
            },
          },
        ],
      },
      4
    );

    expect(parsed.success).toBe(true);
    expect(parsed.score).toBe(3);
    expect(parsed.total).toBe(4);
    expect(parsed.results).toHaveLength(1);
    expect(parsed.results[0].question_id).toBe("q-131");
  });

  it("giữ nguyên thông báo lỗi và làm rỗng results khi RPC trả về success = false", () => {
    const parsed = parsePassageSubmitResult(
      {
        success: false,
        error: "UNAUTHORIZED",
        message: "Vui lòng đăng nhập để nộp bài và lưu kết quả",
      },
      4
    );

    expect(parsed.success).toBe(false);
    expect(parsed.score).toBe(0);
    expect(parsed.total).toBe(4);
    expect(parsed.results).toEqual([]);
    expect(parsed.message).toBe("Vui lòng đăng nhập để nộp bài và lưu kết quả");
  });

  it("hỗ trợ payload giải thích dạng plain string cũ (105 câu bổ sung) và cấu trúc mới options_analysis", () => {
    const parsed = parsePassageSubmitResult(
      {
        success: true,
        score: 1,
        total: 2,
        results: [
          {
            question_id: "q-legacy-str",
            is_correct: false,
            correct_index: 2,
            user_selected: 0,
            explanation: "Trước danh từ 'protection' cần một tính từ bổ nghĩa -> 'superior'.",
          },
          {
            question_id: "q-rich-json",
            is_correct: true,
            correct_index: 1,
            user_selected: 1,
            explanation: {
              question_type_vi: "Câu hỏi chi tiết (Detail & Paraphrase)",
              rule_vi: "Tìm từ khóa paraphrase trong đoạn văn.",
              why_correct_vi: "Đoạn 2 nêu rõ baked daily on-site.",
              key_clue: "We bake everything on-site every morning",
              full_translation_vi: "Tiệm nướng bánh mới tại chỗ mỗi sáng.",
              tip_vi: "Đối chiếu cụm trạng từ tần suất.",
              options_analysis: {
                A: "Sai vì địa chỉ mới vẫn ở Westfield.",
                B: "Đúng vì 'on-site every morning' = 'made daily on the premises'.",
                C: "Sai vì nghỉ thứ Hai.",
                D: "Sai vì chỉ cần báo trước 48 giờ.",
              },
            },
          },
        ],
      },
      2
    );

    expect(parsed.success).toBe(true);
    expect(parsed.results).toHaveLength(2);
    expect(parsed.results[0].explanation.analysis).toContain("superior");
    expect(parsed.results[1].explanation.question_type_vi).toBe(
      "Câu hỏi chi tiết (Detail & Paraphrase)"
    );
    expect(parsed.results[1].explanation.options_analysis?.B).toContain("on-site");
    expect(parsed.results[1].explanation.translation).toBe(
      "Tiệm nướng bánh mới tại chỗ mỗi sáng."
    );
  });

  it("fail-closed (success = false) khi payload null, thiếu trường success hoặc sai kiểu", () => {
    expect(parsePassageSubmitResult(null, 4).success).toBe(false);
    expect(parsePassageSubmitResult([], 4).success).toBe(false);
    expect(
      parsePassageSubmitResult({ score: 1, total: 1, results: [] }, 4).success
    ).toBe(false);
  });
});
