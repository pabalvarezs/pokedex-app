/**
 * Catálogo de variantes y formas Pokémon.
 *
 * La pertenencia de una forma a una especie NO se decide aquí: la entrega
 * PokeAPI en `pokemon-species.varieties`. Este módulo clasifica esas
 * variedades, les añade metadatos curados y construye la familia que consume
 * la ficha individual.
 *
 * Para añadir una categoría basta con registrarla en `VARIANT_CATEGORIES`.
 * Para añadir una variante nueva no hay que tocar el frontend: si PokéAPI la
 * publica dentro de `varieties`, aparecerá automáticamente.
 */
import { gmaxVariantLabel } from "./gmaxLabels";

export type VariantTone =
  | "teal"
  | "violet"
  | "indigo"
  | "rose"
  | "amber"
  | "sky"
  | "fuchsia"
  | "emerald"
  | "slate"
  | "orange"
  | "stone";

export type VariantSection = "variants" | "mega" | "dynamax";
export type VariantPermanence = "permanent" | "temporary" | "battle";
export type VariantAffects = "appearance" | "stats" | "both";
export type VariantAvailability = "playable" | "event" | "npc" | "unavailable";
export type VariantKind = "record" | "state";

export type VariantCategoryKey =
  | "regional"
  | "mega"
  | "primal"
  | "gmax"
  | "battle"
  | "cosmetic"
  | "attire"
  | "gender"
  | "alt-form"
  | "totem"
  | "special"
  | "non-playable";

export interface VariantCategoryDefinition {
  key: VariantCategoryKey;
  label: string;
  shortLabel: string;
  description: string;
  emoji: string;
  tone: VariantTone;
  /** Sección de la ficha donde se muestra: esta o una ya existente. */
  section: VariantSection;
  /** Orden de presentación dentro de la familia. */
  order: number;
  defaultPermanence: VariantPermanence;
  defaultAffects: VariantAffects;
  defaultAvailability: VariantAvailability;
  defaultCondition?: string;
  /** Ancla de la página de WikiDex que inspira la categoría. */
  wikiSection?: string;
}

export interface VariantCategoryRef {
  key: VariantCategoryKey;
  label: string;
  shortLabel: string;
  description: string;
  emoji: string;
  tone: VariantTone;
  section: VariantSection;
}

export interface PokemonVariant {
  id: number;
  name: string;
  displayName: string;
  category: VariantCategoryRef;
  description: string;
  condition?: string;
  region?: string;
  permanence: VariantPermanence;
  affects: VariantAffects;
  availability: VariantAvailability;
  kind: VariantKind;
  navigable: boolean;
  order: number;
  isDefault: boolean;
  isCurrent: boolean;
  sprite: string;
  artwork: string;
  types?: string[];
}

export interface PokemonVariantFamily {
  speciesId: number;
  speciesName: string;
  baseId: number;
  baseName: string;
  baseDisplayName: string;
  baseSprite: string;
  baseArtwork: string;
  baseTypes?: string[];
  currentId: number;
  currentName: string;
  currentDisplayName: string;
  currentCategory?: VariantCategoryRef;
  isDefault: boolean;
  total: number;
  variants: PokemonVariant[];
  /** Pokémon paradoja relacionados por lore (no por varieties de PokéAPI). */
  paradoxRelatives?: ParadoxRelative[];
}

/** Entrada mínima de `pokemon-species.varieties`. */
export interface VariantFamilySource {
  name: string;
  url: string;
  isDefault?: boolean;
}

const WIKIDEX = "https://www.wikidex.net/wiki/Lista_de_Pok%C3%A9mon_con_diferentes_formas";

/**
 * Registro central de categorías. El orden de este arreglo alimenta el orden
 * de los chips y de las tarjetas. Añadir una categoría aquí es suficiente
 * para que el backend la entregue y el frontend la pinte.
 */
export const VARIANT_CATEGORIES: VariantCategoryDefinition[] = [
  {
    key: "regional",
    label: "Formas regionales",
    shortLabel: "Regional",
    description:
      "Variante adaptada al ecosistema de una región concreta; puede cambiar tipo, estadísticas y habilidades.",
    emoji: "🗺️",
    tone: "teal",
    section: "variants",
    order: 10,
    defaultPermanence: "permanent",
    defaultAffects: "both",
    defaultAvailability: "playable",
    defaultCondition: "Forma nativa de la región",
    wikiSection: "Formas_regionales",
  },
  {
    key: "mega",
    label: "Megaevoluciones",
    shortLabel: "Mega",
    description:
      "Transformación temporal durante el combate gracias a la Megaenergía.",
    emoji: "💥",
    tone: "violet",
    section: "mega",
    order: 20,
    defaultPermanence: "temporary",
    defaultAffects: "both",
    defaultAvailability: "playable",
    defaultCondition: "Requiere Megaenergía y la Megapiedra correspondiente",
    wikiSection: "Megaevolución",
  },
  {
    key: "primal",
    label: "Formas primigenias",
    shortLabel: "Primigenia",
    description:
      "Regresión primigenia que despierta el poder latente de un Pokémon legendario.",
    emoji: "🌊",
    tone: "indigo",
    section: "variants",
    order: 30,
    defaultPermanence: "temporary",
    defaultAffects: "both",
    defaultAvailability: "playable",
    defaultCondition: "Requiere el objeto legendario correspondiente",
    wikiSection: "Kyogre_y_Groudon",
  },
  {
    key: "gmax",
    label: "Gigamax",
    shortLabel: "Gigamax",
    description:
      "Forma Gigamax: el Pokémon crece y obtiene un movimiento G-Max exclusivo.",
    emoji: "🌋",
    tone: "rose",
    section: "dynamax",
    order: 40,
    defaultPermanence: "temporary",
    defaultAffects: "appearance",
    defaultAvailability: "playable",
    defaultCondition: "Requiere el Factor Gigamax",
    wikiSection: "Fenómeno_Gigamax",
  },
  {
    key: "battle",
    label: "Formas de combate",
    shortLabel: "Combate",
    description:
      "Forma que se activa bajo una condición de combate y es reversible.",
    emoji: "⚔️",
    tone: "amber",
    section: "variants",
    order: 50,
    defaultPermanence: "battle",
    defaultAffects: "both",
    defaultAvailability: "playable",
    defaultCondition: "Se activa durante el combate",
    wikiSection: "Pokémon_que_cambian_de_forma_en_combate",
  },
  {
    key: "cosmetic",
    label: "Variantes estéticas",
    shortLabel: "Estética",
    description:
      "Cambio de apariencia sin alterar las características de combate.",
    emoji: "🎨",
    tone: "sky",
    section: "variants",
    order: 60,
    defaultPermanence: "permanent",
    defaultAffects: "appearance",
    defaultAvailability: "playable",
    defaultCondition: "Rasgo visual al capturar",
    wikiSection: "Forma_distinta_permanente",
  },
  {
    key: "attire",
    label: "Atuendos y accesorios",
    shortLabel: "Atuendo",
    description:
      "Atuendo, gorra o accesorio especial que no altera las características.",
    emoji: "🎩",
    tone: "fuchsia",
    section: "variants",
    order: 70,
    defaultPermanence: "permanent",
    defaultAffects: "appearance",
    defaultAvailability: "event",
    defaultCondition: "Distribución especial o evento",
    wikiSection: "Pikachu_2",
  },
  {
    key: "gender",
    label: "Variantes de género",
    shortLabel: "Género",
    description:
      "Variante asociada al sexo del Pokémon, con apariencia diferenciada.",
    emoji: "♂♀",
    tone: "emerald",
    section: "variants",
    order: 80,
    defaultPermanence: "permanent",
    defaultAffects: "both",
    defaultAvailability: "playable",
    defaultCondition: "Según el sexo del Pokémon",
    wikiSection: "Diferencias_de_sexo",
  },
  {
    key: "alt-form",
    label: "Formas alternativas",
    shortLabel: "Alternativa",
    description: "Forma alternativa permanente propia de la especie.",
    emoji: "🔀",
    tone: "slate",
    section: "variants",
    order: 90,
    defaultPermanence: "permanent",
    defaultAffects: "both",
    defaultAvailability: "playable",
    defaultCondition: "Cambio de forma permanente",
    wikiSection: "Pokémon_que_cambian_de_forma_fuera_de_combate",
  },
  {
    key: "totem",
    label: "Formas totémicas",
    shortLabel: "Totem",
    description:
      "Forma de mayor tamaño usada por Pokémon totémicos; no está pensada para el jugador.",
    emoji: "🗿",
    tone: "stone",
    section: "variants",
    order: 100,
    defaultPermanence: "permanent",
    defaultAffects: "both",
    defaultAvailability: "npc",
    defaultCondition: "Encuentro de jefe totémico",
    wikiSection: "Forma_distinta_no_jugable",
  },
  {
    key: "special",
    label: "Variantes especiales",
    shortLabel: "Especial",
    description: "Presentación especial registrada para esta especie.",
    emoji: "✨",
    tone: "orange",
    section: "variants",
    order: 110,
    defaultPermanence: "permanent",
    defaultAffects: "both",
    defaultAvailability: "event",
    wikiSection: "Forma_distinta_permanente",
  },
  {
    key: "non-playable",
    label: "Formas no jugables",
    shortLabel: "No jugable",
    description:
      "Forma que solo aparece en la historia o como jefe; no se puede obtener.",
    emoji: "🚫",
    tone: "stone",
    section: "variants",
    order: 120,
    defaultPermanence: "permanent",
    defaultAffects: "both",
    defaultAvailability: "npc",
    defaultCondition: "Solo aparece en la historia",
    wikiSection: "Forma_distinta_no_jugable",
  },
];

