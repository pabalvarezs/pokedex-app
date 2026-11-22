import { api, mapWithConcurrency } from "./pokemon";
import { buildPokemonAnalytics, isPokemonDataType } from "./dataCenterStats";
import {
  STAT_KEYS,
  type DataCenterDataset,
  type DataCenterEntry,
  type DataCenterQuery,
  type StatKey,
} from "./dataCenterTypes";

/**
 * Dataset del Centro de Datos. Se construye una sola vez desde PokéAPI y se
 * conserva en memoria 24 h. La primera visita paga la descarga; las siguientes
 * reutilizan el snapshot. Al expirar se sirve el snapshot anterior mientras se
 * reconstruye en segundo plano (stale-while-revalidate), así ningún usuario
 * espera por la actualización. Las peticiones concurrentes se deduplican.
 */
const DATASET_TTL_MS = 24 * 60 * 60 * 1000;
const DATA_CONCURRENCY = 10;

interface RawStatSlot {
  base_stat: number;
  stat: { name: string };
}

interface RawTypeSlot {
  type: { name: string };
}

interface RawSprites {
  front_default?: string | null;
  other?: {
    "official-artwork"?: { front_default?: string | null };
  };
}

interface RawPokemon {
  id: number;
  name: string;
  species?: { name: string; url: string };
  types: RawTypeSlot[];
  sprites?: RawSprites;
  height: number;
  weight: number;
  stats?: RawStatSlot[];
}

interface RawSpeciesVariety {
  is_default?: boolean;
  pokemon?: { name?: string };
}

