import { estimateListeningScore } from "./toeicScoring";
import { parseExamExplanation, type ParsedExamExplanation } from "./explanationQuality";

export type ListeningPart = 1 | 2 | 3 | 4;

export interface ListeningDialogueLine {
  speaker: string;
  text: string;
}

export interface ListeningQuestionItem {
  id: string;
  questionNumber: number; // 1 -> 100
  part: ListeningPart;
  groupId?: string;
  scene?: string;
  imageUrl?: string;
  audioUrl?: string;
  stem: string;
  options: string[]; // Part 2 có 3 phương án (A-C); Part 1, 3, 4 có 4 phương án (A-D)
}

export interface ListeningGroupItem {
  id: string;
  part: 1 | 2 | 3 | 4;
  title: string;
  audioUrl?: string;
  scene?: string;
  imageUrl?: string;
  lines?: ListeningDialogueLine[];
  script?: string;
  talkType?: string;
  speaker?: string;
  questionIds: string[];
}

export interface RawListeningContent {
  part1?: {
    id: string;
    scene?: string;
    imageUrl?: string;
    audioUrl?: string;
    options: [string, string, string, string] | string[];
  }[];
  part2?: {
    id: string;
    stem: string;
    audioUrl?: string;
    options: [string, string, string] | string[];
  }[];
  part3?: {
    id: string;
    audioUrl?: string;
    lines: ListeningDialogueLine[];
    questions: {
      id: string;
      stem: string;
      options: string[];
    }[];
  }[];
  part4?: {
    id: string;
    type?: string;
    speaker?: string;
    audioUrl?: string;
    script: string;
    questions: {
      id: string;
      stem: string;
      options: string[];
    }[];
  }[];
}

export interface ExamListeningData {
  examSetId: string;
  slug: string;
  title: string;
  description: string;
  durationMinutes: number; // 45 phút
  totalQuestions: number; // 100 câu
  questions: ListeningQuestionItem[];
  groups: ListeningGroupItem[];
}

export interface ListeningAnswerKey {
  questionId: string;
  part: number;
  correctAnswer: "A" | "B" | "C" | "D";
  correctIndex: number;
  evidence?: string | null;
  explanation: string;
  explanationVi?: string | null;
  structuredExplanation?: ParsedExamExplanation | null;
}

export interface ListeningQuestionGradingResult {
  id: string;
  questionNumber: number;
  part: ListeningPart;
  stem: string;
  transcript?: string;
  options: string[];
  userSelectedIndex: number | null;
  correctIndex: number | null;
  correctAnswer: "A" | "B" | "C" | "D" | null;
  isCorrect: boolean;
  isAnswerHidden?: boolean;
  evidence?: string | null;
  explanation: string;
  explanationVi?: string | null;
  structuredExplanation?: ParsedExamExplanation | null;
}

export interface ListeningPartScoreBreakdown {
  correct: number;
  total: number;
  percentage: number;
}

export interface ExamListeningEvaluation {
  totalQuestions: number;
  rawScore: number; // 0-100
  scaledScore: number; // 5-495
  accuracyPercentage: number;
  timeSpentSeconds: number;
  parts: {
    part1: ListeningPartScoreBreakdown;
    part2: ListeningPartScoreBreakdown;
    part3: ListeningPartScoreBreakdown;
    part4: ListeningPartScoreBreakdown;
  };
  results: ListeningQuestionGradingResult[];
}

/**
 * Chuyển đổi cấu trúc `content.listening` (KHÔNG chứa đáp án) sang danh sách câu hỏi và nhóm nghe có đánh số 1-100.
 */
