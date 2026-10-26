"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { formatGrammarTagName } from "@/core/grammarTags";
import {
  validateStemBlank,
  validateOptions,
  validateCorrectIndex,
} from "@/core/adminReview";
import type {
  AdminReviewQuestion,
  AdminReviewActionResult,
  QuestionExplanationData,
} from "./types";

/**
 * Kiểm tra xem người dùng hiện tại có quyền Admin hay không
 */
export async function checkIsAdmin(): Promise<{ isAdmin: boolean; userId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isAdmin: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return {
    isAdmin: profile?.role === "admin",
    userId: user.id,
  };
}

/**
 * Server Action: Lấy danh sách câu hỏi trong hàng đợi duyệt (needs_review)
 * BẤT BIẾN §4.9: Chỉ người có role = 'admin' mới được xem danh sách này.
 */
export async function getReviewQueueAction(): Promise<{
  questions: AdminReviewQuestion[];
  error?: string;
}> {
  const { isAdmin } = await checkIsAdmin();
  if (!isAdmin) {
    return {
      questions: [],
      error: "Không được phép: Bạn không có quyền quản trị viên.",
    };
  }

  const supabase = await createClient();

  // 1. Lấy danh sách câu hỏi cần duyệt
  const { data: rawQuestions, error: qError } = await supabase
    .from("questions")
    .select(
      `
      id,
      stem,
      option_a,
      option_b,
      option_c,
      option_d,
      tag_id,
      difficulty,
      status,
      created_at,
      grammar_tags (
        tag_code,
        name_vi
      )
    `
    )
    .in("status", ["needs_review", "draft"])
    .order("created_at", { ascending: true });

  if (qError || !rawQuestions) {
    return {
      questions: [],
      error: qError?.message || "Không thể tải danh sách hàng đợi duyệt.",
    };
  }

  const questionIds = rawQuestions.map((q) => q.id);

  // 2. Lấy đáp án và giải thích cho các câu hỏi này
  const { data: answers } = await supabase
    .from("question_answers")
    .select("question_id, correct_index, explanation")
    .in("question_id", questionIds);

  const answerMap = new Map<string, { correct_index: number; explanation: QuestionExplanationData }>();
  for (const a of answers || []) {
    answerMap.set(a.question_id, {
      correct_index: a.correct_index,
      explanation: a.explanation as QuestionExplanationData,
    });
  }

  // 3. Lấy báo cáo từ học viên (nếu có)
  const { data: reports } = await supabase
    .from("question_reports")
    .select("id, question_id, reason, notes, created_at")
    .in("question_id", questionIds)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const reportMap = new Map<string, Array<{ id: string; reason: string; notes: string; created_at: string }>>();
  for (const r of reports || []) {
    if (!reportMap.has(r.question_id)) {
      reportMap.set(r.question_id, []);
    }
    reportMap.get(r.question_id)!.push({
      id: r.id,
      reason: r.reason,
      notes: r.notes || "",
      created_at: r.created_at,
    });
  }

  // 4. Định dạng kết quả hoàn chỉnh
  interface RawQuestionRow {
    id: string;
    stem: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    tag_id: number;
    difficulty: number;
    status: "draft" | "needs_review" | "published" | "retired";
    created_at: string;
    grammar_tags: {
      tag_code: string;
      name_vi: string;
    } | null;
  }

  const questions: AdminReviewQuestion[] = (rawQuestions as unknown as RawQuestionRow[]).map((q) => {
    const ans = answerMap.get(q.id);
    const tagCode = q.grammar_tags?.tag_code || "";
    const tagName = q.grammar_tags?.name_vi || "";

    return {
      id: q.id,
      stem: q.stem,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      tag_id: q.tag_id,
      tag_code: tagCode,
      tag_name_vi: formatGrammarTagName(tagCode, tagName),
      difficulty: q.difficulty,
      status: q.status,
      correct_index: ans?.correct_index ?? 0,
      explanation: ans?.explanation || {
        rule_vi: "",
        why_correct_vi: "",
      },
      reports: reportMap.get(q.id) || [],
      created_at: q.created_at,
    };
  });

  return { questions };
}

/**
 * Server Action: Duyệt câu hỏi (Y) -> status = 'published'
 * Ghi nhận nhật ký quyết định vào review_log (§6.6)
 */
export async function approveQuestionAction(
  questionId: string,
  notes: string = ""
): Promise<AdminReviewActionResult> {
  const { isAdmin, userId } = await checkIsAdmin();
  if (!isAdmin || !userId) {
    return { success: false, error: "Không được phép: Bạn không có quyền quản trị viên." };
  }

  const supabase = await createClient();

  // 1. Cập nhật trạng thái câu hỏi
  const { error: updateError } = await supabase
    .from("questions")
    .update({ status: "published" })
    .eq("id", questionId);

  if (updateError) {
    return { success: false, error: "Lỗi cập nhật câu hỏi: " + updateError.message };
  }

  // 2. Cập nhật các báo cáo liên quan (nếu có) thành đã giải quyết
  await supabase
    .from("question_reports")
    .update({ status: "resolved" })
    .eq("question_id", questionId)
    .eq("status", "pending");

  // 3. Ghi vào review_log
  await supabase.from("review_log").insert({
    admin_id: userId,
    question_id: questionId,
    action: "approved",
    previous_status: "needs_review",
    new_status: "published",
    notes: notes.trim(),
  });

  revalidatePath("/admin/review");
  return { success: true, message: "Đã duyệt và xuất bản câu hỏi thành công." };
}

