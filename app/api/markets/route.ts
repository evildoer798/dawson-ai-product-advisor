import { NextResponse } from "next/server";
import { marketList, snapshots, SNAPSHOT_AT, DATA_VERSION } from "@/lib/snapshot";

export async function GET() {
  return NextResponse.json({
    markets: marketList.map((market) => ({ ...market, competitorCount: snapshots[market.code].competitors.length })),
    snapshotAt: SNAPSHOT_AT,
    dataVersion: DATA_VERSION,
    sourceMarketCount: 43,
    enabledMarketCount: marketList.length
  });
}
