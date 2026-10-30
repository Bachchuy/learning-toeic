import type {
  ReadingQuestionItem,
  ExamReadingEvaluation,
  QuestionGradingResult,
} from "@/core/examReading";

export interface ExamMetaSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  exam_type: string;
  target_score: number;
  duration_minutes: number;
  total_questions: number;
  parts_summary: {
    part5: number;
    part6: number;
    part7: number;
    totalReading: number;
  };
}

export interface ReadingExamData {
  examSetId: string;
  slug: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  questions: ReadingQuestionItem[];
}

export interface SubmitExamPayload {
  examSetId: string;
  userAnswers: Record<string, number>; // { [questionId]: selectedIndex (0..3) }
  timeSpentSeconds: number;
}

export interface SubmitExamResult {
  success: boolean;
  attemptId?: string;
  evaluation?: ExamReadingEvaluation;
  error?: string;
}

export type {
  ReadingQuestionItem,
  ExamReadingEvaluation,
  QuestionGradingResult,
};
