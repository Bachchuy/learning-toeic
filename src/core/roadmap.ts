import { CANONICAL_GRAMMAR_TAGS } from "./grammarTags";
import { getLessonMicroSummary } from "./grammarLessons";
import {
  MASTERY_BADGE_MAP,
  type MasteryBadgeInfo,
  type MasteryLabel,
} from "./wilson";

export type RoadmapStageId = "stage-1" | "stage-2" | "stage-3" | "stage-4";

export type RoadmapStageStatus = "completed" | "active" | "guided_locked";

export type RoadmapStepStatus =
  | "mastered"
  | "proficient"
  | "needs_review"
  | "in_progress"
  | "recommended_next"
  | "up_next"
  | "advised_later";

export interface RoadmapStageDefinition {
  id: RoadmapStageId;
  stageNumber: 1 | 2 | 3 | 4;
  titleVi: string;
  targetRangeLabel: string;
  minTargetScore: number;
  subtitleVi: string;
  vocabClusterLabel: string;
  vocabTopics: string[];
  gateRuleLabel: string;
}

export interface RoadmapStepDefinition {
  order: number;
  tagCode: string;
  stageId: RoadmapStageId;
  focusScope: string;
  prerequisiteReason: string;
  studyTip: string;
}

export interface RoadmapMasteryInput {
  tagCode: string;
  totalAttempts: number;
  correctAttempts: number;
  masteryPercentage: number;
  masteryLabel: MasteryLabel;
  badgeInfo?: MasteryBadgeInfo;
}

export interface RoadmapStepProgress extends RoadmapStepDefinition {
  nameVi: string;
  shortName: string;
  fullNameVi: string;
  totalAttempts: number;
  correctAttempts: number;
  masteryPercentage: number;
  masteryLabel: MasteryLabel;
  badgeInfo: MasteryBadgeInfo;
  isGateCleared: boolean;
  isRecommendedNext: boolean;
  status: RoadmapStepStatus;
  moduleCount: number;
  exerciseCount: number;
  moduleTitles: string[];
}

export interface RoadmapStageProgress {
  stage: RoadmapStageDefinition;
  steps: RoadmapStepProgress[];
  clearedCount: number;
  masteredCount: number;
  totalSteps: number;
  progressPct: number;
  status: RoadmapStageStatus;
  isWithinUserTarget: boolean;
}

export interface LearningRoadmapState {
  stages: RoadmapStageProgress[];
  activeStage: RoadmapStageProgress;
  nextStep: RoadmapStepProgress;
  targetScore: number;
  targetStageCount: 1 | 2 | 3 | 4;
  clearedCount: number;
  masteredCount: number;
  totalSteps: number;
  overallProgressPct: number;
  goalClearedCount: number;
  goalTotalSteps: number;
  goalProgressPct: number;
  isAllCleared: boolean;
  isAllMastered: boolean;
}

/**
 * Lộ trình 4 chặng sắp xếp theo thứ tự phụ thuộc kiến thức từ nền tảng câu đơn đến cấu trúc 700+.
 */
