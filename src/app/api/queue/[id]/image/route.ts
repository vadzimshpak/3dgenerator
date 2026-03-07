import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const order = await prisma.generateQueue.findFirst({
    where: { id: Number(id), userId: session.id },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new Response(Buffer.from(order.file), {
    headers: {
      "Content-Type": order.fileType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
