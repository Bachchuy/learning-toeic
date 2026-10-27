import { requireUser } from "@/shared/auth";
import {
  getVocabListAction,
  getNotebooksAction,
  getCuratedDecksAction,
} from "@/features/vocab/actions";
import { VocabListView } from "@/features/vocab/components/vocab-list-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sổ từ vựng cá nhân | TOEIC AI",
  description: "Quản lý và ôn tập từ vựng Part 5 theo thuật toán ghi nhớ ngắt quãng FSRS",
};

export default async function VocabPage() {
  await requireUser({ redirectTo: "/vocab" });

  const [{ entries, dueCount }, notebooks, { decks: curatedDecks }] =
    await Promise.all([
      getVocabListAction(),
      getNotebooksAction(),
      getCuratedDecksAction(),
    ]);

  return (
    <VocabListView
      initialEntries={entries}
      initialDueCount={dueCount}
      initialNotebooks={notebooks}
      initialCuratedDecks={curatedDecks}
    />
  );
}