const CATEGORY_BY_KEY = new Map(
  VARIANT_CATEGORIES.map((category) => [category.key, category])
);

export function getVariantCategory(
  key: VariantCategoryKey
): VariantCategoryDefinition {
  return CATEGORY_BY_KEY.get(key) ?? CATEGORY_BY_KEY.get("alt-form")!;
}

export function variantCategoryRef(
  key: VariantCategoryKey
): VariantCategoryRef {
  const category = getVariantCategory(key);
  return {
    key: category.key,
    label: category.label,
    shortLabel: category.shortLabel,
    description: category.description,
    emoji: category.emoji,
    tone: category.tone,
    section: category.section,
  };
}

interface VariantMetadata {
  category?: VariantCategoryKey;
  displayName?: string;
  description?: string;
  condition?: string;
  region?: string;
  permanence?: VariantPermanence;
  affects?: VariantAffects;
  availability?: VariantAvailability;
  order?: number;
}

const REGION_LABEL: Record<string, string> = {
  alola: "Alola",
  galar: "Galar",
  hisui: "Hisui",
  paldea: "Paldea",
};

const BASE_DISPLAY_NAMES: Record<string, string> = {
  "mr-mime": "Mr. Mime",
  "mime-jr": "Mime Jr.",
  farfetchd: "Farfetch'd",
  sirfetchd: "Sirfetch'd",
  "ho-oh": "Ho-Oh",
  "porygon-z": "Porygon-Z",
  "type-null": "Type: Null",
  "nidoran-f": "Nidoran ♀",
  "nidoran-m": "Nidoran ♂",
  flabebe: "Flabébé",
};

