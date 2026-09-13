import { NextResponse } from "next/server";
import { listProfiles } from "@/lib/storage";

export async function GET() {
  return NextResponse.json({ profiles: await listProfiles() });
}
