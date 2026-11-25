import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";
import MotionProvider from "../src/context/MotionProvider";
import type { TypeMatrixResponse } from "../src/features/dataCenter/lib/types";
import { getDataCenterTypeMatrix } from "../src/services/api";

vi.mock("../src/services/api", () => ({
  listPokemon: vi.fn(async () => ({ pokemon: [], total: 0 })),
  listPokemonByType: vi.fn(async () => ({ pokemon: [], total: 0, type: "fire" })),
  listPokemonByGeneration: vi.fn(async () => ({ pokemon: [], total: 0, generation: 1 })),
  isFavorite: vi.fn(async () => false),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
  listFavorites: vi.fn(async () => []),
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
  getCurrentUser: vi.fn(() => null),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
  getPokemon: vi.fn(),
  searchPokemon: vi.fn(),
  suggestPokemon: vi.fn(async () => []),
  adminListUsers: vi.fn(async () => []),
  adminListFavorites: vi.fn(async () => []),
  adminListPasswordResets: vi.fn(async () => []),
  adminCreatePasswordReset: vi.fn(),
  adminCreateUser: vi.fn(),
  adminUpdateUser: vi.fn(),
  adminDeleteUser: vi.fn(),
  adminCreateFavorite: vi.fn(),
  adminUpdateFavorite: vi.fn(),
  adminDeleteFavorite: vi.fn(),
  getApiErrorMessage: vi.fn((_error: unknown, fallback?: string) => fallback ?? "error"),
  getDataCenterPokemon: vi.fn(),
  refreshDataCenterPokemon: vi.fn(),
  getDataCenterStatus: vi.fn(async () => ({ refreshing: false, generatedAt: null, count: 0, failed: 0, lastError: null })),
  getDataCenterPokemonTypes: vi.fn(async () => ({})),
  getDataCenterCatalog: vi.fn(),
  getDataCenterCatalogItem: vi.fn(),
  getDataCenterCatalogStatus: vi.fn(),
  refreshDataCenterCatalog: vi.fn(),
  getDataCenterTypeMatrix: vi.fn(),
  getDataCenterTypeMatrixStatus: vi.fn(async () => ({ refreshing: false, generatedAt: null, count: 3, failed: 0, lastError: null })),
  refreshDataCenterTypeMatrix: vi.fn(),
}));

const MATRIX: TypeMatrixResponse = {
  meta: {
    source: "PokeAPI",
    generatedAt: "2026-01-01T00:00:00.000Z",
    generation: 6,
    count: 3,
  },
  types: [
    {
      id: 10,
      slug: "fire",
      name: "Fuego",
      generation: 1,
      damageClass: "Especial",
      moveCount: 47,
      moveSlugs: ["flamethrower", "fire-blast", "overheat"],
      pokemonCount: 109,
      strongTo: ["grass"],
      weakTo: ["water"],
      resists: ["fire"],
      immuneTo: [],
    },
    {
      id: 12,
      slug: "grass",
      name: "Planta",
      generation: 1,
      damageClass: "Especial",
      moveCount: 40,
      moveSlugs: ["razor-leaf", "solar-beam"],
      pokemonCount: 100,
      strongTo: ["water"],
      weakTo: ["fire"],
      resists: [],
      immuneTo: [],
    },
    {
      id: 11,
      slug: "water",
      name: "Agua",
      generation: 1,
      damageClass: "Especial",
      moveCount: 35,
      moveSlugs: ["surf", "hydro-pump"],
      pokemonCount: 90,
      strongTo: ["fire"],
      weakTo: ["grass"],
      resists: [],
      immuneTo: [],
    },
  ],
  matrix: [
    [1, 2, 0.5],
    [1, 1, 2],
    [2, 0.5, 1],
  ],
};

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/centro-datos?category=types"]}>
        <MotionProvider>
          <App />
        </MotionProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Centro de Datos: matriz de tipos", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      "pokedex_user",
      JSON.stringify({ id: 1, username: "admin", name: "Admin", role: "admin", avatar: "" })
    );
    vi.clearAllMocks();
    vi.mocked(getDataCenterTypeMatrix).mockResolvedValue(MATRIX);
  });

  afterEach(cleanup);

  it("muestra la matriz sin buscador ni tarjetas de resumen", async () => {
    renderApp();

    expect(
      await screen.findByRole("heading", { name: "Matriz de efectividad" }, { timeout: 5000 })
    ).toBeTruthy();
    expect(screen.getByRole("table")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Fuego contra Planta: súper eficaz" })).toBeTruthy();
    expect(screen.queryByRole("searchbox")).toBeNull();
    expect(screen.queryByText("Con estos filtros")).toBeNull();
  });

  it("abre el detalle del cruce al pasar por una casilla", async () => {
    renderApp();
    const cell = await screen.findByRole(
      "button",
      { name: "Fuego contra Planta: súper eficaz" },
      { timeout: 5000 }
    );

    fireEvent.mouseEnter(cell);

    expect(await screen.findByRole("dialog", { name: "Detalle de efectividad" })).toBeTruthy();
    expect(screen.getByText("Súper eficaz: el daño se duplica.")).toBeTruthy();
  });

  it("abre el detalle del tipo al pasar por una cabecera", async () => {
    renderApp();
    const header = await screen.findByRole(
      "button",
      { name: "Tipo de ataque Fuego" },
      { timeout: 5000 }
    );

    fireEvent.mouseEnter(header);

    expect(await screen.findByRole("dialog", { name: "Detalle de tipo Fuego" })).toBeTruthy();
    expect(screen.getByText("Fuerte contra")).toBeTruthy();
    expect(screen.getByText("109")).toBeTruthy();
  });

  it("muestra las tarjetas de tipo encima de la matriz", async () => {
    renderApp();

    expect(
      await screen.findByRole("heading", { name: "Tipos elementales" }, { timeout: 5000 })
    ).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Fuego" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Ver movimientos de Fuego" })).toBeTruthy();
    expect(screen.getAllByText("Especial").length).toBeGreaterThan(0);
  });

  it("abre el popover con todos los movimientos del tipo", async () => {
    renderApp();
    const button = await screen.findByRole(
      "button",
      { name: "Ver movimientos de Fuego" },
      { timeout: 5000 }
    );

    fireEvent.mouseEnter(button);

    expect(
      await screen.findByRole("dialog", { name: "Movimientos de tipo Fuego" })
    ).toBeTruthy();
    expect(screen.getByText("Lanzallamas")).toBeTruthy();
    expect(screen.getByText("Llamarada")).toBeTruthy();
  });

  it("muestra skeletons de tarjetas y matriz mientras carga", () => {
    vi.mocked(getDataCenterTypeMatrix).mockImplementation(
      () => new Promise(() => {})
    );
    renderApp();

    expect(screen.getByLabelText("Cargando tipos")).toBeTruthy();
    expect(screen.getByLabelText("Cargando matriz de efectividad")).toBeTruthy();
  });
});
