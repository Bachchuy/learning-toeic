import { describe, it, expect } from "vitest";
import {
  applyExerciseResultToStore,
  clearExerciseResultFromStore,
  parseLearnProgressStore,
  resetTopicProgressInStore,
  setTopicRecallModeInStore,
  type LearnProgressStore,
} from "./learn-progress-storage";

describe("learn-progress-storage pure helpers", () => {
  it("trả về object rỗng khi chuỗi JSON rỗng hoặc hỏng", () => {
    expect(parseLearnProgressStore("")).toEqual({});
    expect(parseLearnProgressStore("{}")).toEqual({});
    expect(parseLearnProgressStore("not-json")).toEqual({});
    expect(parseLearnProgressStore("[]")).toEqual({});
  });

  it("lọc bỏ dữ liệu attempt không hợp lệ và giữ lại bản ghi hợp lệ", () => {
    const raw = JSON.stringify({
      tenses: {
        recallMode: true,
        solved: {
          "tenses-ex-1": { isCorrect: true, selectedIndex: 1 },
          "tenses-ex-x1": { isCorrect: true, typedAnswer: "is attending" },
          corrupt: { isCorrect: "yes", selectedIndex: 99 },
          negative: { isCorrect: false, selectedIndex: -1 },
          emptyTyped: { isCorrect: true, typedAnswer: "   " },
        },
      },
      invalidTag: "broken",
    });

    expect(parseLearnProgressStore(raw)).toEqual({
      tenses: {
        recallMode: true,
        solved: {
          "tenses-ex-1": { isCorrect: true, selectedIndex: 1 },
          "tenses-ex-x1": { isCorrect: true, typedAnswer: "is attending" },
        },
      },
    });
  });

  it("cập nhật, xóa từng câu, bật Ẩn dịch và đặt lại tiến độ chủ điểm chính xác", () => {
    let store: LearnProgressStore = {};
    store = applyExerciseResultToStore(store, "tenses", "tenses-ex-1", {
      isCorrect: true,
      selectedIndex: 1,
    });
    store = applyExerciseResultToStore(store, "tenses", "tenses-ex-2", {
      isCorrect: false,
      typedAnswer: "attend",
    });
    store = setTopicRecallModeInStore(store, "tenses", true);

    expect(store).toEqual({
      tenses: {
        recallMode: true,
        solved: {
          "tenses-ex-1": { isCorrect: true, selectedIndex: 1 },
          "tenses-ex-2": { isCorrect: false, typedAnswer: "attend" },
        },
      },
    });

    store = clearExerciseResultFromStore(store, "tenses", "tenses-ex-2");
    expect(store.tenses.solved).toEqual({
      "tenses-ex-1": { isCorrect: true, selectedIndex: 1 },
    });

    store = resetTopicProgressInStore(store, "tenses");
    expect(store.tenses).toEqual({
      recallMode: true,
      solved: {},
    });
  });
});
