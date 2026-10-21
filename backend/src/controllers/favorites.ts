import { Request, Response } from "express";
import * as favoritesService from "../services/favorites";

export async function listFavorites(_req: Request, res: Response) {
  const favorites = await favoritesService.listFavorites();
  res.json(favorites);
}

export async function addFavorite(req: Request, res: Response) {
  const { pokemonId, name } = req.body as { pokemonId: number; name: string };
  if (!pokemonId || !name) {
    res.status(400).json({ error: "pokemonId and name are required" });
    return;
  }
  try {
    const favorite = await favoritesService.addFavorite({ pokemonId, name });
    res.status(201).json(favorite);
  } catch {
    res.status(409).json({ error: "Already a favorite" });
  }
}

export async function removeFavorite(req: Request, res: Response) {
  const pokemonId = Number(req.params.pokemonId);
  await favoritesService.removeFavorite(pokemonId);
  res.status(204).send();
}

export async function checkFavorite(req: Request, res: Response) {
  const pokemonId = Number(req.params.pokemonId);
  const fav = await favoritesService.isFavorite(pokemonId);
  res.json({ favorite: fav });
}
