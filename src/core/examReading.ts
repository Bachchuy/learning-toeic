import { calculateReadingScore } from "./toeicScoring";

export interface ReadingQuestionItem {
  id: string;
  questionNumber: number; // 101 -> 200
  part: 5 | 6 | 7;
  passageId?: string;
  passageTitle?: string;
  passageDocType?: string;
  passageContent?: string;
  stem: string;
  options: [string, string, string, string];
  grammarTag?: string;
  difficulty?: number;
}

export interface ExamReadingQuestions {
  examSetId: string;
  slug: string;
  title: string;
  targetScore: number;
  durationMinutes: number; // 75 phút
  totalQuestions: number; // 100 câu
  questions: ReadingQuestionItem[];
}

export interface ReadingAnswerKey {
  questionId: string;
  part: number;
  correctAnswer: "A" | "B" | "C" | "D";
  correctIndex: number;
  evidence?: string | null;
  explanation: string;
  explanationVi?: string | null;
}

export interface QuestionGradingResult {
  id: string;
  questionNumber: number;
  part: 5 | 6 | 7;
  stem: string;
  options: [string, string, string, string];
  userSelectedIndex: number | null; // null nếu chưa trả lời
  correctIndex: number;
  correctAnswer: "A" | "B" | "C" | "D";
  isCorrect: boolean;
  evidence?: string | null;
  explanation: string;
  explanationVi?: string | null;
}

export interface PartScoreBreakdown {
  correct: number;
  total: number;
  percentage: number;
}

export interface ExamReadingEvaluation {
  totalQuestions: number;
  rawScore: number; // 0-100
  scaledScore: number; // 5-495 (theo chuẩn ETS)
  accuracyPercentage: number;
  timeSpentSeconds: number;
  parts: {
    part5: PartScoreBreakdown;
    part6: PartScoreBreakdown;
    part7: PartScoreBreakdown;
  };
  results: QuestionGradingResult[];
}

/**
 * Đánh giá kết quả làm bài thi TOEIC Reading 100 câu
 * Tuân thủ chuẩn ETS:
 * - Part 5: 30 câu
 * - Part 6: 16 câu
 * - Part 7: 54 câu
 * - Thang điểm scaled: 5 - 495
 */
export function evaluateReadingExam(params: {
  questions: ReadingQuestionItem[];
  answerKeys: ReadingAnswerKey[];
  userAnswers: Record<string, number>;
  timeSpentSeconds: number;
}): ExamReadingEvaluation {
  const { questions, answerKeys, userAnswers, timeSpentSeconds } = params;

  const keyMap = new Map<string, ReadingAnswerKey>();
  for (const k of answerKeys) {
    keyMap.set(k.questionId, k);
  }

  let part5Correct = 0;
  let part6Correct = 0;
  let part7Correct = 0;

  const results: QuestionGradingResult[] = [];

  for (const q of questions) {
    const key = keyMap.get(q.id);
    const correctIndex = key ? key.correctIndex : 0;
    const correctAnswer = key ? key.correctAnswer : "A";
    const userIndex = userAnswers[q.id] !== undefined ? userAnswers[q.id] : null;

    const isCorrect = userIndex !== null && userIndex === correctIndex;

    if (isCorrect) {
      if (q.part === 5) part5Correct++;
      else if (q.part === 6) part6Correct++;
      else if (q.part === 7) part7Correct++;
    }

    results.push({
      id: q.id,
      questionNumber: q.questionNumber,
      part: q.part,
      stem: q.stem,
      options: q.options,
      userSelectedIndex: userIndex,
      correctIndex,
      correctAnswer,
      isCorrect,
      evidence: key?.evidence || null,
      explanation: key?.explanation || "",
      explanationVi: key?.explanationVi || null,
    });
  }

  const rawScore = part5Correct + part6Correct + part7Correct;
  const scaledScore = calculateReadingScore(rawScore);
  const totalQuestions = questions.length || 100;

  return {
    totalQuestions,
    rawScore,
    scaledScore,
    accuracyPercentage: Math.round((rawScore / totalQuestions) * 100),
    timeSpentSeconds,
    parts: {
      part5: {
        correct: part5Correct,
        total: 30,
        percentage: Math.round((part5Correct / 30) * 100),
      },
      part6: {
        correct: part6Correct,
        total: 16,
        percentage: Math.round((part6Correct / 16) * 100),
      },
      part7: {
        correct: part7Correct,
        total: 54,
        percentage: Math.round((part7Correct / 54) * 100),
      },
    },
    results,
  };
}

/**
 * Đánh giá năng lực theo điểm thi Reading TOEIC
 */
export function getReadingProficiencyLevel(scaledScore: number): {
  levelVi: string;
  colorHex: string;
  badgeBg: string;
  descriptionVi: string;
} {
  if (scaledScore >= 450) {
    return {
      levelVi: "Xuất sắc (900+ Master)",
      colorHex: "#047857",
      badgeBg: "#ECFDF5",
      descriptionVi: "Khả năng đọc hiểu chuyên nghiệp, tốc độ xử lý thông tin xuất sắc và làm chủ hoàn toàn các bẫy ngữ pháp ETS.",
    };
  }
  if (scaledScore >= 380) {
    return {
      levelVi: "Giỏi (750 - 890 Advanced)",
      colorHex: "#2563EB",
      badgeBg: "#EFF6FF",
      descriptionVi: "Đọc hiểu tốt hầu hết văn bản doanh nghiệp, chỉ cần cải thiện tốc độ ở các bài đọc ba (Triple Passages).",
    };
  }
  if (scaledScore >= 280) {
    return {
      levelVi: "Trung bình khá (600 - 740 Intermediate)",
      colorHex: "#B45309",
      badgeBg: "#FFFBEB",
      descriptionVi: "Nắm vững ngữ pháp cơ bản, nhưng cần củng cố vốn từ vựng thương mại và kỹ năng quét tìm ý chính (Skimming/Scanning).",
    };
  }
  return {
    levelVi: "Cần cải thiện (< 600 Basic)",
    colorHex: "#BE123C",
    badgeBg: "#FFF1F2",
    descriptionVi: "Cần bổ sung kiến thức ngữ pháp trọng điểm Part 5 và rèn luyện đọc hiểu đoạn ngắn trước khi tăng tốc độ.",
  };
}
