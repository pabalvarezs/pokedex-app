import {
  POKEMON_DATA_TYPES,
  STAT_KEYS,
  type DataCenterEntry,
  type DataCenterQuery,
  type DataCenterDataset,
  type GenerationBucket,
  type PhysicalRecords,
  type PokemonAnalytics,
  type RankEntry,
  type Rankings,
  type RoleLeaders,
  type StatKey,
  type TypeAverage,
} from "./dataCenterTypes";

/**
 * Política de empates del Centro de Datos:
 * - se ordena por valor (mejor primero) y, a igual valor, por ID nacional
 *   ascendente como desempate determinista;
 * - se incluyen TODAS las filas empatadas con la última que entra en el top N,
 *   así que un "top 10" puede devolver más de 10 filas;
 * - las filas empatadas comparten puesto (ranking competitivo: 1, 2, 2, 4).
 */
export const TIES_POLICY =
  "Se incluyen todos los empatados con el último puesto; desempate por ID nacional ascendente";

type Direction = "desc" | "asc";

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function filterEntries(
  entries: DataCenterEntry[],
  query: DataCenterQuery
): DataCenterEntry[] {
  return entries.filter((entry) => {
    if (!query.includeVariants && !entry.isDefault) return false;
    if (query.type && !entry.types.includes(query.type)) return false;
    if (query.generation !== null && entry.generation !== query.generation) {
      return false;
    }
    return true;
  });
}

function toRankEntry(entry: DataCenterEntry, value: number): RankEntry {
  return {
    id: entry.id,
    name: entry.name,
    ...(entry.sprite ? { sprite: entry.sprite } : {}),
    ...(entry.artwork ? { artwork: entry.artwork } : {}),
    types: entry.types,
    generation: entry.generation,
    isDefault: entry.isDefault,
    value: round1(value),
    rank: 0,
    tied: false,
  };
}

/**
 * Ordena, aplica el límite y expande el resultado hasta cubrir todos los
 * empatados con la última fila incluida. Es la única función que decide
 * puestos, de modo que rankings y récords comparten exactamente el criterio.
 */
export function rankBy(
  entries: DataCenterEntry[],
  getValue: (entry: DataCenterEntry) => number,
  limit: number,
  direction: Direction = "desc"
): RankEntry[] {
  if (entries.length === 0 || limit <= 0) return [];

  const scored = entries.map((entry) => ({ entry, value: getValue(entry) }));
  scored.sort(
    (a, b) =>
      (direction === "desc" ? b.value - a.value : a.value - b.value) ||
      a.entry.id - b.entry.id
  );

  const cutoffIndex = Math.min(Math.trunc(limit), scored.length) - 1;
  const cutoff = scored[cutoffIndex].value;
  const included = scored.filter((item) =>
    direction === "desc" ? item.value >= cutoff : item.value <= cutoff
  );

  const counts = new Map<number, number>();
  for (const item of included) {
    counts.set(item.value, (counts.get(item.value) ?? 0) + 1);
  }

  let rank = 1;
  let previous: number | undefined;
  return included.map((item, index) => {
    if (previous !== undefined && item.value !== previous) rank = index + 1;
    previous = item.value;
    return {
      ...toRankEntry(item.entry, item.value),
      rank,
      tied: (counts.get(item.value) ?? 1) > 1,
    };
  });
}

export function statValue(entry: DataCenterEntry, key: StatKey): number {
  return entry.stats[key];
}

export function buildRankings(
  entries: DataCenterEntry[],
  limit: number
): Rankings {
  return {
    total: rankBy(entries, (entry) => entry.total, limit),
    hp: rankBy(entries, (entry) => statValue(entry, "hp"), limit),
    attack: rankBy(entries, (entry) => statValue(entry, "attack"), limit),
    defense: rankBy(entries, (entry) => statValue(entry, "defense"), limit),
    specialAttack: rankBy(
      entries,
      (entry) => statValue(entry, "special-attack"),
      limit
    ),
    specialDefense: rankBy(
      entries,
      (entry) => statValue(entry, "special-defense"),
      limit
    ),
    speed: rankBy(entries, (entry) => statValue(entry, "speed"), limit),
  };
}