export function flattenListeningContent(raw?: RawListeningContent | null): {
  questions: ListeningQuestionItem[];
  groups: ListeningGroupItem[];
} {
  const questions: ListeningQuestionItem[] = [];
  const groups: ListeningGroupItem[] = [];
  if (!raw) return { questions, groups };

  let qNum = 1;

  if (Array.isArray(raw.part1)) {
    for (const q of raw.part1) {
      const groupId = `g_p1_${q.id}`;
      const options = Array.isArray(q.options) ? q.options.slice(0, 4) : [];
      questions.push({
        id: q.id,
        questionNumber: qNum++,
        part: 1,
        groupId,
        scene: q.scene,
        imageUrl: q.imageUrl,
        audioUrl: q.audioUrl,
        stem: q.scene || "Nghe mô tả bức tranh và chọn đáp án đúng nhất.",
        options,
      });
      groups.push({
        id: groupId,
        part: 1,
        title: `Part 1 · Mô tả tranh (${qNum - 1})`,
        audioUrl: q.audioUrl,
        scene: q.scene,
        imageUrl: q.imageUrl,
        questionIds: [q.id],
      });
    }
  }

  if (Array.isArray(raw.part2)) {
    for (const q of raw.part2) {
      const groupId = `g_p2_${q.id}`;
      const options = Array.isArray(q.options) ? q.options.slice(0, 3) : [];
      questions.push({
        id: q.id,
        questionNumber: qNum++,
        part: 2,
        groupId,
        audioUrl: q.audioUrl,
        stem: q.stem,
        options,
      });
      groups.push({
        id: groupId,
        part: 2,
        title: `Part 2 · Hỏi - Đáp (${qNum - 1})`,
        audioUrl: q.audioUrl,
        script: q.stem,
        questionIds: [q.id],
      });
    }
  }

  if (Array.isArray(raw.part3)) {
    for (const conv of raw.part3) {
      const qIds: string[] = [];
      const startNum = qNum;
      for (const q of conv.questions || []) {
        qIds.push(q.id);
        questions.push({
          id: q.id,
          questionNumber: qNum++,
          part: 3,
          groupId: conv.id,
          audioUrl: conv.audioUrl,
          stem: q.stem,
          options: Array.isArray(q.options) ? q.options.slice(0, 4) : [],
        });
      }
      const endNum = qNum - 1;
      groups.push({
        id: conv.id,
        part: 3,
        title:
          qIds.length > 0
            ? `Part 3 · Hội thoại (Câu ${startNum}–${endNum})`
            : "Part 3 · Hội thoại",
        audioUrl: conv.audioUrl,
        lines: conv.lines || [],
        questionIds: qIds,
      });
    }
  }

  if (Array.isArray(raw.part4)) {
    for (const talk of raw.part4) {
      const qIds: string[] = [];
      const startNum = qNum;
      for (const q of talk.questions || []) {
        qIds.push(q.id);
        questions.push({
          id: q.id,
          questionNumber: qNum++,
          part: 4,
          groupId: talk.id,
          audioUrl: talk.audioUrl,
          stem: q.stem,
          options: Array.isArray(q.options) ? q.options.slice(0, 4) : [],
        });
      }
      const endNum = qNum - 1;
      groups.push({
        id: talk.id,
        part: 4,
        title:
          qIds.length > 0
            ? `Part 4 · ${talk.type || "Bài nói ngắn"} (Câu ${startNum}–${endNum})`
            : `Part 4 · ${talk.type || "Bài nói ngắn"}`,
        audioUrl: talk.audioUrl,
        script: talk.script,
        talkType: talk.type,
        speaker: talk.speaker,
        questionIds: qIds,
      });
    }
  }

  return { questions, groups };
}

/**
 * Chấm điểm bài thi Listening Part 1–4 ở Server, áp dụng F2 anti-oracle cho câu chưa làm.
 */
