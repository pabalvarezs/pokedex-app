import { describe, it, expect, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DynamaxForms from "../src/components/DynamaxForms";
import type { GmaxForm, GmaxRelative } from "../src/services/api";

const CHARIZARD_BASE = {
  id: 6,
  name: "charizard",
  types: ["fire", "flying"],
  stats: [
    { name: "hp", base_stat: 78 },
    { name: "attack", base_stat: 84 },
  ],
  artwork: "https://example.com/charizard.png",
  height: 17,
};

const CHARIZARD_GMAX: GmaxForm = {
  id: 10196,
  name: "charizard-gmax",
  baseName: "charizard",
  types: ["fire", "flying"],
  artwork: "https://example.com/charizard-gmax.png",
  height: 280,
  gmaxMove: {
    name: "Gigallamarada",
    type: "fire",
    effect:
      "Inflige daño durante 4 turnos a los rivales que no sean de tipo Fuego.",
  },
};

const TOXTRICITY_BASE = {
  id: 849,
  name: "toxtricity-amped",
  types: ["electric", "poison"],
  stats: [{ name: "hp", base_stat: 75 }],
  artwork: "https://example.com/toxtricity.png",
  height: 16,
};

const TOXTRICITY_FORMS: GmaxForm[] = [
  {
    id: 10219,
    name: "toxtricity-amped-gmax",
    baseName: "toxtricity",
    variant: "Aguda",
    types: ["electric", "poison"],
    artwork: "https://example.com/toxtricity-amped-gmax.png",
    height: 240,
    gmaxMove: {
      name: "Gigadescarga",
      type: "electric",
      effect: "Envenena o paraliza a todos los rivales.",
    },
  },
  {
    id: 10220,
    name: "toxtricity-low-key-gmax",
    baseName: "toxtricity",
    variant: "Grave",
    types: ["electric", "poison"],
    artwork: "https://example.com/toxtricity-low-key-gmax.png",
    height: 240,
    gmaxMove: {
      name: "Gigadescarga",
      type: "electric",
      effect: "Envenena o paraliza a todos los rivales.",
    },
  },
];

function renderSection({
  forms = [CHARIZARD_GMAX],
  base = CHARIZARD_BASE,
  speciesId = 6,
  gmaxRelatives = [],
}: {
  forms?: GmaxForm[];
  base?: typeof CHARIZARD_BASE;
  speciesId?: number;
  gmaxRelatives?: GmaxRelative[];
} = {}) {
  return render(
    <MemoryRouter>
      <DynamaxForms
        forms={forms}
        base={base}
        speciesId={speciesId}
        gmaxRelatives={gmaxRelatives}
      />
    </MemoryRouter>
  );
}

describe("DynamaxForms", () => {
  afterEach(() => {
    cleanup();
  });

  it("muestra las reglas, los PS y la forma Gigamax", () => {
    renderSection();

    expect(
      screen.getByRole("heading", { name: /Dinamax y Gigamax/i })
    ).toBeTruthy();
    expect(screen.getByText("3 turnos")).toBeTruthy();
    expect(screen.getByText("1 vez por combate")).toBeTruthy();
    expect(screen.getAllByText(/Más de 28,0 m/).length).toBeGreaterThan(0);
    expect(screen.getByText("Desconocido")).toBeTruthy();
    expect(screen.getByText("Gigallamarada")).toBeTruthy();
    expect(
      screen.getByText(
        /Los movimientos de tipo Fuego se convierten en Gigallamarada/
      )
    ).toBeTruthy();
  });

  it("usa el movimiento G-Max que entrega la API", () => {
    renderSection({
      forms: [
        {
          ...CHARIZARD_GMAX,
          gmaxMove: {
            name: "Gigaprueba",
            type: "fire",
            effect: "Efecto entregado por el backend.",
          },
        },
      ],
    });

    expect(screen.getByText("Gigaprueba")).toBeTruthy();
    expect(screen.getByText("Efecto entregado por el backend.")).toBeTruthy();
  });

  it("avisa cuando la forma no trae movimiento G-Max", () => {
    renderSection({ forms: [{ ...CHARIZARD_GMAX, gmaxMove: undefined }] });

    expect(
      screen.getByText(/No hay datos curados del movimiento G-Max/)
    ).toBeTruthy();
  });

  it("actualiza los PS al mover el nivel Dinamax", () => {
    renderSection();

    const slider = screen.getByRole("slider", { name: "Nivel Dinamax" });
    expect(screen.getByLabelText("PS con Dinamax").textContent).toContain("117");
    expect(screen.getByText("×1,50")).toBeTruthy();

    fireEvent.change(slider, { target: { value: "10" } });

    expect(screen.getByLabelText("PS con Dinamax").textContent).toContain("156");
    expect(screen.getByText("×2,00")).toBeTruthy();
  });

  it("Shedinja conserva 1 PS y lo explica", () => {
    renderSection({
      forms: [],
      speciesId: 292,
      base: {
        ...CHARIZARD_BASE,
        id: 292,
        name: "shedinja",
        types: ["bug", "ghost"],
        stats: [{ name: "hp", base_stat: 1 }],
      },
    });

    expect(screen.getByLabelText("PS con Dinamax").textContent).toContain("1");
    expect(screen.getByText(/Shedinja no gana PS/i)).toBeTruthy();
  });

  it("avisa cuando la especie no tiene forma Gigamax", () => {
    renderSection({
      forms: [],
      base: {
        ...CHARIZARD_BASE,
        id: 1,
        name: "bulbasaur",
        types: ["grass", "poison"],
        stats: [{ name: "hp", base_stat: 45 }],
      },
      speciesId: 1,
    });

    expect(screen.getByText("Sin forma Gigamax")).toBeTruthy();
    expect(screen.getByText("Sin forma G-Max")).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: /Movimientos Max/i })
    ).toBeTruthy();
  });

  it("avisa que la evolución final sí puede Gigamaxizar", () => {
    renderSection({
      forms: [],
      base: {
        ...CHARIZARD_BASE,
        id: 5,
        name: "charmeleon",
        types: ["fire"],
        stats: [{ name: "hp", base_stat: 58 }],
      },
      speciesId: 5,
      gmaxRelatives: [
        { id: 6, name: "charizard", direction: "later" },
      ],
    });

    expect(
      screen.getByRole("heading", { name: "La evolución sí Gigamaxiza" })
    ).toBeTruthy();
    expect(screen.getByText(/Cuando evolucione a Charizard/)).toBeTruthy();
    expect(screen.getByText(/sí va a poder Gigamaxizar/)).toBeTruthy();
    expect(screen.queryByText("Sin forma Gigamax")).toBeNull();
  });

  it("avisa que la preevolución sí puede Gigamaxizar", () => {
    renderSection({
      forms: [],
      base: {
        ...CHARIZARD_BASE,
        id: 53,
        name: "persian",
        types: ["normal"],
      },
      speciesId: 53,
      gmaxRelatives: [{ id: 52, name: "meowth", direction: "earlier" }],
    });

    expect(
      screen.getByRole("heading", { name: "La preevolución sí Gigamaxiza" })
    ).toBeTruthy();
    expect(screen.getByText(/perdió el Factor Gigamax al evolucionar/)).toBeTruthy();
    expect(screen.getByText(/Su preevolución Meowth sí puede/)).toBeTruthy();
    expect(screen.getByText(/aprovéchalo antes de evolucionar/)).toBeTruthy();
  });

  it("nombra todas las etapas de la cadena que pueden Gigamaxizar", () => {
    renderSection({
      forms: [],
      base: {
        ...CHARIZARD_BASE,
        id: 840,
        name: "applin",
        types: ["grass", "dragon"],
      },
      speciesId: 840,
      gmaxRelatives: [
        { id: 841, name: "flapple", direction: "later" },
        { id: 842, name: "appletun", direction: "later" },
      ],
    });

    expect(screen.getByText(/Cuando evolucione a Flapple y Appletun/)).toBeTruthy();
    expect(screen.getByText(/sí van a poder Gigamaxizar/)).toBeTruthy();
  });

  it("bloquea a Zacian, Zamazenta y Eternatus", () => {
    renderSection({
      forms: [],
      base: {
        ...CHARIZARD_BASE,
        id: 888,
        name: "zacian",
        types: ["fairy"],
      },
      speciesId: 888,
    });

    expect(screen.getByText("No puede Dinamaxizar")).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: /PS bajo Dinamax/i })
    ).toBeNull();
    expect(
      screen.queryByRole("heading", { name: /Movimientos Max/i })
    ).toBeNull();
  });

  it("muestra las dos formas Gigamax de Toxtricity y permite elegirlas", () => {
    renderSection({
      forms: TOXTRICITY_FORMS,
      base: TOXTRICITY_BASE,
      speciesId: 849,
    });

    const grave = screen.getByRole("button", {
      name: "Seleccionar Gigamax Toxtricity Grave",
    });
    expect(grave.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(grave);

    expect(grave.getAttribute("aria-pressed")).toBe("true");
    expect(
      screen.getByText(/frente a Gigamax Toxtricity Grave/)
    ).toBeTruthy();
  });

  it("permite desplegar los 19 Max Moves", () => {
    renderSection();

    expect(screen.queryByText("Maxichorro")).toBeNull();
    expect(screen.getByText("Maxignición")).toBeTruthy();
    expect(screen.getByText("Maxiciclón")).toBeTruthy();
    expect(screen.getByText("Maxibarrera")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: /Ver los 19 Max Moves/i })
    );

    expect(screen.getByText("Maxichorro")).toBeTruthy();
    expect(screen.getByText("Maxiestela")).toBeTruthy();
  });

  it("enlaza la forma Gigamax a su propia ficha", () => {
    renderSection();

    const link = screen.getByRole("link", { name: /Ver ficha completa/i });
    expect(link.getAttribute("href")).toBe("/pokemon/10196");
  });

  it("muestra la tarjeta informativa de Eternamax", () => {
    renderSection({
      forms: [],
      base: {
        ...CHARIZARD_BASE,
        id: 890,
        name: "eternatus",
        types: ["poison", "dragon"],
      },
      speciesId: 890,
    });

    expect(screen.getByText("No puede Dinamaxizar")).toBeTruthy();
    expect(screen.getByText("Eternamax")).toBeTruthy();
    expect(screen.getByText(/No se puede obtener ni usar en combate/i)).toBeTruthy();
  });

  it("mantiene las reglas completas detrás de un acordeón", () => {
    renderSection();

    const trigger = screen.getByRole("button", {
      name: /Reglas de la transformación/i,
    });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Todo son Max Moves")).toBeNull();

    fireEvent.click(trigger);

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Todo son Max Moves")).toBeTruthy();
    expect(screen.getByText("Requiere la Banda Dinamax.")).toBeTruthy();
  });

  it("oculta el efecto de cada Max Move hasta abrir la tarjeta", () => {
    renderSection();

    const trigger = screen.getByRole("button", {
      name: "Ver efecto de Maxignición",
    });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Invoca sol intenso durante 5 turnos.")).toBeNull();

    fireEvent.click(trigger);

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(
      screen.getByText("Invoca sol intenso durante 5 turnos.")
    ).toBeTruthy();
  });

  it("presenta la relación evolutiva con imágenes cuando la evolución sí Gigamaxiza", () => {
    renderSection({
      forms: [],
      base: {
        ...CHARIZARD_BASE,
        id: 5,
        name: "charmeleon",
        types: ["fire"],
        stats: [{ name: "hp", base_stat: 58 }],
      },
      speciesId: 5,
      gmaxRelatives: [{ id: 6, name: "charizard", direction: "later" }],
    });

    expect(screen.getByText("Su evolución · Gigamax sí")).toBeTruthy();
    expect(screen.getAllByAltText("Charizard").length).toBeGreaterThan(0);
    expect(screen.getAllByAltText("Charmeleon").length).toBeGreaterThan(0);
  });

  it("no reserva una relación vacía cuando no hay parientes con Gigamax", () => {
    renderSection({
      forms: [],
      base: {
        ...CHARIZARD_BASE,
        id: 1,
        name: "bulbasaur",
        types: ["grass", "poison"],
        stats: [{ name: "hp", base_stat: 45 }],
      },
      speciesId: 1,
    });

    expect(screen.getByText("Sin forma Gigamax")).toBeTruthy();
    expect(screen.queryByText(/Gigamax sí/)).toBeNull();
  });

  it("permite consultar las notas del Factor Gigamax", () => {
    renderSection();

    expect(screen.queryByText(/El Factor Gigamax no se hereda/)).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: /Cómo obtener esta forma/i })
    );

    expect(screen.getByText(/El Factor Gigamax no se hereda/)).toBeTruthy();
  });

  it("no compara formas cuando la ficha base ya es la forma Gigamax", () => {
    renderSection({
      base: { ...CHARIZARD_BASE, id: 10196, name: "charizard-gmax" },
    });

    expect(
      screen.queryByRole("heading", { name: "Comparación de formas" })
    ).toBeNull();
    expect(screen.queryByRole("link", { name: /Ver ficha completa/i })).toBeNull();
  });
});
