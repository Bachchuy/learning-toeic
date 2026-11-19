import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { createInitialPracticeState } from "@/core/practiceReducer";
import {
  initDrillState,
  selectDrillOption,
  submitDrillAnswer,
  nextDrillQuestion,
  resetDrillState,
} from "@/core/drill";
import type { SessionReviewItem } from "@/features/practice/types";
import { calculateMasteryPercentage, getMasteryLabel } from "@/core/wilson";
import { previewFSRSRatings, type DBCardRow } from "@/core/fsrs";
import { runAutomatedValidator } from "@/core/adminReview";
import { CANONICAL_GRAMMAR_TAGS } from "@/core/grammarTags";

describe("Milestone M12: System Invariants & Integration Audit", () => {
  describe("Invariant 1: Đáp án không rời server trước khi nộp", () => {
    it("đảm bảo initial practice state và payload câu hỏi không chứa trường đáp án hay correct_index", () => {
      const sampleQuestion = {
        id: "q-101",
        stem: "The team ______ the project on schedule.",
        option_a: "completed",
        option_b: "complete",
        option_c: "completion",
        option_d: "completely",
        tag_id: 1,
        difficulty: 1,
      };

      // Payload gửi về client tuyệt đối không có correct_index hay explanation
      expect(sampleQuestion).not.toHaveProperty("correct_index");
      expect(sampleQuestion).not.toHaveProperty("explanation");

      // State reducer cũng không lưu trữ đáp án ngầm
      const state = createInitialPracticeState(5);
      expect(state).not.toHaveProperty("correctIndex");
      expect(state.currentResult).toBeNull();
    });
  });

  describe("Invariant 2: Drill không ghi DB, không đổi mastery", () => {
    it("thực hiện đầy đủ vòng đời Drill qua @/core/drill chỉ trên bộ nhớ cục bộ", () => {
      const sampleExplanation = {
        rule_vi: "Sau động từ khiếm khuyết dùng động từ nguyên mẫu.",
        why_correct_vi: "Cấu trúc modal + V-infinitive.",
      };

      const reviewItems: SessionReviewItem[] = [
        {
          question_id: "q-correct",
          order_index: 1,
          stem: "She can ______ English fluently.",
          option_a: "speak",
          option_b: "speaks",
          option_c: "spoke",
          option_d: "speaking",
          tag_name_vi: "Động từ",
          selected_index: 0,
          correct_index: 0,
          is_correct: true,
          explanation: sampleExplanation,
        },
        {
          question_id: "q-wrong-1",
          order_index: 2,
          stem: "They must ______ the contract today.",
          option_a: "signed",
          option_b: "sign",
          option_c: "signing",
          option_d: "signs",
          tag_name_vi: "Động từ",
          selected_index: 0,
          correct_index: 1,
          is_correct: false,
          explanation: sampleExplanation,
        },
        {
          question_id: "q-wrong-2",
          order_index: 3,
          stem: "We will ______ the meeting tomorrow.",
          option_a: "attending",
          option_b: "attends",
          option_c: "attend",
          option_d: "attended",
          tag_name_vi: "Thì động từ",
          selected_index: 1,
          correct_index: 2,
          is_correct: false,
          explanation: sampleExplanation,
        },
      ];

      let state = initDrillState(reviewItems);
      expect(state.questions.map((q) => q.question_id)).toEqual(["q-wrong-1", "q-wrong-2"]);
      expect(state.isFinished).toBe(false);

      // Câu Drill 1: chọn đúng đáp án (index 1)
      state = selectDrillOption(state, 1);
      state = submitDrillAnswer(state);
      expect(state.isSubmitted).toBe(true);
      expect(state.score).toBe(1);
      state = nextDrillQuestion(state);
      expect(state.currentIndex).toBe(1);
      expect(state.isFinished).toBe(false);

      // Câu Drill 2: chọn sai đáp án (index 0 thay vì 2)
      state = selectDrillOption(state, 0);
      state = submitDrillAnswer(state);
      expect(state.score).toBe(1);
      expect(state.userAnswers).toHaveLength(2);
      state = nextDrillQuestion(state);
      expect(state.isFinished).toBe(true);

      // Reset vòng Drill chỉ cập nhật state thuần túy
      const resetState = resetDrillState(state);
      expect(resetState.currentIndex).toBe(0);
      expect(resetState.score).toBe(0);
      expect(resetState.userAnswers).toEqual([]);
      expect(resetState.isFinished).toBe(false);
    });

    it("kiểm tra ranh giới mã nguồn: Drill core và DrillRunner không import Supabase hay action ghi DB", () => {
      const drillCore = fs.readFileSync(
        path.resolve(process.cwd(), "src/core/drill.ts"),
        "utf-8"
      );
      const drillRunner = fs.readFileSync(
        path.resolve(process.cwd(), "src/features/practice/components/drill-runner.tsx"),
        "utf-8"
      );

      for (const source of [drillCore, drillRunner]) {
        expect(source).not.toContain("@/lib/supabase");
        expect(source).not.toContain("@supabase/");
        expect(source).not.toContain("submitAnswerAction");
        expect(source).not.toContain("finishSessionAction");
        expect(source).not.toContain("createSessionAction");
        expect(source).not.toMatch(/\.rpc\s*\(/);
        expect(source).not.toMatch(/\.from\(\s*["']attempts["']\s*\)/);
        expect(source).not.toMatch(/\bfetch\s*\(/);
      }
    });
  });

  describe("Invariant 3: Mastery = Adaptive Rolling Mastery (z=1.0, window 20, fast-track n>=8 - D-25)", () => {
    it("tuân thủ chuẩn mực đánh giá thích ứng D-25 (thay thế D-04): ngưỡng 5 / 50 / 75 và fast-track", () => {
      // Dưới 5 lượt làm -> Đang khởi động (insufficient)
      expect(getMasteryLabel(0, 0)).toBe("insufficient");
      expect(getMasteryLabel(1, 100)).toBe("insufficient");
      expect(getMasteryLabel(4, 100)).toBe("insufficient");

      // Bắt đầu từ 5 lượt:
      // 6/10 -> 44.3% -> "needs_review" (< 50)
      const p6_10 = calculateMasteryPercentage(6, 10);
      expect(p6_10).toBe(44.3);
      expect(getMasteryLabel(10, p6_10)).toBe("needs_review");

      // 8/10 -> 64.9% -> "proficient" (50 <= score < 75) - Không còn bị dìm thành Cần ôn
      const p8_10 = calculateMasteryPercentage(8, 10);
      expect(p8_10).toBe(64.9);
      expect(getMasteryLabel(10, p8_10)).toBe("proficient");

      // 17/20 -> 75.4% -> "mastered" (>= 75)
      const p17_20 = calculateMasteryPercentage(17, 20);
      expect(p17_20).toBe(75.4);
      expect(getMasteryLabel(20, p17_20)).toBe("mastered");

      // 40/40 -> cửa sổ trượt 20 câu đạt Thành thạo tuyệt đối
      const p40_40 = calculateMasteryPercentage(40, 40);
      expect(p40_40).toBeGreaterThanOrEqual(75);
      expect(getMasteryLabel(40, p40_40)).toBe("mastered");

      // Fast-track: làm đúng 8/8 câu đạt thẳng "mastered"
      expect(getMasteryLabel(8, 88.9, 1.0)).toBe("mastered");
    });
  });

  describe("Invariant 4: FSRS lập lịch dùng ts-fsrs 5.4.2 ở server", () => {
    it("tính toán chuyển trạng thái thẻ theo 4 cấp độ: Again(1), Hard(2), Good(3), Easy(4)", () => {
      const now = new Date("2026-10-26T12:00:00Z");

      const mockCard: DBCardRow = {
        id: "card-1",
        user_id: "user-1",
        vocab_entry_id: "vocab-1",
        state: 0,
        stability: 0,
        difficulty: 0,
        due: now,
        reps: 0,
        lapses: 0,
      };

      const previews = previewFSRSRatings(mockCard, now);
      expect(previews.length).toBe(4);

      const [again, hard, good, easy] = previews;
      expect(again.rating).toBe(1);
      expect(hard.rating).toBe(2);
      expect(good.rating).toBe(3);
      expect(easy.rating).toBe(4);

      // Khoảng cách thời gian Easy phải lớn hơn hoặc bằng Good
      expect(easy.due.getTime()).toBeGreaterThanOrEqual(good.due.getTime());
    });
  });

  describe("Invariant 5: Cổng kiểm tra tự động S3 - S6 (Admin Review Gate)", () => {
    it("chặn hoàn toàn câu hỏi thiếu chỗ trống hoặc không đủ 4 phương án", () => {
      // Câu thiếu chỗ trống
      const malformedStem = {
        stem: "The manager was very pleased with the sales report.",
        option_a: "A",
        option_b: "B",
        option_c: "C",
        option_d: "D",
        correct_index: 0,
        explanation: {
          rule_vi: "Luật",
          why_correct_vi: "Lý do",
          full_translation_vi: "Dịch",
          options_analysis: { A: "1", B: "2", C: "3", D: "4" },
          tip_vi: "Mẹo",
          vocab_hints: [],
        },
      };

      const result1 = runAutomatedValidator(malformedStem);
      expect(result1.overallPass).toBe(false);
      expect(result1.checks.some((c) => c.id === "S3" && c.status === "fail")).toBe(true);

      // Câu có phương án trùng lặp
      const duplicateOptions = {
        ...malformedStem,
        stem: "The manager was ______ pleased with the sales report.",
        option_b: "A", // Trùng với option_a
      };

      const result2 = runAutomatedValidator(duplicateOptions);
      expect(result2.overallPass).toBe(false);
      expect(result2.checks.some((c) => c.id === "S4" && c.status === "fail")).toBe(true);
    });
  });

  describe("Invariant 6: Khung 16 chủ điểm ngữ pháp chuẩn ETS", () => {
    it("đầy đủ 16 chủ điểm chính thống và không chứa tag lạ", () => {
      const tagCodes = Object.keys(CANONICAL_GRAMMAR_TAGS);
      expect(tagCodes.length).toBe(16);
      expect(tagCodes).toContain("word_form");
      expect(tagCodes).toContain("tenses");
      expect(tagCodes).toContain("passive_voice");
      expect(tagCodes).toContain("relative_clauses");
      expect(tagCodes).toContain("conjunctions_prepositions");
      expect(tagCodes).toContain("subject_verb");
      expect(tagCodes).toContain("comparisons");
      expect(tagCodes).toContain("conditionals");
    });
  });
});
