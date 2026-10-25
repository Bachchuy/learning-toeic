import type { SubmitAnswerResponse } from "@/features/practice/types";

export type PracticeStatus =
  | "answering"
  | "submitting"
  | "feedback"
  | "error"
  | "finished";

export interface PracticeState {
  currentIndex: number;
  totalQuestions: number;
  status: PracticeStatus;
  selectedIndex: number | null;
  currentResult: SubmitAnswerResponse | null;
  errorMessage: string | null;
}

export type PracticeAction =
  | { type: "SELECT_OPTION"; payload: { index: number } }
  | { type: "START_SUBMIT" }
  | { type: "SUBMIT_SUCCESS"; payload: { result: SubmitAnswerResponse } }
  | { type: "SUBMIT_ERROR"; payload: { error: string } }
  | { type: "NEXT_QUESTION" }
  | { type: "FINISH_SESSION" };

export function createInitialPracticeState(totalQuestions: number): PracticeState {
  return {
    currentIndex: 0,
    totalQuestions,
    status: "answering",
    selectedIndex: null,
    currentResult: null,
    errorMessage: null,
  };
}

export function practiceReducer(
  state: PracticeState,
  action: PracticeAction
): PracticeState {
  switch (action.type) {
    case "SELECT_OPTION": {
      // Chỉ cho phép chọn đáp án khi đang ở trạng thái answering hoặc error
      if (state.status !== "answering" && state.status !== "error") {
        return state;
      }
      return {
        ...state,
        selectedIndex: action.payload.index,
        errorMessage: null,
      };
    }

    case "START_SUBMIT": {
      if (state.selectedIndex === null || state.status !== "answering") {
        return state;
      }
      return {
        ...state,
        status: "submitting",
        errorMessage: null,
      };
    }

    case "SUBMIT_SUCCESS": {
      return {
        ...state,
        status: "feedback",
        currentResult: action.payload.result,
        errorMessage: null,
      };
    }

    case "SUBMIT_ERROR": {
      return {
        ...state,
        status: "error",
        errorMessage: action.payload.error,
      };
    }

    case "NEXT_QUESTION": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.totalQuestions) {
        return {
          ...state,
          status: "finished",
        };
      }
      return {
        ...state,
        currentIndex: nextIndex,
        status: "answering",
        selectedIndex: null,
        currentResult: null,
        errorMessage: null,
      };
    }

    case "FINISH_SESSION": {
      return {
        ...state,
        status: "finished",
      };
    }

    default:
      return state;
  }
}
