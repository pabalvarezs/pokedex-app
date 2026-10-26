import axios from "axios";

const POKEAPI = "https://pokeapi.co/api/v2";
const api = axios.create({ baseURL: POKEAPI, timeout: 10000 });

export interface PokemonSummary {
  id: number;
  name: string;
  url: string;
  types?: string[];
}

export interface PokemonListResult {
  pokemon: PokemonSummary[];
  total: number;
}

interface PokemonTypeSlot {
  slot: number;
  type: { name: string; url: string };
}

interface PokemonStatSlot {
  base_stat: number;
  stat: { name: string };
}

interface PokemonAbilitySlot {
  ability: { name: string };
  is_hidden: boolean;
}

interface PokemonMoveSlot {
  move: { name: string };
}

interface PokemonApiResponse {
  id: number;
  name: string;
  types: PokemonTypeSlot[];
  sprites: Record<string, any>;
  height: number;
  weight: number;
  base_experience?: number;
  stats?: PokemonStatSlot[];
  abilities?: PokemonAbilitySlot[];
  moves?: PokemonMoveSlot[];
  cries?: { latest?: string; legacy?: string };
}

export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  generation?: number;
  sprites?: Record<string, any>;
  height?: number;
  weight?: number;
  base_experience?: number;
  stats?: { name: string; base_stat: number }[];
  abilities?: { name: string; is_hidden: boolean }[];
  moves?: string[];
  cries?: { latest?: string; legacy?: string };
  description?: string;
}

// Cachés en memoria para no saturar la API
const abilityCache = new Map<string, string>();
const moveCache = new Map<string, string>();

const CACHE_TTL_MS = 10 * 60 * 1000;
const ENRICH_CONCURRENCY = 10;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const rawPokemonCache = new Map<string, CacheEntry<PokemonApiResponse>>();
const speciesCache = new Map<string, CacheEntry<{ description?: string; generation?: number }>>();
const detailCache = new Map<string, CacheEntry<Pokemon>>();

function cacheGet<T>(cache: Map<string, CacheEntry<T>>, key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

function cacheSet<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T) {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await fn(items[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker())
  );
  return results;
}

const COMMON_ABILITIES_ES: Record<string, string> = {
  overgrow: "Espesura",
  chlorophyll: "Clorofila",
  blaze: "Mar Llamas",
  "solar-power": "Poder Solar",
  torrent: "Torrente",
  "rain-dish": "Cura Lluvia",
  "shield-dust": "Polvo Escudo",
  "run-away": "Fuga",
  "shed-skin": "Mudar",
  "compound-eyes": "Ojo Compuesto",
  "tinted-lens": "Cromolente",
  swarm: "Enjambre",
  sniper: "Francotirador",
  "keen-eye": "Vista Lince",
  "tangled-feet": "Tumbos",
  "big-pecks": "Sacapecho",
  guts: "Agallas",
  hustle: "Entusiasmo",
  intimidate: "Intimidación",
  unnerve: "Nerviosismo",
  static: "Electricidad Estática",
  "lightning-rod": "Pararrayos",
  "sand-veil": "Velo Arena",
  "sand-rush": "Ímpetu Arena",
  "poison-point": "Punto Tóxico",
  rivalry: "Rivalidad",
  "cute-charm": "Gran Encanto",
  "magic-guard": "Muro Mágico",
  "flash-fire": "Absorbe Fuego",
  drought: "Sequía",
  drizzle: "Llovizna",
  competitive: "Tenacidad",
  frisk: "Cacheo",
  levitate: "Levitación",
  synchronize: "Sincronía",
  "inner-focus": "Foco Interno",
  infiltrator: "Allanamiento",
  stench: "Hedor",
  damp: "Humedad",
  "water-absorb": "Absorbe Agua",
  "volt-absorb": "Absorbe Elec",
  pressure: "Presión",
  "super-luck": "Afortunado",
  justified: "Justiciero",
  rattled: "Cobardía",
  moxie: "Autoestima",
  imposter: "Impostor",
  adaptability: "Adaptable",
  anticipation: "Anticipación",
  sturdy: "Robustez",
  "clear-body": "Cuerpo Puro",
  "natural-cure": "Cura Natural",
  "serene-grace": "Dicha",
  trace: "Rastro",
  "huge-power": "Potencia",
  "thick-fat": "Sebo",
  "snow-warning": "Nevada",
  "sand-stream": "Chorro Arena",
  "speed-boost": "Impulso",
  "battle-armor": "Armadura Batalla",
  disguise: "Disfraz",
  "beast-boost": "Ultraimpulso",
};

