import { describe, it, expect } from "vitest";
import {
  buildEvolutionStages,
  formatEvolutionCondition,
  pickMegaVarieties,
  pickMegasForCurrentForm,
  resolveEvolutionChainForDetail,
  resolveEvolutionChainForForm,
  type EvolutionChainLink,
  type EvolutionStage,
  type SpeciesVariety,
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

  it("conserva la variante Z junto a la Mega normal", () => {
    expect(
      pickMegaVarieties([
        { name: "absol" },
        { name: "absol-mega" },
        { name: "absol-mega-z" },
      ]).map((variety) => variety.name)
    ).toEqual(["absol-mega", "absol-mega-z"]);
  });

  it("tolera listas vacías o indefinidas", () => {
    expect(pickMegaVarieties([])).toEqual([]);
    expect(pickMegaVarieties(undefined)).toEqual([]);
  });
});

describe("pickMegasForCurrentForm", () => {
  const meowstic = [
    { name: "meowstic-male-mega" },
    { name: "meowstic-female-mega" },
  ];
  const magearna = [
    { name: "magearna-mega" },
    { name: "magearna-original-mega" },
  ];
  const tatsugiri = [
    { name: "tatsugiri-curly-mega" },
    { name: "tatsugiri-droopy-mega" },
    { name: "tatsugiri-stretchy-mega" },
  ];

  it("deja solo la Mega de la forma que se está viendo", () => {
    expect(pickMegasForCurrentForm(meowstic, "meowstic-male")).toEqual([
      { name: "meowstic-male-mega" },
    ]);
    expect(pickMegasForCurrentForm(meowstic, "meowstic-female")).toEqual([
      { name: "meowstic-female-mega" },
    ]);
    expect(pickMegasForCurrentForm(magearna, "magearna-original")).toEqual([
      { name: "magearna-original-mega" },
    ]);
    expect(pickMegasForCurrentForm(tatsugiri, "tatsugiri-droopy")).toEqual([
      { name: "tatsugiri-droopy-mega" },
    ]);
  });

  it("reconoce la propia Mega como forma actual", () => {
    expect(pickMegasForCurrentForm(meowstic, "meowstic-male-mega")).toEqual([
      { name: "meowstic-male-mega" },
    ]);
    expect(pickMegasForCurrentForm(tatsugiri, "tatsugiri-stretchy-mega")).toEqual([
      { name: "tatsugiri-stretchy-mega" },
    ]);
  });

  it("mantiene todas las alternativas de una misma forma", () => {
    const charizard = [
      { name: "charizard-mega-x" },
      { name: "charizard-mega-y" },
    ];
    const absol = [{ name: "absol-mega" }, { name: "absol-mega-z" }];

    expect(pickMegasForCurrentForm(charizard, "charizard")).toEqual(charizard);
    expect(pickMegasForCurrentForm(absol, "absol")).toEqual(absol);
  });

  it("mantiene todas si el nombre no identifica una forma concreta", () => {
    expect(pickMegasForCurrentForm(meowstic, "meowstic")).toEqual(meowstic);
    expect(pickMegasForCurrentForm(meowstic, undefined)).toEqual(meowstic);
  });
});

