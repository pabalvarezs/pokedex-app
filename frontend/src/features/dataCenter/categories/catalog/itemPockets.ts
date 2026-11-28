import {
  Cherry,
  CircleDot,
  Cog,
  HeartPulse,
  KeyRound,
  Mail,
  PackageOpen,
  Swords,
  type LucideIcon,
} from "lucide-react";
import type { CatalogEntry } from "../../lib/types";

/** Las ocho bolsas oficiales de PokéAPI, en el orden del juego. */
export const ITEM_POCKETS = [
  { id: "pokeballs", label: "Poké Balls", icon: CircleDot },
  { id: "medicine", label: "Medicina", icon: HeartPulse },
  { id: "berries", label: "Bayas", icon: Cherry },
  { id: "machines", label: "Máquinas", icon: Cog },
  { id: "battle", label: "Combate", icon: Swords },
  { id: "mail", label: "Correo", icon: Mail },
  { id: "key", label: "Clave", icon: KeyRound },
  { id: "misc", label: "Varios", icon: PackageOpen },
] as const satisfies readonly {
  id: string;
  label: string;
  icon: LucideIcon;
}[];

export type ItemPocketId = (typeof ITEM_POCKETS)[number]["id"];

export interface ItemCategoryGroup {
  key: string;
  category: string;
  label: string;
  entries: CatalogEntry[];
}

export interface ItemPocketGroup {
  id: ItemPocketId;
  label: string;
  icon: LucideIcon;
  count: number;
  categories: ItemCategoryGroup[];
}

/** Los objetos sin metadatos (índice antiguo) se agrupan en «Varios». */
export function pocketOf(entry: CatalogEntry): ItemPocketId {
  return (
    ITEM_POCKETS.find((pocket) => pocket.id === entry.pocket)?.id ?? "misc"
  );
}

function categoryLabel(category: string, entries: CatalogEntry[]): string {
  const official = entries.find((entry) => entry.categoryLabel?.trim())?.categoryLabel;
  if (official) return official;
  if (category === "other") return "Otros";
  return category
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/** Agrupa por bolsa y, dentro de cada bolsa, por categoría oficial. */
export function groupItemsByPocket(entries: readonly CatalogEntry[]): ItemPocketGroup[] {
  const byPocket = new Map<ItemPocketId, CatalogEntry[]>();
  for (const entry of entries) {
    const pocket = pocketOf(entry);
    const list = byPocket.get(pocket) ?? [];
    list.push(entry);
    byPocket.set(pocket, list);
  }

  return ITEM_POCKETS.map((pocket) => {
    const pocketEntries = byPocket.get(pocket.id) ?? [];
    const byCategory = new Map<string, CatalogEntry[]>();
    for (const entry of pocketEntries) {
      const key = entry.category?.trim() || "other";
      const list = byCategory.get(key) ?? [];
      list.push(entry);
      byCategory.set(key, list);
    }
    const categories = Array.from(byCategory, ([key, items]) => ({
      key: `${pocket.id}:${key}`,
      category: key,
      label: categoryLabel(key, items),
      entries: items,
    })).sort((a, b) => a.label.localeCompare(b.label, "es"));
    return {
      id: pocket.id,
      label: pocket.label,
      icon: pocket.icon,
      count: pocketEntries.length,
      categories,
    };
  });
}
