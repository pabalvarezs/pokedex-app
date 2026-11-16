import { describe, it, expect } from "vitest";
import {
  dynamaxHp,
  dynamaxLevelLabel,
  dynamaxMultiplier,
  formatDynamaxMultiplier,
  isDynamaxBlocked,
} from "../src/utils/dynamax";
import {
  GMAX_MOVES,
  GMAX_POWER_NOTE,
  MAX_GUARD,
  MAX_MOVE_BY_TYPE,
  MAX_MOVES,
  gmaxMoveFor,
} from "../src/utils/gmaxMoves";
import { POKEMON_TYPES } from "../src/utils/pokemon";

describe("reglas de Dinamax", () => {
  it("sube los PS de ×1,5 a ×2,0 según el nivel", () => {
    expect(dynamaxMultiplier(0)).toBe(1.5);
    expect(dynamaxMultiplier(5)).toBe(1.75);
    expect(dynamaxMultiplier(10)).toBe(2);
  });

  it("limita el nivel al rango 0–10", () => {
    expect(dynamaxMultiplier(-4)).toBe(1.5);
    expect(dynamaxMultiplier(99)).toBe(2);
  });

  it("formatea el multiplicador en español", () => {
    expect(formatDynamaxMultiplier(0)).toBe("×1,50");
    expect(formatDynamaxMultiplier(10)).toBe("×2,00");
  });

  it("calcula la referencia de PS sobre la estadística base", () => {
    expect(dynamaxHp(78, 0)).toBe(117);
    expect(dynamaxHp(78, 5)).toBe(137);
    expect(dynamaxHp(78, 10)).toBe(156);
  });

  it("Shedinja conserva 1 PS aunque Dinamaxice", () => {
    expect(dynamaxHp(1, 10, 292)).toBe(1);
    expect(dynamaxHp(50, 10, 292)).toBe(1);
  });

  it("bloquea a Zacian, Zamazenta y Eternatus", () => {
    expect(isDynamaxBlocked(888)).toBe(true);
    expect(isDynamaxBlocked(889)).toBe(true);
    expect(isDynamaxBlocked(890)).toBe(true);
    expect(isDynamaxBlocked(6)).toBe(false);
    expect(isDynamaxBlocked(undefined)).toBe(false);
  });

  it("etiqueta los niveles con texto claro", () => {
    expect(dynamaxLevelLabel(0)).toBe("Nivel 0 · inicial");
    expect(dynamaxLevelLabel(4)).toBe("Nivel 4");
    expect(dynamaxLevelLabel(10)).toBe("Nivel 10 · máximo");
  });
});

describe("Max Moves", () => {
  it("cubre los 18 tipos más Maxibarrera", () => {
    expect(MAX_MOVES).toHaveLength(19);
    expect(MAX_MOVES.filter((move) => !move.isStatus)).toHaveLength(18);
    expect(MAX_GUARD.slug).toBe("max-guard");
    expect(MAX_GUARD.isStatus).toBe(true);
  });

  it("tiene slugs únicos y tipos válidos", () => {
    expect(new Set(MAX_MOVES.map((move) => move.slug)).size).toBe(19);

    for (const move of MAX_MOVES) {
      expect(POKEMON_TYPES[move.type], move.slug).toBeTruthy();
      expect(move.name.length).toBeGreaterThan(0);
      expect(move.effect.length).toBeGreaterThan(0);
    }
  });

  it("asigna un Max Move por tipo, sin duplicados", () => {
    expect(Object.keys(MAX_MOVE_BY_TYPE)).toHaveLength(18);
    expect(MAX_MOVE_BY_TYPE.fire.name).toBe("Maxignición");
    expect(MAX_MOVE_BY_TYPE.water.name).toBe("Maxichorro");
    expect(MAX_MOVE_BY_TYPE.fairy.name).toBe("Maxiestela");
  });
});

describe("G-Max Moves", () => {
  it("cubre las 34 formas de PokeAPI", () => {
    expect(GMAX_MOVES).toHaveLength(34);
    expect(new Set(GMAX_MOVES.map((move) => move.formSlug)).size).toBe(34);
  });

  it("usa tipos válidos y textos completos", () => {
    for (const move of GMAX_MOVES) {
      expect(POKEMON_TYPES[move.type], move.formSlug).toBeTruthy();
      expect(move.name.length).toBeGreaterThan(0);
      expect(move.effect.length).toBeGreaterThan(0);
    }
  });

  it("resuelve las especies con más de una forma", () => {
    expect(gmaxMoveFor("charizard-gmax")?.name).toBe("Gigallamarada");
    expect(gmaxMoveFor("toxtricity-amped-gmax")?.name).toBe("Gigadescarga");
    expect(gmaxMoveFor("toxtricity-low-key-gmax")?.name).toBe("Gigadescarga");
    expect(gmaxMoveFor("urshifu-single-strike-gmax")?.name).toBe(
      "Gigagolpe Brusco"
    );
    expect(gmaxMoveFor("urshifu-rapid-strike-gmax")?.name).toBe(
      "Gigagolpe Fluido"
    );
  });

  it("normaliza el slug y tolera formas desconocidas", () => {
    expect(gmaxMoveFor("  CHARIZARD-GMAX  ")?.name).toBe("Gigallamarada");
    expect(gmaxMoveFor("bulbasaur-gmax")).toBeUndefined();
  });

  it("marca solo las tres potencias fijas de 160", () => {
    const fixed = GMAX_MOVES.filter((move) => move.fixedPower);
    expect(fixed.map((move) => move.formSlug).sort()).toEqual([
      "cinderace-gmax",
      "inteleon-gmax",
      "rillaboom-gmax",
    ]);
    expect(GMAX_POWER_NOTE).toMatch(/160/);
  });
});
