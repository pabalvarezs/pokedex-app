import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  listPokemon,
  listPokemonByType,
  listPokemonByGeneration,
  type Pokemon,
} from "../services/api";
import PokemonCard from "../components/PokemonCard";
import PokemonCardSkeleton from "../components/PokemonCardSkeleton";
import PokemonSearch from "../components/PokemonSearch";
import { POKEMON_TYPES, GENERATIONS } from "../utils/pokemon";

// --- Tipos de ordenamiento ---
const SORT_OPTIONS = [
  { value: "id", label: "Número (#)" },
  { value: "name", label: "Nombre (A-Z)" },
  { value: "name_desc", label: "Nombre (Z-A)" },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]["value"];

const PAGE_SIZE = 48;
const SKELETON_COUNT = 12;
// Guarda cuántos Pokémon hay cargados para recuperarlos al volver de una ficha.
const PAGE_SIZE_STORAGE_KEY = "pokedex:catalog-page-size";

function dedupeById(pokemon: Pokemon[]): Pokemon[] {
  const seen = new Set<number>();
  return pokemon.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

export default function Home() {
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const [activeGens, setActiveGens] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("id");
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showGenFilter, setShowGenFilter] = useState(false);
  const [pageSize, setPageSize] = useState(() => {
    // Recupera los Pokémon ya cargados al volver de una ficha.
    try {
      const stored = Number(sessionStorage.getItem(PAGE_SIZE_STORAGE_KEY));
      return Number.isFinite(stored) && stored >= PAGE_SIZE && stored % PAGE_SIZE === 0
        ? stored
        : PAGE_SIZE;
    } catch {
      return PAGE_SIZE;
    }
  });
  const [typeMode, setTypeMode] = useState<"include" | "exclude">("include");
  const [genMode, setGenMode] = useState<"include" | "exclude">("include");
  const loadMoreGuard = useRef(false);

  const clearFilters = useCallback(() => {
    setActiveTypes([]);
    setActiveGens([]);
    setSortBy("id");
    setShowTypeFilter(false);
    setShowGenFilter(false);
    setPageSize(PAGE_SIZE);
    setTypeMode("include");
    setGenMode("include");
  }, []);

  // Al cambiar filtros volvemos a la primera página. Comparamos la firma de
  // los filtros para no reiniciar la página al montar: así se conservan los
  // Pokémon cargados (y el scroll) al volver desde una ficha.
  const filterKey = `${typeMode}|${activeTypes.join(",")}|${genMode}|${activeGens.join(",")}`;
  const filterKeyRef = useRef(filterKey);
  useEffect(() => {
    if (filterKeyRef.current === filterKey) return;
    filterKeyRef.current = filterKey;
    setPageSize(PAGE_SIZE);
  }, [filterKey]);

  // Conserva cuántos Pokémon hay cargados mientras la pestaña siga abierta.
  useEffect(() => {
    try {
      sessionStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(pageSize));
    } catch {
      // Sin almacenamiento disponible: seguimos con el estado en memoria.
    }
  }, [pageSize]);

  const allTypeKeys = Object.keys(POKEMON_TYPES);
  const allGenIds = GENERATIONS.map((g) => g.id);
  // En modo "include" los filtros marcados se suman (unión). En modo "exclude"
  // (activado con "Todos") los desmarcados se restan del catálogo.
  const typeFilterActive =
    typeMode === "include"
      ? activeTypes.length > 0 && activeTypes.length < allTypeKeys.length
      : activeTypes.length > 0;
  const genFilterActive =
    genMode === "include" ? activeGens.length > 0 : true;
  const allTypesSelected =
    typeMode === "include" ? activeTypes.length === allTypeKeys.length : activeTypes.length === 0;
  const allGensSelected =
    genMode === "include" ? activeGens.length === allGenIds.length : activeGens.length === 0;
  const hasFiltering = typeFilterActive || genFilterActive;
  const hasFilters = hasFiltering || sortBy !== "id";
  // "Todos" activa el modo exclusión aunque no haya nada excluido todavía. No
  // restringe resultados, pero es un estado de filtro que debe verse y poder
  // limpiarse.
  const hasFilterModes = typeMode === "exclude" || genMode === "exclude";
  const canClearFilters = hasFilters || hasFilterModes;

  // Listado general (paginado): solo cuando no hay filtros activos
  const {
    data: generalData,
    isLoading: generalLoading,
    isError: generalError,
    isFetching: generalFetching,
    refetch: generalRefetch,
  } = useQuery({
    queryKey: ["pokemon", "list", { pageSize }],
    enabled: !typeFilterActive && !genFilterActive,
    // Conserva la lista al pulsar "Cargar más" para no perder el scroll
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const page = await listPokemon(pageSize, 0);
      return { pokemon: page.pokemon, total: page.total };
    },
  });

  // Unión de generaciones. Su clave no cambia al tocar solo el filtro de tipos,
  // así que excluir un tipo reutiliza estos datos en vez de recargarlos.
  const {
    data: genData,
    isLoading: genLoading,
    isError: genError,
    refetch: genRefetch,
  } = useQuery({
    queryKey: ["pokemon", "gens", { genMode, gens: activeGens }],
    enabled: genFilterActive,
    queryFn: async () => {
      const gensToFetch =
        genMode === "include"
          ? activeGens
          : allGenIds.filter((id) => !activeGens.includes(id));

      const genResults = await Promise.all(
        gensToFetch.map((gen) => listPokemonByGeneration(gen))
      );
      return dedupeById(genResults.flatMap((gr) => gr.pokemon));
    },
  });

  // Tipos: en exclusión con generaciones activas solo se piden los tipos
  // excluidos (se restan de la base de generaciones). Sin generaciones se pide
  // el catálogo completo por tipos y también se resta.
  const {
    data: typeData,
    isLoading: typeLoading,
    isError: typeError,
    refetch: typeRefetch,
  } = useQuery({
    queryKey: [
      "pokemon",
      "types",
      { typeMode, types: activeTypes, withGens: genFilterActive },
    ],
    enabled: typeFilterActive,
    queryFn: async (): Promise<{
      base: Pokemon[] | null;
      keepIds: Set<number> | null;
      dropIds: Set<number> | null;
    }> => {
      const typesToFetch =
        typeMode === "include"
          ? activeTypes
          : genFilterActive
            ? activeTypes
            : allTypeKeys;

      const typeResults = await Promise.all(
        typesToFetch.map((type) => listPokemonByType(type))
      );

      if (typeMode === "include") {
        const keepIds = new Set(
          typeResults.flatMap((tr) => tr.pokemon.map((p) => p.id))
        );
        return {
          keepIds,
          dropIds: null,
          base: genFilterActive
            ? null
            : dedupeById(typeResults.flatMap((tr) => tr.pokemon)),
        };
      }

      // Resta directa: la lista de un tipo ya trae todos sus Pokémon,
      // incluidos los de doble tipo como Bulbasaur (Planta/Veneno).
      const excluded = new Set(activeTypes);
      const dropIds = new Set(
        typeResults
          .filter((tr) => excluded.has(tr.type))
          .flatMap((tr) => tr.pokemon.map((p) => p.id))
      );
      return {
        keepIds: null,
        dropIds,
        base: genFilterActive
          ? null
          : dedupeById(typeResults.flatMap((tr) => tr.pokemon)),
      };
    },
  });

  // Combina ambas consultas según los filtros activos
  const filteredPokemon = (() => {
    if (!typeFilterActive && !genFilterActive) return null;

    if (genFilterActive) {
      // Mientras llega el filtro de tipos no mostramos la base de generaciones
      // sin filtrar: evitamos un parpadeo de resultados que no corresponden.
      if (typeFilterActive && !typeData) return [];
      const base = genData ?? [];
      if (!typeFilterActive || !typeData) return base;

      if (typeMode === "include" && typeData.keepIds) {
        return base.filter((p) => typeData.keepIds!.has(p.id));
      }
      if (typeData.dropIds) {
        return base.filter((p) => !typeData.dropIds!.has(p.id));
      }
      return base;
    }

    const base = typeData?.base ?? [];
    if (typeMode === "exclude" && typeData?.dropIds) {
      return base.filter((p) => !typeData.dropIds!.has(p.id));
    }
    return base;
  })();

  const pokemonList = filteredPokemon ?? generalData?.pokemon ?? [];

  const isLoading =
    !typeFilterActive && !genFilterActive
      ? generalLoading
      : (genFilterActive && genLoading) || (typeFilterActive && typeLoading);

  const isError =
    (!typeFilterActive && !genFilterActive && generalError) ||
    (genFilterActive && genError) ||
    (typeFilterActive && typeError);

  // Ordenar en cliente
  const sortedPokemon = (() => {
    const list = pokemonList;
    if (sortBy === "name") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "name_desc") return [...list].sort((a, b) => b.name.localeCompare(a.name));
    return [...list].sort((a, b) => a.id - b.id);
  })();

  const totalPokemon = filteredPokemon
    ? filteredPokemon.length
    : generalData?.total ?? sortedPokemon.length;
  const canLoadMore =
    !typeFilterActive &&
    !genFilterActive &&
    sortedPokemon.length < totalPokemon;

  const hasResults = sortedPokemon.length > 0;
  const isInitialLoading = isLoading && !hasResults;
  const blockingError = isError && !hasResults;
  // Si ya había tarjetas y falla "Cargar más", conservamos el catálogo visible
  // y mostramos el error junto al botón en vez de reemplazar toda la lista.
  const loadMoreError = !hasFiltering && generalError && hasResults;

  const sortLabel =
    SORT_OPTIONS.find((option) => option.value === sortBy)?.label ?? "";

  const activeFilterCount = (() => {
    let count = 0;
    if (typeMode === "exclude" || allTypesSelected) count += 1;
    else count += activeTypes.length;
    if (genMode === "exclude" || allGensSelected) count += 1;
    else count += activeGens.length;
    return count;
  })();

  const isTypeSelected = (key: string) =>
    typeMode === "include" ? activeTypes.includes(key) : !activeTypes.includes(key);

  const toggleAllTypes = () => {
    if (allTypesSelected) {
      setTypeMode("include");
      setActiveTypes([]);
    } else {
      setTypeMode("exclude");
      setActiveTypes([]);
    }
  };

  const toggleType = (key: string) => {
    // Si veníamos de tener los 18 tipos marcados uno a uno, al quitar uno
    // pasamos a modo exclusión para que se oculten todos los de ese tipo.
    if (typeMode === "include" && activeTypes.length === allTypeKeys.length) {
      setTypeMode("exclude");
      setActiveTypes([key]);
      return;
    }
    setActiveTypes(
      activeTypes.includes(key)
        ? activeTypes.filter((t) => t !== key)
        : [...activeTypes, key]
    );
  };

  const isGenSelected = (id: number) =>
    genMode === "include" ? activeGens.includes(id) : !activeGens.includes(id);

  const toggleAllGens = () => {
    if (allGensSelected) {
      setGenMode("include");
      setActiveGens([]);
    } else {
      setGenMode("exclude");
      setActiveGens([]);
    }
  };

  const toggleGen = (id: number) => {
    // Si veníamos de tener las 9 generaciones marcadas una a una, al quitar
    // una pasamos a modo exclusión para que se oculten todos sus Pokémon.
    if (genMode === "include" && activeGens.length === allGenIds.length) {
      setGenMode("exclude");
      setActiveGens([id]);
      return;
    }
    setActiveGens(
      activeGens.includes(id)
        ? activeGens.filter((g) => g !== id)
        : [...activeGens, id]
    );
  };

  // Evita dobles peticiones si se hace doble clic en "Cargar más".
  useEffect(() => {
    if (!generalFetching) loadMoreGuard.current = false;
  }, [generalFetching]);

  const handleLoadMore = useCallback(() => {
    if (loadMoreGuard.current || generalFetching) return;
    loadMoreGuard.current = true;
    setPageSize((size) => size + PAGE_SIZE);
  }, [generalFetching]);

  const retryCurrent = useCallback(() => {
    if (!typeFilterActive && !genFilterActive) {
      generalRefetch();
      return;
    }
    if (genFilterActive) genRefetch();
    if (typeFilterActive) typeRefetch();
  }, [
    typeFilterActive,
    genFilterActive,
    generalRefetch,
    genRefetch,
    typeRefetch,
  ]);

  const typeFilterLabel =
    typeMode === "exclude"
      ? activeTypes.length === 0
        ? "todos"
        : `${activeTypes.length} excluido${activeTypes.length === 1 ? "" : "s"}`
      : activeTypes.length > 0
        ? `${activeTypes.length} seleccionado${activeTypes.length === 1 ? "" : "s"}`
        : "";

  const genFilterLabel =
    genMode === "exclude"
      ? activeGens.length === 0
        ? "todas"
        : `${activeGens.length} excluida${activeGens.length === 1 ? "" : "s"}`
      : activeGens.length > 0
        ? `${activeGens.length} seleccionada${activeGens.length === 1 ? "" : "s"}`
        : "";

  const selectedTypeChips =
    typeMode === "include" && !allTypesSelected
      ? activeTypes
      : typeMode === "exclude"
        ? activeTypes
        : [];

  return (
    <div className="mx-auto w-full max-w-home py-6 sm:py-8">
      <a
        href="#catalogo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-red-600 focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white focus:shadow-ambient focus:outline-none focus:ring-2 focus:ring-white"
      >
        Saltar al catálogo
      </a>

      {/* Título */}
      <header className="mb-5 animate-fade-up sm:mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-red-700">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
          Pokédex a la chilena
        </span>
        <h1 className="mt-3 flex items-center gap-3 text-display font-extrabold text-ink-900">
          <span
            className="h-9 w-1.5 rounded-full bg-gradient-to-b from-red-600 to-amber-400"
            aria-hidden="true"
          />
          PokeChile
        </h1>
        <p className="mt-2 max-w-3xl text-body text-ink-500">
          La Pokédex chilena: pilla todos los Pokémon, revisa sus estadísticas y guárdalos en tus regalones 🇨🇱
        </p>
      </header>

      {/* Buscador predictivo */}
      <section
        aria-label="Buscador de Pokémon"
        className="glass-surface glass-blur relative z-20 animate-fade-up rounded-card border border-line bg-surface p-3 shadow-card sm:p-4"
      >
        <PokemonSearch />
      </section>

      {/* Panel de filtros */}
      <section
        aria-label="Filtros y ordenamiento"
        className="glass-surface glass-blur relative z-10 mt-4 animate-fade-up rounded-card border border-line bg-surface p-3 shadow-card sm:p-4"
      >
        {/* Fila 1: Botones de sección + Sort */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-500 sm:inline">
              Filtrar
            </span>
            <button
              type="button"
              onClick={() => setShowTypeFilter(!showTypeFilter)}
              aria-expanded={showTypeFilter}
              aria-controls="type-filter-panel"
              className={`inline-flex min-h-[44px] items-center rounded-control border px-3.5 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 ${
                showTypeFilter
                  ? "border-red-600 bg-red-600 text-white shadow-sm"
                  : activeTypes.length > 0 || typeMode === "exclude"
                    ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    : "border-line bg-slate-50 text-ink-700 hover:border-slate-300 hover:bg-slate-100"
              }`}
            >
              <span aria-hidden="true" className="mr-1.5">🎨</span>
              Tipo {typeFilterLabel}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={`ml-1.5 h-3.5 w-3.5 transition-transform ${showTypeFilter ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setShowGenFilter(!showGenFilter)}
              aria-expanded={showGenFilter}
              aria-controls="gen-filter-panel"
              className={`inline-flex min-h-[44px] items-center rounded-control border px-3.5 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 ${
                showGenFilter
                  ? "border-red-600 bg-red-600 text-white shadow-sm"
                  : activeGens.length > 0 || genMode === "exclude"
                    ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    : "border-line bg-slate-50 text-ink-700 hover:border-slate-300 hover:bg-slate-100"
              }`}
            >
              <span aria-hidden="true" className="mr-1.5">🌍</span>
              Generación {genFilterLabel}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={`ml-1.5 h-3.5 w-3.5 transition-transform ${showGenFilter ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>

          {/* Ordenamiento */}
          <div className="flex flex-wrap items-center gap-2 border-t border-line-soft pt-3 sm:ml-auto sm:border-0 sm:pt-0">
            <label
              htmlFor="sort-by"
              className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-500"
            >
              Ordenar
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="min-h-[44px] rounded-control border border-line bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 sm:text-sm"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {canClearFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex min-h-[44px] items-center rounded-control border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
              >
                <span aria-hidden="true" className="mr-1">✕</span>
                Limpiar fil
              </button>
            )}
          </div>
        </div>

        {/* Panel de tipos */}
        {showTypeFilter && (
          <div
            id="type-filter-panel"
            role="group"
            aria-labelledby="type-filter-heading"
            className="mt-3 border-t border-line-soft pt-3"
          >
            <p
              id="type-filter-heading"
              className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-500"
            >
              {typeMode === "exclude" ? "Saca un tipo pa' excluirlo:" : "Elige un tipo:"}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={toggleAllTypes}
                aria-pressed={allTypesSelected}
                className={`min-h-[40px] rounded-full border px-3 py-1.5 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 ${
                  allTypesSelected
                    ? "border-red-600 bg-red-600 text-white shadow-sm ring-2 ring-red-300 ring-offset-1"
                    : "border-line bg-white text-ink-700 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                Todos
              </button>
              {Object.entries(POKEMON_TYPES).map(([key, info]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => toggleType(key)}
                  aria-pressed={isTypeSelected(key)}
                  className={`min-h-[40px] rounded-full border px-3 py-1.5 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 ${
                    isTypeSelected(key)
                      ? `${info.bg} ${info.text} ${info.border} shadow-sm ring-2 ring-slate-400 ring-offset-1`
                      : "border-line bg-white text-ink-700 hover:border-slate-400 hover:bg-slate-50"
                  }`}
                >
                  {info.es}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] font-medium text-ink-500">
              Los tipos y generaciones se combinan entre sí. El orden se aplica al final, po.
            </p>
          </div>
        )}

        {/* Panel de generaciones */}
        {showGenFilter && (
          <div
            id="gen-filter-panel"
            role="group"
            aria-labelledby="gen-filter-heading"
            className="mt-3 border-t border-line-soft pt-3"
          >
            <p
              id="gen-filter-heading"
              className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-500"
            >
              {genMode === "exclude" ? "Saca una generación pa' excluirla:" : "Elige una generación:"}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={toggleAllGens}
                aria-pressed={allGensSelected}
                className={`min-h-[40px] rounded-control border px-3 py-1.5 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 ${
                  allGensSelected
                    ? "border-red-600 bg-red-600 text-white shadow-sm ring-2 ring-red-300 ring-offset-1"
                    : "border-line bg-white text-ink-700 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                Todos
              </button>
              {GENERATIONS.map((g) => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => toggleGen(g.id)}
                  aria-pressed={isGenSelected(g.id)}
                  className={`min-h-[40px] rounded-control border px-3 py-1.5 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 ${
                    isGenSelected(g.id)
                      ? "border-red-600 bg-red-600 text-white shadow-sm ring-2 ring-red-300 ring-offset-1"
                      : "border-line bg-white text-ink-700 hover:border-slate-400 hover:bg-slate-50"
                  }`}
                >
                  {g.name} · {g.region}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resumen de filtros activos */}
        {(activeTypes.length > 0 || activeGens.length > 0 || hasFilterModes) && (
          <div
            role="group"
            aria-label="Filtros activos"
            className="mt-3 flex flex-wrap items-center gap-2 border-t border-line-soft pt-3"
          >
            <span className="self-center text-xs font-bold text-ink-500">
              Filtros activos ({activeFilterCount}):
            </span>
            {(typeMode === "exclude" || allTypesSelected) && (
              <span className="flex items-center gap-1 rounded-full border border-transparent bg-red-600 px-3 py-1 text-[11px] font-bold text-white">
                Todos los tipos
                <button
                  type="button"
                  onClick={() => {
                    setTypeMode("include");
                    setActiveTypes([]);
                  }}
                  aria-label="Quitar el filtro de todos los tipos"
                  className="ml-1 flex h-6 w-6 items-center justify-center rounded-full opacity-70 transition hover:bg-white/20 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedTypeChips.map((key) => {
              const info = POKEMON_TYPES[key];
              if (!info) return null;
              const isExcluded = typeMode === "exclude";
              return (
                <span
                  key={key}
                  className={`flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold ${
                    isExcluded
                      ? "border-line bg-white text-ink-700"
                      : `${info.bg} ${info.text} border-transparent`
                  }`}
                >
                  {isExcluded ? `Sin ${info.es}` : info.es}
                  <button
                    type="button"
                    onClick={() =>
                      setActiveTypes(activeTypes.filter((t) => t !== key))
                    }
                    aria-label={
                      isExcluded
                        ? `Volver a incluir el tipo ${info.es}`
                        : `Quitar el filtro de tipo ${info.es}`
                    }
                    className="ml-1 flex h-6 w-6 items-center justify-center rounded-full opacity-70 transition hover:bg-black/10 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
                  >
                    ✕
                  </button>
                </span>
              );
            })}
            {(genMode === "exclude" || allGensSelected) && (
              <span className="flex items-center gap-1 rounded-full border border-transparent bg-red-600 px-3 py-1 text-[11px] font-bold text-white">
                Todas las generaciones
                <button
                  type="button"
                  onClick={() => {
                    setGenMode("include");
                    setActiveGens([]);
                  }}
                  aria-label="Quitar el filtro de todas las generaciones"
                  className="ml-1 flex h-6 w-6 items-center justify-center rounded-full opacity-70 transition hover:bg-white/20 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  ✕
                </button>
              </span>
            )}
            {genMode === "include" && activeGens.length > 0 && !allGensSelected && activeGens.map((id) => {
              const g = GENERATIONS.find((item) => item.id === id);
              if (!g) return null;
              return (
                <span key={id} className="flex items-center gap-1 rounded-full border border-transparent bg-red-600 px-3 py-1 text-[11px] font-bold text-white">
                  {g.name} · {g.region}
                  <button
                    type="button"
                    onClick={() => setActiveGens(activeGens.filter((x) => x !== id))}
                    aria-label={`Quitar el filtro de ${g.name} · ${g.region}`}
                    className="ml-1 flex h-6 w-6 items-center justify-center rounded-full opacity-70 transition hover:bg-white/20 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    ✕
                  </button>
                </span>
              );
            })}
            {genMode === "exclude" && activeGens.map((id) => {
              const g = GENERATIONS.find((item) => item.id === id);
              if (!g) return null;
              return (
                <span key={id} className="flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1 text-[11px] font-bold text-ink-700">
                  Sin {g.name} · {g.region}
                  <button
                    type="button"
                    onClick={() => setActiveGens(activeGens.filter((x) => x !== id))}
                    aria-label={`Volver a incluir ${g.name} · ${g.region}`}
                    className="ml-1 flex h-6 w-6 items-center justify-center rounded-full opacity-70 transition hover:bg-black/10 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
                  >
                    ✕
                  </button>
                </span>
              );
            })}
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto inline-flex min-h-[36px] items-center rounded-control border border-line bg-white px-3 py-1 text-[11px] font-bold text-ink-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
            >
              Limpiar filt
            </button>
          </div>
        )}
      </section>

      {/* Resultados */}
      <section
        id="catalogo"
        aria-label="Catálogo de Pokémon"
        tabIndex={-1}
        className="scroll-mt-24 outline-none"
      >
        {isInitialLoading ? (
          <div className="mt-6" aria-busy="true" aria-live="polite">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-500">
              <span
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent motion-reduce:animate-none"
                aria-hidden="true"
              />
              Cargando los Pokémon al tiro, espérate un cachito…
            </div>
            <div className="pokemon-grid" aria-hidden="true">
              {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <PokemonCardSkeleton key={index} />
              ))}
            </div>
          </div>
        ) : blockingError ? (
          <div
            role="alert"
            className="glass-surface glass-blur my-6 rounded-card border border-line bg-surface px-6 py-16 text-center shadow-card"
          >
            <span className="mb-4 block text-4xl" aria-hidden="true">🔌</span>
            <p className="mb-2 text-lg font-bold text-red-600">¡Pucha la cuestión! No pudimos cargar los Pokémon.</p>
            <p className="mb-4 text-sm text-ink-500">Revisa tu conexión o inténtalo de nuevo.</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={retryCurrent}
                className="inline-flex min-h-[44px] items-center rounded-control bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
              >
                Reintentar
              </button>
              {canClearFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex min-h-[44px] items-center rounded-control border border-line bg-white px-4 py-2 text-sm font-bold text-ink-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
                >
                  Limpiar filt
                </button>
              )}
            </div>
          </div>
        ) : hasResults ? (
          <>
            <div className="mb-3 mt-6 flex flex-wrap items-center justify-between gap-2">
              <span
                id="result-count"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-500 shadow-sm"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
                {hasFiltering
                  ? `${sortedPokemon.length} Pokémon pillados`
                  : `Viendo ${sortedPokemon.length} de ${totalPokemon} Pokémon`}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-ink-500">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                >
                  <path d="M3 6h18M6 12h12M10 18h4" />
                </svg>
                Orden: {sortLabel}
              </span>
            </div>

            <div className="pokemon-grid animate-fade-up">
              {sortedPokemon.map((p) => (
                <PokemonCard key={p.id} pokemon={p} />
              ))}
            </div>

            {loadMoreError ? (
              <div
                role="alert"
                className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-3 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-center"
              >
                <p className="text-sm font-bold text-red-700">
                  No se pudieron cargar más Pokémon. El catálogo sigue aquí, si se puede.
                </p>
                <button
                  type="button"
                  onClick={() => generalRefetch()}
                  className="inline-flex min-h-[40px] items-center rounded-control bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
                >
                  Reintentar carga
                </button>
              </div>
            ) : canLoadMore ? (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={generalFetching}
                  aria-busy={generalFetching}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-control bg-red-600 px-8 py-3.5 text-sm font-bold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-ambient focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 active:translate-y-0 disabled:translate-y-0 disabled:cursor-wait disabled:opacity-70"
                >
                  {generalFetching ? (
                    <>
                      <span
                        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent motion-reduce:animate-none"
                        aria-hidden="true"
                      />
                      Cargando más Pokémon…
                    </>
                  ) : (
                    <>
                      Cargar más Pokémon 👇
                      <span className="rounded-full bg-red-700/60 px-2 py-0.5 text-[11px] font-bold">
                        {totalPokemon - sortedPokemon.length} faltan
                      </span>
                    </>
                  )}
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <div
            role="status"
            className="glass-surface glass-blur my-6 rounded-card border border-line bg-surface px-6 py-16 text-center shadow-card"
          >
            <span className="mb-4 block text-4xl" aria-hidden="true">🔍</span>
            <p className="mb-2 text-lg font-bold text-ink-900">¡Chuta! No pillamos ningún Pokémon con esos filtros.</p>
            <p className="mb-4 text-sm text-ink-500">Prueba cambiando el tipo o la generación, a ver si aparece algo.</p>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex min-h-[44px] items-center rounded-control bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
            >
              Ver todos los Pokémon 👈
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
