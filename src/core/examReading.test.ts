import { describe, it, expect } from "vitest";
import {
  evaluateReadingExam,
  getReadingProficiencyLevel,
  type ReadingQuestionItem,
  type ReadingAnswerKey,
} from "./examReading";

describe("Exam Reading Logic & Standard ETS Scoring", () => {
  const dummyQuestions: ReadingQuestionItem[] = [];
  const dummyKeys: ReadingAnswerKey[] = [];

  // Tạo mock 30 câu Part 5, 16 câu Part 6, 54 câu Part 7
  for (let i = 1; i <= 100; i++) {
    const qNum = 100 + i;
    const part = i <= 30 ? 5 : i <= 46 ? 6 : 7;
    const qId = `mock_q_${qNum}`;

    dummyQuestions.push({
      id: qId,
      questionNumber: qNum,
      part,
      stem: `Question stem #${qNum}`,
      options: ["Option A", "Option B", "Option C", "Option D"],
    });

    dummyKeys.push({
      questionId: qId,
      part,
      correctAnswer: "B",
      correctIndex: 1, // Đáp án B
      explanation: `Explanation for #${qNum}`,
      evidence: `Evidence #${qNum}`,
    });
  }

  it("Đạt điểm tối đa 495 khi trả lời đúng toàn bộ 100 câu", () => {
    const userAnswers: Record<string, number> = {};
    for (const q of dummyQuestions) {
      userAnswers[q.id] = 1; // Chọn B (đúng)
    }

    const evaluation = evaluateReadingExam({
      questions: dummyQuestions,
      answerKeys: dummyKeys,
      userAnswers,
      timeSpentSeconds: 3600,
    });

    expect(evaluation.rawScore).toBe(100);
    expect(evaluation.scaledScore).toBe(495);
    expect(evaluation.accuracyPercentage).toBe(100);
    expect(evaluation.parts.part5.correct).toBe(30);
    expect(evaluation.parts.part6.correct).toBe(16);
    expect(evaluation.parts.part7.correct).toBe(54);
  });

  it("Đạt điểm sàn 5 khi không trả lời câu nào hoặc sai hết", () => {
    const evaluation = evaluateReadingExam({
      questions: dummyQuestions,
      answerKeys: dummyKeys,
      userAnswers: {},
      timeSpentSeconds: 4500,
    });

    expect(evaluation.rawScore).toBe(0);
    expect(evaluation.scaledScore).toBe(5);
    expect(evaluation.accuracyPercentage).toBe(0);
    expect(evaluation.parts.part5.correct).toBe(0);
  });

  it("Tính đúng điểm và tỉ lệ khi trả lời đúng một phần", () => {
    const userAnswers: Record<string, number> = {};
    // Đúng 15 câu Part 5, 8 câu Part 6, 27 câu Part 7 = 50 câu đúng
    for (let i = 0; i < 15; i++) userAnswers[dummyQuestions[i].id] = 1;
    for (let i = 30; i < 38; i++) userAnswers[dummyQuestions[i].id] = 1;
    for (let i = 46; i < 73; i++) userAnswers[dummyQuestions[i].id] = 1;

    const evaluation = evaluateReadingExam({
      questions: dummyQuestions,
      answerKeys: dummyKeys,
      userAnswers,
      timeSpentSeconds: 2700,
    });

    expect(evaluation.rawScore).toBe(50);
    // Raw 50 câu -> chuẩn ETS ~ 225-250 điểm
    expect(evaluation.scaledScore).toBeGreaterThanOrEqual(220);
    expect(evaluation.parts.part5.correct).toBe(15);
    expect(evaluation.parts.part5.total).toBe(30);
    expect(evaluation.parts.part6.correct).toBe(8);
    expect(evaluation.parts.part7.correct).toBe(27);
  });

  it("Phân loại trình độ chính xác theo điểm số chuẩn ETS", () => {
    expect(getReadingProficiencyLevel(480).levelVi).toContain("Xuất sắc");
    expect(getReadingProficiencyLevel(400).levelVi).toContain("Giỏi");
    expect(getReadingProficiencyLevel(310).levelVi).toContain("Trung bình khá");
    expect(getReadingProficiencyLevel(180).levelVi).toContain("Cần cải thiện");
  });

  it("Báo lỗi rõ ràng khi answerKeys bị thiếu hoặc rỗng, không tự mặc định đáp án A", () => {
    expect(() =>
      evaluateReadingExam({
        questions: dummyQuestions,
        answerKeys: [],
        userAnswers: {},
        timeSpentSeconds: 3600,
      })
    ).toThrow("Không có dữ liệu đáp án để chấm bài thi.");

    expect(() =>
      evaluateReadingExam({
        questions: dummyQuestions,
        answerKeys: dummyKeys.slice(0, 50),
        userAnswers: {},
        timeSpentSeconds: 3600,
      })
    ).toThrow("Thiếu đáp án chấm bài cho câu hỏi");
  });
});
