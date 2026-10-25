import { describe, it, expect } from "vitest";
import {
  practiceReducer,
  createInitialPracticeState,
} from "./practiceReducer";

describe("practiceReducer", () => {
  it("khởi tạo state chính xác", () => {
    const state = createInitialPracticeState(10);
    expect(state.currentIndex).toBe(0);
    expect(state.totalQuestions).toBe(10);
    expect(state.status).toBe("answering");
    expect(state.selectedIndex).toBeNull();
    expect(state.currentResult).toBeNull();
  });

  it("cho phép chọn đáp án khi đang answering", () => {
    const state = createInitialPracticeState(10);
    const updated = practiceReducer(state, {
      type: "SELECT_OPTION",
      payload: { index: 2 },
    });
    expect(updated.selectedIndex).toBe(2);
  });

  it("không cho phép submit khi chưa chọn đáp án", () => {
    const state = createInitialPracticeState(10);
    const updated = practiceReducer(state, { type: "START_SUBMIT" });
    expect(updated.status).toBe("answering");
  });

  it("chuyển sang trạng thái submitting khi đã chọn đáp án", () => {
    const state = {
      ...createInitialPracticeState(10),
      selectedIndex: 1,
    };
    const updated = practiceReducer(state, { type: "START_SUBMIT" });
    expect(updated.status).toBe("submitting");
  });

  it("chuyển sang feedback khi nộp thành công", () => {
    const state = {
      ...createInitialPracticeState(10),
      status: "submitting" as const,
      selectedIndex: 1,
    };
    const mockResult = {
      is_correct: true,
      selected_index: 1,
      correct_index: 1,
      explanation: {
        rule_vi: "Quy tắc test",
        why_correct_vi: "Vì sao đúng",
      },
    };
    const updated = practiceReducer(state, {
      type: "SUBMIT_SUCCESS",
      payload: { result: mockResult },
    });
    expect(updated.status).toBe("feedback");
    expect(updated.currentResult?.is_correct).toBe(true);
  });

  it("chuyển sang câu hỏi tiếp theo và reset trạng thái lựa chọn", () => {
    const state = {
      ...createInitialPracticeState(10),
      currentIndex: 0,
      status: "feedback" as const,
      selectedIndex: 1,
    };
    const updated = practiceReducer(state, { type: "NEXT_QUESTION" });
    expect(updated.currentIndex).toBe(1);
    expect(updated.status).toBe("answering");
    expect(updated.selectedIndex).toBeNull();
    expect(updated.currentResult).toBeNull();
  });

  it("kết thúc phiên khi đã làm hết câu hỏi cuối cùng", () => {
    const state = {
      ...createInitialPracticeState(5),
      currentIndex: 4, // Câu 5/5
      status: "feedback" as const,
      selectedIndex: 3,
    };
    const updated = practiceReducer(state, { type: "NEXT_QUESTION" });
    expect(updated.status).toBe("finished");
  });

  it("chuyển sang error và giữ nguyên selectedIndex khi nộp lỗi mạng", () => {
    const state = {
      ...createInitialPracticeState(10),
      status: "submitting" as const,
      selectedIndex: 2,
    };
    const updated = practiceReducer(state, {
      type: "SUBMIT_ERROR",
      payload: { error: "Mất kết nối mạng" },
    });
    expect(updated.status).toBe("error");
    expect(updated.selectedIndex).toBe(2);
    expect(updated.errorMessage).toBe("Mất kết nối mạng");
  });
});
