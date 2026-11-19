"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { GrammarLesson, LessonMicroModule } from "@/core/grammarLessons";
import type { getRoadmapContextByTag } from "@/core/roadmap";
import { LessonExerciseList } from "@/features/learn/components/lesson-exercise-card";
import { useLearnTopicProgress } from "@/features/learn/lib/learn-progress-storage";
import { LessonHighlightsContext } from "./lesson-highlights-context";
import {
  CoreRuleSection,
  ModuleTheoryContent,
  QuickCheatSheetPanel,
} from "./lesson-theory-sections";
import { PracticeBridgeSection } from "./lesson-detail-cards";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Compass,
  Eye,
  EyeOff,
  Layers,
  LayoutList,
  RotateCcw,
  Target,
  Zap,
} from "lucide-react";

interface LessonDetailViewProps {
  lesson: GrammarLesson;
  modules: LessonMicroModule[];
  roadmapContext: ReturnType<typeof getRoadmapContextByTag>;
  highlightsBySentence: Record<string, string[]>;
}

export function LessonDetailView({
  lesson,
  modules,
  roadmapContext,
  highlightsBySentence,
}: LessonDetailViewProps) {
  const totalExercises = useMemo(
    () => modules.reduce((sum, m) => sum + m.exercises.length, 0),
    [modules]
  );

  return (
    <LessonHighlightsContext.Provider value={highlightsBySentence}>
      <article className="space-y-6 pt-2 pb-20 animate-in fade-in duration-200">
      {/* 1. Header & Breadcrumb (luôn nằm ngoài Suspense để DOM luôn chỉ có đúng 1 thẻ <h1>) */}
      <header className="space-y-2.5 border-b border-[#E2E8F0] pb-4">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 min-h-[44px] pr-2 -ml-1 px-1 rounded-lg text-[13px] font-medium text-[#475569] hover:text-[#0F172A] transition-colors focus:outline-hidden focus:underline"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Quay lại Lộ trình &amp; Lý thuyết</span>
        </Link>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            <BookOpen className="w-3 h-3" aria-hidden="true" />
            {lesson.categoryVi}
          </span>
          {roadmapContext && (
            <Link
              href="/learn"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-[0.04em] bg-[#FAFAF7] text-[#2563EB] border border-[#E2E8F0] hover:border-[#2563EB] transition-colors"
            >
              <Compass className="w-3 h-3" aria-hidden="true" />
              <span>
                Bước {roadmapContext.step.order}/16 · Chặng{" "}
                {roadmapContext.stage.stageNumber}
              </span>
            </Link>
          )}
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#475569] px-2 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0] tabular-nums">
            <Layers className="w-3 h-3" aria-hidden="true" />
            {modules.length} học phần · {totalExercises} bài tập
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#475569] px-2 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0] tabular-nums">
            <Clock className="w-3 h-3" aria-hidden="true" />
            ~{lesson.estimatedMinutes} phút
          </span>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-[24px] sm:text-[32px] font-bold tracking-[-0.02em] text-[#0F172A] leading-[1.2]">
            {lesson.titleVi}
          </h1>
          <p className="text-[14px] sm:text-[15px] text-[#475569] leading-[1.6] max-w-[68ch]">
            {lesson.taglineVi}
          </p>
        </div>

        {roadmapContext && (
          <div className="p-3 rounded-lg bg-[#FAFAF7] border border-[#E2E8F0] border-l-4 border-l-[#2563EB] text-[12px] sm:text-[13px] text-[#475569] leading-relaxed">
            <span className="font-semibold text-[#0F172A]">Trọng tâm: </span>
            {roadmapContext.step.focusScope} — {roadmapContext.step.studyTip}
          </div>
        )}
      </header>

      <LessonModulesWorkspace
        lesson={lesson}
        modules={modules}
        roadmapContext={roadmapContext}
        totalExercises={totalExercises}
      />
      </article>
    </LessonHighlightsContext.Provider>
  );
}

function subscribeUrlSearch(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

function getUrlSearchSnapshot(): string {
  return typeof window === "undefined" ? "" : window.location.search;
}

function getServerUrlSearchSnapshot(): string {
  return "";
}

interface LessonModulesWorkspaceProps {
  lesson: GrammarLesson;
  modules: LessonMicroModule[];
  roadmapContext: ReturnType<typeof getRoadmapContextByTag>;
  totalExercises: number;
}

function LessonModulesWorkspace({
  lesson,
  modules,
  roadmapContext,
  totalExercises,
}: LessonModulesWorkspaceProps) {
  const searchRaw = useSyncExternalStore(
    subscribeUrlSearch,
    getUrlSearchSnapshot,
    getServerUrlSearchSnapshot
  );

  const urlModuleIndex = useMemo(() => {
    if (!searchRaw) return 0;
    const partParam = new URLSearchParams(searchRaw).get("part");
    if (!partParam) return 0;
    const partNum = parseInt(partParam, 10);
    if (Number.isFinite(partNum) && partNum >= 1 && partNum <= modules.length) {
      return partNum - 1;
    }
    return 0;
  }, [searchRaw, modules.length]);

  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number | null>(
    null
  );
  const activeModuleIndex = selectedModuleIndex ?? urlModuleIndex;
  const [viewAll, setViewAll] = useState<boolean>(false);
  const [mobileCheatSheetOpen, setMobileCheatSheetOpen] =
    useState<boolean>(false);

  const {
    solved: solvedMap,
    recallMode,
    recordExerciseResult,
    clearExerciseResult,
    setRecallMode,
    resetProgress,
  } = useLearnTopicProgress(lesson.tagCode);

  const solvedCount = useMemo(
    () =>
      modules.reduce(
        (sum, mod) =>
          sum + mod.exercises.filter((ex) => ex.id in solvedMap).length,
        0
      ),
    [modules, solvedMap]
  );

  const correctSolvedCount = useMemo(
    () =>
      modules.reduce(
        (sum, mod) =>
          sum + mod.exercises.filter((ex) => solvedMap[ex.id]?.isCorrect).length,
        0
      ),
    [modules, solvedMap]
  );

  const currentModule = modules[activeModuleIndex] ?? modules[0];
  const exerciseProgressPct =
    totalExercises > 0
      ? Math.round((solvedCount / totalExercises) * 100)
      : Math.round(((activeModuleIndex + 1) / Math.max(1, modules.length)) * 100);

  const handleSelectModule = (idx: number) => {
    setSelectedModuleIndex(idx);
    setViewAll(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getModuleStats = (mod: LessonMicroModule) => {
    const done = mod.exercises.filter((ex) => ex.id in solvedMap).length;
    const correct = mod.exercises.filter(
      (ex) => solvedMap[ex.id]?.isCorrect
    ).length;
    const completed = mod.exercises.length > 0 && done === mod.exercises.length;
    return { done, correct, total: mod.exercises.length, completed };
  };

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_312px] lg:gap-6 lg:items-start space-y-6 lg:space-y-0">
      {/* CỘT TRÁI: KHU VỰC HỌC TẬP CHÍNH (~65-72 ký tự/dòng trên Desktop) */}
      <div className="min-w-0 space-y-6">
        {/* Thanh điều hướng & công cụ gọn cho Mobile/Tablet (<1024px) */}
        <section
          aria-label="Điều hướng các học phần nhỏ trên di động"
          className="lg:hidden p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[12px] font-mono text-[#475569] tabular-nums">
              <span className="font-bold text-[#0F172A]">
                {viewAll
                  ? `Xem toàn bộ (${modules.length} phần)`
                  : `Học phần ${currentModule.partNumber}/${modules.length}`}
              </span>
              <span aria-hidden="true"> · </span>
              <span>
                Bài tập: {solvedCount}/{totalExercises}
                {solvedCount > 0 ? ` (${correctSolvedCount} đúng)` : ""}
              </span>
            </div>

            {solvedCount > 0 && (
              <button
                type="button"
                onClick={resetProgress}
                className="inline-flex items-center gap-1 min-h-[36px] px-2 rounded text-[11px] font-semibold text-[#475569] hover:text-[#BE123C] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                <span>Đặt lại</span>
              </button>
            )}
          </div>

          <div
            role="progressbar"
            aria-label="Tiến độ bài tập trong chủ điểm"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={exerciseProgressPct}
            className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-[#2563EB] transition-all duration-300"
              style={{
                width: `${Math.max(
                  exerciseProgressPct,
                  solvedCount > 0 ? 6 : 0
                )}%`,
              }}
            />
          </div>

          {/* Danh sách nút học phần nhỏ */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {modules.map((mod, idx) => {
              const isActive = !viewAll && idx === activeModuleIndex;
              const { completed } = getModuleStats(mod);

              return (
                <button
                  key={mod.partNumber}
                  type="button"
                  onClick={() => handleSelectModule(idx)}
                  className={`min-h-[44px] px-3 py-2 rounded-lg text-[12px] font-semibold inline-flex items-center gap-2 shrink-0 border transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]"
                      : completed
                      ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#047857]"
                      : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:text-[#0F172A]"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded font-mono text-[11px] font-bold flex items-center justify-center tabular-nums ${
                      isActive
                        ? "bg-[#2563EB] text-white"
                        : completed
                        ? "bg-[#047857] text-white"
                        : "bg-white border border-[#E2E8F0] text-[#475569]"
                    }`}
                  >
                    {completed ? (
                      <Check className="w-3 h-3" aria-hidden="true" />
                    ) : (
                      mod.partNumber
                    )}
                  </span>
                  <span>{mod.shortTitleVi}</span>
                </button>
              );
            })}
          </div>

          {/* Hàng công cụ học chủ động Mobile (touch target >= 44px) */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#F1F5F9]">
            <button
              type="button"
              aria-pressed={recallMode}
              onClick={() => setRecallMode(!recallMode)}
              className={`min-h-[44px] px-2 rounded-lg text-[11px] font-semibold border inline-flex items-center justify-center gap-1 whitespace-nowrap transition-colors cursor-pointer ${
                recallMode
                  ? "bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]"
                  : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]"
              }`}
            >
              {recallMode ? (
                <EyeOff className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              )}
              <span>Ẩn dịch</span>
            </button>

            <button
              type="button"
              aria-expanded={mobileCheatSheetOpen}
              onClick={() => setMobileCheatSheetOpen((v) => !v)}
              className={`min-h-[44px] px-2 rounded-lg text-[11px] font-semibold border inline-flex items-center justify-center gap-1 whitespace-nowrap transition-colors cursor-pointer ${
                mobileCheatSheetOpen
                  ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#047857]"
                  : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]"
              }`}
            >
              <Zap className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Tra 5s</span>
            </button>

            <button
              type="button"
              aria-pressed={viewAll}
              onClick={() => setViewAll((v) => !v)}
              className={`min-h-[44px] px-2 rounded-lg text-[11px] font-semibold border inline-flex items-center justify-center gap-1 whitespace-nowrap transition-colors cursor-pointer ${
                viewAll
                  ? "bg-[#0F172A] border-[#0F172A] text-white"
                  : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]"
              }`}
            >
              <LayoutList className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{viewAll ? "Từng phần" : "1 trang"}</span>
            </button>
          </div>
        </section>

        {/* Ngăn tra nhanh dấu hiệu 5s khi mở trên Mobile */}
        {mobileCheatSheetOpen && (
          <div className="lg:hidden">
            <QuickCheatSheetPanel
              items={lesson.cheatSheet}
              onClose={() => setMobileCheatSheetOpen(false)}
            />
          </div>
        )}

        {/* Banner báo trạng thái Chế độ Ẩn dịch đang bật */}
        {recallMode && (
          <div
            aria-live="polite"
            className="px-3.5 py-2.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-between gap-2 text-[12px] text-[#2563EB]"
          >
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>
                <strong>Chế độ Ẩn dịch đang bật</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setRecallMode(false)}
              className="shrink-0 font-semibold underline cursor-pointer px-1"
            >
              Hiện hết
            </button>
          </div>
        )}

        {/* Nội dung chính: Xem toàn bộ hoặc Xem từng Học phần nhỏ */}
        {viewAll ? (
          <div className="space-y-8">
            <CoreRuleSection
              lesson={lesson}
              defaultExpanded={true}
              key={`${lesson.tagCode}-core-all`}
            />
            {modules.map((mod) => (
              <div key={mod.partNumber} className="space-y-5">
                <ModuleTheoryContent
                  lesson={lesson}
                  mod={mod}
                  recallMode={recallMode}
                />
                <LessonExerciseList
                  exercises={mod.exercises}
                  solvedMap={solvedMap}
                  onExerciseSolved={recordExerciseResult}
                  onExerciseReset={clearExerciseResult}
                  title={`Bài tập Phần ${mod.partNumber}: ${mod.shortTitleVi}`}
                />
              </div>
            ))}
            <PracticeBridgeSection
              lesson={lesson}
              roadmapContext={roadmapContext}
              solvedCount={solvedCount}
              correctSolvedCount={correctSolvedCount}
              totalExercises={totalExercises}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Bản chất cốt lõi: Mở gọn ở Phần 1, thu gọn ở Phần 2+ để không phải cuộn lại */}
            <CoreRuleSection
              lesson={lesson}
              defaultExpanded={activeModuleIndex === 0}
              key={`${lesson.tagCode}-core-${activeModuleIndex === 0 ? "open" : "closed"}`}
            />

            {/* Lý thuyết trọng tâm của học phần hiện tại */}
            <ModuleTheoryContent
              lesson={lesson}
              mod={currentModule}
              recallMode={recallMode}
            />

            {/* Bài tập thực hành ngay cho học phần hiện tại */}
            <LessonExerciseList
              exercises={currentModule.exercises}
              solvedMap={solvedMap}
              onExerciseSolved={recordExerciseResult}
              onExerciseReset={clearExerciseResult}
              title={
                currentModule.kind === "summary_practice"
                  ? "Kiểm tra tổng hợp cuối bài"
                  : `Thực hành nhanh Phần ${currentModule.partNumber}`
              }
            />

            {/* Thanh chuyển bước: 1 nút Primary duy nhất + nút Quay lại Secondary */}
            {activeModuleIndex < modules.length - 1 ? (
              <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E2E8F0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {activeModuleIndex > 0 ? (
                  <button
                    type="button"
                    onClick={() => handleSelectModule(activeModuleIndex - 1)}
                    className="min-h-[44px] px-4 rounded-lg text-[14px] font-medium bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#8190A6] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    <span>Phần trước</span>
                  </button>
                ) : (
                  <span className="text-[13px] text-[#475569] self-center">
                    Nắm xong Phần 1 rồi tiếp tục nhé
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleSelectModule(activeModuleIndex + 1)}
                  className="min-h-[48px] px-6 rounded-lg text-[15px] font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>
                    Tiếp tục Phần {activeModuleIndex + 2}:{" "}
                    {modules[activeModuleIndex + 1]?.shortTitleVi}
                  </span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeModuleIndex > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => handleSelectModule(activeModuleIndex - 1)}
                      className="min-h-[44px] px-4 rounded-lg text-[13px] font-medium bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#8190A6] inline-flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                      <span>Quay lại Phần {activeModuleIndex}</span>
                    </button>
                  </div>
                )}
                <PracticeBridgeSection
                  lesson={lesson}
                  roadmapContext={roadmapContext}
                  solvedCount={solvedCount}
                  correctSolvedCount={correctSolvedCount}
                  totalExercises={totalExercises}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* CỘT PHẢI (DESKTOP STICKY RAIL): Mục lục học phần + Ẩn dịch + Tra nhanh 5 giây */}
      <aside
        aria-label="Mục lục học phần và bảng tra nhanh"
        className="hidden lg:block sticky top-6 space-y-4"
      >
        {/* 1. Mục lục & Tiến độ tự học */}
        <section className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[12px] font-mono font-bold uppercase tracking-[0.08em] text-[#475569]">
              Mục lục bài học
            </h2>
            <span className="text-[12px] font-mono font-semibold text-[#0F172A] tabular-nums">
              {solvedCount}/{totalExercises} câu
            </span>
          </div>

          <div
            role="progressbar"
            aria-label="Tiến độ bài tập trong chủ điểm"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={exerciseProgressPct}
            className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-[#2563EB] transition-all duration-300"
              style={{
                width: `${Math.max(
                  exerciseProgressPct,
                  solvedCount > 0 ? 6 : 0
                )}%`,
              }}
            />
          </div>

          <nav aria-label="Danh sách các học phần nhỏ" className="space-y-1.5">
            {modules.map((mod, idx) => {
              const isActive = !viewAll && idx === activeModuleIndex;
              const stats = getModuleStats(mod);

              return (
                <button
                  key={mod.partNumber}
                  type="button"
                  onClick={() => handleSelectModule(idx)}
                  aria-current={isActive ? "step" : undefined}
                  className={`w-full min-h-[44px] px-2.5 py-2 rounded-lg border text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#EFF6FF] border-[#2563EB] text-[#0F172A]"
                      : stats.completed
                      ? "bg-[#ECFDF5]/60 border-[#A7F3D0] text-[#0F172A] hover:bg-[#ECFDF5]"
                      : "bg-white border-transparent hover:bg-[#F8FAFC] hover:border-[#E2E8F0] text-[#475569]"
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-6 h-6 rounded font-mono text-[11px] font-bold flex items-center justify-center shrink-0 tabular-nums ${
                        isActive
                          ? "bg-[#2563EB] text-white"
                          : stats.completed
                          ? "bg-[#047857] text-white"
                          : "bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]"
                      }`}
                    >
                      {stats.completed ? (
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        String(mod.partNumber).padStart(2, "0")
                      )}
                    </span>
                    <span
                      className={`text-[13px] truncate ${
                        isActive ? "font-bold text-[#2563EB]" : "font-medium text-[#0F172A]"
                      }`}
                    >
                      {mod.shortTitleVi}
                    </span>
                  </span>

                  <span
                    className={`text-[11px] font-mono tabular-nums shrink-0 ${
                      stats.completed ? "text-[#047857] font-semibold" : "text-[#475569]"
                    }`}
                  >
                    {stats.done}/{stats.total}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Công cụ học chủ động */}
          <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
            <button
              type="button"
              aria-pressed={recallMode}
              onClick={() => setRecallMode(!recallMode)}
              className={`w-full min-h-[44px] px-3 py-2 rounded-lg border flex items-center justify-between gap-2 text-left transition-colors cursor-pointer ${
                recallMode
                  ? "bg-[#EFF6FF] border-[#2563EB]"
                  : "bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#8190A6]"
              }`}
            >
              <span className="flex items-center gap-2 min-w-0">
                {recallMode ? (
                  <EyeOff
                    className="w-4 h-4 text-[#2563EB] shrink-0"
                    aria-hidden="true"
                  />
                ) : (
                  <Eye
                    className="w-4 h-4 text-[#475569] shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span className="min-w-0">
                  <span className="block text-[12px] font-semibold text-[#0F172A]">
                    Chế độ Ẩn dịch
                  </span>
                  <span className="block text-[11px] text-[#475569] truncate">
                    Ẩn nghĩa ví dụ để tự dịch
                  </span>
                </span>
              </span>

              <span
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase shrink-0 ${
                  recallMode
                    ? "bg-[#2563EB] text-white"
                    : "bg-white text-[#475569] border border-[#E2E8F0]"
                }`}
              >
                {recallMode ? "BẬT" : "TẮT"}
              </span>
            </button>

            <button
              type="button"
              aria-pressed={viewAll}
              onClick={() => setViewAll((v) => !v)}
              className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[12px] font-semibold text-[#0F172A] flex items-center justify-between gap-2 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <LayoutList
                  className="w-4 h-4 text-[#475569]"
                  aria-hidden="true"
                />
                <span>
                  {viewAll ? "Chuyển sang từng phần ngắn" : "Xem toàn bộ 1 trang"}
                </span>
              </span>
            </button>

            {solvedCount > 0 && (
              <button
                type="button"
                onClick={resetProgress}
                className="w-full min-h-[44px] px-3 py-2 rounded-lg text-[12px] font-medium text-[#475569] hover:text-[#BE123C] hover:bg-[#FFF1F2] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Đặt lại tiến độ tự luyện</span>
              </button>
            )}
          </div>
        </section>

        {/* 2. Ngăn Tra nhanh Dấu hiệu 5 giây (giảm Split-Attention khi đọc & làm bài) */}
        <QuickCheatSheetPanel items={lesson.cheatSheet} />

        {/* 3. Lối tắt luyện đề Part 5 chính thức */}
        <Link
          href={`/practice/new?topic=${lesson.tagCode}`}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#8190A6] text-[13px] font-semibold flex items-center justify-between gap-2 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
            <span>Làm đề Part 5 chủ điểm này</span>
          </span>
          <ArrowRight className="w-4 h-4 text-[#475569]" aria-hidden="true" />
        </Link>
      </aside>
    </div>
  );
}
