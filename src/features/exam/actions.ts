"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOptionalUser } from "@/shared/auth";
import {
  evaluateReadingExam,
  type ReadingQuestionItem,
  type ReadingAnswerKey,
  type ExamReadingEvaluation,
} from "@/core/examReading";
import {
  evaluateListeningExam,
  flattenListeningContent,
  type RawListeningContent,
  type ListeningAnswerKey,
  type ExamListeningEvaluation,
} from "@/core/examListening";
import type {
  ExamMetaSummary,
  ExamAttemptHistoryItem,
  ReadingExamData,
  ExamListeningData,
  SubmitExamPayload,
  SubmitExamResult,
  SubmitListeningExamResult,
} from "./types";

interface RawExamRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  exam_type: string;
  target_score: number;
  duration_minutes: number;
  total_questions: number;
  parts_summary: Record<string, number>;
  content: {
    listening?: RawListeningContent;
    reading?: {
      part5?: {
        id: string;
        stem: string;
        options: [string, string, string, string];
        grammarTag?: string;
        difficulty?: number;
      }[];
      part6?: {
        id: string;
        title?: string;
        docType?: string;
        passage: string;
        questions: {
          id: string;
          stem: string;
          options: [string, string, string, string];
        }[];
      }[];
      part7?: {
        id: string;
        title?: string;
        docType?: string;
        passage: string;
        questions: {
          id: string;
          stem: string;
          options: [string, string, string, string];
        }[];
      }[];
    };
  };
}

/**
 * Server Action: Lấy danh sách đề thi thử TOEIC đã xuất bản từ DB
 * BẤT BIẾN (MD-06): Không fallback sang MOCK_TESTS local thiếu đáp án chấm bài.
 */
export async function getExamListAction(): Promise<ExamMetaSummary[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("exam_sets")
      .select("id, slug, title, description, exam_type, target_score, duration_minutes, total_questions, parts_summary")
      .eq("status", "published")
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((d) => ({
      id: d.id,
      slug: d.slug,
      title: d.title,
      description: d.description,
      exam_type: d.exam_type,
      target_score: d.target_score,
      duration_minutes: 75, // Chuẩn Reading 75 phút
      total_questions: 100, // Chuẩn Reading 100 câu
      parts_summary: {
        part5: (d.parts_summary as Record<string, number>)?.part5 || 30,
        part6: (d.parts_summary as Record<string, number>)?.part6 || 16,
        part7: (d.parts_summary as Record<string, number>)?.part7 || 54,
        totalReading: (d.parts_summary as Record<string, number>)?.totalReading || 100,
      },
    }));
  } catch (err) {
    console.error("[getExamListAction] Supabase error:", err);
    return [];
  }
}

/**
 * Server Action: Lấy lịch sử các bài thi thử Reading đã hoàn thành của người dùng hiện tại
 */
export async function getExamHistoryAction(): Promise<ExamAttemptHistoryItem[]> {
  try {
    const { user, supabase } = await getOptionalUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("exam_attempts")
      .select(
        "id, exam_set_id, submitted_at, created_at, time_spent_seconds, correct_count_reading, score_reading, correct_count_listening, score_listening, total_score, detailed_results, exam_sets ( title, slug )"
      )
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("submitted_at", { ascending: false })
      .limit(20);

    if (error || !data) {
      return [];
    }

    interface RawAttemptRow {
      id: string;
      exam_set_id: string;
      submitted_at: string | null;
      created_at: string;
      time_spent_seconds: number;
      correct_count_reading: number;
      score_reading: number;
      correct_count_listening: number;
      score_listening: number;
      total_score: number;
      detailed_results: {
        mode?: unknown;
        accuracyPercentage?: unknown;
      } | null;
      exam_sets: { title?: string; slug?: string } | Array<{ title?: string; slug?: string }> | null;
    }

    return (data as unknown as RawAttemptRow[]).map((row) => {
      const linkedSet = Array.isArray(row.exam_sets)
        ? row.exam_sets[0]
        : row.exam_sets;
      const rawAcc = row.detailed_results?.accuracyPercentage;
      const scoreReading = Number(row.score_reading) || 0;
      const scoreListening = Number(row.score_listening) || 0;
      const rawMode = row.detailed_results?.mode;
      const examMode: "reading" | "listening" | "full" =
        rawMode === "listening" || (scoreListening > 0 && scoreReading === 0)
          ? "listening"
          : scoreListening > 0 && scoreReading > 0
            ? "full"
            : "reading";

      return {
        id: row.id,
        examSetId: row.exam_set_id,
        examSlug: linkedSet?.slug || null,
        examTitle: linkedSet?.title || "Đề thi thử TOEIC",
        submittedAt: row.submitted_at || row.created_at,
        timeSpentSeconds: Number(row.time_spent_seconds) || 0,
        correctCountReading: Number(row.correct_count_reading) || 0,
        scoreReading: scoreReading || 5,
        correctCountListening: Number(row.correct_count_listening) || 0,
        scoreListening: scoreListening || 5,
        totalScore: Number(row.total_score) || 5,
        examMode,
        accuracyPercentage: typeof rawAcc === "number" ? rawAcc : null,
      };
    });
  } catch (err) {
    console.error("[getExamHistoryAction] Error:", err);
    return [];
  }
}

