/**
 * Type definitions cho tính năng Thi Thử (Mock Exams) & Đề thi ETS TOEIC
 * Tuân thủ bất biến:
 * - Content đề thi tải về máy học viên KHÔNG chứa đáp án (đáp án nằm ở exam_set_answers được RLS bảo vệ)
 * - Đáp án chỉ được server trả về sau khi học viên nộp bài thi
 */

export type ExamType = 'full_test' | 'mini_test' | 'reading_only' | 'listening_only';
export type ExamStatus = 'draft' | 'published' | 'retired';
export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned';

// Part 1: Mô tả tranh (Photographs)
export interface ExamPart1Question {
  id: string; // e.g. "t1_p1_01"
  scene: string; // Mô tả ngữ cảnh bức ảnh
  options: [string, string, string, string]; // 4 phương án A, B, C, D
  imageUrl?: string;
  audioUrl?: string;
}

// Part 2: Hỏi - Đáp (Question-Response)
export interface ExamPart2Question {
  id: string; // e.g. "t1_p2_07"
  stem: string; // Câu hỏi hoặc câu phát biểu (hoặc transcript)
  options: [string, string, string]; // 3 phương án A, B, C
  audioUrl?: string;
}

// Part 3: Đoạn hội thoại (Conversations)
export interface DialogueLine {
  speaker: 'M' | 'W' | string;
  text: string;
}

export interface ConversationQuestion {
  id: string;
  stem: string;
  options: [string, string, string, string];
}

export interface ExamPart3Conversation {
  id: string;
  lines: DialogueLine[];
  questions: ConversationQuestion[];
  audioUrl?: string;
}

// Part 4: Bài nói ngắn (Short Talks)
export interface ExamPart4Talk {
  id: string;
  type?: string; // e.g. "Announcement", "Advertisement", "Telephone Message"
  speaker?: string;
  script: string;
  questions: ConversationQuestion[];
  audioUrl?: string;
}

// Part 5: Hoàn thành câu (Incomplete Sentences)
export interface ExamPart5Question {
  id: string; // e.g. "t1_p5_101"
  stem: string;
  options: [string, string, string, string];
  grammarTag?: string;
  difficulty?: number;
}

// Part 6: Hoàn thành đoạn văn (Text Completion)
export interface ExamPart6Passage {
  id: string;
  part: string;
  docType: string;
  title: string;
  passage: string;
  questions: {
    id: string;
    blank: number;
    stem: string;
    options: [string, string, string, string];
    type?: string;
  }[];
}

// Part 7: Đọc hiểu văn bản (Reading Comprehension)
export interface ExamPart7Passage {
  id: string;
  part: string; // e.g. "Part 7 Single", "Part 7 Double", "Part 7 Triple"
  docType: string;
  title: string;
  passage: string; // Nội dung đoạn văn (hoặc nhiều đoạn ngăn cách)
  questions: {
    id: string;
    stem: string;
    options: [string, string, string, string];
    type?: string;
  }[];
}

export interface ExamSetContent {
  listening: {
    part1: ExamPart1Question[];
    part2: ExamPart2Question[];
    part3: ExamPart3Conversation[];
    part4: ExamPart4Talk[];
  };
  reading: {
    part5: ExamPart5Question[];
    part6: ExamPart6Passage[];
    part7: ExamPart7Passage[];
  };
}

export interface ExamSetSummary {
  part1: number;
  part2: number;
  part3: number;
  part4: number;
  part5: number;
  part6: number;
  part7: number;
  totalListening: number;
  totalReading: number;
  totalQuestions: number;
}

export interface ExamSet {
  id: string;
  slug: string;
  title: string;
  description: string;
  exam_type: ExamType;
  target_score: number;
  duration_minutes: number;
  total_questions: number;
  parts_summary: ExamSetSummary;
  content: ExamSetContent;
  status: ExamStatus;
  created_at?: string;
  updated_at?: string;
}

export interface ExamSetAnswer {
  id: string;
  exam_set_id: string;
  question_id: string;
  part: number;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  correct_index: number;
  evidence?: string | null;
  explanation: string;
  explanation_vi: string;
}

export interface ExamAttempt {
  id: string;
  user_id: string;
  exam_set_id: string;
  status: AttemptStatus;
  started_at: string;
  submitted_at?: string | null;
  time_spent_seconds: number;
  user_answers: Record<string, number>; // {"t1_p1_01": 1, "t1_p5_101": 3}
  correct_count_listening: number;
  correct_count_reading: number;
  score_listening: number; // 5-495
  score_reading: number;   // 5-495
  total_score: number;     // 10-990
  detailed_results?: Record<string, unknown>;
}