const COMMON_MOVES_ES: Record<string, string> = {
  tackle: "Placaje",
  growl: "Gruñido",
  scratch: "Arañazo",
  "tail-whip": "Látigo",
  ember: "Ascuas",
  "water-gun": "Pistola Agua",
  "vine-whip": "Látigo Cepa",
  "thunder-shock": "Impactrueno",
  "quick-attack": "Ataque Rápido",
  bite: "Mordisco",
  "hyper-beam": "Híper Rayo",
  surf: "Surf",
  thunderbolt: "Rayo",
  thunder: "Trueno",
  earthquake: "Terremoto",
  psychic: "Psíquico",
  "shadow-ball": "Bola Sombra",
  flamethrower: "Lanzallamas",
  "fire-blast": "Llamarada",
  "hydro-pump": "Hidrobomba",
  "ice-beam": "Rayo Hielo",
  blizzard: "Ventisca",
  fly: "Vuelo",
  dig: "Excavar",
  leer: "Malicioso",
  "mega-drain": "Megaagotar",
  "giga-drain": "Gigadrenado",
  "solar-beam": "Rayo Solar",
  "poison-powder": "Polvo Veneno",
  "sleep-powder": "Somnífero",
  "sweet-scent": "Dulce Aroma",
  synthesis: "Síntesis",
  protect: "Protección",
  substitute: "Sustituto",
  rest: "Descanso",
  toxic: "Tóxico",
  "swords-dance": "Danza Espada",
  agility: "Agilidad",
  recover: "Recuperación",
  "double-team": "Doble Equipo",
  reflect: "Reflejo",
  "light-screen": "Pantalla de Luz",
  slash: "Cuchillada",
  "dragon-claw": "Garra Dragón",
  "iron-tail": "Cola Férrea",
  "close-combat": "A Bocajarro",
  "aura-sphere": "Esfera Aural",
  "stone-edge": "Roca Afilada",
  "stealth-rock": "Trampa Rocas",
  roost: "Respiro",
  "u-turn": "Ida y Vuelta",
  "volt-switch": "Voltiocambio",
  scald: "Escaldar",
  "bullet-punch": "Puño Bala",
  "mach-punch": "Ultrapuño",
  "ice-shard": "Canto Helado",
  "shadow-sneak": "Sombra Vil",
  "sucker-punch": "Golpe Bajo",
  "extreme-speed": "Velocidad Extrema",
  "calm-mind": "Paz Mental",
  "nasty-plot": "Maquinación",
  "dragon-dance": "Danza Dragón",
  slam: "Atizar",
  pound: "Destructor",
  "mega-punch": "Megapuño",
  "fire-punch": "Puño Fuego",
  "ice-punch": "Puño Hielo",
  "thunder-punch": "Puño Trueno",
  gust: "Tornado",
  "wing-attack": "Ataque Ala",
  whirlwind: "Remolino",
  cut: "Corte",
  "headbutt": "Golpe Cabeza",
  sing: "Canto",
  supersonic: "Supersónico",
  psybeam: "Psicorrayo",
  disable: "Anulación",
  acid: "Ácido",
  hypnosis: "Hipnosis",
  waterfall: "Cascada",
};

export async function translateAbility(name: string): Promise<string> {
  const normalized = name.toLowerCase();
  if (COMMON_ABILITIES_ES[normalized]) return COMMON_ABILITIES_ES[normalized];
  if (abilityCache.has(normalized)) return abilityCache.get(normalized)!;

  try {
    const { data } = await api.get(`/ability/${normalized}`);
    const es = data.names?.find((n: any) => n.language?.name === "es")?.name;
    const result = es || normalized.replace(/-/g, " ");
    abilityCache.set(normalized, result);
    return result;
  } catch {
    const fallback = normalized.replace(/-/g, " ");
    abilityCache.set(normalized, fallback);
    return fallback;
  }
}

