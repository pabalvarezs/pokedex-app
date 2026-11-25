/** Espejo de `backend/src/services/dataCenterTypes.ts`. */

export const STAT_KEYS = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
] as const;

export type StatKey = (typeof STAT_KEYS)[number];

export const RANKING_KEYS = [
  "total",
  "hp",
  "attack",
  "defense",
  "specialAttack",
  "specialDefense",
  "speed",
] as const;

export type RankingKey = (typeof RANKING_KEYS)[number];

export interface RankEntry {
  id: number;
  name: string;
  sprite?: string;
  artwork?: string;
  types: string[];
  generation: number;
  isDefault: boolean;
  /** Ya convertido a la unidad visible (m o kg en los récords físicos). */
  value: number;
  rank: number;
  tied: boolean;
}

export type Rankings = Record<RankingKey, RankEntry[]>;

export interface PhysicalRecords {
  tallest: RankEntry[];
  shortest: RankEntry[];
  heaviest: RankEntry[];
  lightest: RankEntry[];
}

export interface TypeAverage {
  type: string;
  count: number;
  average: number;
  stats: Record<StatKey, number>;
}

export interface RoleLeaders {
  attacker: RankEntry[];
  defender: RankEntry[];
  fast: RankEntry[];
}

export interface GenerationBucket {
  generation: number;
  count: number;
  percentage: number;
}

export interface DataCenterPokemonResponse {
  meta: {
    generatedAt: string;
    source: string;
    total: number;
    filtered: number;
    failed: number;
    limit: number;
    includeVariants: boolean;
    type: string | null;
    generation: number | null;
    tiesPolicy: string;
  };
  rankings: Rankings;
  records: PhysicalRecords;
  insights: {
    typeAverages: TypeAverage[];
    roleLeaders: RoleLeaders;
    generationDistribution: GenerationBucket[];
  };
}

export interface PokemonDataCenterFilters {
  limit: number;
  type: string | null;
  generation: number | null;
  includeVariants: boolean;
}

export interface DataCenterRefreshResponse {
  refreshing: boolean;
  generatedAt: string | null;
  count: number;
  failed: number;
  lastError: string | null;
}

/** Mismo contrato que `SnapshotStatus` del backend. */
export type DataCenterStatus = DataCenterRefreshResponse;

/** Espejo de `CATALOG_CATEGORIES` del backend. */
export const CATALOG_CATEGORIES = ["items", "berries"] as const;

/** Espejo de `TypeMatrixResponse` del backend. */
export interface TypeMatrixType {
  id: number;
  slug: string;
  name: string;
  generation: number;
  damageClass: string;
  moveCount: number;
  moveSlugs: string[];
  pokemonCount: number;
  strongTo: string[];
  weakTo: string[];
  resists: string[];
  immuneTo: string[];
}

export interface TypeMatrixResponse {
  meta: {
    source: string;
    generatedAt: string;
    generation: 6;
    count: number;
  };
  types: TypeMatrixType[];
  matrix: number[][];
}

export type CatalogCategory = (typeof CATALOG_CATEGORIES)[number];

export interface CatalogQuery {
  q: string;
  group: string | null;
  limit: number;
  offset: number;
}

export interface CatalogEntry {
  id: number;
  name: string;
  label: string;
  group: string;
  sprite?: string;
}

export interface CatalogGroupCount {
  id: string;
  count: number;
}

export interface CatalogIndexResponse {
  meta: {
    category: CatalogCategory;
    source: string;
    generatedAt: string;
    total: number;
    filtered: number;
    limit: number;
    offset: number;
  };
  groups: CatalogGroupCount[];
  items: CatalogEntry[];
}

export interface CatalogAttribute {
  key: string;
  label: string;
  value: string;
  isTypeName?: boolean;
}

export interface CatalogDetailResponse {
  category: CatalogCategory;
  id: number;
  name: string;
  label: string;
  group: string;
  sprite?: string;
  summary?: string;
  attributes: CatalogAttribute[];
}
