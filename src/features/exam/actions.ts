"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOptionalUser } from "@/shared/auth";
import { MOCK_TESTS, getMockTestBySlug } from "@/data/mock-tests";
import {
  evaluateReadingExam,
  type ReadingQuestionItem,
  type ReadingAnswerKey,
  type ExamReadingEvaluation,
} from "@/core/examReading";
import type {
  ExamMetaSummary,
  ReadingExamData,
  SubmitExamPayload,
  SubmitExamResult,
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
 * Server Action: Lấy danh sách đề thi thử TOEIC Reading
 */
export async function getExamListAction(): Promise<ExamMetaSummary[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("exam_sets")
      .select("id, slug, title, description, exam_type, target_score, duration_minutes, total_questions, parts_summary")
      .eq("status", "published")
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
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
    }
  } catch (err) {
    console.error("[getExamListAction] Supabase error, falling back to local mock data:", err);
  }

  // Fallback sang dữ liệu local mock tests
  return MOCK_TESTS.map((t) => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    description: t.description,
    exam_type: t.exam_type,
    target_score: t.target_score,
    duration_minutes: 75,
    total_questions: 100,
    parts_summary: {
      part5: t.parts_summary?.part5 || 30,
      part6: t.parts_summary?.part6 || 16,
      part7: t.parts_summary?.part7 || 54,
      totalReading: 100,
    },
  }));
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

  if (!examData) {
    const local = getMockTestBySlug(slug);
    if (local) {
      examData = local as unknown as RawExamRow;
    }
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
 * đối soát và tính điểm quy đổi chính xác, lưu lịch sử exam_attempts.
 */
export async function submitReadingExamAction(
  payload: SubmitExamPayload
): Promise<SubmitExamResult> {
  const { examSetId, userAnswers, timeSpentSeconds } = payload;

  if (!userAnswers || Object.keys(userAnswers).length === 0) {
    return { success: false, error: "Bạn chưa chọn câu trả lời nào cho bài thi." };
  }

  try {
    const adminSupabase = createAdminClient();

    // 1. Lấy thông tin đề thi để lấy danh sách câu hỏi
    const { data: examSet, error: setErr } = await adminSupabase
      .from("exam_sets")
      .select("id, slug, title, content")
      .eq("id", examSetId)
      .maybeSingle();

    if (setErr || !examSet) {
      return { success: false, error: "Không tìm thấy bộ đề thi tương ứng." };
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
      userAnswers,
      timeSpentSeconds,
    });

    // 4. Lưu kết quả vào exam_attempts nếu có user đã đăng nhập
    let attemptId: string | undefined;
    const { user } = await getOptionalUser();
    if (user) {
      const { data: attemptRow, error: attemptErr } = await adminSupabase
        .from("exam_attempts")
        .insert({
          user_id: user.id,
          exam_set_id: examSetId,
          status: "completed",
          submitted_at: new Date().toISOString(),
          time_spent_seconds: timeSpentSeconds,
          user_answers: userAnswers,
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

      if (!attemptErr && attemptRow) {
        attemptId = attemptRow.id;
      }
    }

    return {
      success: true,
      attemptId,
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
