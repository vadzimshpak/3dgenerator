import * as jose from "jose";
import { getJwtSecret } from "./constants";
import { JWT_EXPIRY_DAYS } from "./constants";

const PAYLOAD_USER_ID = "userId";

export function createToken(userId: number): Promise<string> {
  const secret = new TextEncoder().encode(getJwtSecret());
  return new jose.SignJWT({ [PAYLOAD_USER_ID]: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${JWT_EXPIRY_DAYS}d`)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<{ userId: number } | null> {
  try {
    const secret = new TextEncoder().encode(getJwtSecret());
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = payload[PAYLOAD_USER_ID];
    if (typeof userId !== "number") return null;
    return { userId };
  } catch {
    return null;
  }
}
