import type {
  ReadingQuestionItem,
  ExamReadingEvaluation,
  QuestionGradingResult,
} from "@/core/examReading";
import type {
  ListeningPart,
  ListeningDialogueLine,
  ListeningQuestionItem,
  ListeningGroupItem,
  RawListeningContent,
  ExamListeningData,
  ListeningAnswerKey,
  ListeningQuestionGradingResult,
  ListeningPartScoreBreakdown,
  ExamListeningEvaluation,
} from "@/core/examListening";

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

export interface SubmitListeningExamResult {
  success: boolean;
  attemptId?: string;
  evaluation?: ExamListeningEvaluation;
  error?: string;
}

export interface ExamAttemptHistoryItem {
  id: string;
  examSetId: string;
  examSlug: string | null;
  examTitle: string;
  submittedAt: string;
  timeSpentSeconds: number;
  correctCountReading: number;
  scoreReading: number;
  correctCountListening: number;
  scoreListening: number;
  totalScore: number;
  examMode: "reading" | "listening" | "full";
  accuracyPercentage: number | null;
}

export type {
  ReadingQuestionItem,
  ExamReadingEvaluation,
  QuestionGradingResult,
  ListeningPart,
  ListeningDialogueLine,
  ListeningQuestionItem,
  ListeningGroupItem,
  RawListeningContent,
  ExamListeningData,
  ListeningAnswerKey,
  ListeningQuestionGradingResult,
  ListeningPartScoreBreakdown,
  ExamListeningEvaluation,
};
