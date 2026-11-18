import { SearchIcon } from "./icons";

export type FavoriteSort = "recent" | "name" | "dex";

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
  sortBy: FavoriteSort;
  onSortChange: (value: FavoriteSort) => void;
  shown: number;
  total: number;
}

const SORT_OPTIONS: { value: FavoriteSort; label: string }[] = [
  { value: "recent", label: "Recién agregados" },
  { value: "name", label: "Nombre (A-Z)" },
  { value: "dex", label: "N° de Pokédex" },
];

export default function FavoritesToolbar({
  query,
  onQueryChange,
  sortBy,
  onSortChange,
  shown,
  total,
}: Props) {
  return (
    <section
      aria-label="Buscar y ordenar regalones"
      className="mt-5 rounded-card border border-line bg-surface/95 p-3 shadow-card backdrop-blur-sm sm:p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block flex-1">
          <span className="sr-only">Buscar regalón por nombre</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Busca a tu regalón por nombre…"
            className="min-h-[44px] w-full rounded-control border border-line bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-semibold text-ink-900 outline-none transition placeholder:font-medium placeholder:text-ink-500 hover:border-slate-300 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-200"
          />
        </label>

        <div className="flex items-center gap-2">
          <label
            htmlFor="favorites-sort"
            className="shrink-0 text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-500"
          >
            Ordenar
          </label>
          <select
            id="favorites-sort"
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value as FavoriteSort)}
            className="min-h-[44px] flex-1 rounded-control border border-line bg-white px-3 py-2 text-sm font-bold text-ink-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 sm:flex-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p
        aria-live="polite"
        className="mt-2 text-xs font-semibold text-ink-500"
      >
        {query
          ? `Mostrando ${shown} de ${total} regalones`
          : `${total} regalón${total === 1 ? "" : "es"} en tu colección`}
      </p>
    </section>
  );
}
