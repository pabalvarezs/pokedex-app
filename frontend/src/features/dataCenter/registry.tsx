import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { Database, Sparkles, type LucideIcon } from "lucide-react";
import { DATA_CENTER_CATALOGS } from "./lib/catalogs";
import { CATALOG_CATEGORIES } from "./lib/types";

const PokemonCategory = lazy(
  () => import("./categories/pokemon/PokemonCategory")
);
const TypesCategory = lazy(() => import("./categories/types/TypesCategory"));
const CatalogCategory = lazy(
  () => import("./categories/catalog/CatalogCategory")
);

export interface DataCenterCategoryMeta {
  /** Coincide con el segmento de la ruta del backend `/api/admin/data-center/:id`. */
  id: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  Component: LazyExoticComponent<ComponentType>;
}

/**
 * Registro único de categorías. La página solo recorre este arreglo: Tipos tiene
 * su propia vista de matriz y Objetos/Bayas comparten el catálogo genérico.
 */
/** Un único componente lazy para todos los catálogos: la pestaña se identifica por `id`. */
const catalogEntries: DataCenterCategoryMeta[] = CATALOG_CATEGORIES.map((id) => {
  const meta = DATA_CENTER_CATALOGS[id];
  return {
    id,
    label: meta.label,
    shortLabel: meta.shortLabel,
    icon: meta.icon,
    Component: CatalogCategory,
  };
});

export const DATA_CENTER_CATEGORIES: DataCenterCategoryMeta[] = [
  {
    id: "pokemon",
    label: "Pokémon",
    shortLabel: "Pokémon",
    icon: Database,
    Component: PokemonCategory,
  },
  {
    id: "types",
    label: "Tipos",
    shortLabel: "Tipos",
    icon: Sparkles,
    Component: TypesCategory,
  },
  ...catalogEntries,
];

export const DEFAULT_DATA_CENTER_CATEGORY = DATA_CENTER_CATEGORIES[0].id;

export function isDataCenterCategory(value: string | null): value is string {
  return DATA_CENTER_CATEGORIES.some((category) => category.id === value);
}

export function getDataCenterCategoryMeta(id: string): DataCenterCategoryMeta {
  return (
    DATA_CENTER_CATEGORIES.find((category) => category.id === id) ??
    DATA_CENTER_CATEGORIES[0]
  );
}
