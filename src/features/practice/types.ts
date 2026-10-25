export interface QuestionOption {
  index: number;
  label: "A" | "B" | "C" | "D";
  text: string;
}

export interface PracticeQuestion {
  id: string;
  order_index: number;
  stem: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  tag_id: number;
  tag_name_vi: string;
  difficulty: number;
}

export interface OptionExplanation {
  option: "A" | "B" | "C" | "D";
  reason_vi: string;
}

export interface VocabHint {
  word: string;
  meaning_vi: string;
}

export interface QuestionExplanation {
  rule_vi: string;
  why_correct_vi: string;
  why_wrong_vi?: OptionExplanation[];
  tip_vi?: string;
  example_en?: string;
  vocab_hints?: VocabHint[];
}

export interface SubmitAnswerResponse {
  is_correct: boolean;
  selected_index: number;
  correct_index: number;
  explanation: QuestionExplanation;
  already_submitted?: boolean;
}

export interface SessionReviewItem {
  question_id: string;
  order_index: number;
  stem: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  tag_name_vi: string;
  selected_index: number | null;
  correct_index: number;
  is_correct: boolean | null;
  explanation: QuestionExplanation;
}

export interface SessionReviewResponse {
  session_id: string;
  total_questions: number;
  completed_at: string | null;
  created_at: string;
  correct_count: number;
  attempts: SessionReviewItem[];
}
