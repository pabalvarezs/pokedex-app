import { Request, Response } from "express";
import {
  DATA_CATEGORY_HANDLERS,
  DATA_CATEGORY_REFRESHERS,
  DATA_CENTER_CATEGORIES,
  getCatalogItem,
  getCategoryStatus as readCategoryStatus,
  getPokemonTypesByIds,
  isCatalogCategory,
  isDataCenterCategory,
  isPokemonDataType,
} from "../services/dataCenter";
import type {
  DataCenterRequestQuery,
  FilterMode,
} from "../services/dataCenterTypes";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
/** 18 tipos y 9 generaciones: no se acepta más de un catálogo completo por eje. */
const MAX_TYPES = 18;
const MAX_GENERATIONS = 9;

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

/** Acepta tanto `types=fire,water` como `types[]=fire&types[]=water`. */
function readValues(value: Request["query"][string]): string[] {
  if (typeof value === "string") return value.split(",");
  if (Array.isArray(value)) {
    return value.flatMap((item) =>
      typeof item === "string" ? item.split(",") : []
    );
  }
  return [];
}

function readMode(value: Request["query"][string]): FilterMode {
  return value === "exclude" ? "exclude" : "include";
}

function parseQuery(
  query: Request["query"],
  category: string
): DataCenterRequestQuery | ParseError {
  const rawLimit = Number(query.limit);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(Math.trunc(rawLimit), 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  const rawOffset = Number(query.offset);
  const offset = Number.isFinite(rawOffset)
    ? Math.max(Math.trunc(rawOffset), 0)
    : 0;
  const q = typeof query.q === "string" ? query.q.trim().slice(0, 80) : "";
  const rawGroup = typeof query.group === "string" ? query.group.trim().toLowerCase() : "";
  const group = rawGroup && /^[a-z-]{1,40}$/.test(rawGroup) ? rawGroup : null;

  // Los filtros de tipo/generación son exclusivos de Pokémon; los catálogos
  // usan `q` y `group`, así que no se validan contra el dominio de Pokémon.
  let type: string | null = null;
  let generation: number | null = null;
  let types: string[] | undefined;
  let generations: number[] | undefined;
  let typeMode: FilterMode = "include";
  let genMode: FilterMode = "include";
  if (category === "pokemon") {
    const rawType =
      typeof query.type === "string" ? query.type.trim().toLowerCase() : "";
    if (rawType && !isPokemonDataType(rawType)) {
      return { error: `Tipo de Pokémon inválido: ${rawType}` };
    }
    type = rawType || null;

    const rawGeneration =
      typeof query.generation === "string" ? query.generation.trim() : "";
    if (rawGeneration) {
      const parsed = Number(rawGeneration);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 9) {
        return { error: "Generación inválida (debe ser 1 a 9)" };
      }
      generation = parsed;
    }

    const rawTypes = readValues(query.types)
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
    for (const item of rawTypes) {
      if (!isPokemonDataType(item)) {
        return { error: `Tipo de Pokémon inválido: ${item}` };
      }
    }
    const uniqueTypes = Array.from(new Set(rawTypes)).slice(0, MAX_TYPES);
    if (uniqueTypes.length > 0) types = uniqueTypes;

    const parsedGenerations: number[] = [];
    for (const item of readValues(query.generations)) {
      const trimmed = item.trim();
      if (!trimmed) continue;
      const parsed = Number(trimmed);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 9) {
        return { error: "Generación inválida (debe ser 1 a 9)" };
      }
      parsedGenerations.push(parsed);
    }
    const uniqueGenerations = Array.from(new Set(parsedGenerations)).slice(
      0,
      MAX_GENERATIONS
    );
    if (uniqueGenerations.length > 0) generations = uniqueGenerations;

    typeMode = readMode(query.typeMode);
    genMode = readMode(query.genMode);
  }

  const includeVariants =
    query.variants === "true" || query.variants === "1";

  return {
    limit,
    offset,
    q,
    group,
    type,
    generation,
    includeVariants,
    ...(types ? { types } : {}),
    ...(generations ? { generations } : {}),
    ...(category === "pokemon" ? { typeMode, genMode } : {}),
  };
}

export async function getCategory(req: Request, res: Response) {
  const category = readCategory(req);
  if (!category || !isDataCenterCategory(category)) {
    rejectCategory(res);
    return;
  }

  const query = parseQuery(req.query, category);
  if ("error" in query) {
    res.status(400).json({ error: query.error });
    return;
  }

  res.json(await DATA_CATEGORY_HANDLERS[category](query));
}

/** Detalle bajo demanda de una entrada de catálogo (no se descargan todas). */
export async function getCatalogEntry(req: Request, res: Response) {
  const category = readCategory(req);
  if (!category || !isCatalogCategory(category)) {
    rejectCategory(res);
    return;
  }

  const group = req.params.group?.trim().toLowerCase() ?? "";
  const rawId = Number(req.params.id);
  if (!group || !Number.isInteger(rawId) || rawId <= 0) {
    res.status(400).json({ error: "Recurso o ID inválido" });
    return;
  }

  const item = await getCatalogItem(category, group, rawId);
  if (!item) {
    res.status(404).json({ error: "Recurso no encontrado" });
    return;
  }
  res.json(item);
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
