"use server";

import { getOptionalUser } from "@/shared/auth";
import { formatGrammarTagName } from "@/core/grammarTags";
import {
  calculateMasteryPercentage,
  getMasteryLabel,
  getMasteryBadgeInfo,
  type MasteryLabel,
  type MasteryBadgeInfo,
} from "@/core/wilson";

export interface TopicMasteryItem {
  tagId: number;
  tagCode: string;
  nameVi: string;
  totalAttempts: number;
  correctAttempts: number;
  masteryPercentage: number;
  masteryLabel: MasteryLabel;
  badgeInfo: MasteryBadgeInfo;
}

export interface SkillMasteryStatsResult {
  group1Sufficient: TopicMasteryItem[]; // Nhóm 1: Đủ dữ liệu (>= 5 câu), sắp xếp tăng dần theo độ vững
  group2Insufficient: TopicMasteryItem[]; // Nhóm 2: Chưa đủ dữ liệu (< 5 câu)
  weakestTopic: TopicMasteryItem | null;
  totalAttempts: number;
  totalCorrect: number;
  overallAccuracy: number;
  error?: string;
}

export interface DailyActivityItem {
  date: string; // YYYY-MM-DD
  dayLabel: string; // "T2", "T3", ..., hoặc "Hôm nay"
  fullDateFormatted: string; // "26/10"
  count: number;
  isToday: boolean;
}

export interface DashboardSummaryResult {
  streakDays: number;
  dueCardsCount: number;
  recommendedTopic: TopicMasteryItem | null;
  topAttentionTopics: TopicMasteryItem[];
  totalQuestionsAnswered: number;
  averageMasteryScore: number;
  recentActivity: DailyActivityItem[];
}

/**
 * Server Action: Lấy dữ liệu độ vững 16 chủ điểm ngữ pháp theo Wilson z=1.96
 * Tách rõ Nhóm 1 (Đủ dữ liệu) và Nhóm 2 (Chưa đủ dữ liệu) theo docs/05-design/screens.md §5.6 M8
 */
