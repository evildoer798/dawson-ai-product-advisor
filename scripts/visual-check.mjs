import fs from "node:fs/promises";
import puppeteer from "puppeteer-core";

const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
await fs.mkdir(".screens", { recursive: true });
const browser = await puppeteer.launch({ headless: true, executablePath, args: ["--no-sandbox"] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1050, deviceScaleFactor: 1 });
  for (const [name, url] of [["dashboard", "/"], ["new-evaluation", "/new"], ["report", "/evaluations/demo-uae-aero"], ["admin", "/admin"]]) {
    await page.goto(`http://localhost:3000${url}`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: `.screens/${name}.png`, type: "png", fullPage: true });
    const overflow = await page.evaluate(() => document.body.scrollWidth <= innerWidth ? "no-overflow" : `overflow:${document.body.scrollWidth}/${innerWidth}`);
    console.log(`${name}: ${await page.title()} · ${overflow}`);
  }
} finally {
  await browser.close();
}