export const ROADMAP_STAGES: RoadmapStageDefinition[] = [
  {
    id: "stage-1",
    stageNumber: 1,
    titleVi: "Chặng 1: Khung câu đơn & Từ loại cốt lõi",
    targetRangeLabel: "0 – 350+ TOEIC",
    minTargetScore: 0,
    subtitleVi:
      "Định hình trục Chủ ngữ – Động từ – Tân ngữ, làm chủ 4 từ loại và hệ thì hữu hạn trước khi ghép mệnh đề phức.",
    vocabClusterLabel: "Từ vựng kinh doanh nền tảng (Họ từ & Giao dịch cơ bản)",
    vocabTopics: [
      "Contracts",
      "Marketing",
      "Warranties",
      "Business Planning",
      "Conference",
    ],
    gateRuleLabel: "Đạt Khá chắc (≥ 50% từ 5 câu) mỗi chủ điểm để vững nền tảng",
  },
  {
    id: "stage-2",
    stageNumber: 2,
    titleVi: "Chặng 2: Mở rộng Vị ngữ, Bị động & So sánh",
    targetRangeLabel: "350 – 500 TOEIC",
    minTargetScore: 350,
    subtitleVi:
      "Biến đổi sắc thái động từ với khuyết thiếu, làm chủ câu bị động thương mại và cấu trúc so sánh từ tính/trạng từ.",
    vocabClusterLabel: "Từ vựng văn phòng, đặt hàng & giao nhận",
    vocabTopics: [
      "Office Technology",
      "Office Procedures",
      "Ordering Supplies",
      "Shipping",
      "Invoice",
    ],
    gateRuleLabel: "Đạt Khá chắc (≥ 50% từ 5 câu) để chuyển sang câu phức",
  },
  {
    id: "stage-3",
    stageNumber: 3,
    titleVi: "Chặng 3: Câu phức, Mệnh đề & Động từ phi hữu hạn",
    targetRangeLabel: "500 – 650 TOEIC",
    minTargetScore: 500,
    subtitleVi:
      "Phân tách động từ chính vs. V-ing/To-V, đếm mệnh đề để phân biệt Liên từ/Giới từ và ghép nối Mệnh đề quan hệ, Điều kiện.",
    vocabClusterLabel: "Từ vựng nhân sự, phỏng vấn & phúc lợi",
    vocabTopics: [
      "Job Ads & Recruitment",
      "Apply and Interviewing",
      "Hiring and Training",
      "Salaries & Benefits",
      "Promotions, Pensions & Award",
    ],
    gateRuleLabel: "Đạt Khá chắc (≥ 50% từ 5 câu) để bước vào chặng bứt phá 700+",
  },
  {
    id: "stage-4",
    stageNumber: 4,
    titleVi: "Chặng 4: Bứt phá 700+ — Rút gọn, Đảo ngữ & Văn phong",
    targetRangeLabel: "700 – 850+ TOEIC",
    minTargetScore: 700,
    subtitleVi:
      "Xử lý bẫy tinh vi trong đề ETS: rút gọn mệnh đề phân từ, cấu trúc song hành, đảo ngữ điều kiện và collocations thương mại.",
    vocabClusterLabel: "Từ vựng tài chính, kế toán & quản trị chất lượng",
    vocabTopics: [
      "Inventory",
      "Banking",
      "Accounting",
      "Investment",
      "Taxes",
      "Financial Statements",
      "Quality Control",
      "Product Development",
      "Board Meeting & Committees",
    ],
    gateRuleLabel: "Hoàn thành toàn bộ lộ trình 16 chủ điểm TOEIC Part 5",
  },
];

