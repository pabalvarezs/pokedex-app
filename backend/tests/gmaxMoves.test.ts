import { describe, it, expect } from "vitest";
import { GMAX_MOVES, gmaxMoveFor } from "../src/services/gmaxMoves";

const TYPES = new Set([
  "normal",
  "fighting",
  "flying",
  "poison",
  "ground",
  "rock",
  "bug",
  "ghost",
  "steel",
  "fire",
  "water",
  "grass",
  "electric",
  "psychic",
  "ice",
  "dragon",
  "dark",
  "fairy",
]);

describe("catálogo de G-Max Moves", () => {
  it("cubre las 34 formas y no repite slugs", () => {
    expect(GMAX_MOVES).toHaveLength(34);
    expect(new Set(GMAX_MOVES.map((move) => move.formSlug)).size).toBe(34);
  });

  it("usa tipos válidos y textos completos", () => {
    for (const move of GMAX_MOVES) {
      expect(TYPES.has(move.type), move.formSlug).toBe(true);
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
  });

  it("no expone el slug interno en la respuesta de la API", () => {
    const move = gmaxMoveFor("charizard-gmax");
    expect(move).toBeTruthy();
    expect(move).not.toHaveProperty("formSlug");
  });
});
