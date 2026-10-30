import { describe, it, expect } from "vitest";
import {
  getAllGrammarLessons,
  getGrammarLessonByCode,
  getGrammarLessonsByCategory,
  hasGrammarLesson,
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

  it("hasGrammarLesson kiểm tra sự tồn tại của bài học", () => {
    expect(hasGrammarLesson("tenses")).toBe(true);
    expect(hasGrammarLesson("word_form")).toBe(true);
    expect(hasGrammarLesson("unknown_tag_123")).toBe(false);
  });
});
