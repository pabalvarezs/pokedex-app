import { useState } from "react";
import { m } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "../../../admin/lib/cn";
import { useReducedMotionSafe } from "../../../../hooks/useReducedMotionSafe";
import { formatNumber } from "../../lib/format";
import { slideInRight } from "../../../../lib/motion";
import type { CatalogEntry } from "../../lib/types";
import { DATA_CENTER_CATALOGS, type CatalogMeta } from "../../lib/catalogs";
import type { ItemCategoryGroup, ItemPocketGroup } from "./itemPockets";
import CatalogCard from "./CatalogCard";

const PAGE_SIZE = 12;

interface Selection {
  group: string;
  id: number;
}

interface Props {
  title: string;
  subtitle: string;
  groups: readonly ItemPocketGroup[];
  /** En búsquedas se muestra la bolsa de cada grupo junto a la categoría. */
  searching: boolean;
  searchTerm: string;
  selected: Selection | null;
  onSelect: (entry: CatalogEntry) => void;
  onClose: () => void;
}

/** Panel que se despliega hacia la derecha al abrir una bolsa. */
export default function ItemPocketPanel({
  title,
  subtitle,
  groups,
  searching,
  searchTerm,
  selected,
  onSelect,
  onClose,
}: Props) {
  const reduceMotion = useReducedMotionSafe();
  const meta = DATA_CENTER_CATALOGS.items;

  return (
    <m.section
      aria-label={title}
      variants={slideInRight}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      exit={reduceMotion ? undefined : "exit"}
      className="glass-surface glass-blur min-w-0 rounded-card border border-line p-3 shadow-card sm:p-4"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-black text-ink-900">{title}</h3>
          <p className="mt-0.5 text-[11px] font-semibold text-ink-500">
            {subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar bolsa"
          className="focus-accent grid h-9 w-9 shrink-0 place-items-center rounded-control border border-line bg-white text-ink-500 transition hover:border-red-300 hover:text-red-700"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {groups.length === 0 ? (
        <p className="rounded-control border border-line-soft bg-white/70 p-4 text-xs font-semibold text-ink-500">
          No hay objetos en esta bolsa con los filtros actuales.
        </p>
      ) : (
        <div className="min-w-0 space-y-5">
          {groups.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.id} className="min-w-0">
                {searching && (
                  <div className="mb-2 flex min-w-0 items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
                    <h4 className="min-w-0 truncate text-xs font-black uppercase tracking-wide text-ink-700">
                      {group.label}
                    </h4>
                    <span className="shrink-0 text-[10px] font-bold tabular-nums text-ink-500">
                      {formatNumber(group.count)}
                    </span>
                  </div>
                )}
                <div
                  className={cn(
                    "min-w-0 space-y-4",
                    searching && "border-l-2 border-line-soft pl-2 sm:pl-3"
                  )}
                >
                  {group.categories.map((category) => (
                    <CategoryGrid
                      key={`${category.key}-${searchTerm}`}
                      category={category}
                      locationLabel={
                        searching
                          ? `${group.label} · ${category.label}`
                          : category.label
                      }
                      selected={selected}
                      onSelect={onSelect}
                      meta={meta}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </m.section>
  );
}

interface GridProps {
  category: ItemCategoryGroup;
  locationLabel: string;
  selected: Selection | null;
  onSelect: (entry: CatalogEntry) => void;
  meta: CatalogMeta;
}

function CategoryGrid({
  category,
  locationLabel,
  selected,
  onSelect,
  meta,
}: GridProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(category.entries.length / PAGE_SIZE));
  const current = Math.min(page, totalPages - 1);
  const visible = category.entries.slice(
    current * PAGE_SIZE,
    (current + 1) * PAGE_SIZE
  );

  return (
    <div className="min-w-0">
      <div className="mb-2 flex min-w-0 flex-wrap items-baseline justify-between gap-1 border-b border-line-soft pb-1.5">
        <h5 className="min-w-0 truncate text-xs font-black text-ink-900">
          {locationLabel}
        </h5>
        <span className="shrink-0 text-[10px] font-bold tabular-nums text-ink-500">
          {formatNumber(category.entries.length)} objetos
        </span>
      </div>

      <ul className="grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((entry) => (
          <li key={`${entry.group}-${entry.id}`} className="min-w-0">
            <CatalogCard
              entry={entry}
              meta={meta}
              location={locationLabel}
              selected={
                selected?.group === entry.group && selected.id === entry.id
              }
              onSelect={() => onSelect(entry)}
            />
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <nav
          aria-label={`Paginación de ${locationLabel}`}
          className="mt-3 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            type="button"
            onClick={() => setPage((previous) => Math.max(0, previous - 1))}
            disabled={current === 0}
            aria-label={`Anterior página de ${locationLabel}`}
            className="focus-accent inline-flex min-h-[40px] items-center gap-1 rounded-control border border-line bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-sm transition hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Anterior
          </button>
          <span className="text-xs font-bold tabular-nums text-ink-500">
            Página {formatNumber(current + 1, 0)} de{" "}
            {formatNumber(totalPages, 0)}
          </span>
          <button
            type="button"
            onClick={() => setPage((previous) => previous + 1)}
            disabled={current + 1 >= totalPages}
            aria-label={`Siguiente página de ${locationLabel}`}
            className="focus-accent inline-flex min-h-[40px] items-center gap-1 rounded-control border border-line bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-sm transition hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  );
}
