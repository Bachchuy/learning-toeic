"use server";

import { revalidatePath } from "next/cache";
import { getOptionalUser } from "@/shared/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkIsAdmin } from "@/features/admin/actions";
import {
  SubmitFeedbackSchema,
  FeedbackStatusSchema,
  type FeedbackStatus,
} from "./schemas";
import type { AdminInsightsData, TagInventoryStat, UserFeedbackItem } from "./types";

export async function submitFeedbackAction(input: {
  category: string;
  message: string;
  pagePath?: string;
  viewport?: string;
}): Promise<{ success: boolean; message: string }> {
  const { user, supabase } = await getOptionalUser();
  if (!user) {
    return { success: false, message: "Vui lòng đăng nhập để gửi góp ý." };
  }

  const parsed = SubmitFeedbackSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Dữ liệu góp ý chưa hợp lệ.",
    };
  }

  const { error } = await supabase.from("user_feedback").insert({
    user_id: user.id,
    category: parsed.data.category,
    message: parsed.data.message,
    page_path: parsed.data.pagePath,
    viewport: parsed.data.viewport,
  });

  if (error) {
    return {
      success: false,
      message: "Không thể gửi góp ý lúc này. Vui lòng thử lại sau.",
    };
  }

  return {
    success: true,
    message: "Cảm ơn bạn! Góp ý đã được ghi nhận.",
  };
}

export async function updateFeedbackStatusAction(
  feedbackId: string,
  nextStatus: FeedbackStatus
): Promise<{ success: boolean; error?: string }> {
  const { isAdmin } = await checkIsAdmin();
  if (!isAdmin) {
    return { success: false, error: "Không có quyền quản trị viên." };
  }

  const parsedStatus = FeedbackStatusSchema.safeParse(nextStatus);
  if (!parsedStatus.success) {
    return { success: false, error: "Trạng thái không hợp lệ." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("user_feedback")
    .update({ status: parsedStatus.data })
    .eq("id", feedbackId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/insights");
  return { success: true };
}

export async function getAdminInsightsAction(): Promise<{
  data?: AdminInsightsData;
  error?: string;
}> {
  const { isAdmin } = await checkIsAdmin();
  if (!isAdmin) {
    return { error: "Không được phép: Chỉ dành cho Quản trị viên." };
  }

  const admin = createAdminClient();

  const [
    profilesRes,
    sessionsRes,
    completedSessionsRes,
    attemptsRes,
    examAttemptsRes,
    cardReviewsRes,
    reportsRes,
    passagesRes,
    examsRes,
    tagsRes,
    eventsRes,
    feedbacksRes,
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("practice_sessions").select("*", { count: "exact", head: true }),
    admin
      .from("practice_sessions")
      .select("*", { count: "exact", head: true })
      .not("completed_at", "is", null),
    admin.from("attempts").select("*", { count: "exact", head: true }),
    admin.from("exam_attempts").select("*", { count: "exact", head: true }),
    admin.from("card_reviews").select("*", { count: "exact", head: true }),
    admin.from("question_reports").select("*", { count: "exact", head: true }),
    admin.from("passages").select("*", { count: "exact", head: true }).eq("status", "published"),
    admin.from("exam_sets").select("*", { count: "exact", head: true }).eq("status", "published"),
    admin.from("grammar_tags").select("id, tag_code, name_vi").order("id"),
    admin.from("events").select("event_name").order("created_at", { ascending: false }).limit(1000),
    admin
      .from("user_feedback")
      .select("id, user_id, category, message, page_path, viewport, status, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  // Phân trang lấy toàn bộ questions để đếm chính xác theo tag (tránh giới hạn 1000 dòng)
  const allQuestions: Array<{ tag_id: number | null; status: string; passage_id: string | null }> =
    [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data: qChunk, error: qErr } = await admin
      .from("questions")
      .select("tag_id, status, passage_id")
      .range(from, from + pageSize - 1);
    if (qErr || !qChunk || qChunk.length === 0) break;
    allQuestions.push(...qChunk);
    if (qChunk.length < pageSize) break;
    from += pageSize;
  }

  let part5Total = 0;
  let needsReviewCount = 0;
  const tagCounts: Record<number, number> = {};

  for (const q of allQuestions) {
    if (q.status === "needs_review" || q.status === "draft") {
      needsReviewCount++;
    }
    if (q.status === "published" && !q.passage_id) {
      part5Total++;
      if (q.tag_id) {
        tagCounts[q.tag_id] = (tagCounts[q.tag_id] || 0) + 1;
      }
    }
  }

  const tagStats: TagInventoryStat[] = (tagsRes.data || []).map((t) => ({
    id: t.id,
    tagCode: t.tag_code,
    nameVi: t.name_vi,
    publishedCount: tagCounts[t.id] || 0,
  }));

  const eventMap = new Map<string, number>();
  for (const e of eventsRes.data || []) {
    eventMap.set(e.event_name, (eventMap.get(e.event_name) || 0) + 1);
  }
  const eventBreakdown = Array.from(eventMap.entries())
    .map(([eventName, count]) => ({ eventName, count }))
    .sort((a, b) => b.count - a.count);

  const attemptsCount = attemptsRes.count || 0;
  const reportsCount = reportsRes.count || 0;
  const reportRatePercent =
    attemptsCount > 0 ? Math.round((reportsCount / attemptsCount) * 1000) / 10 : 0;

  const feedbacks: UserFeedbackItem[] = (feedbacksRes.data || []).map((f) => ({
    id: f.id,
    userId: f.user_id,
    category: f.category as UserFeedbackItem["category"],
    message: f.message,
    pagePath: f.page_path,
    viewport: f.viewport,
    status: f.status as FeedbackStatus,
    createdAt: f.created_at,
  }));

  return {
    data: {
      usage: {
        profilesCount: profilesRes.count || 0,
        sessionsCount: sessionsRes.count || 0,
        completedSessionsCount: completedSessionsRes.count || 0,
        attemptsCount,
        examAttemptsCount: examAttemptsRes.count || 0,
        reviewEventsCount: cardReviewsRes.count || 0,
        reportsCount,
        reportRatePercent,
      },
      eventBreakdown,
      content: {
        part5Total,
        passageCount: passagesRes.count || 0,
        examSetsCount: examsRes.count || 0,
        needsReviewCount,
        tagStats,
      },
      feedbacks,
    },
  };
}
