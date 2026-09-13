import { DashboardClient } from "@/components/dashboard-client";
import { listEvaluations } from "@/lib/storage";
import { marketList, SNAPSHOT_AT } from "@/lib/snapshot";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return <DashboardClient evaluations={await listEvaluations()} markets={marketList} snapshotAt={SNAPSHOT_AT} />;
}