describe("resolveEvolutionChainForForm", () => {
  const meowsticVarieties = [
    { name: "meowstic-male", url: "https://pokeapi.co/api/v2/pokemon/678/", isDefault: true },
    { name: "meowstic-female", url: "https://pokeapi.co/api/v2/pokemon/10025/", isDefault: false },
    { name: "meowstic-male-mega", url: "https://pokeapi.co/api/v2/pokemon/10314/", isDefault: false },
    { name: "meowstic-female-mega", url: "https://pokeapi.co/api/v2/pokemon/10326/", isDefault: false },
  ];
  const meowsticChain = [
    { members: [{ id: 677, name: "espurr" }] },
    { members: [{ id: 678, name: "meowstic", condition: "Nivel 25" }] },
  ];

  it("sustituye la especie por la forma base de la Mega femenina", () => {
    const result = resolveEvolutionChainForForm(
      meowsticChain,
      678,
      "meowstic",
      "meowstic-female-mega",
      meowsticVarieties
    );

    expect(result.currentId).toBe(10025);
    expect(result.chain[1].members[0]).toEqual({
      id: 10025,
      name: "meowstic-female",
      condition: "Nivel 25",
    });
    expect(meowsticChain[1].members[0]).toEqual({
      id: 678,
      name: "meowstic",
      condition: "Nivel 25",
    });
  });

  it("respeta formas permanentes sin Mega", () => {
    const result = resolveEvolutionChainForForm(
      [{ members: [{ id: 801, name: "magearna" }] }],
      801,
      "magearna",
      "magearna-original",
      [
        { name: "magearna", url: "https://pokeapi.co/api/v2/pokemon/801/" },
        { name: "magearna-original", url: "https://pokeapi.co/api/v2/pokemon/10147/" },
      ]
    );

    expect(result.currentId).toBe(10147);
    expect(result.chain[0].members[0]).toEqual({
      id: 10147,
      name: "magearna-original",
    });
  });

  it("resuelve Tatsugiri droopy desde su Mega", () => {
    const result = resolveEvolutionChainForForm(
      [{ members: [{ id: 978, name: "tatsugiri" }] }],
      978,
      "tatsugiri",
      "tatsugiri-droopy-mega",
      [
        { name: "tatsugiri-curly", url: "https://pokeapi.co/api/v2/pokemon/978/" },
        { name: "tatsugiri-droopy", url: "https://pokeapi.co/api/v2/pokemon/10258/" },
        { name: "tatsugiri-droopy-mega", url: "https://pokeapi.co/api/v2/pokemon/10323/" },
      ]
    );

    expect(result.currentId).toBe(10258);
    expect(result.chain[0].members[0].name).toBe("tatsugiri-droopy");
  });

  it("deja la cadena intacta si la forma no pertenece a la especie", () => {
    const result = resolveEvolutionChainForForm(
      meowsticChain,
      678,
      "meowstic",
      "meowstic",
      meowsticVarieties
    );

    expect(result.currentId).toBe(678);
    expect(result.chain).toBe(meowsticChain);
  });
});

