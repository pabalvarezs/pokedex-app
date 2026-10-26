import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import * as favoritesService from "../services/favorites";

function getUserId(req: Request): string {
  if (!req.userId) throw new Error("Usuario no autenticado");
  return req.userId;
}

function parsePokemonId(value: unknown): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function listFavorites(req: Request, res: Response) {
  const favorites = await favoritesService.listFavorites(getUserId(req));
  res.json(favorites);
}

export async function addFavorite(req: Request, res: Response) {
  const body = req.body as { pokemonId?: unknown; name?: unknown } | undefined;
  const pokemonId = parsePokemonId(body?.pokemonId);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!pokemonId || !name || name.length > 100) {
    res.status(400).json({ error: "pokemonId y name válidos son requeridos" });
    return;
  }

  try {
    const favorite = await favoritesService.addFavorite({
      pokemonId,
      name,
      userId: getUserId(req),
    });
    res.status(201).json(favorite);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      res.status(409).json({ error: "Ya es un regalón" });
      return;
    }
    throw err;
  }
}

export async function removeFavorite(req: Request, res: Response) {
  const pokemonId = parsePokemonId(req.params.pokemonId);
  if (!pokemonId) {
    res.status(400).json({ error: "ID de Pokémon inválido" });
    return;
  }

  await favoritesService.removeFavorite(pokemonId, getUserId(req));
  res.status(204).send();
}

export async function checkFavorite(req: Request, res: Response) {
  const pokemonId = parsePokemonId(req.params.pokemonId);
  if (!pokemonId) {
    res.status(400).json({ error: "ID de Pokémon inválido" });
    return;
  }

  const favorite = await favoritesService.isFavorite(pokemonId, getUserId(req));
  res.json({ favorite });
}
