import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EvolutionChain from "../src/components/EvolutionChain";
import type { EvolutionStage } from "../src/services/api";

const STAGES: EvolutionStage[] = [
  { members: [{ id: 1, name: "bulbasaur" }] },
  { members: [{ id: 2, name: "ivysaur", condition: "Nivel 16" }] },
  { members: [{ id: 3, name: "venusaur", condition: "Nivel 32" }] },
];

function renderChain(stages: EvolutionStage[], currentId: number) {
  return render(
    <MemoryRouter>
      <EvolutionChain stages={stages} currentId={currentId} />
    </MemoryRouter>
  );
}

describe("EvolutionChain", () => {
  afterEach(() => {
    cleanup();
  });

  it("muestra las etapas, condiciones y la especie actual", () => {
    renderChain(STAGES, 2);

    expect(screen.getByRole("heading", { name: /Cadena evolutiva/i })).toBeTruthy();
    expect(screen.getByText("Bulbasaur")).toBeTruthy();
    expect(screen.getByText("Ivysaur")).toBeTruthy();
    expect(screen.getByText("Venusaur")).toBeTruthy();
    expect(screen.getByText("Nivel 16")).toBeTruthy();
    expect(screen.getByText("Nivel 32")).toBeTruthy();
    expect(screen.getByText("#002")).toBeTruthy();

    const current = screen.getByText("Ivysaur").closest("a");
    expect(current?.getAttribute("aria-current")).toBe("page");
  });

  it("avisa cuando el Pokémon no evoluciona", () => {
    renderChain([{ members: [{ id: 25, name: "pikachu" }] }], 25);

    expect(screen.getByText(/Pikachu no evoluciona/i)).toBeTruthy();
  });
});
