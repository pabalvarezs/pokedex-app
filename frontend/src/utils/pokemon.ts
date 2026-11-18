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
// halos y acentos de toda la app.
export const POKEMON_TYPES: Record<string, TypeInfo> = {
  normal: { es: "Normal", bg: "bg-neutral-400", text: "text-white", border: "border-neutral-500", badge: "#A8A878", emoji: "⚪", gradient: ["#F8FAFC", "#D8DEE7"], accent: "#78716C" },
  fire: { es: "Fuego", bg: "bg-red-500", text: "text-white", border: "border-red-600", badge: "#F08030", emoji: "🔥", gradient: ["#FFF1E6", "#FDBA74"], accent: "#EA580C", onAccent: "#1c1917" },
  water: { es: "Agua", bg: "bg-blue-500", text: "text-white", border: "border-blue-600", badge: "#6890F0", emoji: "💧", gradient: ["#EAF3FF", "#93C5FD"], accent: "#2563EB" },
  electric: { es: "Eléctrico", bg: "bg-yellow-400", text: "text-neutral-900", border: "border-yellow-500", badge: "#F8D030", emoji: "⚡", gradient: ["#FFFBEB", "#FDE68A"], accent: "#D97706", onAccent: "#1c1917" },
  grass: { es: "Planta", bg: "bg-emerald-500", text: "text-white", border: "border-emerald-600", badge: "#78C850", emoji: "🍃", gradient: ["#ECFDF3", "#86EFAC"], accent: "#16A34A", onAccent: "#052e16" },
  ice: { es: "Hielo", bg: "bg-cyan-300", text: "text-neutral-900", border: "border-cyan-400", badge: "#98D8D8", emoji: "❄️", gradient: ["#ECFEFF", "#A5F3FC"], accent: "#0891B2", onAccent: "#0c1a1f" },
  fighting: { es: "Lucha", bg: "bg-orange-700", text: "text-white", border: "border-orange-800", badge: "#C03028", emoji: "🥊", gradient: ["#FEF2F2", "#FCA5A5"], accent: "#B91C1C" },
  poison: { es: "Veneno", bg: "bg-purple-600", text: "text-white", border: "border-purple-700", badge: "#A040A0", emoji: "☠️", gradient: ["#FAF5FF", "#D8B4FE"], accent: "#7E22CE" },
  ground: { es: "Tierra", bg: "bg-amber-600", text: "text-white", border: "border-amber-700", badge: "#E0C068", emoji: "⛰️", gradient: ["#FFFBEB", "#FCD34D"], accent: "#B45309" },
  flying: { es: "Volador", bg: "bg-indigo-400", text: "text-white", border: "border-indigo-500", badge: "#A890F0", emoji: "🕊️", gradient: ["#EEF2FF", "#C7D2FE"], accent: "#4F46E5" },
  psychic: { es: "Psíquico", bg: "bg-pink-500", text: "text-white", border: "border-pink-600", badge: "#F85888", emoji: "🔮", gradient: ["#FDF2F8", "#F9A8D4"], accent: "#DB2777" },
  bug: { es: "Bicho", bg: "bg-lime-500", text: "text-white", border: "border-lime-600", badge: "#A8B820", emoji: "🐛", gradient: ["#F7FEE7", "#D9F99D"], accent: "#4D7C0F" },
  rock: { es: "Roca", bg: "bg-stone-500", text: "text-white", border: "border-stone-600", badge: "#B8A038", emoji: "🪨", gradient: ["#FAFAF9", "#D6D3D1"], accent: "#57534E" },
  ghost: { es: "Fantasma", bg: "bg-violet-800", text: "text-white", border: "border-violet-900", badge: "#705898", emoji: "👻", gradient: ["#F5F3FF", "#C4B5FD"], accent: "#5B21B6" },
  dragon: { es: "Dragón", bg: "bg-indigo-700", text: "text-white", border: "border-indigo-800", badge: "#7038F8", emoji: "🐉", gradient: ["#EEF2FF", "#A5B4FC"], accent: "#4338CA" },
  dark: { es: "Siniestro", bg: "bg-neutral-800", text: "text-white", border: "border-neutral-900", badge: "#705848", emoji: "🌙", gradient: ["#F5F5F4", "#A8A29E"], accent: "#292524" },
  steel: { es: "Acero", bg: "bg-slate-400", text: "text-white", border: "border-slate-500", badge: "#B8B8D0", emoji: "⚙️", gradient: ["#F8FAFC", "#CBD5E1"], accent: "#475569" },
  fairy: { es: "Hada", bg: "bg-pink-300", text: "text-neutral-900", border: "border-pink-400", badge: "#EE99AC", emoji: "✨", gradient: ["#FDF2F8", "#FBCFE8"], accent: "#BE185D" },
};

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