/**
 * Server Action: Lấy 100 câu hỏi Reading Part 5 + 6 + 7 của 1 đề thi
 * BẤT BIẾN BẢO MẬT: Tuyệt đối KHÔNG trả về đáp án đúng hay giải thích!
 */
export async function getReadingExamAction(
  slug: string
): Promise<ReadingExamData | null> {
  let examData: RawExamRow | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("exam_sets")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (!error && data) {
      examData = data as unknown as RawExamRow;
    }
  } catch (err) {
    console.error("[getReadingExamAction] Supabase error:", err);
  }

  if (!examData || !examData.content?.reading) {
    return null;
  }

  const reading = examData.content.reading;
  const questions: ReadingQuestionItem[] = [];
  let questionNumber = 101;

  // 1. Part 5: 30 câu (101 -> 130)
  if (reading.part5) {
    for (const q of reading.part5) {
      questions.push({
        id: q.id,
        questionNumber: questionNumber++,
        part: 5,
        stem: q.stem,
        options: q.options,
        grammarTag: q.grammarTag,
        difficulty: q.difficulty,
      });
    }
  }

  // 2. Part 6: 16 câu (131 -> 146) - 4 đoạn văn
  if (reading.part6) {
    for (const p of reading.part6) {
      for (const q of p.questions) {
        questions.push({
          id: q.id,
          questionNumber: questionNumber++,
          part: 6,
          passageId: p.id,
          passageTitle: p.title || "Text Completion",
          passageDocType: p.docType || "Văn bản",
          passageContent: p.passage,
          stem: q.stem,
          options: q.options,
        });
      }
    }
  }

  // 3. Part 7: 54 câu (147 -> 200) - 15 đoạn văn
  if (reading.part7) {
    for (const p of reading.part7) {
      for (const q of p.questions) {
        questions.push({
          id: q.id,
          questionNumber: questionNumber++,
          part: 7,
          passageId: p.id,
          passageTitle: p.title || "Reading Passage",
          passageDocType: p.docType || "Đoạn văn",
          passageContent: p.passage,
          stem: q.stem,
          options: q.options,
        });
      }
    }
  }

  return {
    examSetId: examData.id,
    slug: examData.slug,
    title: examData.title,
    description: examData.description,
    durationMinutes: 75,
    totalQuestions: questions.length,
    questions,
  };
}

/**
 * Server Action: Nộp bài thi và chấm điểm chuẩn ETS 5-495 trên Server
 * BẤT BIẾN BẢO MẬT: Truy vấn đáp án an toàn qua service role chỉ ở Server,
 * kiểm tra status = 'published' trước khi đọc answer keys, và bắt buộc lưu lịch sử exam_attempts thành công.
 */
