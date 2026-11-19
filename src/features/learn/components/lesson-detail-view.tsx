"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  buildLessonMicroModules,
  type GrammarLesson,
  type GrammarLessonCheatSheetItem,
  type LessonMicroModule,
  type TenseComparison,
  type TenseItem,
  type DetailedTopicSection,
} from "@/core/grammarLessons";
import { getRoadmapContextByTag } from "@/core/roadmap";
import {
  getExampleHighlights,
  splitTextWithHighlights,
} from "@/core/lessonHighlights";
import { LessonExerciseList } from "@/features/learn/components/lesson-exercise-card";
import { useLearnTopicProgress } from "@/features/learn/lib/learn-progress-storage";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Eye,
  EyeOff,
  Info,
  Layers,
  LayoutList,
  Lightbulb,
  RotateCcw,
  Target,
  XCircle,
  Zap,
} from "lucide-react";

interface LessonDetailViewProps {
  lesson: GrammarLesson;
}

const TENSE_COMPARISON_BY_GROUP: Record<
  "present" | "past" | "future",
  string[]
> = {
  present: ["pres_cont_vs_pres_simp", "pres_perf_cont_vs_pres_perf"],
  past: [
    "pres_perf_vs_past_simp",
    "past_cont_vs_past_simp",
    "past_perf_vs_past_perf_cont",
  ],
  future: ["will_vs_be_going_to"],
};

