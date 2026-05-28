// One-off screenshot capture for the README. Drives your already-installed
// Chrome via puppeteer-core (no browser download). It is NOT a project
// dependency — install it on demand, then run with the dev server up:
//   npm i -D puppeteer-core
//   node scripts/capture.mjs
// Adjust CHROME below if your Chrome lives elsewhere.
import puppeteer from "puppeteer-core";
import { setTimeout as sleep } from "node:timers/promises";
import fs from "node:fs";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const URL = process.env.URL || "http://localhost:3000";
const OUT = "../docs/img";
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  args: ["--hide-scrollbars", "--force-color-profile=srgb"],
});

const page = await browser.newPage();
await page.goto(URL, { waitUntil: "networkidle0", timeout: 60000 });

// Walk down the page to trigger every scroll-reveal, then return to top.
await page.evaluate(async () => {
  const step = window.innerHeight * 0.8;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 140));
  }
  window.scrollTo(0, 0);
});
await sleep(3000); // GSAP reveals + safety sweep settle

async function shotEl(name, sel) {
  const el = await page.$(sel);
  if (!el) { console.log("MISS", name, sel); return; }
  await el.evaluate((n) => n.scrollIntoView({ block: "start" }));
  await sleep(700);
  await el.screenshot({ path: `${OUT}/${name}.png` });
  console.log("OK  ", name);
}

async function shotViewport(name, scrollY = 0) {
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await sleep(500);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log("OK  ", name, "(viewport)");
}

async function clickByText(label) {
  const ok = await page.evaluate((lab) => {
    const b = [...document.querySelectorAll("button")].find((x) =>
      new RegExp(lab, "i").test(x.textContent || "")
    );
    if (b) { b.click(); return true; }
    return false;
  }, label);
  await sleep(800);
  return ok;
}

// 1. Hero (top viewport)
await shotViewport("hero", 0);

// 2. The five universal steps
await shotEl("five-steps", "#how");

// 3. Anatomy pipeline — default stage (01 RAW TEXT)
await clickByText("RAW TEXT");
await shotEl("anatomy-pipeline", "#anatomy");

// 4. Anatomy — embeddings stage (shows the colour legend)
await clickByText("EMBEDDINGS");
await shotEl("anatomy-embeddings", "#anatomy");

// 5. Anatomy — encoder stage (self-attention heatmap)
await clickByText("ENCODER");
await shotEl("anatomy-encoder", "#anatomy");

// 6. The Router lab
await shotEl("router-lab", "#lab");

await browser.close();
console.log("done");
