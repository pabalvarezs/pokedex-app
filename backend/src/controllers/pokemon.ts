import { Request, Response } from "express";
import * as pokemonService from "../services/pokemon";

export async function listPokemon(req: Request, res: Response) {
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;
  try {
    const pokemon = await pokemonService.listPokemon(limit, offset);
    res.json({ pokemon, limit, offset });
  } catch (err: any) {
    res.status(500).json({ error: "Error al obtener la lista de Pokémon" });
  }
}

export async function listPokemonByType(req: Request, res: Response) {
  const { type } = req.params;
  try {
    const pokemon = await pokemonService.listPokemonByType(type);
    res.json({ pokemon, total: pokemon.length, type });
  } catch (err: any) {
    res.status(404).json({ error: "Tipo de Pokémon no encontrado" });
  }
}

export async function listPokemonByGeneration(req: Request, res: Response) {
  const gen = Number(req.params.gen);
  if (!gen || gen < 1 || gen > 9) {
    res.status(400).json({ error: "Generación inválida (debe ser 1 a 9)" });
    return;
  }
  try {
    const pokemon = await pokemonService.listPokemonByGeneration(gen);
    res.json({ pokemon, total: pokemon.length, generation: gen });
  } catch (err: any) {
    res.status(404).json({ error: "Generación no encontrada" });
  }
}

export async function searchPokemon(req: Request, res: Response) {
  const { name } = req.params;
  try {
    const data = await pokemonService.searchPokemon(name);
    res.json(data);
  } catch {
    res.status(404).json({ error: "Pokémon no encontrado" });
  }
}

export async function getPokemonById(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }
  try {
    const data = await pokemonService.getPokemonById(id);
    res.json(data);
  } catch {
    res.status(404).json({ error: "Pokémon no encontrado" });
  }
}
