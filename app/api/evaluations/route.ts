import { NextResponse } from "next/server";
import { z } from "zod";
import { marketList } from "@/lib/snapshot";
import { scoreProduct } from "@/lib/scoring";
import { getProfile, listEvaluations, saveEvaluation } from "@/lib/storage";

export const runtime = "nodejs";

const numberField = z.coerce.number().finite().nonnegative();
const productSchema = z.object({
  name: z.string().trim().min(2).max(80),
  market: z.string().refine((value) => marketList.some((market) => market.code === value), "Unsupported market"),
  brand: z.string().trim().max(60).optional(),
  puffs: numberField.min(100),
  eLiquidMl: numberField.positive(),
  nicotineMgMl: numberField,
  flavor: z.string().trim().min(2).max(80),
  retailPriceUsd: numberField.positive(),
  batteryMah: numberField.optional(),
  charging: z.string().trim().max(40).optional(),
  dimensions: z.string().trim().max(80).optional(),
  targetCostUsd: numberField.optional(),
  moq: numberField.optional(),
  channel: z.string().trim().max(80).optional(),
  visualTraits: z.array(z.string().trim().min(1).max(60)).max(10).default([])
});

const optionalNumber = (form: FormData, key: string) => {
  const value = String(form.get(key) || "").trim();
  return value ? Number(value) : undefined;
};

export async function GET() {
  return NextResponse.json({ evaluations: await listEvaluations() });
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const imageFiles = form.getAll("images").filter((item): item is File => item instanceof File && item.size > 0);
    if (imageFiles.length < 1 || imageFiles.length > 6) return NextResponse.json({ error: "Upload between 1 and 6 images" }, { status: 400 });
    if (imageFiles.some((file) => file.size > 5 * 1024 * 1024)) return NextResponse.json({ error: "Each image must be 5 MB or smaller" }, { status: 413 });

    const rawTraits = String(form.get("visualTraits") || "[]");
    const product = productSchema.parse({
      name: form.get("name"), market: form.get("market"), brand: String(form.get("brand") || "") || undefined,
      puffs: form.get("puffs"), eLiquidMl: form.get("eLiquidMl"), nicotineMgMl: form.get("nicotineMgMl"),
      flavor: form.get("flavor"), retailPriceUsd: form.get("retailPriceUsd"),
      batteryMah: optionalNumber(form, "batteryMah"), charging: String(form.get("charging") || "") || undefined,
      dimensions: String(form.get("dimensions") || "") || undefined, targetCostUsd: optionalNumber(form, "targetCostUsd"),
      moq: optionalNumber(form, "moq"), channel: String(form.get("channel") || "") || undefined,
      visualTraits: JSON.parse(rawTraits)
    });

    const images = await Promise.all(imageFiles.map(async (file) => `data:${file.type || "image/jpeg"};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`));
    const evaluation = scoreProduct(product, await getProfile(product.market), images);
    await saveEvaluation(evaluation);
    return NextResponse.json(evaluation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid product details", issues: error.issues }, { status: 400 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Evaluation failed" }, { status: 500 });
  }
}
