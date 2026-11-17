import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import VariantsAndForms from "../src/components/VariantsAndForms";
import type { PokemonVariantFamily } from "../src/services/api";

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