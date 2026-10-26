import { Request, Response } from "express";
import axios from "axios";
import * as pokemonService from "../services/pokemon";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 1000;

function parsePagination(query: Request["query"]) {
  const rawLimit = Number(query.limit);
  const rawOffset = Number(query.offset);

  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(Math.trunc(rawLimit), 1), MAX_LIMIT)
    : DEFAULT_LIMIT;
  const offset = Number.isFinite(rawOffset) ? Math.max(Math.trunc(rawOffset), 0) : 0;

  return { limit, offset };
}

function isNotFound(err: unknown) {
  return axios.isAxiosError(err) && err.response?.status === 404;
}

export async function listPokemon(req: Request, res: Response) {
  const { limit, offset } = parsePagination(req.query);
  const result = await pokemonService.listPokemon(limit, offset);
  res.json({ pokemon: result.pokemon, total: result.total, limit, offset });
}

export async function listPokemonByType(req: Request, res: Response) {
  const type = req.params.type?.trim().toLowerCase() ?? "";
  if (!type || !/^[a-z-]+$/.test(type)) {
    res.status(400).json({ error: "Tipo de Pokémon inválido" });
    return;
  }

  try {
    const pokemon = await pokemonService.listPokemonByType(type);
    res.json({ pokemon, total: pokemon.length, type });
  } catch (err) {
    if (isNotFound(err)) {
      res.status(404).json({ error: "Tipo de Pokémon no encontrado" });
      return;
    }
    throw err;
  }
}

export async function listPokemonByGeneration(req: Request, res: Response) {
  const gen = Number(req.params.gen);
  if (!Number.isInteger(gen) || gen < 1 || gen > 9) {
    res.status(400).json({ error: "Generación inválida (debe ser 1 a 9)" });
    return;
  }

  try {
    const pokemon = await pokemonService.listPokemonByGeneration(gen);
    res.json({ pokemon, total: pokemon.length, generation: gen });
  } catch (err) {
    if (isNotFound(err)) {
      res.status(404).json({ error: "Generación no encontrada" });
      return;
    }
    throw err;
  }
}

export async function searchPokemon(req: Request, res: Response) {
  const name = req.params.name?.trim() ?? "";
  if (!name) {
    res.status(400).json({ error: "Nombre de Pokémon inválido" });
    return;
  }

  try {
    const data = await pokemonService.searchPokemon(name);
    res.json(data);
  } catch (err) {
    if (isNotFound(err)) {
      res.status(404).json({ error: "Pokémon no encontrado" });
      return;
    }
    throw err;
  }
}

export async function getPokemonById(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }

  try {
    const data = await pokemonService.getPokemonById(id);
    res.json(data);
  } catch (err) {
    if (isNotFound(err)) {
      res.status(404).json({ error: "Pokémon no encontrado" });
      return;
    }
    throw err;
  }
}
