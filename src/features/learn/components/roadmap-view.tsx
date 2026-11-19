"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  LearningRoadmapState,
  RoadmapStageProgress,
  RoadmapStepProgress,
} from "@/core/roadmap";
import type { LearnProgressStore } from "@/features/learn/lib/learn-progress-storage";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Layers,
  Library,
  Play,
  Target,
  AlertTriangle,
} from "lucide-react";

interface RoadmapViewProps {
  roadmap: LearningRoadmapState;
  localProgressStore?: LearnProgressStore;
}

function getStageStatusMeta(status: RoadmapStageProgress["status"]) {
  switch (status) {
    case "completed":
      return {
        symbol: "✓",
        label: "Hoàn thành chặng",
        badgeClass: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]",
        keycapClass: "bg-[#047857] text-white",
      };
    case "active":
      return {
        symbol: "▶",
        label: "Đang học",
        badgeClass: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]",
        keycapClass: "bg-[#2563EB] text-white",
      };
    case "guided_locked":
    default:
      return {
        symbol: "•",
        label: "Khuyên học sau",
        badgeClass: "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]",
        keycapClass: "bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]",
      };
  }
}

function getStepStatusMeta(step: RoadmapStepProgress) {
  switch (step.status) {
    case "mastered":
      return {
        symbol: "✓",
        label: "Thành thạo",
        badgeClass: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]",
      };
    case "proficient":
      return {
        symbol: "~",
        label: "Khá chắc",
        badgeClass: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]",
      };
    case "needs_review":
      return {
        symbol: "!",
        label: "Cần củng cố",
        badgeClass: "bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]",
      };
    case "recommended_next":
      return {
        symbol: "▶",
        label:
          step.masteryLabel === "needs_review"
            ? "Ưu tiên củng cố"
            : "Bước tiếp theo",
        badgeClass:
          step.masteryLabel === "needs_review"
            ? "bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]"
            : "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]",
      };
    case "in_progress":
      return {
        symbol: "…",
        label: `Đang khởi động (${step.totalAttempts}/5)`,
        badgeClass: "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]",
      };
    case "advised_later":
      return {
        symbol: "•",
        label: "Chặng sau",
        badgeClass: "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]",
      };
    case "up_next":
    default:
      return {
        symbol: "○",
        label: "Chưa học",
        badgeClass: "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]",
      };
  }
}