export async function submitReadingExamAction(
  payload: SubmitExamPayload
): Promise<SubmitExamResult> {
  const { user } = await getOptionalUser();
  if (!user) {
    return { success: false, error: "Vui lòng đăng nhập để nộp bài thi." };
  }

  const { examSetId, userAnswers, timeSpentSeconds } = payload;

  const sanitizedAnswers: Record<string, number> = {};
  if (userAnswers && typeof userAnswers === "object") {
    for (const [qId, val] of Object.entries(userAnswers)) {
      if (typeof val === "number" && Number.isInteger(val) && val >= 0 && val <= 3) {
        sanitizedAnswers[qId] = val;
      }
    }
  }

  if (Object.keys(sanitizedAnswers).length === 0) {
    return { success: false, error: "Bạn chưa chọn câu trả lời nào cho bài thi." };
  }

  try {
    const adminSupabase = createAdminClient();

    // 1. Lấy thông tin đề thi đã xuất bản (status = 'published') trước khi đọc answer keys
    const { data: examSet, error: setErr } = await adminSupabase
      .from("exam_sets")
      .select("id, slug, title, content")
      .eq("id", examSetId)
      .eq("status", "published")
      .maybeSingle();

    if (setErr || !examSet) {
      return {
        success: false,
        error: "Không tìm thấy bộ đề thi tương ứng hoặc đề thi chưa được xuất bản.",
      };
    }

    const rawExam = examSet as unknown as RawExamRow;
    const reading = rawExam.content?.reading;
    if (!reading) {
      return { success: false, error: "Nội dung phần Reading của đề thi không hợp lệ." };
    }

    // Tái cấu trúc danh sách 100 câu
    const questions: ReadingQuestionItem[] = [];
    let qNum = 101;
    if (reading.part5) {
      for (const q of reading.part5) {
        questions.push({
          id: q.id,
          questionNumber: qNum++,
          part: 5,
          stem: q.stem,
          options: q.options,
        });
      }
    }
    if (reading.part6) {
      for (const p of reading.part6) {
        for (const q of p.questions) {
          questions.push({
            id: q.id,
            questionNumber: qNum++,
            part: 6,
            stem: q.stem,
            options: q.options,
          });
        }
      }
    }
    if (reading.part7) {
      for (const p of reading.part7) {
        for (const q of p.questions) {
          questions.push({
            id: q.id,
            questionNumber: qNum++,
            part: 7,
            stem: q.stem,
            options: q.options,
          });
        }
      }
    }

    // 2. Lấy đáp án đúng được bảo mật từ exam_set_answers
    const { data: answersData, error: ansErr } = await adminSupabase
      .from("exam_set_answers")
      .select("question_id, part, correct_answer, correct_index, evidence, explanation, explanation_vi")
      .eq("exam_set_id", examSetId)
      .in("part", [5, 6, 7]);

    if (ansErr || !answersData || answersData.length === 0) {
      return { success: false, error: "Không thể lấy đáp án chấm bài từ cơ sở dữ liệu." };
    }

    const answerKeys: ReadingAnswerKey[] = answersData.map((a) => ({
      questionId: a.question_id,
      part: a.part,
      correctAnswer: a.correct_answer as "A" | "B" | "C" | "D",
      correctIndex: a.correct_index,
      evidence: a.evidence,
      explanation: a.explanation,
      explanationVi: a.explanation_vi,
    }));

    // 3. Chấm điểm và phân tích theo chuẩn ETS
    const evaluation: ExamReadingEvaluation = evaluateReadingExam({
      questions,
      answerKeys,
      userAnswers: sanitizedAnswers,
      timeSpentSeconds,
    });

    // 4. Lưu kết quả vào exam_attempts cho user đã xác thực (bắt buộc thành công trước khi trả kết quả)
    const { data: attemptRow, error: attemptErr } = await adminSupabase
      .from("exam_attempts")
      .insert({
        user_id: user.id,
        exam_set_id: examSetId,
        status: "completed",
        submitted_at: new Date().toISOString(),
        time_spent_seconds: timeSpentSeconds,
        user_answers: sanitizedAnswers,
        correct_count_reading: evaluation.rawScore,
        score_reading: evaluation.scaledScore,
        total_score: evaluation.scaledScore,
        detailed_results: {
          parts: evaluation.parts,
          accuracyPercentage: evaluation.accuracyPercentage,
        },
      })
      .select("id")
      .maybeSingle();

    if (attemptErr || !attemptRow?.id) {
      return {
        success: false,
        error:
          "Không thể lưu kết quả bài thi vào lịch sử. Đáp án của bạn vẫn được giữ nguyên, vui lòng bấm Nộp bài để thử lại.",
      };
    }

    return {
      success: true,
      attemptId: attemptRow.id,
      evaluation,
    };
  } catch (err: unknown) {
    console.error("[submitReadingExamAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi chấm bài thi.",
    };
  }
}


/**
 * Server Action: Lấy 100 câu hỏi Listening Part 1–4 của 1 đề thi
 * BẤT BIẾN BẢO MẬT (MD-06): Chỉ đọc từ Supabase `exam_sets` (không fallback dữ liệu local thiếu đáp án).
 */