export async function translateMove(name: string): Promise<string> {
  const normalized = name.toLowerCase();
  if (COMMON_MOVES_ES[normalized]) return COMMON_MOVES_ES[normalized];
  if (moveCache.has(normalized)) return moveCache.get(normalized)!;

  try {
    const { data } = await api.get(`/move/${normalized}`);
    const es = data.names?.find((n: any) => n.language?.name === "es")?.name;
    const result = es || normalized.replace(/-/g, " ");
    moveCache.set(normalized, result);
    return result;
  } catch {
    const fallback = normalized.replace(/-/g, " ");
    moveCache.set(normalized, fallback);
    return fallback;
  }
}

async function getRawPokemon(key: number | string): Promise<PokemonApiResponse> {
  const normalized = String(key).trim().toLowerCase();
  const cached = cacheGet(rawPokemonCache, normalized);
  if (cached) return cached;

  const { data } = await api.get<PokemonApiResponse>(
    `/pokemon/${encodeURIComponent(normalized)}`
  );
  cacheSet(rawPokemonCache, normalized, data);
  cacheSet(rawPokemonCache, String(data.id), data);
  return data;
}

async function getSpeciesInfo(idOrName: number | string) {
  const cacheKey = String(idOrName).trim().toLowerCase();
  const cached = cacheGet(speciesCache, cacheKey);
  if (cached) return cached;

  let result: { description?: string; generation?: number } = {};
  try {
    const { data } = await api.get(`/pokemon-species/${encodeURIComponent(cacheKey)}`);
    const esEntry =
      data.flavor_text_entries?.find((e: any) => e.language?.name === "es") ||
      data.flavor_text_entries?.find((e: any) => e.language?.name === "en");
    const description = esEntry ? esEntry.flavor_text.replace(/[\f\n\r]/g, " ") : undefined;
    const genMatch = data.generation?.url?.split("/").filter(Boolean).pop();
    const generation = genMatch ? Number(genMatch) : undefined;
    result = { description, generation };
    cacheSet(speciesCache, String(data.id), result);
  } catch {
    result = { description: undefined, generation: undefined };
  }

  cacheSet(speciesCache, cacheKey, result);
  return result;
}

async function enrichWithTypes(summaries: PokemonSummary[]): Promise<PokemonSummary[]> {
  return mapWithConcurrency(summaries, ENRICH_CONCURRENCY, async (summary) => {
    try {
      const raw = await getRawPokemon(summary.id);
      return { ...summary, types: raw.types.map((t) => t.type.name) };
    } catch {
      return summary;
    }
  });
}

export async function listPokemon(limit = 20, offset = 0): Promise<PokemonListResult> {
  const { data } = await api.get<{ count: number; results: PokemonSummary[] }>("/pokemon", {
    params: { limit, offset },
  });

  const summaries = data.results.map((p) => ({
    id: Number(p.url.split("/").filter(Boolean).pop()),
    name: p.name,
    url: p.url,
  }));

  return { pokemon: await enrichWithTypes(summaries), total: data.count };
}

export async function listPokemonByType(type: string): Promise<PokemonSummary[]> {
  const { data } = await api.get<{ pokemon: { pokemon: PokemonSummary }[] }>(
    `/type/${encodeURIComponent(type.toLowerCase())}`
  );
  const summaries = data.pokemon.map((entry) => {
    const p = entry.pokemon;
    const id = Number(p.url.split("/").filter(Boolean).pop());
    return {
      id,
      name: p.name,
      url: p.url,
    };
  });

  return enrichWithTypes(summaries);
}

export async function listPokemonByGeneration(gen: number): Promise<PokemonSummary[]> {
  const { data } = await api.get<{ pokemon_species: PokemonSummary[] }>(
    `/generation/${gen}`
  );
  const summaries = data.pokemon_species
    .map((p) => {
      const id = Number(p.url.split("/").filter(Boolean).pop());
      return {
        id,
        name: p.name,
        url: p.url,
      };
    })
    .sort((a, b) => a.id - b.id);

  return enrichWithTypes(summaries);
}

