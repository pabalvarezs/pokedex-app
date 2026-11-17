import { describe, it, expect, beforeEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import VariantsAndForms from "../src/components/VariantsAndForms";
import type {
  PokemonVariant,
  PokemonVariantFamily,
} from "../src/services/api";

beforeEach(() => {
  cleanup();
});

function makeFamily(overrides?: Partial<PokemonVariantFamily>): PokemonVariantFamily {
  return {
    speciesId: 25,
    speciesName: "pikachu",
    baseId: 25,
    baseName: "pikachu",
    baseDisplayName: "Pikachu",
    baseSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    baseArtwork: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
    baseTypes: ["electric"],
    currentId: 25,
    currentName: "pikachu",
    currentDisplayName: "Pikachu",
    isDefault: true,
    total: 3,
    variants: [
      {
        id: 10094,
        name: "pikachu-original-cap",
        displayName: "Pikachu con gorra original",
        category: {
          key: "attire",
          label: "Atuendos y accesorios",
          shortLabel: "Atuendo",
          description: "Atuendo, gorra o accesorio especial.",
          emoji: "🎩",
          tone: "fuchsia",
          section: "variants",
        },
        description: "Pikachu con la gorra clásica de Kanto.",
        condition: "Evento de Pokémon Sol y Luna",
        permanence: "permanent",
        affects: "appearance",
        availability: "event",
        kind: "record",
        navigable: true,
        order: 70,
        isDefault: false,
        isCurrent: false,
        sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10094.png",
        artwork: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10094.png",
        types: ["electric"],
      },
      {
        id: 10081,
        name: "pikachu-rock-star",
        displayName: "Pikachu Rock Star",
        category: {
          key: "attire",
          label: "Atuendos y accesorios",
          shortLabel: "Atuendo",
          description: "Atuendo, gorra o accesorio especial.",
          emoji: "🎩",
          tone: "fuchsia",
          section: "variants",
        },
        description: "Pikachu disfrazado de estrella de rock.",
        condition: "Evento de Pokémon Rubí Omega y Zafiro Alfa",
        permanence: "permanent",
        affects: "appearance",
        availability: "event",
        kind: "record",
        navigable: true,
        order: 20,
        isDefault: false,
        isCurrent: false,
        sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10081.png",
        artwork: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10081.png",
        types: ["electric"],
      },
      {
        id: 10170,
        name: "zapdos-galar",
        displayName: "Zapdos de Galar",
        category: {
          key: "regional",
          label: "Formas regionales",
          shortLabel: "Regional",
          description: "Variante adaptada al ecosistema de una región.",
          emoji: "🗺️",
          tone: "teal",
          section: "variants",
        },
        description: "Variante regional de Galar, de tipo Lucha/Volador.",
        condition: "Forma regional de Galar",
        region: "Galar",
        permanence: "permanent",
        affects: "both",
        availability: "playable",
        kind: "record",
        navigable: true,
        order: 10,
        isDefault: false,
        isCurrent: false,
        sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10170.png",
        artwork: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10170.png",
        types: ["fighting", "flying"],
      },
    ],
    ...overrides,
  };
}

function renderComponent(family: PokemonVariantFamily) {
  return render(
    <MemoryRouter>
      <VariantsAndForms family={family} />
    </MemoryRouter>
  );
}

const ATTIRE_CATEGORY = {
  key: "attire",
  label: "Atuendos y accesorios",
  shortLabel: "Atuendo",
  description: "Atuendo, gorra o accesorio especial.",
  emoji: "🎩",
  tone: "fuchsia",
  section: "variants",
};

/** Genera una variante local de atuendo con nombre e id únicos. */
function makeAttireVariant(
  index: number,
  displayName?: string
): PokemonVariant {
  return {
    id: 20000 + index,
    name: `pikachu-attire-${index}`,
    displayName: displayName ?? `Pikachu atuendo ${index}`,
    category: { ...ATTIRE_CATEGORY },
    description: `Atuendo número ${index}.`,
    permanence: "permanent",
    affects: "appearance",
    availability: "event",
    kind: "record",
    navigable: true,
    order: index,
    isDefault: false,
    isCurrent: false,
    sprite: "",
    artwork: "",
    types: ["electric"],
  };
}

/** Variante cuya ficha detallada vive en Megaevoluciones o Dinamax. */
function makeSpecialVariant(kind: "mega" | "gmax"): PokemonVariant {
  const isMega = kind === "mega";

  return {
    id: isMega ? 10034 : 10196,
    name: isMega ? "charizard-mega-x" : "charizard-gmax",
    displayName: isMega ? "Mega Charizard X" : "Charizard Gigamax",
    category: isMega
      ? {
          key: "mega",
          label: "Megaevoluciones",
          shortLabel: "Mega",
          description: "Transformación temporal durante el combate.",
          emoji: "✨",
          tone: "violet",
          section: "mega",
        }
      : {
          key: "gmax",
          label: "Formas Gigamax",
          shortLabel: "Gigamax",
          description: "Forma Gigamax exclusiva de Galar.",
          emoji: "🌋",
          tone: "rose",
          section: "dynamax",
        },
    description: isMega
      ? "Megaevolución disponible con Mega Piedra."
      : "Forma Gigamax obtenida con Factor Gigamax.",
    permanence: "battle",
    affects: "both",
    availability: "playable",
    kind: "record",
    navigable: true,
    order: 10,
    isDefault: false,
    isCurrent: false,
    sprite: "",
    artwork: "",
    types: ["fire", "dragon"],
  };
}

describe("VariantsAndForms", () => {
  it("muestra un estado vacío si total es 0", () => {
    const family = makeFamily({ total: 0, variants: [] });
    renderComponent(family);
    expect(screen.getByText("Sin variantes registradas")).toBeDefined();
    expect(
      screen.getByText(/PokéAPI no registra formas alternativas para Pikachu/)
    ).toBeDefined();
  });

  it("muestra el título y el contador de variantes", () => {
    renderComponent(makeFamily());
    expect(screen.getByText("Variantes y formas")).toBeDefined();
    expect(screen.getByText(/3 variantes/)).toBeDefined();
  });

  it("muestra chips de categoría con emoji", () => {
    renderComponent(makeFamily());
    // Los shortLabels aparecen tanto en el chip como en los badges de tarjeta
    expect(screen.getAllByText("Atuendo").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Regional").length).toBeGreaterThanOrEqual(1);
  });

  it("muestra el nombre de cada variante", () => {
    renderComponent(makeFamily());
    expect(screen.getByText("Pikachu con gorra original")).toBeDefined();
    expect(screen.getByText("Pikachu Rock Star")).toBeDefined();
    expect(screen.getByText("Zapdos de Galar")).toBeDefined();
  });

  it("enlaza cada tarjeta a /pokemon/:id", () => {
    renderComponent(makeFamily());
    const links = screen.getAllByRole("link");
    const cardLinks = links.filter(
      (l) =>
        l.getAttribute("href") === "/pokemon/10094" ||
        l.getAttribute("href") === "/pokemon/10081" ||
        l.getAttribute("href") === "/pokemon/10170"
    );
    expect(cardLinks.length).toBe(3);
  });

  it("muestra la región en variantes regionales", () => {
    renderComponent(makeFamily());
    expect(screen.getByText("Galar")).toBeDefined();
  });

  it("muestra la condición de la variante", () => {
    renderComponent(makeFamily());
    expect(screen.getByText("Evento de Pokémon Sol y Luna")).toBeDefined();
  });

  it("muestra tipos en las tarjetas", () => {
    renderComponent(makeFamily());
    // Zapdos de Galar es Lucha/Volador — el texto en los badges es el español sin uppercase
    expect(screen.getByText("Lucha")).toBeDefined();
    expect(screen.getByText("Volador")).toBeDefined();
  });

  it("muestra etiqueta 'Permanente' para variantes permanentes", () => {
    renderComponent(makeFamily());
    const permanenteLabels = screen.getAllByText("Permanente");
    expect(permanenteLabels.length).toBeGreaterThanOrEqual(3);
  });

  it("colapsa/expande al hacer clic en la cabecera", () => {
    const family = makeFamily();
    renderComponent(family);
    const button = screen.getByRole("button", { expanded: true });
    expect(button).toBeDefined();
  });
});

describe("VariantsAndForms — navegación inversa", () => {
  it("muestra la barra de vuelta cuando no es la especie base", () => {
    const family = makeFamily({
      isDefault: false,
      currentId: 10094,
      currentName: "pikachu-original-cap",
      currentDisplayName: "Pikachu con gorra original",
      currentCategory: {
        key: "attire",
        label: "Atuendos y accesorios",
        shortLabel: "Atuendo",
        description: "Atuendo, gorra o accesorio especial.",
        emoji: "🎩",
        tone: "fuchsia",
        section: "variants",
      },
    });
    renderComponent(family);
    expect(screen.getByText(/Estás viendo una variante/)).toBeDefined();
    // El link de vuelta a la especie base
    const backLink = screen.getByRole("link", { name: "Pikachu" });
    expect(backLink.getAttribute("href")).toBe("/pokemon/25");
  });

  it("no muestra barra de vuelta cuando es la especie base", () => {
    cleanup();
    renderComponent(makeFamily());
    expect(screen.queryByText(/Estás viendo una variante/)).toBeNull();
  });
});

describe("VariantsAndForms — categorías delegadas", () => {
  it("oculta mega y gmax del grid pero muestra enlace delegado", () => {
    const family = makeFamily({
      variants: [
        {
          id: 10094,
          name: "pikachu-original-cap",
          displayName: "Pikachu con gorra original",
          category: {
            key: "attire",
            label: "Atuendos y accesorios",
            shortLabel: "Atuendo",
            description: "Atuendo, gorra o accesorio especial.",
            emoji: "🎩",
            tone: "fuchsia",
            section: "variants",
          },
          description: "Pikachu con la gorra clásica de Kanto.",
          permanence: "permanent",
          affects: "appearance",
          availability: "event",
          kind: "record",
          navigable: true,
          order: 70,
          isDefault: false,
          isCurrent: false,
          sprite: "",
          artwork: "",
          types: ["electric"],
        },
      ],
      total: 1,
    });
    renderComponent(family);
    // Debe verse la variante local
    expect(screen.getAllByText("Pikachu con gorra original").length).toBe(1);
  });
});

describe("VariantsAndForms — paradojas", () => {
  it("muestra paradojas incluso cuando total es 0", () => {
    const family = makeFamily({
      total: 0,
      variants: [],
      paradoxRelatives: [
        {
          id: 985,
          name: "scream-tail",
          displayName: "Colagrito",
          era: "past",
          description: "Pokémon paradoja del pasado relacionado con Jigglypuff.",
          sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/985.png",
          artwork: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/985.png",
          types: ["fairy", "psychic"],
        },
      ],
    });
    renderComponent(family);
    expect(screen.getByText("Pokémon paradoja relacionados")).toBeDefined();
    expect(screen.getByText("Colagrito")).toBeDefined();
    expect(screen.getByText("Pasado")).toBeDefined();
  });

  it("muestra un estado vacío si no hay variantes ni paradojas", () => {
    const family = makeFamily({ total: 0, variants: [] });
    renderComponent(family);
    expect(screen.getByText("Sin variantes registradas")).toBeDefined();
  });

  it("muestra el badge de Futuro para paradojas futuristas", () => {
    const family = makeFamily({
      total: 0,
      variants: [],
      paradoxRelatives: [
        {
          id: 990,
          name: "iron-treads",
          displayName: "Ferrodada",
          era: "future",
          description: "Pokémon paradoja del futuro relacionado con Donphan.",
          sprite: "",
          artwork: "",
          types: ["ground", "steel"],
        },
      ],
    });
    renderComponent(family);
    expect(screen.getByText("Futuro")).toBeDefined();
    expect(screen.getByText("Ferrodada")).toBeDefined();
  });

  it("enlaza la paradoja a su ficha", () => {
    const family = makeFamily({
      total: 0,
      variants: [],
      paradoxRelatives: [
        {
          id: 985,
          name: "scream-tail",
          displayName: "Colagrito",
          era: "past",
          description: "Pokémon paradoja del pasado relacionado con Jigglypuff.",
          sprite: "",
          artwork: "",
          types: ["fairy", "psychic"],
        },
      ],
    });
    renderComponent(family);
    const link = screen.getByRole("link", { name: /Colagrito/ });
    expect(link.getAttribute("href")).toBe("/pokemon/985");
  });

  it("muestra los tipos de la paradoja", () => {
    const family = makeFamily({
      total: 0,
      variants: [],
      paradoxRelatives: [
        {
          id: 985,
          name: "scream-tail",
          displayName: "Colagrito",
          era: "past",
          description: "",
          sprite: "",
          artwork: "",
          types: ["fairy", "psychic"],
        },
      ],
    });
    renderComponent(family);
    expect(screen.getByText("Hada")).toBeDefined();
    expect(screen.getByText("Psíquico")).toBeDefined();
  });
});

describe("VariantsAndForms — filtros por categoría", () => {
  function getFilterGroup() {
    return screen.getByRole("group", {
      name: "Filtrar variantes por categoría",
    });
  }

  it("filtra el grid al elegir una categoría y restaura con Todas", () => {
    renderComponent(makeFamily());
    const group = getFilterGroup();

    const regional = within(group).getByRole("button", { name: /Regional/ });
    expect(regional.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(regional);

    expect(regional.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Zapdos de Galar")).toBeDefined();
    expect(screen.queryByText("Pikachu Rock Star")).toBeNull();
    expect(screen.queryByText("Pikachu con gorra original")).toBeNull();
    expect(screen.getByText(/Mostrando 1 de 1 forma/)).toBeDefined();
    expect(screen.getByText(/filtro activo/)).toBeDefined();

    fireEvent.click(within(group).getByRole("button", { name: /^Todas/ }));

    expect(regional.getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByText("Pikachu Rock Star")).toBeDefined();
    expect(screen.getByText("Zapdos de Galar")).toBeDefined();
    expect(screen.getByText(/Mostrando 3 de 3 formas/)).toBeDefined();
  });

  it("muestra el contador real en cada chip de categoría", () => {
    renderComponent(makeFamily());
    const group = getFilterGroup();

    expect(
      within(group).getByRole("button", { name: /^Todas/ }).textContent
    ).toContain("(3)");
    expect(
      within(group).getByRole("button", { name: /Atuendo/ }).textContent
    ).toContain("(2)");
    expect(
      within(group).getByRole("button", { name: /Regional/ }).textContent
    ).toContain("(1)");
  });

  it("no incluye categorías delegadas entre los filtros locales", () => {
    const family = makeFamily({
      total: 3,
      variants: [
        makeAttireVariant(1),
        makeSpecialVariant("mega"),
        makeSpecialVariant("gmax"),
      ],
    });
    renderComponent(family);
    const group = getFilterGroup();

    expect(within(group).queryByRole("button", { name: /Mega/ })).toBeNull();
    expect(
      within(group).queryByRole("button", { name: /Gigamax/ })
    ).toBeNull();
    expect(
      within(group).getByRole("button", { name: /^Todas/ }).textContent
    ).toContain("(1)");
  });
});

describe("VariantsAndForms — búsqueda de variantes", () => {
  function makeSearchFamily(): PokemonVariantFamily {
    const names = [
      "Pikachu Rock Star",
      "Pikachu Pop Star",
      "Pikachu Belle",
      "Pikachu Cosplay",
      "Pikachu Ph. D.",
      "Pikachu Libre",
      "Pikachu Original",
      "Pikachu de Alola",
    ];

    return makeFamily({
      total: names.length,
      variants: names.map((name, index) => makeAttireVariant(index + 1, name)),
    });
  }

  it("no ofrece búsqueda cuando hay pocas variantes", () => {
    renderComponent(makeFamily());
    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  it("filtra por nombre y describe el estado de la búsqueda", () => {
    renderComponent(makeSearchFamily());

    const input = screen.getByRole("searchbox", {
      name: "Buscar variante por nombre",
    });
    fireEvent.change(input, { target: { value: "rock" } });

    expect(screen.getByText("Pikachu Rock Star")).toBeDefined();
    expect(screen.queryByText("Pikachu Pop Star")).toBeNull();
    expect(screen.getByText(/Mostrando 1 de 1 forma/)).toBeDefined();
    expect(screen.getByText(/búsqueda activa/)).toBeDefined();
  });

  it("ignora mayúsculas y acentos al buscar", () => {
    renderComponent(makeSearchFamily());

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "ÁLOLA" },
    });

    expect(screen.getByText("Pikachu de Alola")).toBeDefined();
    expect(screen.queryByText("Pikachu Rock Star")).toBeNull();
  });

  it("muestra un estado sin resultados y permite limpiar filtros", () => {
    renderComponent(makeSearchFamily());

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "no-existe" },
    });

    expect(
      screen.getByText("No encontramos variantes con ese nombre")
    ).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }));

    expect(screen.queryByText("No encontramos variantes con ese nombre")).toBeNull();
    expect(screen.getByText("Pikachu Rock Star")).toBeDefined();
    expect(
      (screen.getByRole("searchbox") as HTMLInputElement).value
    ).toBe("");
    expect(screen.getByText(/Mostrando 8 de 8 formas/)).toBeDefined();
  });
});