export function evaluateListeningExam(params: {
  questions: ListeningQuestionItem[];
  groups?: ListeningGroupItem[];
  answerKeys: ListeningAnswerKey[];
  userAnswers: Record<string, number>;
  timeSpentSeconds: number;
}): ExamListeningEvaluation {
  const { questions, groups = [], answerKeys, userAnswers, timeSpentSeconds } = params;

  if (!answerKeys || answerKeys.length === 0) {
    throw new Error("Không có dữ liệu đáp án để chấm bài thi Listening.");
  }

  const keyMap = new Map<string, ListeningAnswerKey>();
  for (const k of answerKeys) {
    keyMap.set(k.questionId, k);
  }

  const groupById = new Map<string, ListeningGroupItem>();
  for (const g of groups) {
    groupById.set(g.id, g);
  }

  const partTotals: Record<ListeningPart, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const partCorrects: Record<ListeningPart, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const results: ListeningQuestionGradingResult[] = [];

  for (const q of questions) {
    const key = keyMap.get(q.id);
    if (!key) {
      throw new Error(
        `Thiếu đáp án chấm bài cho câu hỏi ${q.id} (#${q.questionNumber})`
      );
    }

    partTotals[q.part] += 1;

    const maxValidIndex = q.part === 2 ? 2 : 3;
    const rawIndex = userAnswers[q.id];
    const userIndex =
      typeof rawIndex === "number" &&
      Number.isInteger(rawIndex) &&
      rawIndex >= 0 &&
      rawIndex <= maxValidIndex
        ? rawIndex
        : null;

    const isCorrect = userIndex !== null && userIndex === key.correctIndex;
    if (isCorrect) {
      partCorrects[q.part] += 1;
    }

    const group = q.groupId ? groupById.get(q.groupId) : undefined;
    const transcript = group?.lines
      ? group.lines.map((l) => `${l.speaker}: ${l.text}`).join("\n")
      : group?.script || q.scene;

    if (userIndex === null) {
      results.push({
        id: q.id,
        questionNumber: q.questionNumber,
        part: q.part,
        stem: q.part === 1 ? `Câu ${q.questionNumber} (Part 1)` : q.stem,
        transcript,
        options: q.options,
        userSelectedIndex: null,
        correctIndex: null,
        correctAnswer: null,
        isCorrect: false,
        isAnswerHidden: true,
        evidence: null,
        explanation: "",
        explanationVi: null,
        structuredExplanation: null,
      });
    } else {
      results.push({
        id: q.id,
        questionNumber: q.questionNumber,
        part: q.part,
        stem: q.part === 1 ? `Câu ${q.questionNumber} (Part 1)` : q.stem,
        transcript,
        options: q.options,
        userSelectedIndex: userIndex,
        correctIndex: key.correctIndex,
        correctAnswer: key.correctAnswer,
        isCorrect,
        isAnswerHidden: false,
        evidence: key.evidence || null,
        explanation: key.explanation || "",
        explanationVi: key.explanationVi || null,
        structuredExplanation: parseExamExplanation(key.explanation, key.explanationVi),
      });
    }
  }

  const rawScore =
    partCorrects[1] + partCorrects[2] + partCorrects[3] + partCorrects[4];
  const totalQuestions = questions.length;
  const safeTotal = Math.max(1, totalQuestions);
  const scaledScore = estimateListeningScore(rawScore);

  const buildBreakdown = (part: ListeningPart): ListeningPartScoreBreakdown => {
    const total = partTotals[part];
    const correct = partCorrects[part];
    return {
      correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  };

  return {
    totalQuestions,
    rawScore,
    scaledScore,
    accuracyPercentage: Math.round((rawScore / safeTotal) * 100),
    timeSpentSeconds,
    parts: {
      part1: buildBreakdown(1),
      part2: buildBreakdown(2),
      part3: buildBreakdown(3),
      part4: buildBreakdown(4),
    },
    results,
  };
}

/**
 * Đánh giá năng lực theo điểm thi Listening TOEIC (5–495, dùng đúng bộ token dự án)
 */
export function getListeningProficiencyLevel(scaledScore: number): {
  levelVi: string;
  colorHex: string;
  badgeBg: string;
  descriptionVi: string;
} {
  if (scaledScore >= 450) {
    return {
      levelVi: "Xuất sắc (450+ Listening)",
      colorHex: "#047857",
      badgeBg: "#ECFDF5",
      descriptionVi:
        "Phản xạ nghe nhạy bén, bắt trọn thông tin chi tiết và hàm ý (implied meaning) trong Part 2–4.",
    };
  }
  if (scaledScore >= 380) {
    return {
      levelVi: "Giỏi (380 – 445 Listening)",
      colorHex: "#2563EB",
      badgeBg: "#EFF6FF",
      descriptionVi:
        "Nắm vững đa số hội thoại và bài nói thương mại; có thể tối ưu thêm tốc độ đọc trước câu hỏi Part 3/4.",
    };
  }
  if (scaledScore >= 280) {
    return {
      levelVi: "Trung bình khá (280 – 375 Listening)",
      colorHex: "#B45309",
      badgeBg: "#FFFBEB",
      descriptionVi:
        "Nghe tốt ý chính và câu hỏi Wh-, cần luyện thêm câu trả lời gián tiếp Part 2 và từ đồng nghĩa (paraphrase).",
    };
  }
  return {
    levelVi: "Cần cải thiện (< 280 Listening)",
    colorHex: "#BE123C",
    badgeBg: "#FFF1F2",
    descriptionVi:
      "Nên củng cố từ vựng phát âm cốt lõi và rèn nghe chép chính tả Part 1–2 trước khi tăng nhịp.",
  };
}
