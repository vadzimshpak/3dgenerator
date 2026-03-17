import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "../src/lib/db";

const MODELS_DIR = path.join(process.cwd(), "public", "model");
const GENERATE_URL = "http://91.150.160.38:13703/generate";
const DEFAULT_SEED = 324324;

const debug = (msg: string, ...args: unknown[]) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [generator] ${msg}`, ...args);
};

async function processTask(task: {
  id: number;
  file: Buffer | Uint8Array;
  fileType: string;
  userId: number;
}) {
  debug("Processing task", task.id, "file size:", task.file.length, "type:", task.fileType);

  const imageB64 = Buffer.from(task.file).toString("base64");
  debug("Encoded image to base64", "chars:", imageB64.length);

  const payload = {
    image: imageB64,
    seed: DEFAULT_SEED,
  };

  debug("POST", GENERATE_URL, "task:", task.id);
  const res = await fetch(GENERATE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Generate failed (${res.status}): ${text || res.statusText}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  debug("Received GLB bytes:", buffer.length);

  const destPath = path.join(MODELS_DIR, `${task.id}.glb`);
  await writeFile(destPath, buffer);
  debug("Saved model to", destPath);

  const fileUrl = `/model/${task.id}.glb`;

  await prisma.$transaction(async (tx) => {
    await tx.generateQueue.update({
      where: { id: task.id },
      data: { status: 2, resultFileUrl: fileUrl, error: null },
    });

    const exists = await tx.generatedModel.findFirst({
      where: { fileUrl, userId: task.userId },
      select: { id: true },
    });
    if (!exists) {
      await tx.generatedModel.create({
        data: {
          name: `Model #${task.id}`,
          fileUrl,
          userId: task.userId,
        },
      });
    }
  });

  debug("Task", task.id, "done, resultFileUrl:", fileUrl);
}

async function main() {
  debug("Starting, MODELS_DIR:", MODELS_DIR);
  await mkdir(MODELS_DIR, { recursive: true });
  debug("Using generator HTTP endpoint", GENERATE_URL);

  const pending = await prisma.generateQueue.findMany({
    where: { status: 0 },
    orderBy: { createdAt: "asc" },
  });
  debug("Pending tasks:", pending.length, pending.map((t) => t.id));

  for (const task of pending) {
    debug("Taking task", task.id, "setting status 1");
    await prisma.generateQueue.update({
      where: { id: task.id },
      data: { status: 1 },
    });
    try {
      await processTask(task);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`[gradio] Task ${task.id} failed:`, err);
      debug("Setting task", task.id, "status 2 with error");
      await prisma.generateQueue.update({
        where: { id: task.id },
        data: { status: 2, error: errorMessage.slice(0, 2000) },
      });
    }
  }
  debug("Finished, processed", pending.length, "tasks");
}

(async () => {
  while (true) {
    await main();
    await new Promise(resolve => setTimeout(resolve, 1000 * 30));
  }
})()
