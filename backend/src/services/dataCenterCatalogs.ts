import { api, ITEM_NAMES_ES, mapWithConcurrency } from "./pokemon";
import type { SnapshotStatus } from "./dataCenterRepository";
import {
  CATALOG_CATEGORIES,
  type CatalogAttribute,
  type CatalogCategory,
  type CatalogDetailResponse,
  type CatalogEntry,
  type CatalogGroupCount,
  type CatalogIndexResponse,
  type CatalogQuery,
} from "./dataCenterTypes";

/**
 * Catálogos complementarios del Centro de Datos. Solo consulta PokéAPI desde
 * el proxy del backend (`api`) y nunca desde el frontend. El índice se cachea
 * y el detalle se pide bajo demanda para no descargar miles de fichas que nadie
 * va a abrir.
 */
const CATALOG_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const LIST_CONCURRENCY = 6;
const SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites";

type SpriteKind = "item" | "berry";

interface CatalogResource {
  path: string;
  group: string;
  sprite?: SpriteKind;
}

interface CatalogConfig {
  resources: readonly CatalogResource[];
}

const CATALOG_CONFIG: Record<CatalogCategory, CatalogConfig> = {
  items: {
    resources: [{ path: "item", group: "item", sprite: "item" }],
  },
  berries: {
    resources: [{ path: "berry", group: "berry", sprite: "berry" }],
  },
};

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface CatalogIndex {
  category: CatalogCategory;
  generatedAt: string;
  source: string;
  items: CatalogEntry[];
  failed: number;
}

interface RawNamedResource {
  name?: string;
  url: string;
}

interface RawList {
  results?: RawNamedResource[];
}

type RawDetail = Record<string, unknown>;

interface NamedRef {
  name: string;
  url?: string;
}

const indexCache = new Map<CatalogCategory, CacheEntry<CatalogIndex>>();
const indexRequests = new Map<CatalogCategory, Promise<CatalogIndex>>();
const detailCache = new Map<string, CacheEntry<CatalogDetailResponse>>();
const detailRequests = new Map<string, Promise<CatalogDetailResponse | null>>();
const refreshing = new Set<CatalogCategory>();

