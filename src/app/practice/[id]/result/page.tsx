import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionReviewAction } from "@/features/practice/actions";
import { PracticeResultView } from "@/features/practice/components/practice-result-view";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PracticeResultPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/practice/${id}/result`);
  }

  const { data: review, error } = await getSessionReviewAction(id);

  if (error || !review) {
    notFound();
  }

  return <PracticeResultView review={review} />;
}
