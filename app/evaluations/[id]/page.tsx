import { notFound } from "next/navigation";
import { ReportView } from "@/components/report-view";
import { getEvaluation } from "@/lib/storage";
import { snapshots } from "@/lib/snapshot";

export const dynamic = "force-dynamic";

export default async function EvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evaluation = await getEvaluation(id);
  if (!evaluation) notFound();
  return <ReportView evaluation={evaluation} snapshot={snapshots[evaluation.product.market] || snapshots.AE} />;
}
