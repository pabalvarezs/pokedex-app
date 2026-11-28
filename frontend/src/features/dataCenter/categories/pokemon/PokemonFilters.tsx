import { useState } from "react";
import TypeBadge from "../../../../components/TypeBadge";
import { GENERATIONS, getTypeBadge, POKEMON_TYPES } from "../../../../utils/pokemon";
import { cn } from "../../../admin/lib/cn";
import type { FilterMode, PokemonDataCenterFilters } from "../../lib/types";

const TOP_OPTIONS = [5, 10, 20, 50];
const ALL_TYPE_KEYS = Object.keys(POKEMON_TYPES);
const ALL_GEN_IDS = GENERATIONS.map((g) => g.id);

export const INITIAL_FILTERS: PokemonDataCenterFilters = {
  limit: 10,
  type: null,
  generation: null,
  includeVariants: false,
  types: [],
  generations: [],
  typeMode: "include",
  genMode: "include",
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

/**
 * Filtros del Centro de Datos con el mismo diseño y la misma semántica que la
 * portada: unión dentro de cada eje (tipos / generaciones) e intersección entre
 * ejes. "Todos" cambia el eje a exclusión con la lista vacía.
 */
export default function PokemonFilters({ filters, onChange, disabled }: Props) {
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showGenFilter, setShowGenFilter] = useState(false);

  const selectedTypes = filters.types ?? [];
  const selectedGens = filters.generations ?? [];
  const typeMode: FilterMode = filters.typeMode ?? "include";
  const genMode: FilterMode = filters.genMode ?? "include";

  const allTypesSelected =
    typeMode === "include"
      ? selectedTypes.length === ALL_TYPE_KEYS.length
      : selectedTypes.length === 0;
  const allGensSelected =
    genMode === "include"
      ? selectedGens.length === ALL_GEN_IDS.length
      : selectedGens.length === 0;
  const hasTypeSelection = selectedTypes.length > 0 || typeMode === "exclude";
  const hasGenSelection = selectedGens.length > 0 || genMode === "exclude";

  const typeFilterLabel =
    typeMode === "exclude"
      ? selectedTypes.length === 0
        ? "todos"
        : `${selectedTypes.length} excluido${selectedTypes.length === 1 ? "" : "s"}`
      : selectedTypes.length > 0
        ? `${selectedTypes.length} seleccionado${selectedTypes.length === 1 ? "" : "s"}`
        : "";
  const genFilterLabel =
    genMode === "exclude"
      ? selectedGens.length === 0
        ? "todas"
        : `${selectedGens.length} excluida${selectedGens.length === 1 ? "" : "s"}`
      : selectedGens.length > 0
        ? `${selectedGens.length} seleccionada${selectedGens.length === 1 ? "" : "s"}`
        : "";

  const activeFilterCount = (() => {
    let count = 0;
    if (typeMode === "exclude" || allTypesSelected) count += 1;
    else count += selectedTypes.length;
    if (genMode === "exclude" || allGensSelected) count += 1;
    else count += selectedGens.length;
    if (filters.includeVariants) count += 1;
    if (filters.limit !== INITIAL_FILTERS.limit) count += 1;
    return count;
  })();
  const canClearFilters =
    hasTypeSelection ||
    hasGenSelection ||
    filters.includeVariants ||
    filters.limit !== INITIAL_FILTERS.limit;

  const clearFilters = () => {
    setShowTypeFilter(false);
    setShowGenFilter(false);
    onChange(INITIAL_FILTERS);
  };

  const isTypeSelected = (key: string) =>
    typeMode === "include"
      ? selectedTypes.includes(key)
      : !selectedTypes.includes(key);
  const isGenSelected = (id: number) =>
    genMode === "include"
      ? selectedGens.includes(id)
      : !selectedGens.includes(id);

  const toggleAllTypes = () => {
    onChange({
      ...filters,
      typeMode: allTypesSelected ? "include" : "exclude",
      types: [],
    });
  };
  const toggleType = (key: string) => {
    // Si se tenían los 18 marcados uno a uno, quitar uno pasa a exclusión.
    if (typeMode === "include" && selectedTypes.length === ALL_TYPE_KEYS.length) {
      onChange({ ...filters, typeMode: "exclude", types: [key] });
      return;
    }
    onChange({
      ...filters,
      types: selectedTypes.includes(key)
        ? selectedTypes.filter((t) => t !== key)
        : [...selectedTypes, key],
    });
  };
  const toggleAllGens = () => {
    onChange({
      ...filters,
      genMode: allGensSelected ? "include" : "exclude",
      generations: [],
    });
  };
  const toggleGen = (id: number) => {
    if (genMode === "include" && selectedGens.length === ALL_GEN_IDS.length) {
      onChange({ ...filters, genMode: "exclude", generations: [id] });
      return;
    }
    onChange({
      ...filters,
      generations: selectedGens.includes(id)
        ? selectedGens.filter((g) => g !== id)
        : [...selectedGens, id],
    });
  };

  /**
   * Clases de los botones de sección y de los chips "Todos", copiadas de la
   * home: el panel abierto y el filtro activo se resaltan en rojo.
   */
  const sectionButton = (open: boolean, active: boolean) =>
    cn(
      "inline-flex min-h-[44px] items-center rounded-control border px-3.5 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 disabled:opacity-50",
      open
        ? "border-red-600 bg-red-600 text-white shadow-sm"
        : active
          ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
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

  const darkChip =
    "flex items-center gap-1 rounded-full border border-transparent bg-red-600 px-3 py-1 text-[11px] font-bold text-white";
  const lightChip =
    "flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1 text-[11px] font-bold text-ink-700";

  const selectedTypeChips =
    typeMode === "include" && !allTypesSelected
      ? selectedTypes
      : typeMode === "exclude"
        ? selectedTypes
        : [];

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
            className={sectionButton(showTypeFilter, hasTypeSelection)}
          >
            <span aria-hidden="true" className="mr-1.5">🎨</span>
            Tipo {typeFilterLabel}
            <Chevron open={showTypeFilter} />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowGenFilter(!showGenFilter)}
            aria-expanded={showGenFilter}
            aria-controls="dc-gen-filter-panel"
            className={sectionButton(showGenFilter, hasGenSelection)}
          >
            <span aria-hidden="true" className="mr-1.5">🌍</span>
            Generación {genFilterLabel}
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
            className={sectionButton(filters.includeVariants, false)}
          >
            Incluir variantes
          </button>

          {canClearFilters && (
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
            {typeMode === "exclude" ? "Saca un tipo pa' excluirlo:" : "Elige un tipo:"}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={toggleAllTypes}
              aria-pressed={allTypesSelected}
              className={allChip(allTypesSelected)}
            >
              Todos
            </button>
            {Object.keys(POKEMON_TYPES).map((key) => (
              <TypeBadge
                key={key}
                type={key}
                size="sm"
                interactive
                selected={isTypeSelected(key)}
                onClick={() => toggleType(key)}
                className="min-h-[40px]"
              />
            ))}
          </div>
          <p className="mt-2 text-[11px] font-medium text-ink-500">
            Los tipos y generaciones se combinan entre sí. El top se aplica al final, po.
          </p>
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
            {genMode === "exclude" ? "Saca una generación pa' excluirla:" : "Elige una generación:"}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={toggleAllGens}
              aria-pressed={allGensSelected}
              className={allChip(allGensSelected)}
            >
              Todos
            </button>
            {GENERATIONS.map((g) => (
              <button
                type="button"
                key={g.id}
                aria-pressed={isGenSelected(g.id)}
                onClick={() => toggleGen(g.id)}
                className={generationChip(isGenSelected(g.id))}
              >
                {g.name} · {g.region}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* Resumen de filtros activos */}
      {canClearFilters && (
        <div
          role="group"
          aria-label="Filtros activos"
          className="mt-3 flex flex-wrap items-center gap-2 border-t border-line-soft pt-3"
        >
          <span className="self-center text-xs font-bold text-ink-500">
            Filtros activos ({activeFilterCount}):
          </span>
          {(typeMode === "exclude" || allTypesSelected) && (
            <span className={darkChip}>
              Todos los tipos
              {removeChipButton(
                "Quitar el filtro de todos los tipos",
                () => onChange({ ...filters, typeMode: "include", types: [] }),
                true
              )}
            </span>
          )}
          {selectedTypeChips.map((key) => {
            const isExcluded = typeMode === "exclude";
            return (
              <span key={key} className="inline-flex items-center gap-1">
                <TypeBadge
                  type={key}
                  size="sm"
                  selected={!isExcluded}
                  prefix={isExcluded ? "Sin" : undefined}
                />
                {removeChipButton(
                  isExcluded
                    ? `Volver a incluir el tipo ${getTypeBadge(key).es}`
                    : `Quitar el filtro de tipo ${getTypeBadge(key).es}`,
                  () =>
                    onChange({
                      ...filters,
                      types: selectedTypes.filter((t) => t !== key),
                    }),
                  false
                )}
              </span>
            );
          })}
          {(genMode === "exclude" || allGensSelected) && (
            <span className={darkChip}>
              Todas las generaciones
              {removeChipButton(
                "Quitar el filtro de todas las generaciones",
                () => onChange({ ...filters, genMode: "include", generations: [] }),
                true
              )}
            </span>
          )}
          {genMode === "include" &&
            selectedGens.length > 0 &&
            !allGensSelected &&
            selectedGens.map((id) => {
              const g = GENERATIONS.find((item) => item.id === id);
              if (!g) return null;
              return (
                <span key={id} className={darkChip}>
                  {g.name} · {g.region}
                  {removeChipButton(
                    `Quitar el filtro de ${g.name} · ${g.region}`,
                    () =>
                      onChange({
                        ...filters,
                        generations: selectedGens.filter((x) => x !== id),
                      }),
                    true
                  )}
                </span>
              );
            })}
          {genMode === "exclude" &&
            selectedGens.map((id) => {
              const g = GENERATIONS.find((item) => item.id === id);
              if (!g) return null;
              return (
                <span key={id} className={lightChip}>
                  Sin {g.name} · {g.region}
                  {removeChipButton(
                    `Volver a incluir ${g.name} · ${g.region}`,
                    () =>
                      onChange({
                        ...filters,
                        generations: selectedGens.filter((x) => x !== id),
                      }),
                    false
                  )}
                </span>
              );
            })}
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