function prettyName(value: string): string {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function baseDisplayName(slug: string): string {
  return BASE_DISPLAY_NAMES[slug] ?? prettyName(slug);
}

function idFromUrl(url?: string): number | undefined {
  if (!url) return undefined;
  const raw = url.split("/").filter(Boolean).pop();
  const id = Number(raw);
  return raw && Number.isInteger(id) && id > 0 ? id : undefined;
}

function detectRegion(slug: string): string | undefined {
  for (const [key, label] of Object.entries(REGION_LABEL)) {
    if (new RegExp(`(^|-)${key}(-|$)`).test(slug)) return label;
  }
  return undefined;
}

const SUFFIX_ES: Record<string, string> = {
  attack: "ataque",
  defense: "defensa",
  speed: "velocidad",
  origin: "origen",
  therian: "forma tótem",
  black: "negro",
  white: "blanco",
  resolute: "resoluto",
  unbound: "desatado",
  sky: "cielo",
  heat: "calor",
  wash: "lavado",
  frost: "frío",
  fan: "ventilador",
  mow: "cortacésped",
  midnight: "nocturno",
  dusk: "crepuscular",
  "low-key": "grave",
  "rapid-strike": "fluida",
  "single-strike": "brusca",
  small: "pequeño",
  large: "grande",
  super: "enorme",
  sandy: "tronco arena",
  trash: "tronco basura",
  "blue-striped": "raya azul",
  "white-striped": "raya blanca",
  red: "rojo",
  orange: "naranja",
  yellow: "amarillo",
  green: "verde",
  blue: "azul",
  indigo: "añil",
  violet: "violeta",
  meteor: "meteorito",
  "blue-plumage": "plumaje azul",
  "yellow-plumage": "plumaje amarillo",
  "white-plumage": "plumaje blanco",
  "family-of-three": "familia de tres",
  "family-of-four": "familia de cuatro",
  "three-segment": "tres segmentos",
  ice: "glacial",
  shadow: "espectral",
  "pom-pom": "pompón",
  pau: "plumé",
  sensu: "sensu",
  starter: "de compañero",
  dada: "papá",
  original: "original",
  bloodmoon: "luna carmesí",
  roaming: "errante",
  eternal: "eterna",
  female: "hembra",
  male: "macho",
  "10": "10%",
  complete: "completo",
  standard: "",
};

function translateTokens(tokens: string[]): string {
  return tokens
    .filter(Boolean)
    .map((token) => SUFFIX_ES[token] ?? token.replace(/-/g, " "))
    .filter(Boolean)
    .join(" ");
}

function displayNameForVariant(
  slug: string,
  speciesName: string,
  category: VariantCategoryKey,
  region: string | undefined,
  override?: VariantMetadata
): string {
  if (override?.displayName) return override.displayName;

  const base = baseDisplayName(speciesName);
  const suffix = slug.startsWith(`${speciesName}-`)
    ? slug.slice(speciesName.length + 1)
    : slug;
  const tokens = suffix.split("-").filter(Boolean);

  if (category === "mega") {
    const megaIndex = tokens.indexOf("mega");
    const before = megaIndex > 0 ? translateTokens(tokens.slice(0, megaIndex)) : "";
    const afterTokens = tokens.slice(megaIndex + 1).map((t) => (t.length === 1 ? t.toUpperCase() : t));
    const after = translateTokens(afterTokens);
    return ["Mega", base, before, after].filter(Boolean).join(" ");
  }

  if (category === "gmax") {
    const withoutGmax = tokens.filter((token) => token !== "gmax");
    const variantLabel = gmaxVariantLabel(`${speciesName}-${withoutGmax.join("-")}`);
    const extra = withoutGmax.filter((token) => !REGION_LABEL[token]);
    return [
      "Gigamax",
      base,
      region ? `de ${region}` : "",
      variantLabel ?? translateTokens(extra),
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (category === "regional") {
    const extra = tokens.filter(
      (token) => !REGION_LABEL[token] && token !== "standard"
    );
    return [base, region ? `de ${region}` : "", translateTokens(extra)]
      .filter(Boolean)
      .join(" ");
  }

  if (category === "totem") {
    const extra = tokens.filter(
      (token) => !REGION_LABEL[token] && token !== "totem"
    );
    return `${[base, region ? `de ${region}` : ""].filter(Boolean).join(" ")} (totem)${extra.length ? ` ${translateTokens(extra)}` : ""}`;
  }

  if (category === "gender") {
    const gender = tokens.includes("female") ? "hembra" : "macho";
    const extra = tokens.filter((token) => token !== "female" && token !== "male");
    return [base, gender, translateTokens(extra)].filter(Boolean).join(" ");
  }

  if (category === "attire") {
    const extra = tokens.filter((token) => token !== "cap");
    return [base, translateTokens(extra)].filter(Boolean).join(" ");
  }

  if (category === "non-playable" && tokens.includes("eternamax")) {
    return "Eternamax";
  }

  if (tokens.includes("meteor")) {
    const colors = tokens.filter((token) => token !== "meteor");
    return `${base} meteorito ${translateTokens(colors)}`.trim();
  }

  return [base, translateTokens(tokens)].filter(Boolean).join(" ");
}

/**
 * Etiqueta corta que distingue una Mega dentro de su especie (X, Y, Z,
 * «Macho», «Original», «Curly», …). Se deriva del mismo nombre que usa
 * `variantFamily` para no mantener dos catálogos de nombres.
 */
export function megaVariantLabel(
  slug: string,
  speciesName: string
): string | undefined {
  const displayName = displayNameForVariant(slug, speciesName, "mega", undefined);
  const prefix = `Mega ${baseDisplayName(speciesName)} `;
  const label = displayName.startsWith(prefix) ? displayName.slice(prefix.length) : "";
  return label ? label.charAt(0).toUpperCase() + label.slice(1) : undefined;
}

/**
 * Metadatos curados. Solo se usan para enriquecer la clasificación; la
 * existencia de la variante siempre viene de `varieties`.
 */
const VARIANT_METADATA: Record<string, VariantMetadata> = {
  // --- Pikachu: cosplay, atuendos y gorras ---
  "pikachu-cosplay": {
    displayName: "Pikachu Cosplay",
    description:
      "Pikachu con un traje de cosplay que puede adoptar distintos disfraces para concursos.",
    condition: "Evento de Pokémon Rubí Omega y Zafiro Alfa",
    order: 10,
  },
  "pikachu-rock-star": {
    displayName: "Pikachu Rock Star",
    description:
      "Pikachu disfrazado de estrella de rock para los concursos de Hoenn.",
    condition: "Evento de Pokémon Rubí Omega y Zafiro Alfa",
    order: 20,
  },
  "pikachu-belle": {
    displayName: "Pikachu Belle",
    description: "Pikachu con un elegante atuendo de concurso.",
    condition: "Evento de Pokémon Rubí Omega y Zafiro Alfa",
    order: 30,
  },
  "pikachu-pop-star": {
    displayName: "Pikachu Pop Star",
    description: "Pikachu con un atuendo de estrella del pop.",
    condition: "Evento de Pokémon Rubí Omega y Zafiro Alfa",
    order: 40,
  },
  "pikachu-phd": {
    displayName: "Pikachu Ph.D.",
    description: "Pikachu con toga y birrete de doctorado.",
    condition: "Evento de Pokémon Rubí Omega y Zafiro Alfa",
    order: 50,
  },
  "pikachu-libre": {
    displayName: "Pikachu Libre",
    description: "Pikachu luchador con máscara de lucha libre.",
    condition: "Evento de Pokémon Rubí Omega y Zafiro Alfa",
    order: 60,
  },
  "pikachu-original-cap": {
    displayName: "Pikachu con gorra original",
    description: "Pikachu con la gorra clásica de la región de Kanto.",
    condition: "Evento de Pokémon Sol y Luna",
    order: 70,
  },
  "pikachu-hoenn-cap": {
    displayName: "Pikachu con gorra de Hoenn",
    description: "Pikachu con la gorra de la región de Hoenn.",
    condition: "Evento de Pokémon Sol y Luna",
    order: 80,
  },
  "pikachu-sinnoh-cap": {
    displayName: "Pikachu con gorra de Sinnoh",
    description: "Pikachu con la gorra de la región de Sinnoh.",
    condition: "Evento de Pokémon Sol y Luna",
    order: 90,
  },
  "pikachu-unova-cap": {
    displayName: "Pikachu con gorra de Teselia",
    description: "Pikachu con la gorra de la región de Teselia.",
    condition: "Evento de Pokémon Sol y Luna",
    order: 100,
  },
  "pikachu-kalos-cap": {
    displayName: "Pikachu con gorra de Kalos",
    description: "Pikachu con la gorra de la región de Kalos.",
    condition: "Evento de Pokémon Sol y Luna",
    order: 110,
  },
  "pikachu-alola-cap": {
    displayName: "Pikachu con gorra de Alola",
    description: "Pikachu con la gorra de la región de Alola.",
    condition: "Evento de Pokémon Sol y Luna",
    order: 120,
  },
  "pikachu-partner-cap": {
    displayName: "Pikachu con gorra de compañero",
    description: "Pikachu con la gorra de la serie Pokémon: Let's Go.",
    condition: "Evento de Pokémon Sol y Luna",
    order: 130,
  },
  "pikachu-world-cap": {
    displayName: "Pikachu con gorra del Mundial",
    description: "Pikachu con la gorra conmemorativa del Mundial Pokémon.",
    condition: "Evento especial",
    order: 140,
  },
  "pikachu-starter": {
    category: "special",
    displayName: "Pikachu de compañero",
    description:
      "Pikachu inicial de Pokémon: Let's Go, Pikachu! que no evoluciona y te acompaña.",
    condition: "Pokémon: Let's Go, Pikachu!",
    affects: "both",
    order: 10,
  },
  "eevee-starter": {
    category: "special",
    displayName: "Eevee de compañero",
    description:
      "Eevee inicial de Pokémon: Let's Go, Eevee! que no evoluciona y te acompaña.",
    condition: "Pokémon: Let's Go, Eevee!",
    affects: "both",
    order: 10,
  },
  "pikachu-gmax": {
    displayName: "Gigamax Pikachu",
    description:
      "Forma Gigamax de Pikachu. Gana un movimiento G-Max exclusivo mientras dura la transformación.",
    condition: "Factor Gigamax en combate",
    order: 10,
  },

  // --- Formas coronadas ---
  "zacian-crowned": {
    displayName: "Zacian coronado",
    description:
      "Forma coronada que despierta con la Espada Oxidada; gana el tipo Acero y aumenta su poder.",
    condition: "Equipar la Espada Oxidada",
    permanence: "permanent",
    order: 10,
  },
  "zamazenta-crowned": {
    displayName: "Zamazenta coronado",
    description:
      "Forma coronada que despierta con el Escudo Oxidado; refuerza su defensa y gana el tipo Acero.",
    condition: "Equipar el Escudo Oxidado",
    permanence: "permanent",
    order: 10,
  },

  // --- Regionales emblemáticas ---
  "zapdos-galar": {
    displayName: "Zapdos de Galar",
    description:
      "Variante regional de Galar, de tipo Lucha/Volador y con un estilo más ofensivo.",
    condition: "Forma regional de Galar",
    order: 10,
  },
  "articuno-galar": {
    displayName: "Articuno de Galar",
    description:
      "Variante regional de Galar, de tipo Psíquico/Volador y con un estilo más ofensivo.",
    condition: "Forma regional de Galar",
    order: 10,
  },
  "moltres-galar": {
    displayName: "Moltres de Galar",
    description:
      "Variante regional de Galar, de tipo Siniestro/Volador y con un estilo más ofensivo.",
    condition: "Forma regional de Galar",
    order: 10,
  },
  "tauros-paldea-combat-breed": {
    displayName: "Tauros de Paldea (raza combatiente)",
    description: "Variante regional de Paldea de tipo Lucha.",
    condition: "Forma regional de Paldea",
    order: 10,
  },
  "tauros-paldea-blaze-breed": {
    displayName: "Tauros de Paldea (raza ardiente)",
    description: "Variante regional de Paldea de tipo Lucha/Fuego.",
    condition: "Forma regional de Paldea",
    order: 20,
  },
  "tauros-paldea-aqua-breed": {
    displayName: "Tauros de Paldea (raza acuática)",
    description: "Variante regional de Paldea de tipo Lucha/Agua.",
    condition: "Forma regional de Paldea",
    order: 30,
  },
  "darmanitan-galar-standard": {
    displayName: "Darmanitan de Galar",
    description:
      "Variante regional de Galar de tipo Hielo, con el modo daruma como habilidad oculta.",
    condition: "Forma regional de Galar",
    order: 10,
  },
  "darmanitan-galar-zen": {
    category: "battle",
    displayName: "Darmanitan de Galar daruma",
    description:
      "Modo daruma de Darmanitan de Galar, de tipo Hielo/Fuego y más ofensivo.",
    condition: "Habilidad Modo Daruma con menos del 50% de PS",
    region: "Galar",
    order: 20,
  },

  // --- Transformaciones legendarias ---
  "kyogre-primal": {
    displayName: "Kyogre primigenio",
    description:
      "Regresión primigenia de Kyogre; incrementa su poder y mantiene el tipo Agua.",
    condition: "Equipar el Prisma Azul",
    order: 10,
  },
  "groudon-primal": {
    displayName: "Groudon primigenio",
    description:
      "Regresión primigenia de Groudon; añade el tipo Fuego y aumenta su poder.",
    condition: "Equipar el Prisma Rojo",
    order: 20,
  },
  "eternatus-eternamax": {
    category: "non-playable",
    displayName: "Eternamax",
    description:
      "Forma de jefe que Eternatus adopta solo en la historia de Pokémon Espada y Escudo. No se puede obtener.",
    condition: "Historia de Pokémon Espada y Escudo",
    availability: "npc",
  },
  "necrozma-ultra": {
    category: "battle",
    displayName: "Ultra-Necrozma",
    description:
      "Ultraexplosión de Necrozma; gana el tipo Dragón y la habilidad Fuerza Cerebral.",
    condition: "Fotodestrucción Apocalíptica con Ultranecrostal Z",
    order: 10,
  },
  "necrozma-dusk": {
    displayName: "Necrozma melena crepuscular",
    description:
      "Fusión de Necrozma con Solgaleo; gana el tipo Acero y cambia su distribución de estadísticas.",
    condition: "Fusionarse con Solgaleo",
    order: 10,
  },
  "necrozma-dawn": {
    displayName: "Necrozma alas del alba",
    description:
      "Fusión de Necrozma con Lunala; gana el tipo Fantasma y cambia su distribución de estadísticas.",
    condition: "Fusionarse con Lunala",
    order: 20,
  },

  // --- Formas de combate ---
  "aegislash-blade": {
    category: "battle",
    displayName: "Aegislash filo",
    description:
      "Forma ofensiva de Aegislash; gana Ataque y Ataque Especial a costa de sus defensas.",
    condition: "Cambio Táctico al usar un ataque",
    order: 10,
  },
  "darmanitan-zen": {
    category: "battle",
    displayName: "Darmanitan daruma",
    description:
      "Modo daruma de Darmanitan, de tipo Fuego/Psíquico y con estadísticas más defensivas.",
    condition: "Habilidad Modo Daruma con menos del 50% de PS",
    order: 10,
  },
  "meloetta-pirouette": {
    category: "battle",
    displayName: "Meloetta danza",
    description:
      "Forma danza de Meloetta; cambia a tipo Normal/Lucha y prioriza el ataque físico.",
    condition: "Usar Canto Arcaico",
    order: 10,
  },
  "wishiwashi-school": {
    category: "battle",
    displayName: "Wishiwashi banco",
    description:
      "Forma banco de Wishiwashi; aumenta todas sus estadísticas ofensivas y defensivas.",
    condition: "Habilidad Banco con PS por encima del 25%",
    order: 10,
  },
  "mimikyu-busted": {
    category: "battle",
    displayName: "Mimikyu descubierto",
    description:
      "Forma descubierta de Mimikyu tras romperse el disfraz; queda vulnerable a los ataques.",
    condition: "Al romperse el disfraz",
    affects: "appearance",
    order: 10,
  },
  "cramorant-gulping": {
    category: "battle",
    displayName: "Cramorant engullendo",
    description:
      "Cramorant con un pez en el pico tras usar Surf o Buceo; cambia su forma de ataque.",
    condition: "Habilidad Pájaro del Mar tras Surf o Buceo",
    affects: "appearance",
    order: 10,
  },
  "cramorant-gorging": {
    category: "battle",
    displayName: "Cramorant atragantado",
    description:
      "Cramorant con una presa demasiado grande en el pico; cambia su forma de ataque.",
    condition: "Habilidad Pájaro del Mar tras Surf o Buceo",
    affects: "appearance",
    order: 20,
  },
  "eiscue-noice": {
    category: "battle",
    displayName: "Eiscue sin hielo",
    description:
      "Eiscue pierde la cabeza de hielo y gana Velocidad a costa de su Defensa.",
    condition: "Al romperse la cabeza de hielo",
    order: 10,
  },
  "morpeko-hangry": {
    category: "battle",
    displayName: "Morpeko voraz",
    description:
      "Modo voraz de Morpeko; cambia a tipo Siniestro y altera su movimiento exclusivo.",
    condition: "Habilidad Mutapetito al final del turno",
    order: 10,
  },
  "palafin-hero": {
    category: "battle",
    displayName: "Palafin héroe",
    description:
      "Forma héroe de Palafin; aumenta notablemente su Ataque y Velocidad.",
    condition: "Habilidad Cambio Heroico al cambiar de forma",
    order: 10,
  },
  "greninja-ash": {
    category: "battle",
    displayName: "Greninja Ash",
    description:
      "Metamorfosis afectiva de Greninja; aumenta Ataque, Ataque Especial y Velocidad.",
    condition: "Habilidad Fuerte Afecto tras debilitar a un rival",
    order: 10,
  },
  "greninja-battle-bond": {
    category: "battle",
    displayName: "Greninja vínculo batalla",
    description:
      "Forma vinculada a la habilidad Fuerte Afecto; se transforma al debilitar a un rival.",
    condition: "Habilidad Fuerte Afecto",
    order: 20,
  },
  "zygarde-10": {
    displayName: "Zygarde 10%",
    description:
      "Forma al 10% de Zygarde; más rápida y ofensiva que la forma al 50%.",
    condition: "Reconstituirse con el Cubo Zygarde",
    order: 10,
  },
  "zygarde-10-power-construct": {
    category: "battle",
    displayName: "Zygarde 10% (agrupamiento)",
    description:
      "Zygarde al 10% que pasa a forma completa cuando sus PS bajan de la mitad.",
    condition: "Habilidad Agrupamiento con menos de la mitad de PS",
    order: 20,
  },
  "zygarde-50-power-construct": {
    category: "battle",
    displayName: "Zygarde 50% (agrupamiento)",
    description:
      "Zygarde al 50% que pasa a forma completa cuando sus PS bajan de la mitad.",
    condition: "Habilidad Agrupamiento con menos de la mitad de PS",
    order: 30,
  },
  "zygarde-complete": {
    category: "battle",
    displayName: "Zygarde completo",
    description:
      "Forma completa de Zygarde; aumenta su PS y su poder defensivo.",
    condition: "Habilidad Agrupamiento con menos de la mitad de PS",
    order: 40,
  },

  // --- Formas alternativas ---
  "deoxys-attack": {
    displayName: "Deoxys ataque",
    description: "Forma de Deoxys centrada en el ataque; muy ofensiva y frágil.",
    condition: "Cambiar de forma en el meteorito",
    order: 10,
  },
  "deoxys-defense": {
    displayName: "Deoxys defensa",
    description: "Forma de Deoxys centrada en la defensa; resistente y lenta.",
    condition: "Cambiar de forma en el meteorito",
    order: 20,
  },
  "deoxys-speed": {
    displayName: "Deoxys velocidad",
    description: "Forma de Deoxys centrada en la velocidad.",
    condition: "Cambiar de forma en el meteorito",
    order: 30,
  },
  "rotom-heat": {
    displayName: "Rotom calor",
    description: "Rotom dentro de un horno; cambia a tipo Fuego/Eléctrico.",
    condition: "Usar el electrodoméstico correspondiente",
    order: 10,
  },
  "rotom-wash": {
    displayName: "Rotom lavado",
    description: "Rotom dentro de una lavadora; cambia a tipo Agua/Eléctrico.",
    condition: "Usar el electrodoméstico correspondiente",
    order: 20,
  },
  "rotom-frost": {
    displayName: "Rotom frío",
    description: "Rotom dentro de un frigorífico; cambia a tipo Hielo/Eléctrico.",
    condition: "Usar el electrodoméstico correspondiente",
    order: 30,
  },
  "rotom-fan": {
    displayName: "Rotom ventilador",
    description: "Rotom dentro de un ventilador; cambia a tipo Volador/Eléctrico.",
    condition: "Usar el electrodoméstico correspondiente",
    order: 40,
  },
  "rotom-mow": {
    displayName: "Rotom cortacésped",
    description: "Rotom dentro de un cortacésped; cambia a tipo Planta/Eléctrico.",
    condition: "Usar el electrodoméstico correspondiente",
    order: 50,
  },
  "dialga-origin": {
    displayName: "Dialga origen",
    description:
      "Forma origen de Dialga; refuerza su Ataque Especial y cambia su silueta.",
    condition: "Usar el Cristal Adamante",
    order: 10,
  },
  "palkia-origin": {
    displayName: "Palkia origen",
    description:
      "Forma origen de Palkia; refuerza su Ataque Especial y cambia su silueta.",
    condition: "Usar el Cristal Lustroso",
    order: 10,
  },
  "giratina-origin": {
    displayName: "Giratina origen",
    description:
      "Forma origen de Giratina; prioriza la velocidad y el ataque especial.",
    condition: "Usar el Orbe Gris",
    order: 10,
  },
  "shaymin-sky": {
    displayName: "Shaymin cielo",
    description:
      "Forma cielo de Shaymin; gana el tipo Volador y estadísticas ofensivas.",
    condition: "Usar la Flor Gracidea",
    order: 10,
  },
  "tornadus-therian": {
    displayName: "Tornadus forma tótem",
    description:
      "Forma tótem de Tornadus; cambia su distribución de estadísticas.",
    condition: "Usar el Espejo Veraz",
    order: 10,
  },
  "thundurus-therian": {
    displayName: "Thundurus forma tótem",
    description:
      "Forma tótem de Thundurus; cambia su distribución de estadísticas.",
    condition: "Usar el Espejo Veraz",
    order: 10,
  },
  "landorus-therian": {
    displayName: "Landorus forma tótem",
    description:
      "Forma tótem de Landorus; cambia su distribución de estadísticas.",
    condition: "Usar el Espejo Veraz",
    order: 10,
  },
  "enamorus-therian": {
    displayName: "Enamorus forma tótem",
    description:
      "Forma tótem de Enamorus; cambia su distribución de estadísticas.",
    condition: "Usar el Espejo Veraz",
    order: 10,
  },
  "kyurem-black": {
    displayName: "Kyurem negro",
    description:
      "Fusión de Kyurem con Zekrom; gana el tipo Dragón/Eléctrico y más ataque.",
    condition: "Fusionarse con Zekrom",
    order: 10,
  },
  "kyurem-white": {
    displayName: "Kyurem blanco",
    description:
      "Fusión de Kyurem con Reshiram; gana el tipo Dragón/Fuego y más ataque especial.",
    condition: "Fusionarse con Reshiram",
    order: 20,
  },
  "keldeo-resolute": {
    displayName: "Keldeo resoluto",
    description:
      "Forma resoluta de Keldeo; cambia su apariencia y refuerza su poder.",
    condition: "Aprender Sable Místico",
    order: 10,
  },
  "hoopa-unbound": {
    displayName: "Hoopa desatado",
    description:
      "Forma desatada de Hoopa; gana el tipo Siniestro y estadísticas ofensivas.",
    condition: "Usar el Frasco Prisionero",
    order: 10,
  },
  "oricorio-pom-pom": {
    displayName: "Oricorio pompón",
    description: "Oricorio con néctar amarillo; cambia a tipo Eléctrico.",
    condition: "Usar néctar amarillo",
    order: 10,
  },
  "oricorio-pau": {
    displayName: "Oricorio Plumé",
    description: "Oricorio con néctar rosa; cambia a tipo Psíquico.",
    condition: "Usar néctar rosa",
    order: 20,
  },
  "oricorio-sensu": {
    displayName: "Oricorio Sensu",
    description: "Oricorio con néctar morado; cambia a tipo Fantasma.",
    condition: "Usar néctar morado",
    order: 30,
  },
  "calyrex-ice": {
    displayName: "Calyrex jinete glacial",
    description:
      "Calyrex unido a Glastrier; gana el tipo Psíquico/Hielo y más ataque.",
    condition: "Unirse con Glastrier",
    order: 10,
  },
  "calyrex-shadow": {
    displayName: "Calyrex jinete espectral",
    description:
      "Calyrex unido a Spectrier; gana el tipo Psíquico/Fantasma y más ataque especial.",
    condition: "Unirse con Spectrier",
    order: 20,
  },
  "toxtricity-low-key": {
    displayName: "Toxtricity grave",
    description:
      "Forma grave de Toxtricity; cambia su apariencia y algunos movimientos.",
    condition: "Naturaleza al evolucionar",
    order: 10,
  },
  "urshifu-rapid-strike": {
    displayName: "Urshifu fluida",
    description:
      "Forma fluida de Urshifu; prioriza la velocidad y el estilo de combate rápido.",
    condition: "Entrenar en la Torre de las Aguas",
    order: 10,
  },
  "lycanroc-midnight": {
    displayName: "Lycanroc nocturno",
    description:
      "Forma nocturna de Lycanroc; más defensiva y con un estilo distinto.",
    condition: "Evolucionar de noche en Pokémon Sol/Ultra Sol",
    order: 10,
  },
  "lycanroc-dusk": {
    displayName: "Lycanroc crepuscular",
    description:
      "Forma crepuscular de Lycanroc; mezcla ataque y velocidad.",
    condition: "Evolucionar con Rocío Crepuscular",
    order: 20,
  },
  "koraidon-limited-build": {
    displayName: "Koraidon modo limitado",
    description:
      "Modo de desplazamiento limitado de Koraidon; no puede correr ni planear.",
    condition: "Forma de desplazamiento",
    affects: "appearance",
    order: 10,
  },
  "koraidon-sprinting-build": {
    displayName: "Koraidon modo carrera",
    description: "Modo de carrera de Koraidon.",
    condition: "Forma de desplazamiento",
    affects: "appearance",
    order: 20,
  },
  "koraidon-swimming-build": {
    displayName: "Koraidon modo acuático",
    description: "Modo acuático de Koraidon.",
    condition: "Forma de desplazamiento",
    affects: "appearance",
    order: 30,
  },
  "koraidon-gliding-build": {
    displayName: "Koraidon modo planeo",
    description: "Modo de planeo de Koraidon.",
    condition: "Forma de desplazamiento",
    affects: "appearance",
    order: 40,
  },
  "miraidon-low-power-mode": {
    displayName: "Miraidon modo bajo consumo",
    description:
      "Modo de bajo consumo de Miraidon; reduce su movilidad.",
    condition: "Forma de desplazamiento",
    affects: "appearance",
    order: 10,
  },
  "miraidon-drive-mode": {
    displayName: "Miraidon modo conducción",
    description: "Modo de conducción de Miraidon.",
    condition: "Forma de desplazamiento",
    affects: "appearance",
    order: 20,
  },
  "miraidon-aquatic-mode": {
    displayName: "Miraidon modo acuático",
    description: "Modo acuático de Miraidon.",
    condition: "Forma de desplazamiento",
    affects: "appearance",
    order: 30,
  },
  "miraidon-glide-mode": {
    displayName: "Miraidon modo planeo",
    description: "Modo de planeo de Miraidon.",
    condition: "Forma de desplazamiento",
    affects: "appearance",
    order: 40,
  },
  "ogerpon-wellspring-mask": {
    displayName: "Ogerpon máscara manantial",
    description:
      "Ogerpon con la Máscara Manantial; cambia a tipo Planta/Agua.",
    condition: "Equipar la Máscara Manantial",
    order: 10,
  },
  "ogerpon-hearthflame-mask": {
    displayName: "Ogerpon máscara hoguera",
    description:
      "Ogerpon con la Máscara Hoguera; cambia a tipo Planta/Fuego.",
    condition: "Equipar la Máscara Hoguera",
    order: 20,
  },
  "ogerpon-cornerstone-mask": {
    displayName: "Ogerpon máscara cimiento",
    description:
      "Ogerpon con la Máscara Cimiento; cambia a tipo Planta/Roca.",
    condition: "Equipar la Máscara Cimiento",
    order: 30,
  },
  "terapagos-terastal": {
    category: "battle",
    displayName: "Terapagos teracristal",
    description:
      "Forma teracristalizada de Terapagos; concentra la energía del teracristal.",
    condition: "Teracristalización",
    order: 10,
  },
  "terapagos-stellar": {
    category: "battle",
    displayName: "Terapagos estelar",
    description:
      "Forma estelar de Terapagos; alcanza su máximo poder durante el combate.",
    condition: "Teracristalización estelar",
    order: 20,
  },
  "ursaluna-bloodmoon": {
    category: "special",
    displayName: "Ursaluna luna carmesí",
    description:
      "Forma única de Ursaluna capturable en la historia de El Tesoro Oculto del Área Cero.",
    condition: "Encuentro especial en El Tesoro Oculto del Área Cero",
    order: 10,
  },
  "gimmighoul-roaming": {
    displayName: "Gimmighoul errante",
    description:
      "Forma errante de Gimmighoul; se mueve por el mundo y guarda monedas.",
    condition: "Forma errante",
    affects: "appearance",
    order: 10,
  },
  "magearna-original": {
    category: "special",
    displayName: "Magearna original",
    description:
      "Forma original de Magearna; cambia solo su apariencia y su color.",
    condition: "Evento o Pokémon HOME",
    affects: "appearance",
    order: 10,
  },
  "floette-eternal": {
    category: "non-playable",
    displayName: "Floette eterna",
    description:
      "Forma eterna de Floette; solo aparece en la historia y nunca se distribuyó oficialmente.",
    condition: "Forma no distribuida",
    availability: "unavailable",
    order: 10,
  },
  "zarude-dada": {
    displayName: "Zarude papá",
    description:
      "Zarude con una capa especial, protagonista de la película El secreto de la selva.",
    condition: "Evento de la película El secreto de la selva",
    order: 10,
  },
  "maushold-family-of-three": {
    displayName: "Maushold familia de tres",
    description:
      "Maushold formado por tres individuos; variante permanente de la especie.",
    condition: "Probabilidad al evolucionar",
    affects: "appearance",
    order: 10,
  },
  "dudunsparce-three-segment": {
    displayName: "Dudunsparce tres segmentos",
    description:
      "Dudunsparce de tres segmentos; variante poco común de la especie.",
    condition: "Probabilidad al evolucionar",
    affects: "appearance",
    order: 10,
  },
  "squawkabilly-blue-plumage": {
    displayName: "Squawkabilly plumaje azul",
    description: "Squawkabilly con plumaje azul; variante estética permanente.",
    condition: "Color de plumaje al capturar",
    order: 10,
  },
  "squawkabilly-yellow-plumage": {
    displayName: "Squawkabilly plumaje amarillo",
    description: "Squawkabilly con plumaje amarillo; variante estética permanente.",
    condition: "Color de plumaje al capturar",
    order: 20,
  },
  "squawkabilly-white-plumage": {
    displayName: "Squawkabilly plumaje blanco",
    description: "Squawkabilly con plumaje blanco; variante estética permanente.",
    condition: "Color de plumaje al capturar",
    order: 30,
  },
  "basculin-blue-striped": {
    displayName: "Basculin raya azul",
    description:
      "Basculin de raya azul; variante permanente con otra habilidad.",
    condition: "Forma salvaje",
    order: 10,
  },
  "basculin-white-striped": {
    displayName: "Basculin raya blanca",
    description:
      "Basculin de raya blanca; variante permanente que puede evolucionar a Basculegion.",
    condition: "Forma salvaje",
    order: 20,
  },
  "pumpkaboo-small": {
    displayName: "Pumpkaboo pequeño",
    description: "Pumpkaboo de tamaño pequeño; cambia su distribución de PS.",
    condition: "Tamaño al capturar",
    order: 10,
  },
  "pumpkaboo-large": {
    displayName: "Pumpkaboo grande",
    description: "Pumpkaboo de tamaño grande; cambia su distribución de PS.",
    condition: "Tamaño al capturar",
    order: 20,
  },
  "pumpkaboo-super": {
    displayName: "Pumpkaboo enorme",
    description: "Pumpkaboo de tamaño enorme; cambia su distribución de PS.",
    condition: "Tamaño al capturar",
    order: 30,
  },
  "gourgeist-small": {
    displayName: "Gourgeist pequeño",
    description: "Gourgeist de tamaño pequeño; cambia su distribución de PS.",
    condition: "Tamaño al capturar",
    order: 10,
  },
  "gourgeist-large": {
    displayName: "Gourgeist grande",
    description: "Gourgeist de tamaño grande; cambia su distribución de PS.",
    condition: "Tamaño al capturar",
    order: 20,
  },
  "gourgeist-super": {
    displayName: "Gourgeist enorme",
    description: "Gourgeist de tamaño enorme; cambia su distribución de PS.",
    condition: "Tamaño al capturar",
    order: 30,
  },
  "wormadam-sandy": {
    displayName: "Wormadam tronco arena",
    description:
      "Wormadam con tronco de arena; cambia a tipo Bicho/Tierra.",
    condition: "Según el lugar de evolución",
    order: 10,
  },
  "wormadam-trash": {
    displayName: "Wormadam tronco basura",
    description:
      "Wormadam con tronco de basura; cambia a tipo Bicho/Acero.",
    condition: "Según el lugar de evolución",
    order: 20,
  },
  "indeedee-female": {
    displayName: "Indeedee hembra",
    description:
      "Indeedee hembra; cambia su distribución de estadísticas y algunos movimientos.",
    order: 10,
  },
  "meowstic-female": {
    displayName: "Meowstic hembra",
    description:
      "Meowstic hembra; cambia su distribución de estadísticas y algunos movimientos.",
    order: 10,
  },
  "basculegion-female": {
    displayName: "Basculegion hembra",
    description:
      "Basculegion hembra; cambia su distribución de estadísticas.",
    order: 10,
  },
  "oinkologne-female": {
    displayName: "Oinkologne hembra",
    description:
      "Oinkologne hembra; cambia su distribución de estadísticas.",
    order: 10,
  },
  "raticate-totem-alola": {
    displayName: "Raticate de Alola (totem)",
    region: "Alola",
    order: 10,
  },
  "marowak-totem": {
    displayName: "Marowak (totem)",
    order: 20,
  },
  "mimikyu-totem-disguised": {
    displayName: "Mimikyu (totem)",
    order: 30,
  },
  "mimikyu-totem-busted": {
    displayName: "Mimikyu descubierto (totem)",
    order: 40,
  },
  "minior-red": { order: 10 },
  "minior-orange": { order: 20 },
  "minior-yellow": { order: 30 },
  "minior-green": { order: 40 },
  "minior-blue": { order: 50 },
  "minior-indigo": { order: 60 },
  "minior-violet": { order: 70 },
  "minior-red-meteor": { order: 10 },
  "minior-orange-meteor": { order: 20 },
  "minior-yellow-meteor": { order: 30 },
  "minior-green-meteor": { order: 40 },
  "minior-blue-meteor": { order: 50 },
  "minior-indigo-meteor": { order: 60 },
  "minior-violet-meteor": { order: 70 },
};

interface ClassificationRule {
  category: VariantCategoryKey;
  test: RegExp;
}

/**
 * Ordena las reglas de lo más específico a lo más general. Un atuendo como
 * `pikachu-alola-cap` debe clasificarse como atuendo antes que como regional;
 * una Mega con sufijo regional hipotética seguiría siendo Mega.
 */
const CLASSIFICATION_RULES: ClassificationRule[] = [
  { category: "gmax", test: /-gmax$/ },
  { category: "mega", test: /(^|-)mega(-|$)/ },
  { category: "primal", test: /-primal$/ },
  { category: "non-playable", test: /-(eternamax|eternal)$/ },
  {
    category: "attire",
    test: /^(pikachu-(cosplay|rock-star|belle|pop-star|phd|libre|.*-cap)|zarude-dada)$/,
  },
  { category: "totem", test: /(^|-)totem(-|$)/ },
  { category: "gender", test: /-(female|male)(-|$)/ },
  { category: "regional", test: /-(alola|galar|hisui|paldea)(-|$)/ },
  {
    category: "battle",
    test: /-(blade|zen|school|busted|gulping|gorging|noice|hangry|hero|crowned|ash|battle-bond|pirouette|complete|10-power-construct|50-power-construct|ultra|stellar|terastal)$/,
  },
  {
    category: "cosmetic",
    test: /-meteor$|^(squawkabilly-(blue|yellow|white)-plumage|minior-(red|orange|yellow|green|blue|indigo|violet))$/,
  },
];

export interface ResolvedVariant {
  category: VariantCategoryKey;
  categoryRef: VariantCategoryRef;
  displayName: string;
  description: string;
  condition?: string;
  region?: string;
  permanence: VariantPermanence;
  affects: VariantAffects;
  availability: VariantAvailability;
  order: number;
}

/**
 * Clasifica una variedad a partir de su slug y su especie. Es una función
 * pura y no consulta red: los datos de presentación viven en el catálogo.
 */
export function classifyVariant(
  slug: string,
  speciesName: string
): ResolvedVariant {
  const override = VARIANT_METADATA[slug];
  const matched = CLASSIFICATION_RULES.find((rule) => rule.test.test(slug));
  const category = override?.category ?? matched?.category ?? "alt-form";
  const definition = getVariantCategory(category);
  const region =
    override?.region ??
    (category === "regional" || category === "totem"
      ? detectRegion(slug)
      : undefined);
  const condition =
    override?.condition ??
    (category === "regional" && region
      ? `Forma regional de ${region}`
      : definition.defaultCondition);

  return {
    category,
    categoryRef: variantCategoryRef(category),
    displayName: displayNameForVariant(
      slug,
      speciesName,
      category,
      region,
      override
    ),
    description: override?.description ?? definition.description,
    ...(condition ? { condition } : {}),
    ...(region ? { region } : {}),
    permanence:
      override?.permanence ?? definition.defaultPermanence,
    affects: override?.affects ?? definition.defaultAffects,
    availability: override?.availability ?? definition.defaultAvailability,
    order: override?.order ?? 0,
  };
}

export function variantSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export function variantArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export interface BuildVariantFamilyInput {
  speciesId: number;
  speciesName: string;
  currentId: number;
  currentName: string;
  currentTypes?: string[];
  varieties?: VariantFamilySource[];
  /** Tipos ya conocidos por la ficha (por ejemplo, Megas o Gigamax cacheadas). */
  typesById?: Record<number, string[]>;
}

/**
 * Construye la familia completa a partir de `pokemon-species.varieties`.
 * Es pura: recibe las variedades y no hace peticiones. El Pokémon por defecto
 * (`is_default`) es la especie principal y permite la navegación inversa.
 */
export function buildVariantFamily(
  input: BuildVariantFamilyInput
): PokemonVariantFamily {
  const byId = new Map<number, VariantFamilySource & { id: number }>();

  for (const variety of input.varieties ?? []) {
    const id = idFromUrl(variety.url);
    if (!id || byId.has(id)) continue;
    byId.set(id, { ...variety, id });
  }

  if (!byId.has(input.currentId)) {
    byId.set(input.currentId, {
      id: input.currentId,
      name: input.currentName,
      url: `https://pokeapi.co/api/v2/pokemon/${input.currentId}/`,
      isDefault: false,
    });
  }

  const entries = Array.from(byId.values());
  const defaultVariety =
    entries.find((variety) => variety.isDefault) ??
    entries.find((variety) => variety.name === input.speciesName) ??
    entries.find((variety) => variety.id === input.currentId)!;

  const baseId = defaultVariety.id;
  const baseName = defaultVariety.name;
  const baseDisplay = baseDisplayName(input.speciesName);
  const currentTypes =
    input.typesById?.[input.currentId] ?? input.currentTypes;

  // Se excluye la forma que se está viendo, no la base: al abrir una variante
  // interesan las otras formas, incluida la especie por defecto.
  const variants = entries
    .filter((variety) => variety.id !== input.currentId)
    .map((variety): PokemonVariant => {
      const resolved = classifyVariant(variety.name, input.speciesName);
      const types =
        input.typesById?.[variety.id] ??
        (variety.id === input.currentId ? currentTypes : undefined);

      return {
        id: variety.id,
        name: variety.name,
        displayName:
          variety.name === input.speciesName ? baseDisplay : resolved.displayName,
        category: resolved.categoryRef,
        description: resolved.description,
        ...(resolved.condition ? { condition: resolved.condition } : {}),
        ...(resolved.region ? { region: resolved.region } : {}),
        permanence: resolved.permanence,
        affects: resolved.affects,
        availability: resolved.availability,
        kind: "record",
        navigable: true,
        order: resolved.order,
        isDefault: variety.id === baseId,
        isCurrent: false,
        sprite: variantSpriteUrl(variety.id),
        artwork: variantArtworkUrl(variety.id),
        ...(types?.length ? { types } : {}),
      };
    })
    .sort(
      (a, b) =>
        getVariantCategory(a.category.key).order -
          getVariantCategory(b.category.key).order ||
        a.order - b.order ||
        a.id - b.id
    );

  const currentVariant =
    input.currentId === baseId
      ? undefined
      : variants.find((variant) => variant.id === input.currentId);

  const currentClassification =
    input.currentId === baseId
      ? undefined
      : classifyVariant(input.currentName, input.speciesName);

  const paradoxRelatives = buildParadoxRelatives(
    input.speciesId,
    input.typesById
  );

  return {
    speciesId: input.speciesId,
    speciesName: input.speciesName,
    baseId,
    baseName,
    baseDisplayName: baseDisplay,
    baseSprite: variantSpriteUrl(baseId),
    baseArtwork: variantArtworkUrl(baseId),
    ...(input.typesById?.[baseId]
      ? { baseTypes: input.typesById[baseId] }
      : {}),
    currentId: input.currentId,
    currentName: input.currentName,
    currentDisplayName:
      input.currentId === baseId
        ? baseDisplay
        : currentVariant?.displayName ??
          currentClassification?.displayName ??
          baseDisplay,
    ...(currentClassification
      ? { currentCategory: currentClassification.categoryRef }
      : {}),
    isDefault: input.currentId === baseId,
    total: variants.length,
    variants,
    ...(paradoxRelatives.length > 0 ? { paradoxRelatives } : {}),
  };
}

/**
 * Pares de Pokémon paradoja: relaciona una especie presente con su contrapartida
 * paradoja (del pasado o del futuro). PokéAPI NO las vincula mediante `varieties`;
 * la relación es lore y se mantiene aquí como catálogo curado.
 *
 * Estructura: [presentDaySpeciesId, paradoxSpeciesId]
 */
export const PARADOX_PAIRS: [number, number][] = [
  // --- Pasado (Escarlata) ---
  [232, 984],    // Donphan → Colmilargo (Great Tusk)
  [39, 985],     // Jigglypuff → Colagrito (Scream Tail)
  [756, 986],    // Amoonguss → Furioseta (Brute Bonnet)
  [200, 987],    // Misdreavus → Melenaleteo (Flutter Mane)
  [637, 988],    // Volcarona → Reptalada (Slither Wing)
  [82, 989],     // Magneton → Pelarena (Sandy Shocks)
  [373, 994],    // Salamence → Bramaluna (Roaring Moon)
  [967, 1007],   // Cyclizar → Koraidon
  [245, 1009],   // Suicune → Ondulagua (Walking Wake) — DLC
  [244, 1010],   // Entei → Flamariete (Raging Bolt) — DLC
  [243, 1011],   // Raikou → Electrofuria (Gouging Fire) — DLC

  // --- Futuro (Púrpura) ---
  [232, 990],    // Donphan → Ferrodada (Iron Treads)
  [225, 991],    // Delibird → Ferrosaco (Iron Bundle)
  [297, 992],    // Hariyama → Ferropalmas (Iron Hands)
  [635, 993],    // Hydreigon → Ferrocuello (Iron Jugulis)
  [637, 994],    // Volcarona → Ferropolilla (Iron Moth)
  [248, 995],    // Tyranitar → Ferropúas (Iron Thorns)
  [282, 1006],   // Gardevoir → Ferropaladín (Iron Valiant)
  [967, 1008],   // Cyclizar → Miraidon
  [640, 1021],   // Virizion → Ferroverdor (Iron Leaves) — DLC
  [376, 1022],   // Metagross → Ferrotesta (Iron Crown) — DLC
  [479, 1023],   // Rotom → Ferromole (Iron Boulder) — DLC
  [461, 1024],   // Weavile → Ferrofilo (Iron Jugulis alt) — placeholder
];

/**
 * Relaciones de especies paradoja. Se construye a partir de PARADOX_PAIRS para
 * poder mirar en ambas direcciones.
 */
const PARADOX_MAP = new Map<number, number[]>();

for (const [present, paradox] of PARADOX_PAIRS) {
  if (!PARADOX_MAP.has(present)) PARADOX_MAP.set(present, []);
  if (!PARADOX_MAP.has(paradox)) PARADOX_MAP.set(paradox, []);
  PARADOX_MAP.get(present)!.push(paradox);
  PARADOX_MAP.get(paradox)!.push(present);
}

export interface ParadoxRelative {
  id: number;
  name: string;
  displayName: string;
  /** "past" si es una forma antigua, "future" si es futurista. */
  era: "past" | "future";
  description: string;
  sprite: string;
  artwork: string;
  types: string[];
}

const PARADOX_DISPLAY_NAMES: Record<number, string> = {
  984: "Colmilargo",
  985: "Colagrito",
  986: "Furioseta",
  987: "Melenaleteo",
  988: "Reptalada",
  989: "Pelarena",
  994: "Bramaluna",
  990: "Ferrodada",
  991: "Ferrosaco",
  992: "Ferropalmas",
  993: "Ferrocuello",
  995: "Ferropúas",
  1006: "Ferropaladín",
  1007: "Koraidon",
  1008: "Miraidon",
  1009: "Ondulagua",
  1010: "Flamariete",
  1011: "Electrofuria",
  1021: "Ferroverdor",
  1022: "Ferrotesta",
  1023: "Ferromole",
  1024: "Ferrofilo",
};

const PARADOX_DESCRIPTIONS: Record<number, string> = {
  984: "Pokémon paradoja del pasado relacionado con Donphan.",
  985: "Pokémon paradoja del pasado relacionado con Jigglypuff.",
  986: "Pokémon paradoja del pasado relacionado con Amoonguss.",
  987: "Pokémon paradoja del pasado relacionado con Misdreavus.",
  988: "Pokémon paradoja del pasado relacionado con Volcarona.",
  989: "Pokémon paradoja del pasado relacionado con Magneton.",
  994: "Pokémon paradoja del pasado relacionado con Salamence.",
  990: "Pokémon paradoja del futuro relacionado con Donphan.",
  991: "Pokémon paradoja del futuro relacionado con Delibird.",
  992: "Pokémon paradoja del futuro relacionado con Hariyama.",
  993: "Pokémon paradoja del futuro relacionado con Hydreigon.",
  995: "Pokémon paradoja del futuro relacionado con Tyranitar.",
  1006: "Pokémon paradoja del futuro relacionado con Gardevoir/Gallade.",
  1007: "Pokémon paradoja del pasado; guarda similitudes con Cyclizar.",
  1008: "Pokémon paradoja del futuro; guarda similitudes con Cyclizar.",
  1009: "Pokémon paradoja del pasado relacionado con Suicune.",
  1010: "Pokémon paradoja del pasado relacionado con Entei.",
  1011: "Pokémon paradoja del pasado relacionado con Raikou.",
  1021: "Pokémon paradoja del futuro relacionado con Virizion.",
  1022: "Pokémon paradoja del futuro relacionado con Metagross.",
  1023: "Pokémon paradoja del futuro relacionado con Rotom.",
  1024: "Pokémon paradoja del futuro relacionado con Weavile.",
};

const PARADOX_TYPE_BY_ID: Record<number, string[]> = {
  984: ["ground", "fighting"],
  985: ["fairy", "psychic"],
  986: ["grass", "dark"],
  987: ["ghost", "fairy"],
  988: ["bug", "fighting"],
  989: ["electric", "ground"],
  994: ["dragon", "dark"],
  990: ["ground", "steel"],
  991: ["ice", "water"],
  992: ["fighting", "electric"],
  993: ["dark", "flying"],
  995: ["rock", "electric"],
  1006: ["fairy", "fighting"],
  1007: ["fighting", "dragon"],
  1008: ["electric", "dragon"],
  1009: ["water", "dragon"],
  1010: ["fire", "dragon"],
  1011: ["electric", "dragon"],
  1021: ["grass", "psychic"],
  1022: ["steel", "psychic"],
  1023: ["rock", "electric"],
  1024: ["dark", "ice"],
};

/** IDs de Pokémon paradoja del pasado (Escarlata). */
const PAST_PARADOX = new Set([984, 985, 986, 987, 988, 989, 994, 1007, 1009, 1010, 1011]);

const PARADOX_ID_TO_SLUG: Record<number, string> = {
  984: "great-tusk",
  985: "scream-tail",
  986: "brute-bonnet",
  987: "flutter-mane",
  988: "slither-wing",
  989: "sandy-shocks",
  994: "roaring-moon",
  990: "iron-treads",
  991: "iron-bundle",
  992: "iron-hands",
  993: "iron-jugulis",
  995: "iron-thorns",
  1006: "iron-valiant",
  1007: "koraidon",
  1008: "miraidon",
  1009: "walking-wake",
  1010: "raging-bolt",
  1011: "gouging-fire",
  1021: "iron-leaves",
  1022: "iron-crown",
  1023: "iron-boulder",
  1024: "dark-weavile-alt",
};

export function buildParadoxRelatives(
  speciesId: number,
  typesById?: Record<number, string[]>
): ParadoxRelative[] {
  const relatedIds = PARADOX_MAP.get(speciesId);
  if (!relatedIds?.length) return [];

  return relatedIds.map((id) => {
    const slug = PARADOX_ID_TO_SLUG[id] ?? `pokemon-${id}`;
    return {
      id,
      name: slug,
      displayName: PARADOX_DISPLAY_NAMES[id] ?? prettyName(slug),
      era: PAST_PARADOX.has(id) ? "past" : "future",
      description: PARADOX_DESCRIPTIONS[id] ?? "Pokémon paradoja.",
      sprite: variantSpriteUrl(id),
      artwork: variantArtworkUrl(id),
      types: typesById?.[id] ?? PARADOX_TYPE_BY_ID[id] ?? ["unknown"],
    };
  });
}

export const WIKIDEX_VARIANTS_URL = WIKIDEX;