interface RawSpecies {
  varieties?: RawSpeciesVariety[];
  generation?: { url?: string };
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

let datasetCache: CacheEntry<DataCenterDataset> | null = null;
let datasetRequest: Promise<DataCenterDataset> | null = null;

function idFromUrl(url?: string): number | undefined {
  const raw = url?.split("/").filter(Boolean).pop();
  if (!raw) return undefined;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

function readStats(slots: RawStatSlot[] | undefined): Record<StatKey, number> {
  const stats: Record<StatKey, number> = {
    hp: 0,
    attack: 0,
    defense: 0,
    "special-attack": 0,
    "special-defense": 0,
    speed: 0,
  };

  for (const slot of slots ?? []) {
    switch (slot.stat.name) {
      case "hp":
        stats.hp = slot.base_stat;
        break;
      case "attack":
        stats.attack = slot.base_stat;
        break;
      case "defense":
        stats.defense = slot.base_stat;
        break;
      case "special-attack":
        stats["special-attack"] = slot.base_stat;
        break;
      case "special-defense":
        stats["special-defense"] = slot.base_stat;
        break;
      case "speed":
        stats.speed = slot.base_stat;
        break;
    }
  }

  return stats;
}

function buildEntry(raw: RawPokemon, species: RawSpecies): DataCenterEntry | null {
  const speciesId = idFromUrl(raw.species?.url);
  if (speciesId === undefined) return null;

  const isDefault = species.varieties?.some(
    (variety) => variety.pokemon?.name === raw.name && variety.is_default === true
  );
  const stats = readStats(raw.stats);
  const total = STAT_KEYS.reduce((sum, key) => sum + stats[key], 0);
  const artwork = raw.sprites?.other?.["official-artwork"]?.front_default ?? undefined;
  const sprite = raw.sprites?.front_default ?? undefined;

  return {
    id: raw.id,
    name: raw.name,
    speciesId,
    ...(sprite ? { sprite } : {}),
    ...(artwork ? { artwork } : {}),
    types: raw.types.map((slot) => slot.type.name),
    generation: idFromUrl(species.generation?.url) ?? 1,
    isDefault: isDefault ?? raw.id === speciesId,
    height: raw.height,
    weight: raw.weight,
    stats,
    total,
  };
}

async function fetchDataset(): Promise<DataCenterDataset> {
  // Un solo listado para conocer todos los IDs (forma por defecto y variantes).
  const { data: list } = await api.get<{
    results: { name: string; url: string }[];
  }>("/pokemon", { params: { limit: 100000, offset: 0 } });

  const ids = list.results
    .map((entry) => idFromUrl(entry.url))
    .filter((id): id is number => id !== undefined);

  let failed = 0;

  const raws = await mapWithConcurrency(ids, DATA_CONCURRENCY, async (id) => {
    try {
      const { data } = await api.get<RawPokemon>(`/pokemon/${id}`);
      return data;
    } catch {
      failed += 1;
      return null;
    }
  });

  const valid = raws.filter((raw): raw is RawPokemon => raw !== null);
  const speciesIds = Array.from(
    new Set(
      valid
        .map((raw) => idFromUrl(raw.species?.url))
        .filter((id): id is number => id !== undefined)
    )
  );

  // La generación y el flag is_default viven en pokemon-species y se comparten
  // entre todas las variedades de una especie: una sola petición por especie.
  const speciesResults = await mapWithConcurrency(
    speciesIds,
    DATA_CONCURRENCY,
    async (speciesId) => {
      try {
        const { data } = await api.get<RawSpecies>(
          `/pokemon-species/${speciesId}`
        );
        return { speciesId, data };
      } catch {
        failed += 1;
        return null;
      }
    }
  );

  const speciesById = new Map<number, RawSpecies>();
  for (const result of speciesResults) {
    if (result) speciesById.set(result.speciesId, result.data);
  }

  const entries: DataCenterEntry[] = [];
  for (const raw of valid) {
    const speciesId = idFromUrl(raw.species?.url);
    if (speciesId === undefined) {
      failed += 1;
      continue;
    }
    const entry = buildEntry(raw, speciesById.get(speciesId) ?? {});
    if (entry) entries.push(entry);
    else failed += 1;
  }
  entries.sort((a, b) => a.id - b.id);

  return {
    category: "pokemon",
    generatedAt: new Date().toISOString(),
    source: "PokeAPI",
    count: entries.length,
    failed,
    entries,
  };
}

function buildDatasetOnce(): Promise<DataCenterDataset> {
  if (datasetRequest) return datasetRequest;

  datasetRequest = fetchDataset()
    .then((value) => {
      datasetCache = { value, expiresAt: Date.now() + DATASET_TTL_MS };
      return value;
    })
    .finally(() => {
      datasetRequest = null;
    });

  return datasetRequest;
}

export interface DatasetOptions {
  /** Fuerza una reconstrucción aunque la caché esté vigente. */
  force?: boolean;
  /** Sirve el snapshot anterior mientras se actualiza. Por defecto, sí. */
  staleWhileRevalidate?: boolean;
}

export async function getPokemonDataset(
  options: DatasetOptions = {}
): Promise<DataCenterDataset> {
  if (datasetRequest) return datasetRequest;

  const now = Date.now();
  if (!options.force && datasetCache && datasetCache.expiresAt > now) {
    return datasetCache.value;
  }

  if (!options.force && datasetCache && options.staleWhileRevalidate !== false) {
    void buildDatasetOnce().catch(() => {
      // Sin acción: se conserva el snapshot anterior y se reintentará luego.
    });
    return datasetCache.value;
  }

  return buildDatasetOnce();
}

/**
 * Registro de categorías del Centro de Datos. Para sumar Objetos, Bayas o
 * Movimientos basta con añadir un builder y un refresher aquí y una pestaña en
 * el registro del frontend: ni el router ni la página tienen que cambiar.
 */
export const DATA_CENTER_CATEGORIES = ["pokemon"] as const;
export type DataCenterCategory = (typeof DATA_CENTER_CATEGORIES)[number];

export function isDataCenterCategory(value: string): value is DataCenterCategory {
  return (DATA_CENTER_CATEGORIES as readonly string[]).includes(value);
}

type CategoryHandler = (query: DataCenterQuery) => Promise<unknown>;

export const DATA_CATEGORY_HANDLERS: Record<DataCenterCategory, CategoryHandler> = {
  pokemon: async (query) =>
    buildPokemonAnalytics(await getPokemonDataset(), query),
};

interface RefreshResult {
  generatedAt: string;
  count: number;
}

type CategoryRefresher = () => Promise<RefreshResult>;

export const DATA_CATEGORY_REFRESHERS: Record<
  DataCenterCategory,
  CategoryRefresher
> = {
  pokemon: async () => {
    const dataset = await getPokemonDataset({ force: true });
    return { generatedAt: dataset.generatedAt, count: dataset.count };
  },
};

export { isPokemonDataType };
