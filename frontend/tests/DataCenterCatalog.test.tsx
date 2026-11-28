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

function indexFor(
  entries: CatalogIndexResponse["items"],
  category: "items" | "berries" = "items"
): CatalogIndexResponse {
  return {
    meta: {
      category,
      source: "PokeAPI",
      generatedAt: "2026-01-01T00:00:00.000Z",
      total: entries.length,
      filtered: entries.length,
      limit: 50,
      offset: 0,
    },
    groups: [{ id: category === "items" ? "item" : "berry", count: entries.length }],
    items: entries,
  };
}

const INDEX = indexFor([
  {
    id: 1,
    name: "potion",
    label: "Poción",
    group: "item",
    pocket: "medicine",
    category: "potion",
    categoryLabel: "Poción",
  },
  {
    id: 2,
    name: "super-potion",
    label: "Súper Poción",
    group: "item",
    pocket: "medicine",
    category: "potion",
    categoryLabel: "Poción",
  },
  {
    id: 3,
    name: "master-ball",
    label: "Master Ball",
    group: "item",
    pocket: "pokeballs",
    category: "ball",
    categoryLabel: "Poké Ball",
  },
]);

const PAGED_INDEX = indexFor(
  Array.from({ length: 13 }, (_, position) => ({
    id: position + 1,
    name: `potion-${position + 1}`,
    label: `Poción ${position + 1}`,
    group: "item",
    pocket: "medicine",
    category: "potion",
    categoryLabel: "Poción",
  }))
);

function renderApp(category: "items" | "berries" = "items") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/centro-datos?category=${category}`]}>
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

  it("muestra el acordeón de bolsas y abre el detalle al elegir una tarjeta", async () => {
    renderApp();

    expect(
      await screen.findByRole("heading", { name: "Catálogo de objetos" }, { timeout: 5000 })
    ).toBeTruthy();
    expect(screen.queryByText("Entradas")).toBeNull();
    expect(screen.queryByText("Con estos filtros")).toBeNull();

    const medicine = screen.getByRole("button", { name: "Medicina, 2 objetos" });
    expect(medicine.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("button", { name: "Ver detalle de Poción" })).toBeNull();

    fireEvent.click(medicine);

    expect(
      await screen.findByRole(
        "region",
        { name: "Medicina" },
        { timeout: 5000 }
      )
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Ver detalle de Poción" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Ver detalle de Súper Poción" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Ver detalle de Poción" }));

    expect(
      await screen.findByRole(
        "region",
        { name: "Detalle del recurso" },
        { timeout: 5000 }
      )
    ).toBeTruthy();
    expect(
      await screen.findByText("Restaura 20 PS.", { timeout: 5000 })
    ).toBeTruthy();
    expect(await screen.findByText("Coste", { timeout: 5000 })).toBeTruthy();
  });

  it("envía la búsqueda global al backend y agrupa las coincidencias por bolsa y categoría", async () => {
    renderApp();

    const input = await screen.findByRole("searchbox", { name: "Buscar en Objetos" }, { timeout: 5000 });
    fireEvent.change(input, { target: { value: "poción" } });

    await waitFor(() => {
      expect(vi.mocked(getDataCenterCatalog).mock.calls.at(-1)?.[1].q).toBe("poción");
    });
    expect(
      await screen.findByRole(
        "region",
        { name: "Resultados de búsqueda" },
        { timeout: 5000 }
      )
    ).toBeTruthy();
    expect(screen.getByText("Medicina · Poción")).toBeTruthy();
    expect(screen.getByText("Poké Balls · Poké Ball")).toBeTruthy();
  });

  it("pagina cada categoría de una bolsa en grupos de 12", async () => {
    vi.mocked(getDataCenterCatalog).mockResolvedValue(PAGED_INDEX);
    renderApp();

    fireEvent.click(
      await screen.findByRole(
        "button",
        { name: "Medicina, 13 objetos" },
        { timeout: 5000 }
      )
    );

    expect(
      await screen.findByRole(
        "region",
        { name: "Medicina" },
        { timeout: 5000 }
      )
    ).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /^Ver detalle de/ })).toHaveLength(12);
    expect(screen.queryByRole("button", { name: "Ver detalle de Poción 13" })).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: "Siguiente página de Poción" })
    );

    expect(
      await screen.findByRole(
        "button",
        { name: "Ver detalle de Poción 13" },
        { timeout: 5000 }
      )
    ).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /^Ver detalle de/ })).toHaveLength(1);
  });

  it("conserva la vista plana y las tarjetas de resumen en bayas", async () => {
    vi.mocked(getDataCenterCatalog).mockResolvedValue(
      indexFor(
        [
          {
            id: 10,
            name: "cheri-berry",
            label: "Baya Cheri",
            group: "berry",
          },
        ],
        "berries"
      )
    );
    renderApp("berries");

    expect(
      await screen.findByRole("heading", { name: "Catálogo de bayas" }, { timeout: 5000 })
    ).toBeTruthy();
    expect(screen.getByText("Entradas")).toBeTruthy();
    expect(screen.getByText("Con estos filtros")).toBeTruthy();
    expect(screen.getByText("Recursos")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Ver detalle de Baya Cheri" })).toBeTruthy();
    expect(screen.queryByRole("navigation", { name: "Bolsas de objetos" })).toBeNull();
  });
});
