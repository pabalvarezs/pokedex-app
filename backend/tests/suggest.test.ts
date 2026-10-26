import { describe, it, expect } from "vitest";
import { rankSuggestions, type PokemonSuggestion } from "../src/services/pokemon";

const INDEX: PokemonSuggestion[] = [
  { id: 25, name: "pikachu" },
  { id: 172, name: "pichu" },
  { id: 26, name: "raichu" },
  { id: 122, name: "mr-mime" },
  { id: 311, name: "plusle" },
];

describe("rankSuggestions", () => {
  it("prioriza las coincidencias por prefijo", () => {
    const result = rankSuggestions(INDEX, "pika");
    expect(result.map((p) => p.name)).toEqual(["pikachu"]);
  });

  it("ordena por número cuando el puntaje es igual", () => {
    const result = rankSuggestions(INDEX, "chu");
    expect(result.map((p) => p.id)).toEqual([25, 26, 172]);
  });

  it("encuentra nombres con guiones usando espacios o sin ellos", () => {
    expect(rankSuggestions(INDEX, "mr mime")[0]?.name).toBe("mr-mime");
    expect(rankSuggestions(INDEX, "mrmime")[0]?.name).toBe("mr-mime");
  });

  it("busca por número de la Pokédex", () => {
    const result = rankSuggestions(INDEX, "25");
    expect(result[0]).toEqual({ id: 25, name: "pikachu" });
  });

  it("respeta el límite de sugerencias", () => {
    expect(rankSuggestions(INDEX, "u", 2)).toHaveLength(2);
  });

  it("devuelve una lista vacía si no hay coincidencias", () => {
    expect(rankSuggestions(INDEX, "zzzz")).toEqual([]);
  });

  it("ignora búsquedas vacías", () => {
    expect(rankSuggestions(INDEX, "   ")).toEqual([]);
  });
});
