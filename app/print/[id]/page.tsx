import { notFound } from "next/navigation";
import { PrintReport } from "@/components/print-report";
import { getEvaluation } from "@/lib/storage";
import { snapshots } from "@/lib/snapshot";

export const dynamic = "force-dynamic";

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evaluation = await getEvaluation(id);
  if (!evaluation) notFound();
  return <PrintReport evaluation={evaluation} snapshot={snapshots[evaluation.product.market] || snapshots.AE}/>;
}
