import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "../src/App";
import { suggestPokemon } from "../src/services/api";

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
  suggestPokemon: vi.fn(async () => []),
  adminListUsers: vi.fn(async () => []),
  adminListFavorites: vi.fn(async () => []),
  adminCreateUser: vi.fn(),
  adminUpdateUser: vi.fn(),
  adminDeleteUser: vi.fn(),
  adminCreateFavorite: vi.fn(),
  adminUpdateFavorite: vi.fn(),
  adminDeleteFavorite: vi.fn(),
  getApiErrorMessage: vi.fn(() => "error"),
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

  afterEach(() => {
    cleanup();
  });

  it("renderiza la portada con Pokémon y sus tipos", async () => {
    renderApp();

    expect(screen.getByRole("heading", { name: "PokeChile" })).toBeTruthy();
    expect(await screen.findByText("bulbasaur")).toBeTruthy();
    expect(screen.getByText(/Mostrando 1 de 1 Pokémon/i)).toBeTruthy();
    expect(screen.getByText("Planta")).toBeTruthy();
    expect(screen.getByText("Veneno")).toBeTruthy();
  });

  it("muestra sugerencias predictivas al buscar un Pokémon", async () => {
    vi.mocked(suggestPokemon).mockResolvedValueOnce([
      { id: 25, name: "pikachu" },
    ]);
    renderApp();

    const input = screen.getByLabelText(/Buscar Pokémon/i);
    fireEvent.change(input, { target: { value: "pika" } });

    expect(await screen.findByText("Pikachu")).toBeTruthy();
    expect(screen.getByText("#025")).toBeTruthy();
  });

  it("pide iniciar sesión en favoritos sin sesión", async () => {
    renderApp(["/favorites"]);

    expect(await screen.findByText(/Inicia sesión para ver tus regalones/i)).toBeTruthy();
  });

  it("no muestra las credenciales de prueba en el login", () => {
    renderApp(["/login"]);

    expect(screen.getByText(/Acceso Entrenador/i)).toBeTruthy();
    expect(screen.queryByText(/Credenciales de prueba/i)).toBeNull();
    expect(screen.queryByText(/pablito2026/i)).toBeNull();
    expect(screen.queryByText(/Pablito/i)).toBeNull();
  });
});
