export interface QuestionReportSummary {
  id: string;
  reason: string;
  notes: string;
  created_at: string;
}

export interface QuestionExplanationData {
  rule_vi: string;
  why_correct_vi: string;
  why_wrong_vi?: Record<string, string>;
  tip_vi?: string;
  example_en?: string;
  vocab_hints?: Array<{ word: string; pos?: string; meaning_vi: string }>;
}

export interface AdminReviewQuestion {
  id: string;
  stem: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  tag_id: number;
  tag_code: string;
  tag_name_vi: string;
  difficulty: number;
  status: "draft" | "needs_review" | "published" | "retired";
  correct_index: number;
  explanation: QuestionExplanationData;
  reports: QuestionReportSummary[];
  created_at: string;
}

export interface AdminReviewActionResult {
  success: boolean;
  message?: string;
  error?: string;
}
