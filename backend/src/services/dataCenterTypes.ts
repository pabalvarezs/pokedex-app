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
export type FilterMode = "include" | "exclude";

export interface DataCenterQuery {
  limit: number;
  /** Compatible con el filtro simple existente. */
  type: string | null;
  generation: number | null;
  includeVariants: boolean;
  /** Filtro múltiple con semántica de la portada. */
  types?: string[];
  generations?: number[];
  typeMode?: FilterMode;
  genMode?: FilterMode;
}

/** Categorías de catálogo: recursos de PokéAPI aún no mostrados en la web. */
export const CATALOG_CATEGORIES = ["items", "berries"] as const;

/** Fila de la matriz de efectividad (reglas vigentes desde la 6ª generación). */
export interface TypeMatrixType {
  id: number;
  /** Slug de PokéAPI, p. ej. `fire`. */
  slug: string;
  /** Nombre en español, p. ej. `Fuego`. */
  name: string;
  generation: number;
  damageClass: string;
  moveCount: number;
  /** Slugs de PokéAPI; el frontend los resuelve con su catálogo en español. */
  moveSlugs: string[];
  pokemonCount: number;
  /** Slugs de los tipos contra los que este tipo hace más/menos daño. */
  strongTo: string[];
  weakTo: string[];
  resists: string[];
  immuneTo: string[];
}

export interface TypeMatrixResponse {
  meta: {
    source: string;
    generatedAt: string;
    /** Reglas aplicadas: las vigentes desde la sexta generación. */
    generation: 6;
    count: number;
  };
  /** Ordenado alfabéticamente por nombre en español, como WikiDex. */
  types: TypeMatrixType[];
  /** `matrix[atacante][defensor]` → 2 | 1 | 0.5 | 0. */
  matrix: number[][];
}

export type CatalogCategory = (typeof CATALOG_CATEGORIES)[number];

/** Parámetros comunes del controlador; Pokémon ignora `q`, `group` y `offset`. */
export interface CatalogQuery {
  q: string;
  group: string | null;
  limit: number;
  offset: number;
}

export type DataCenterRequestQuery = DataCenterQuery & CatalogQuery;

/** Fila del índice de un catálogo (viene del listado de PokéAPI). */
export interface CatalogEntry {
  id: number;
  /** Slug de PokéAPI, p. ej. `fire-stone`. */
  name: string;
  /** Etiqueta legible; se prefiere la versión española cuando existe. */
  label: string;
  /** Recurso de origen dentro de la categoría (p. ej. `item`, `berry`). */
  group: string;
  sprite?: string;
  /** Categoría oficial de PokéAPI (solo objetos). */
  category?: string;
  /** Nombre en español de la categoría oficial. */
  categoryLabel?: string;
  /** Bolsa de PokéAPI donde se guarda el objeto. */
  pocket?: string;
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

/** Un dato del detalle, ya formateado para la interfaz. */
export interface CatalogAttribute {
  key: string;
  label: string;
  value: string;
  /** Los nombres de tipo se pintan con la insignia del tipo en el frontend. */
  isTypeName?: boolean;
}

export interface CatalogDetailResponse {
  category: CatalogCategory;
  id: number;
  name: string;
  label: string;
  group: string;
  sprite?: string;
  /** Efecto o descripción en español, cuando PokéAPI lo entrega. */
  summary?: string;
  attributes: CatalogAttribute[];
}