export async function getSkillMasteryStatsAction(): Promise<SkillMasteryStatsResult> {
  const { user, supabase } = await getOptionalUser();

  // 1. Lấy toàn bộ 16 chủ điểm ngữ pháp
  const { data: allTags, error: tagsError } = await supabase
    .from("grammar_tags")
    .select("id, tag_code, name_vi")
    .order("id");

  if (tagsError || !allTags) {
    return {
      group1Sufficient: [],
      group2Insufficient: [],
      weakestTopic: null,
      totalAttempts: 0,
      totalCorrect: 0,
      overallAccuracy: 0,
      error: tagsError?.message || "Không thể tải danh sách chủ điểm ngữ pháp.",
    };
  }

  if (!user) {
    // Khách chưa đăng nhập: Trả về trạng thái trắng với 16 chủ điểm chưa đủ dữ liệu
    const group2 = allTags.map((t) => ({
      tagId: t.id,
      tagCode: t.tag_code,
      nameVi: formatGrammarTagName(t.tag_code, t.name_vi),
      totalAttempts: 0,
      correctAttempts: 0,
      masteryPercentage: 0,
      masteryLabel: "insufficient" as MasteryLabel,
      badgeInfo: getMasteryBadgeInfo(0, 0),
    }));

    return {
      group1Sufficient: [],
      group2Insufficient: group2,
      weakestTopic: group2[0] || null,
      totalAttempts: 0,
      totalCorrect: 0,
      overallAccuracy: 0,
    };
  }

  // 2. Lấy dữ liệu attempts đã nộp của người dùng
  const { data: attempts } = await supabase
    .from("attempts")
    .select("tag_id, is_correct")
    .eq("user_id", user.id);

  // Thống kê số lần làm và số lần đúng theo từng tag_id
  const statsByTag: Record<number, { total: number; correct: number }> = {};
  let totalAttempts = 0;
  let totalCorrect = 0;

  for (const a of attempts || []) {
    totalAttempts++;
    if (a.is_correct) totalCorrect++;

    if (!statsByTag[a.tag_id]) {
      statsByTag[a.tag_id] = { total: 0, correct: 0 };
    }
    statsByTag[a.tag_id].total++;
    if (a.is_correct) {
      statsByTag[a.tag_id].correct++;
    }
  }

  // 3. Phân bổ vào 16 chủ điểm
  const group1: TopicMasteryItem[] = [];
  const group2: TopicMasteryItem[] = [];

  for (const tag of allTags) {
    const stats = statsByTag[tag.id] || { total: 0, correct: 0 };
    const pct = calculateMasteryPercentage(stats.correct, stats.total);
    const label = getMasteryLabel(stats.total, pct);
    const badgeInfo = getMasteryBadgeInfo(stats.total, pct);

    const item: TopicMasteryItem = {
      tagId: tag.id,
      tagCode: tag.tag_code,
      nameVi: formatGrammarTagName(tag.tag_code, tag.name_vi),
      totalAttempts: stats.total,
      correctAttempts: stats.correct,
      masteryPercentage: pct,
      masteryLabel: label,
      badgeInfo,
    };

    if (stats.total >= 5) {
      group1.push(item);
    } else {
      group2.push(item);
    }
  }

  // Nhóm 1: Sắp xếp tăng dần theo độ vững (Yếu nhất đứng đầu để học viên tập trung)
  group1.sort((a, b) => a.masteryPercentage - b.masteryPercentage);

  // Nhóm 2: Sắp xếp giảm dần theo số câu đã làm (gần đủ 5 câu nhất đứng đầu)
  group2.sort((a, b) => b.totalAttempts - a.totalAttempts);

  // Xác định chủ điểm yếu nhất cần ưu tiên luyện tập
  let weakestTopic: TopicMasteryItem | null = null;
  if (group1.length > 0) {
    weakestTopic = group1[0];
  } else if (group2.length > 0) {
    // Nếu chưa có chủ điểm nào đủ 5 câu, chọn chủ điểm phổ biến nhất ("Dạng từ" id=1)
    weakestTopic = group2.find((t) => t.tagCode === "part_of_speech") || group2[0];
  }

  const overallAccuracy =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  return {
    group1Sufficient: group1,
    group2Insufficient: group2,
    weakestTopic,
    totalAttempts,
    totalCorrect,
    overallAccuracy,
  };
}

/**
 * Server Action: Lấy dữ liệu hoạt động làm bài trong 14 ngày gần nhất
 * Dành cho biểu đồ SVG thuần túy theo tiêu chuẩn docs/05-design/screens.md §5.6 M8
 */
export async function getDailyActivityStatsAction(): Promise<DailyActivityItem[]> {
  const { user, supabase } = await getOptionalUser();

  const days: DailyActivityItem[] = [];
  const now = new Date();

  // Tạo mốc 14 ngày liên tục từ quá khứ đến hôm nay theo múi giờ Asia/Ho_Chi_Minh (Bất biến D-16)
  const dateCounts: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toLocaleDateString("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
    dateCounts[dateStr] = 0;
  }

  if (user) {
    // Lấy dư 15 ngày theo UTC để bao trọn 14 ngày lịch Việt Nam
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString();

    const { data: attempts } = await supabase
      .from("attempts")
      .select("answered_at")
      .eq("user_id", user.id)
      .gte("answered_at", fifteenDaysAgo);

    for (const a of attempts || []) {
      // Chuyển sang múi giờ Asia/Ho_Chi_Minh
      const attemptDate = new Date(a.answered_at);
      const localDateStr = attemptDate.toLocaleDateString("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
      });
      if (dateCounts[localDateStr] !== undefined) {
        dateCounts[localDateStr]++;
      }
    }
  }

  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const todayStr = now.toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toLocaleDateString("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
    const isToday = dateStr === todayStr;
    const dayIndex = new Date(dateStr + "T12:00:00+07:00").getDay();
    const dayLabel = isToday ? "Hôm nay" : dayNames[dayIndex];
    const parts = dateStr.split("-");
    const fullDateFormatted = `${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}`;

    days.push({
      date: dateStr,
      dayLabel,
      fullDateFormatted,
      count: dateCounts[dateStr] || 0,
      isToday,
    });
  }

  return days;
}

