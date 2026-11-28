import { Leaf, Package, type LucideIcon } from "lucide-react";
import { CATALOG_CATEGORIES, type CatalogCategory } from "./types";

export interface CatalogMeta {
  id: CatalogCategory;
  label: string;
  shortLabel: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Etiqueta en español de cada recurso de PokéAPI dentro de la categoría. */
  groups: Record<string, string>;
}

/**
 * Única fuente de verdad en el frontend para las pestañas de catálogo: la usa
 * el registro de categorías y el propio panel para su cabecera y filtros.
 */
export const DATA_CENTER_CATALOGS: Record<CatalogCategory, CatalogMeta> = {
  items: {
    id: "items",
    label: "Objetos",
    shortLabel: "Objetos",
    title: "Catálogo de objetos",
    description: "Categoría, coste, propiedades y efecto de cada objeto.",
    icon: Package,
    groups: { item: "Objeto" },
  },
  berries: {
    id: "berries",
    label: "Bayas",
    shortLabel: "Bayas",
    title: "Catálogo de bayas",
    description: "Cultivo, firmeza, sabores y potencia de cada baya.",
    icon: Leaf,
    groups: { berry: "Baya" },
  },
};

export function isCatalogCategory(value: string | null): value is CatalogCategory {
  return (
    value !== null &&
    (CATALOG_CATEGORIES as readonly string[]).includes(value)
  );
}

export function getCatalogMeta(value: string | null): CatalogMeta {
  return isCatalogCategory(value)
    ? DATA_CENTER_CATALOGS[value]
    : DATA_CENTER_CATALOGS.items;
}

export function groupLabel(meta: CatalogMeta, group: string): string {
  return (
    meta.groups[group] ??
    group.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}
