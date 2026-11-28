import { api, mapWithConcurrency, TYPE_NAMES_ES } from "./pokemon";
import type { SnapshotStatus } from "./dataCenterRepository";
import type { TypeMatrixResponse, TypeMatrixType } from "./dataCenterTypes";

/**
 * Matriz de efectividad del Centro de Datos. Usa las relaciones vigentes de
 * PokéAPI, que son las aplicables desde la sexta generación (la única diferencia
 * respecto a la tabla de WikiDex es el orden de presentación). Todo pasa por el
 * proxy `api`; el frontend nunca habla con PokéAPI directamente.
 */
const MATRIX_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CANONICAL_SLUGS = Object.keys(TYPE_NAMES_ES);
const CANONICAL_SET = new Set(CANONICAL_SLUGS);
const DETAIL_CONCURRENCY = 8;

const DAMAGE_CLASSES_ES: Record<string, string> = {
  physical: "Física",
  special: "Especial",
  status: "Estado",
};

interface RawRef {
  name?: string;
  url?: string;
}

interface RawDamageRelations {
  double_damage_to?: RawRef[];
  half_damage_to?: RawRef[];
  no_damage_to?: RawRef[];
  double_damage_from?: RawRef[];
  half_damage_from?: RawRef[];
  no_damage_from?: RawRef[];
}

interface RawTypeDetail {
  id?: number;
  name?: string;
  generation?: RawRef;
  move_damage_class?: RawRef;
  moves?: unknown[];
  pokemon?: unknown[];
  damage_relations?: RawDamageRelations;
  names?: { name?: string; language?: RawRef }[];
}

interface RawTypeList {
  results?: { name?: string; url?: string }[];
}

interface CacheEntry {
  value: TypeMatrixResponse;
  expiresAt: number;
}

let cache: CacheEntry | null = null;
let pending: Promise<TypeMatrixResponse> | null = null;
let refreshing = false;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function idFromUrl(url?: string): number | undefined {
  const raw = url?.split("/").filter(Boolean).pop();
  if (!raw) return undefined;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

function moveSlug(value: unknown): string | undefined {
  return isRecord(value) && typeof value.name === "string"
    ? value.name
    : undefined;
}

function slugs(refs: RawRef[] | undefined): string[] {
  return (refs ?? [])
    .map((ref) => ref.name?.toLowerCase())
    .filter((slug): slug is string => slug !== undefined && CANONICAL_SET.has(slug));
}

function spanishName(raw: RawTypeDetail, slug: string): string {
  for (const entry of raw.names ?? []) {
    if (entry.language?.name === "es" && entry.name?.trim()) return entry.name;
  }
  return TYPE_NAMES_ES[slug] ?? slug;
}

function buildType(raw: RawTypeDetail, slug: string): TypeMatrixType {
  const relations = raw.damage_relations ?? {};
  const damageClass = raw.move_damage_class?.name?.toLowerCase();
  const generation = idFromUrl(raw.generation?.url) ?? 1;
  const moveSlugs = (raw.moves ?? [])
    .map((entry) => (isRecord(entry) ? moveSlug(entry) : undefined))
    .filter((entry): entry is string => entry !== undefined)
    .sort((a, b) => a.localeCompare(b));

  return {
    id: raw.id ?? 0,
    slug,
    name: spanishName(raw, slug),
    generation,
    // Algunos tipos (p. ej. Hada) no tienen clase fija: sus movimientos
    // pueden ser físicos o especiales.
    damageClass: damageClass
      ? DAMAGE_CLASSES_ES[damageClass] ?? damageClass
      : "Mixta",
    moveCount: moveSlugs.length,
    moveSlugs,
    pokemonCount: Array.isArray(raw.pokemon) ? raw.pokemon.length : 0,
    strongTo: slugs(relations.double_damage_to),
    weakTo: slugs(relations.double_damage_from),
    resists: slugs(relations.half_damage_from),
    immuneTo: slugs(relations.no_damage_from),
  };
}

function buildMatrix(types: TypeMatrixType[], details: Map<string, RawTypeDetail>): number[][] {
  const indexBySlug = new Map(types.map((type, index) => [type.slug, index]));

  return types.map((attacker) => {
    const row = types.map(() => 1);
    const relations = details.get(attacker.slug)?.damage_relations ?? {};
    const apply = (refs: RawRef[] | undefined, value: number) => {
      for (const defender of slugs(refs)) {
        const column = indexBySlug.get(defender);
        if (column !== undefined) row[column] = value;
      }
    };
    apply(relations.no_damage_to, 0);
    apply(relations.half_damage_to, 0.5);
    apply(relations.double_damage_to, 2);
    return row;
  });
}

async function fetchMatrix(): Promise<TypeMatrixResponse> {
  const { data } = await api.get<RawTypeList>("/type", {
    params: { limit: 100, offset: 0 },
  });

  const candidates = (data.results ?? [])
    .map((entry) => ({ slug: entry.name?.toLowerCase() ?? "", id: idFromUrl(entry.url) }))
    .filter(
      (entry): entry is { slug: string; id: number } =>
        CANONICAL_SET.has(entry.slug) && entry.id !== undefined
    );

  const details = await mapWithConcurrency(
    candidates,
    DETAIL_CONCURRENCY,
    async (entry) => {
      try {
        const { data: detail } = await api.get<RawTypeDetail>(`/type/${entry.id}`);
        return { slug: entry.slug, detail };
      } catch {
        return null;
      }
    }
  );

  const detailBySlug = new Map<string, RawTypeDetail>();
  for (const item of details) {
    if (item) detailBySlug.set(item.slug, item.detail);
  }

  const types: TypeMatrixType[] = [];
  for (const entry of candidates) {
    const detail = detailBySlug.get(entry.slug);
    if (detail) types.push(buildType(detail, entry.slug));
  }
  types.sort((a, b) => a.name.localeCompare(b.name, "es"));

  return {
    meta: {
      source: "PokeAPI",
      generatedAt: new Date().toISOString(),
      generation: 6,
      count: types.length,
    },
    types,
    matrix: buildMatrix(types, detailBySlug),
  };
}

function store(value: TypeMatrixResponse): void {
  cache = { value, expiresAt: Date.now() + MATRIX_TTL_MS };
}

async function buildAndStore(): Promise<TypeMatrixResponse> {
  if (pending) return pending;
  pending = fetchMatrix()
    .then((value) => {
      store(value);
      return value;
    })
    .finally(() => {
      pending = null;
    });
  return pending;
}

export async function getTypeMatrix(): Promise<TypeMatrixResponse> {
  if (cache && cache.expiresAt > Date.now()) return cache.value;
  if (pending) return pending;
  if (cache) {
    // Se sirve la matriz anterior mientras se reconstruye en segundo plano.
    void buildAndStore().catch(() => {});
    return cache.value;
  }
  return buildAndStore();
}

export function getTypeMatrixStatus(): SnapshotStatus {
  return {
    refreshing,
    generatedAt: cache?.value.meta.generatedAt ?? null,
    count: cache?.value.meta.count ?? 0,
    failed: 0,
    lastError: null,
  };
}

/** Reconstrucción en segundo plano, igual que el resto de categorías. */
export async function refreshTypeMatrix(): Promise<SnapshotStatus> {
  if (refreshing) return getTypeMatrixStatus();
  refreshing = true;
  void buildAndStore()
    .catch(() => {
      // Se conserva la matriz anterior si PokéAPI falla.
    })
    .finally(() => {
      refreshing = false;
    });
  return getTypeMatrixStatus();
}