export function RoadmapView({
  roadmap,
  localProgressStore = {},
}: RoadmapViewProps) {
  const [expandedStageIds, setExpandedStageIds] = useState<
    Record<string, boolean>
  >(() => {
    const initial: Record<string, boolean> = {};
    for (const st of roadmap.stages) {
      initial[st.stage.id] = st.stage.id === roadmap.activeStage.stage.id;
    }
    return initial;
  });

  const toggleStage = (stageId: string) => {
    setExpandedStageIds((prev) => ({
      ...prev,
      [stageId]: !prev[stageId],
    }));
  };

  const { nextStep, activeStage } = roadmap;
  const nextStepSelfDone = Object.keys(
    localProgressStore[nextStep.tagCode]?.solved ?? {}
  ).length;

  return (
    <div className="space-y-5">
      {/* 1. Thanh Tiến Độ Tổng Quan Gọn Nhẹ (Đẩy Hero Bước Tiếp Theo lên ngay đầu tầm mắt) */}
      <section
        aria-label="Tiến độ lộ trình học"
        className="p-4 rounded-xl bg-[#FAFAF7] border border-[#E2E8F0] space-y-2.5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] font-mono font-bold uppercase tracking-[0.08em] text-[#475569] flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#2563EB]" aria-hidden="true" />
            <span>
              Mục tiêu {roadmap.targetScore} (Chặng 1–{roadmap.targetStageCount}:{" "}
              {roadmap.goalClearedCount}/{roadmap.goalTotalSteps})
            </span>
            <Link
              href="/profile"
              className="font-sans font-semibold normal-case tracking-normal text-[#2563EB] hover:underline ml-1"
            >
              Đổi
            </Link>
          </div>

          <div className="text-[12px] font-mono font-bold text-[#0F172A] tabular-nums">
            <span className="text-[#2563EB]">{roadmap.clearedCount}</span>
            <span className="text-[#475569]">/{roadmap.totalSteps} chủ điểm</span>
            <span className="text-[#475569] font-normal">
              {" "}
              ({roadmap.overallProgressPct}%)
            </span>
          </div>
        </div>

        {/* Thanh tiến độ liên tục 8px chuẩn §5.5 */}
        <div
          role="progressbar"
          aria-label="Tiến độ hoàn thành 16 chủ điểm theo lộ trình"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={roadmap.overallProgressPct}
          className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden border border-[#E2E8F0]"
        >
          <div
            className="h-full bg-[#2563EB] transition-all duration-300"
            style={{
              width: `${Math.max(
                roadmap.overallProgressPct,
                roadmap.clearedCount > 0 ? 4 : 0
              )}%`,
            }}
          />
        </div>
      </section>

      {/* 2. Hero Card: Bước Tiếp Theo Khuyên Học (CHỨA NÚT PRIMARY DUY NHẤT CỦA MÀN HÌNH) */}
      <section
        aria-labelledby="next-roadmap-step-heading"
        className="p-5 sm:p-6 rounded-xl bg-white border border-[#E2E8F0] border-l-4 border-l-[#2563EB] space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
              <Play className="w-3 h-3" aria-hidden="true" />
              <span>
                Bước {nextStep.order}/16 · Chặng {activeStage.stage.stageNumber}
              </span>
            </span>

            {nextStep.masteryLabel === "needs_review" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]">
                <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                <span>[!] Cần củng cố ({nextStep.masteryPercentage}%)</span>
              </span>
            )}

            {roadmap.isAllCleared && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                <Check className="w-3 h-3" aria-hidden="true" />
                <span>[✓] Đã qua hết 16 cổng — Tối ưu điểm số</span>
              </span>
            )}
          </div>

          <span className="text-[12px] font-mono text-[#475569] tabular-nums">
            {nextStep.totalAttempts > 0
              ? `Luyện đề: ${nextStep.correctAttempts}/${nextStep.totalAttempts} câu`
              : "Chưa làm đề"}
          </span>
        </div>

        <div className="space-y-1.5">
          <h2
            id="next-roadmap-step-heading"
            className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight"
          >
            {roadmap.isAllCleared ? "Ôn nâng cao: " : "Bước tiếp theo: "}
            {nextStep.fullNameVi}
          </h2>
          <p className="text-[14px] text-[#475569] leading-relaxed">
            {nextStep.prerequisiteReason}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[12px] font-mono text-[#475569]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0]">
            <Layers className="w-3.5 h-3.5 text-[#2563EB]" aria-hidden="true" />
            <span>
              {nextStep.moduleCount} học phần nhỏ · {nextStep.exerciseCount} bài tập
            </span>
          </span>
          {nextStepSelfDone > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] tabular-nums">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                Đã tự luyện {Math.min(nextStepSelfDone, nextStep.exerciseCount)}/
                {nextStep.exerciseCount}
              </span>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0]">
            <BookOpen className="w-3.5 h-3.5 text-[#0F172A]" aria-hidden="true" />
            <span>{nextStep.focusScope}</span>
          </span>
        </div>

        {/* Actions: Duy nhất 1 Primary CTA + 1 Secondary */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <Link
            href={`/learn/${nextStep.tagCode}`}
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg text-[15px] font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            <span>Học từng phần · Bước {nextStep.order}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>

          <Link
            href={`/practice/new?topic=${nextStep.tagCode}`}
            className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg text-[14px] font-medium bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#8190A6] transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
          >
            <Target className="w-4 h-4 text-[#475569]" aria-hidden="true" />
            <span>Luyện Part 5 chủ điểm này</span>
          </Link>
        </div>
      </section>

      {/* 3. Trục Lộ Trình 4 Chặng */}
      <div className="space-y-4">
        {roadmap.stages.map((stageProgress) => {
          const {
            stage,
            steps,
            clearedCount,
            totalSteps,
            progressPct,
            status,
            isWithinUserTarget,
          } = stageProgress;
          const stageMeta = getStageStatusMeta(status);
          const isExpanded = Boolean(expandedStageIds[stage.id]);
          const panelId = `roadmap-panel-${stage.id}`;

          return (
            <section
              key={stage.id}
              aria-labelledby={`stage-heading-${stage.id}`}
              className={`rounded-xl border bg-white overflow-hidden transition-colors ${
                status === "active"
                  ? "border-[#2563EB]/50"
                  : "border-[#E2E8F0]"
              }`}
            >
              {/* Header Chặng (Nút bấm mở/đóng, min-h 44px) */}
              <button
                type="button"
                aria-expanded={isExpanded}
                aria-controls={panelId}
                onClick={() => toggleStage(stage.id)}
                className="w-full min-h-[44px] p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 text-left hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span
                    className={`w-9 h-9 rounded-lg font-mono text-[13px] font-bold flex items-center justify-center shrink-0 tabular-nums ${stageMeta.keycapClass}`}
                  >
                    0{stage.stageNumber}
                  </span>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${stageMeta.badgeClass}`}
                      >
                        <span aria-hidden="true">{stageMeta.symbol}</span>
                        <span>{stageMeta.label}</span>
                      </span>
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                        {stage.targetRangeLabel}
                      </span>
                      {!isWithinUserTarget && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FAFAF7] text-[#475569] border border-[#E2E8F0]">
                          Mở rộng vượt {roadmap.targetScore}
                        </span>
                      )}
                    </div>

                    <h2
                      id={`stage-heading-${stage.id}`}
                      className="text-[16px] sm:text-[18px] font-bold text-[#0F172A] leading-snug break-words"
                    >
                      {stage.titleVi}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-1 sm:pt-0">
                  <div className="text-right">
                    <div className="text-[13px] font-mono font-bold text-[#0F172A] tabular-nums">
                      {clearedCount}/{totalSteps}
                    </div>
                    <div className="text-[11px] font-mono text-[#475569] tabular-nums">
                      {progressPct}%
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-[#475569]" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#475569]" aria-hidden="true" />
                  )}
                </div>
              </button>

              {/* Nội dung chi tiết của Chặng */}
              {isExpanded && (
                <div
                  id={panelId}
                  className="border-t border-[#E2E8F0] p-4 sm:p-5 space-y-4 bg-[#F8FAFC]/60"
                >
                  <div className="space-y-1">
                    <p className="text-[13px] text-[#475569] leading-relaxed">
                      {stage.subtitleVi}
                    </p>
                    <p className="text-[12px] font-mono text-[#475569]">
                      Cổng chặng: {stage.gateRuleLabel}
                    </p>
                  </div>

                  {/* Khối Từ vựng công sở song hành cùng Chặng */}
                  <div className="p-3.5 rounded-lg bg-[#FAFAF7] border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                        <Library className="w-3.5 h-3.5 text-[#0F172A]" aria-hidden="true" />
                        <span>{stage.vocabClusterLabel}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {stage.vocabTopics.map((topic) => (
                          <span
                            key={topic}
                            className="px-2 py-0.5 rounded text-[11px] font-medium bg-white text-[#0F172A] border border-[#E2E8F0]"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link
                      href="/vocab"
                      className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-lg text-[12px] font-semibold text-[#2563EB] bg-white border border-[#E2E8F0] hover:border-[#2563EB] transition-colors shrink-0"
                    >
                      <span>Mở sổ từ vựng</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>

                  {/* Danh sách các Bước Chủ Điểm trong Chặng */}
                  <ol className="space-y-3">
                    {steps.map((step) => {
                      const stepMeta = getStepStatusMeta(step);
                      const isCurrentFocus = step.isRecommendedNext;
                      const stepSelfDone = Object.keys(
                        localProgressStore[step.tagCode]?.solved ?? {}
                      ).length;

                      return (
                        <li
                          key={step.tagCode}
                          className={`p-4 rounded-xl border transition-colors ${
                            isCurrentFocus
                              ? "bg-[#FAFAF7] border-[#2563EB]/60 border-l-4 border-l-[#2563EB]"
                              : "bg-white border-[#E2E8F0]"
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              {/* Keycap số thứ tự */}
                              <span
                                className={`w-8 h-8 rounded-md font-mono text-[12px] font-bold flex items-center justify-center shrink-0 tabular-nums mt-0.5 ${
                                  step.isGateCleared
                                    ? "bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]"
                                    : isCurrentFocus
                                    ? "bg-[#2563EB] text-white"
                                    : "bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]"
                                }`}
                              >
                                {String(step.order).padStart(2, "0")}
                              </span>

                              <div className="min-w-0 flex-1 space-y-2">
                                {/* Tiêu đề + Badge trạng thái */}
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-[15px] sm:text-[16px] font-bold text-[#0F172A] leading-snug">
                                    {step.nameVi}
                                  </h3>
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${stepMeta.badgeClass}`}
                                  >
                                    <span aria-hidden="true">{stepMeta.symbol}</span>
                                    <span>{stepMeta.label}</span>
                                  </span>
                                </div>

                                {/* Lý do phụ thuộc kiến thức */}
                                <p className="text-[13px] text-[#475569] leading-relaxed">
                                  {step.prerequisiteReason}
                                </p>

                                {/* Metadata học phần nhỏ + bài tập + Thống kê ARM + Tự luyện cục bộ */}
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-mono text-[#475569]">
                                  <span>
                                    {step.moduleCount} phần nhỏ · {step.exerciseCount} bài tập
                                  </span>
                                  {stepSelfDone > 0 && (
                                    <>
                                      <span aria-hidden="true">·</span>
                                      <span className="font-semibold text-[#2563EB] tabular-nums">
                                        Tự luyện{" "}
                                        {Math.min(stepSelfDone, step.exerciseCount)}/
                                        {step.exerciseCount}
                                      </span>
                                    </>
                                  )}
                                  <span aria-hidden="true">·</span>
                                  <span>{step.focusScope}</span>
                                  {step.totalAttempts > 0 && (
                                    <>
                                      <span aria-hidden="true">·</span>
                                      <span className="font-semibold text-[#0F172A] tabular-nums">
                                        {step.correctAttempts}/{step.totalAttempts} câu
                                        {step.totalAttempts >= 5
                                          ? ` (${step.masteryPercentage}%)`
                                          : ""}
                                      </span>
                                    </>
                                  )}
                                </div>

                                {/* Nhảy nhanh vào từng học phần nhỏ */}
                                {step.moduleTitles.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                    {step.moduleTitles.map((mTitle, mIdx) => (
                                      <Link
                                        key={mIdx}
                                        href={`/learn/${step.tagCode}?part=${mIdx + 1}`}
                                        className="inline-flex items-center gap-1 min-h-[36px] px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#F8FAFC] hover:bg-[#EFF6FF] text-[#475569] hover:text-[#2563EB] border border-[#E2E8F0] transition-colors"
                                      >
                                        <span className="font-mono font-bold">
                                          {mIdx + 1}.
                                        </span>
                                        <span>{mTitle}</span>
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Nút hành động (Secondary / Subtle links, touch target >= 44px) */}
                            <div className="flex items-center gap-2 shrink-0 pt-1 md:pt-0">
                              <Link
                                href={`/learn/${step.tagCode}`}
                                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 rounded-lg text-[13px] font-semibold bg-[#F8FAFC] hover:bg-[#EFF6FF] text-[#0F172A] hover:text-[#2563EB] border border-[#E2E8F0] transition-colors"
                              >
                                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Học bài</span>
                              </Link>
                              <Link
                                href={`/practice/new?topic=${step.tagCode}`}
                                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 rounded-lg text-[13px] font-semibold bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#8190A6] transition-colors"
                              >
                                <span>Luyện đề</span>
                                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                              </Link>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
