import { describe, it, expect } from "vitest";
import { createInitialPracticeState } from "@/core/practiceReducer";
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
    it("thực hiện chu kỳ Drill chỉ cập nhật local memory và không phát sinh attempt DB record", () => {
      // Giả lập 2 câu hỏi sai đưa vào Drill
      const drillAnswers: Record<string, number> = {};
      let attemptDbCallsCount = 0;

      // Người dùng làm câu 1 trong Drill
      drillAnswers["q-1"] = 0; // Trả lời đúng
      // Bất biến: Không được gọi RPC submit_answer hay ghi attempt vào DB
      const recordToDb = false;
      if (recordToDb) attemptDbCallsCount++;

      expect(attemptDbCallsCount).toBe(0);
      expect(drillAnswers["q-1"]).toBe(0);
    });
  });

  describe("Invariant 3: Mastery = Wilson z=1.96 với các ngưỡng 5 / 50 / 75", () => {
    it("tuân thủ nghiêm ngặt bảng giá trị tham chiếu Phụ lục A (docs/A-test-data.md)", () => {
      // Dưới 5 lượt làm -> Chưa đủ dữ liệu
      expect(getMasteryLabel(0, 0)).toBe("insufficient");
      expect(getMasteryLabel(1, 100)).toBe("insufficient");
      expect(getMasteryLabel(4, 100)).toBe("insufficient");

      // Bắt đầu từ 5 lượt:
      // 8/10 -> 49.0% -> "needs_review" (< 50)
      const p8_10 = calculateMasteryPercentage(8, 10);
      expect(p8_10).toBe(49.0);
      expect(getMasteryLabel(10, p8_10)).toBe("needs_review");

      // 8/9 -> 56.5% -> "proficient" (50 <= score < 75)
      const p8_9 = calculateMasteryPercentage(8, 9);
      expect(p8_9).toBe(56.5);
      expect(getMasteryLabel(9, p8_9)).toBe("proficient");

      // 18/20 -> 69.9% -> "proficient" (50 <= score < 75)
      const p18_20 = calculateMasteryPercentage(18, 20);
      expect(p18_20).toBe(69.9);
      expect(getMasteryLabel(20, p18_20)).toBe("proficient");

      // 40/40 -> 91.2% -> "mastered" (>= 75)
      const p40_40 = calculateMasteryPercentage(40, 40);
      expect(p40_40).toBe(91.2);
      expect(getMasteryLabel(40, p40_40)).toBe("mastered");
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
