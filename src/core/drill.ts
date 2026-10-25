import type { SessionReviewItem } from "@/features/practice/types";

export interface DrillQuestion {
  question_id: string;
  order_index: number;
  stem: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  tag_name_vi: string;
  correct_index: number;
  explanation: SessionReviewItem["explanation"];
}

export interface DrillState {
  questions: DrillQuestion[];
  currentIndex: number;
  selectedOption: number | null;
  isSubmitted: boolean;
  score: number;
  isFinished: boolean;
  userAnswers: {
    question_id: string;
    selected_index: number;
    is_correct: boolean;
  }[];
}

/**
 * Khởi tạo trạng thái Drill từ danh sách các câu trả lời của phiên.
 * Chỉ lọc các câu chưa đúng (is_correct !== true).
 */
export function initDrillState(items: SessionReviewItem[]): DrillState {
  const wrongQuestions: DrillQuestion[] = items
    .filter((item) => !item.is_correct)
    .map((item, idx) => ({
      question_id: item.question_id,
      order_index: idx + 1,
      stem: item.stem,
      option_a: item.option_a,
      option_b: item.option_b,
      option_c: item.option_c,
      option_d: item.option_d,
      tag_name_vi: item.tag_name_vi,
      correct_index: item.correct_index,
      explanation: item.explanation,
    }));

  return {
    questions: wrongQuestions,
    currentIndex: 0,
    selectedOption: null,
    isSubmitted: false,
    score: 0,
    isFinished: wrongQuestions.length === 0,
    userAnswers: [],
  };
}

/**
 * Chọn phương án trong chế độ Drill
 */
export function selectDrillOption(
  state: DrillState,
  optionIndex: number
): DrillState {
  if (state.isSubmitted || state.isFinished) {
    return state;
  }
  return {
    ...state,
    selectedOption: optionIndex,
  };
}

/**
 * Chấm điểm câu trả lời trong Drill (HOÀN TOÀN TẠI CLIENT MEMORY)
 * BẤT BIẾN §4.5 & PD-03: Không ghi DB, không gọi RPC, không đổi mastery.
 */
export function submitDrillAnswer(state: DrillState): DrillState {
  if (
    state.isSubmitted ||
    state.isFinished ||
    state.selectedOption === null ||
    state.currentIndex >= state.questions.length
  ) {
    return state;
  }

  const currentQ = state.questions[state.currentIndex];
  const isCorrect = state.selectedOption === currentQ.correct_index;

  return {
    ...state,
    isSubmitted: true,
    score: isCorrect ? state.score + 1 : state.score,
    userAnswers: [
      ...state.userAnswers,
      {
        question_id: currentQ.question_id,
        selected_index: state.selectedOption,
        is_correct: isCorrect,
      },
    ],
  };
}

/**
 * Chuyển sang câu Drill tiếp theo hoặc kết thúc lượt Drill
 */
export function nextDrillQuestion(state: DrillState): DrillState {
  if (!state.isSubmitted || state.isFinished) {
    return state;
  }

  const nextIndex = state.currentIndex + 1;
  const isFinished = nextIndex >= state.questions.length;

  return {
    ...state,
    currentIndex: nextIndex,
    selectedOption: null,
    isSubmitted: false,
    isFinished,
  };
}

/**
 * Reset lại lượt Drill để người học có thể luyện lại lần nữa
 */
export function resetDrillState(state: DrillState): DrillState {
  return {
    ...state,
    currentIndex: 0,
    selectedOption: null,
    isSubmitted: false,
    score: 0,
    isFinished: state.questions.length === 0,
    userAnswers: [],
  };
}
