import { requireUser } from "@/shared/auth";
import {
  getReviewCardsAction,
  getReviewTopicsAction,
} from "@/features/review/actions";
import { getNotebooksAction } from "@/features/vocab/actions";
import { ReviewView } from "@/features/review/components/review-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ôn tập FSRS Spaced Repetition | TOEIC",
  description: "Ôn tập ngắt quãng từ vựng TOEIC với thuật toán FSRS và câu ngữ cảnh đục lỗ",
};

interface ReviewPageProps {
  searchParams: Promise<{
    notebookId?: string;
    topic?: string;
    limit?: string;
    studyAll?: string;
  }>;
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  await requireUser({ redirectTo: "/review" });

  const { notebookId, topic, limit, studyAll } = (await searchParams) || {};
  const parsedLimit = limit ? parseInt(limit, 10) : 15; // Mặc định 15 từ mỗi phiên (Micro-learning)

  const [
    { cards, nextDueFormatted, totalCardsCount, notebookName, topicName },
    notebooks,
    { topics },
  ] = await Promise.all([
    getReviewCardsAction({
      notebookId,
      topic,
      limit: parsedLimit,
      studyAll: studyAll === "true",
    }),
    getNotebooksAction(),
    getReviewTopicsAction(notebookId),
  ]);

  return (
    <ReviewView
      initialCards={cards}
      nextDueFormatted={nextDueFormatted}
      totalCardsCount={totalCardsCount}
      notebookName={notebookName}
      topicName={topicName}
      notebookId={notebookId}
      currentTopic={topic}
      currentLimit={parsedLimit}
      notebooks={notebooks}
      topics={topics}
    />
  );
}
