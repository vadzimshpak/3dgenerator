"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { register, createSession } from "@/lib/session";
import { setSessionCookie } from "@/lib/session/cookies";

export type RegisterState = { error?: string };

export async function registerAction(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const login = (formData.get("login") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";
  const passwordConfirm = (formData.get("passwordConfirm") as string) ?? "";

  const result = await register(login, password, passwordConfirm);
  if (!result.success) {
    return { error: result.error };
  }

  const token = await createSession(result.user.id);
  await setSessionCookie(token);
  const locale = await getLocale();
  redirect({ href: "/", locale });
  return { error: undefined };
}
