import TypeBadge from "../../../../components/TypeBadge";
import { POKEMON_TYPES, GENERATIONS } from "../../../../utils/pokemon";
import { cn } from "../../../admin/lib/cn";
import type { PokemonDataCenterFilters } from "../../lib/types";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
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

/** Filtros combinables y siempre visibles: tipo + generación + variantes + top N. */
export default function PokemonFilters({ filters, onChange, disabled }: Props) {
  const hasFilters =
    filters.type !== null ||
    filters.generation !== null ||
    filters.includeVariants ||
    filters.limit !== INITIAL_FILTERS.limit;

  return (
    <section
      aria-label="Filtros de Pokémon"
      className="glass-surface mb-5 rounded-card border border-line p-4 shadow-soft"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-ink-700">
          Filtros
        </h2>
        {hasFilters && (
          <button
            type="button"
            onClick={() => onChange(INITIAL_FILTERS)}
            disabled={disabled}
            className="rounded-control px-2 py-1 text-[11px] font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-start">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-500">
            Tipo
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              aria-pressed={filters.type === null}
              disabled={disabled}
              onClick={() => onChange({ ...filters, type: null })}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50",
                filters.type === null
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-line bg-white text-ink-700 hover:border-red-300"
              )}
            >
              Todos
            </button>
            {Object.keys(POKEMON_TYPES).map((type) => (
              <TypeBadge
                key={type}
                type={type}
                size="xs"
                interactive
                selected={filters.type === type}
                onClick={() =>
                  onChange({ ...filters, type: filters.type === type ? null : type })
                }
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-500">
            Generación
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              aria-pressed={filters.generation === null}
              disabled={disabled}
              onClick={() => onChange({ ...filters, generation: null })}
              className={cn(
                "min-w-[38px] rounded-control border px-2 py-1.5 text-[11px] font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50",
                filters.generation === null
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-line bg-white text-ink-700 hover:border-red-300"
              )}
            >
              Todas
            </button>
            {GENERATIONS.map((generation, index) => (
              <button
                key={generation.id}
                type="button"
                aria-label={`Generación ${ROMAN[index]} (${generation.region})`}
                aria-pressed={filters.generation === generation.id}
                disabled={disabled}
                onClick={() =>
                  onChange({
                    ...filters,
                    generation:
                      filters.generation === generation.id
                        ? null
                        : generation.id,
                  })
                }
                className={cn(
                  "min-w-[38px] rounded-control border px-2 py-1.5 text-[11px] font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50",
                  filters.generation === generation.id
                    ? "border-red-600 bg-red-600 text-white"
                    : "border-line bg-white text-ink-700 hover:border-red-300"
                )}
              >
                {ROMAN[index]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <label
            className="flex items-center gap-2 text-xs font-bold text-ink-700"
            title="Incluye Mega, formas regionales y otras variedades"
          >
            <input
              type="checkbox"
              checked={filters.includeVariants}
              disabled={disabled}
              onChange={(event) =>
                onChange({ ...filters, includeVariants: event.target.checked })
              }
              className="h-4 w-4 accent-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            />
            Incluir variantes
          </label>

          <label className="flex items-center gap-2 text-xs font-bold text-ink-700">
            Top
            <select
              value={filters.limit}
              disabled={disabled}
              onChange={(event) =>
                onChange({ ...filters, limit: Number(event.target.value) })
              }
              className="rounded-control border border-line bg-white px-2 py-1.5 text-xs font-bold text-ink-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50"
            >
              {TOP_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}
