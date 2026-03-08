"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export type GenerateState = { error?: string };

export async function generateAction(
  _prev: GenerateState,
  formData: FormData
): Promise<GenerateState> {
  const session = await getSession();
  if (!session) {
    const locale = await getLocale();
    redirect({ href: "/login", locale });
    return { error: "" };
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File) || file.size === 0) {
    return { error: "errorNoFile" };
  }

  if (!file.type.startsWith("image/")) {
    return { error: "errorNotImage" };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { error: "errorFileTooLarge" };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const created = await prisma.generateQueue.create({
    data: {
      file: buffer,
      fileType: file.type,
      userId: session.id,
    },
  });

  const locale = await getLocale();
  redirect({ href: `/queue/${created.id}`, locale });
  return { error: undefined };
}
