export const SESSION_COOKIE_NAME = "session";
export const JWT_EXPIRY_DAYS = 7;

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}
