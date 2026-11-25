import { describe, it, expect } from "vitest";
import { filterCatalog, type CatalogIndex } from "../src/services/dataCenterCatalogs";

const index: CatalogIndex = {
  category: "items",
  generatedAt: "2026-01-01T00:00:00.000Z",
  source: "PokeAPI",
  failed: 0,
  items: [
    { id: 1, name: "master-ball", label: "Master Ball", group: "item" },
    { id: 2, name: "ultra-ball", label: "Ultra Ball", group: "item" },
    { id: 10, name: "cheri-berry", label: "Baya Cheri", group: "berry" },
    { id: 11, name: "chesto-berry", label: "Baya Chesto", group: "berry" },
  ],
};

const ALL_GROUPS = [
  { id: "berry", count: 2 },
  { id: "item", count: 2 },
];

describe("Centro de Datos: catálogos", () => {
  it("filtra por término sin distinguir mayúsculas", () => {
    const result = filterCatalog(index, {
      q: "MASTER",
      group: null,
      limit: 10,
      offset: 0,
    });
    expect(result.meta.filtered).toBe(1);
    expect(result.items.map((item) => item.name)).toEqual(["master-ball"]);
  });

  it("combina búsqueda por etiqueta en español y recurso", () => {
    const result = filterCatalog(index, {
      q: "baya",
      group: "berry",
      limit: 10,
      offset: 0,
    });
    expect(result.meta.filtered).toBe(2);
    expect(result.items[0].id).toBe(10);
    expect(result.groups).toEqual(ALL_GROUPS);
  });

  it("pagina sin perder el total y mantiene disponibles todos los recursos", () => {
    const result = filterCatalog(index, {
      q: "",
      group: null,
      limit: 2,
      offset: 2,
    });
    expect(result.meta.total).toBe(4);
    expect(result.meta.filtered).toBe(4);
    expect(result.items.map((item) => item.id)).toEqual([10, 11]);
    expect(result.groups).toEqual(ALL_GROUPS);
  });

  it("devuelve listado vacío cuando no hay coincidencias", () => {
    const result = filterCatalog(index, {
      q: "inexistente",
      group: null,
      limit: 10,
      offset: 0,
    });
    expect(result.items).toEqual([]);
    expect(result.groups).toEqual(ALL_GROUPS);
  });
});
