import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getReviewCardsAction } from "@/features/review/actions";
import { ReviewView } from "@/features/review/components/review-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ôn tập FSRS Spaced Repetition | TOEIC",
  description: "Ôn tập ngắt quãng từ vựng TOEIC với thuật toán FSRS và câu ngữ cảnh đục lỗ",
};

export default async function ReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/review");
  }

  const { cards, nextDueFormatted, totalCardsCount } =
    await getReviewCardsAction();

  return (
    <ReviewView
      initialCards={cards}
      nextDueFormatted={nextDueFormatted}
      totalCardsCount={totalCardsCount}
    />
  );
}
