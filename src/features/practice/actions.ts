"use server";

import { createClient } from "@/lib/supabase/server";
import { getOptionalUser } from "@/shared/auth";
import { formatGrammarTagName } from "@/core/grammarTags";
import { parseExplanation } from "./schemas";
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

  const questions: PracticeQuestion[] = (
    (data.questions || []) as PracticeQuestion[]
  ).map((q) => ({
    ...q,
    tag_name_vi: formatGrammarTagName("", q.tag_name_vi),
  }));

  return {
    sessionId: data.session_id,
    totalQuestions: data.total_questions,
    questions,
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

  // Tận dụng Zod parseExplanation để đảm bảo dữ liệu giải thích luôn an toàn và đầy đủ
  const rawResponse = data as SubmitAnswerResponse;
  const safeExplanation = parseExplanation(rawResponse.explanation);

  return {
    result: {
      ...rawResponse,
      explanation: safeExplanation,
    },
  };
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

export type ValidEventName =
  | "explanation_viewed"
  | "explanation_expand_clicked"
  | "report_opened"
  | "vocab_saved"
  | "review_started";

/**
 * Server Action: Ghi nhận sự kiện hành vi học tập vào bảng events
 * BẤT BIẾN §6.6 & D-08: Không bao giờ lưu nội dung câu hỏi/câu trả lời vào metadata.
 */
export async function trackEventAction(
  eventName: ValidEventName,
  metadata: Record<string, unknown> = {}
): Promise<{ success: boolean }> {
  try {
    const { user, supabase } = await getOptionalUser();

    if (!user) {
      return { success: false };
    }

    await supabase.from("events").insert({
      user_id: user.id,
      event_name: eventName,
      metadata,
    });

    return { success: true };
  } catch {
    // Analytics error không làm gián đoạn trải nghiệm học tập của người dùng
    return { success: false };
  }
}

export type ReportReason =
  | "multiple_correct"
  | "none_correct"
  | "typo"
  | "unclear"
  | "other";

/**
 * Server Action: Báo lỗi câu hỏi (Milestone 5)
 * BẤT BIẾN §4.4: 3 báo cáo cùng lý do sẽ kích hoạt trigger Postgres đưa câu hỏi về 'needs_review'
 */
export async function reportQuestionAction(
  questionId: string,
  reason: ReportReason,
  notes: string = ""
): Promise<{ success: boolean; message: string }> {
  const { user, supabase } = await getOptionalUser();

  if (!user) {
    return {
      success: false,
      message: "Vui lòng đăng nhập để gửi báo cáo câu hỏi.",
    };
  }

  // 1. Kiểm tra xem người dùng đã báo cáo câu hỏi này với cùng lý do trong trạng thái pending chưa
  const { data: existing } = await supabase
    .from("question_reports")
    .select("id")
    .eq("user_id", user.id)
    .eq("question_id", questionId)
    .eq("reason", reason)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    return {
      success: true,
      message: "Bạn đã gửi báo cáo này trước đó. Đội ngũ học thuật đang rà soát!",
    };
  }

  // 2. Ghi nhận báo cáo mới
  const { error } = await supabase.from("question_reports").insert({
    user_id: user.id,
    question_id: questionId,
    reason,
    notes: notes.slice(0, 200), // Giới hạn tối đa 200 ký tự
    status: "pending",
  });

  if (error) {
    return {
      success: false,
      message: "Không thể gửi báo cáo lúc này. Vui lòng thử lại sau.",
    };
  }

  return {
    success: true,
    message: "Cảm ơn bạn! Báo cáo câu hỏi đã được ghi nhận.",
  };
}

export interface PracticeTopicInfo {
  tag_id: number;
  tag_code: string;
  name_vi: string;
  available_count: number;
}

/**
 * Server Action: Lấy danh sách chủ điểm ngữ pháp kèm số lượng câu khả dụng (D-10)
 * Loại trừ các câu người dùng đã trả lời đúng trong 7 ngày gần nhất (7x24h trượt).
 */
export async function getPracticeTopicsAction(): Promise<{
  topics: PracticeTopicInfo[];
  allAvailableCount: number;
  error?: string;
}> {
  const { user, supabase } = await getOptionalUser();

  // 1. Lấy danh sách toàn bộ chủ điểm ngữ pháp
  const { data: tags, error: tagsError } = await supabase
    .from("grammar_tags")
    .select("id, tag_code, name_vi")
    .order("id");

  if (tagsError || !tags) {
    return { topics: [], allAvailableCount: 0, error: tagsError?.message };
  }

  // 2. Lấy danh sách ID các câu hỏi mà người dùng đã làm đúng trong 7 ngày qua
  let excludedQuestionIds: string[] = [];
  if (user) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentAttempts } = await supabase
      .from("attempts")
      .select("question_id")
      .eq("user_id", user.id)
      .eq("is_correct", true)
      .gte("answered_at", sevenDaysAgo);

    if (recentAttempts) {
      excludedQuestionIds = recentAttempts.map((a) => a.question_id);
    }
  }

  // 3. Lấy tất cả câu hỏi published
  const { data: questions, error: qError } = await supabase
    .from("questions")
    .select("id, tag_id")
    .eq("status", "published");

  if (qError || !questions) {
    return { topics: [], allAvailableCount: 0, error: qError?.message };
  }

  // Lọc các câu chưa làm đúng trong 7 ngày
  const availableQuestions = questions.filter(
    (q) => !excludedQuestionIds.includes(q.id)
  );

  const allAvailableCount = availableQuestions.length;

  // Tính số câu khả dụng theo từng tag
  const topics: PracticeTopicInfo[] = tags.map((t) => {
    const count = availableQuestions.filter((q) => q.tag_id === t.id).length;
    return {
      tag_id: t.id,
      tag_code: t.tag_code,
      name_vi: formatGrammarTagName(t.tag_code, t.name_vi),
      available_count: count,
    };
  });

  return {
    topics,
    allAvailableCount,
  };
}
