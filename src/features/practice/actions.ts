"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  PracticeQuestion,
  SubmitAnswerResponse,
  SessionReviewResponse,
} from "./types";

export interface CreateSessionResult {
  sessionId?: string;
  totalQuestions?: number;
  questions?: PracticeQuestion[];
  error?: string;
}

/**
 * Server Action: Tạo phiên luyện tập mới qua hàm RPC create_session
 */
export async function createSessionAction(
  tagId: number | null = null,
  totalQuestions: number = 10
): Promise<CreateSessionResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("create_session", {
    p_tag_id: tagId,
    p_total_questions: totalQuestions,
  });

  if (error) {
    return { error: error.message };
  }

  if (data?.error) {
    return { error: data.message || data.error };
  }

  return {
    sessionId: data.session_id,
    totalQuestions: data.total_questions,
    questions: data.questions,
  };
}

/**
 * Server Action: Nộp câu trả lời qua hàm RPC submit_answer
 */
export async function submitAnswerAction(
  sessionId: string,
  questionId: string,
  selectedIndex: number
): Promise<{ result?: SubmitAnswerResponse; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("submit_answer", {
    p_session_id: sessionId,
    p_question_id: questionId,
    p_selected_index: selectedIndex,
  });

  if (error) {
    return { error: error.message };
  }

  return { result: data as SubmitAnswerResponse };
}

/**
 * Server Action: Kết thúc phiên luyện tập
 */
export async function finishSessionAction(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("finish_session", {
    p_session_id: sessionId,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Lấy dữ liệu tổng kết phiên cho màn hình kết quả
 */
export async function getSessionReviewAction(
  sessionId: string
): Promise<{ data?: SessionReviewResponse; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_session_review", {
    p_session_id: sessionId,
  });

  if (error) {
    return { error: error.message };
  }

  return { data: data as SessionReviewResponse };
}
