import { Request, Response } from "express";
import {
  DATA_CATEGORY_HANDLERS,
  DATA_CATEGORY_REFRESHERS,
  DATA_CENTER_CATEGORIES,
  getCategoryStatus as readCategoryStatus,
  getPokemonTypesByIds,
  isDataCenterCategory,
  isPokemonDataType,
} from "../services/dataCenter";
import type { DataCenterQuery } from "../services/dataCenterTypes";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

interface ParseError {
  error: string;
}

function readCategory(req: Request): string | null {
  const category = req.params.category?.trim().toLowerCase() ?? "";
  return category || null;
}

function rejectCategory(res: Response): void {
  res.status(404).json({
    error: "Categoría del Centro de Datos no encontrada",
    categories: DATA_CENTER_CATEGORIES,
  });
}

function parseQuery(query: Request["query"]): DataCenterQuery | ParseError {
  const rawLimit = Number(query.limit);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(Math.trunc(rawLimit), 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  const rawType =
    typeof query.type === "string" ? query.type.trim().toLowerCase() : "";
  if (rawType && !isPokemonDataType(rawType)) {
    return { error: `Tipo de Pokémon inválido: ${rawType}` };
  }

  let generation: number | null = null;
  const rawGeneration =
    typeof query.generation === "string" ? query.generation.trim() : "";
  if (rawGeneration) {
    const parsed = Number(rawGeneration);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 9) {
      return { error: "Generación inválida (debe ser 1 a 9)" };
    }
    generation = parsed;
  }

  const includeVariants =
    query.variants === "true" || query.variants === "1";

  return {
    limit,
    type: rawType || null,
    generation,
    includeVariants,
  };
}

export async function getCategory(req: Request, res: Response) {
  const category = readCategory(req);
  if (!category || !isDataCenterCategory(category)) {
    rejectCategory(res);
    return;
  }

  const query = parseQuery(req.query);
  if ("error" in query) {
    res.status(400).json({ error: query.error });
    return;
  }

  res.json(await DATA_CATEGORY_HANDLERS[category](query));
}

export async function getCategoryStatus(req: Request, res: Response) {
  const category = readCategory(req);
  if (!category || !isDataCenterCategory(category)) {
    rejectCategory(res);
    return;
  }

  res.json(await readCategoryStatus(category));
}

export async function refreshCategory(req: Request, res: Response) {
  const category = readCategory(req);
  if (!category || !isDataCenterCategory(category)) {
    rejectCategory(res);
    return;
  }

  // La reconstrucción ocurre en segundo plano: el cliente consulta /status.
  res.status(202).json(await DATA_CATEGORY_REFRESHERS[category]());
}

export async function getPokemonTypes(req: Request, res: Response) {
  const raw = typeof req.query.ids === "string" ? req.query.ids : "";
  if (!raw.trim()) {
    res.status(400).json({ error: "Debes indicar al menos un ID" });
    return;
  }

  const ids = Array.from(
    new Set(
      raw
        .split(",")
        .map((part) => Number(part.trim()))
        .filter((id) => Number.isInteger(id) && id > 0)
    )
  ).slice(0, 500);

  if (ids.length === 0) {
    res.status(400).json({ error: "IDs inválidos" });
    return;
  }

  res.json({ typesById: await getPokemonTypesByIds(ids) });
}
