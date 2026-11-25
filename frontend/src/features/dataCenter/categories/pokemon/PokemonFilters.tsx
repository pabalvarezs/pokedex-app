import { useState } from "react";
import TypeBadge from "../../../../components/TypeBadge";
import { GENERATIONS, getTypeBadge, POKEMON_TYPES } from "../../../../utils/pokemon";
import { cn } from "../../../admin/lib/cn";
import type { PokemonDataCenterFilters } from "../../lib/types";

const TOP_OPTIONS = [5, 10, 20, 50];

const INITIAL_FILTERS: PokemonDataCenterFilters = {
  limit: 10,
  type: null,
  generation: null,
  includeVariants: false,
};

interface Props {
  filters: PokemonDataCenterFilters;
  onChange: (next: PokemonDataCenterFilters) => void;
  disabled?: boolean;
}

/** Chevrón de los paneles plegables, idéntico al de la home. */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn(
        "ml-1.5 h-3.5 w-3.5 transition-transform",
        open && "rotate-180"
      )}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/** Filtros del Centro de Datos con el mismo diseño y chassis que la home. */
export default function PokemonFilters({ filters, onChange, disabled }: Props) {
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showGenFilter, setShowGenFilter] = useState(false);

  const typeLabel = filters.type ? getTypeBadge(filters.type).es : "";
  const generation = GENERATIONS.find((g) => g.id === filters.generation);

  const hasFilters =
    filters.type !== null ||
    filters.generation !== null ||
    filters.includeVariants ||
    filters.limit !== INITIAL_FILTERS.limit;
  const activeFilterCount =
    (filters.type !== null ? 1 : 0) +
    (filters.generation !== null ? 1 : 0) +
    (filters.includeVariants ? 1 : 0) +
    (filters.limit !== INITIAL_FILTERS.limit ? 1 : 0);

  const clearFilters = () => onChange(INITIAL_FILTERS);

  /**
   * Clases de los botones de sección y de los chips "Todos", copiadas de la
   * home: el estado activo se resalta en rojo; el inactivo queda neutro.
   */
  const sectionButton = (active: boolean) =>
    cn(
      "inline-flex min-h-[44px] items-center rounded-control border px-3.5 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 disabled:opacity-50",
      active
        ? "border-red-600 bg-red-600 text-white shadow-sm"
        : "border-line bg-slate-50 text-ink-700 hover:border-slate-300 hover:bg-slate-100"
    );

  const allChip = (selected: boolean) =>
    cn(
      "min-h-[40px] rounded-full border px-3 py-1.5 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50",
      selected
        ? "border-red-600 bg-red-600 text-white shadow-sm ring-2 ring-red-300 ring-offset-1"
        : "border-line bg-white text-ink-700 hover:border-slate-400 hover:bg-slate-50"
    );

  const generationChip = (selected: boolean) =>
    cn(
      "min-h-[40px] rounded-control border px-3 py-1.5 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50",
      selected
        ? "border-red-600 bg-red-600 text-white shadow-sm ring-2 ring-red-300 ring-offset-1"
        : "border-line bg-white text-ink-700 hover:border-slate-400 hover:bg-slate-50"
    );

  /** Botón ✕ de los chips del resumen (mismo patrón que la home). */
  const removeChipButton = (label: string, onClick: () => void, onDark: boolean) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "ml-1 flex h-6 w-6 items-center justify-center rounded-full opacity-70 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40",
        onDark
          ? "hover:bg-white/20 focus-visible:ring-white"
          : "hover:bg-black/10 focus-visible:ring-current"
      )}
    >
      ✕
    </button>
  );

  const darkChip = "flex items-center gap-1 rounded-full border border-transparent bg-red-600 px-3 py-1 text-[11px] font-bold text-white";

  return (
    <section
      aria-label="Filtros de Pokémon"
      className="glass-surface glass-blur relative z-10 animate-fade-up rounded-card border border-line bg-surface p-3 shadow-card sm:p-4"
    >
      {/* Fila 1: botones de sección + top N + variantes + limpiar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-500 sm:inline">
            Filtrar
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowTypeFilter(!showTypeFilter)}
            aria-expanded={showTypeFilter}
            aria-controls="dc-type-filter-panel"
            className={sectionButton(showTypeFilter)}
          >
            <span aria-hidden="true" className="mr-1.5">🎨</span>
            Tipo{typeLabel ? ` ${typeLabel}` : ""}
            <Chevron open={showTypeFilter} />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowGenFilter(!showGenFilter)}
            aria-expanded={showGenFilter}
            aria-controls="dc-gen-filter-panel"
            className={sectionButton(showGenFilter)}
          >
            <span aria-hidden="true" className="mr-1.5">🌍</span>
            Generación{generation ? ` ${generation.id}` : ""}
            <Chevron open={showGenFilter} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-line-soft pt-3 sm:ml-auto sm:border-0 sm:pt-0">
          <label
            htmlFor="dc-top-limit"
            className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-500"
          >
            Top
          </label>
          <select
            id="dc-top-limit"
            value={filters.limit}
            disabled={disabled}
            onChange={(event) =>
              onChange({ ...filters, limit: Number(event.target.value) })
            }
            className="min-h-[44px] rounded-control border border-line bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 sm:text-sm disabled:opacity-50"
          >
            {TOP_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={disabled}
            aria-pressed={filters.includeVariants}
            title="Incluye Mega, formas regionales y otras variedades"
            onClick={() =>
              onChange({ ...filters, includeVariants: !filters.includeVariants })
            }
            className={sectionButton(filters.includeVariants)}
          >
            Incluir variantes
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              disabled={disabled}
              className="inline-flex min-h-[44px] items-center rounded-control border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 disabled:opacity-50"
            >
              <span aria-hidden="true" className="mr-1">✕</span>
              Limpiar fil
            </button>
          )}
        </div>
      </div>

      {/* Panel de tipos */}
      {showTypeFilter && (
        <fieldset
          id="dc-type-filter-panel"
          disabled={disabled}
          aria-labelledby="dc-type-filter-heading"
          className="mt-3 min-w-0 border-0 border-t border-line-soft p-0 pt-3"
        >
          <p
            id="dc-type-filter-heading"
            className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-500"
          >
            Elige un tipo:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={filters.type === null}
              onClick={() => onChange({ ...filters, type: null })}
              className={allChip(filters.type === null)}
            >
              Todos
            </button>
            {Object.keys(POKEMON_TYPES).map((key) => (
              <TypeBadge
                key={key}
                type={key}
                size="sm"
                interactive
                selected={filters.type === key}
                onClick={() =>
                  onChange({ ...filters, type: filters.type === key ? null : key })
                }
                className="min-h-[40px]"
              />
            ))}
          </div>
        </fieldset>
      )}

      {/* Panel de generaciones */}
      {showGenFilter && (
        <fieldset
          id="dc-gen-filter-panel"
          disabled={disabled}
          aria-labelledby="dc-gen-filter-heading"
          className="mt-3 min-w-0 border-0 border-t border-line-soft p-0 pt-3"
        >
          <p
            id="dc-gen-filter-heading"
            className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-500"
          >
            Elige una generación:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={filters.generation === null}
              onClick={() => onChange({ ...filters, generation: null })}
              className={allChip(filters.generation === null)}
            >
              Todos
            </button>
            {GENERATIONS.map((g) => (
              <button
                type="button"
                key={g.id}
                aria-pressed={filters.generation === g.id}
                onClick={() =>
                  onChange({
                    ...filters,
                    generation: filters.generation === g.id ? null : g.id,
                  })
                }
                className={generationChip(filters.generation === g.id)}
              >
                {g.name} · {g.region}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* Resumen de filtros activos */}
      {hasFilters && (
        <div
          role="group"
          aria-label="Filtros activos"
          className="mt-3 flex flex-wrap items-center gap-2 border-t border-line-soft pt-3"
        >
          <span className="self-center text-xs font-bold text-ink-500">
            Filtros activos ({activeFilterCount}):
          </span>
          {filters.type !== null && (
            <span className="inline-flex items-center gap-1">
              <TypeBadge type={filters.type} size="sm" />
              {removeChipButton(
                `Quitar el filtro de tipo ${getTypeBadge(filters.type).es}`,
                () => onChange({ ...filters, type: null }),
                false
              )}
            </span>
          )}
          {generation && (
            <span className={darkChip}>
              {generation.name} · {generation.region}
              {removeChipButton(
                `Quitar el filtro de generación ${generation.id}`,
                () => onChange({ ...filters, generation: null }),
                true
              )}
            </span>
          )}
          {filters.includeVariants && (
            <span className={darkChip}>
              Con variantes
              {removeChipButton(
                "Quitar el filtro de variantes",
                () => onChange({ ...filters, includeVariants: false }),
                true
              )}
            </span>
          )}
          {filters.limit !== INITIAL_FILTERS.limit && (
            <span className={darkChip}>
              Top {filters.limit}
              {removeChipButton(
                `Quitar el filtro de Top ${filters.limit}`,
                () => onChange({ ...filters, limit: INITIAL_FILTERS.limit }),
                true
              )}
            </span>
          )}
          <button
            type="button"
            onClick={clearFilters}
            disabled={disabled}
            className="ml-auto inline-flex min-h-[36px] items-center rounded-control border border-line bg-white px-3 py-1 text-[11px] font-bold text-ink-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 disabled:opacity-50"
          >
            Limpiar fil
          </button>
        </div>
      )}
    </section>
  );
}
