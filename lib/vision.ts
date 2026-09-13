import OpenAI from "openai";

export type VisionResult = {
  traits: string[];
  charging?: string;
  dominantColors: string[];
  displayType?: string;
  mode: "demo" | "openai";
};

export async function analyzeProductImage(dataUrl: string): Promise<VisionResult> {
  if (!process.env.OPENAI_API_KEY) {
    return { traits: ["compact body", "soft radius", "front display"], charging: "USB-C", dominantColors: ["graphite", "cobalt"], displayType: "status display", mode: "demo" };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
    input: [{ role: "user", content: [
      { type: "input_text", text: "Analyze only visible industrial-design attributes of this disposable vape product. Do not infer safety, performance, capacity, nicotine or sales. Return JSON with traits (max 6 short English phrases), charging, dominantColors, and displayType. Use null when not visible." },
      { type: "input_image", image_url: dataUrl, detail: "high" }
    ] }],
    text: { format: { type: "json_schema", name: "product_visual_traits", strict: true, schema: { type: "object", additionalProperties: false, properties: { traits: { type: "array", items: { type: "string" }, maxItems: 6 }, charging: { type: ["string", "null"] }, dominantColors: { type: "array", items: { type: "string" }, maxItems: 4 }, displayType: { type: ["string", "null"] } }, required: ["traits", "charging", "dominantColors", "displayType"] } } }
  } as never);

  const parsed = JSON.parse(response.output_text) as Omit<VisionResult, "mode">;
  return { ...parsed, charging: parsed.charging || undefined, displayType: parsed.displayType || undefined, mode: "openai" };
}
