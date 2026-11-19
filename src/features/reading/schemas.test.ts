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

  it("fail-closed (success = false) khi payload null, thiếu trường success hoặc sai kiểu", () => {
    expect(parsePassageSubmitResult(null, 4).success).toBe(false);
    expect(parsePassageSubmitResult([], 4).success).toBe(false);
    expect(
      parsePassageSubmitResult({ score: 1, total: 1, results: [] }, 4).success
    ).toBe(false);
  });
});
