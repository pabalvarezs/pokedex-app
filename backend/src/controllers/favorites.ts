import { Request, Response } from "express";
import * as favoritesService from "../services/favorites";

function getUserId(req: Request): string {
  const fromHeader = req.headers["x-user-id"];
  const fromQuery = req.query.userId;
  if (typeof fromHeader === "string" && fromHeader.trim()) return fromHeader.trim();
  if (typeof fromQuery === "string" && fromQuery.trim()) return fromQuery.trim();
  return "guest";
}

export async function listFavorites(req: Request, res: Response) {
  const userId = getUserId(req);
  const favorites = await favoritesService.listFavorites(userId);
  res.json(favorites);
}

export async function addFavorite(req: Request, res: Response) {
  const { pokemonId, name } = req.body as { pokemonId: number; name: string };
  if (!pokemonId || !name) {
    res.status(400).json({ error: "pokemonId and name son requeridos" });
    return;
  }
  const userId = getUserId(req);
  try {
    const favorite = await favoritesService.addFavorite({ pokemonId, name, userId });
    res.status(201).json(favorite);
  } catch {
    res.status(409).json({ error: "Ya es un regalón" });
  }
}

export async function removeFavorite(req: Request, res: Response) {
  const pokemonId = Number(req.params.pokemonId);
  const userId = getUserId(req);
  try {
    await favoritesService.removeFavorite(pokemonId, userId);
  } catch {}
  res.status(204).send();
}

export async function checkFavorite(req: Request, res: Response) {
  const pokemonId = Number(req.params.pokemonId);
  const userId = getUserId(req);
  const fav = await favoritesService.isFavorite(pokemonId, userId);
  res.json({ favorite: fav });
}
