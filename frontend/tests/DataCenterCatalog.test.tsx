import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";
import MotionProvider from "../src/context/MotionProvider";
import type { CatalogIndexResponse } from "../src/features/dataCenter/lib/types";
import { getDataCenterCatalog } from "../src/services/api";

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
  getDataCenterCatalogItem: vi.fn(async () => ({
    category: "items",
    id: 1,
    name: "potion",
    label: "Poción",
    group: "item",
    summary: "Restaura 20 PS.",
    attributes: [{ key: "cost", label: "Coste", value: "300" }],
  })),
  getDataCenterCatalogStatus: vi.fn(async () => ({ refreshing: false, generatedAt: null, count: 2, failed: 0, lastError: null })),
  refreshDataCenterCatalog: vi.fn(),
  getDataCenterTypeMatrix: vi.fn(),
  getDataCenterTypeMatrixStatus: vi.fn(async () => ({ refreshing: false, generatedAt: null, count: 0, failed: 0, lastError: null })),
  refreshDataCenterTypeMatrix: vi.fn(),
}));

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const INDEX: CatalogIndexResponse = {
  meta: {
    category: "items",
    source: "PokeAPI",
    generatedAt: "2026-01-01T00:00:00.000Z",
    total: 2,
    filtered: 2,
    limit: 12,
    offset: 0,
  },
  groups: [{ id: "item", count: 2 }],
  items: [
    { id: 1, name: "potion", label: "Poción", group: "item" },
    { id: 2, name: "super-potion", label: "Súper Poción", group: "item" },
  ],
};

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/centro-datos?category=items"]}>
        <MotionProvider>
          <App />
        </MotionProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Centro de Datos: catálogos", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      "pokedex_user",
      JSON.stringify({ id: 1, username: "admin", name: "Admin", role: "admin", avatar: "" })
    );
    vi.clearAllMocks();
    vi.mocked(getDataCenterCatalog).mockResolvedValue(INDEX);
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("muestra el catálogo de objetos y abre el detalle al elegir una tarjeta", async () => {
    renderApp();

    expect(
      await screen.findByRole("heading", { name: "Catálogo de objetos" }, { timeout: 5000 })
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Ver detalle de Poción" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Ver detalle de Súper Poción" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Ver detalle de Poción" }));

    expect(
      await screen.findByRole("region", { name: "Detalle del recurso" })
    ).toBeTruthy();
    expect(await screen.findByText("Restaura 20 PS.")).toBeTruthy();
    expect(await screen.findByText("Coste")).toBeTruthy();
  });

  it("envía la búsqueda al backend cuando cambia el filtro", async () => {
    renderApp();

    const input = await screen.findByRole("searchbox", { name: "Buscar en Objetos" }, { timeout: 5000 });
    fireEvent.change(input, { target: { value: "poción" } });

    await waitFor(() => {
      expect(vi.mocked(getDataCenterCatalog).mock.calls.at(-1)?.[1].q).toBe("poción");
    });
  });
});
