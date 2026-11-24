import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { DataCenterDataset } from "../src/services/dataCenterTypes";

const { findUnique, upsert } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock("../src/services/prisma", () => ({
  prisma: { dataCenterSnapshot: { findUnique, upsert } },
}));

import {
  readSnapshot,
  readStatus,
  setRefreshing,
  writeSnapshot,
} from "../src/services/dataCenterRepository";

const DATASET: DataCenterDataset = {
  category: "pokemon",
  generatedAt: "2026-01-01T00:00:00.000Z",
  source: "PokeAPI",
  count: 1,
  failed: 0,
  entries: [
    {
      id: 25,
      name: "pikachu",
      speciesId: 25,
      types: ["electric"],
      generation: 1,
      isDefault: true,
      height: 4,
      weight: 60,
      stats: {
        hp: 35,
        attack: 55,
        defense: 40,
        "special-attack": 50,
        "special-defense": 50,
        speed: 90,
      },
      total: 320,
    },
  ],
};

function row(overrides: Record<string, unknown> = {}) {
  return {
    generatedAt: new Date(DATASET.generatedAt),
    payload: DATASET,
    count: 1,
    failed: 0,
    refreshing: false,
    lastError: null,
    ...overrides,
  };
}

describe("data center repository", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    findUnique.mockResolvedValue(null);
    upsert.mockResolvedValue(undefined);
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("restaura un snapshot válido desde la base de datos", async () => {
    findUnique.mockResolvedValueOnce(row());
    expect(await readSnapshot("pokemon")).toEqual(DATASET);
    expect(findUnique).toHaveBeenCalledWith({ where: { category: "pokemon" } });
  });

  it("ignora el registro vacío creado al marcar un refresh", async () => {
    findUnique.mockResolvedValueOnce(
      row({ payload: { entries: [], generatedAt: "1970-01-01T00:00:00.000Z" } })
    );
    expect(await readSnapshot("pokemon")).toBeNull();
  });

  it("expone el estado de refresco", async () => {
    findUnique.mockResolvedValueOnce(
      row({ refreshing: true, lastError: "sin conexión" })
    );
    expect(await readStatus("pokemon")).toEqual({
      refreshing: true,
      generatedAt: DATASET.generatedAt,
      count: 1,
      failed: 0,
      lastError: "sin conexión",
    });
  });

  it("persiste el snapshot y limpia el flag de refresco", async () => {
    await writeSnapshot("pokemon", DATASET);
    expect(upsert).toHaveBeenCalledTimes(1);
    const input = upsert.mock.calls[0][0];
    expect(input.where).toEqual({ category: "pokemon" });
    expect(input.update.refreshing).toBe(false);
    expect(input.update.payload.entries[0].id).toBe(25);
    expect(input.update.payload.entries[0].stats.speed).toBe(90);
  });

  it("marca y desmarca el refresco", async () => {
    await setRefreshing("pokemon", true, null);
    expect(upsert.mock.calls[0][0].update).toEqual({
      refreshing: true,
      lastError: null,
    });

    await setRefreshing("pokemon", false, "falló");
    expect(upsert.mock.calls[1][0].update).toEqual({
      refreshing: false,
      lastError: "falló",
    });
  });

  it("degrada sin lanzar si la base de datos no responde", async () => {
    findUnique.mockRejectedValue(new Error("DB caída"));
    upsert.mockRejectedValue(new Error("DB caída"));

    expect(await readSnapshot("pokemon")).toBeNull();
    expect(await readStatus("pokemon")).toBeNull();
    await expect(writeSnapshot("pokemon", DATASET)).resolves.toBeUndefined();
    await expect(setRefreshing("pokemon", true)).resolves.toBeUndefined();
  });
});
