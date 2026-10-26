import { NextFunction, Request, Response } from "express";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const status =
    typeof err === "object" && err !== null && "status" in err && typeof err.status === "number"
      ? err.status
      : 500;

  if (status >= 500) {
    console.error("[api]", err);
  }

  const message =
    status >= 500
      ? "Error interno del servidor"
      : err instanceof Error
        ? err.message
        : "Solicitud inválida";

  res.status(status).json({ error: message });
}
