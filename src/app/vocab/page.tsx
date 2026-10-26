import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVocabListAction, getNotebooksAction } from "@/features/vocab/actions";
import { VocabListView } from "@/features/vocab/components/vocab-list-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sổ từ vựng cá nhân | TOEIC AI",
  description: "Quản lý và ôn tập từ vựng Part 5 theo thuật toán ghi nhớ ngắt quãng FSRS",
};

export default async function VocabPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/vocab");
  }

  const [{ entries, dueCount }, notebooks] = await Promise.all([
    getVocabListAction(),
    getNotebooksAction(),
  ]);

  return (
    <VocabListView
      initialEntries={entries}
      initialDueCount={dueCount}
      initialNotebooks={notebooks}
    />
  );
}
