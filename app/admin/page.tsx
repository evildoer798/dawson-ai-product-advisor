import { AdminClient } from "@/components/admin-client";
import { marketList } from "@/lib/snapshot";
import { listProfiles } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  return <AdminClient initialProfiles={await listProfiles()} markets={marketList} />;
}
