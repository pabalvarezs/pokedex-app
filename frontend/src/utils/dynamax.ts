/**
 * Reglas de Dinamax que se calculan en el cliente porque PokeAPI no modela
 * la transformación: solo existen las formas Gigamax.
 */

export const DYNAMAX_MIN_LEVEL = 0;
export const DYNAMAX_MAX_LEVEL = 10;

/** Zacian, Zamazenta y Eternatus son los únicos que no pueden Dinamaxizar. */
const DYNAMAX_BLOCKED_SPECIES = new Set([888, 889, 890]);

const SHEDINJA_SPECIES_ID = 292;

export const DYNAMAX_LEVELS = Array.from(
  { length: DYNAMAX_MAX_LEVEL - DYNAMAX_MIN_LEVEL + 1 },
  (_, index) => DYNAMAX_MIN_LEVEL + index
);

/**
 * El nivel Dinamax sube los PS un 5 % por nivel: ×1.5 al 0 y ×2.0 al 10.
 * Los demás stats no cambian.
 */
export function dynamaxMultiplier(level: number): number {
  const clamped = Math.min(
    DYNAMAX_MAX_LEVEL,
    Math.max(DYNAMAX_MIN_LEVEL, Math.trunc(level))
  );
  return 1.5 + clamped * 0.05;
}

export function isDynamaxBlocked(speciesId?: number): boolean {
  return typeof speciesId === "number" && DYNAMAX_BLOCKED_SPECIES.has(speciesId);
}

export function isShedinja(speciesId?: number): boolean {
  return speciesId === SHEDINJA_SPECIES_ID;
}

/**
 * Referencia sobre la estadística base de PS, igual que el resto de la ficha.
 * Shedinja conserva siempre 1 PS aunque Dinamaxice.
 */
export function dynamaxHp(
  baseHp: number,
  level: number,
  speciesId?: number
): number {
  if (isShedinja(speciesId) || baseHp <= 1) return 1;
  return Math.round(baseHp * dynamaxMultiplier(level));
}

export function formatDynamaxMultiplier(level: number): string {
  return `×${dynamaxMultiplier(level).toFixed(2).replace(".", ",")}`;
}

export function dynamaxLevelLabel(level: number): string {
  if (level <= DYNAMAX_MIN_LEVEL) return "Nivel 0 · inicial";
  if (level >= DYNAMAX_MAX_LEVEL) return "Nivel 10 · máximo";
  return `Nivel ${level}`;
}
