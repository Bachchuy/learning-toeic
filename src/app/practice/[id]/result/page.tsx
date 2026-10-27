import { notFound } from "next/navigation";
import { requireUser } from "@/shared/auth";
import { getSessionReviewAction } from "@/features/practice/actions";
import { PracticeResultView } from "@/features/practice/components/practice-result-view";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PracticeResultPage({ params }: PageProps) {
  const { id } = await params;
  await requireUser({ redirectTo: `/practice/${id}/result` });

  const { data: review, error } = await getSessionReviewAction(id);

  if (error || !review) {
    notFound();
  }

  return <PracticeResultView review={review} />;
}
