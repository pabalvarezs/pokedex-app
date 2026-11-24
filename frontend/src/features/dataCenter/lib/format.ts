import type { RankingKey } from "./types";

export const RANKING_LABELS: Record<RankingKey, string> = {
  total: "Total de stats",
  hp: "HP",
  attack: "Ataque",
  defense: "Defensa",
  specialAttack: "Ataque especial",
  specialDefense: "Defensa especial",
  speed: "Velocidad",
};

export function formatNumber(value: number, decimals = 1): string {
  return value.toLocaleString("es-CL", { maximumFractionDigits: decimals });
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
