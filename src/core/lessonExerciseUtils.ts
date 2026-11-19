/**
 * Kiểu dữ liệu và hàm tiện ích thuần cho bài tập thực hành ngữ pháp (/learn).
 * Tách riêng khỏi kho dữ liệu bài tập nặng để client bundle không kéo toàn bộ ngân hàng bài tập.
 */

export interface LessonMcqExercise {
  id: string;
  kind?: "mcq";
  moduleIndex: number;
  skillFocus: string;
  questionStem: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanationStepByStep: string[];
}

export interface LessonFillBlankExercise {
  id: string;
  kind: "fill_blank";
  moduleIndex: number;
  skillFocus: string;
  questionStem: string;
  wordCue?: string;
  acceptedAnswers: string[];
  explanationStepByStep: string[];
}

export type LessonPracticeExercise =
  | LessonMcqExercise
  | LessonFillBlankExercise;

/** Kiểm tra bài tập có phải dạng tự điền từ hay không. */
export function isFillBlankExercise(
  ex: LessonPracticeExercise
): ex is LessonFillBlankExercise {
  return ex.kind === "fill_blank";
}

/**
 * Chuẩn hóa đáp án điền từ: gộp khoảng trắng, chuẩn hóa dấu nháy đơn và chữ thường.
 */
export function normalizeFillBlankAnswer(input: string): string {
  return input
    .trim()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/g, "")
    .toLowerCase();
}

/**
 * Kiểm tra đáp án người học nhập có khớp với một trong các đáp án chuẩn hay không.
 */
export function checkFillBlankAnswer(
  userInput: string,
  acceptedAnswers: string[]
): boolean {
  const normalizedUser = normalizeFillBlankAnswer(userInput);
  if (!normalizedUser) return false;
  return acceptedAnswers.some(
    (ans) => normalizeFillBlankAnswer(ans) === normalizedUser
  );
}
