import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "errorNoFile" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "errorNotImage" }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json({ error: "errorFileTooLarge" }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const created = await prisma.generateQueue.create({
    data: {
      file: buffer,
      fileType: file.type,
      userId: session.id,
    },
  });

  return NextResponse.json({ id: created.id });
}

