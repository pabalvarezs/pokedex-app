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
  // Con pocas tarjetas la barra se achica; si son cuatro o menos, el buscador
  // sobra y solo queda el orden (salvo que haya una búsqueda activa).
  const compact = total <= 8;
  const hideSearch = total <= 4 && query.length === 0;
  const searching = query.trim().length > 0;

  return (
    <section
      aria-label="Buscar y ordenar regalones"
      className={`glass-surface glass-blur mt-5 rounded-card border border-line bg-surface/95 shadow-card ${
        compact ? "px-2.5 py-2" : "px-3 py-2.5 sm:px-4"
      }`}
    >
      <div className="flex items-center gap-2">
        {hideSearch ? (
          <p className="min-w-0 flex-1 truncate text-xs font-semibold text-ink-500">
            Colección breve: todo a la vista.
          </p>
        ) : (
          <label className="relative block min-w-0 flex-1">
            <span className="sr-only">Buscar regalón por nombre</span>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <input
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Buscar regalón…"
              className={`w-full rounded-control border border-line bg-slate-50 pl-9 pr-3 text-sm font-semibold text-ink-900 outline-none transition placeholder:font-medium placeholder:text-ink-500 hover:border-slate-300 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-200 ${
                compact ? "min-h-[40px] py-2" : "min-h-[44px] py-2.5"
              }`}
            />
          </label>
        )}

        <div className="flex shrink-0 items-center gap-2">
          <label
            htmlFor="favorites-sort"
            className={`shrink-0 text-xs font-bold uppercase tracking-[0.12em] text-ink-500 ${
              compact ? "sr-only" : "sr-only sm:not-sr-only"
            }`}
          >
            Ordenar
          </label>
          <select
            id="favorites-sort"
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value as FavoriteSort)}
            className={`max-w-[10.5rem] rounded-control border border-line bg-white px-2.5 text-sm font-bold text-ink-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 sm:max-w-none ${
              compact ? "min-h-[40px] py-2" : "min-h-[44px] py-2.5"
            }`}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {searching && (
        <p aria-live="polite" className="mt-1.5 text-xs font-semibold text-ink-500">
          Mostrando {shown} de {total} resultados
        </p>
      )}
    </section>
  );
}
