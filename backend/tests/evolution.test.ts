import { describe, it, expect } from "vitest";
import {
  buildEvolutionStages,
  formatEvolutionCondition,
  pickMegaVarieties,
  type EvolutionChainLink,
} from "../src/services/pokemon";

function node(
  name: string,
  id: number,
  details?: EvolutionChainLink["evolution_details"],
  evolvesTo: EvolutionChainLink[] = []
): EvolutionChainLink {
  return {
    species: {
      name,
      url: `https://pokeapi.co/api/v2/pokemon-species/${id}/`,
    },
    evolution_details: details,
    evolves_to: evolvesTo,
  };
}

describe("buildEvolutionStages", () => {
  it("agrupa una cadena lineal en tres etapas", () => {
    const chain = node("bulbasaur", 1, undefined, [
      node(
        "ivysaur",
        2,
        [{ is_default: true, trigger: { name: "level-up" }, min_level: 16 }],
        [
          node("venusaur", 3, [
            { is_default: true, trigger: { name: "level-up" }, min_level: 32 },
          ]),
        ]
      ),
    ]);

    const stages = buildEvolutionStages(chain);

    expect(stages).toHaveLength(3);
    expect(stages[0].members).toEqual([{ id: 1, name: "bulbasaur" }]);
    expect(stages[1].members[0]).toEqual({
      id: 2,
      name: "ivysaur",
      condition: "Nivel 16",
    });
    expect(stages[2].members[0]).toEqual({
      id: 3,
      name: "venusaur",
      condition: "Nivel 32",
    });
  });

  it("mantiene las ramificaciones en la misma etapa", () => {
    const chain = node("eevee", 133, undefined, [
      node("vaporeon", 134, [
        {
          is_default: true,
          trigger: { name: "use-item" },
          item: { name: "water-stone" },
        },
      ]),
      node("jolteon", 135, [
        {
          is_default: true,
          trigger: { name: "use-item" },
          item: { name: "thunder-stone" },
        },
      ]),
      node("flareon", 136, [
        {
          is_default: true,
          trigger: { name: "use-item" },
          item: { name: "fire-stone" },
        },
      ]),
    ]);

    const stages = buildEvolutionStages(chain);

    expect(stages).toHaveLength(2);
    expect(stages[0].members).toHaveLength(1);
    expect(stages[1].members).toHaveLength(3);
    expect(stages[1].members.map((member) => member.name)).toEqual([
      "vaporeon",
      "jolteon",
      "flareon",
    ]);
    expect(stages[1].members[0].condition).toBe("Usar Piedra Agua");
  });

  it("ignora nodos sin un id de especie válido", () => {
    const chain = node("missingno", 0);

    expect(buildEvolutionStages(chain)).toEqual([]);
  });
});

describe("formatEvolutionCondition", () => {
  it("traduce piedras evolutivas", () => {
    expect(
      formatEvolutionCondition([
        {
          is_default: true,
          trigger: { name: "use-item" },
          item: { name: "water-stone" },
        },
      ])
    ).toBe("Usar Piedra Agua");
  });

  it("combina amistad, horario y tipo de movimiento", () => {
    expect(
      formatEvolutionCondition([
        {
          is_default: true,
          trigger: { name: "level-up" },
          min_happiness: 160,
          time_of_day: "day",
          known_move_type: { name: "fairy" },
        },
      ])
    ).toBe("Amistad 160+ · De día · Movimiento Hada");
  });

  it("describe intercambios con objeto equipado", () => {
    expect(
      formatEvolutionCondition([
        {
          is_default: true,
          trigger: { name: "trade" },
          held_item: { name: "metal-coat" },
        },
      ])
    ).toBe("Intercambio · Con Revestimiento Metálico");

    expect(
      formatEvolutionCondition([
        {
          is_default: true,
          trigger: { name: "trade" },
          held_item: { name: "up-grade" },
        },
      ])
    ).toBe("Intercambio · Con Mejora");
  });

  it("usa las estadísticas relativas de Tyrogue", () => {
    expect(
      formatEvolutionCondition([
        {
          is_default: true,
          trigger: { name: "level-up" },
          relative_physical_stats: 1,
        },
      ])
    ).toBe("Ataque > Defensa");
  });

  it("devuelve undefined cuando no hay detalles", () => {
    expect(formatEvolutionCondition([])).toBeUndefined();
    expect(formatEvolutionCondition(undefined)).toBeUndefined();
  });
});

describe("pickMegaVarieties", () => {
  it("deja solo las Mega y descarta Gigamax y formas normales", () => {
    const varieties = [
      { name: "charizard" },
      { name: "charizard-mega-x" },
      { name: "charizard-mega-y" },
      { name: "charizard-gmax" },
    ];

    expect(pickMegaVarieties(varieties).map((variety) => variety.name)).toEqual([
      "charizard-mega-x",
      "charizard-mega-y",
    ]);
  });

  it("reconoce megas sin variante X/Y", () => {
    expect(
      pickMegaVarieties([
        { name: "gengar" },
        { name: "gengar-mega" },
        { name: "gengar-gmax" },
      ]).map((variety) => variety.name)
    ).toEqual(["gengar-mega"]);
  });

  it("tolera listas vacías o indefinidas", () => {
    expect(pickMegaVarieties([])).toEqual([]);
    expect(pickMegaVarieties(undefined)).toEqual([]);
  });
});