/** Convierte decímetros a metros y hectogramos a kilogramos. */
export function buildPhysicalRecords(
  entries: DataCenterEntry[],
  limit = 1
): PhysicalRecords {
  const toMeters = (entry: DataCenterEntry) => entry.height / 10;
  const toKilograms = (entry: DataCenterEntry) => entry.weight / 10;

  return {
    tallest: rankBy(entries, toMeters, limit, "desc"),
    shortest: rankBy(entries, toMeters, limit, "asc"),
    heaviest: rankBy(entries, toKilograms, limit, "desc"),
    lightest: rankBy(entries, toKilograms, limit, "asc"),
  };
}

export function buildTypeAverages(entries: DataCenterEntry[]): TypeAverage[] {
  interface Accumulator {
    count: number;
    total: number;
    stats: Record<StatKey, number>;
  }

  const emptyStats = (): Record<StatKey, number> => ({
    hp: 0,
    attack: 0,
    defense: 0,
    "special-attack": 0,
    "special-defense": 0,
    speed: 0,
  });

  const byType = new Map<string, Accumulator>();
  for (const entry of entries) {
    for (const type of entry.types) {
      let acc = byType.get(type);
      if (!acc) {
        acc = { count: 0, total: 0, stats: emptyStats() };
        byType.set(type, acc);
      }
      acc.count += 1;
      acc.total += entry.total;
      for (const key of STAT_KEYS) acc.stats[key] += entry.stats[key];
    }
  }

  return Array.from(byType.entries())
    .map(([type, acc]) => ({
      type,
      count: acc.count,
      average: round1(acc.total / acc.count),
      stats: {
        hp: round1(acc.stats.hp / acc.count),
        attack: round1(acc.stats.attack / acc.count),
        defense: round1(acc.stats.defense / acc.count),
        "special-attack": round1(acc.stats["special-attack"] / acc.count),
        "special-defense": round1(acc.stats["special-defense"] / acc.count),
        speed: round1(acc.stats.speed / acc.count),
      },
    }))
    .sort((a, b) => b.average - a.average || a.type.localeCompare(b.type));
}

export function buildRoleLeaders(entries: DataCenterEntry[]): RoleLeaders {
  return {
    attacker: rankBy(
      entries,
      (entry) => entry.stats.attack + entry.stats["special-attack"],
      1
    ),
    defender: rankBy(
      entries,
      (entry) => entry.stats.defense + entry.stats["special-defense"],
      1
    ),
    fast: rankBy(entries, (entry) => entry.stats.speed, 1),
  };
}

export function buildGenerationDistribution(
  entries: DataCenterEntry[]
): GenerationBucket[] {
  const counts = new Map<number, number>();
  for (const entry of entries) {
    counts.set(entry.generation, (counts.get(entry.generation) ?? 0) + 1);
  }

  return Array.from({ length: 9 }, (_, index) => {
    const generation = index + 1;
    const count = counts.get(generation) ?? 0;
    return {
      generation,
      count,
      percentage:
        entries.length === 0 ? 0 : round1((count / entries.length) * 100),
    };
  });
}

export function buildPokemonAnalytics(
  dataset: DataCenterDataset,
  query: DataCenterQuery
): PokemonAnalytics {
  const filtered = filterEntries(dataset.entries, query);

  return {
    meta: {
      generatedAt: dataset.generatedAt,
      source: dataset.source,
      total: dataset.entries.length,
      filtered: filtered.length,
      failed: dataset.failed,
      limit: query.limit,
      includeVariants: query.includeVariants,
      type: query.type,
      generation: query.generation,
      tiesPolicy: TIES_POLICY,
    },
    rankings: buildRankings(filtered, query.limit),
    records: buildPhysicalRecords(filtered),
    insights: {
      typeAverages: buildTypeAverages(filtered),
      roleLeaders: buildRoleLeaders(filtered),
      generationDistribution: buildGenerationDistribution(filtered),
    },
  };
}

/** Reutilizado por el controlador para validar el filtro de tipo. */
export function isPokemonDataType(value: string): boolean {
  return (POKEMON_DATA_TYPES as readonly string[]).includes(value);
}
