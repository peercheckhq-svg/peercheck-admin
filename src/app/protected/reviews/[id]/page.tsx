import { Suspense } from "react";
import CaseReview from "../components/CaseReview";

export default async function ReviewCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Suspense fallback={<p role="status">Loading verification case…</p>}><CaseReview key={id} id={id} /></Suspense>;
}