export const ROADMAP_STEPS: RoadmapStepDefinition[] = [
  // Chặng 1 (5 chủ điểm)
  {
    order: 1,
    tagCode: "word_form",
    stageId: "stage-1",
    focusScope: "Vị trí Danh / Động / Tính / Trạng & Họ từ vựng",
    prerequisiteReason:
      "Chiếm 25–30% câu Part 5; học cách nhìn hậu tố Danh/Động/Tính/Trạng để chọn theo vị trí trước khi dịch nghĩa.",
    studyTip:
      "Ghi nhớ gốc từ theo cụm 4 từ loại (Danh – Động – Tính – Trạng) để nhận diện nhanh chỗ trống.",
  },
  {
    order: 2,
    tagCode: "nouns_pronouns",
    stageId: "stage-1",
    focusScope: "Danh từ đếm được / không đếm được, Đại từ & Lượng từ",
    prerequisiteReason:
      "Làm chủ danh từ đếm được/không đếm được, mạo từ và đại từ để dựng đúng cụm Chủ ngữ và Tân ngữ của câu.",
    studyTip:
      "Phân biệt kỹ đại từ nhân xưng, tân ngữ, tính từ sở hữu, đại từ sở hữu và đại từ phản thân (-self).",
  },
  {
    order: 3,
    tagCode: "adjectives_adverbs",
    stageId: "stage-1",
    focusScope: "Vị trí Tính/Trạng, đuôi -ed/-ing & cặp dễ nhầm",
    prerequisiteReason:
      "Hoàn thiện thành phần bổ nghĩa cho danh từ và động từ; phân biệt cặp dễ nhầm đuôi -ed/-ing và hard/hardly.",
    studyTip:
      "Ghi nhớ quy tắc linking verbs (remain, become, seem) đi với Tính từ thay vì Trạng từ.",
  },
  {
    order: 4,
    tagCode: "subject_verb",
    stageId: "stage-1",
    focusScope: "Chia động từ theo Chủ ngữ, đại từ bất định & cụm nối",
    prerequisiteReason:
      "Động từ chính phải hòa hợp số ít/số nhiều với nhân danh từ đứng đầu cụm chủ ngữ (trước giới từ of/in/with).",
    studyTip:
      "Luyện thói quen gạch bỏ cụm giới từ xen giữa để tìm đúng chủ ngữ cốt lõi.",
  },
  {
    order: 5,
    tagCode: "tenses",
    stageId: "stage-1",
    focusScope: "12 thì cơ bản đến hoàn thành, Used to & Phối hợp thì",
    prerequisiteReason:
      "Phải nắm chắc động từ hữu hạn chia thì làm nền tảng trước khi học Bị động, Điều kiện và V-ing/To-V.",
    studyTip:
      "Học tách từng nhóm Hiện tại → Quá khứ → Tương lai rồi mới ghép vào bảng phối hợp thì.",
  },

  // Chặng 2 (3 chủ điểm)
  {
    order: 6,
    tagCode: "modals",
    stageId: "stage-2",
    focusScope: "Must/Have to, Mustn't/Don't have to & Suy đoán quá khứ",
    prerequisiteReason:
      "Mở rộng vị ngữ từ khung thì Chặng 1 bằng động từ khuyết thiếu (+ V-inf) và cấu trúc khuyên bảo/giả định công sở.",
    studyTip:
      "Phân biệt mustn't (cấm) vs. don't have to (không cần) và cấu trúc phỏng đoán quá khứ (must/can't have V3).",
  },
  {
    order: 7,
    tagCode: "passive_voice",
    stageId: "stage-2",
    focusScope: "Bị động các thì, Thể sai khiến & Bị động khách quan",
    prerequisiteReason:
      "Dựa trực tiếp trên chia thì + V3/ed; hơn 60% động từ trong hợp đồng, giao vận và hóa đơn TOEIC dùng thể bị động.",
    studyTip:
      "Kiểm tra xem phía sau chỗ trống có Tân ngữ (N/cụm N) hay không để chốt nhanh Chủ động vs. Bị động.",
  },
  {
    order: 8,
    tagCode: "comparisons",
    stageId: "stage-2",
    focusScope: "So sánh bằng/hơn/nhất, trạng từ nhấn mạnh & so sánh kép",
    prerequisiteReason:
      "Phát triển từ Tính từ/Trạng từ (Chặng 1) sang cấu trúc so sánh bằng, hơn, nhất và từ nhấn mạnh (much/far/even).",
    studyTip:
      "Thuộc dấu hiệu nhanh: than → so sánh hơn; the + ... + in/of → so sánh nhất; as ... as → nguyên cấp.",
  },

  // Chặng 3 (4 chủ điểm)
  {
    order: 9,
    tagCode: "gerund_infinitive",
    stageId: "stage-3",
    focusScope: "To-V vs V-ing, giới từ 'to' & động từ đổi nghĩa",
    prerequisiteReason:
      "Sau khi vững Động từ chính (Chặng 1), học cách nhận diện động từ phi hữu hạn (V-ing / To-V) làm tân ngữ hoặc mục đích.",
    studyTip:
      "Nắm kỹ nhóm động từ đổi nghĩa (remember, stop, try, regret) và cụm giới từ + V-ing (look forward to).",
  },
  {
    order: 10,
    tagCode: "conjunctions_prepositions",
    stageId: "stage-3",
    focusScope: "Although/Despite, Because/Because of, By/Until, Unless",
    prerequisiteReason:
      "Bẫy kinh điển Part 5: phân tích số mệnh đề S–V để chọn Liên từ (+ mệnh đề) hay Giới từ (+ cụm danh từ).",
    studyTip:
      "Học theo cặp đối chiếu: Although/Despite, Because/Due to, While/During, By/Until.",
  },
  {
    order: 11,
    tagCode: "relative_clauses",
    stageId: "stage-3",
    focusScope: "Who/Whom/Which/Whose/Where & Mệnh đề không xác định",
    prerequisiteReason:
      "Mở rộng cụm danh từ (Chặng 1) bằng mệnh đề quan hệ xác định và không xác định (who, whom, which, that, whose, where).",
    studyTip:
      "Xác định từ đứng trước chỗ trống (người/vật/nơi chốn) và thành phần thiếu sau chỗ trống (S/O/sở hữu).",
  },
  {
    order: 12,
    tagCode: "conditionals",
    stageId: "stage-3",
    focusScope: "Điều kiện 1–2–3, Wish, Đảo ngữ & Thức giả định",
    prerequisiteReason:
      "Tổng hợp kiến thức lùi thì, Modals và liên từ điều kiện (unless, provided that, in case, as long as).",
    studyTip:
      "Nhìn thì ở mệnh đề chính để suy ngược thì ở mệnh đề If (và ngược lại) trong câu điều kiện loại 1–2–3.",
  },

  // Chặng 4 (4 chủ điểm)
  {
    order: 13,
    tagCode: "participles",
    stageId: "stage-4",
    focusScope: "Tính từ phân từ & Rút gọn mệnh đề V-ing / V3",
    prerequisiteReason:
      "Kết hợp Mệnh đề quan hệ (Chặng 3) + Thể bị động (Chặng 2) để rút gọn câu phức bằng V-ing (chủ động) hoặc V3/ed (bị động).",
    studyTip:
      "Khi câu đã có 1 động từ chính chia thì, chỗ trống bổ nghĩa cho danh từ hoặc đầu câu thường là phân từ rút gọn.",
  },
  {
    order: 14,
    tagCode: "parallel_structure",
    stageId: "stage-4",
    focusScope: "Song hành and/or/but, cặp tương quan & prefer...to",
    prerequisiteReason:
      "Cần nền tảng vững về cả từ loại lẫn cấu trúc mệnh đề để giữ đồng dạng giữa hai vế nối bởi and, or, both...and, not only...but also.",
    studyTip:
      "Soi ngay thành phần đứng trước/sau liên từ kết hợp để chọn dạng ngữ pháp tương xứng 1:1.",
  },
  {
    order: 15,
    tagCode: "inversion",
    stageId: "stage-4",
    focusScope: "Trạng từ phủ định, Only after/when & Đảo ngữ điều kiện",
    prerequisiteReason:
      "Cấu trúc nâng cao phân loại điểm 700+: đảo ngữ điều kiện (Should/Were/Had + S...) và trạng từ phủ định đầu câu (Rarely, Never).",
    studyTip:
      "Gặp chỗ trống đầu câu theo sau là S + V-inf và không có dấu hỏi chấm → kiểm tra ngay Should (đảo ngữ ĐK loại 1).",
  },
  {
    order: 16,
    tagCode: "collocations",
    stageId: "stage-4",
    focusScope: "Cụm động từ công sở & Giới từ cố định thương mại",
    prerequisiteReason:
      "Chốt hạ phần ngữ nghĩa & cụm từ cố định công sở (giới từ đi với Noun/Adj/Verb và Phrasal verbs) khi đã vững khung ngữ pháp.",
    studyTip:
      "Ôn kết hợp sổ từ vựng & FSRS để tăng phản xạ các cụm từ kinh doanh tần suất cao.",
  },
];

