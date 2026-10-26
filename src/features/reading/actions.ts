"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  ReadingPassage,
  PassageSubmitResult,
  ReadingQuestionResult,
  QuestionExplanation,
} from "./types";

interface RawPassageRow {
  id: string;
  part: number;
  passage_type: string;
  title: string;
  context_info: Record<string, string>;
  content: string;
  content_blocks: unknown[];
  created_at: string;
}

interface RawQuestionRow {
  id: string;
  part: number;
  passage_id: string;
  order_in_passage: number;
  question_sub_type: string | null;
  stem: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  difficulty: number;
  tag_id: number | null;
}

/**
 * Lấy danh sách các bài đọc Part 6 hoặc Part 7 đã xuất bản
 */
export async function getReadingPassagesListAction(
  part?: 6 | 7
): Promise<ReadingPassage[]> {
  const supabase = await createClient();

  let query = supabase
    .from("passages")
    .select("*, questions(id)")
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (part) {
    query = query.eq("part", part);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((p) => {
    const raw = p as unknown as RawPassageRow;
    return {
      id: raw.id,
      part: raw.part as 6 | 7,
      passage_type: raw.passage_type as ReadingPassage["passage_type"],
      title: raw.title,
      context_info: raw.context_info || {},
      content: raw.content,
      content_blocks: raw.content_blocks || [],
      created_at: raw.created_at,
      questions: [],
    };
  });
}

/**
 * Lấy chi tiết một bài đọc kèm danh sách câu hỏi
 * BẤT BIẾN BẢO MẬT: Tuyệt đối KHÔNG trả về đáp án đúng (question_answers) cho client!
 */
export async function getReadingPassageAction(
  passageId: string
): Promise<ReadingPassage | null> {
  const supabase = await createClient();

  // 1. Lấy thông tin bài đọc
  const { data: passageData, error: passageError } = await supabase
    .from("passages")
    .select("*")
    .eq("id", passageId)
    .eq("status", "published")
    .maybeSingle();

  if (passageError || !passageData) return null;

  // 2. Lấy danh sách câu hỏi thuộc bài đọc sắp xếp theo thứ tự
  const { data: questionsData, error: qError } = await supabase
    .from("questions")
    .select("*")
    .eq("passage_id", passageId)
    .eq("status", "published")
    .order("order_in_passage", { ascending: true });

  if (qError || !questionsData) return null;

  const rawPassage = passageData as unknown as RawPassageRow;
  const rawQuestions = questionsData as unknown as RawQuestionRow[];

  return {
    id: rawPassage.id,
    part: rawPassage.part as 6 | 7,
    passage_type: rawPassage.passage_type as ReadingPassage["passage_type"],
    title: rawPassage.title,
    context_info: rawPassage.context_info || {},
    content: rawPassage.content,
    content_blocks: rawPassage.content_blocks || [],
    created_at: rawPassage.created_at,
    questions: rawQuestions.map((q) => ({
      id: q.id,
      part: q.part as 6 | 7,
      passage_id: q.passage_id,
      order_in_passage: q.order_in_passage,
      question_sub_type: q.question_sub_type,
      stem: q.stem,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      difficulty: q.difficulty,
      tag_id: q.tag_id,
    })),
  };
}

/**
 * Nộp bài và chấm điểm bài đọc Part 6 / Part 7 trên máy chủ
 * Đáp án được đối chiếu hoàn toàn trên server để đảm bảo tính toàn vẹn.
 */
export async function submitPassageAnswersAction(
  passageId: string,
  userAnswers: { questionId: string; selectedIndex: number }[]
): Promise<PassageSubmitResult> {
  if (!userAnswers || userAnswers.length === 0) {
    return { success: false, score: 0, total: 0, results: [], message: "Không có câu trả lời nào." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const questionIds = userAnswers.map((a) => a.questionId);

  // Lấy đáp án đúng và phân tích từ bảng question_answers
  const { data: answersData, error } = await supabase
    .from("question_answers")
    .select("question_id, correct_index, explanation")
    .in("question_id", questionIds);

  if (error || !answersData) {
    return { success: false, score: 0, total: userAnswers.length, results: [], message: "Lỗi kiểm tra đáp án." };
  }

  const answerMap = new Map(
    answersData.map((a) => [
      a.question_id,
      {
        correct_index: a.correct_index,
        explanation: a.explanation as QuestionExplanation,
      },
    ])
  );

  let score = 0;
  const results: ReadingQuestionResult[] = [];

  for (const item of userAnswers) {
    const trueAns = answerMap.get(item.questionId);
    if (!trueAns) continue;

    const isCorrect = item.selectedIndex === trueAns.correct_index;
    if (isCorrect) {
      score++;
    }

    results.push({
      question_id: item.questionId,
      is_correct: isCorrect,
      correct_index: trueAns.correct_index,
      user_selected: item.selectedIndex,
      explanation: trueAns.explanation || {},
    });

    // Nếu người dùng đã đăng nhập, ghi nhận attempt vào cơ sở dữ liệu
    if (user) {
      supabase
        .from("attempts")
        .insert({
          user_id: user.id,
          question_id: item.questionId,
          selected_index: item.selectedIndex,
          is_correct: isCorrect,
        })
        .then(() => {});
    }
  }

  return {
    success: true,
    score,
    total: results.length,
    results,
  };
}
