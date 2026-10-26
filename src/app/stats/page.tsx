import type { Metadata } from "next";
import {
  getSkillMasteryStatsAction,
  getDailyActivityStatsAction,
} from "@/features/stats/actions";
import { StatsView } from "@/features/stats/components/stats-view";

export const metadata: Metadata = {
  title: "Thống kê & Độ vững Kỹ năng | TOEIC",
  description:
    "Chẩn đoán điểm yếu ngữ pháp TOEIC Part 5 theo mô hình khoảng tin cậy Wilson z=1.96.",
};

export default async function StatsPage() {
  const [stats, dailyActivity] = await Promise.all([
    getSkillMasteryStatsAction(),
    getDailyActivityStatsAction(),
  ]);

  return <StatsView stats={stats} dailyActivity={dailyActivity} />;
}
