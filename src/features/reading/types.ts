/**
 * Định nghĩa kiểu dữ liệu cho bài đọc hiểu TOEIC Part 6 và Part 7
 */

export type PassageType =
  | "email"
  | "memo"
  | "notice"
  | "article"
  | "advertisement"
  | "letter"
  | "form"
  | "schedule"
  | "chat"
  | "multi_passage";

export interface PassageContextInfo {
  from?: string;
  to?: string;
  date?: string;
  subject?: string;
  [key: string]: string | undefined;
}

export interface ReadingQuestion {
  id: string;
  part: 6 | 7;
  passage_id: string;
  order_in_passage: number;
  question_sub_type?: string | null;
  stem: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  difficulty: number;
  tag_id?: number | null;
}

export interface ReadingPassage {
  id: string;
  part: 6 | 7;
  passage_type: PassageType;
  title: string;
  context_info: PassageContextInfo;
  content: string;
  content_blocks?: unknown[];
  created_at: string;
  questions: ReadingQuestion[];
}

export interface QuestionExplanation {
  translation?: string;
  analysis?: string;
  key_clue?: string;
}

export interface ReadingQuestionResult {
  question_id: string;
  is_correct: boolean;
  correct_index: number;
  user_selected: number;
  explanation: QuestionExplanation;
}

export interface PassageSubmitResult {
  success: boolean;
  score: number;
  total: number;
  results: ReadingQuestionResult[];
  message?: string;
}
