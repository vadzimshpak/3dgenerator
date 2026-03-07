"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { deleteSessionCookie } from "@/lib/session/cookies";

export async function logoutAction(): Promise<void> {
  await deleteSessionCookie();
  const locale = await getLocale();
  redirect({ href: "/", locale });
}
