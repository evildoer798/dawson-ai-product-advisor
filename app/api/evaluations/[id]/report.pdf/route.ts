import { existsSync } from "node:fs";
import puppeteer from "puppeteer-core";
import { getEvaluation } from "@/lib/storage";

export const runtime = "nodejs";
export const maxDuration = 60;

function executablePath() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome"
  ].filter(Boolean) as string[];
  return candidates.find(existsSync);
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const evaluation = await getEvaluation(id);
  if (!evaluation) return Response.json({ error: "Evaluation not found" }, { status: 404 });
  const chrome = executablePath();
  if (!chrome) return Response.json({ error: "A Chromium executable is required for PDF rendering. Set PUPPETEER_EXECUTABLE_PATH." }, { status: 503 });
  const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  try {
    const page = await browser.newPage();
    const cookie = request.headers.get("cookie");
    if (cookie) await page.setExtraHTTPHeaders({ cookie });
    await page.goto(`${new URL(request.url).origin}/print/${id}`, { waitUntil: "networkidle0" });
    await page.emulateMediaType("print");
    const pdf = await page.pdf({ format: "A4", printBackground: true, margin: { top: "12mm", right: "12mm", bottom: "14mm", left: "12mm" } });
    return new Response(pdf as BodyInit, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="dawsen-${id}.pdf"`, "Cache-Control": "no-store" } });
  } finally { await browser.close(); }
}
