import { describe, it, expect } from "vitest";
import {
  getAllGrammarLessons,
  getGrammarLessonByCode,
  getGrammarLessonsByCategory,

} from "./grammarLessons";
import { CANONICAL_GRAMMAR_TAGS } from "./grammarTags";

describe("Grammar Lessons Core Unit Tests", () => {
  it("mọi bài học phải tương ứng với một tagCode hợp lệ trong CANONICAL_GRAMMAR_TAGS và đủ 16 chủ điểm", () => {
    const lessons = getAllGrammarLessons();
    expect(lessons.length).toBe(16);

    for (const lesson of lessons) {
      expect(CANONICAL_GRAMMAR_TAGS[lesson.tagCode]).toBeDefined();
      expect(lesson.titleVi).toBeTruthy();
      expect(lesson.estimatedMinutes).toBeGreaterThan(0);
    }
  });

  it("mỗi bài học phải có cấu trúc đầy đủ: coreRule, cheatSheet, traps, workedExample", () => {
    const lessons = getAllGrammarLessons();

    for (const lesson of lessons) {
      // Core rule
      expect(lesson.coreRule.definition.length).toBeGreaterThan(20);
      expect(lesson.coreRule.keyFormulas.length).toBeGreaterThan(0);
      expect(lesson.coreRule.deepInsight.length).toBeGreaterThan(10);

      // Cheat sheet items
      expect(lesson.cheatSheet.length).toBeGreaterThan(0);
      for (const item of lesson.cheatSheet) {
        expect(item.signal).toBeTruthy();
        expect(item.rule).toBeTruthy();
        expect(item.example).toBeTruthy();
      }

      // Traps
      expect(lesson.traps.length).toBeGreaterThan(0);
      for (const trap of lesson.traps) {
        expect(trap.title).toBeTruthy();
        expect(trap.trapDescription).toBeTruthy();
        expect(trap.correctRule).toBeTruthy();
      }

      // Worked example
      const ex = lesson.workedExample;
      expect(ex.questionStem).toContain("_______");
      expect(ex.options.length).toBe(4);
      expect(ex.correctIndex).toBeGreaterThanOrEqual(0);
      expect(ex.correctIndex).toBeLessThan(4);
      expect(ex.explanationStepByStep.length).toBeGreaterThan(0);
    }
  });

  it("getGrammarLessonByCode trả về đúng bài học hoặc null nếu không tồn tại", () => {
    const lesson = getGrammarLessonByCode("tenses");
    expect(lesson).not.toBeNull();
    expect(lesson?.tagCode).toBe("tenses");

    const nonExistent = getGrammarLessonByCode("non_existent_tag");
    expect(nonExistent).toBeNull();
  });

  it("getGrammarLessonsByCategory lọc chính xác theo danh mục", () => {
    const verbLessons = getGrammarLessonsByCategory("verbs");
    expect(verbLessons.length).toBeGreaterThan(0);
    for (const l of verbLessons) {
      expect(l.category).toBe("verbs");
    }
  });

  it("chủ điểm Thì động từ (tenses) phải chứa đầy đủ 11 thì, cấu trúc (+/-/?) và ví dụ song ngữ", () => {
    const tensesLesson = getGrammarLessonByCode("tenses");
    expect(tensesLesson).not.toBeNull();
    expect(tensesLesson?.tensesDetail).toBeDefined();

    const tenses = tensesLesson!.tensesDetail!.tenses;
    expect(tenses.length).toBeGreaterThanOrEqual(11);

    for (const tense of tenses) {
      expect(tense.nameVi).toBeTruthy();
      expect(tense.nameEn).toBeTruthy();
      expect(tense.formula.affirmative).toBeTruthy();
      expect(tense.formula.negative).toBeTruthy();
      expect(tense.formula.question).toBeTruthy();
      expect(tense.usages.length).toBeGreaterThan(0);

      for (const usage of tense.usages) {
        expect(usage.context).toBeTruthy();
        expect(usage.explanation).toBeTruthy();
        expect(usage.exampleEn).toBeTruthy();
        expect(usage.exampleVi).toBeTruthy();
      }
      expect(tense.signals.length).toBeGreaterThan(0);
      expect(tense.toeicTip).toBeTruthy();
    }

    // Kiểm tra quy tắc phối hợp thì
    const seq = tensesLesson!.tensesDetail!.sequenceRules;
    expect(seq.length).toBeGreaterThanOrEqual(5);
    for (const rule of seq) {
      expect(rule.pattern).toBeTruthy();
      expect(rule.ruleVi).toBeTruthy();
      expect(rule.exampleEn).toBeTruthy();
      expect(rule.exampleVi).toBeTruthy();
    }
  });

  it("toàn bộ 16 chủ điểm đều phải có giáo trình chi tiết chuyên sâu (tensesDetail hoặc detailedSections)", () => {
    const lessons = getAllGrammarLessons();
    expect(lessons.length).toBe(16);

    for (const lesson of lessons) {
      if (lesson.tagCode === "tenses") {
        expect(lesson.tensesDetail).toBeDefined();
        expect(lesson.tensesDetail!.tenses.length).toBeGreaterThanOrEqual(11);
      } else {
        expect(lesson.detailedSections).toBeDefined();
        expect(lesson.detailedSections!.length).toBeGreaterThan(0);

        for (const sec of lesson.detailedSections!) {
          expect(sec.title).toBeTruthy();
          expect(sec.rules.length).toBeGreaterThan(0);
          for (const rule of sec.rules) {
            expect(rule.title).toBeTruthy();
            expect(rule.explanation).toBeTruthy();
            expect(rule.examples.length).toBeGreaterThan(0);
            for (const ex of rule.examples) {
              expect(ex.en).toBeTruthy();
              expect(ex.vi).toBeTruthy();
            }
          }
        }
      }
    }
  });
});
