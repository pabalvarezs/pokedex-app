import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";
import MotionProvider from "../src/context/MotionProvider";
import type {
  DataCenterPokemonResponse,
  RankEntry,
} from "../src/features/dataCenter/lib/types";
import {
  getDataCenterPokemon,
  refreshDataCenterPokemon,
} from "../src/services/api";

vi.mock("../src/services/api", () => ({
  listPokemon: vi.fn(async () => ({ pokemon: [], total: 0, limit: 48, offset: 0 })),
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
  getDataCenterStatus: vi.fn(async () => ({
    refreshing: false,
    generatedAt: null,
    count: 0,
    failed: 0,
    lastError: null,
  })),
  getDataCenterPokemonTypes: vi.fn(async () => ({})),
}));

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function makeEntry(id: number, name: string): RankEntry {
  return {
    id,
    name,
    types: ["fire"],
    generation: 1,
    isDefault: true,
    value: 100,
    rank: 1,
    tied: false,
  };
}

const RESPONSE: DataCenterPokemonResponse = {
  meta: {
    generatedAt: "2026-01-01T00:00:00.000Z",
    source: "PokeAPI",
    total: 2,
    filtered: 2,
    failed: 0,
    limit: 10,
    includeVariants: false,
    type: null,
    generation: null,
    tiesPolicy: "Se incluyen todos los empatados con el último puesto",
  },
  rankings: {
    total: [makeEntry(6, "charizard")],
    hp: [],
    attack: [],
    defense: [],
    specialAttack: [],
    specialDefense: [],
    speed: [],
  },
  records: {
    tallest: [makeEntry(6, "charizard")],
    shortest: [],
    heaviest: [],
    lightest: [],
  },
  insights: {
    typeAverages: [
      {
        type: "fire",
        count: 2,
        average: 500,
        stats: {
          hp: 50,
          attack: 60,
          defense: 55,
          "special-attack": 50,
          "special-defense": 55,
          speed: 40,
        },
      },
    ],
    roleLeaders: {
      attacker: [makeEntry(6, "charizard")],
      defender: [],
      fast: [],
    },
    generationDistribution: [
      { generation: 1, count: 2, percentage: 100 },
      { generation: 2, count: 0, percentage: 0 },
      { generation: 3, count: 0, percentage: 0 },
      { generation: 4, count: 0, percentage: 0 },
      { generation: 5, count: 0, percentage: 0 },
      { generation: 6, count: 0, percentage: 0 },
      { generation: 7, count: 0, percentage: 0 },
      { generation: 8, count: 0, percentage: 0 },
      { generation: 9, count: 0, percentage: 0 },
    ],
  },
};

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/centro-datos"]}>
        <MotionProvider>
          <App />
        </MotionProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

function setUser(role: "admin" | "trainer") {
  localStorage.setItem(
    "pokedex_user",
    JSON.stringify({ id: 1, username: "admin", name: "Admin", role, avatar: "" })
  );
}

describe("Centro de Datos", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(getDataCenterPokemon).mockResolvedValue(RESPONSE);
    vi.mocked(refreshDataCenterPokemon).mockResolvedValue({
      generatedAt: "2026-01-02T00:00:00.000Z",
      count: 2,
    });
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("muestra rankings, filtros y récords a un administrador", async () => {
    setUser("admin");
    renderApp();

    expect(
      await screen.findByRole("heading", { name: "Centro de Datos" }, { timeout: 10000 })
    ).toBeTruthy();
    expect(
      await screen.findByRole(
        "heading",
        { name: "Rankings de Pokémon" },
        { timeout: 10000 }
      )
    ).toBeTruthy();
    expect(screen.getByRole("region", { name: "Filtros de Pokémon" })).toBeTruthy();
    expect(screen.getByText("Más alto")).toBeTruthy();
    expect(screen.getByText("Top 10 por estadística base")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Centro de Datos/ })).toBeTruthy();
    expect(getDataCenterPokemon).toHaveBeenCalledWith({
      limit: 10,
      type: null,
      generation: null,
      includeVariants: false,
    });
  }, 15000);

  it("bloquea la página a usuarios sin rol de admin", async () => {
    setUser("trainer");
    renderApp();

    expect(
      await screen.findByText("Acceso restringido", {}, { timeout: 10000 })
    ).toBeTruthy();
    expect(screen.queryByText("Rankings de Pokémon")).toBeNull();
    expect(screen.queryByRole("link", { name: /Centro de Datos/ })).toBeNull();
    expect(getDataCenterPokemon).not.toHaveBeenCalled();
  });
});
