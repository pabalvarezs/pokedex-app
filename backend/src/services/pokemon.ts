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
  species?: { name: string; url: string };
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
  speciesId?: number;
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
  evolutionChain?: EvolutionStage[];
  megaForms?: MegaForm[];
}

export interface EvolutionMember {
  id: number;
  name: string;
  condition?: string;
}

export interface EvolutionStage {
  members: EvolutionMember[];
}

export interface MegaForm {
  id: number;
  name: string;
  baseName: string;
  variant?: "X" | "Y";
  types: string[];
  sprite?: string;
  artwork?: string;
}

interface SpeciesVariety {
  name: string;
  url: string;
}

interface SpeciesInfo {
  description?: string;
  generation?: number;
  evolutionChainUrl?: string;
  varieties?: SpeciesVariety[];
}

interface EvolutionDetail {
  is_default?: boolean;
  trigger?: { name?: string };
  min_level?: number | null;
  min_happiness?: number | null;
  min_affection?: number | null;
  min_beauty?: number | null;
  item?: { name?: string } | null;
  held_item?: { name?: string } | null;
  known_move?: { name?: string } | null;
  known_move_type?: { name?: string } | null;
  location?: { name?: string } | null;
  gender?: number | null;
  needs_overworld_rain?: boolean;
  needs_multiplayer?: boolean;
  time_of_day?: string;
  trade_species?: { name?: string } | null;
  near_special_rock?: boolean;
  relative_physical_stats?: number | null;
  turn_upside_down?: boolean;
  min_steps?: number | null;
  min_damage_taken?: number | null;
  min_move_count?: number | null;
  used_move?: { name?: string } | null;
  condition_expression?: string | null;
}

export interface EvolutionChainLink {
  species: { name: string; url: string };
  evolution_details?: EvolutionDetail[];
  evolves_to?: EvolutionChainLink[];
}

