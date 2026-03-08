import { Client, handle_file } from "@gradio/client";
import { mkdir, rename, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "../src/lib/db";

const MODELS_DIR = path.join(process.cwd(), "public", "model");

const debug = (msg: string, ...args: unknown[]) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [gradio] ${msg}`, ...args);
};

async function saveResultToModelFile(src: string, destPath: string): Promise<void> {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    debug("Fetching result from URL", src);
    const res = await fetch(src);
    if (!res.ok) throw new Error(`Failed to fetch result: ${res.statusText}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    await writeFile(destPath, buffer);
    debug("Saved result to", destPath, "bytes:", buffer.length);
  } else {
    debug("Renaming local result", src, "->", destPath);
    await rename(src, destPath);
  }
}

async function processTask(
  client: Client,
  task: { id: number; file: Buffer | Uint8Array; fileType: string }
): Promise<void> {
  debug("Processing task", task.id, "file size:", task.file.length, "type:", task.fileType);
  const imageBlob = handle_file(Buffer.from(task.file));
  debug("Submitting task", task.id, "to Gradio /shape_generation");
  const job = client.submit(
    "/shape_generation",
    {
      image: handle_file("input.png"),
      mv_image_front: null,
      mv_image_back: null,
      mv_image_left: null,
      mv_image_right: null,
      steps: 30,
      guidance_scale: 5,
      seed: 1234,
      octree_resolution: 256,
      check_box_rembg: true,
      num_chunks: 8000,
      randomize_seed: true
    },
    { timeout: 1000 * 60 * 3 }
  );

  let error = "";
  for await (const msg of job) {
    debug("Job message", msg);
    if (msg.type === "data") {
      const data = msg.data as { path?: string }[];
      const src = data[0]?.path;
      if (!src) {
        error = "No result path in response";
        continue;
      }

      debug("Result path received", src);
      const destPath = path.join(MODELS_DIR, `${task.id}.glb`);
      await saveResultToModelFile(src, destPath);
      await prisma.generateQueue.update({
        where: { id: task.id },
        data: { status: 2, resultFileUrl: `/model/${task.id}.glb`, error: null },
      });
      debug("Task", task.id, "done, resultFileUrl:", `/model/${task.id}.glb`);
      return;
    }
  }

  if (error) {
    throw new Error(error);
  }
}

async function main() {
  debug("Starting, MODELS_DIR:", MODELS_DIR);
  await mkdir(MODELS_DIR, { recursive: true });
  debug("Connecting to Gradio tencent/Hunyuan3D-2.1");
  const client = await Client.connect("tencent/Hunyuan3D-2.1");
  debug("Connected");

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
      await processTask(client, task);
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
