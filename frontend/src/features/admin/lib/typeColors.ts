import { POKEMON_TYPES } from "../../../utils/pokemon";

export interface TypeColor {
  /** Nombre en español para mostrar. */
  es: string;
  bg: string;
  text: string;
  ring: string;
  /** Color sólido del tipo, útil para gráficos. */
  badge: string;
  /** Degradado CSS listo para `backgroundImage`. */
  gradient: string;
  /** Tinte suave para el hover de filas. */
  tint: string;
}

/**
 * Tintes explícitos para que Tailwind los genere (no puede inferir clases
 * construidas en runtime). Una entrada por cada tipo de la Pokédex.
 */
const TYPE_TINTS: Record<string, string> = {
  normal: "hover:bg-neutral-50",
  fire: "hover:bg-orange-50",
  water: "hover:bg-sky-50",
  electric: "hover:bg-yellow-50",
  grass: "hover:bg-green-50",
  ice: "hover:bg-teal-50",
  fighting: "hover:bg-rose-50",
  poison: "hover:bg-purple-50",
  ground: "hover:bg-orange-50",
  flying: "hover:bg-indigo-50",
  psychic: "hover:bg-rose-50",
  bug: "hover:bg-lime-50",
  rock: "hover:bg-amber-50",
  ghost: "hover:bg-indigo-50",
  dragon: "hover:bg-blue-50",
  dark: "hover:bg-slate-100",
  steel: "hover:bg-teal-50",
  fairy: "hover:bg-fuchsia-50",
};

const FALLBACK: TypeColor = {
  es: "Desconocido",
  bg: "bg-slate-400",
  text: "text-white",
  ring: "ring-slate-400",
  badge: "#94a3b8",
  gradient: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
  tint: "hover:bg-slate-50",
};

export const TYPE_COLORS: Record<string, TypeColor> = Object.keys(
  POKEMON_TYPES
).reduce<Record<string, TypeColor>>((acc, key) => {
  const info = POKEMON_TYPES[key];
  acc[key] = {
    es: info.es,
    bg: info.bg,
    text: info.text,
    ring: info.bg.replace(/^bg-/, "ring-"),
    badge: info.badge,
    gradient: `linear-gradient(135deg, ${info.gradient[0]} 0%, ${info.gradient[1]} 100%)`,
    tint: TYPE_TINTS[key] ?? FALLBACK.tint,
  };
  return acc;
}, {});

export function getTypeColor(type: string | null | undefined): TypeColor {
  if (!type) return FALLBACK;
  return TYPE_COLORS[type.toLowerCase()] ?? FALLBACK;
}
