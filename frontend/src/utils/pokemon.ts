export interface TypeInfo {
  es: string;
  bg: string;
  text: string;
  border: string;
  badge: string;
}

export const POKEMON_TYPES: Record<string, TypeInfo> = {
  normal: { es: "Normal", bg: "bg-neutral-400", text: "text-white", border: "border-neutral-500", badge: "#A8A878" },
  fire: { es: "Fuego", bg: "bg-red-500", text: "text-white", border: "border-red-600", badge: "#F08030" },
  water: { es: "Agua", bg: "bg-blue-500", text: "text-white", border: "border-blue-600", badge: "#6890F0" },
  electric: { es: "Eléctrico", bg: "bg-yellow-400", text: "text-neutral-900", border: "border-yellow-500", badge: "#F8D030" },
  grass: { es: "Planta", bg: "bg-emerald-500", text: "text-white", border: "border-emerald-600", badge: "#78C850" },
  ice: { es: "Hielo", bg: "bg-cyan-300", text: "text-neutral-900", border: "border-cyan-400", badge: "#98D8D8" },
  fighting: { es: "Lucha", bg: "bg-orange-700", text: "text-white", border: "border-orange-800", badge: "#C03028" },
  poison: { es: "Veneno", bg: "bg-purple-600", text: "text-white", border: "border-purple-700", badge: "#A040A0" },
  ground: { es: "Tierra", bg: "bg-amber-600", text: "text-white", border: "border-amber-700", badge: "#E0C068" },
  flying: { es: "Volador", bg: "bg-indigo-400", text: "text-white", border: "border-indigo-500", badge: "#A890F0" },
  psychic: { es: "Psíquico", bg: "bg-pink-500", text: "text-white", border: "border-pink-600", badge: "#F85888" },
  bug: { es: "Bicho", bg: "bg-lime-500", text: "text-white", border: "border-lime-600", badge: "#A8B820" },
  rock: { es: "Roca", bg: "bg-stone-500", text: "text-white", border: "border-stone-600", badge: "#B8A038" },
  ghost: { es: "Fantasma", bg: "bg-violet-800", text: "text-white", border: "border-violet-900", badge: "#705898" },
  dragon: { es: "Dragón", bg: "bg-indigo-700", text: "text-white", border: "border-indigo-800", badge: "#7038F8" },
  dark: { es: "Siniestro", bg: "bg-neutral-800", text: "text-white", border: "border-neutral-900", badge: "#705848" },
  steel: { es: "Acero", bg: "bg-slate-400", text: "text-white", border: "border-slate-500", badge: "#B8B8D0" },
  fairy: { es: "Hada", bg: "bg-pink-300", text: "text-neutral-900", border: "border-pink-400", badge: "#EE99AC" },
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
    }
  );
}