describe("VariantsAndForms — paginación", () => {
  function makeRegionalVariant(index: number, name: string): PokemonVariant {
    return {
      ...makeAttireVariant(index, name),
      region: "Galar",
      category: {
        key: "regional",
        label: "Formas regionales",
        shortLabel: "Regional",
        description: "Variante adaptada al ecosistema de una región.",
        emoji: "🗺️",
        tone: "teal",
        section: "variants",
      },
    };
  }

  function makeLongFamily(): PokemonVariantFamily {
    return makeFamily({
      total: 14,
      variants: [
        ...Array.from({ length: 12 }, (_, index) =>
          makeAttireVariant(index + 1)
        ),
        makeRegionalVariant(13, "Zapdos de Galar"),
        makeRegionalVariant(14, "Articuno de Galar"),
      ],
    });
  }

  it("muestra la primera página y amplía con Mostrar más", () => {
    renderComponent(makeLongFamily());

    expect(screen.getByText(/Mostrando 10 de 14 formas/)).toBeDefined();
    expect(screen.getByText("Pikachu atuendo 10")).toBeDefined();
    expect(screen.queryByText("Pikachu atuendo 11")).toBeNull();

    const more = screen.getByRole("button", {
      name: /Mostrar más variantes/,
    });
    expect(more.textContent).toContain("+4");

    fireEvent.click(more);

    expect(screen.getByText(/Mostrando 14 de 14 formas/)).toBeDefined();
    expect(screen.getByText("Pikachu atuendo 12")).toBeDefined();
    expect(
      screen.queryByRole("button", { name: /Mostrar más variantes/ })
    ).toBeNull();
  });

  it("vuelve a la primera página al cambiar de categoría", () => {
    renderComponent(makeLongFamily());

    fireEvent.click(
      screen.getByRole("button", { name: /Mostrar más variantes/ })
    );
    expect(screen.getByText("Pikachu atuendo 12")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: /Regional/ }));

    expect(screen.getByText(/Mostrando 2 de 2 formas/)).toBeDefined();
    expect(screen.getByText("Zapdos de Galar")).toBeDefined();
    expect(screen.queryByText("Pikachu atuendo 1")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /^Todas/ }));
    expect(screen.getByText(/Mostrando 10 de 14 formas/)).toBeDefined();
  });
});

