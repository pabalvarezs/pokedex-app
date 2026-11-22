import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MegaForms from "../src/components/MegaForms";
import type { MegaForm } from "../src/services/api";

const FORMS: MegaForm[] = [
  {
    id: 10034,
    name: "charizard-mega-x",
    baseName: "charizard",
    variant: "X",
    types: ["fire", "dragon"],
    artwork: "https://example.com/charizard-mega-x.png",
  },
  {
    id: 10035,
    name: "charizard-mega-y",
    baseName: "charizard",
    variant: "Y",
    types: ["fire", "flying"],
    artwork: "https://example.com/charizard-mega-y.png",
  },
];

function renderForms(forms: MegaForm[]) {
  return render(
    <MemoryRouter>
      <MegaForms forms={forms} />
    </MemoryRouter>
  );
}

describe("MegaForms", () => {
  afterEach(() => {
    cleanup();
  });

  it("muestra una ficha aparte con las Mega X e Y y sus tipos", () => {
    renderForms(FORMS);

    expect(screen.getByRole("heading", { name: /Megaevoluciones/i })).toBeTruthy();
    expect(screen.getByText("Mega Charizard X")).toBeTruthy();
    expect(screen.getByText("Mega Charizard Y")).toBeTruthy();
    expect(screen.getByText("Dragón")).toBeTruthy();
    expect(screen.getByText("Volador")).toBeTruthy();
    expect(screen.getByText(/No son evolución permanente/i)).toBeTruthy();
  });

  it("enlaza cada forma a su propia ficha", () => {
    renderForms(FORMS);

    const links = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));

    expect(links).toEqual(["/pokemon/10034", "/pokemon/10035"]);
  });

  it("no renderiza nada cuando no hay formas", () => {
    const { container } = renderForms([]);

    expect(container.textContent).toBe("");
  });

  it("muestra tanto la Mega normal como la Mega Z", () => {
    renderForms([
      {
        id: 10057,
        name: "absol-mega",
        baseName: "absol",
        types: ["dark"],
        artwork: "https://example.com/absol-mega.png",
      },
      {
        id: 10307,
        name: "absol-mega-z",
        baseName: "absol",
        variant: "Z",
        types: ["dark", "fairy"],
        artwork: "https://example.com/absol-mega-z.png",
      },
    ]);

    expect(screen.getByText("Mega Absol")).toBeTruthy();
    expect(screen.getByText("Mega Absol Z")).toBeTruthy();
    expect(screen.getByText("2 formas")).toBeTruthy();
  });

  it("distingue Megas con prefijo que antes compartían título", () => {
    renderForms([
      {
        id: 10300,
        name: "tatsugiri-curly-mega",
        baseName: "tatsugiri",
        variant: "Curly",
        types: ["dragon"],
      },
      {
        id: 10301,
        name: "tatsugiri-droopy-mega",
        baseName: "tatsugiri",
        variant: "Droopy",
        types: ["dragon"],
      },
      {
        id: 10302,
        name: "tatsugiri-stretchy-mega",
        baseName: "tatsugiri",
        variant: "Stretchy",
        types: ["dragon"],
      },
    ]);

    expect(screen.getByText("Mega Tatsugiri Curly")).toBeTruthy();
    expect(screen.getByText("Mega Tatsugiri Droopy")).toBeTruthy();
    expect(screen.getByText("Mega Tatsugiri Stretchy")).toBeTruthy();
  });
});
