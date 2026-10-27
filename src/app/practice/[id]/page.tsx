import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/shared/auth";
import { formatGrammarTagName } from "@/core/grammarTags";
import { PracticeRunner } from "@/features/practice/components/practice-runner";
import type { PracticeQuestion } from "@/features/practice/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PracticeSessionPage({ params }: PageProps) {
  const { id } = await params;
  const { user, supabase } = await requireUser({ redirectTo: `/practice/${id}` });

  // Lấy thông tin phiên
  const { data: session, error: sessionError } = await supabase
    .from("practice_sessions")
    .select("id, total_questions, completed_at, user_id")
    .eq("id", id)
    .single();

  if (sessionError || !session || session.user_id !== user.id) {
    notFound();
  }

  // Nếu phiên đã hoàn thành trước đó, chuyển thẳng sang trang kết quả
  if (session.completed_at) {
    redirect(`/practice/${id}/result`);
  }

  // Lấy danh sách câu hỏi của phiên (BẤT BIẾN: KHÔNG CÓ ĐÁP ÁN)
  const { data: sessionQuestions, error: questionsError } = await supabase
    .from("session_questions")
    .select(
      `
      order_index,
      questions!inner (
        id,
        stem,
        option_a,
        option_b,
        option_c,
        option_d,
        tag_id,
        difficulty,
        grammar_tags!inner (
          tag_code,
          name_vi
        )
      )
    `
    )
    .eq("session_id", id)
    .order("order_index");

  if (questionsError || !sessionQuestions || sessionQuestions.length === 0) {
    notFound();
  }

  interface SessionQuestionRow {
    order_index: number;
    questions: {
      id: string;
      stem: string;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
      tag_id: number;
      difficulty: number;
      grammar_tags: {
        tag_code: string;
        name_vi: string;
      };
    };
  }

  // Transform về định dạng PracticeQuestion
  const questions: PracticeQuestion[] = (
    sessionQuestions as unknown as SessionQuestionRow[]
  ).map((sq) => ({
    id: sq.questions.id,
    order_index: sq.order_index,
    stem: sq.questions.stem,
    option_a: sq.questions.option_a,
    option_b: sq.questions.option_b,
    option_c: sq.questions.option_c,
    option_d: sq.questions.option_d,
    tag_id: sq.questions.tag_id,
    tag_name_vi: formatGrammarTagName(
      sq.questions.grammar_tags.tag_code,
      sq.questions.grammar_tags.name_vi
    ),
    difficulty: sq.questions.difficulty,
  }));

  return <PracticeRunner sessionId={id} questions={questions} />;
}
