import { describe, it, expect } from "vitest";
import {
  classifyVariant,
  buildVariantFamily,
  buildParadoxRelatives,
  getVariantCategory,
  variantSpriteUrl,
  variantArtworkUrl,
  VARIANT_CATEGORIES,
} from "../src/services/variants";

describe("VARIANT_CATEGORIES", () => {
  it("tiene todas las categorías esperadas", () => {
    const keys = VARIANT_CATEGORIES.map((c) => c.key);
    expect(keys).toContain("regional");
    expect(keys).toContain("mega");
    expect(keys).toContain("primal");
    expect(keys).toContain("gmax");
    expect(keys).toContain("battle");
    expect(keys).toContain("cosmetic");
    expect(keys).toContain("attire");
    expect(keys).toContain("gender");
    expect(keys).toContain("alt-form");
    expect(keys).toContain("totem");
    expect(keys).toContain("special");
    expect(keys).toContain("non-playable");
  });

  it("todas las categorías tienen metadatos completos", () => {
    for (const cat of VARIANT_CATEGORIES) {
      expect(cat.label).toBeTruthy();
      expect(cat.shortLabel).toBeTruthy();
      expect(cat.description).toBeTruthy();
      expect(cat.emoji).toBeTruthy();
      expect(cat.tone).toBeTruthy();
      expect(cat.section).toMatch(/^(variants|mega|dynamax)$/);
      expect(typeof cat.order).toBe("number");
    }
  });
});

