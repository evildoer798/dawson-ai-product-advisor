import { NextResponse } from "next/server";
import { z } from "zod";
import { getEvaluation, saveEvaluation } from "@/lib/storage";

const schema = z.object({
  decision: z.enum(["accepted", "rejected"]),
  finalAction: z.enum(["go", "review", "no-go"]),
  note: z.string().max(1000).default("")
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const evaluation = await getEvaluation(id);
  if (!evaluation) return NextResponse.json({ error: "Evaluation not found" }, { status: 404 });
  try {
    evaluation.feedback = { ...schema.parse(await request.json()), createdAt: new Date().toISOString() };
    evaluation.updatedAt = new Date().toISOString();
    await saveEvaluation(evaluation);
    return NextResponse.json({ feedback: evaluation.feedback });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid feedback" }, { status: 400 });
  }
}
