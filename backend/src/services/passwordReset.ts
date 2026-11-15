import crypto from "crypto";
import { prisma } from "./prisma";
import { hashPassword } from "./password";
import { sendPasswordResetEmail } from "./email";

const DEFAULT_TTL_MINUTES = 30;

export type PasswordResetSource = "self" | "admin";

export interface CreatedPasswordReset {
  token: string;
  url: string;
  expiresAt: Date;
}

export type ResetPasswordFailure = "invalid" | "expired" | "used";

export function getResetTtlMs(): number {
  const raw = Number(process.env.PASSWORD_RESET_TTL_MINUTES);
  const minutes = Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : DEFAULT_TTL_MINUTES;
  return minutes * 60 * 1000;
}

/** Los tokens se guardan hasheados: si filtran la base, no sirven para entrar. */
export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * URL pública del frontend, usada para construir el enlace del correo.
 * `APP_URL` manda; si no existe, se usa el origen de CORS.
 */
export function getAppUrl(): string {
  const explicit = process.env.APP_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const cors = process.env.CORS_ORIGIN?.split(",")[0]?.trim();
  if (cors && cors !== "*") return cors.replace(/\/+$/, "");

  return "http://localhost:5173";
}

export function buildResetUrl(token: string): string {
  return `${getAppUrl()}/restablecer/${token}`;
}

/**
 * Crea un token nuevo e invalida los anteriores del mismo usuario.
 * Se guarda solo el hash, así que el token en claro existe únicamente
 * en la respuesta interna (correo o panel de admin).
 */
export async function createPasswordReset(
  userId: number,
  source: PasswordResetSource = "self"
): Promise<CreatedPasswordReset> {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + getResetTtlMs());

  await prisma.$transaction([
    prisma.passwordReset.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.passwordReset.create({
      data: {
        userId,
        tokenHash: hashResetToken(token),
        source,
        expiresAt,
      },
    }),
  ]);

  return { token, url: buildResetUrl(token), expiresAt };
}

export interface RequestPasswordResetResult {
  reset: CreatedPasswordReset | null;
  emailSent: boolean;
}

/**
 * Punto de entrada público. No revela si el usuario existe: quien llama
 * debe responder siempre el mismo mensaje genérico.
 */
export async function requestPasswordReset(username: string): Promise<RequestPasswordResetResult> {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return { reset: null, emailSent: false };

  const reset = await createPasswordReset(user.id, "self");
  const emailSent = user.email
    ? await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        url: reset.url,
        expiresAt: reset.expiresAt,
      })
    : false;

  return { reset, emailSent };
}

/**
 * Consume el token y cambia la contraseña en una sola transacción.
 * El `updateMany` condicionado evita que dos peticiones simultáneas
 * reutilicen el mismo enlace.
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ ok: true; username: string } | { ok: false; reason: ResetPasswordFailure }> {
  const record = await prisma.passwordReset.findUnique({
    where: { tokenHash: hashResetToken(token) },
    include: { user: { select: { id: true, username: true } } },
  });

  if (!record) return { ok: false, reason: "invalid" };
  if (record.usedAt) return { ok: false, reason: "used" };
  if (record.expiresAt.getTime() <= Date.now()) return { ok: false, reason: "expired" };

  const now = new Date();
  const passwordHash = hashPassword(newPassword);

  const applied = await prisma.$transaction(async (tx) => {
    const claimed = await tx.passwordReset.updateMany({
      where: { id: record.id, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    });
    if (claimed.count === 0) return false;

    await tx.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });
    return true;
  });

  if (!applied) return { ok: false, reason: "used" };
  return { ok: true, username: record.user.username };
}

export interface PendingPasswordReset {
  id: number;
  userId: number;
  username: string;
  name: string;
  email: string | null;
  source: string;
  createdAt: Date;
  expiresAt: Date;
}

/** Solicitudes vigentes que un admin puede resolver desde el panel. */
export async function listPendingPasswordResets(): Promise<PendingPasswordReset[]> {
  const resets = await prisma.passwordReset.findMany({
    where: { usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { id: true, username: true, name: true, email: true } },
    },
  });

  return resets.map((reset) => ({
    id: reset.id,
    userId: reset.userId,
    username: reset.user.username,
    name: reset.user.name,
    email: reset.user.email,
    source: reset.source,
    createdAt: reset.createdAt,
    expiresAt: reset.expiresAt,
  }));
}
