import { Request, Response } from "express";
import { createToken } from "../services/auth";
import { verifyPassword } from "../services/password";
import { findByUsername, toPublicUser } from "../services/users";
import {
  requestPasswordReset as requestPasswordResetService,
  resetPasswordWithToken,
} from "../services/passwordReset";

const RESET_GENERIC_MESSAGE =
  "Si el usuario existe, te enviamos las instrucciones para restablecer tu contraseña.";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const recentRequests = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = recentRequests.get(key);

  if (!entry || entry.resetAt <= now) {
    recentRequests.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

/** Evita que el mapa crezca sin control en procesos de larga vida. */
function cleanupRateLimitStore() {
  if (recentRequests.size < 1000) return;
  const now = Date.now();
  for (const [key, entry] of recentRequests) {
    if (entry.resetAt <= now) recentRequests.delete(key);
  }
}

function rateLimitKey(req: Request, username: string): string {
  const ip = req.ip ?? req.socket.remoteAddress ?? "desconocida";
  return `${ip}:${username}`;
}

export async function login(req: Request, res: Response) {
  const { username, password } = req.body || {};

  if (!username || !password) {
    res.status(400).json({
      success: false,
      error: "Debes ingresar tu usuario y contraseña.",
    });
    return;
  }

  const cleanUser = String(username).trim().toLowerCase();
  const cleanPass = String(password).trim();

  const user = await findByUsername(cleanUser);
  if (!user || !verifyPassword(cleanPass, user.passwordHash)) {
    res.status(401).json({
      success: false,
      error: "Usuario o contraseña incorrectos.",
    });
    return;
  }

  const publicUser = toPublicUser(user);

  res.json({
    success: true,
    message: "¡Bienvenido a PokeChile!",
    user: {
      id: publicUser.id,
      username: publicUser.username,
      name: publicUser.name,
      role: publicUser.role,
      avatar: publicUser.avatar,
    },
    token: createToken(publicUser.username),
  });
}

/**
 * Solicita un enlace de recuperación. Responde siempre lo mismo para no
 * filtrar qué usuarios existen (enumeración de cuentas).
 */
export async function forgotPassword(req: Request, res: Response) {
  const username = String(req.body?.username ?? "").trim().toLowerCase();

  if (!username) {
    res.status(400).json({
      success: false,
      error: "Ingresa tu nombre de usuario.",
    });
    return;
  }

  cleanupRateLimitStore();

  if (isRateLimited(rateLimitKey(req, username))) {
    res.status(429).json({
      success: false,
      error: "Hiciste demasiadas solicitudes. Inténtalo de nuevo en unos minutos.",
    });
    return;
  }

  const { reset } = await requestPasswordResetService(username);

  const payload: {
    success: true;
    message: string;
    devResetUrl?: string;
  } = {
    success: true,
    message: RESET_GENERIC_MESSAGE,
  };

  // Solo en desarrollo: permite probar el flujo sin proveedor de correo.
  if (reset && process.env.NODE_ENV !== "production") {
    payload.devResetUrl = reset.url;
  }

  res.json(payload);
}

export async function resetPassword(req: Request, res: Response) {
  const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!token) {
    res.status(400).json({
      success: false,
      error: "El enlace de recuperación no es válido.",
    });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({
      success: false,
      error: "La contraseña debe tener al menos 6 caracteres.",
    });
    return;
  }

  const result = await resetPasswordWithToken(token, password);

  if (!result.ok) {
    const message =
      result.reason === "expired"
        ? "El enlace venció. Solicita uno nuevo para continuar."
        : "El enlace ya se usó o no es válido. Solicita uno nuevo.";
    res.status(400).json({ success: false, error: message });
    return;
  }

  res.json({
    success: true,
    message: "Tu contraseña se actualizó. Ya puedes iniciar sesión.",
  });
}
