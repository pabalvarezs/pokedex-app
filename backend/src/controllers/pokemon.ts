import { Request, Response } from "express";
import * as pokemonService from "../services/pokemon";

export async function listPokemon(req: Request, res: Response) {
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;
  const pokemon = await pokemonService.listPokemon(limit, offset);
  res.json({ pokemon, limit, offset });
}

export async function searchPokemon(req: Request, res: Response) {
  const { name } = req.params;
  try {
    const data = await pokemonService.searchPokemon(name);
    res.json(data);
  } catch {
    res.status(404).json({ error: "Pokémon not found" });
  }
}

export async function getPokemonById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const data = await pokemonService.getPokemonById(id);
  res.json(data);
}