describe("VariantsAndForms — transformaciones especiales", () => {
  it("enlaza Mega y Gigamax a sus secciones sin duplicar tarjetas", () => {
    const family = makeFamily({
      total: 3,
      variants: [
        makeAttireVariant(1),
        makeSpecialVariant("mega"),
        makeSpecialVariant("gmax"),
      ],
    });
    renderComponent(family);

    const mega = screen.getByRole("link", {
      name: /Ir a la sección de Megaevoluciones/,
    });
    const gmax = screen.getByRole("link", {
      name: /Ir a la sección de Formas Gigamax/,
    });

    expect(mega.getAttribute("href")).toBe("#mega-title");
    expect(gmax.getAttribute("href")).toBe("#dynamax-title");
    expect(screen.getByText("Transformaciones especiales")).toBeDefined();
    expect(screen.getByText("Formas Gigamax")).toBeDefined();

    // Las fichas detalladas viven en MegaForms / DynamaxForms.
    expect(screen.queryByText("Mega Charizard X")).toBeNull();
    expect(screen.queryByText("Charizard Gigamax")).toBeNull();
    // La variante local sí se muestra como tarjeta.
    expect(screen.getByText("Pikachu atuendo 1")).toBeDefined();
  });

  it("muestra accesos especiales aunque no haya formas locales", () => {
    const family = makeFamily({
      total: 1,
      variants: [makeSpecialVariant("mega")],
    });
    renderComponent(family);

    expect(
      screen.getByRole("link", {
        name: /Ir a la sección de Megaevoluciones/,
      })
    ).toBeDefined();
    expect(screen.queryByText("Sin variantes registradas")).toBeNull();
    expect(
      screen.getByText(/se detallan en sus secciones dedicadas/)
    ).toBeDefined();
  });
});

describe("VariantsAndForms — paradojas separadas de las formas", () => {
  it("no cuenta las paradojas como variantes locales", () => {
    const family = makeFamily({
      total: 1,
      variants: [makeAttireVariant(1, "Pikachu con gorra original")],
      paradoxRelatives: [
        {
          id: 985,
          name: "scream-tail",
          displayName: "Colagrito",
          era: "past",
          description: "Pokémon paradoja del pasado.",
          sprite: "",
          artwork: "",
          types: ["fairy", "psychic"],
        },
      ],
    });
    renderComponent(family);

    expect(screen.getByText(/Mostrando 1 de 1 forma/)).toBeDefined();
    expect(
      screen.getByRole("button", { name: /^Todas/ }).textContent
    ).toContain("(1)");

    expect(screen.getByText("Pokémon paradoja relacionados")).toBeDefined();

    const paradoxLink = screen.getByRole("link", { name: "Ver ficha de Colagrito" });
    expect(paradoxLink.getAttribute("href")).toBe("/pokemon/985");
  });
});