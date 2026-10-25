import type { Metadata } from "next";
import { getDashboardSummaryAction } from "@/features/stats/actions";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard — Luyện thi TOEIC Part 5 Thích ứng",
  description:
    "Trang tổng quan học tập thích ứng TOEIC Part 5 với mô hình Wilson z=1.96 và FSRS Spaced Repetition.",
};

export default async function HomePage() {
  const summary = await getDashboardSummaryAction();

  return <DashboardView summary={summary} />;
}
