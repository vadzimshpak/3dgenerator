"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { authorize, createSession } from "@/lib/session";
import { setSessionCookie } from "@/lib/session/cookies";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const login = (formData.get("login") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";

  const result = await authorize(login, password);
  if (!result.success) {
    return { error: result.error };
  }

  const token = await createSession(result.user.id);
  await setSessionCookie(token);
  const locale = await getLocale();
  redirect({ href: "/", locale });
  return { error: undefined };
}
