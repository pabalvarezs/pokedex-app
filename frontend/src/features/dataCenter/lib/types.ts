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
  generatedAt: string;
  count: number;
}