export function LessonDetailView({ lesson }: LessonDetailViewProps) {
  const modules = useMemo(() => buildLessonMicroModules(lesson), [lesson]);
  const roadmapContext = useMemo(
    () => getRoadmapContextByTag(lesson.tagCode),
    [lesson.tagCode]
  );
  const totalExercises = useMemo(
    () => modules.reduce((sum, m) => sum + m.exercises.length, 0),
    [modules]
  );

  return (
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

/**
 * Hiển thị bản dịch tiếng Việt hoặc ẩn để người học Ẩn dịch (Active Recall).
 */
function RecallableTranslation({
  textVi,
  recallMode,
  prefix = "→ ",
}: {
  textVi: string;
  recallMode: boolean;
  prefix?: string;
}) {
  const [revealed, setRevealed] = useState(false);

  if (!recallMode || revealed) {
    return (
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-[13px] text-[#475569]">
        <span className="italic">
          {prefix}
          {textVi}
        </span>
        {recallMode && revealed && (
          <button
            type="button"
            onClick={() => setRevealed(false)}
            className="text-[11px] font-mono font-semibold text-[#475569] hover:text-[#0F172A] underline cursor-pointer shrink-0"
          >
            Ẩn lại
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      aria-expanded={false}
      className="inline-flex items-center gap-1.5 min-h-[36px] px-2.5 py-1 rounded-md bg-[#F1F5F9] hover:bg-[#EFF6FF] text-[#475569] hover:text-[#2563EB] border border-dashed border-[#8190A6] text-[12px] font-medium transition-colors cursor-pointer text-left"
    >
      <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>Chạm để xem nghĩa tiếng Việt</span>
    </button>
  );
}

/**
 * Tô sáng và gạch chân cụm từ khóa / cấu trúc trọng tâm trong câu ví dụ tiếng Anh.
 */
function HighlightedExample({
  text,
  explicitHighlight,
  tone = "primary",
}: {
  text: string;
  explicitHighlight?: string | string[];
  tone?: "primary" | "invertedPrimary" | "warning";
}) {
  const highlights = getExampleHighlights(text, explicitHighlight);
  const segments = splitTextWithHighlights(text, highlights);

  const markClass =
    tone === "invertedPrimary"
      ? "bg-white text-[#1D4ED8] font-semibold px-1 py-0.5 rounded-[4px] underline decoration-[#2563EB] decoration-2 underline-offset-4"
      : tone === "warning"
      ? "bg-white text-[#B45309] font-semibold px-1 py-0.5 rounded-[4px] underline decoration-[#B45309] decoration-2 underline-offset-4"
      : "bg-[#EFF6FF] text-[#1D4ED8] font-semibold px-1 py-0.5 rounded-[4px] underline decoration-[#2563EB] decoration-2 underline-offset-4";

  return (
    <>
      {segments.map((seg, idx) =>
        seg.highlighted ? (
          <mark key={idx} className={markClass}>
            {seg.text}
          </mark>
        ) : (
          <span key={idx}>{seg.text}</span>
        )
      )}
    </>
  );
}

/**
 * Ngăn tra nhanh Dấu hiệu 5 giây ở Rail phải (Desktop) hoặc Drawer inline (Mobile).
 */
function QuickCheatSheetPanel({
  items,
  onClose,
}: {
  items: GrammarLessonCheatSheetItem[];
  onClose?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (items.length === 0) return null;

  return (
    <section
      aria-label="Tra nhanh dấu hiệu 5 giây"
      className="p-4 rounded-xl bg-[#FAFAF7] border border-[#E2E8F0] space-y-3"
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-2 text-left cursor-pointer min-h-[32px]"
        >
          <span className="w-6 h-6 rounded-md bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] flex items-center justify-center shrink-0">
            <Zap className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
          <span className="text-[12px] font-mono font-bold uppercase tracking-[0.06em] text-[#0F172A]">
            Tra nhanh 5 giây ({items.length})
          </span>
        </button>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] font-semibold text-[#475569] hover:text-[#0F172A] px-2 py-1 rounded cursor-pointer"
          >
            Đóng
          </button>
        ) : (
          <button
            type="button"
            aria-label={isOpen ? "Thu gọn bảng tra nhanh" : "Mở bảng tra nhanh"}
            onClick={() => setIsOpen((v) => !v)}
            className="p-1 rounded text-[#475569] hover:text-[#0F172A] cursor-pointer"
          >
            {isOpen ? (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {isOpen && (
        <ul className="divide-y divide-[#E2E8F0] max-h-[340px] overflow-y-auto pr-1">
          {items.map((item, idx) => (
            <li key={idx} className="py-2 first:pt-0 last:pb-0 space-y-1">
              <div className="font-mono text-[12px] font-bold text-[#2563EB] break-words">
                {item.signal}
              </div>
              <div className="text-[12px] text-[#0F172A] leading-snug">
                {item.rule}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * Tóm tắt bản chất cốt lõi — thu gọn được để không đẩy nội dung học xuống quá xa.
 */
function CoreRuleSection({
  lesson,
  defaultExpanded,
}: {
  lesson: GrammarLesson;
  defaultExpanded: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section
      aria-labelledby="core-rule-heading"
      className="rounded-xl bg-[#FAFAF7] border border-[#E2E8F0] border-l-4 border-l-[#2563EB] overflow-hidden"
    >
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full min-h-[48px] px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#F1F5F9]/60 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shrink-0">
            <Lightbulb className="w-4 h-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2
              id="core-rule-heading"
              className="text-[15px] sm:text-[16px] font-bold text-[#0F172A]"
            >
              Bản chất cốt lõi cần nhớ
            </h2>
            {!isExpanded && (
              <p className="text-[12px] text-[#475569] truncate">
                {lesson.coreRule.definition}
              </p>
            )}
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563EB] shrink-0">
          <span className="hidden sm:inline">
            {isExpanded ? "Thu gọn" : "Mở tóm tắt"}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          )}
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 space-y-3.5 border-t border-[#E2E8F0]">
          <p className="text-[14px] text-[#0F172A] leading-[1.65] pt-2">
            {lesson.coreRule.definition}
          </p>

          <ul className="divide-y divide-[#E2E8F0] rounded-lg bg-white border border-[#E2E8F0] px-3.5">
            {lesson.coreRule.keyFormulas.map((formula, idx) => (
              <li
                key={idx}
                className="py-2.5 flex items-start gap-2.5 text-[13px] text-[#0F172A] leading-[1.6]"
              >
                <span className="font-mono text-[11px] font-bold text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded shrink-0 mt-0.5 tabular-nums">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span>{formula}</span>
              </li>
            ))}
          </ul>

          <div className="p-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-start gap-2 text-[13px] text-[#0F172A]">
            <Zap
              className="w-4 h-4 shrink-0 text-[#2563EB] mt-0.5"
              aria-hidden="true"
            />
            <div className="leading-[1.6]">
              <span className="font-bold text-[#2563EB]">
                Mẹo nhận diện nhanh:{" "}
              </span>
              {lesson.coreRule.deepInsight}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ModuleTheoryContent({
  lesson,
  mod,
  recallMode,
}: {
  lesson: GrammarLesson;
  mod: LessonMicroModule;
  recallMode: boolean;
}) {
  if (mod.kind === "summary_practice") {
    return (
      <div className="space-y-6">
        {/* Bảng dấu hiệu 5 giây */}
        <section
          aria-labelledby={`cheatsheet-heading-${mod.partNumber}`}
          className="p-5 sm:p-6 rounded-xl bg-white border border-[#E2E8F0] space-y-4"
        >
          <div className="flex items-center gap-2.5 border-b border-[#F1F5F9] pb-3">
            <span className="w-8 h-8 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#047857] shrink-0">
              <Zap className="w-4 h-4" aria-hidden="true" />
            </span>
            <div>
              <h2
                id={`cheatsheet-heading-${mod.partNumber}`}
                className="text-[17px] font-bold text-[#0F172A]"
              >
                Phần {mod.partNumber}: Bảng dấu hiệu nhận diện trong 5 giây
              </h2>
              <p className="text-[12px] text-[#475569]">
                Quét nhanh từ khóa để chọn ngay đáp án đúng
              </p>
            </div>
          </div>

          <ul className="divide-y divide-[#E2E8F0]">
            {lesson.cheatSheet.map((item, idx) => (
              <li key={idx} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <span className="font-mono text-[13px] font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded border border-[#BFDBFE]">
                    {item.signal}
                  </span>
                  <span className="text-[13px] font-semibold text-[#047857]">
                    → {item.rule}
                  </span>
                </div>
                <div className="text-[13px] text-[#475569] italic pl-1">
                  Ví dụ: &ldquo;<HighlightedExample text={item.example} />&rdquo;
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Bẫy ETS thường gặp */}
        {lesson.traps.length > 0 && (
          <section
            aria-labelledby={`traps-heading-${mod.partNumber}`}
            className="p-5 sm:p-6 rounded-xl bg-white border border-[#FECDD3] space-y-4"
          >
            <div className="flex items-center gap-2.5 border-b border-[#FFF1F2] pb-3">
              <span className="w-8 h-8 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#B45309] shrink-0">
                <AlertTriangle className="w-4 h-4" aria-hidden="true" />
              </span>
              <div>
                <h2
                  id={`traps-heading-${mod.partNumber}`}
                  className="text-[17px] font-bold text-[#0F172A]"
                >
                  Cảnh báo các bẫy thường gặp
                </h2>
                <p className="text-[12px] text-[#475569]">
                  Những lỗi sai phổ biến khiến thí sinh mất điểm
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {lesson.traps.map((trap, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] space-y-2.5 text-[13px]"
                >
                  <div className="font-bold text-[#B45309] flex items-center gap-2">
                    <AlertTriangle
                      className="w-4 h-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{trap.title}</span>
                  </div>
                  <p className="text-[#0F172A] leading-[1.6]">
                    {trap.trapDescription}
                  </p>
                  <div className="p-2.5 bg-white rounded-lg border border-[#FDE68A] text-[#0F172A] leading-[1.6]">
                    <span className="font-semibold text-[#B45309]">
                      Quy tắc chuẩn:{" "}
                    </span>
                    {trap.correctRule}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 pt-1 font-mono text-[12px]">
                    <div className="flex items-start gap-1.5 p-2.5 rounded bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]">
                      <XCircle
                        className="w-4 h-4 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{trap.badExample}</span>
                    </div>
                    <div className="flex items-start gap-1.5 p-2.5 rounded bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                      <CheckCircle2
                        className="w-4 h-4 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{trap.goodExample}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // Học phần dành riêng cho chủ điểm Thì (tenses)
  if (
    lesson.tensesDetail &&
    (mod.kind === "tenses_present" ||
      mod.kind === "tenses_past" ||
      mod.kind === "tenses_future" ||
      mod.kind === "tenses_sequence")
  ) {
    const {
      tenses,
      sequenceRules,
      tenseComparisons = [],
    } = lesson.tensesDetail;

    if (mod.kind === "tenses_sequence") {
      return (
        <section className="p-5 sm:p-6 rounded-xl bg-white border border-[#E2E8F0] space-y-5">
          <div className="border-b border-[#F1F5F9] pb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.08em] text-[#2563EB]">
              Học phần {mod.partNumber} · ~{mod.estimatedMinutes} phút
            </span>
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#0F172A] mt-0.5">
              {mod.titleVi}
            </h2>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {sequenceRules.map((rule, idx) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded bg-[#EFF6FF] text-[#2563EB] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="font-mono text-[13px] font-bold text-[#0F172A] leading-snug">
                    {rule.pattern}
                  </div>
                </div>

                <p className="text-[14px] text-[#0F172A] leading-[1.6]">
                  {rule.ruleVi}
                </p>

                <div className="space-y-2.5">
                  <div className="pl-3.5 border-l-2 border-[#2563EB]/40 space-y-1.5 text-[13px]">
                    <div className="font-medium text-[#0F172A] leading-[1.75]">
                      &ldquo;<HighlightedExample text={rule.exampleEn} />&rdquo;
                    </div>
                    <RecallableTranslation
                      textVi={rule.exampleVi}
                      recallMode={recallMode}
                    />
                  </div>

                  {rule.extraExamples?.map((extra, eIdx) => (
                    <div
                      key={eIdx}
                      className="pl-3.5 border-l-2 border-[#E2E8F0] space-y-1.5 text-[13px]"
                    >
                      <div className="font-medium text-[#0F172A] leading-[1.75]">
                        &ldquo;
                        <HighlightedExample
                          text={extra.en}
                          explicitHighlight={extra.highlight}
                        />
                        &rdquo;
                      </div>
                      <RecallableTranslation
                        textVi={extra.vi}
                        recallMode={recallMode}
                      />
                    </div>
                  ))}
                </div>

                {rule.trapNote && (
                  <div className="flex items-start gap-1.5 text-[12px] text-[#B45309] bg-[#FFFBEB] p-2.5 rounded-md border border-[#FDE68A]">
                    <AlertTriangle
                      className="w-3.5 h-3.5 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{rule.trapNote}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    }

    const group = mod.tensesGroup as "present" | "past" | "future";
    const groupTenses = tenses.filter((t) => t.group === group);
    const compIds = TENSE_COMPARISON_BY_GROUP[group] ?? [];
    const groupComparisons = tenseComparisons.filter((c) =>
      compIds.includes(c.id)
    );

    return (
      <section className="p-5 sm:p-6 rounded-xl bg-white border border-[#E2E8F0] space-y-6">
        <div className="border-b border-[#F1F5F9] pb-3">
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.08em] text-[#2563EB]">
            Học phần {mod.partNumber} · ~{mod.estimatedMinutes} phút
          </span>
          <h2 className="text-[18px] sm:text-[20px] font-bold text-[#0F172A] mt-0.5">
            {mod.titleVi}
          </h2>
        </div>

        <div className="divide-y divide-[#E2E8F0]">
          {groupTenses.map((tense, tIdx) => (
            <div key={tense.id} className="py-5 first:pt-0 last:pb-0">
              <TenseCard
                tense={tense}
                index={tIdx}
                recallMode={recallMode}
              />
            </div>
          ))}
        </div>

        {groupComparisons.length > 0 && (
          <div className="space-y-3 pt-5 border-t border-[#E2E8F0]">
            <div className="space-y-0.5">
              <h3 className="text-[15px] sm:text-[16px] font-bold text-[#0F172A]">
                Đối chiếu cặp thì dễ nhầm trong nhóm này ({groupComparisons.length})
              </h3>
              <p className="text-[12px] text-[#475569]">
                Mở từng cặp khi cần phân biệt sâu để không bị quá tải chữ
              </p>
            </div>
            <div className="space-y-2.5">
              {groupComparisons.map((comp, cIdx) => (
                <ComparisonCard
                  key={comp.id}
                  comp={comp}
                  defaultOpen={cIdx === 0}
                  recallMode={recallMode}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  // Học phần chuẩn từ detailedSections (15 chủ điểm còn lại)
  if (mod.section) {
    return (
      <DetailedSectionCard
        sec={mod.section}
        partNumber={mod.partNumber}
        minutes={mod.estimatedMinutes}
        recallMode={recallMode}
      />
    );
  }

  return null;
}

function DetailedSectionCard({
  sec,
  partNumber,
  minutes,
  recallMode,
}: {
  sec: DetailedTopicSection;
  partNumber: number;
  minutes: number;
  recallMode: boolean;
}) {
  return (
    <section className="p-5 sm:p-6 rounded-xl bg-white border border-[#E2E8F0] space-y-5">
      <div className="border-b border-[#F1F5F9] pb-3.5">
        <span className="text-[11px] font-mono font-bold uppercase tracking-[0.08em] text-[#2563EB]">
          Học phần {partNumber} · ~{minutes} phút
        </span>
        <h2 className="text-[18px] sm:text-[20px] font-bold text-[#0F172A] mt-0.5">
          {sec.title}
        </h2>
        {sec.description && (
          <p className="text-[13px] sm:text-[14px] text-[#475569] mt-1 leading-relaxed">
            {sec.description}
          </p>
        )}
      </div>

      {/* Bỏ thẻ lồng thẻ 3 lớp: dùng cấu trúc phẳng phân tách bằng đường kẻ mảnh + khối công thức nổi bật */}
      <div className="divide-y divide-[#E2E8F0]">
        {sec.rules.map((r, rIdx) => (
          <div key={rIdx} className="py-5 first:pt-0 last:pb-0 space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded bg-[#F1F5F9] border border-[#E2E8F0] text-[#0F172A] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                {String(rIdx + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[15px] sm:text-[16px] font-bold text-[#0F172A] leading-snug">
                {r.title}
              </h3>
            </div>

            {r.formula && (
              <div className="p-3 rounded-lg bg-[#F1F5F9] border-l-4 border-l-[#2563EB] font-mono text-[13px] font-bold text-[#0F172A] break-words">
                {r.formula}
              </div>
            )}

            <p className="text-[14px] text-[#0F172A] leading-[1.65]">
              {r.explanation}
            </p>

            {/* Ví dụ song ngữ sạch, hỗ trợ Ẩn dịch */}
            <div className="space-y-2.5">
              {r.examples.map((ex, exIdx) => (
                <div
                  key={exIdx}
                  className="pl-3.5 border-l-2 border-[#E2E8F0] space-y-1.5"
                >
                  <div className="text-[14px] text-[#0F172A] font-medium leading-[1.75]">
                    &ldquo;<HighlightedExample text={ex.en} explicitHighlight={ex.highlight} />&rdquo;
                  </div>
                  <RecallableTranslation
                    textVi={ex.vi}
                    recallMode={recallMode}
                  />
                </div>
              ))}
            </div>

            {r.signals && r.signals.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-[#475569] mr-1">
                  Dấu hiệu:
                </span>
                {r.signals.map((sig, sIdx) => (
                  <span
                    key={sIdx}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
                  >
                    {sig}
                  </span>
                ))}
              </div>
            )}

            {r.tip && (
              <div className="p-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[13px] text-[#0F172A] flex items-start gap-2">
                <Lightbulb
                  className="w-4 h-4 shrink-0 text-[#2563EB] mt-0.5"
                  aria-hidden="true"
                />
                <div className="leading-[1.55]">
                  <span className="font-bold text-[#2563EB]">Mẹo Part 5: </span>
                  <span>{r.tip}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function ComparisonCard({
  comp,
  defaultOpen,
  recallMode,
}: {
  comp: TenseComparison;
  defaultOpen: boolean;
  recallMode: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl bg-[#FAFAF7] border border-[#E2E8F0] overflow-hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        className="w-full min-h-[48px] p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left hover:bg-[#F1F5F9]/70 transition-colors cursor-pointer"
      >
        <div className="space-y-1.5 min-w-0">
          <div className="text-[14px] sm:text-[15px] font-bold text-[#0F172A]">
            {comp.title}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] font-bold">
              {comp.pair[0]}
            </span>
            <span className="text-[#475569] font-sans font-semibold">vs</span>
            <span className="px-2 py-0.5 rounded bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] font-bold">
              {comp.pair[1]}
            </span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563EB] shrink-0">
          <span className="hidden sm:inline">
            {isOpen ? "Thu gọn" : "Xem đối chiếu"}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          )}
        </span>
      </button>

      {isOpen && (
        <div className="p-4 pt-2 border-t border-[#E2E8F0] space-y-3.5 bg-white">
          <p className="text-[13px] sm:text-[14px] text-[#0F172A] leading-[1.6] pt-1">
            {comp.explanation}
          </p>

          <div className="overflow-x-auto rounded-lg border border-[#E2E8F0] bg-white">
            <table className="w-full text-left text-[12.5px]">
              <thead>
                <tr className="bg-[#F1F5F9] border-b border-[#E2E8F0] text-[11px] font-mono uppercase tracking-wider text-[#475569]">
                  <th className="py-2 px-3 font-bold w-1/4">Khía cạnh</th>
                  <th className="py-2 px-3 font-bold text-[#2563EB] w-[37.5%]">
                    {comp.pair[0]}
                  </th>
                  <th className="py-2 px-3 font-bold text-[#B45309] w-[37.5%]">
                    {comp.pair[1]}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {comp.table.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="py-2 px-3 font-semibold text-[#0F172A] bg-[#F8FAFC]">
                      {row.aspect}
                    </td>
                    <td className="py-2 px-3 text-[#0F172A] leading-relaxed">
                      {row.tenseA}
                    </td>
                    <td className="py-2 px-3 text-[#0F172A] leading-relaxed">
                      {row.tenseB}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(comp.examplePairs || []).map((ex, eIdx) => (
            <div
              key={eIdx}
              className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-[12px]"
            >
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#475569]">
                {ex.context}
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] space-y-1.5">
                  <div className="font-mono font-medium text-[#0F172A] leading-[1.75]">
                    <HighlightedExample
                      text={ex.exampleA.en}
                      tone="invertedPrimary"
                    />
                  </div>
                  <RecallableTranslation
                    textVi={ex.exampleA.vi}
                    recallMode={recallMode}
                    prefix=""
                  />
                </div>
                <div className="p-2.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] space-y-1.5">
                  <div className="font-mono font-medium text-[#0F172A] leading-[1.75]">
                    <HighlightedExample text={ex.exampleB.en} tone="warning" />
                  </div>
                  <RecallableTranslation
                    textVi={ex.exampleB.vi}
                    recallMode={recallMode}
                    prefix=""
                  />
                </div>
              </div>
              <div className="text-[#475569] leading-relaxed">
                <span className="font-semibold text-[#0F172A]">Bản chất: </span>
                {ex.insight}
              </div>
            </div>
          ))}

          {comp.toeicTrap && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[12px] text-[#0F172A]">
              <AlertTriangle
                className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <span className="font-bold text-[#B45309]">
                  Lưu ý phòng bẫy:{" "}
                </span>
                {comp.toeicTrap}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PracticeBridgeSection({
  lesson,
  roadmapContext,
  solvedCount,
  correctSolvedCount,
  totalExercises,
}: {
  lesson: GrammarLesson;
  roadmapContext: ReturnType<typeof getRoadmapContextByTag>;
  solvedCount: number;
  correctSolvedCount: number;
  totalExercises: number;
}) {
  return (
    <section
      aria-labelledby="practice-cta-heading"
      className="p-5 sm:p-7 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-center space-y-4"
    >
      <div className="max-w-md mx-auto space-y-1.5">
        {solvedCount > 0 && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white border border-[#BFDBFE] text-[11px] font-mono font-semibold text-[#2563EB] tabular-nums">
            Tự luyện tại chỗ: {correctSolvedCount}/{totalExercises} câu đúng
          </div>
        )}
        <h2
          id="practice-cta-heading"
          className="text-[18px] sm:text-[21px] font-bold text-[#0F172A]"
        >
          Đã hoàn thành lý thuyết chủ điểm này?
        </h2>
        <p className="text-[13px] sm:text-[14px] text-[#475569] leading-relaxed">
          Chuyển sang làm phiên luyện Part 5 chính thức về &ldquo;
          {lesson.titleVi}&rdquo; để ghi nhận điểm thành thạo vào lộ trình.
        </p>
      </div>

      <div className="pt-1 space-y-3">
        <Link
          href={`/practice/new?topic=${lesson.tagCode}`}
          className="inline-flex items-center justify-center gap-2 px-7 h-12 rounded-lg text-[15px] font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2 w-full sm:w-auto"
        >
          <span>Luyện tập ngay 5 câu về chủ điểm này</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>

        {roadmapContext?.nextStep && (
          <div>
            <Link
              href={`/learn/${roadmapContext.nextStep.tagCode}`}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg text-[13px] font-semibold text-[#2563EB] hover:underline"
            >
              <span>
                Bước tiếp theo trong lộ trình: Bước {roadmapContext.nextStep.order}{" "}
                — {roadmapContext.nextStep.nameVi}
              </span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Component hiển thị chi tiết một Thì động từ theo bố cục phẳng, bảng cấu trúc 3 thể gọn mắt.
 */
function TenseCard({
  tense,
  index,
  recallMode,
}: {
  tense: TenseItem;
  index: number;
  recallMode: boolean;
}) {
  return (
    <div className="space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <span className="w-6 h-6 rounded bg-[#EFF6FF] text-[#2563EB] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-1 tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2563EB] block">
              {tense.nameEn}
            </span>
            <h4 className="text-[16px] sm:text-[17px] font-bold text-[#0F172A] leading-tight mt-0.5">
              {tense.nameVi}
            </h4>
          </div>
        </div>
        <span className="self-start sm:self-auto px-2.5 py-0.5 rounded text-[11px] font-medium bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
          {tense.groupVi}
        </span>
      </div>

      {/* Bảng công thức 3 thể gọn 1 khung thay vì 3 thẻ rời */}
      <div className="rounded-lg border border-[#E2E8F0] overflow-hidden bg-[#F8FAFC] divide-y divide-[#E2E8F0] text-[12px] sm:text-[13px]">
        <div className="grid grid-cols-[96px_minmax(0,1fr)] items-baseline">
          <span className="px-3 py-2 font-sans text-[11px] font-bold uppercase text-[#047857] bg-[#ECFDF5]">
            (+) Khẳng định
          </span>
          <span className="px-3 py-2 font-mono font-semibold text-[#0F172A] break-words bg-white">
            {tense.formula.affirmative}
          </span>
        </div>
        <div className="grid grid-cols-[96px_minmax(0,1fr)] items-baseline">
          <span className="px-3 py-2 font-sans text-[11px] font-bold uppercase text-[#BE123C] bg-[#FFF1F2]">
            (-) Phủ định
          </span>
          <span className="px-3 py-2 font-mono font-semibold text-[#0F172A] break-words bg-white">
            {tense.formula.negative}
          </span>
        </div>
        <div className="grid grid-cols-[96px_minmax(0,1fr)] items-baseline">
          <span className="px-3 py-2 font-sans text-[11px] font-bold uppercase text-[#2563EB] bg-[#EFF6FF]">
            (?) Nghi vấn
          </span>
          <span className="px-3 py-2 font-mono font-semibold text-[#0F172A] break-words bg-white">
            {tense.formula.question}
          </span>
        </div>
      </div>

      {/* Cách dùng và ví dụ (hỗ trợ Ẩn dịch) */}
      <div className="space-y-3">
        {tense.usages.map((usage, idx) => (
          <div
            key={idx}
            className="pl-3.5 border-l-2 border-[#E2E8F0] space-y-1 text-[13px]"
          >
            <div className="font-bold text-[#0F172A]">{usage.context}</div>
            <p className="text-[#475569] text-[13px] leading-[1.6]">
              {usage.explanation}
            </p>
            <div className="pt-1 space-y-1">
              <div className="font-medium text-[#0F172A] leading-[1.75]">
                &ldquo;<HighlightedExample text={usage.exampleEn} />&rdquo;
              </div>
              <RecallableTranslation
                textVi={usage.exampleVi}
                recallMode={recallMode}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Dấu hiệu nhận biết */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-[#475569] mr-1">
          Dấu hiệu:
        </span>
        {tense.signals.map((sig, sIdx) => (
          <span
            key={sIdx}
            className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
          >
            {sig}
          </span>
        ))}
      </div>

      {tense.stativeVerbNote && (
        <div className="p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[12px] text-[#0F172A] flex items-start gap-2">
          <Info
            className="w-4 h-4 shrink-0 text-[#B45309] mt-0.5"
            aria-hidden="true"
          />
          <span className="leading-relaxed">{tense.stativeVerbNote}</span>
        </div>
      )}

      <div className="p-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[12px] sm:text-[13px] text-[#0F172A] flex items-start gap-2">
        <Lightbulb
          className="w-4 h-4 shrink-0 text-[#2563EB] mt-0.5"
          aria-hidden="true"
        />
        <div>
          <span className="font-bold text-[#2563EB]">Mẹo Part 5: </span>
          <span>{tense.toeicTip}</span>
        </div>
      </div>
    </div>
  );
}
