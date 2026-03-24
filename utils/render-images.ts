import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";
import type { Page } from "puppeteer";

const MODELS_DIR = path.join(process.cwd(), "public", "model");
const IMAGES_DIR = path.join(process.cwd(), "public", "image");

const VIEWPORT = { width: 1024, height: 640, deviceScaleFactor: 1 as const };

function log(message: string, ...args: unknown[]) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [render-images] ${message}`, ...args);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

function buildHtml(modelDataUrl: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body {
        margin: 0;
        width: 100%;
        height: 100%;
        background: #1e1e1e;
      }
      #wrap {
        width: 1024px;
        height: 640px;
        background: radial-gradient(120% 120% at 50% 25%, rgba(185, 28, 60, 0.18), transparent 60%);
      }
      model-viewer {
        width: 100%;
        height: 100%;
      }
    </style>
    <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
  </head>
  <body>
    <div id="wrap">
      <model-viewer
        src="${modelDataUrl}"
        camera-controls
        environment-image="neutral"
        shadow-intensity="0.9"
        exposure="1"
      ></model-viewer>
    </div>
  </body>
</html>`;
}

async function renderModelToImage(
  page: Page,
  modelPath: string,
  outputPath: string
) {
  const modelBuffer = await fs.readFile(modelPath);
  const modelDataUrl = `data:model/gltf-binary;base64,${modelBuffer.toString("base64")}`;

  await page.setContent(buildHtml(modelDataUrl), { waitUntil: "networkidle0" });
  await page.waitForSelector("model-viewer");
  await page.waitForFunction(() => {
    const mv = document.querySelector("model-viewer") as { loaded?: boolean } | null;
    return Boolean(mv && mv.loaded);
  });
  await new Promise((resolve) => setTimeout(resolve, 250));

  const container = await page.$("#wrap");
  if (!container) throw new Error("Render container not found");

  const screenshot = await container.screenshot({ type: "jpeg", quality: 92 });
  const jpgBuffer = Buffer.isBuffer(screenshot) ? screenshot : Buffer.from(screenshot);
  await fs.writeFile(outputPath, jpgBuffer);
}

async function main() {
  await fs.mkdir(IMAGES_DIR, { recursive: true });

  const modelFiles = (await fs.readdir(MODELS_DIR))
    .filter((name) => name.toLowerCase().endsWith(".glb"))
    .sort((a, b) => a.localeCompare(b));

  if (modelFiles.length === 0) {
    log("No .glb files found in", MODELS_DIR);
    return;
  }

  log("Found models:", modelFiles.length);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    for (const modelFile of modelFiles) {
      const baseName = modelFile.replace(/\.glb$/i, "");
      const modelPath = path.join(MODELS_DIR, modelFile);
      const outputPath = path.join(IMAGES_DIR, `${baseName}.jpg`);

      if (await fileExists(outputPath)) {
        log("Skip existing image:", `${baseName}.jpg`);
        continue;
      }

      log("Rendering:", modelFile);
      const page = await browser.newPage();
      try {
        await page.setViewport(VIEWPORT);
        await renderModelToImage(page, modelPath, outputPath);
        log("Saved:", outputPath);
      } catch (error) {
        log("Failed:", modelFile, error instanceof Error ? error.message : String(error));
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  log("Done");
}

async function startLoop() {
  while (true) {
    try {
      await main();
    } catch (error) {
      console.error("[render-images] Fatal:", error);
    }
    await new Promise((resolve) => setTimeout(resolve, 30_000));
  }
}

startLoop().catch((error) => {
  console.error("[render-images] Loop fatal:", error);
  process.exitCode = 1;
});

