import { NextResponse } from "next/server";
import { scoreProduct } from "@/lib/scoring";
import { getEvaluation, getProfile, saveEvaluation } from "@/lib/storage";
import type { ProductInput } from "@/lib/types";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const evaluation = await getEvaluation(id);
  return evaluation ? NextResponse.json(evaluation) : NextResponse.json({ error: "Evaluation not found" }, { status: 404 });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const evaluation = await getEvaluation(id);
  if (!evaluation) return NextResponse.json({ error: "Evaluation not found" }, { status: 404 });
  const patch = await request.json() as Partial<ProductInput>;
  const product = { ...evaluation.product, ...patch };
  const rescored = scoreProduct(product, await getProfile(product.market), evaluation.images, evaluation.id);
  rescored.createdAt = evaluation.createdAt;
  rescored.feedback = evaluation.feedback;
  await saveEvaluation(rescored);
  return NextResponse.json(rescored);
}