interface EvolutionChainApiResponse {
  id: number;
  chain: EvolutionChainLink;
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
const speciesCache = new Map<string, CacheEntry<SpeciesInfo>>();
const evolutionChainCache = new Map<string, CacheEntry<EvolutionStage[]>>();
const megaFormCache = new Map<string, CacheEntry<MegaForm>>();
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

// --- Cadena evolutiva ---

const TYPE_NAMES_ES: Record<string, string> = {
  normal: "Normal",
  fire: "Fuego",
  water: "Agua",
  grass: "Planta",
  electric: "Eléctrico",
  ice: "Hielo",
  fighting: "Lucha",
  poison: "Veneno",
  ground: "Tierra",
  flying: "Volador",
  psychic: "Psíquico",
  bug: "Bicho",
  rock: "Roca",
  ghost: "Fantasma",
  dragon: "Dragón",
  dark: "Siniestro",
  steel: "Acero",
  fairy: "Hada",
};

const ITEM_NAMES_ES: Record<string, string> = {
  "water-stone": "Piedra Agua",
  "fire-stone": "Piedra Fuego",
  "thunder-stone": "Piedra Trueno",
  "leaf-stone": "Piedra Hoja",
  "moon-stone": "Piedra Lunar",
  "sun-stone": "Piedra Solar",
  "shiny-stone": "Piedra Brillante",
  "dusk-stone": "Piedra Noche",
  "dawn-stone": "Piedra Alba",
  "ice-stone": "Piedra Hielo",
  "oval-stone": "Piedra Oval",
  protector: "Protector",
  electirizer: "Electrizador",
  magmarizer: "Magmatizador",
  "dragon-scale": "Escama Dragón",
  "kings-rock": "Roca del Rey",
  "metal-coat": "Revestimiento Metálico",
  upgrade: "Mejora",
  "up-grade": "Mejora",
  "dubious-disc": "Disco Extraño",
  "reaper-cloth": "Tela Terrible",
  "prism-scale": "Escama Bella",
  "whipped-dream": "Nata Batida",
  sachet: "Saquito",
  "tart-apple": "Manzana Ácida",
  "sweet-apple": "Manzana Dulce",
  "syrupy-apple": "Manzana Melosa",
  "cracked-pot": "Olla Rota",
  "chipped-pot": "Olla Agrietada",
  "galarica-cuff": "Brazal Galanita",
  "galarica-wreath": "Corona Galanita",
  "razor-claw": "Garra Afilada",
  "razor-fang": "Colmillo Afilado",
  "deep-sea-tooth": "Diente Marino",
  "deep-sea-scale": "Escama Marina",
  "malicious-armor": "Armadura Maldita",
  "auspicious-armor": "Armadura Auspiciosa",
  "scroll-of-darkness": "Manuscrito de las Sombras",
  "scroll-of-waters": "Manuscrito de las Aguas",
  "unremarkable-teacup": "Taza de Té Corriente",
  "masterpiece-teacup": "Taza de Té Maestra",
  "metal-alloy": "Aleación Metálica",
  "black-augurite": "Augurita Negra",
  "peat-block": "Bloque de Turba",
};

function humanize(name: string): string {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function itemLabel(item?: { name?: string } | null): string | undefined {
  if (!item?.name) return undefined;
  return ITEM_NAMES_ES[item.name] ?? humanize(item.name);
}

/**
 * Traduce la condición de evolución que entrega PokéAPI. Se prefiere la
 * entrada marcada como predeterminada (la vigente en los juegos recientes).
 */
export function formatEvolutionCondition(
  details?: EvolutionDetail[]
): string | undefined {
  if (!details?.length) return undefined;

  const detail = details.find((entry) => entry.is_default) ?? details[0];
  const trigger = detail.trigger?.name ?? "";
  const parts: string[] = [];

  if (trigger === "level-up") {
    if (detail.min_level) parts.push(`Nivel ${detail.min_level}`);
    if (detail.min_happiness) parts.push(`Amistad ${detail.min_happiness}+`);
    if (detail.min_affection) parts.push(`Afecto ${detail.min_affection}+`);
    if (detail.min_beauty) parts.push(`Belleza ${detail.min_beauty}+`);
    if (detail.needs_overworld_rain) parts.push("Con lluvia");
    if (detail.time_of_day === "day") parts.push("De día");
    if (detail.time_of_day === "night") parts.push("De noche");
    if (detail.location?.name) parts.push(`En ${humanize(detail.location.name)}`);
    if (detail.near_special_rock) parts.push("Cerca de roca especial");
    if (detail.known_move?.name) parts.push(`Sabe ${humanize(detail.known_move.name)}`);
    if (detail.known_move_type?.name) {
      const type = TYPE_NAMES_ES[detail.known_move_type.name] ?? humanize(detail.known_move_type.name);
      parts.push(`Movimiento ${type}`);
    }
    if (detail.relative_physical_stats === 1) parts.push("Ataque > Defensa");
    else if (detail.relative_physical_stats === -1) parts.push("Ataque < Defensa");
    else if (detail.relative_physical_stats === 0) parts.push("Ataque = Defensa");
    if (detail.gender === 1) parts.push("Hembra");
    else if (detail.gender === 2) parts.push("Macho");
    if (detail.needs_multiplayer) parts.push("Multijugador");
    if (detail.turn_upside_down) parts.push("Consola girada");
    if (detail.min_steps) parts.push(`${detail.min_steps} pasos`);
    if (detail.min_damage_taken) parts.push(`Recibir ${detail.min_damage_taken}+ de daño`);
    if (detail.min_move_count) parts.push(`Usar el movimiento ${detail.min_move_count} veces`);
    if (detail.used_move?.name) parts.push(`Usar ${humanize(detail.used_move.name)}`);
    if (parts.length === 0) parts.push("Subir de nivel");
  } else if (trigger === "use-item") {
    const item = itemLabel(detail.item);
    parts.push(item ? `Usar ${item}` : "Usar un objeto");
  } else if (trigger === "trade") {
    if (detail.trade_species?.name) {
      parts.push(`Intercambio por ${humanize(detail.trade_species.name)}`);
    } else {
      parts.push("Intercambio");
    }
    const heldItem = itemLabel(detail.held_item);
    if (heldItem) parts.push(`Con ${heldItem}`);
  } else if (trigger === "shed") {
    parts.push("Mudar");
  } else if (trigger === "spin") {
    parts.push("Girar");
  } else if (trigger === "tower-of-darkness") {
    parts.push("Torre de la Oscuridad");
  } else if (trigger === "tower-of-waters") {
    parts.push("Torre de las Aguas");
  } else if (trigger === "three-critical-hits") {
    parts.push("3 golpes críticos");
  } else if (trigger === "take-damage") {
    parts.push("Recibir daño");
  } else if (trigger === "agile-style") {
    parts.push("Estilo ágil");
  } else if (trigger === "strong-style") {
    parts.push("Estilo fuerte");
  } else if (trigger) {
    parts.push(humanize(trigger));
  }

  if (parts.length === 0 && detail.condition_expression) {
    return humanize(detail.condition_expression);
  }

  return parts.length > 0 ? parts.join(" · ") : undefined;
}

/**
 * Recorre el árbol de evoluciones y lo agrupa por profundidad. Así las
 * ramificaciones (por ejemplo, las evoluciones de Eevee) quedan en una
 * misma etapa y se pueden mostrar en grilla.
 */
export function buildEvolutionStages(chain: EvolutionChainLink): EvolutionStage[] {
  const stages: EvolutionStage[] = [];

  const visit = (
    node: EvolutionChainLink,
    depth: number,
    condition?: string
  ) => {
    const rawId = node.species.url.split("/").filter(Boolean).pop();
    const id = Number(rawId);
    if (!rawId || !Number.isInteger(id) || id <= 0) return;

    if (!stages[depth]) stages[depth] = { members: [] };
    stages[depth].members.push({
      id,
      name: node.species.name,
      ...(condition ? { condition } : {}),
    });

    for (const child of node.evolves_to ?? []) {
      visit(child, depth + 1, formatEvolutionCondition(child.evolution_details));
    }
  };

  visit(chain, 0);
  return stages.filter(Boolean);
}

async function getEvolutionChain(url: string): Promise<EvolutionStage[]> {
  const chainId = url.split("/").filter(Boolean).pop();
  if (!chainId) return [];

  const cached = cacheGet(evolutionChainCache, chainId);
  if (cached) return cached;

  try {
    const { data } = await api.get<EvolutionChainApiResponse>(
      `/evolution-chain/${encodeURIComponent(chainId)}`
    );
    const stages = buildEvolutionStages(data.chain);
    cacheSet(evolutionChainCache, chainId, stages);
    return stages;
  } catch {
    return [];
  }
}

/**
 * De todas las variedades de una especie, deja solo las Mega. Excluye
 * deliberadamente las formas Gigamax y cualquier otra variante.
 */
export function pickMegaVarieties<T extends { name: string }>(
  varieties: T[] | undefined
): T[] {
  return (varieties ?? []).filter((variety) =>
    /-mega(?:-[xy])?$/.test(variety.name)
  );
}

async function getMegaForm(
  variety: SpeciesVariety,
  baseName: string
): Promise<MegaForm | null> {
  const cached = cacheGet(megaFormCache, variety.name);
  if (cached) return cached;

  try {
    const { data } = await api.get<PokemonApiResponse>(
      `/pokemon/${encodeURIComponent(variety.name)}`
    );
    const variant = variety.name.match(/-mega-([xy])$/)?.[1]?.toUpperCase();
    const form: MegaForm = {
      id: data.id,
      name: data.name,
      baseName,
      ...(variant === "X" || variant === "Y" ? { variant } : {}),
      types: data.types.map((t) => t.type.name),
      sprite: data.sprites?.front_default,
      artwork: data.sprites?.other?.["official-artwork"]?.front_default,
    };

    cacheSet(megaFormCache, variety.name, form);
    return form;
  } catch {
    return null;
  }
}

/**
 * Busca las Mega formas de la última etapa de la cadena. Se consultan las
 * variedades de cada especie final porque las megas no viven en evolution-chain.
 */
async function getMegaForms(stages: EvolutionStage[]): Promise<MegaForm[]> {
  const finalStage = stages[stages.length - 1];
  if (!finalStage) return [];

  const groups = await mapWithConcurrency(
    finalStage.members,
    8,
    async (member) => {
      const speciesInfo = await getSpeciesInfo(member.id);
      const varieties = pickMegaVarieties(speciesInfo.varieties);
      return Promise.all(
        varieties.map((variety) => getMegaForm(variety, member.name))
      );
    }
  );

  const seen = new Set<number>();
  return groups.flat().filter((form): form is MegaForm => {
    if (!form || seen.has(form.id)) return false;
    seen.add(form.id);
    return true;
  });
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

  let result: SpeciesInfo = {};
  try {
    const { data } = await api.get(`/pokemon-species/${encodeURIComponent(cacheKey)}`);
    const esEntry =
      data.flavor_text_entries?.find((e: any) => e.language?.name === "es") ||
      data.flavor_text_entries?.find((e: any) => e.language?.name === "en");
    const description = esEntry ? esEntry.flavor_text.replace(/[\f\n\r]/g, " ") : undefined;
    const genMatch = data.generation?.url?.split("/").filter(Boolean).pop();
    const generation = genMatch ? Number(genMatch) : undefined;
    const varieties: SpeciesVariety[] = Array.isArray(data.varieties)
      ? data.varieties
          .map((variety: any) => ({
            name: variety.pokemon?.name,
            url: variety.pokemon?.url,
          }))
          .filter(
            (variety: SpeciesVariety): variety is SpeciesVariety =>
              Boolean(variety.name && variety.url)
          )
      : [];
    result = {
      description,
      generation,
      evolutionChainUrl: data.evolution_chain?.url,
      varieties,
    };
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
  const speciesInfo = await getSpeciesInfo(data.species?.name ?? data.id);
  const speciesRawId = data.species?.url?.split("/").filter(Boolean).pop();
  const speciesId = speciesRawId ? Number(speciesRawId) : undefined;

  const [evolutionChain, abilities, moves] = await Promise.all([
    speciesInfo.evolutionChainUrl
      ? getEvolutionChain(speciesInfo.evolutionChainUrl)
      : Promise.resolve<EvolutionStage[]>([]),
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

  const megaForms = await getMegaForms(evolutionChain);

  const pokemon: Pokemon = {
    id: data.id,
    name: data.name,
    speciesId:
      speciesId && Number.isInteger(speciesId) && speciesId > 0
        ? speciesId
        : undefined,
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
    evolutionChain,
    megaForms,
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
