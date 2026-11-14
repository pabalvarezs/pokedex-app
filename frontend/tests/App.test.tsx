import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "../src/App";
import { listPokemonByGeneration, listPokemonByType, suggestPokemon, listPokemon } from "../src/services/api";

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

  it("selecciona todos los tipos con la opción Todos", async () => {
    renderApp();

    await screen.findByText("bulbasaur");
    fireEvent.click(screen.getByRole("button", { name: /Tipo/i }));

    const todos = screen.getByRole("button", { name: "Todos" });
    fireEvent.click(todos);

    // 18 tipos más el propio botón "Todos"
    expect(screen.getAllByRole("button", { pressed: true })).toHaveLength(19);
    expect(screen.getByText("Todos los tipos")).toBeTruthy();
    // "Todos" es un estado de filtro: debe poder limpiarse aunque no restrinja
    expect(screen.getByRole("button", { name: /Limpiar todo/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Todos" }));
    expect(screen.queryByText("Todos los tipos")).toBeNull();
    expect(screen.queryByRole("button", { name: /Limpiar todo/i })).toBeNull();
  });

  it("selecciona todas las generaciones con la opción Todos", async () => {
    renderApp();

    await screen.findByText("bulbasaur");
    fireEvent.click(screen.getByRole("button", { name: /Generación/i }));

    fireEvent.click(screen.getByRole("button", { name: "Todos" }));

    // 9 generaciones más el propio botón "Todos"
    expect(screen.getAllByRole("button", { pressed: true })).toHaveLength(10);
    expect(screen.getByText("Todas las generaciones")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Limpiar todo/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Todos" }));
    expect(screen.queryByText("Todas las generaciones")).toBeNull();
    expect(screen.queryByRole("button", { name: /Limpiar todo/i })).toBeNull();
  });

  it("quita los Pokémon de una generación al desmarcarla", async () => {
    vi.mocked(listPokemonByGeneration).mockImplementation(async (gen: number) => ({
      pokemon: gen === 1 ? [{ id: 1, name: "bulbasaur", types: ["grass", "poison"] }] : [],
      total: gen === 1 ? 1 : 0,
      generation: gen,
    }));

    renderApp();
    await screen.findByText("bulbasaur");
    fireEvent.click(screen.getByRole("button", { name: /Generación/i }));
    fireEvent.click(screen.getByRole("button", { name: "Todos" }));

    const gen1 = screen.getByRole("button", { name: /Gen 1 · Kanto/ });
    fireEvent.click(gen1);

    expect(gen1.getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByText(/Sin Gen 1 · Kanto/)).toBeTruthy();
    // "Todas las generaciones" sigue visible junto a la exclusión
    expect(screen.getByText("Todas las generaciones")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Generación 1 excluida/i })).toBeTruthy();
    // 9 generaciones menos Gen 1: el resto sigue marcado y "Todos" ya no lo está
    expect(screen.getAllByRole("button", { pressed: true })).toHaveLength(8);

    await waitFor(() => expect(screen.queryByText("bulbasaur")).toBeNull());
  });

  it("excluye un tipo al quitarlo después de pulsar Todos", async () => {
    vi.mocked(listPokemonByType).mockImplementation(async (type: string) => {
      if (type === "grass" || type === "poison") {
        return {
          pokemon: [{ id: 1, name: "bulbasaur", types: ["grass", "poison"] }],
          total: 1,
          type,
        };
      }
      return { pokemon: [], total: 0, type };
    });

    renderApp();
    await screen.findByText("bulbasaur");
    fireEvent.click(screen.getByRole("button", { name: /Tipo/i }));
    fireEvent.click(screen.getByRole("button", { name: "Todos" }));

    const planta = screen.getByRole("button", { name: "Planta" });
    fireEvent.click(planta);

    expect(planta.getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByText("Sin Planta")).toBeTruthy();
    // "Todos los tipos" sigue visible junto a la exclusión y el botón lo resume
    expect(screen.getByText("Todos los tipos")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Tipo 1 excluido/i })).toBeTruthy();
    // 18 tipos menos Planta: el resto sigue marcado y "Todos" ya no lo está
    expect(screen.getAllByRole("button", { pressed: true })).toHaveLength(17);

    // Bulbasaur es Planta/Veneno: aparece por Veneno, pero se descarta por Planta
    await waitFor(() => expect(screen.queryByText("bulbasaur")).toBeNull());

    fireEvent.click(planta);
    expect(planta.getAttribute("aria-pressed")).toBe("true");
    expect(screen.queryByText("Sin Planta")).toBeNull();
    expect(await screen.findByText("bulbasaur")).toBeTruthy();
  });

  it("combina la exclusión de tipo y generación", async () => {
    vi.mocked(listPokemonByGeneration).mockImplementation(async (gen: number) => {
      const pokemon =
        gen === 1
          ? [
              { id: 1, name: "bulbasaur", types: ["grass", "poison"] },
              { id: 4, name: "charmander", types: ["fire"] },
            ]
          : gen === 2
            ? [{ id: 152, name: "chikorita", types: ["grass"] }]
            : [];
      return { pokemon, total: pokemon.length, generation: gen };
    });
    vi.mocked(listPokemonByType).mockImplementation(async (type: string) => {
      const pokemon =
        type === "grass"
          ? [
              { id: 1, name: "bulbasaur", types: ["grass", "poison"] },
              { id: 152, name: "chikorita", types: ["grass"] },
            ]
          : type === "poison"
            ? [{ id: 1, name: "bulbasaur", types: ["grass", "poison"] }]
            : type === "fire"
              ? [{ id: 4, name: "charmander", types: ["fire"] }]
              : [];
      return { pokemon, total: pokemon.length, type };
    });

    renderApp();
    await screen.findByText("bulbasaur");

    // Activa "Todos" en ambos filtros
    fireEvent.click(screen.getByRole("button", { name: /Tipo/i }));
    fireEvent.click(screen.getByRole("button", { name: /Generación/i }));
    const todos = screen.getAllByRole("button", { name: "Todos" });
    fireEvent.click(todos[0]);
    fireEvent.click(todos[1]);
    expect(await screen.findByText("charmander")).toBeTruthy();

    // Al excluir Planta se restan sus Pokémon de la unión de generaciones
    fireEvent.click(screen.getByRole("button", { name: "Planta" }));

    expect(screen.getByText("Sin Planta")).toBeTruthy();
    expect(await screen.findByText("charmander")).toBeTruthy();
    expect(screen.queryByText("bulbasaur")).toBeNull();
    expect(screen.queryByText("chikorita")).toBeNull();
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

  it("muestra y limpia el estado de búsqueda activa", async () => {
    vi.mocked(suggestPokemon).mockResolvedValueOnce([
      { id: 25, name: "pikachu" },
    ]);
    renderApp();

    const input = screen.getByLabelText(/Buscar Pokémon/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "pika" } });

    expect(await screen.findByText("Pikachu")).toBeTruthy();

    // El primer Escape cierra el panel y deja visible la búsqueda activa.
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.getByText("Búsqueda activa")).toBeTruthy();
    expect(screen.getByText("«pika»")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Limpiar" }));
    expect(input.value).toBe("");
    expect(screen.queryByText("Búsqueda activa")).toBeNull();
  });

  it("muestra un estado sin resultados al filtrar y permite limpiarlo", async () => {
    vi.mocked(listPokemonByType).mockImplementation(async (type: string) => ({
      pokemon: [],
      total: 0,
      type,
    }));
    renderApp();

    await screen.findByText("bulbasaur");
    fireEvent.click(screen.getByRole("button", { name: /Tipo/i }));
    fireEvent.click(screen.getByRole("button", { name: "Fuego" }));

    expect(
      await screen.findByText(/No pillamos ningún Pokémon con esos filtros/i)
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Ver todos los Pokémon" })
    );

    expect(await screen.findByText("bulbasaur")).toBeTruthy();
  });

  it("muestra el error de carga y permite reintentar", async () => {
    vi.mocked(listPokemon).mockRejectedValueOnce(new Error("offline"));
    renderApp();

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/No pudimos cargar los Pokémon/i);

    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByText("bulbasaur")).toBeTruthy();
  });
});