describe("classifyVariant", () => {
  // --- Regionales ---
  it("clasifica zapdos-galar como regional", () => {
    const result = classifyVariant("zapdos-galar", "zapdos");
    expect(result.category).toBe("regional");
    expect(result.region).toBe("Galar");
    expect(result.categoryRef.shortLabel).toBe("Regional");
  });

  it("clasifica articuno-galar como regional", () => {
    const result = classifyVariant("articuno-galar", "articuno");
    expect(result.category).toBe("regional");
    expect(result.region).toBe("Galar");
  });

  it("clasifica tauros-paldea-combat-breed como regional", () => {
    const result = classifyVariant("tauros-paldea-combat-breed", "tauros");
    expect(result.category).toBe("regional");
    expect(result.region).toBe("Paldea");
  });

  // --- Megas ---
  it("clasifica charizard-mega-x como mega", () => {
    const result = classifyVariant("charizard-mega-x", "charizard");
    expect(result.category).toBe("mega");
    expect(result.displayName).toContain("Mega");
  });

  it("clasifica mewtwo-mega-y como mega", () => {
    const result = classifyVariant("mewtwo-mega-y", "mewtwo");
    expect(result.category).toBe("mega");
  });

  // --- Gigamax ---
  it("clasifica pikachu-gmax como gmax", () => {
    const result = classifyVariant("pikachu-gmax", "pikachu");
    expect(result.category).toBe("gmax");
  });

  it("clasifica charizard-gmax como gmax", () => {
    const result = classifyVariant("charizard-gmax", "charizard");
    expect(result.category).toBe("gmax");
  });

  // --- Primales ---
  it("clasifica kyogre-primal como primal", () => {
    const result = classifyVariant("kyogre-primal", "kyogre");
    expect(result.category).toBe("primal");
  });

  it("clasifica groudon-primal como primal", () => {
    const result = classifyVariant("groudon-primal", "groudon");
    expect(result.category).toBe("primal");
  });

  // --- Combate ---
  it("clasifica zacian-crowned como battle", () => {
    const result = classifyVariant("zacian-crowned", "zacian");
    expect(result.category).toBe("battle");
    expect(result.permanence).toBe("permanent");
    expect(result.displayName).toBe("Zacian coronado");
  });

  it("clasifica aegislash-blade como battle", () => {
    const result = classifyVariant("aegislash-blade", "aegislash");
    expect(result.category).toBe("battle");
  });

  it("clasifica palafin-hero como battle", () => {
    const result = classifyVariant("palafin-hero", "palafin");
    expect(result.category).toBe("battle");
  });

  // --- Atuendos ---
  it("clasifica pikachu-original-cap como attire", () => {
    const result = classifyVariant("pikachu-original-cap", "pikachu");
    expect(result.category).toBe("attire");
    expect(result.displayName).toBe("Pikachu con gorra original");
  });

  it("clasifica pikachu-alola-cap como attire (NO regional)", () => {
    const result = classifyVariant("pikachu-alola-cap", "pikachu");
    expect(result.category).toBe("attire");
    expect(result.displayName).toBe("Pikachu con gorra de Alola");
    // La gorra de Alola no debe ser regional
    expect(result.region).toBeUndefined();
  });

  it("clasifica pikachu-cosplay como attire", () => {
    const result = classifyVariant("pikachu-cosplay", "pikachu");
    expect(result.category).toBe("attire");
  });

  // --- Género ---
  it("clasifica indeedee-female como gender", () => {
    const result = classifyVariant("indeedee-female", "indeedee");
    expect(result.category).toBe("gender");
  });

  // --- Totémicas ---
  it("clasifica raticate-totem-alola como totem", () => {
    const result = classifyVariant("raticate-totem-alola", "raticate");
    expect(result.category).toBe("totem");
  });

  // --- Cosmético ---
  it("clasifica minior-red-meteor como cosmetic", () => {
    const result = classifyVariant("minior-red-meteor", "minior");
    expect(result.category).toBe("cosmetic");
  });

  it("clasifica squawkabilly-blue-plumage como cosmetic", () => {
    const result = classifyVariant("squawkabilly-blue-plumage", "squawkabilly");
    expect(result.category).toBe("cosmetic");
  });

  // --- Alternativa (fallback) ---
  it("clasifica deoxys-attack como alt-form", () => {
    const result = classifyVariant("deoxys-attack", "deoxys");
    expect(result.category).toBe("alt-form");
  });

  it("clasifica rotom-wash como alt-form", () => {
    const result = classifyVariant("rotom-wash", "rotom");
    expect(result.category).toBe("alt-form");
  });

  // --- No jugable ---
  it("clasifica eternatus-eternamax como non-playable", () => {
    const result = classifyVariant("eternatus-eternamax", "eternatus");
    expect(result.category).toBe("non-playable");
  });

  it("clasifica floette-eternal como non-playable", () => {
    const result = classifyVariant("floette-eternal", "floette");
    expect(result.category).toBe("non-playable");
  });

  // --- Especial ---
  it("clasifica pikachu-starter como special", () => {
    const result = classifyVariant("pikachu-starter", "pikachu");
    expect(result.category).toBe("special");
    expect(result.displayName).toBe("Pikachu de compañero");
  });

  it("clasifica ursaluna-bloodmoon como special", () => {
    const result = classifyVariant("ursaluna-bloodmoon", "ursaluna");
    expect(result.category).toBe("special");
  });

  // --- DisplayName en español ---
  it("asigna displayName en español para gorras", () => {
    const result = classifyVariant("pikachu-hoenn-cap", "pikachu");
    expect(result.displayName).toBe("Pikachu con gorra de Hoenn");
  });

  it("asigna 'Mega Charizard X' como displayName", () => {
    const result = classifyVariant("charizard-mega-x", "charizard");
    expect(result.displayName).toBe("Mega Charizard X");
  });

  it("asigna 'Mega Charizard Y' como displayName", () => {
    const result = classifyVariant("charizard-mega-y", "charizard");
    expect(result.displayName).toBe("Mega Charizard Y");
  });

  it("asigna 'Gigamax Pikachu' como displayName", () => {
    const result = classifyVariant("pikachu-gmax", "pikachu");
    expect(result.displayName).toBe("Gigamax Pikachu");
  });
});

