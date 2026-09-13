import { NextResponse } from "next/server";
import { analyzeProductImage } from "@/lib/vision";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const image = form.get("image");
    if (!(image instanceof File)) return NextResponse.json({ error: "Image is required" }, { status: 400 });
    if (image.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Image must be 5 MB or smaller" }, { status: 413 });
    const dataUrl = `data:${image.type || "image/jpeg"};base64,${Buffer.from(await image.arrayBuffer()).toString("base64")}`;
    return NextResponse.json(await analyzeProductImage(dataUrl));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Image analysis failed" }, { status: 500 });
  }
}