export function isCatalogCategory(value: string): value is CatalogCategory {
  return (CATALOG_CATEGORIES as readonly string[]).includes(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function namedRef(value: unknown): NamedRef | undefined {
  if (!isRecord(value) || typeof value.name !== "string" || !value.name) {
    return undefined;
  }
  return {
    name: value.name,
    ...(typeof value.url === "string" ? { url: value.url } : {}),
  };
}

function nameList(value: unknown): string[] {
  return asArray(value)
    .map(namedRef)
    .filter((entry): entry is NamedRef => entry !== undefined)
    .map((entry) => entry.name);
}

function idFromUrl(url: string): number | undefined {
  const raw = url.split("/").filter(Boolean).pop();
  if (!raw) return undefined;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

function humanize(value: string): string {
  return value
    .replace(/-/g, " ")
    .replace(/\b[a-z]+\b/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}

function humanizedName(value: unknown): string | undefined {
  const name = namedRef(value)?.name;
  return name ? humanize(name) : undefined;
}

function labelFor(name: string, group: string): string {
  if (group === "berry") return `Baya ${humanize(name.replace(/-berry$/, ""))}`;
  if (group === "item" && ITEM_NAMES_ES[name]) return ITEM_NAMES_ES[name];
  return humanize(name);
}

function spriteFor(resource: CatalogResource, name: string): string | undefined {
  if (!resource.sprite) return undefined;
  return `${SPRITE_BASE}/items/${name}.png`;
}

async function buildIndex(category: CatalogCategory): Promise<CatalogIndex> {
  const lists = await mapWithConcurrency<
    CatalogResource,
    { resource: CatalogResource; results: RawNamedResource[] }
  >([...CATALOG_CONFIG[category].resources], LIST_CONCURRENCY, async (resource) => {
    try {
      const { data } = await api.get<RawList>(`/${resource.path}`, {
        params: { limit: 100000, offset: 0 },
      });
      // `characteristic` entrega solo la URL: el ID se deriva de ella.
      const results = asArray(data.results).filter(
        (entry): entry is RawNamedResource =>
          isRecord(entry) && typeof entry.url === "string"
      );
      return { resource, results };
    } catch {
      return { resource, results: [] };
    }
  });

  const items: CatalogEntry[] = [];
  let failed = 0;

  for (const { resource, results } of lists) {
    for (const raw of results) {
      const id = idFromUrl(raw.url);
      if (id === undefined) {
        failed += 1;
        continue;
      }
      const name = typeof raw.name === "string" && raw.name ? raw.name : String(id);
      const sprite = spriteFor(resource, name);
      items.push({
        id,
        name,
        label: labelFor(name, resource.group),
        group: resource.group,
        ...(sprite ? { sprite } : {}),
      });
    }
  }

  // Orden estable: primero el recurso de origen y luego el ID de PokéAPI.
  items.sort((a, b) => a.group.localeCompare(b.group) || a.id - b.id);

  return {
    category,
    generatedAt: new Date().toISOString(),
    source: "PokeAPI",
    items,
    failed,
  };
}

function storeIndex(category: CatalogCategory, index: CatalogIndex): void {
  indexCache.set(category, {
    value: index,
    expiresAt: Date.now() + CATALOG_TTL_MS,
  });
}

function loadIndex(
  category: CatalogCategory,
  force = false
): Promise<CatalogIndex> {
  const cached = indexCache.get(category);
  if (!force && cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.value);
  }

  const pending = indexRequests.get(category);
  if (pending && !force) return pending;

  if (!force && cached) {
    // stale-while-revalidate: se sirve lo anterior sin bloquear la petición.
    void buildAndStoreIndex(category).catch(() => {});
    return Promise.resolve(cached.value);
  }

  return buildAndStoreIndex(category);
}

function buildAndStoreIndex(category: CatalogCategory): Promise<CatalogIndex> {
  const pending = indexRequests.get(category);
  if (pending) return pending;

  const request = buildIndex(category)
    .then((index) => {
      storeIndex(category, index);
      return index;
    })
    .finally(() => {
      indexRequests.delete(category);
    });
  indexRequests.set(category, request);
  return request;
}

/** Filtrado y paginación puros, separados de la red para poder testearlos. */
export function filterCatalog(
  index: CatalogIndex,
  query: CatalogQuery
): CatalogIndexResponse {
  const term = query.q.trim().toLowerCase();
  const filtered = index.items.filter((item) => {
    if (query.group && item.group !== query.group) return false;
    if (!term) return true;
    return (
      item.name.toLowerCase().includes(term) ||
      item.label.toLowerCase().includes(term)
    );
  });

  // Los grupos se cuentan sobre el catálogo completo: así el selector no
  // desaparece cuando la búsqueda deja coincidencias en un solo recurso.
  const counts = new Map<string, number>();
  for (const item of index.items) {
    counts.set(item.group, (counts.get(item.group) ?? 0) + 1);
  }
  const groups: CatalogGroupCount[] = Array.from(counts, ([id, count]) => ({
    id,
    count,
  })).sort((a, b) => a.id.localeCompare(b.id));

  return {
    meta: {
      category: index.category,
      source: index.source,
      generatedAt: index.generatedAt,
      total: index.items.length,
      filtered: filtered.length,
      limit: query.limit,
      offset: query.offset,
    },
    groups,
    items: filtered.slice(query.offset, query.offset + query.limit),
  };
}

export async function getCatalog(
  category: CatalogCategory,
  query: CatalogQuery
): Promise<CatalogIndexResponse> {
  return filterCatalog(await loadIndex(category), query);
}

export async function getCatalogStatus(
  category: CatalogCategory
): Promise<SnapshotStatus> {
  const cached = indexCache.get(category)?.value;
  return {
    refreshing: refreshing.has(category),
    generatedAt: cached?.generatedAt ?? null,
    count: cached?.items.length ?? 0,
    failed: cached?.failed ?? 0,
    lastError: null,
  };
}

/** Reconstruye el índice en segundo plano; el cliente consulta `/status`. */
export async function refreshCatalog(
  category: CatalogCategory
): Promise<SnapshotStatus> {
  if (refreshing.has(category)) return getCatalogStatus(category);

  refreshing.add(category);
  void buildAndStoreIndex(category)
    .catch(() => {
      // Se conserva el índice anterior; el siguiente refresh lo reintentará.
    })
    .finally(() => {
      refreshing.delete(category);
    });

  return getCatalogStatus(category);
}

function localizedName(raw: RawDetail, fallback: string): string {
  for (const entry of asArray(raw.names)) {
    if (
      isRecord(entry) &&
      isRecord(entry.language) &&
      entry.language.name === "es" &&
      typeof entry.name === "string" &&
      entry.name.trim()
    ) {
      return entry.name;
    }
  }
  return fallback;
}

function localizedText(
  entries: unknown,
  field: "short_effect" | "effect" | "text"
): string | undefined {
  for (const entry of asArray(entries)) {
    if (!isRecord(entry) || !isRecord(entry.language)) continue;
    const value = entry[field];
    if (
      entry.language.name === "es" &&
      typeof value === "string" &&
      value.trim()
    ) {
      return value.replace(/[\f\n\r]+/g, " ").trim();
    }
  }
  return undefined;
}

function pickSummary(raw: RawDetail): string | undefined {
  return (
    localizedText(raw.effect_entries, "short_effect") ??
    localizedText(raw.effect_entries, "effect") ??
    localizedText(raw.flavor_text_entries, "text")
  );
}

function addAttribute(
  attributes: CatalogAttribute[],
  key: string,
  label: string,
  value: unknown,
  isTypeName = false
): void {
  const text = typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
  if (!text) return;
  attributes.push({
    key,
    label,
    value: text,
    ...(isTypeName ? { isTypeName: true } : {}),
  });
}

function buildAttributes(raw: RawDetail, group: string): CatalogAttribute[] {
  const attributes: CatalogAttribute[] = [];
  const names = (key: string) => nameList(raw[key]).map(humanize).join(" · ");

  if (group === "item") {
    addAttribute(attributes, "category", "Categoría", humanizedName(raw.category));
    const price = asArray(raw.prices)[0];
    addAttribute(
      attributes,
      "price",
      "Precio",
      isRecord(price) ? price.price : undefined
    );
    addAttribute(attributes, "properties", "Propiedades", names("attributes"));
    addAttribute(attributes, "fling-power", "Potencia al lanzar", raw.fling_power);
  } else if (group === "berry") {
    addAttribute(attributes, "firmness", "Firmeza", humanizedName(raw.firmness));
    addAttribute(attributes, "growth-time", "Tiempo de crecimiento", raw.growth_time);
    addAttribute(attributes, "max-harvest", "Cosecha máxima", raw.max_harvest);
    addAttribute(attributes, "soil-dryness", "Días para secar", raw.soil_dryness);
    addAttribute(attributes, "size", "Tamaño", raw.size);
    addAttribute(attributes, "smoothness", "Suavidad", raw.smoothness);
    addAttribute(attributes, "gift-power", "Potencia del regalo", raw.natural_gift_power);
    addAttribute(
      attributes,
      "gift-type",
      "Tipo del regalo",
      namedRef(raw.natural_gift_type)?.name,
      true
    );
    const flavors = asArray(raw.flavors)
      .map((entry) => {
        if (!isRecord(entry)) return undefined;
        const flavor = namedRef(entry.flavor)?.name;
        return flavor ? `${humanize(flavor)} (${String(entry.potency ?? 0)})` : undefined;
      })
      .filter((entry): entry is string => entry !== undefined)
      .join(" · ");
    addAttribute(attributes, "flavors", "Sabores", flavors);
  }

  return attributes;
}

function buildDetail(
  category: CatalogCategory,
  group: string,
  id: number,
  raw: RawDetail
): CatalogDetailResponse {
  const fallback = `${group}-${id}`;
  const name = typeof raw.name === "string" ? raw.name : fallback;
  const summary = pickSummary(raw);
  const label = localizedName(raw, labelFor(name, group));
  const sprite = spriteFor(
    CATALOG_CONFIG[category].resources.find((resource) => resource.group === group) ?? {
      path: "",
      group,
    },
    name
  );

  return {
    category,
    id,
    name,
    label,
    group,
    ...(sprite ? { sprite } : {}),
    ...(summary ? { summary } : {}),
    attributes: buildAttributes(raw, group),
  };
}

export async function getCatalogItem(
  category: CatalogCategory,
  group: string,
  id: number
): Promise<CatalogDetailResponse | null> {
  const resource = CATALOG_CONFIG[category].resources.find(
    (entry) => entry.group === group
  );
  if (!resource) return null;

  const key = `${category}:${group}:${id}`;
  const cached = detailCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const pending = detailRequests.get(key);
  if (pending) return pending;

  const request = api
    .get<RawDetail>(`/${resource.path}/${id}`)
    .then(({ data }) => {
      const detail = buildDetail(category, group, id, data);
      detailCache.set(key, {
        value: detail,
        expiresAt: Date.now() + CATALOG_TTL_MS,
      });
      return detail;
    })
    .catch(() => null)
    .finally(() => {
      detailRequests.delete(key);
    });
  detailRequests.set(key, request);
  return request;
}
