import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/auth";
import { findByUsername } from "../services/users";

function getToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  return header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : undefined;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = getToken(req);
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    res.status(401).json({ error: "Debes iniciar sesión para acceder a tus favoritos" });
    return;
  }

  req.userId = payload.sub;
  next();
}

/**
 * Exige un token válido y rol de administrador. El rol se consulta en la
 * base de datos en cada petición, así que un cambio de permisos aplica
 * de inmediato y no depende de datos del cliente.
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = getToken(req);
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    res.status(401).json({ error: "Debes iniciar sesión como administrador." });
    return;
  }

  let user;
  try {
    user = await findByUsername(payload.sub);
  } catch (error) {
    next(error);
    return;
  }

  if (!user) {
    res.status(401).json({ error: "La cuenta ya no existe." });
    return;
  }

  if (user.role !== "admin") {
    res.status(403).json({ error: "No tienes permisos de administrador." });
    return;
  }

  req.userId = user.username;
  next();
}
