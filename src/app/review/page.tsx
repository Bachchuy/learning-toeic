import { requireUser } from "@/shared/auth";
import {
  getReviewCardsAction,
  getReviewTopicsAction,
} from "@/features/review/actions";
import { getNotebooksAction } from "@/features/vocab/actions";
import { ReviewView } from "@/features/review/components/review-view";
import {
  buildReviewFilterKey,
  parseReviewLimit,
} from "@/features/review/review-config";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ôn tập FSRS Spaced Repetition",
  description: "Ôn tập ngắt quãng từ vựng TOEIC với thuật toán FSRS và câu ngữ cảnh đục lỗ",
};

interface ReviewPageProps {
  searchParams: Promise<{
    notebookId?: string;
    topic?: string;
    limit?: string;
    studyAll?: string;
    excludeDeck?: string;
  }>;
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  await requireUser({ redirectTo: "/review" });

  const { notebookId, topic, limit, studyAll, excludeDeck } = (await searchParams) || {};
  const parsedLimit = parseReviewLimit(limit); // Mặc định 15 từ mỗi phiên (Micro-learning), giới hạn 1..100
  const isStudyAll = studyAll === "true";

  const [
    { cards, nextDueFormatted, totalCardsCount, notebookName, topicName },
    notebooks,
    { topics },
  ] = await Promise.all([
    getReviewCardsAction({
      notebookId,
      topic,
      limit: parsedLimit,
      studyAll: isStudyAll,
      excludeDeck,
    }),
    getNotebooksAction(),
    getReviewTopicsAction(notebookId),
  ]);

  const filterKey = buildReviewFilterKey({
    notebookId,
    topic,
    limit: parsedLimit,
    studyAll: isStudyAll,
    excludeDeck,
  });

  return (
    <ReviewView
      key={filterKey}
      filterKey={filterKey}
      initialCards={cards}
      nextDueFormatted={nextDueFormatted}
      totalCardsCount={totalCardsCount}
      notebookName={notebookName}
      topicName={topicName}
      notebookId={notebookId}
      currentTopic={topic}
      currentLimit={parsedLimit}
      currentStudyAll={isStudyAll}
      currentExcludeDeck={excludeDeck}
      notebooks={notebooks}
      topics={topics}
    />
  );
}