describe("buildVariantFamily", () => {
  const baseInput = {
    speciesId: 25,
    speciesName: "pikachu",
    currentId: 25,
    currentName: "pikachu",
    currentTypes: ["electric"],
    varieties: [
      { name: "pikachu", url: "https://pokeapi.co/api/v2/pokemon/25/", isDefault: true },
      { name: "pikachu-original-cap", url: "https://pokeapi.co/api/v2/pokemon/10094/", isDefault: false },
      { name: "pikachu-rock-star", url: "https://pokeapi.co/api/v2/pokemon/10081/", isDefault: false },
      { name: "pikachu-gmax", url: "https://pokeapi.co/api/v2/pokemon/10199/", isDefault: false },
    ],
    typesById: {
      25: ["electric"],
      10094: ["electric"],
      10081: ["electric"],
      10199: ["electric"],
    },
  };

  it("identifica la especie base por isDefault", () => {
    const family = buildVariantFamily(baseInput);
    expect(family.baseId).toBe(25);
    expect(family.baseName).toBe("pikachu");
    expect(family.baseDisplayName).toBe("Pikachu");
    expect(family.isDefault).toBe(true);
  });

  it("incluye variantes sin la base", () => {
    const family = buildVariantFamily(baseInput);
    expect(family.total).toBe(3);
    expect(family.variants).toHaveLength(3);
    expect(family.variants.find((v) => v.id === 25)).toBeUndefined();
  });

  it("marca isCurrent correctamente", () => {
    const family = buildVariantFamily(baseInput);
    expect(family.variants.find((v) => v.id === 10094)?.isCurrent).toBe(false);
  });

  it("marca la variante actual cuando es distinta de la base", () => {
    const family = buildVariantFamily({
      ...baseInput,
      currentId: 10094,
      currentName: "pikachu-original-cap",
    });
    expect(family.isDefault).toBe(false);
    expect(family.currentId).toBe(10094);
    expect(family.currentDisplayName).toBe("Pikachu con gorra original");
    const cap = family.variants.find((v) => v.id === 10094);
    expect(cap?.isCurrent).toBe(true);
  });

  it("incluye currentCategory cuando no es la base", () => {
    const family = buildVariantFamily({
      ...baseInput,
      currentId: 10094,
      currentName: "pikachu-original-cap",
    });
    expect(family.currentCategory?.key).toBe("attire");
  });

  it("ordena variantes por orden de categoría y luego por order", () => {
    // attire (70) va después de gmax (40) y antes de... revisamos que estén ordenadas
    const family = buildVariantFamily(baseInput);
    const order = family.variants.map((v) => v.id);
    // gmax (40) va antes que attire (70)
    const gmaxIdx = order.indexOf(10199);
    const capIdx = order.indexOf(10094);
    expect(gmaxIdx).toBeLessThan(capIdx);
  });

  it("genera sprites y artworks desde el ID", () => {
    const family = buildVariantFamily(baseInput);
    expect(family.baseSprite).toContain("25.png");
    expect(family.baseArtwork).toContain("25.png");
    const variant = family.variants[0];
    expect(variant.sprite).toContain(String(variant.id));
    expect(variant.artwork).toContain(String(variant.id));
  });

  it("asigna tipos desde typesById", () => {
    const family = buildVariantFamily(baseInput);
    const cap = family.variants.find((v) => v.id === 10094);
    expect(cap?.types).toEqual(["electric"]);
  });

  it("incluye speciesId y speciesName", () => {
    const family = buildVariantFamily(baseInput);
    expect(family.speciesId).toBe(25);
    expect(family.speciesName).toBe("pikachu");
  });

  it("añade entrada sintética cuando currentId no está en varieties", () => {
    const family = buildVariantFamily({
      ...baseInput,
      varieties: [
        { name: "pikachu", url: "https://pokeapi.co/api/v2/pokemon/25/", isDefault: true },
      ],
      currentId: 99999,
      currentName: "pikachu-fake",
    });
    expect(family.total).toBe(1); // Solo la fake, porque la base se excluye
    expect(family.variants[0].id).toBe(99999);
  });
});

