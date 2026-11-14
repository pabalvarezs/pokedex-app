import { useState, useCallback, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { listPokemon, listPokemonByType, listPokemonByGeneration, type Pokemon } from "../services/api";
import PokemonCard from "../components/PokemonCard";
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
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [typeMode, setTypeMode] = useState<"include" | "exclude">("include");
  const [genMode, setGenMode] = useState<"include" | "exclude">("include");

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

  // Al cambiar filtros volvemos a la primera página
  useEffect(() => {
    setPageSize(PAGE_SIZE);
  }, [activeTypes, activeGens, typeMode, genMode]);

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
  const hasFilters = typeFilterActive || genFilterActive || sortBy !== "id";
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

  const activeTypeInfo = activeTypes.length > 0 ? POKEMON_TYPES[activeTypes[0].toLowerCase()] : null;

  const typeFilterLabel =
    typeMode === "exclude"
      ? activeTypes.length === 0
        ? "todos"
        : `${activeTypes.length} excluido${activeTypes.length === 1 ? "" : "s"}`
      : activeTypes.length > 0
        ? `${activeTypes.length} seleccionado${activeTypes.length === 1 ? "" : "s"}`
        : "";

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

  const genFilterLabel =
    genMode === "exclude"
      ? activeGens.length === 0
        ? "todas"
        : `${activeGens.length} excluida${activeGens.length === 1 ? "" : "s"}`
      : activeGens.length > 0
        ? `${activeGens.length} seleccionada${activeGens.length === 1 ? "" : "s"}`
        : "";

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

  return (
    <div className="mx-auto w-full max-w-home py-6 sm:py-8">
      {/* Título */}
      <header className="mb-5 sm:mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-red-700">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
          Pokédex digital
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
        className="rounded-card border border-line bg-surface p-3 shadow-card sm:p-4"
      >
        <PokemonSearch />
      </section>

      {/* Panel de filtros */}
      <section
        aria-label="Filtros y ordenamiento"
        className="mt-4 rounded-card border border-line bg-surface p-3 shadow-card sm:p-4"
      >
        {/* Fila 1: Botones de sección + Sort */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-500 sm:inline">
              Filtrar
            </span>
            <button
              onClick={() => setShowTypeFilter(!showTypeFilter)}
              className={`rounded-control border px-3.5 py-2 text-xs font-bold transition ${
                showTypeFilter
                  ? "border-red-600 bg-red-600 text-white shadow-sm"
                  : activeTypes.length > 0 || typeMode === "exclude"
                    ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    : "border-line bg-slate-50 text-ink-700 hover:border-slate-300 hover:bg-slate-100"
              }`}
            >
              🎨 Tipo {typeFilterLabel}
            </button>

            <button
              onClick={() => setShowGenFilter(!showGenFilter)}
              className={`rounded-control border px-3.5 py-2 text-xs font-bold transition ${
                showGenFilter
                  ? "border-red-600 bg-red-600 text-white shadow-sm"
                  : activeGens.length > 0 || genMode === "exclude"
                    ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    : "border-line bg-slate-50 text-ink-700 hover:border-slate-300 hover:bg-slate-100"
              }`}
            >
              🌍 Generación {genFilterLabel}
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
              className="rounded-control border border-line bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 sm:text-sm"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {canClearFilters && (
              <button
                onClick={clearFilters}
                className="rounded-control border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
              >
                ✕ Limpiar todo
              </button>
            )}
          </div>
        </div>

        {/* Panel de tipos */}
        {showTypeFilter && (
          <div className="mt-3 border-t border-line-soft pt-3">
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-500">
              {typeMode === "exclude" ? "Quita un tipo para excluirlo:" : "Selecciona un tipo:"}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={toggleAllTypes}
                aria-pressed={allTypesSelected}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  allTypesSelected
                    ? "border-red-600 bg-red-600 text-white shadow-sm ring-2 ring-red-300 ring-offset-1"
                    : "border-line bg-white text-ink-700 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                Todos
              </button>
              {Object.entries(POKEMON_TYPES).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => toggleType(key)}
                  aria-pressed={isTypeSelected(key)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                    isTypeSelected(key)
                      ? `${info.bg} ${info.text} ${info.border} shadow-sm ring-2 ring-slate-400 ring-offset-1`
                      : "border-line bg-white text-ink-700 hover:border-slate-400 hover:bg-slate-50"
                  }`}
                >
                  {info.es}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Panel de generaciones */}
        {showGenFilter && (
          <div className="mt-3 border-t border-line-soft pt-3">
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-500">
              {genMode === "exclude" ? "Quita una generación para excluirla:" : "Selecciona una generación:"}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={toggleAllGens}
                aria-pressed={allGensSelected}
                className={`rounded-control border px-3 py-1.5 text-xs font-bold transition ${
                  allGensSelected
                    ? "border-red-600 bg-red-600 text-white shadow-sm ring-2 ring-red-300 ring-offset-1"
                    : "border-line bg-white text-ink-700 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                Todos
              </button>
              {GENERATIONS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => toggleGen(g.id)}
                  aria-pressed={isGenSelected(g.id)}
                  className={`rounded-control border px-3 py-1.5 text-xs font-bold transition ${
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
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line-soft pt-3">
            <span className="self-center text-xs font-bold text-ink-500">Filtros activos:</span>
            {(typeMode === "exclude" || allTypesSelected) && (
              <span className="flex items-center gap-1 rounded-full border border-transparent bg-red-600 px-3 py-1 text-[11px] font-bold text-white">
                Todos los tipos
                <button
                  onClick={() => {
                    setTypeMode("include");
                    setActiveTypes([]);
                  }}
                  className="ml-1 opacity-70 transition hover:opacity-100"
                >
                  ✕
                </button>
              </span>
            )}
            {typeMode === "include" && activeTypes.length > 0 && !allTypesSelected && activeTypeInfo && (
              <span className={`flex items-center gap-1 rounded-full border border-transparent px-3 py-1 text-[11px] font-bold ${activeTypeInfo.bg} ${activeTypeInfo.text}`}>
                {activeTypeInfo.es}
                <button onClick={() => setActiveTypes(activeTypes.filter(t => t !== activeTypes[0]))} className="ml-1 opacity-70 transition hover:opacity-100">✕</button>
              </span>
            )}
            {typeMode === "exclude" && activeTypes.map((key) => {
              const info = POKEMON_TYPES[key];
              if (!info) return null;
              return (
                <span key={key} className="flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1 text-[11px] font-bold text-ink-700">
                  Sin {info.es}
                  <button onClick={() => setActiveTypes(activeTypes.filter(t => t !== key))} className="ml-1 opacity-70 transition hover:opacity-100">✕</button>
                </span>
              );
            })}
            {(genMode === "exclude" || allGensSelected) && (
              <span className="flex items-center gap-1 rounded-full border border-transparent bg-red-600 px-3 py-1 text-[11px] font-bold text-white">
                Todas las generaciones
                <button
                  onClick={() => {
                    setGenMode("include");
                    setActiveGens([]);
                  }}
                  className="ml-1 opacity-70 transition hover:opacity-100"
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
                  <button onClick={() => setActiveGens(activeGens.filter((x) => x !== id))} className="ml-1 opacity-70 transition hover:opacity-100">✕</button>
                </span>
              );
            })}
            {genMode === "exclude" && activeGens.map((id) => {
              const g = GENERATIONS.find((item) => item.id === id);
              if (!g) return null;
              return (
                <span key={id} className="flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1 text-[11px] font-bold text-ink-700">
                  Sin {g.name} · {g.region}
                  <button onClick={() => setActiveGens(activeGens.filter((x) => x !== id))} className="ml-1 opacity-70 transition hover:opacity-100">✕</button>
                </span>
              );
            })}
          </div>
        )}
      </section>

      {/* Resultados */}
      {isLoading ? (
        <div className="py-16 text-center">
          <div className="mb-3 inline-block h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
          <p className="font-semibold text-ink-700">Cargando los Pokémon al tiro, espérate un cachito...</p>
        </div>
      ) : isError ? (
        <div className="my-6 rounded-card border border-line bg-surface px-6 py-16 text-center shadow-card">
          <span className="mb-4 block text-4xl" aria-hidden="true">🔌</span>
          <p className="mb-2 text-lg font-bold text-red-600">¡Pucha la cuestión! No pudimos cargar los Pokémon.</p>
          <p className="mb-4 text-sm text-ink-500">Revisa tu conexión o inténtalo de nuevo.</p>
          <button onClick={clearFilters} className="rounded-control bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2">
            Limpiar filtros
          </button>
        </div>
      ) : sortedPokemon.length > 0 ? (
        <>
          <div className="mb-3 mt-6 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-500 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
              {hasFilters
                ? `${sortedPokemon.length} Pokémon encontrados`
                : `Mostrando ${sortedPokemon.length} de ${totalPokemon} Pokémon`}
            </span>
          </div>
          <div className="pokemon-grid">
            {sortedPokemon.map((p) => (
              <PokemonCard key={p.id} pokemon={p} />
            ))}
          </div>

          {canLoadMore && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => setPageSize((size) => size + PAGE_SIZE)}
                disabled={generalFetching}
                className="rounded-control bg-red-600 px-8 py-3.5 text-sm font-bold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-ambient focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 active:translate-y-0 disabled:translate-y-0 disabled:opacity-60"
              >
                {generalFetching
                  ? "Cargando más Pokémon..."
                  : `Cargar más Pokémon (${totalPokemon - sortedPokemon.length} restantes)`}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="my-6 rounded-card border border-line bg-surface px-6 py-16 text-center shadow-card">
          <span className="mb-4 block text-4xl" aria-hidden="true">🔍</span>
          <p className="mb-2 text-lg font-bold text-ink-900">¡Chuta! No pillamos ningún Pokémon con esos filtros.</p>
          <p className="mb-4 text-sm text-ink-500">Prueba cambiando el tipo o la generación.</p>
          <button onClick={clearFilters} className="rounded-control bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2">
            Ver todos los Pokémon
          </button>
        </div>
      )}
    </div>
  );
}
