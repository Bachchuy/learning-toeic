import { describe, it, expect } from "vitest";
import { CANONICAL_GRAMMAR_TAGS } from "./grammarTags";
import {
  ROADMAP_STAGES,
  ROADMAP_STEPS,
  getTargetStageCount,
  buildLearningRoadmap,
  getRoadmapContextByTag,
  type RoadmapMasteryInput,
} from "./roadmap";

function makeInput(
  tagCode: string,
  masteryLabel: RoadmapMasteryInput["masteryLabel"],
  masteryPercentage: number,
  totalAttempts: number
): RoadmapMasteryInput {
  return {
    tagCode,
    masteryLabel,
    masteryPercentage,
    totalAttempts,
    correctAttempts: Math.round((masteryPercentage / 100) * totalAttempts),
  };
}

describe("Learning Roadmap Core (4-Stage Guided Progression)", () => {
  it("bao phủ đúng 16 chủ điểm duy nhất khớp 100% với CANONICAL_GRAMMAR_TAGS theo thứ tự 1..16 và không chứa nhãn Murphy/Appendix", () => {
    expect(ROADMAP_STAGES.length).toBe(4);
    expect(ROADMAP_STEPS.length).toBe(16);

    const stepTagCodes = ROADMAP_STEPS.map((s) => s.tagCode);
    const uniqueTagCodes = new Set(stepTagCodes);
    expect(uniqueTagCodes.size).toBe(16);

    const canonicalKeys = Object.keys(CANONICAL_GRAMMAR_TAGS);
    for (const key of canonicalKeys) {
      expect(uniqueTagCodes.has(key)).toBe(true);
    }

    ROADMAP_STEPS.forEach((step, idx) => {
      expect(step.order).toBe(idx + 1);
      expect(step.focusScope.length).toBeGreaterThan(5);
      expect(step.prerequisiteReason.length).toBeGreaterThan(15);
      expect(step.focusScope).not.toMatch(/Murphy|Appendix|Barron/i);
      expect(step.studyTip).not.toMatch(/Murphy|Appendix|Barron/i);
    });
  });

  it("ánh xạ chính xác targetScore sang số chặng mục tiêu", () => {
    expect(getTargetStageCount(300)).toBe(1);
    expect(getTargetStageCount(450)).toBe(2);
    expect(getTargetStageCount(650)).toBe(3);
    expect(getTargetStageCount(800)).toBe(4);
    expect(getTargetStageCount(null)).toBe(3);
  });

  it("người mới (0 attempts) bắt đầu ở Chặng 1, Bước 1 'word_form' với trạng thái recommended_next và có đầy đủ thông tin học phần nhỏ + bài tập", () => {
    const roadmap = buildLearningRoadmap([], 650);

    expect(roadmap.activeStage.stage.id).toBe("stage-1");
    expect(roadmap.nextStep.tagCode).toBe("word_form");
    expect(roadmap.nextStep.status).toBe("recommended_next");
    expect(roadmap.nextStep.moduleCount).toBeGreaterThanOrEqual(3);
    expect(roadmap.nextStep.exerciseCount).toBeGreaterThanOrEqual(5);
    expect(roadmap.clearedCount).toBe(0);
    expect(roadmap.overallProgressPct).toBe(0);
    expect(roadmap.goalTotalSteps).toBe(12);

    expect(roadmap.stages[0].status).toBe("active");
    expect(roadmap.stages[1].status).toBe("guided_locked");
    expect(roadmap.stages[2].status).toBe("guided_locked");
    expect(roadmap.stages[3].status).toBe("guided_locked");
    expect(roadmap.stages[1].steps[0].status).toBe("advised_later");
  });

  it("khi hoàn thành toàn bộ Chặng 1 (>= 50% từ 5 câu), Chặng 1 completed và Chặng 2 mở active tại 'modals'", () => {
    const stage1Cleared: RoadmapMasteryInput[] = [
      makeInput("word_form", "mastered", 80, 10),
      makeInput("nouns_pronouns", "proficient", 58, 6),
      makeInput("adjectives_adverbs", "proficient", 65, 8),
      makeInput("subject_verb", "mastered", 78, 12),
      makeInput("tenses", "proficient", 55, 10),
    ];

    const roadmap = buildLearningRoadmap(stage1Cleared, 650);

    expect(roadmap.stages[0].status).toBe("completed");
    expect(roadmap.stages[0].progressPct).toBe(100);
    expect(roadmap.stages[1].status).toBe("active");
    expect(roadmap.activeStage.stage.id).toBe("stage-2");
    expect(roadmap.nextStep.tagCode).toBe("modals");
    expect(roadmap.clearedCount).toBe(5);
  });

  it("ưu tiên gợi ý khắc phục chủ điểm đang 'needs_review' (< 50%) trong chặng hiện tại", () => {
    const inputs: RoadmapMasteryInput[] = [
      makeInput("word_form", "mastered", 82, 10),
      makeInput("nouns_pronouns", "insufficient", 60, 3),
      makeInput("adjectives_adverbs", "needs_review", 35, 8),
    ];

    const roadmap = buildLearningRoadmap(inputs, 500);

    expect(roadmap.activeStage.stage.id).toBe("stage-1");
    expect(roadmap.nextStep.tagCode).toBe("adjectives_adverbs");
    expect(roadmap.nextStep.status).toBe("recommended_next");
  });

  it("bảo toàn thành tích nếu học viên nhảy cóc làm trước chủ điểm ở Chặng 3 (Guided Roadmap)", () => {
    const inputs: RoadmapMasteryInput[] = [
      makeInput("relative_clauses", "mastered", 85, 10),
    ];

    const roadmap = buildLearningRoadmap(inputs, 650);

    expect(roadmap.stages[0].status).toBe("active");
    expect(roadmap.nextStep.tagCode).toBe("word_form");
    const relStep = roadmap.stages[2].steps.find(
      (s) => s.tagCode === "relative_clauses"
    );
    expect(relStep?.status).toBe("mastered");
    expect(relStep?.isGateCleared).toBe(true);
  });

  it("khi cả 16 chủ điểm đã qua cổng nhưng có chủ điểm mới Khá chắc, đề xuất nâng cấp chủ điểm thấp nhất lên Thành thạo", () => {
    const inputs: RoadmapMasteryInput[] = ROADMAP_STEPS.map((s) =>
      s.tagCode === "inversion"
        ? makeInput(s.tagCode, "proficient", 54, 8)
        : makeInput(s.tagCode, "mastered", 84, 12)
    );

    const roadmap = buildLearningRoadmap(inputs, 800);

    expect(roadmap.isAllCleared).toBe(true);
    expect(roadmap.isAllMastered).toBe(false);
    expect(roadmap.nextStep.tagCode).toBe("inversion");
  });

  it("getRoadmapContextByTag trả về đúng thông tin chặng và bước kế tiếp", () => {
    const ctx1 = getRoadmapContextByTag("word_form");
    expect(ctx1?.stage.stageNumber).toBe(1);
    expect(ctx1?.step.order).toBe(1);
    expect(ctx1?.nextStep?.tagCode).toBe("nouns_pronouns");

    const ctxLast = getRoadmapContextByTag("collocations");
    expect(ctxLast?.stage.stageNumber).toBe(4);
    expect(ctxLast?.step.order).toBe(16);
    expect(ctxLast?.nextStep).toBeNull();

    expect(getRoadmapContextByTag("unknown_tag")).toBeNull();
  });
});
