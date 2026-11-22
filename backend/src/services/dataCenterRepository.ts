import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import type { DataCenterDataset } from "./dataCenterTypes";

export interface SnapshotStatus {
  refreshing: boolean;
  generatedAt: string | null;
  count: number;
  failed: number;
  lastError: string | null;
}

interface SnapshotRow {
  generatedAt: Date;
  payload: unknown;
  count: number;
  failed: number;
  refreshing: boolean;
  lastError: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Frontera de deserialización: validamos la forma mínima del snapshot antes de
 * confiar en él. Un registro creado por `setRefreshing` (aún sin datos) no se
 * considera un dataset válido.
 */
function restoreDataset(row: SnapshotRow): DataCenterDataset | null {
  const payload = row.payload;
  if (!isRecord(payload) || !Array.isArray(payload.entries)) return null;
  if (payload.entries.length === 0 || typeof payload.generatedAt !== "string") {
    return null;
  }

  const dataset = payload as unknown as DataCenterDataset;
  return {
    category: "pokemon",
    generatedAt: dataset.generatedAt,
    source: dataset.source ?? "PokeAPI",
    count: typeof dataset.count === "number" ? dataset.count : dataset.entries.length,
    failed: typeof dataset.failed === "number" ? dataset.failed : 0,
    entries: dataset.entries,
  };
}

function handleDbError(action: string, error: unknown): void {
  console.warn(`[data-center] no se pudo ${action} en la base de datos`, error);
}

/** Convierte el dataset a un valor JSON válido para Prisma sin casteos. */
function serializeDataset(dataset: DataCenterDataset): Prisma.InputJsonValue {
  return {
    category: dataset.category,
    generatedAt: dataset.generatedAt,
    source: dataset.source,
    count: dataset.count,
    failed: dataset.failed,
    entries: dataset.entries.map((entry) => ({
      id: entry.id,
      name: entry.name,
      speciesId: entry.speciesId,
      sprite: entry.sprite,
      artwork: entry.artwork,
      types: entry.types,
      generation: entry.generation,
      isDefault: entry.isDefault,
      height: entry.height,
      weight: entry.weight,
      stats: {
        hp: entry.stats.hp,
        attack: entry.stats.attack,
        defense: entry.stats.defense,
        "special-attack": entry.stats["special-attack"],
        "special-defense": entry.stats["special-defense"],
        speed: entry.stats.speed,
      },
      total: entry.total,
    })),
  };
}

export async function readSnapshot(
  category: string
): Promise<DataCenterDataset | null> {
  try {
    const row = await prisma.dataCenterSnapshot.findUnique({ where: { category } });
    return row ? restoreDataset(row) : null;
  } catch (error) {
    handleDbError("leer el snapshot", error);
    return null;
  }
}

export async function readStatus(
  category: string
): Promise<SnapshotStatus | null> {
  try {
    const row = await prisma.dataCenterSnapshot.findUnique({
      where: { category },
      select: {
        generatedAt: true,
        count: true,
        failed: true,
        refreshing: true,
        lastError: true,
      },
    });
    if (!row) return null;
    return {
      refreshing: row.refreshing,
      generatedAt: row.generatedAt.toISOString(),
      count: row.count,
      failed: row.failed,
      lastError: row.lastError,
    };
  } catch (error) {
    handleDbError("leer el estado", error);
    return null;
  }
}

export async function writeSnapshot(
  category: string,
  dataset: DataCenterDataset
): Promise<void> {
  const generatedAt = new Date(dataset.generatedAt);
  const values = {
    generatedAt,
    payload: serializeDataset(dataset),
    count: dataset.count,
    failed: dataset.failed,
    refreshing: false,
    lastError: null,
  };

  try {
    await prisma.dataCenterSnapshot.upsert({
      where: { category },
      create: { category, ...values },
      update: values,
    });
  } catch (error) {
    handleDbError("guardar el snapshot", error);
  }
}

export async function setRefreshing(
  category: string,
  refreshing: boolean,
  lastError: string | null = null
): Promise<void> {
  try {
    await prisma.dataCenterSnapshot.upsert({
      where: { category },
      create: {
        category,
        generatedAt: new Date(0),
        payload: {
          category: "pokemon",
          generatedAt: new Date(0).toISOString(),
          source: "PokeAPI",
          count: 0,
          failed: 0,
          entries: [],
        },
        count: 0,
        failed: 0,
        refreshing,
        lastError,
      },
      update: { refreshing, lastError },
    });
  } catch (error) {
    handleDbError("actualizar el estado", error);
  }
}
