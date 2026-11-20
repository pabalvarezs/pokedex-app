import { LayoutGrid, List, Search, X } from "lucide-react";
import type { AdminUser } from "../../../services/api";
import type { ViewMode } from "../hooks/useViewMode";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  trainer: string;
  onTrainerChange: (value: string) => void;
  users: AdminUser[];
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  resultCount: number;
  total: number;
}

/** Buscador, filtro por entrenador y selector de vista, en una sola barra. */
export default function FavoritesToolbar({
  search,
  onSearchChange,
  trainer,
  onTrainerChange,
  users,
  view,
  onViewChange,
  resultCount,
  total,
}: Props) {
  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por nombre o número…"
          aria-label="Buscar regalón por nombre o número"
          className="w-full rounded-control border border-line bg-white/90 py-2.5 pl-9 pr-9 text-sm text-ink-900 shadow-sm outline-none transition duration-150 placeholder:text-ink-500/70 focus:ring-2"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Limpiar búsqueda"
            className="focus-accent absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-ink-500 transition duration-150 hover:bg-slate-100"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="favorites-trainer-filter">
          Filtrar por entrenador
        </label>
        <select
          id="favorites-trainer-filter"
          value={trainer}
          onChange={(event) => onTrainerChange(event.target.value)}
          className="min-w-0 flex-1 rounded-control border border-line bg-white/90 px-3 py-2.5 text-sm font-semibold text-ink-700 shadow-sm outline-none transition duration-150 focus:ring-2 lg:w-56"
        >
          <option value="">Todos los entrenadores</option>
          {users.map((user) => (
            <option key={user.id} value={user.username}>
              {user.name} (@{user.username})
            </option>
          ))}
        </select>

        <div
          role="group"
          aria-label="Vista de regalones"
          className="glass-surface flex shrink-0 rounded-control border border-line p-1 shadow-soft"
        >
          <button
            type="button"
            aria-pressed={view === "table"}
            aria-label="Ver como tabla"
            title="Ver como tabla"
            onClick={() => onViewChange("table")}
            className={`focus-accent grid h-8 w-8 place-items-center rounded-[9px] transition duration-150 ${
              view === "table"
                ? "bg-[color:var(--accent)] text-[color:var(--accent-ink)] shadow-sm"
                : "text-ink-500 hover:bg-slate-100"
            }`}
          >
            <List className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-pressed={view === "grid"}
            aria-label="Ver como grilla"
            title="Ver como grilla"
            onClick={() => onViewChange("grid")}
            className={`focus-accent grid h-8 w-8 place-items-center rounded-[9px] transition duration-150 ${
              view === "grid"
                ? "bg-[color:var(--accent)] text-[color:var(--accent-ink)] shadow-sm"
                : "text-ink-500 hover:bg-slate-100"
            }`}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <p
        role="status"
        aria-live="polite"
        className="shrink-0 text-xs font-semibold tabular-nums text-ink-500"
      >
        {resultCount} de {total} regalones
      </p>
    </div>
  );
}