export async function getListeningExamAction(
  slug: string
): Promise<ExamListeningData | null> {
  let examData: RawExamRow | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("exam_sets")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (!error && data) {
      examData = data as unknown as RawExamRow;
    }
  } catch (err) {
    console.error("[getListeningExamAction] Supabase error:", err);
  }

  if (!examData?.content?.listening) {
    return null;
  }

  const { questions, groups } = flattenListeningContent(examData.content.listening);
  if (questions.length === 0) {
    return null;
  }

  return {
    examSetId: examData.id,
    slug: examData.slug,
    title: examData.title,
    description: examData.description,
    durationMinutes: 45,
    totalQuestions: questions.length,
    questions,
    groups,
  };
}

/**
 * Server Action: Nộp bài thi Listening Part 1–4 và chấm điểm chuẩn ETS 5–495 trên Server
 */
export async function submitListeningExamAction(
  payload: SubmitExamPayload
): Promise<SubmitListeningExamResult> {
  const { user } = await getOptionalUser();
  if (!user) {
    return { success: false, error: "Vui lòng đăng nhập để nộp bài thi." };
  }

  const { examSetId, userAnswers, timeSpentSeconds } = payload;

  const sanitizedAnswers: Record<string, number> = {};
  if (userAnswers && typeof userAnswers === "object") {
    for (const [qId, val] of Object.entries(userAnswers)) {
      if (typeof val === "number" && Number.isInteger(val) && val >= 0 && val <= 3) {
        sanitizedAnswers[qId] = val;
      }
    }
  }

  if (Object.keys(sanitizedAnswers).length === 0) {
    return { success: false, error: "Bạn chưa chọn câu trả lời nào cho bài thi." };
  }

  try {
    const adminSupabase = createAdminClient();

    const { data: examSet, error: setErr } = await adminSupabase
      .from("exam_sets")
      .select("id, slug, title, content")
      .eq("id", examSetId)
      .eq("status", "published")
      .maybeSingle();

    if (setErr || !examSet) {
      return {
        success: false,
        error: "Không tìm thấy bộ đề thi tương ứng hoặc đề thi chưa được xuất bản.",
      };
    }

    const rawExam = examSet as unknown as RawExamRow;
    if (!rawExam.content?.listening) {
      return {
        success: false,
        error: "Nội dung phần Listening của đề thi không hợp lệ.",
      };
    }

    const { questions, groups } = flattenListeningContent(rawExam.content.listening);
    if (questions.length === 0) {
      return {
        success: false,
        error: "Đề thi chưa có dữ liệu câu hỏi Listening.",
      };
    }

    const { data: answersData, error: ansErr } = await adminSupabase
      .from("exam_set_answers")
      .select(
        "question_id, part, correct_answer, correct_index, evidence, explanation, explanation_vi"
      )
      .eq("exam_set_id", examSetId)
      .in("part", [1, 2, 3, 4]);

    if (ansErr || !answersData || answersData.length === 0) {
      return {
        success: false,
        error: "Không thể lấy đáp án Listening từ cơ sở dữ liệu.",
      };
    }

    const answerKeys: ListeningAnswerKey[] = answersData.map((a) => ({
      questionId: a.question_id,
      part: a.part,
      correctAnswer: a.correct_answer as "A" | "B" | "C" | "D",
      correctIndex: a.correct_index,
      evidence: a.evidence,
      explanation: a.explanation,
      explanationVi: a.explanation_vi,
    }));

    const evaluation: ExamListeningEvaluation = evaluateListeningExam({
      questions,
      groups,
      answerKeys,
      userAnswers: sanitizedAnswers,
      timeSpentSeconds,
    });

    const { data: attemptRow, error: attemptErr } = await adminSupabase
      .from("exam_attempts")
      .insert({
        user_id: user.id,
        exam_set_id: examSetId,
        status: "completed",
        submitted_at: new Date().toISOString(),
        time_spent_seconds: timeSpentSeconds,
        user_answers: sanitizedAnswers,
        correct_count_listening: evaluation.rawScore,
        score_listening: evaluation.scaledScore,
        total_score: evaluation.scaledScore,
        detailed_results: {
          mode: "listening",
          parts: evaluation.parts,
          accuracyPercentage: evaluation.accuracyPercentage,
        },
      })
      .select("id")
      .maybeSingle();

    if (attemptErr || !attemptRow?.id) {
      return {
        success: false,
        error:
          "Không thể lưu kết quả bài thi Listening vào lịch sử. Đáp án của bạn vẫn được giữ nguyên, vui lòng bấm Nộp bài để thử lại.",
      };
    }

    return {
      success: true,
      attemptId: attemptRow.id,
      evaluation,
    };
  } catch (err: unknown) {
    console.error("[submitListeningExamAction] Error:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi chấm bài thi Listening.",
    };
  }
}
