import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEY_LENGTH = 64;

/**
 * Hashea una contraseña con scrypt (incluido en Node, sin dependencias extra).
 * Formato: scrypt:<salt hex>:<hash hex>
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, salt, hash] = stored.split(":");
    if (scheme !== "scrypt" || !salt || !hash) return false;

    const storedBuffer = Buffer.from(hash, "hex");
    const candidate = scryptSync(password, salt, storedBuffer.length);
    if (candidate.length !== storedBuffer.length) return false;
    return timingSafeEqual(candidate, storedBuffer);
  } catch {
    return false;
  }
}
