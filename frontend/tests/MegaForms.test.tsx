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
    expect(screen.getByText(/No son una evolución permanente/i)).toBeTruthy();
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
});
