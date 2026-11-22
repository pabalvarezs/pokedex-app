import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { Database, type LucideIcon } from "lucide-react";

const PokemonCategory = lazy(
  () => import("./categories/pokemon/PokemonCategory")
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
 * Registro único de categorías. La página solo recorre este arreglo: agregar
 * Objetos, Bayas o Movimientos consiste en crear el módulo de la categoría y
 * añadir una entrada aquí (y su handler en el backend).
 */
export const DATA_CENTER_CATEGORIES: DataCenterCategoryMeta[] = [
  {
    id: "pokemon",
    label: "Pokémon",
    shortLabel: "Pokémon",
    icon: Database,
    Component: PokemonCategory,
  },
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
