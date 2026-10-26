import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/auth";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : undefined;
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    res.status(401).json({ error: "Debes iniciar sesión para acceder a tus favoritos" });
    return;
  }

  req.userId = payload.sub;
  next();
}
