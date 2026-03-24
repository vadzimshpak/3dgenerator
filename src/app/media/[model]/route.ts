import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

type RouteParams = { params: Promise<{ model: string }> };

const MODELS_DIR = path.join(process.cwd(), "public", "model");
const IMAGES_DIR = path.join(process.cwd(), "public", "image");

type ResolvedTarget = {
  dir: string;
  filename: string;
  contentType: string;
};

function resolveTarget(raw: string): ResolvedTarget | null {
  if (!raw || raw.length > 200) return null;
  const decoded = decodeURIComponent(raw);
  if (decoded.includes("\0")) return null;
  if (decoded.includes("..")) return null;
  if (path.isAbsolute(decoded)) return null;

  const base = path.basename(decoded);
  if (!base) return null;

  const lower = base.toLowerCase();

  // Если явно запросили jpeg/jpg -> ищем в public/image
  if (lower.endsWith(".jpeg") || lower.endsWith(".jpg")) {
    const normalized = lower.endsWith(".jpeg")
      ? `${base.slice(0, -5)}.jpg`
      : base;
    return {
      dir: IMAGES_DIR,
      filename: normalized,
      contentType: "image/jpeg",
    };
  }

  // По умолчанию: GLB в public/model
  const glbName = lower.endsWith(".glb") ? base : `${base}.glb`;
  return {
    dir: MODELS_DIR,
    filename: glbName,
    contentType: "model/gltf-binary",
  };
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { model } = await params;
  const target = resolveTarget(model);
  if (!target) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const filePath = path.join(target.dir, target.filename);

  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const file = await fs.readFile(filePath);
    return new Response(file, {
      headers: {
        "Content-Type": target.contentType,
        "Cache-Control": "public, max-age=86400, immutable",
        "Content-Length": String(file.byteLength),
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