/**
 * Server Action: Loại câu hỏi (N) -> status = 'retired'
 * Ghi nhận nhật ký quyết định vào review_log (§6.6)
 */
export async function rejectQuestionAction(
  questionId: string,
  notes: string = ""
): Promise<AdminReviewActionResult> {
  const { isAdmin, userId } = await checkIsAdmin();
  if (!isAdmin || !userId) {
    return { success: false, error: "Không được phép: Bạn không có quyền quản trị viên." };
  }

  const supabase = await createClient();

  // 1. Cập nhật trạng thái câu hỏi thành retired
  const { error: updateError } = await supabase
    .from("questions")
    .update({ status: "retired" })
    .eq("id", questionId);

  if (updateError) {
    return { success: false, error: "Lỗi cập nhật câu hỏi: " + updateError.message };
  }

  // 2. Cập nhật báo cáo thành reviewed
  await supabase
    .from("question_reports")
    .update({ status: "reviewed" })
    .eq("question_id", questionId)
    .eq("status", "pending");

  // 3. Ghi vào review_log
  await supabase.from("review_log").insert({
    admin_id: userId,
    question_id: questionId,
    action: "rejected",
    previous_status: "needs_review",
    new_status: "retired",
    notes: notes.trim(),
  });

  revalidatePath("/admin/review");
  return { success: true, message: "Đã loại câu hỏi khỏi ngân hàng đề thi." };
}

/**
 * Server Action: Sửa nhẹ câu hỏi (Edit Mode)
 * Kiểm tra chặt S3 (đúng 1 chỗ trống), S4 (đúng 4 phương án không rỗng/trùng), S5 (chỉ số đáp án đúng)
 */
export async function editQuestionAction(
  questionId: string,
  data: {
    stem: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_index: number;
    rule_vi?: string;
    why_correct_vi?: string;
    notes?: string;
  }
): Promise<AdminReviewActionResult> {
  const { isAdmin, userId } = await checkIsAdmin();
  if (!isAdmin || !userId) {
    return { success: false, error: "Không được phép: Bạn không có quyền quản trị viên." };
  }

  // 1. Kiểm tra S3: chỗ trống
  const blankCheck = validateStemBlank(data.stem);
  if (!blankCheck.valid) {
    return { success: false, error: blankCheck.error };
  }

  // 2. Kiểm tra S4: 4 phương án
  const optCheck = validateOptions([
    data.option_a,
    data.option_b,
    data.option_c,
    data.option_d,
  ]);
  if (!optCheck.valid) {
    return { success: false, error: optCheck.error };
  }

  // 3. Kiểm tra S5: chỉ số đáp án
  if (!validateCorrectIndex(data.correct_index)) {
    return { success: false, error: "Chỉ số đáp án đúng không hợp lệ (0-3)." };
  }

  const supabase = await createClient();

  // 4. Cập nhật questions
  const { error: qError } = await supabase
    .from("questions")
    .update({
      stem: data.stem.trim(),
      option_a: data.option_a.trim(),
      option_b: data.option_b.trim(),
      option_c: data.option_c.trim(),
      option_d: data.option_d.trim(),
    })
    .eq("id", questionId);

  if (qError) {
    return { success: false, error: "Lỗi cập nhật nội dung câu hỏi: " + qError.message };
  }

  // 5. Cập nhật question_answers nếu có thay đổi
  const { data: currentAns } = await supabase
    .from("question_answers")
    .select("explanation")
    .eq("question_id", questionId)
    .single();

  const currentExpl = (currentAns?.explanation || {}) as Record<string, unknown>;
  const updatedExpl = {
    ...currentExpl,
    ...(data.rule_vi !== undefined ? { rule_vi: data.rule_vi.trim() } : {}),
    ...(data.why_correct_vi !== undefined ? { why_correct_vi: data.why_correct_vi.trim() } : {}),
  };

  await supabase
    .from("question_answers")
    .update({
      correct_index: data.correct_index,
      explanation: updatedExpl,
    })
    .eq("question_id", questionId);

  // 6. Ghi vào review_log
  await supabase.from("review_log").insert({
    admin_id: userId,
    question_id: questionId,
    action: "edited",
    previous_status: "needs_review",
    new_status: "needs_review",
    notes: data.notes?.trim() || "Chỉnh sửa câu hỏi trong chế độ Edit Mode",
  });

  revalidatePath("/admin/review");
  return { success: true, message: "Đã cập nhật câu hỏi thành công." };
}
