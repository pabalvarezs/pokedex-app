export interface TypeInfo {
  es: string;
  bg: string;
  text: string;
  border: string;
  badge: string;
  /** Emoji que acompaña al tipo en chips y resúmenes. */
  emoji: string;
  /** Degradé pastel para el fondo de la ilustración en las tarjetas. */
  gradient: [string, string];
  /** Color intenso del tipo para halos, bordes y marcas de agua. */
  accent: string;
  /** Texto legible sobre `accent`; por defecto blanco. */
  onAccent?: string;
}

// Tokens de color por tipo: única fuente de verdad para chips, degradés,
// halos y acentos de toda la app. Los 18 tipos tienen emoji propio.
export const POKEMON_TYPES: Record<string, TypeInfo> = {
  normal: { es: "Normal", bg: "bg-neutral-400", text: "text-white", border: "border-neutral-500", badge: "#9BA0A1", emoji: "🔘", gradient: ["#F1F2F2", "#D2D4D5"], accent: "#737677" },
  fire: { es: "Fuego", bg: "bg-orange-400", text: "text-neutral-900", border: "border-orange-500", badge: "#FEA64F", emoji: "🔥", gradient: ["#FFF3E6", "#FFD7B0"], accent: "#A16932" },
  water: { es: "Agua", bg: "bg-sky-500", text: "text-white", border: "border-sky-600", badge: "#5EA9DD", emoji: "💧", gradient: ["#E8F3FA", "#B7D8F0"], accent: "#447BA1" },
  electric: { es: "Eléctrico", bg: "bg-yellow-400", text: "text-neutral-900", border: "border-yellow-500", badge: "#F6DA56", emoji: "⚡", gradient: ["#FEFAE7", "#FBEEB3"], accent: "#85762E" },
  grass: { es: "Planta", bg: "bg-green-500", text: "text-white", border: "border-green-600", badge: "#5DBE65", emoji: "🍃", gradient: ["#E8F6E9", "#B6E2BA"], accent: "#418446" },
  ice: { es: "Hielo", bg: "bg-teal-300", text: "text-neutral-900", border: "border-teal-400", badge: "#81D5CA", emoji: "❄️", gradient: ["#EDF9F8", "#C6ECE7"], accent: "#4D7F78" },
  fighting: { es: "Lucha", bg: "bg-rose-500", text: "text-white", border: "border-rose-600", badge: "#D9415C", emoji: "🥊", gradient: ["#FAE4E8", "#EEAAB6"], accent: "#D23F59" },
  poison: { es: "Veneno", bg: "bg-purple-500", text: "text-white", border: "border-purple-600", badge: "#B663CE", emoji: "☠️", gradient: ["#F5E9F8", "#DEB9E9"], accent: "#A258B7" },
  ground: { es: "Tierra", bg: "bg-orange-500", text: "text-white", border: "border-orange-600", badge: "#D78755", emoji: "⛰️", gradient: ["#F9EEE7", "#EDC9B2"], accent: "#A46741" },
  flying: { es: "Volador", bg: "bg-indigo-400", text: "text-white", border: "border-indigo-500", badge: "#9BB4E6", emoji: "🕊️", gradient: ["#F1F4FC", "#D2DDF4"], accent: "#667697" },
  psychic: { es: "Psíquico", bg: "bg-rose-400", text: "text-neutral-900", border: "border-rose-500", badge: "#FA8786", emoji: "🔮", gradient: ["#FEEEEE", "#FDC9C9"], accent: "#AF5E5E" },
  bug: { es: "Bicho", bg: "bg-lime-500", text: "text-white", border: "border-lime-600", badge: "#9DC42C", emoji: "🐛", gradient: ["#F1F7E1", "#D3E4A0"], accent: "#667F1C" },
  rock: { es: "Roca", bg: "bg-amber-400", text: "text-neutral-900", border: "border-amber-500", badge: "#CEC190", emoji: "🪨", gradient: ["#F8F6EF", "#E9E3CD"], accent: "#7E7658" },
  ghost: { es: "Fantasma", bg: "bg-indigo-500", text: "text-white", border: "border-indigo-600", badge: "#646EC1", emoji: "👻", gradient: ["#E9EBF6", "#B9BEE3"], accent: "#646EC1" },
  dragon: { es: "Dragón", bg: "bg-blue-600", text: "text-white", border: "border-blue-700", badge: "#0275C0", emoji: "🐉", gradient: ["#DCECF6", "#8DC1E3"], accent: "#0275C0" },
  dark: { es: "Siniestro", bg: "bg-slate-600", text: "text-white", border: "border-slate-700", badge: "#636374", emoji: "🌙", gradient: ["#E9E9EC", "#B9B9C0"], accent: "#636374" },
  steel: { es: "Acero", bg: "bg-teal-500", text: "text-white", border: "border-teal-600", badge: "#5498A4", emoji: "⚙️", gradient: ["#E7F1F2", "#B2D1D6"], accent: "#467E88" },
  fairy: { es: "Hada", bg: "bg-fuchsia-400", text: "text-neutral-900", border: "border-fuchsia-500", badge: "#EF9BE4", emoji: "✨", gradient: ["#FDF1FB", "#F8D2F3"], accent: "#9A6493" },
};