describe("Zacian — caso real", () => {
  it("clasifica crowned como battle con permanence permanent", () => {
    const result = classifyVariant("zacian-crowned", "zacian");
    expect(result.category).toBe("battle");
    expect(result.permanence).toBe("permanent");
    expect(result.displayName).toBe("Zacian coronado");
    expect(result.condition).toContain("Espada Oxidada");
  });
});

describe("Zapdos — caso real", () => {
  it("clasifica galar como regional", () => {
    const result = classifyVariant("zapdos-galar", "zapdos");
    expect(result.category).toBe("regional");
    expect(result.region).toBe("Galar");
    expect(result.displayName).toBe("Zapdos de Galar");
  });
});

describe("Pokémon sin variantes", () => {
  it("buildVariantFamily con solo la base devuelve total 0", () => {
    const family = buildVariantFamily({
      speciesId: 1,
      speciesName: "bulbasaur",
      currentId: 1,
      currentName: "bulbasaur",
      varieties: [
        { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/", isDefault: true },
      ],
    });
    expect(family.total).toBe(0);
    expect(family.variants).toHaveLength(0);
  });

  it("buildVariantFamily sin varieties devuelve total 0", () => {
    const family = buildVariantFamily({
      speciesId: 1,
      speciesName: "bulbasaur",
      currentId: 1,
      currentName: "bulbasaur",
    });
    expect(family.total).toBe(0);
    expect(family.variants).toHaveLength(0);
  });
});

describe("Helpers de URL", () => {
  it("variantSpriteUrl devuelve la URL correcta", () => {
    expect(variantSpriteUrl(25)).toBe(
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
    );
  });

  it("variantArtworkUrl devuelve la URL correcta", () => {
    expect(variantArtworkUrl(25)).toBe(
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
    );
  });
});

describe("getVariantCategory", () => {
  it("devuelve category por key", () => {
    const regional = getVariantCategory("regional");
    expect(regional.key).toBe("regional");
    expect(regional.label).toBe("Formas regionales");
  });

  it("devuelve alt-form como fallback para keys desconocidas", () => {
    const fallback = getVariantCategory("unknown" as any);
    expect(fallback.key).toBe("alt-form");
  });
});

describe("buildParadoxRelatives", () => {
  it("devuelve paradox relatives para Jigglypuff (presente ↔ pasado)", () => {
    const relatives = buildParadoxRelatives(39);
    expect(relatives.length).toBeGreaterThanOrEqual(1);
    const screamTail = relatives.find((r) => r.id === 985);
    expect(screamTail).toBeDefined();
    expect(screamTail!.displayName).toBe("Colagrito");
    expect(screamTail!.era).toBe("past");
    expect(screamTail!.types).toContain("fairy");
    expect(screamTail!.types).toContain("psychic");
  });

  it("devuelve paradox relatives para Donphan (pasado y futuro)", () => {
    const relatives = buildParadoxRelatives(232);
    expect(relatives.length).toBe(2);
    const past = relatives.find((r) => r.id === 984);
    const future = relatives.find((r) => r.id === 990);
    expect(past).toBeDefined();
    expect(past!.era).toBe("past");
    expect(future).toBeDefined();
    expect(future!.era).toBe("future");
  });

  it("Contragolpe: Scream Tail también ve a Jigglypuff como relativo", () => {
    const relatives = buildParadoxRelatives(985);
    expect(relatives.length).toBeGreaterThanOrEqual(1);
    expect(relatives.some((r) => r.id === 39)).toBe(true);
  });

  it("devuelve lista vacía para Pokémon sin relación paradoja", () => {
    const relatives = buildParadoxRelatives(1); // Bulbasaur
    expect(relatives).toHaveLength(0);
  });

  it("incluye sprites y artworks desde el ID", () => {
    const relatives = buildParadoxRelatives(39);
    const screamTail = relatives.find((r) => r.id === 985)!;
    expect(screamTail.sprite).toContain("985.png");
    expect(screamTail.artwork).toContain("985.png");
  });
});