/**
 * Server Action: Lấy số ngày học liên tục (Streak) của người dùng hiện tại
 * BẤT BIẾN OQ-6: Tính theo Asia/Ho_Chi_Minh, hợp nhất cả câu luyện và thẻ ôn
 */
export async function getUserStreakAction(): Promise<number> {
  const { user, supabase } = await getOptionalUser();
  if (!user) return 0;

  const [attemptsRes, reviewsRes] = await Promise.all([
    supabase
      .from("attempts")
      .select("answered_at")
      .eq("user_id", user.id)
      .order("answered_at", { ascending: false }),
    supabase
      .from("card_reviews")
      .select("reviewed_at")
      .eq("user_id", user.id)
      .order("reviewed_at", { ascending: false }),
  ]);

  const activeDates = new Set<string>();
  for (const a of attemptsRes.data || []) {
    const d = new Date(a.answered_at).toLocaleDateString("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
    activeDates.add(d);
  }
  for (const r of reviewsRes.data || []) {
    const d = new Date(r.reviewed_at).toLocaleDateString("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
    activeDates.add(d);
  }

  if (activeDates.size === 0) return 0;

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
  const yesterdayDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const yesterday = yesterdayDate.toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

  const hasActivityToday = activeDates.has(today);
  const hasActivityYesterday = activeDates.has(yesterday);

  let streakDays = 0;
  if (hasActivityToday || hasActivityYesterday) {
    let checkDate = new Date();
    if (!hasActivityToday) {
      checkDate = yesterdayDate;
    }

    while (true) {
      const dateStr = checkDate.toLocaleDateString("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
      });
      if (activeDates.has(dateStr)) {
        streakDays++;
        checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }
  }

  return streakDays;
}

/**
 * Server Action: Lấy tổng hợp thông số Dashboard cho trang chủ M2
 */
export async function getDashboardSummaryAction(): Promise<DashboardSummaryResult> {
  const { user, supabase } = await getOptionalUser();

  // 1. Thống kê độ vững và chủ điểm
  const masteryStats = await getSkillMasteryStatsAction();

  // 2. Thống kê 14 ngày gần nhất
  const recentActivity = await getDailyActivityStatsAction();

  // 3. Đếm số thẻ từ vựng đến hạn ôn tập FSRS
  let dueCardsCount = 0;
  if (user) {
    const nowIso = new Date().toISOString();
    const { count } = await supabase
      .from("review_cards")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .lte("due", nowIso);
    dueCardsCount = count || 0;
  }

  // 4. Tính toán chuỗi ngày học liên tục (Streak) - Bất biến OQ-6 (câu luyện hoặc thẻ ôn)
  const streakDays = await getUserStreakAction();

  // Top 3 chủ điểm cần chú ý (PD-08: mobile chỉ hiện Top 3)
  const topAttentionTopics: TopicMasteryItem[] = [];
  if (masteryStats.group1Sufficient.length > 0) {
    topAttentionTopics.push(...masteryStats.group1Sufficient.slice(0, 3));
  }
  // Nếu chưa đủ 3 từ nhóm 1, lấy thêm từ nhóm 2
  if (topAttentionTopics.length < 3) {
    const needed = 3 - topAttentionTopics.length;
    topAttentionTopics.push(...masteryStats.group2Insufficient.slice(0, needed));
  }

  // Điểm độ vững trung bình của các chủ điểm đã có dữ liệu
  let averageMasteryScore = 0;
  if (masteryStats.group1Sufficient.length > 0) {
    const sum = masteryStats.group1Sufficient.reduce(
      (acc, cur) => acc + cur.masteryPercentage,
      0
    );
    averageMasteryScore = Math.round(
      sum / masteryStats.group1Sufficient.length
    );
  }

  return {
    streakDays,
    dueCardsCount,
    recommendedTopic: masteryStats.weakestTopic,
    topAttentionTopics,
    totalQuestionsAnswered: masteryStats.totalAttempts,
    averageMasteryScore,
    recentActivity,
  };
}
