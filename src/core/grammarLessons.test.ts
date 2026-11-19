import { describe, it, expect } from "vitest";
import {
  getAllGrammarLessons,
  getGrammarLessonByCode,
  getGrammarLessonsByCategory,
  getGrammarLessonSummaries,

  buildLessonMicroModules,
  getLessonMicroSummary,
} from "./grammarLessons";
import {
  getExampleHighlights,
  splitTextWithHighlights,
} from "./lessonHighlights";
import {
  LESSON_PRACTICE_EXERCISES,
  getLessonPracticeExercises,
  isFillBlankExercise,
  checkFillBlankAnswer,
  normalizeFillBlankAnswer,
} from "./lessonExercises";
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

  it("chủ điểm Thì động từ (tenses) phải chứa đầy đủ trọn vẹn 12 thì chuẩn tiếng Anh, 6 cặp so sánh Murphy và ví dụ song ngữ", () => {
    const tensesLesson = getGrammarLessonByCode("tenses");
    expect(tensesLesson).not.toBeNull();
    expect(tensesLesson?.tensesDetail).toBeDefined();

    const tenses = tensesLesson!.tensesDetail!.tenses;
    expect(tenses.length).toBe(13); // 12 thì chuẩn tiếng Anh + Tương lai gần (Be going to)

    // Kiểm tra có đủ Past Perfect Continuous và Future Perfect Continuous
    expect(tenses.some((t) => t.id === "past_perfect_continuous")).toBe(true);
    expect(tenses.some((t) => t.id === "future_perfect_continuous")).toBe(true);

    // Kiểm tra 6 cặp so sánh đối chiếu của Raymond Murphy
    const comparisons = tensesLesson!.tensesDetail!.tenseComparisons;
    expect(comparisons).toBeDefined();
    expect(comparisons!.length).toBeGreaterThanOrEqual(6);
    expect(comparisons!.some((c) => c.id === "past_perf_vs_past_perf_cont")).toBe(true);
    expect(comparisons!.some((c) => c.id === "pres_perf_vs_past_simp")).toBe(true);

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
        expect(lesson.tensesDetail!.tenses.length).toBe(13);
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

  it("các chủ điểm then chốt phải được cập nhật đầy đủ kiến thức chuẩn mực từ English Grammar in Use & Barron's 600 Words", () => {
    // 1. Tenses: kiểm tra quy tắc used to vs be used to
    const tenses = getGrammarLessonByCode("tenses");
    expect(tenses?.tensesDetail?.sequenceRules.some((r) => r.pattern.includes("Used to"))).toBe(true);
    expect(tenses?.traps.some((t) => t.title.includes("Used to"))).toBe(true);

    // 2. Modals: kiểm tra phân biệt Must, Have to, Mustn't, Don't have to
    const modals = getGrammarLessonByCode("modals");
    expect(modals?.detailedSections?.some((s) => s.title.includes("Mức độ Bắt buộc"))).toBe(true);
    expect(modals?.traps.some((t) => t.title.includes("Mustn't"))).toBe(true);

    // 3. Conjunctions & Prepositions: kiểm tra By vs Until, Unless, In case
    const conj = getGrammarLessonByCode("conjunctions_prepositions");
    expect(conj?.detailedSections?.some((s) => s.title.includes("By vs Until"))).toBe(true);
    expect(conj?.detailedSections?.some((s) => s.title.includes("Unless"))).toBe(true);

    // 4. Gerund & Infinitive: kiểm tra Remember, Regret, Stop, Try
    const gerund = getGrammarLessonByCode("gerund_infinitive");
    expect(gerund?.detailedSections?.some((s) => s.title.includes("KHÁC BIỆT HOÀN TOÀN"))).toBe(true);
    expect(gerund?.detailedSections?.some((s) => s.title.includes("Thành ngữ đặc biệt"))).toBe(true);

    // 5. Word Form: kiểm tra Word Families & Động từ
    const wordForm = getGrammarLessonByCode("word_form");
    expect(wordForm?.detailedSections?.some((s) => s.title.includes("Word Families"))).toBe(true);

    // 6. Adjectives & Adverbs: kiểm tra cặp dễ nhầm Hard/Hardly, Late/Lately
    const adjAdv = getGrammarLessonByCode("adjectives_adverbs");
    expect(adjAdv?.detailedSections?.some((s) => s.title.includes("Dễ Gây Nhầm Lẫn"))).toBe(true);

    // 7. Passive Voice: kiểm tra Bị động khách quan / Tường thuật
    const passive = getGrammarLessonByCode("passive_voice");
    expect(passive?.detailedSections?.some((s) => s.title.includes("Bị động Khách quan"))).toBe(true);
  });

  it("getGrammarLessonSummaries trả về đủ 16 tóm tắt gọn nhẹ khớp với bài học chi tiết", () => {
    const lessons = getAllGrammarLessons();
    const summaries = getGrammarLessonSummaries();

    expect(summaries.length).toBe(16);
    for (let i = 0; i < lessons.length; i++) {
      expect(summaries[i].tagCode).toBe(lessons[i].tagCode);
      expect(summaries[i].cheatSheetCount).toBe(lessons[i].cheatSheet.length);
      expect(summaries[i].trapsCount).toBe(lessons[i].traps.length);
      expect(summaries[i].coreDefinition).toBe(lessons[i].coreRule.definition);
    }
  });

  it("chia nhỏ đủ 16 bài học thành các học phần ngắn kèm bài tập áp dụng ngay tại mọi phần và không còn gán nhãn Murphy/Appendix/Barron", () => {
    const lessons = getAllGrammarLessons();

    for (const lesson of lessons) {
      const modules = buildLessonMicroModules(lesson);
      const summary = getLessonMicroSummary(lesson.tagCode);

      expect(modules.length).toBeGreaterThanOrEqual(3);
      expect(modules.length).toBeLessThanOrEqual(6);
      expect(summary.moduleCount).toBe(modules.length);
      expect(summary.exerciseCount).toBeGreaterThanOrEqual(5);

      for (const mod of modules) {
        expect(mod.titleVi).not.toMatch(/Murphy|Appendix|Barron/i);
        expect(mod.exercises.length).toBeGreaterThanOrEqual(3);
        for (const ex of mod.exercises) {
          expect(ex.questionStem).toContain("_______");
          expect(ex.explanationStepByStep.length).toBeGreaterThanOrEqual(2);
          if (isFillBlankExercise(ex)) {
            expect(ex.acceptedAnswers.length).toBeGreaterThanOrEqual(1);
            expect(
              checkFillBlankAnswer(ex.acceptedAnswers[0], ex.acceptedAnswers)
            ).toBe(true);
          } else {
            expect(ex.options.length).toBe(4);
            expect(ex.correctIndex).toBeGreaterThanOrEqual(0);
            expect(ex.correctIndex).toBeLessThan(4);
          }
        }
      }

      const exercises = LESSON_PRACTICE_EXERCISES[lesson.tagCode] ?? [];
      expect(exercises.length).toBeGreaterThanOrEqual(4);
      const mergedExercises = getLessonPracticeExercises(lesson.tagCode);
      expect(mergedExercises.length).toBeGreaterThanOrEqual(9);
    }
  });

  it("toàn bộ câu ví dụ trong 16 bài học đều có cụm từ đánh dấu/gạch chân khớp chính xác chuỗi gốc", () => {
    const lessons = getAllGrammarLessons();
    let totalVerifiedExamples = 0;

    const verifySentence = (sentence: string) => {
      totalVerifiedExamples++;
      const highlights = getExampleHighlights(sentence);
      expect(
        highlights.length,
        `Thiếu highlight cho câu ví dụ: "${sentence}"`
      ).toBeGreaterThan(0);

      for (const h of highlights) {
        expect(
          sentence.includes(h),
          `Cụm đánh dấu "${h}" không khớp trong câu "${sentence}"`
        ).toBe(true);
      }

      const segments = splitTextWithHighlights(sentence, highlights);
      expect(segments.some((s) => s.highlighted)).toBe(true);
      expect(segments.map((s) => s.text).join("")).toBe(sentence);
    };

    for (const lesson of lessons) {
      for (const item of lesson.cheatSheet) {
        verifySentence(item.example);
      }
      for (const sec of lesson.detailedSections ?? []) {
        for (const rule of sec.rules) {
          for (const ex of rule.examples) {
            verifySentence(ex.en);
          }
        }
      }
      if (lesson.tensesDetail) {
        for (const t of lesson.tensesDetail.tenses) {
          for (const u of t.usages) {
            verifySentence(u.exampleEn);
          }
        }
        for (const seq of lesson.tensesDetail.sequenceRules) {
          verifySentence(seq.exampleEn);
          for (const extra of seq.extraExamples ?? []) {
            verifySentence(extra.en);
          }
        }
        for (const comp of lesson.tensesDetail.tenseComparisons ?? []) {
          for (const pair of comp.examplePairs ?? []) {
            verifySentence(pair.exampleA.en);
            verifySentence(pair.exampleB.en);
          }
        }
      }
    }

    expect(totalVerifiedExamples).toBeGreaterThanOrEqual(320);
  });

  it("mọi quy tắc trong 16 bài học đều có ít nhất 2 ví dụ minh họa song ngữ", () => {
    const lessons = getAllGrammarLessons();

    for (const lesson of lessons) {
      for (const sec of lesson.detailedSections ?? []) {
        for (const rule of sec.rules) {
          expect(
            rule.examples.length,
            `Quy tắc "${lesson.tagCode}::${rule.title}" chỉ có ${rule.examples.length} ví dụ`
          ).toBeGreaterThanOrEqual(2);
        }
      }
      if (lesson.tensesDetail) {
        for (const tense of lesson.tensesDetail.tenses) {
          expect(
            tense.usages.length,
            `Thì "${tense.id}" chỉ có ${tense.usages.length} cách dùng/ví dụ`
          ).toBeGreaterThanOrEqual(2);
        }
        for (const seq of lesson.tensesDetail.sequenceRules) {
          const totalSeqExamples = 1 + (seq.extraExamples?.length ?? 0);
          expect(
            totalSeqExamples,
            `Quy tắc phối hợp thì "${seq.pattern}" chỉ có ${totalSeqExamples} ví dụ`
          ).toBeGreaterThanOrEqual(2);
        }
      }
    }
  });

  it("chuẩn hóa và chấm đúng bài tập điền từ (khoảng trắng, viết hoa, nháy cong và dấu chấm cuối)", () => {
    expect(normalizeFillBlankAnswer("  IS   Attending. ")).toBe("is attending");
    expect(normalizeFillBlankAnswer("doesn’t work!")).toBe("doesn't work");

    expect(
      checkFillBlankAnswer("  Agreement ", ["agreement", "agreements"])
    ).toBe(true);
    expect(
      checkFillBlankAnswer("DOESN’T WORK.", ["does not work", "doesn't work"])
    ).toBe(true);
    expect(checkFillBlankAnswer("agreeable", ["agreement"])).toBe(false);
    expect(checkFillBlankAnswer("   ", ["agreement"])).toBe(false);
  });

  it("mỗi bài học đều có cả dạng chọn đáp án và điền từ với id không trùng lặp", () => {
    const lessons = getAllGrammarLessons();
    for (const lesson of lessons) {
      const merged = getLessonPracticeExercises(lesson.tagCode);
      const ids = merged.map((ex) => ex.id);
      expect(new Set(ids).size).toBe(ids.length);

      const mcqCount = merged.filter((ex) => !isFillBlankExercise(ex)).length;
      const fillCount = merged.filter((ex) => isFillBlankExercise(ex)).length;
      expect(mcqCount).toBeGreaterThanOrEqual(4);
      expect(fillCount).toBeGreaterThanOrEqual(3);
    }
  });
});