/**
 * Xác định số chặng mục tiêu dựa trên target_score trong hồ sơ người dùng.
 */
export function getTargetStageCount(targetScore?: number | null): 1 | 2 | 3 | 4 {
  const score =
    typeof targetScore === "number" && Number.isFinite(targetScore)
      ? targetScore
      : 650;

  if (score < 350) return 1;
  if (score < 500) return 2;
  if (score < 700) return 3;
  return 4;
}

/**
 * Kiểm tra một chủ điểm đã vượt cổng nền tảng của lộ trình hay chưa.
 * Chuẩn ARM (D-25): Đạt từ "Khá chắc" (>= 50% với tối thiểu 5 lượt) hoặc "Thành thạo".
 */
export function isRoadmapGateCleared(
  masteryLabel: MasteryLabel,
  totalAttempts: number,
  masteryPercentage: number
): boolean {
  if (masteryLabel === "mastered") return true;
  if (masteryLabel === "proficient") return true;
  return totalAttempts >= 5 && masteryPercentage >= 50;
}

/**
 * Tính toàn bộ trạng thái Lộ trình 4 chặng từ mảng độ vững 16 chủ điểm (Zero-Schema).
 */
export function buildLearningRoadmap(
  masteryInputs: RoadmapMasteryInput[],
  targetScore: number | null = 650
): LearningRoadmapState {
  const safeTargetScore =
    typeof targetScore === "number" && Number.isFinite(targetScore)
      ? Math.min(990, Math.max(10, Math.round(targetScore)))
      : 650;
  const targetStageCount = getTargetStageCount(safeTargetScore);

  const masteryMap = new Map<string, RoadmapMasteryInput>();
  for (const item of masteryInputs) {
    masteryMap.set(item.tagCode, item);
  }

  // Bước 1: Dựng dữ liệu thô cho từng bước và gom theo chặng
  const rawStages = ROADMAP_STAGES.map((stage) => {
    const stageSteps = ROADMAP_STEPS.filter((s) => s.stageId === stage.id).sort(
      (a, b) => a.order - b.order
    );

    const steps: RoadmapStepProgress[] = stageSteps.map((stepDef) => {
      const canonical = CANONICAL_GRAMMAR_TAGS[stepDef.tagCode];
      const microSummary = getLessonMicroSummary(stepDef.tagCode);
      const m = masteryMap.get(stepDef.tagCode);

      const totalAttempts = m?.totalAttempts ?? 0;
      const correctAttempts = m?.correctAttempts ?? 0;
      const masteryPercentage = m?.masteryPercentage ?? 0;
      const masteryLabel: MasteryLabel = m?.masteryLabel ?? "insufficient";
      const badgeInfo = m?.badgeInfo ?? MASTERY_BADGE_MAP[masteryLabel];
      const cleared = isRoadmapGateCleared(
        masteryLabel,
        totalAttempts,
        masteryPercentage
      );

      return {
        ...stepDef,
        nameVi: canonical?.nameVi ?? stepDef.tagCode,
        shortName: canonical?.shortName ?? stepDef.tagCode,
        fullNameVi: canonical?.fullNameVi ?? stepDef.tagCode,
        totalAttempts,
        correctAttempts,
        masteryPercentage,
        masteryLabel,
        badgeInfo,
        isGateCleared: cleared,
        isRecommendedNext: false,
        status: "up_next",
        moduleCount: microSummary.moduleCount,
        exerciseCount: microSummary.exerciseCount,
        moduleTitles: microSummary.moduleTitles,
      };
    });

    const clearedCount = steps.filter((s) => s.isGateCleared).length;
    const masteredCount = steps.filter((s) => s.masteryLabel === "mastered").length;
    const totalSteps = steps.length;
    const progressPct =
      totalSteps > 0 ? Math.round((clearedCount / totalSteps) * 100) : 0;

    return {
      stage,
      steps,
      clearedCount,
      masteredCount,
      totalSteps,
      progressPct,
      status: "guided_locked" as RoadmapStageStatus,
      isWithinUserTarget: stage.stageNumber <= targetStageCount,
    };
  });

  // Bước 2: Xác định trạng thái chặng (completed / active / guided_locked)
  let firstUncompletedAssigned = false;
  for (const st of rawStages) {
    if (st.clearedCount === st.totalSteps) {
      st.status = "completed";
    } else if (!firstUncompletedAssigned) {
      st.status = "active";
      firstUncompletedAssigned = true;
    } else {
      st.status = "guided_locked";
    }
  }

  const allCleared = rawStages.every((st) => st.status === "completed");
  const allMastered = rawStages.every(
    (st) => st.masteredCount === st.totalSteps
  );

  // Bước 3: Chọn Active Stage & Next Recommended Step
  let activeStage =
    rawStages.find((st) => st.status === "active") ??
    rawStages[rawStages.length - 1];

  let nextStep: RoadmapStepProgress | undefined;

  if (!allCleared) {
    const activeIncomplete = activeStage.steps.filter((s) => !s.isGateCleared);
    const needsReviewStep = activeIncomplete.find(
      (s) => s.masteryLabel === "needs_review"
    );
    nextStep = needsReviewStep ?? activeIncomplete[0];
  } else if (!allMastered) {
    const nonMastered = rawStages
      .flatMap((st) => st.steps)
      .filter((s) => s.masteryLabel !== "mastered")
      .sort((a, b) => a.masteryPercentage - b.masteryPercentage);
    nextStep = nonMastered[0];
    if (nextStep) {
      activeStage =
        rawStages.find((st) => st.stage.id === nextStep!.stageId) ?? activeStage;
    }
  } else {
    const sorted = rawStages
      .flatMap((st) => st.steps)
      .sort((a, b) => a.masteryPercentage - b.masteryPercentage);
    nextStep = sorted[0];
  }

  if (!nextStep) {
    nextStep = rawStages[0].steps[0];
  }

  // Bước 4: Gán status cuối cùng cho từng step
  for (const st of rawStages) {
    for (const step of st.steps) {
      step.isRecommendedNext = step.tagCode === nextStep.tagCode;

      if (step.masteryLabel === "mastered") {
        step.status = "mastered";
      } else if (step.masteryLabel === "proficient") {
        step.status = step.isRecommendedNext ? "recommended_next" : "proficient";
      } else if (step.masteryLabel === "needs_review") {
        step.status = step.isRecommendedNext ? "recommended_next" : "needs_review";
      } else if (step.isRecommendedNext) {
        step.status = "recommended_next";
      } else if (step.totalAttempts > 0) {
        step.status = "in_progress";
      } else if (st.status === "guided_locked") {
        step.status = "advised_later";
      } else {
        step.status = "up_next";
      }
    }
  }

  const allSteps = rawStages.flatMap((st) => st.steps);
  const clearedCount = allSteps.filter((s) => s.isGateCleared).length;
  const masteredCount = allSteps.filter((s) => s.masteryLabel === "mastered").length;
  const totalSteps = allSteps.length;
  const overallProgressPct =
    totalSteps > 0 ? Math.round((clearedCount / totalSteps) * 100) : 0;

  const goalSteps = rawStages
    .filter((st) => st.isWithinUserTarget)
    .flatMap((st) => st.steps);
  const goalClearedCount = goalSteps.filter((s) => s.isGateCleared).length;
  const goalTotalSteps = goalSteps.length;
  const goalProgressPct =
    goalTotalSteps > 0 ? Math.round((goalClearedCount / goalTotalSteps) * 100) : 0;

  return {
    stages: rawStages,
    activeStage,
    nextStep,
    targetScore: safeTargetScore,
    targetStageCount,
    clearedCount,
    masteredCount,
    totalSteps,
    overallProgressPct,
    goalClearedCount,
    goalTotalSteps,
    goalProgressPct,
    isAllCleared: allCleared,
    isAllMastered: allMastered,
  };
}

/**
 * Tra cứu ngữ cảnh lộ trình tĩnh của một chủ điểm (dùng cho trang chi tiết /learn/[tagCode]).
 */
export function getRoadmapContextByTag(tagCode: string): {
  stage: RoadmapStageDefinition;
  step: RoadmapStepDefinition;
  nextStep: (RoadmapStepDefinition & { nameVi: string }) | null;
} | null {
  const step = ROADMAP_STEPS.find((s) => s.tagCode === tagCode);
  if (!step) return null;

  const stage = ROADMAP_STAGES.find((st) => st.id === step.stageId);
  if (!stage) return null;

  const next = ROADMAP_STEPS.find((s) => s.order === step.order + 1) ?? null;
  const nextWithName = next
    ? {
        ...next,
        nameVi: CANONICAL_GRAMMAR_TAGS[next.tagCode]?.nameVi ?? next.tagCode,
      }
    : null;

  return {
    stage,
    step,
    nextStep: nextWithName,
  };
}
