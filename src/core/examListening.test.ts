import { describe, it, expect } from "vitest";
import {
  evaluateListeningExam,
  flattenListeningContent,
  getListeningProficiencyLevel,
  type ListeningAnswerKey,
  type RawListeningContent,
} from "./examListening";

const SAMPLE_RAW: RawListeningContent = {
  part1: [
    {
      id: "t1_p1_01",
      scene: "A man is stocking shelves.",
      options: ["Opt A", "Opt B", "Opt C", "Opt D"],
    },
  ],
  part2: [
    {
      id: "t1_p2_07",
      stem: "Where is the meeting?",
      options: ["Room 202.", "At 3 PM.", "Yes, I did."],
    },
  ],
  part3: [
    {
      id: "t1_p3_c1",
      lines: [
        { speaker: "M", text: "Can we reschedule?" },
        { speaker: "W", text: "Sure, Tuesday works." },
      ],
      questions: [
        {
          id: "t1_p3_32",
          stem: "What are they discussing?",
          options: ["Budget", "Schedule", "Office move", "Hiring"],
        },
      ],
    },
  ],
  part4: [
    {
      id: "t1_p4_t1",
      type: "Announcement",
      speaker: "W",
      script: "Flight 202 is now boarding at Gate 5.",
      questions: [
        {
          id: "t1_p4_71",
          stem: "Where is the speaker?",
          options: ["Train station", "Airport", "Hotel", "Hospital"],
        },
      ],
    },
  ],
};

const SAMPLE_KEYS: ListeningAnswerKey[] = [
  {
    questionId: "t1_p1_01",
    part: 1,
    correctAnswer: "B",
    correctIndex: 1,
    evidence: "Man stocking boxes on shelves.",
    explanation: "Matches verb 'stocking shelves'.",
    explanationVi: "Mô tả đúng hành động xếp hàng lên kệ.",
  },
  {
    questionId: "t1_p2_07",
    part: 2,
    correctAnswer: "A",
    correctIndex: 0,
    evidence: "Where -> Room 202.",
    explanation: "Direct location answer.",
    explanationVi: "Trả lời trực tiếp địa điểm cho câu hỏi Where.",
  },
  {
    questionId: "t1_p3_32",
    part: 3,
    correctAnswer: "B",
    correctIndex: 1,
    evidence: "Can we reschedule?",
    explanation: "Reschedule refers to Schedule.",
    explanationVi: "Nhắc tới đổi lịch.",
  },
  {
    questionId: "t1_p4_71",
    part: 4,
    correctAnswer: "B",
    correctIndex: 1,
    evidence: "Flight 202 is now boarding",
    explanation: "Flight and gate indicate airport.",
    explanationVi: "Chuyến bay và cổng lên máy bay chỉ sân bay.",
  },
];

describe("examListening core logic", () => {
  it("flattenListeningContent trải phẳng đủ Part 1–4 và giữ giới hạn 3 phương án cho Part 2", () => {
    const { questions, groups } = flattenListeningContent(SAMPLE_RAW);
    expect(questions).toHaveLength(4);
    expect(questions.map((q) => q.questionNumber)).toEqual([1, 2, 3, 4]);
    expect(questions[1].part).toBe(2);
    expect(questions[1].options).toHaveLength(3);
    expect(groups).toHaveLength(4);
    expect(groups[2].lines).toHaveLength(2);
    expect(groups[3].script).toContain("Flight 202");
  });

  it("áp dụng F2 anti-oracle: câu chưa chọn ẩn đáp án, bằng chứng và giải thích", () => {
    const { questions, groups } = flattenListeningContent(SAMPLE_RAW);
    const evaluation = evaluateListeningExam({
      questions,
      groups,
      answerKeys: SAMPLE_KEYS,
      userAnswers: {
        t1_p1_01: 1, // đúng
        t1_p2_07: 3, // ngoài phạm vi Part 2 (0..2) -> xem như chưa trả lời hợp lệ
      },
      timeSpentSeconds: 600,
    });

    expect(evaluation.rawScore).toBe(1);
    expect(evaluation.parts.part1).toEqual({
      correct: 1,
      total: 1,
      percentage: 100,
    });
    expect(evaluation.parts.part2.correct).toBe(0);

    const answered = evaluation.results[0];
    expect(answered.isCorrect).toBe(true);
    expect(answered.isAnswerHidden).toBe(false);
    expect(answered.correctIndex).toBe(1);
    expect(answered.explanationVi).toBeTruthy();

    const invalidOrUnanswered = evaluation.results[1];
    expect(invalidOrUnanswered.userSelectedIndex).toBeNull();
    expect(invalidOrUnanswered.isAnswerHidden).toBe(true);
    expect(invalidOrUnanswered.correctIndex).toBeNull();
    expect(invalidOrUnanswered.correctAnswer).toBeNull();
    expect(invalidOrUnanswered.evidence).toBeNull();
    expect(invalidOrUnanswered.explanation).toBe("");

    const unansweredP4 = evaluation.results[3];
    expect(unansweredP4.isAnswerHidden).toBe(true);
    expect(unansweredP4.correctIndex).toBeNull();
  });

  it("ném lỗi nếu thiếu answerKeys hoặc thiếu key cho câu hỏi", () => {
    const { questions } = flattenListeningContent(SAMPLE_RAW);
    expect(() =>
      evaluateListeningExam({
        questions,
        answerKeys: [],
        userAnswers: { t1_p1_01: 0 },
        timeSpentSeconds: 10,
      })
    ).toThrow(/Listening/i);

    expect(() =>
      evaluateListeningExam({
        questions,
        answerKeys: SAMPLE_KEYS.slice(0, 2),
        userAnswers: { t1_p1_01: 0 },
        timeSpentSeconds: 10,
      })
    ).toThrow(/Thiếu đáp án/i);
  });

  it("trả về ngưỡng đánh giá sử dụng đúng bộ màu Precision Swiss", () => {
    expect(getListeningProficiencyLevel(460).colorHex).toBe("#047857");
    expect(getListeningProficiencyLevel(400).colorHex).toBe("#2563EB");
    expect(getListeningProficiencyLevel(300).colorHex).toBe("#B45309");
    expect(getListeningProficiencyLevel(150).colorHex).toBe("#BE123C");
  });
});