/**
 * Fondo sólido de la insignia: versión oscura del color del tipo, elegida
 * para que el texto siempre blanco supere contraste AA incluso en text-[9px].
 * Se mantiene la familia cromática del tipo para no perder la identidad.
 */
const BADGE_BG: Record<string, string> = {
  normal: "#5B5E5E",
  fire: "#805428",
  water: "#366280",
  electric: "#695D25",
  grass: "#336938",
  ice: "#3D645F",
  fighting: "#A73247",
  poison: "#804691",
  ground: "#825233",
  flying: "#515E78",
  psychic: "#8B4B4A",
  bug: "#516517",
  rock: "#645D46",
  ghost: "#50589A",
  dragon: "#02619F",
  dark: "#5C5C6C",
  steel: "#37646C",
  fairy: "#7A4F74",
};

export function getBadgeBgColor(type: string): string {
  return BADGE_BG[type.toLowerCase()] ?? "#334155";
}

/** Rangos de la Pokédex nacional para derivar la generación sin otra request. */
const GENERATION_RANGES: [number, number, number][] = [
  [1, 151, 1],
  [152, 251, 2],
  [252, 386, 3],
  [387, 493, 4],
  [494, 649, 5],
  [650, 721, 6],
  [722, 809, 7],
  [810, 905, 8],
  [906, 1025, 9],
];

/** Generación aproximada por ID mientras llega el preview real. */
export function getGenerationForId(id: number): number | undefined {
  return GENERATION_RANGES.find(([from, to]) => id >= from && id <= to)?.[2];
}

export const GENERATIONS: { id: number; name: string; region: string }[] = [
  { id: 1, name: "Gen 1", region: "Kanto" },
  { id: 2, name: "Gen 2", region: "Johto" },
  { id: 3, name: "Gen 3", region: "Hoenn" },
  { id: 4, name: "Gen 4", region: "Sinnoh" },
  { id: 5, name: "Gen 5", region: "Teselia (Unova)" },
  { id: 6, name: "Gen 6", region: "Kalos" },
  { id: 7, name: "Gen 7", region: "Alola" },
  { id: 8, name: "Gen 8", region: "Galar" },
  { id: 9, name: "Gen 9", region: "Paldea" },
];

export const STAT_NAMES: Record<string, string> = {
  hp: "PS (Vida)",
  attack: "Ataque",
  defense: "Defensa",
  "special-attack": "Atq. Especial",
  "special-defense": "Def. Especial",
  speed: "Velocidad",
};

export function getTypeBadge(type: string) {
  const normalized = type.toLowerCase();
  return (
    POKEMON_TYPES[normalized] || {
      es: type,
      bg: "bg-gray-400",
      text: "text-white",
      border: "border-gray-500",
      badge: "#888",
      emoji: "❔",
      gradient: ["#F8FAFC", "#E2E8F0"],
      accent: "#64748B",
    }
  );
}
