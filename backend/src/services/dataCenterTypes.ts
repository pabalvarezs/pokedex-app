/**
 * Contratos compartidos del Centro de Datos. Viven aparte de la carga y de los
 * cálculos para que ambas capas (y el controlador) hablen el mismo lenguaje.
 */

export const STAT_KEYS = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
] as const;

export type StatKey = (typeof STAT_KEYS)[number];

/** Los 18 tipos de PokéAPI. Se usan para validar el filtro de la consulta. */
export const POKEMON_DATA_TYPES = [
  "normal",
  "fire",
  "water",
  "grass",
  "electric",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

/** Claves de los rankings que expone la sección Pokémon. */
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

export interface DataCenterEntry {
  id: number;
  name: string;
  speciesId: number;
  sprite?: string;
  artwork?: string;
  types: string[];
  /** Generación leída de pokemon-species. */
  generation: number;
  /** `is_default` de la variedad dentro de pokemon-species.varieties. */
  isDefault: boolean;
  /** Altura en decímetros, tal como la entrega PokéAPI. */
  height: number;
  /** Peso en hectogramos, tal como lo entrega PokéAPI. */
  weight: number;
  /** Estadísticas base de las 6 categorías. */
  stats: Record<StatKey, number>;
  /** Suma de las 6 estadísticas base. */
  total: number;
}

export interface DataCenterDataset {
  category: "pokemon";
  generatedAt: string;
  source: string;
  count: number;
  /** Registros que PokéAPI no devolvió y que se omitieron del dataset. */
  failed: number;
  entries: DataCenterEntry[];
}

/** Fila de cualquier ranking o récord. `value` ya viene en la unidad visible. */
export interface RankEntry {
  id: number;
  name: string;
  sprite?: string;
  artwork?: string;
  types: string[];
  generation: number;
  isDefault: boolean;
  value: number;
  /** Puesto (1-based). Los empatados comparten puesto. */
  rank: number;
  /** True cuando otra fila tiene exactamente el mismo valor. */
  tied: boolean;
}

export type Rankings = Record<RankingKey, RankEntry[]>;

export interface PhysicalRecords {
  /** Metros (height / 10). */
  tallest: RankEntry[];
  shortest: RankEntry[];
  /** Kilogramos (weight / 10). */
  heaviest: RankEntry[];
  lightest: RankEntry[];
}

export interface TypeAverage {
  type: string;
  count: number;
  /** Promedio del total de estadísticas base. */
  average: number;
  stats: Record<StatKey, number>;
}

export interface RoleLeaders {
  /** Ataque + Ataque Especial. */
  attacker: RankEntry[];
  /** Defensa + Defensa Especial. */
  defender: RankEntry[];
  /** Velocidad. */
  fast: RankEntry[];
}

export interface GenerationBucket {
  generation: number;
  count: number;
  percentage: number;
}

export interface PokemonAnalytics {
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

/** Parámetros ya validados por el controlador. */
export interface DataCenterQuery {
  limit: number;
  type: string | null;
  generation: number | null;
  includeVariants: boolean;
}
