import { describe, it, expect } from "vitest";
import {
  gmaxVariantLabel,
  pickGmaxVarieties,
} from "../src/services/pokemon";

describe("pickGmaxVarieties", () => {
  it("deja solo las variedades Gigamax de la especie", () => {
    const varieties = [
      { name: "charizard" },
      { name: "charizard-mega-x" },
      { name: "charizard-mega-y" },
      { name: "charizard-gmax" },
    ];

    expect(pickGmaxVarieties(varieties)).toEqual([
      { name: "charizard-gmax" },
    ]);
  });

  it("conserva las dos formas de una especie con variantes", () => {
    const varieties = [
      { name: "toxtricity-amped" },
      { name: "toxtricity-low-key" },
      { name: "toxtricity-amped-gmax" },
      { name: "toxtricity-low-key-gmax" },
    ];

    expect(pickGmaxVarieties(varieties).map((variety) => variety.name)).toEqual([
      "toxtricity-amped-gmax",
      "toxtricity-low-key-gmax",
    ]);
  });

  it("no confunde Eternamax ni Megas con Gigamax", () => {
    const varieties = [
      { name: "eternatus" },
      { name: "eternatus-eternamax" },
      { name: "gengar-mega" },
    ];

    expect(pickGmaxVarieties(varieties)).toEqual([]);
  });

  it("tolera listas ausentes o vacías", () => {
    expect(pickGmaxVarieties(undefined)).toEqual([]);
    expect(pickGmaxVarieties([])).toEqual([]);
  });
});

describe("gmaxVariantLabel", () => {
  it("etiqueta las formas dobles en español", () => {
    expect(gmaxVariantLabel("toxtricity-amped-gmax")).toBe("Aguda");
    expect(gmaxVariantLabel("toxtricity-low-key-gmax")).toBe("Grave");
    expect(gmaxVariantLabel("urshifu-single-strike-gmax")).toBe("Brusca");
    expect(gmaxVariantLabel("urshifu-rapid-strike-gmax")).toBe("Fluida");
  });

  it("no inventa etiqueta para especies con una sola forma", () => {
    expect(gmaxVariantLabel("charizard-gmax")).toBeUndefined();
    expect(gmaxVariantLabel("pikachu-gmax")).toBeUndefined();
  });
});
