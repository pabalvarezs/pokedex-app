import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "../src/App";

vi.mock("../src/services/api", () => ({
  listPokemon: vi.fn(async () => ({
    pokemon: [{ id: 1, name: "bulbasaur", types: ["grass", "poison"] }],
    total: 1,
    limit: 48,
    offset: 0,
  })),
  listPokemonByType: vi.fn(async () => ({ pokemon: [], total: 0, type: "grass" })),
  listPokemonByGeneration: vi.fn(async () => ({ pokemon: [], total: 0, generation: 1 })),
  isFavorite: vi.fn(async () => false),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
  listFavorites: vi.fn(async () => []),
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
  getCurrentUser: vi.fn(() => null),
  getPokemon: vi.fn(),
  searchPokemon: vi.fn(),
}));

function renderApp(initialEntries: string[] = ["/"]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renderiza la portada con Pokémon y sus tipos", async () => {
    renderApp();

    expect(await screen.findByText("bulbasaur")).toBeTruthy();
    expect(screen.getByText(/Mostrando 1 de 1 Pokémon/i)).toBeTruthy();
    expect(screen.getByText("Planta")).toBeTruthy();
    expect(screen.getByText("Veneno")).toBeTruthy();
  });

  it("pide iniciar sesión en favoritos sin sesión", async () => {
    renderApp(["/favorites"]);

    expect(await screen.findByText(/Inicia sesión para ver tus regalones/i)).toBeTruthy();
  });
});
