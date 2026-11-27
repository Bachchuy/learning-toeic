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

  it("Chống Oracle (F2 Option A): chỉ nộp 1 câu thì 99 câu chưa chọn bị ẩn đáp án và giải thích", () => {
    const firstQ = dummyQuestions[0];
    const evaluation = evaluateReadingExam({
      questions: dummyQuestions,
      answerKeys: dummyKeys,
      userAnswers: { [firstQ.id]: 1 },
      timeSpentSeconds: 120,
    });

    expect(evaluation.rawScore).toBe(1);
    const firstResult = evaluation.results[0];
    expect(firstResult.isAnswerHidden).toBe(false);
    expect(firstResult.correctIndex).toBe(1);
    expect(firstResult.correctAnswer).toBe("B");
    expect(firstResult.explanation).toBe(`Explanation for #${firstQ.questionNumber}`);
    expect(firstResult.structuredExplanation?.isStructured).toBe(false);

    const hiddenResults = evaluation.results.slice(1);
    expect(hiddenResults).toHaveLength(99);
    for (const item of hiddenResults) {
      expect(item.userSelectedIndex).toBeNull();
      expect(item.isAnswerHidden).toBe(true);
      expect(item.correctIndex).toBeNull();
      expect(item.correctAnswer).toBeNull();
      expect(item.evidence).toBeNull();
      expect(item.explanation).toBe("");
      expect(item.explanationVi).toBeNull();
      expect(item.structuredExplanation).toBeNull();
      expect(item.isCorrect).toBe(false);
    }
  });

  it("Bỏ qua giá trị index không hợp lệ (-1, 4, NaN) và coi như chưa trả lời", () => {
    const evaluation = evaluateReadingExam({
      questions: dummyQuestions,
      answerKeys: dummyKeys,
      userAnswers: {
        [dummyQuestions[0].id]: -1,
        [dummyQuestions[1].id]: 4,
        [dummyQuestions[2].id]: Number.NaN,
      },
      timeSpentSeconds: 60,
    });

    expect(evaluation.rawScore).toBe(0);
    for (const idx of [0, 1, 2]) {
      expect(evaluation.results[idx].userSelectedIndex).toBeNull();
      expect(evaluation.results[idx].isAnswerHidden).toBe(true);
      expect(evaluation.results[idx].correctIndex).toBeNull();
    }
  });

  it("phân tích JSON lời giải chi tiết cho câu đã trả lời và vẫn ẩn với câu chưa làm", () => {
    const jsonExplanation = JSON.stringify({
      part: 7,
      question_type_vi: "Câu hỏi chi tiết (Detail & Paraphrase)",
      strategy_vi: "Quét từ khóa và đối chiếu paraphrase.",
      evidence: "We bake everything on-site every morning.",
      why_correct_vi: "Cụm on-site every morning tương ứng với made daily on the premises.",
      tip_vi: "Tìm từ đồng nghĩa trạng từ tần suất.",
      translation_vi: "Chúng tôi nướng mọi thứ tại chỗ mỗi sáng.",
      options_analysis: {
        A: "Sai vì địa chỉ vẫn ở Westfield.",
        B: "Đúng vì khớp paraphrase.",
        C: "Sai vì đóng cửa thứ Hai.",
        D: "Sai vì chỉ cần 48 giờ.",
      },
    });
    const customKeys = dummyKeys.map((k, idx) =>
      idx === 99 ? { ...k, explanation: jsonExplanation } : k
    );
    const evaluation = evaluateReadingExam({
      questions: dummyQuestions,
      answerKeys: customKeys,
      userAnswers: { [dummyQuestions[99].id]: 1 },
      timeSpentSeconds: 120,
    });

    expect(evaluation.results[99].structuredExplanation?.isStructured).toBe(true);
    expect(evaluation.results[99].structuredExplanation?.optionsAnalysis?.B).toContain(
      "paraphrase"
    );
    expect(evaluation.results[0].structuredExplanation).toBeNull();
  });
});
