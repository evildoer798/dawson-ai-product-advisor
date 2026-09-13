import { NextResponse } from "next/server";
import { z } from "zod";
import { getProfile, saveProfile } from "@/lib/storage";

const schema = z.object({
  enabled: z.boolean(),
  goThreshold: z.number().min(1).max(100),
  reviewThreshold: z.number().min(1).max(100),
  weights: z.object({ demand: z.number().min(0), competition: z.number().min(0), differentiation: z.number().min(0), compliance: z.number().min(0), supply: z.number().min(0), commercial: z.number().min(0) })
}).refine((value) => value.goThreshold > value.reviewThreshold, "Go threshold must exceed review threshold")
  .refine((value) => Math.round(Object.values(value.weights).reduce((a, b) => a + b, 0)) === 100, "Weights must total 100");

export async function GET(_: Request, context: { params: Promise<{ market: string }> }) {
  const { market } = await context.params;
  return NextResponse.json(await getProfile(market));
}

export async function PUT(request: Request, context: { params: Promise<{ market: string }> }) {
  const { market } = await context.params;
  try {
    const current = await getProfile(market);
    const value = schema.parse(await request.json());
    return NextResponse.json(await saveProfile({ ...current, ...value, market, version: `score-v1.${Date.now()}` }));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid profile" }, { status: 400 });
  }
}
