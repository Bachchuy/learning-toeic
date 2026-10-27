import type { Metadata } from "next";
import {
  getSkillMasteryStatsAction,
  getDailyActivityStatsAction,
  getUserStreakAction,
} from "@/features/stats/actions";
import { StatsView } from "@/features/stats/components/stats-view";

export const metadata: Metadata = {
  title: "Thống kê & Độ vững Kỹ năng | TOEIC",
  description:
    "Chẩn đoán điểm yếu ngữ pháp TOEIC Part 5 theo thuật toán Adaptive Rolling Mastery (z=1.0).",
};

export default async function StatsPage() {
  const [stats, dailyActivity, streakDays] = await Promise.all([
    getSkillMasteryStatsAction(),
    getDailyActivityStatsAction(),
    getUserStreakAction(),
  ]);

  return (
    <StatsView
      stats={stats}
      dailyActivity={dailyActivity}
      streakDays={streakDays}
    />
  );
}
