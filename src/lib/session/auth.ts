import { hash, compare } from "bcryptjs";
import { prisma } from "@/lib/db";
import { createToken, verifyToken } from "./token";
import { getSessionCookie } from "./cookies";

export type SessionUser = {
  id: number;
  login: string;
  createdAt: Date;
};

export type AuthResult = { success: true; user: SessionUser } | { success: false; error: string };

const SALT_ROUNDS = 10;

export async function createSession(userId: number): Promise<string> {
  return createToken(userId);
}

export async function register(
  login: string,
  password: string,
  passwordConfirm: string
): Promise<AuthResult> {
  const trimmedLogin = login.trim();
  if (!trimmedLogin) {
    return { success: false, error: "auth.errorLoginRequiredRegister" };
  }
  if (!password) {
    return { success: false, error: "auth.errorPasswordRequired" };
  }
  if (password !== passwordConfirm) {
    return { success: false, error: "auth.errorPasswordsDontMatch" };
  }

  const existing = await prisma.user.findUnique({
    where: { login: trimmedLogin },
  });
  if (existing) {
    return { success: false, error: "auth.errorLoginExists" };
  }

  const hashedPassword = await hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      login: trimmedLogin,
      password: hashedPassword,
    },
  });

  return {
    success: true,
    user: { id: user.id, login: user.login, createdAt: user.createdAt },
  };
}

export async function authorize(login: string, password: string): Promise<AuthResult> {
  const trimmedLogin = login.trim();
  if (!trimmedLogin || !password) {
    return { success: false, error: "auth.errorLoginRequired" };
  }

  const user = await prisma.user.findUnique({
    where: { login: trimmedLogin },
  });
  if (!user) {
    return { success: false, error: "auth.errorInvalidCredentials" };
  }

  const valid = await compare(password, user.password);
  if (!valid) {
    return { success: false, error: "auth.errorInvalidCredentials" };
  }

  return {
    success: true,
    user: { id: user.id, login: user.login, createdAt: user.createdAt },
  };
}

export async function getSession(): Promise<SessionUser | null> {
  const token = await getSessionCookie();
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, login: true, createdAt: true },
  });

  return user;
}
