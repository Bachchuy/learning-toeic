import { describe, it, expect } from "vitest";
import type { QuestionExplanation } from "@/features/practice/types";
import { parseExplanation } from "@/features/practice/schemas";
import {
  getOptionLabel,
  getSelectedOptionSpecificReason,
  getRemainingOptionAnalyses,
  getExpandableDetailFlags,
  resolvePracticeFeedback,
} from "./practiceFeedback";

describe("practiceFeedback pure resolver", () => {
  it("chuyển đổi index 0..3 sang nhãn A..D và trả về null với index không hợp lệ", () => {
    expect(getOptionLabel(0)).toBe("A");
    expect(getOptionLabel(1)).toBe("B");
    expect(getOptionLabel(2)).toBe("C");
    expect(getOptionLabel(3)).toBe("D");
    expect(getOptionLabel(-1)).toBeNull();
    expect(getOptionLabel(4)).toBeNull();
    expect(getOptionLabel(null)).toBeNull();
    expect(getOptionLabel(undefined)).toBeNull();
  });

  it("chọn sai ở A khi có lời giải riêng trong why_wrong_vi", () => {
    const explanation: QuestionExplanation = {
      rule_vi: "Cấu trúc mạo từ + tính từ + danh từ.",
      why_correct_vi: "Cần tính từ đứng trước danh từ summary.",
      why_wrong_vi: [
        { option: "A", reason_vi: "briefly là trạng từ, không bổ nghĩa trực tiếp cho danh từ." },
      ],
      options_analysis: {
        A: "Phân tích dự phòng cho A",
        B: "Phân tích B",
        C: "Phân tích C",
        D: "Phân tích D",
      },
    };

    const resolved = resolvePracticeFeedback({
      isCorrect: false,
      selectedIndex: 0,
      correctIndex: 2,
      explanation,
    });

    expect(resolved.selectedLabel).toBe("A");
    expect(resolved.correctLabel).toBe("C");
    expect(resolved.inlineSelectedFeedback).toEqual({
      optionIndex: 0,
      optionLabel: "A",
      kind: "selected_option",
      heading: "Vì sao phương án A chưa đúng",
      body: "briefly là trạng từ, không bổ nghĩa trực tiếp cho danh từ.",
    });
    expect(resolved.showWhyCorrectInSummary).toBe(true);
  });

  it("chọn sai ở D khi chỉ có options_analysis (không có why_wrong_vi)", () => {
    const explanation: QuestionExplanation = {
      rule_vi: "Dấu hiệu since + mốc thời gian dùng thì hiện tại hoàn thành.",
      why_correct_vi: "Since January of last year diễn tả hành động kéo dài đến hiện tại.",
      options_analysis: {
        A: "Hiện tại đơn không đi với since.",
        B: "Hiện tại hoàn thành phù hợp.",
        C: "Quá khứ đơn chỉ hành động đã chấm dứt.",
        D: "Hiện tại tiếp diễn không dùng cho khoảng thời gian kéo dài với since.",
      },
    };

    const resolved = resolvePracticeFeedback({
      isCorrect: false,
      selectedIndex: 3,
      correctIndex: 1,
      explanation,
    });

    expect(resolved.selectedLabel).toBe("D");
    expect(resolved.correctLabel).toBe("B");
    expect(resolved.inlineSelectedFeedback).toEqual({
      optionIndex: 3,
      optionLabel: "D",
      kind: "selected_option",
      heading: "Vì sao phương án D chưa đúng",
      body: "Hiện tại tiếp diễn không dùng cho khoảng thời gian kéo dài với since.",
    });
    expect(resolved.showWhyCorrectInSummary).toBe(true);
  });

  it("ưu tiên why_wrong_vi hơn options_analysis khi cả hai cùng tồn tại", () => {
    const explanation: QuestionExplanation = {
      rule_vi: "Quy tắc",
      why_correct_vi: "Lý do đúng",
      why_wrong_vi: [{ option: "B", reason_vi: "Lý do từ why_wrong_vi" }],
      options_analysis: {
        A: "A",
        B: "Lý do từ options_analysis",
        C: "C",
        D: "D",
      },
    };

    expect(getSelectedOptionSpecificReason(explanation, "B")).toBe(
      "Lý do từ why_wrong_vi"
    );
  });

  it("thiếu lời giải riêng (rỗng/khoảng trắng/chỉ có phương án khác) → fallback sang why_correct_vi đúng một lần", () => {
    const base: QuestionExplanation = {
      rule_vi: "Cấu trúc câu bị động.",
      why_correct_vi: "Có by the committee ở cuối câu nên động từ phải chia bị động.",
      why_wrong_vi: [{ option: "B", reason_vi: "Chỉ có giải thích cho B." }],
      options_analysis: {
        A: "   ",
        B: "Sai B",
        C: "Đúng C",
        D: "",
      },
    };

    const resolvedMissing = resolvePracticeFeedback({
      isCorrect: false,
      selectedIndex: 0,
      correctIndex: 2,
      explanation: base,
    });

    expect(resolvedMissing.inlineSelectedFeedback).toEqual({
      optionIndex: 0,
      optionLabel: "A",
      kind: "correct_reason_fallback",
      heading: "Lý do đáp án đúng (C)",
      body: "Có by the committee ở cuối câu nên động từ phải chia bị động.",
    });
    expect(resolvedMissing.showWhyCorrectInSummary).toBe(false);

    const resolvedWhitespace = resolvePracticeFeedback({
      isCorrect: false,
      selectedIndex: 3,
      correctIndex: 2,
      explanation: base,
    });
    expect(resolvedWhitespace.inlineSelectedFeedback?.kind).toBe(
      "correct_reason_fallback"
    );
    expect(resolvedWhitespace.showWhyCorrectInSummary).toBe(false);
  });

  it("không lặp lại why_correct_vi nếu lời giải riêng của phương án đã chọn trùng y hệt why_correct_vi", () => {
    const explanation: QuestionExplanation = {
      rule_vi: "Quy tắc",
      why_correct_vi: "Cần trạng từ bổ nghĩa cho động từ.",
      options_analysis: {
        A: "Cần trạng từ bổ nghĩa cho động từ.",
        B: "Đúng",
        C: "Sai C",
        D: "Sai D",
      },
    };

    const resolved = resolvePracticeFeedback({
      isCorrect: false,
      selectedIndex: 0,
      correctIndex: 1,
      explanation,
    });

    expect(resolved.inlineSelectedFeedback?.kind).toBe("selected_option");
    expect(resolved.showWhyCorrectInSummary).toBe(false);
  });

  it("trả lời đúng → không tạo inlineSelectedFeedback và giữ why_correct_vi ở phần tổng kết", () => {
    const explanation: QuestionExplanation = {
      rule_vi: "Quy tắc",
      why_correct_vi: "Giải thích đáp án đúng.",
      full_translation_vi: "Bản dịch.",
      example_en: "Example sentence.",
    };

    const resolved = resolvePracticeFeedback({
      isCorrect: true,
      selectedIndex: 1,
      correctIndex: 1,
      explanation,
    });

    expect(resolved.inlineSelectedFeedback).toBeNull();
    expect(resolved.showWhyCorrectInSummary).toBe(true);
    expect(resolved.correctLabel).toBe("B");
  });

  it("getExpandableDetailFlags tạo nhãn trung thực theo các trường hiện có", () => {
    expect(
      getExpandableDetailFlags({
        rule_vi: "Quy tắc",
        why_correct_vi: "Đúng",
        full_translation_vi: "Dịch",
        example_en: "Example",
      })
    ).toMatchObject({
      hasRule: true,
      hasTranslation: true,
      hasExample: true,
      hasTip: false,
      hasAny: true,
      openLabel: "Mở quy tắc, bản dịch và ví dụ",
      closeLabel: "Thu gọn quy tắc, bản dịch và ví dụ",
    });

    expect(
      getExpandableDetailFlags({
        rule_vi: "Quy tắc",
        why_correct_vi: "Đúng",
        full_translation_vi: "Dịch",
      })
    ).toMatchObject({
      hasRule: true,
      hasTranslation: true,
      hasExample: false,
      hasAny: true,
      openLabel: "Mở quy tắc và bản dịch",
      closeLabel: "Thu gọn quy tắc và bản dịch",
    });

    expect(
      getExpandableDetailFlags({
        rule_vi: "Quy tắc",
        why_correct_vi: "Đúng",
      })
    ).toMatchObject({
      hasRule: true,
      hasTranslation: false,
      hasExample: false,
      hasAny: true,
      openLabel: "Mở quy tắc",
      closeLabel: "Thu gọn quy tắc",
    });

    expect(
      getExpandableDetailFlags({
        rule_vi: "  ",
        why_correct_vi: "Đúng",
        tip_vi: "Mẹo hay",
      })
    ).toMatchObject({
      hasRule: false,
      hasTip: true,
      hasAny: true,
      openLabel: "Mở mẹo nhận diện",
      closeLabel: "Thu gọn mẹo nhận diện",
    });

    expect(
      getExpandableDetailFlags({
        rule_vi: "",
        why_correct_vi: "Đúng",
      })
    ).toMatchObject({
      hasAny: false,
      openLabel: "",
      closeLabel: "",
    });

    expect(
      getExpandableDetailFlags(
        {
          rule_vi: "Quy tắc",
          why_correct_vi: "Đúng",
          full_translation_vi: "Dịch",
        },
        { includeTranslation: false, hasOptionAnalyses: true }
      )
    ).toMatchObject({
      hasRule: true,
      hasTranslation: false,
      hasOptionAnalyses: true,
      openLabel: "Mở quy tắc và phân tích phương án",
      closeLabel: "Thu gọn quy tắc và phân tích phương án",
    });
  });

  it("Finding 1: qua parser với why_wrong_vi: [{ option: 'A' }], ưu tiên options_analysis.A nếu có rồi mới fallback why_correct_vi một lần", () => {
    const parsedWithAnalysis = parseExplanation({
      why_wrong_vi: [{ option: "A" }],
      options_analysis: {
        A: "Phân tích thật của A",
        B: "Phân tích B",
        C: "Phân tích C",
        D: "Phân tích D",
      },
      why_correct_vi: "Lý do đúng ở C.",
    });

    const withAnalysis = resolvePracticeFeedback({
      isCorrect: false,
      selectedIndex: 0,
      correctIndex: 2,
      explanation: parsedWithAnalysis,
    });
    expect(withAnalysis.inlineSelectedFeedback).toEqual({
      optionIndex: 0,
      optionLabel: "A",
      kind: "selected_option",
      heading: "Vì sao phương án A chưa đúng",
      body: "Phân tích thật của A",
    });
    expect(withAnalysis.showWhyCorrectInSummary).toBe(true);
    expect(withAnalysis.remainingOptionAnalyses.map((x) => x.option)).toEqual([
      "B",
      "C",
      "D",
    ]);

    const parsedWithoutAnalysis = parseExplanation({
      why_wrong_vi: [{ option: "A" }],
      why_correct_vi: "Lý do đúng cụ thể cho câu hỏi.",
    });

    const withoutAnalysis = resolvePracticeFeedback({
      isCorrect: false,
      selectedIndex: 0,
      correctIndex: 2,
      explanation: parsedWithoutAnalysis,
    });
    expect(withoutAnalysis.inlineSelectedFeedback).toEqual({
      optionIndex: 0,
      optionLabel: "A",
      kind: "correct_reason_fallback",
      heading: "Lý do đáp án đúng (C)",
      body: "Lý do đúng cụ thể cho câu hỏi.",
    });
    expect(withoutAnalysis.showWhyCorrectInSummary).toBe(false);

    // Bỏ qua câu dự phòng chung chung nếu xuất hiện trực tiếp trong payload
    expect(
      getSelectedOptionSpecificReason(
        {
          rule_vi: "Quy tắc",
          why_correct_vi: "Đúng",
          why_wrong_vi: [
            {
              option: "A",
              reason_vi: "Phương án này không phù hợp với cấu trúc ngữ pháp của câu.",
            },
          ],
        },
        "A"
      )
    ).toBeNull();
  });

  it("Finding 2: giữ phân tích các phương án còn lại theo A–D cho cả lượt sai và lượt đúng, bỏ qua nội dung đã hiện inline", () => {
    const explanation: QuestionExplanation = {
      rule_vi: "Quy tắc",
      why_correct_vi: "C là đáp án đúng.",
      options_analysis: {
        A: "Sai vì A là trạng từ.",
        B: "Sai vì B là danh động từ.",
        C: "C là đáp án đúng.",
        D: "Sai vì D là động từ chia thì.",
      },
    };

    const wrongA = resolvePracticeFeedback({
      isCorrect: false,
      selectedIndex: 0,
      correctIndex: 2,
      explanation,
    });
    // Bỏ qua A (đã hiện dưới A) và C (trùng why_correct_vi đang hiện ở tóm tắt)
    expect(wrongA.remainingOptionAnalyses).toEqual([
      { option: "B", reason: "Sai vì B là danh động từ." },
      { option: "D", reason: "Sai vì D là động từ chia thì." },
    ]);

    const correctC = resolvePracticeFeedback({
      isCorrect: true,
      selectedIndex: 2,
      correctIndex: 2,
      explanation: {
        ...explanation,
        options_analysis: {
          ...explanation.options_analysis!,
          C: "brief (adj): tính từ bổ nghĩa danh từ.",
        },
      },
    });
    expect(correctC.remainingOptionAnalyses).toEqual([
      { option: "A", reason: "Sai vì A là trạng từ." },
      { option: "B", reason: "Sai vì B là danh động từ." },
      { option: "C", reason: "brief (adj): tính từ bổ nghĩa danh từ." },
      { option: "D", reason: "Sai vì D là động từ chia thì." },
    ]);

    expect(
      getRemainingOptionAnalyses(explanation, { excludeOption: "B" }).map((x) => x.option)
    ).toEqual(["A", "C", "D"]);
  });
});
