import { describe, it, expect } from "vitest";
import {
  buildGenerationDistribution,
  buildPhysicalRecords,
  buildPokemonAnalytics,
  buildRoleLeaders,
  buildTypeAverages,
  filterEntries,
  rankBy,
} from "../src/services/dataCenterStats";
import type {
  DataCenterDataset,
  DataCenterEntry,
  DataCenterQuery,
  StatKey,
} from "../src/services/dataCenterTypes";

function stats(overrides: Partial<Record<StatKey, number>> = {}): Record<StatKey, number> {
  const base: Record<StatKey, number> = {
    hp: 50,
    attack: 60,
    defense: 55,
    "special-attack": 50,
    "special-defense": 55,
    speed: 40,
  };
  return { ...base, ...overrides };
}

function entry(
  id: number,
  overrides: Partial<DataCenterEntry> = {}
): DataCenterEntry {
  const baseStats = overrides.stats ?? stats();
  return {
    id,
    name: `pokemon-${id}`,
    speciesId: id,
    types: ["normal"],
    generation: 1,
    isDefault: true,
    height: 10,
    weight: 100,
    stats: baseStats,
    total: Object.values(baseStats).reduce((sum, value) => sum + value, 0),
    ...overrides,
  };
}

function query(overrides: Partial<DataCenterQuery> = {}): DataCenterQuery {
  return { limit: 10, type: null, generation: null, includeVariants: false, ...overrides };
}

describe("Centro de Datos: filtros y rankings", () => {
  const entries = [
    entry(1, { types: ["fire", "flying"], generation: 1 }),
    entry(2, { types: ["fire"], generation: 4 }),
    entry(3, { types: ["water"], generation: 1 }),
    entry(4, { types: ["fire"], generation: 1, isDefault: false }),
  ];

  it("combina tipo, generación y exclusión de variantes", () => {
    expect(filterEntries(entries, query({ type: "fire" })).map((e) => e.id)).toEqual([
      1, 2,
    ]);
    expect(
      filterEntries(entries, query({ type: "fire", generation: 1 })).map(
        (e) => e.id
      )
    ).toEqual([1]);
    expect(
      filterEntries(
        entries,
        query({ type: "fire", generation: 1, includeVariants: true })
      ).map((e) => e.id)
    ).toEqual([1, 4]);
  });

  it("incluye todos los empatados con el corte y desempata por ID", () => {
    const tied = [
      entry(3, { stats: stats({ speed: 90 }), total: 90 }),
      entry(1, { stats: stats({ speed: 90 }), total: 90 }),
      entry(2, { stats: stats({ speed: 100 }), total: 100 }),
      entry(4, { stats: stats({ speed: 80 }), total: 80 }),
    ];

    const top = rankBy(tied, (e) => e.total, 2);
    expect(top.map((e) => e.id)).toEqual([2, 1, 3]);
    expect(top.map((e) => e.rank)).toEqual([1, 2, 2]);
    expect(top[0].tied).toBe(false);
    expect(top.slice(1).every((e) => e.tied)).toBe(true);
    expect(rankBy(tied, (e) => e.total, 1).map((e) => e.id)).toEqual([2]);
  });

  it("ordena los empates por ID aunque lleguen desordenados", () => {
    const tied = [
      entry(9, { total: 100 }),
      entry(2, { total: 100 }),
      entry(5, { total: 100 }),
    ];
    const top = rankBy(tied, (e) => e.total, 1, "desc");
    expect(top.map((e) => e.id)).toEqual([2, 5, 9]);
    expect(top.every((e) => e.rank === 1)).toBe(true);
  });

  it("convierte altura y peso a las unidades visibles", () => {
    const records = buildPhysicalRecords([
      entry(1, { height: 21, weight: 999 }),
      entry(2, { height: 4, weight: 12 }),
    ]);
    expect(records.tallest[0].value).toBe(2.1);
    expect(records.shortest[0].value).toBe(0.4);
    expect(records.heaviest[0].value).toBe(99.9);
    expect(records.lightest[0].value).toBe(1.2);
  });

  it("promedia estadísticas por tipo contando los Pokémon de doble tipo", () => {
    const averages = buildTypeAverages([
      entry(1, { types: ["fire", "flying"], total: 300 }),
      entry(2, { types: ["fire"], total: 500 }),
    ]);
    const fire = averages.find((item) => item.type === "fire");
    const flying = averages.find((item) => item.type === "flying");
    expect(fire?.count).toBe(2);
    expect(fire?.average).toBe(400);
    expect(flying?.count).toBe(1);
    expect(flying?.average).toBe(300);
  });

  it("elige líderes por rol con el criterio documentado", () => {
    const leaders = buildRoleLeaders([
      entry(1, {
        stats: stats({ attack: 120, "special-attack": 100, speed: 10 }),
      }),
      entry(2, {
        stats: stats({ defense: 150, "special-defense": 140, speed: 20 }),
      }),
      entry(3, { stats: stats({ speed: 180 }) }),
    ]);
    expect(leaders.attacker[0].id).toBe(1);
    expect(leaders.attacker[0].value).toBe(220);
    expect(leaders.defender[0].id).toBe(2);
    expect(leaders.defender[0].value).toBe(290);
    expect(leaders.fast[0].id).toBe(3);
    expect(leaders.fast[0].value).toBe(180);
  });

  it("distribuye por generación con porcentajes", () => {
    const distribution = buildGenerationDistribution([
      entry(1, { generation: 1 }),
      entry(2, { generation: 1 }),
      entry(3, { generation: 9 }),
    ]);
    expect(distribution).toHaveLength(9);
    expect(distribution[0]).toMatchObject({ count: 2, percentage: 66.7 });
    expect(distribution[8]).toMatchObject({ count: 1, percentage: 33.3 });
  });

  it("el resumen refleja los filtros aplicados", () => {
    const dataset: DataCenterDataset = {
      category: "pokemon",
      generatedAt: "2026-01-01T00:00:00.000Z",
      source: "PokeAPI",
      count: entries.length,
      failed: 0,
      entries,
    };
    const result = buildPokemonAnalytics(
      dataset,
      query({ type: "fire", generation: 1, limit: 5 })
    );
    expect(result.meta.filtered).toBe(1);
    expect(result.meta.total).toBe(4);
    expect(result.meta.type).toBe("fire");
    expect(result.meta.generation).toBe(1);
    expect(result.meta.limit).toBe(5);
    expect(result.meta.tiesPolicy).toContain("empatados");
  });
});
