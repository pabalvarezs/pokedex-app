import crypto from "crypto";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 días
const DEV_SECRET = "dev-secret-pokedex-change-me";

let warnedAboutSecret = false;

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (!warnedAboutSecret) {
      console.warn(
        "[auth] AUTH_SECRET no está definido. Usando secreto de desarrollo; configura AUTH_SECRET en producción."
      );
      warnedAboutSecret = true;
    }
    return DEV_SECRET;
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export interface TokenPayload {
  sub: string;
  iat: number;
  exp: number;
}

export function createToken(username: string): string {
  const now = Date.now();
  const payload: TokenPayload = { sub: username, iat: now, exp: now + TOKEN_TTL_MS };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyToken(token: string): TokenPayload | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const provided = Buffer.from(signature);
  const valid = Buffer.from(expected);

  if (provided.length !== valid.length || !crypto.timingSafeEqual(provided, valid)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as TokenPayload;
    if (!payload.sub || typeof payload.exp !== "number" || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