async function fetchPokemonDetail(key: number | string): Promise<Pokemon> {
  const cacheKey = String(key).trim().toLowerCase();
  const cached = cacheGet(detailCache, cacheKey);
  if (cached) return cached;

  const data = await getRawPokemon(cacheKey);
  const speciesInfo = await getSpeciesInfo(data.id);

  const [abilities, moves] = await Promise.all([
    Promise.all(
      (data.abilities ?? []).map(async (a) => ({
        name: await translateAbility(a.ability.name),
        is_hidden: a.is_hidden,
      }))
    ),
    Promise.all(
      (data.moves ?? []).slice(0, 24).map((m) => translateMove(m.move.name))
    ),
  ]);

  const pokemon: Pokemon = {
    id: data.id,
    name: data.name,
    types: data.types.map((t) => t.type.name),
    generation: speciesInfo.generation ?? 1,
    sprites: data.sprites,
    height: data.height,
    weight: data.weight,
    base_experience: data.base_experience,
    stats: data.stats?.map((s) => ({ name: s.stat.name, base_stat: s.base_stat })) ?? [],
    abilities,
    moves,
    cries: data.cries,
    description: speciesInfo.description,
  };

  cacheSet(detailCache, cacheKey, pokemon);
  cacheSet(detailCache, String(data.id), pokemon);
  return pokemon;
}

export function searchPokemon(name: string): Promise<Pokemon> {
  return fetchPokemonDetail(name.trim().toLowerCase());
}

export function getPokemonById(id: number): Promise<Pokemon> {
  return fetchPokemonDetail(id);
}

// --- Búsqueda predictiva ---

export interface PokemonSuggestion {
  id: number;
  name: string;
}

const NAME_INDEX_TTL_MS = 24 * 60 * 60 * 1000;

let nameIndexCache: CacheEntry<PokemonSuggestion[]> | null = null;
let nameIndexRequest: Promise<PokemonSuggestion[]> | null = null;

function normalizeQuery(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Ordena un índice de nombres según qué tan bien calza con la búsqueda:
 * 1) coincidencia exacta por número, 2) prefijo, 3) inicio de palabra,
 * 4) coincidencia parcial. Función pura para poder testearla sin red.
 */
export function rankSuggestions(
  index: PokemonSuggestion[],
  query: string,
  limit = 8
): PokemonSuggestion[] {
  const raw = query.trim().toLowerCase();
  if (!raw) return [];

  const normalized = normalizeQuery(raw);
  const compact = raw.replace(/[^a-z0-9]+/g, "");
  if (!normalized && !compact) return [];

  const numericId = /^\d+$/.test(raw) ? Number(raw) : null;
  const max = Math.min(Math.max(Math.trunc(limit) || 8, 1), 20);
  const scored: { entry: PokemonSuggestion; score: number }[] = [];

  for (const entry of index) {
    if (numericId !== null && entry.id === numericId) {
      scored.push({ entry, score: 0 });
      continue;
    }

    const name = entry.name.toLowerCase();
    const compactName = name.replace(/[^a-z0-9]+/g, "");
    const words = normalizeQuery(name).split(" ").filter(Boolean);

    let score = 0;
    if (name.startsWith(raw) || (compact && compactName.startsWith(compact))) {
      score = 1;
    } else if (normalized && words.some((word) => word.startsWith(normalized))) {
      score = 2;
    } else if (name.includes(raw) || (compact && compactName.includes(compact))) {
      score = 3;
    }

    if (score > 0) scored.push({ entry, score });
  }

  scored.sort((a, b) => a.score - b.score || a.entry.id - b.entry.id);
  return scored.slice(0, max).map((item) => item.entry);
}

async function fetchNameIndex(): Promise<PokemonSuggestion[]> {
  const { data } = await api.get<{ results: { name: string; url: string }[] }>("/pokemon", {
    params: { limit: 100000, offset: 0 },
  });

  return data.results
    .map((p) => ({
      id: Number(p.url.split("/").filter(Boolean).pop()),
      name: p.name,
    }))
    .filter((p) => Number.isInteger(p.id) && p.id > 0);
}

async function getNameIndex(): Promise<PokemonSuggestion[]> {
  if (nameIndexCache && nameIndexCache.expiresAt > Date.now()) {
    return nameIndexCache.value;
  }

  if (!nameIndexRequest) {
    nameIndexRequest = fetchNameIndex()
      .then((value) => {
        nameIndexCache = { value, expiresAt: Date.now() + NAME_INDEX_TTL_MS };
        return value;
      })
      .finally(() => {
        nameIndexRequest = null;
      });
  }

  return nameIndexRequest;
}

export async function suggestPokemon(
  query: string,
  limit = 8
): Promise<PokemonSuggestion[]> {
  const index = await getNameIndex();
  return rankSuggestions(index, query, limit);
}
