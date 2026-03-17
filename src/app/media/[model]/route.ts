import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

type RouteParams = { params: Promise<{ model: string }> };

const MODELS_DIR = path.join(process.cwd(), "public", "model");

function resolveModelFilename(raw: string): string | null {
  if (!raw || raw.length > 200) return null;
  const decoded = decodeURIComponent(raw);
  if (decoded.includes("\0")) return null;
  if (decoded.includes("..")) return null;
  if (path.isAbsolute(decoded)) return null;

  const base = path.basename(decoded);
  if (!base) return null;

  // allow "123" or "123.glb"
  if (base.toLowerCase().endsWith(".glb")) return base;
  return `${base}.glb`;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { model } = await params;
  const filename = resolveModelFilename(model);
  if (!filename) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const filePath = path.join(MODELS_DIR, filename);

  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const file = await fs.readFile(filePath);
    return new Response(file, {
      headers: {
        "Content-Type": "model/gltf-binary",
        "Cache-Control": "public, max-age=86400, immutable",
        "Content-Length": String(file.byteLength),
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

