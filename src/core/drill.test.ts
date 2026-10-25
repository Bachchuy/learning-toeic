import { describe, it, expect } from "vitest";
import {
  initDrillState,
  selectDrillOption,
  submitDrillAnswer,
  nextDrillQuestion,
  resetDrillState,
} from "./drill";
import type { SessionReviewItem } from "@/features/practice/types";

const mockReviewItems: SessionReviewItem[] = [
  {
    question_id: "q-1",
    order_index: 1,
    stem: "The conference was ____ attended.",
    option_a: "well",
    option_b: "good",
    option_c: "better",
    option_d: "best",
    tag_name_vi: "Trạng từ",
    selected_index: 1, // Chọn B (sai)
    correct_index: 0,  // Đáp án A
    is_correct: false,
    explanation: {
      rule_vi: "Trạng từ bổ nghĩa cho quá khứ phân từ",
      why_correct_vi: "well attended là collocation quen thuộc",
    },
  },
  {
    question_id: "q-2",
    order_index: 2,
    stem: "Ms. Lee will ____ the presentation tomorrow.",
    option_a: "give",
    option_b: "giving",
    option_c: "gave",
    option_d: "given",
    tag_name_vi: "Thì tương lai",
    selected_index: 0, // Chọn A (đúng)
    correct_index: 0,
    is_correct: true,
    explanation: {
      rule_vi: "will + V nguyên mẫu",
      why_correct_vi: "give là nguyên mẫu",
    },
  },
  {
    question_id: "q-3",
    order_index: 3,
    stem: "All employees must wear their badges at all ____.",
    option_a: "time",
    option_b: "times",
    option_c: "timing",
    option_d: "timely",
    tag_name_vi: "Cụm cố định",
    selected_index: 0, // Chọn A (sai)
    correct_index: 1,  // Đáp án B
    is_correct: false,
    explanation: {
      rule_vi: "at all times nghĩa là luôn luôn",
      why_correct_vi: "times số nhiều",
    },
  },
];

describe("Core Drill Module (PD-03 & §4.5)", () => {
  it("khởi tạo đúng các câu bị sai và bỏ qua câu đúng", () => {
    const state = initDrillState(mockReviewItems);

    expect(state.questions.length).toBe(2);
    expect(state.questions[0].question_id).toBe("q-1");
    expect(state.questions[1].question_id).toBe("q-3");
    expect(state.currentIndex).toBe(0);
    expect(state.score).toBe(0);
    expect(state.isSubmitted).toBe(false);
    expect(state.isFinished).toBe(false);
  });

  it("khởi tạo trạng thái hoàn thành ngay nếu không có câu sai nào", () => {
    const allCorrectItems = mockReviewItems.map((item) => ({
      ...item,
      is_correct: true,
    }));
    const state = initDrillState(allCorrectItems);

    expect(state.questions.length).toBe(0);
    expect(state.isFinished).toBe(true);
  });

  it("chọn phương án và nộp câu trả lời chính xác", () => {
    let state = initDrillState(mockReviewItems);

    // Chọn phương án A (index 0) cho câu q-1 (đáp án đúng là 0)
    state = selectDrillOption(state, 0);
    expect(state.selectedOption).toBe(0);

    // Nộp bài
    state = submitDrillAnswer(state);
    expect(state.isSubmitted).toBe(true);
    expect(state.score).toBe(1);
    expect(state.userAnswers.length).toBe(1);
    expect(state.userAnswers[0].is_correct).toBe(true);
  });

  it("chấm sai nếu chọn sai đáp án và không cộng điểm", () => {
    let state = initDrillState(mockReviewItems);

    // Chọn phương án B (index 1) cho câu q-1 (sai)
    state = selectDrillOption(state, 1);
    state = submitDrillAnswer(state);

    expect(state.isSubmitted).toBe(true);
    expect(state.score).toBe(0);
    expect(state.userAnswers[0].is_correct).toBe(false);
  });

  it("không cho phép thay đổi lựa chọn sau khi đã nộp", () => {
    let state = initDrillState(mockReviewItems);
    state = selectDrillOption(state, 1);
    state = submitDrillAnswer(state);

    // Thử chọn lại
    state = selectDrillOption(state, 0);
    expect(state.selectedOption).toBe(1);
  });

  it("chuyển sang câu tiếp theo và kết thúc đúng khi hết câu", () => {
    let state = initDrillState(mockReviewItems);

    // Làm câu 1
    state = selectDrillOption(state, 0);
    state = submitDrillAnswer(state);
    state = nextDrillQuestion(state);

    expect(state.currentIndex).toBe(1);
    expect(state.selectedOption).toBeNull();
    expect(state.isSubmitted).toBe(false);
    expect(state.isFinished).toBe(false);

    // Làm câu 2 (câu q-3, đáp án đúng là index 1)
    state = selectDrillOption(state, 1);
    state = submitDrillAnswer(state);
    state = nextDrillQuestion(state);

    // Hết câu
    expect(state.isFinished).toBe(true);
    expect(state.score).toBe(2);
  });

  it("reset lại lượt Drill giữ nguyên danh sách câu hỏi nhưng xóa điểm và câu trả lời", () => {
    let state = initDrillState(mockReviewItems);
    state = selectDrillOption(state, 0);
    state = submitDrillAnswer(state);
    state = nextDrillQuestion(state);
    state = selectDrillOption(state, 1);
    state = submitDrillAnswer(state);
    state = nextDrillQuestion(state);

    expect(state.isFinished).toBe(true);
    expect(state.score).toBe(2);

    // Reset drill
    state = resetDrillState(state);
    expect(state.currentIndex).toBe(0);
    expect(state.score).toBe(0);
    expect(state.isSubmitted).toBe(false);
    expect(state.isFinished).toBe(false);
    expect(state.questions.length).toBe(2);
    expect(state.userAnswers.length).toBe(0);
  });
});