describe("resolveEvolutionChainForDetail", () => {
  const variety = (name: string, id: number): SpeciesVariety => ({
    name,
    url: `https://pokeapi.co/api/v2/pokemon/${id}/`,
  });
  const loaderFrom = (map: Record<number, SpeciesVariety[]>) =>
    async (speciesId: number): Promise<SpeciesVariety[]> => map[speciesId] ?? [];

  it("muestra la preevolución de Hisui al ver Arcanine de Hisui (#10230)", async () => {
    const chain: EvolutionStage[] = [
      { members: [{ id: 58, name: "growlithe" }] },
      { members: [{ id: 59, name: "arcanine", condition: "Usar Piedra Fuego" }] },
    ];

    const result = await resolveEvolutionChainForDetail(
      chain,
      59,
      "arcanine",
      "arcanine-hisui",
      [variety("arcanine", 59), variety("arcanine-hisui", 10230)],
      loaderFrom({
        58: [variety("growlithe", 58), variety("growlithe-hisui", 10229)],
      })
    );

    expect(result.currentId).toBe(10230);
    expect(result.chain[0].members[0]).toEqual({
      id: 10229,
      name: "growlithe-hisui",
    });
    expect(result.chain[1].members[0]).toEqual({
      id: 10230,
      name: "arcanine-hisui",
      condition: "Usar Piedra Fuego",
    });
    expect(chain[0].members[0]).toEqual({ id: 58, name: "growlithe" });
  });

  it("resuelve todas las etapas de una cadena de Alola", async () => {
    const chain: EvolutionStage[] = [
      { members: [{ id: 74, name: "geodude" }] },
      { members: [{ id: 75, name: "graveler" }] },
      { members: [{ id: 76, name: "golem" }] },
    ];

    const result = await resolveEvolutionChainForDetail(
      chain,
      76,
      "golem",
      "golem-alola",
      [variety("golem", 76), variety("golem-alola", 10111)],
      loaderFrom({
        74: [variety("geodude", 74), variety("geodude-alola", 10109)],
        75: [variety("graveler", 75), variety("graveler-alola", 10110)],
      })
    );

    expect(result.chain.map((stage) => stage.members[0].id)).toEqual([
      10109, 10110, 10111,
    ]);
    expect(result.chain.map((stage) => stage.members[0].name)).toEqual([
      "geodude-alola",
      "graveler-alola",
      "golem-alola",
    ]);
  });

  it("propaga la región a todas las ramas de una cadena de Galar", async () => {
    const chain: EvolutionStage[] = [
      { members: [{ id: 79, name: "slowpoke" }] },
      {
        members: [
          { id: 80, name: "slowbro", condition: "Usar Piedra Helio" },
          { id: 199, name: "slowking", condition: "Usar Piedra Helio" },
        ],
      },
    ];

    const result = await resolveEvolutionChainForDetail(
      chain,
      80,
      "slowbro",
      "slowbro-galar",
      [variety("slowbro", 80), variety("slowbro-galar", 10165)],
      loaderFrom({
        79: [variety("slowpoke", 79), variety("slowpoke-galar", 10164)],
        199: [variety("slowking", 199), variety("slowking-galar", 10172)],
      })
    );

    expect(result.currentId).toBe(10165);
    expect(result.chain[0].members[0]).toEqual({
      id: 10164,
      name: "slowpoke-galar",
    });
    expect(result.chain[1].members.map((member) => member.id)).toEqual([
      10165, 10172,
    ]);
    expect(result.chain[1].members[1].name).toBe("slowking-galar");
  });

  it("resuelve sufijos compuestos y prefiere la forma base de Galar", async () => {
    const chain: EvolutionStage[] = [
      { members: [{ id: 554, name: "darumaka" }] },
      { members: [{ id: 555, name: "darmanitan" }] },
    ];

    const result = await resolveEvolutionChainForDetail(
      chain,
      555,
      "darmanitan",
      "darmanitan-galar-standard",
      [
        variety("darmanitan-standard", 555),
        variety("darmanitan-galar-standard", 10177),
        variety("darmanitan-galar-zen", 10178),
      ],
      loaderFrom({
        554: [variety("darumaka", 554), variety("darumaka-galar", 10176)],
      })
    );

    expect(result.currentId).toBe(10177);
    expect(result.chain[0].members[0]).toEqual({
      id: 10176,
      name: "darumaka-galar",
    });
  });

  it("prefiere la coincidencia exacta sobre la forma totémica", async () => {
    const chain: EvolutionStage[] = [
      { members: [{ id: 19, name: "rattata" }] },
      { members: [{ id: 20, name: "raticate" }] },
    ];

    const result = await resolveEvolutionChainForDetail(
      chain,
      20,
      "raticate",
      "raticate-totem-alola",
      [
        variety("raticate", 20),
        variety("raticate-alola", 10092),
        variety("raticate-totem-alola", 10093),
      ],
      loaderFrom({
        19: [variety("rattata", 19), variety("rattata-alola", 10091)],
      })
    );

    expect(result.currentId).toBe(10093);
    expect(result.chain[0].members[0]).toEqual({
      id: 10091,
      name: "rattata-alola",
    });
  });

  it("no consulta variedades ajenas si la forma no es regional", async () => {
    let calls = 0;
    const chain: EvolutionStage[] = [
      { members: [{ id: 677, name: "espurr" }] },
      { members: [{ id: 678, name: "meowstic" }] },
    ];

    const result = await resolveEvolutionChainForDetail(
      chain,
      678,
      "meowstic",
      "meowstic-female",
      [variety("meowstic-male", 678), variety("meowstic-female", 10025)],
      async () => {
        calls += 1;
        return [];
      }
    );

    expect(calls).toBe(0);
    expect(result.currentId).toBe(10025);
    expect(result.chain[0].members[0]).toEqual({ id: 677, name: "espurr" });
  });

  it("deja la otra etapa por defecto si no tiene variedad de la región", async () => {
    const chain: EvolutionStage[] = [
      { members: [{ id: 52, name: "meowth" }] },
      { members: [{ id: 53, name: "persian" }] },
    ];

    const result = await resolveEvolutionChainForDetail(
      chain,
      53,
      "persian",
      "persian-alola",
      [variety("persian", 53), variety("persian-alola", 10108)],
      loaderFrom({
        52: [variety("meowth", 52), variety("meowth-galar", 10161)],
      })
    );

    expect(result.currentId).toBe(10108);
    expect(result.chain[0].members[0]).toEqual({ id: 52, name: "meowth" });
  });
});
