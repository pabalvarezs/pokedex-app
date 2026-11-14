import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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

  // Fetch según filtros activos
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: [
      "pokemon",
      "filtered",
      { typeMode, types: activeTypes, genMode, gens: activeGens, pageSize },
    ],
    // Conserva la lista anterior solo al paginar ("Cargar más"). Al cambiar
    // filtros se muestra la carga para que el resultado anterior no quede
    // pegado y parezca que el filtro no hizo efecto.
    placeholderData: (previousData, previousQuery) => {
      const prev = previousQuery?.queryKey[2] as
        | { typeMode: "include" | "exclude"; types: string[]; genMode: "include" | "exclude"; gens: number[] }
        | undefined;
      if (
        prev &&
        prev.typeMode === typeMode &&
        prev.types === activeTypes &&
        prev.genMode === genMode &&
        prev.gens === activeGens
      ) {
        return previousData;
      }
      return undefined;
    },
    queryFn: async () => {
      // Sin filtros efectivos: paginación contra el listado general
      if (!typeFilterActive && !genFilterActive) {
        const page = await listPokemon(pageSize, 0);
        return { pokemon: page.pokemon, total: page.total };
      }

      let pokemon: Pokemon[] = [];

      if (typeFilterActive) {
        const typesToFetch =
          typeMode === "include"
            ? activeTypes
            : allTypeKeys.filter((t) => !activeTypes.includes(t));

        // Unión de todos los tipos incluidos (OR)
        const typeResults = await Promise.all(typesToFetch.map((t) => listPokemonByType(t)));
        pokemon = dedupeById(typeResults.flatMap((tr) => tr.pokemon));

        // En modo exclusión también se descartan los Pokémon de doble tipo que
        // tengan alguno de los tipos excluidos.
        if (typeMode === "exclude") {
          const excluded = new Set(activeTypes);
          pokemon = pokemon.filter((p) => !p.types?.some((t) => excluded.has(t)));
        }
      }

      if (genFilterActive) {
        const gensToFetch =
          genMode === "include"
            ? activeGens
            : allGenIds.filter((id) => !activeGens.includes(id));

        // Unión de todas las generaciones incluidas
        const genResults = await Promise.all(gensToFetch.map((gen) => listPokemonByGeneration(gen)));
        const genIds = new Set(genResults.flatMap((gr) => gr.pokemon.map((p) => p.id)));

        if (typeFilterActive) {
          // Intersección: tipo(s) AND generación(es)
          pokemon = pokemon.filter((p) => genIds.has(p.id));
        } else {
          pokemon = dedupeById(genResults.flatMap((gr) => gr.pokemon));
        }
      }

      return { pokemon, total: pokemon.length };
    },
  });

  // Ordenar en cliente
  const sortedPokemon = (() => {
    const list = data?.pokemon ?? [];
    if (sortBy === "name") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "name_desc") return [...list].sort((a, b) => b.name.localeCompare(a.name));
    return [...list].sort((a, b) => a.id - b.id);
  })();

  const totalPokemon = data?.total ?? sortedPokemon.length;
  const canLoadMore =
    !typeFilterActive &&
    !genFilterActive &&
    sortedPokemon.length < totalPokemon;

  const activeTypeInfo = activeTypes.length > 0 ? POKEMON_TYPES[activeTypes[0].toLowerCase()] : null;

  const selectedTypeCount =
    typeMode === "include" ? activeTypes.length : allTypeKeys.length - activeTypes.length;

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

  const selectedGenCount =
    genMode === "include" ? activeGens.length : allGenIds.length - activeGens.length;

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
    <div className="max-w-6xl mx-auto py-6">
      {/* Título */}
      <div className="mb-5">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
          PokeChile
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          La Pokédex chilena: pilla todos los Pokémon, revisa sus estadísticas y guárdalos en tus regalones 🇨🇱
        </p>
      </div>

      {/* Buscador predictivo */}
      <PokemonSearch />

      {/* Panel de filtros */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5 shadow-sm">
        {/* Fila 1: Botones de sección + Sort */}
        <div className="flex flex-wrap gap-2 items-center mb-3">
          <button
            onClick={() => setShowTypeFilter(!showTypeFilter)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              showTypeFilter
                ? "bg-red-600 text-white border-red-600"
                : activeTypes.length > 0
                  ? "bg-red-50 text-red-700 border-red-300"
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
            }`}
          >
            🎨 Tipo {selectedTypeCount > 0 ? `${selectedTypeCount} seleccionados` : ""}
          </button>

          <button
            onClick={() => setShowGenFilter(!showGenFilter)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              showGenFilter
                ? "bg-red-600 text-white border-red-600"
                : activeGens.length > 0
                  ? "bg-red-50 text-red-700 border-red-300"
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
            }`}
          >
            🌍 Generación {selectedGenCount > 0 ? `${selectedGenCount} seleccionadas` : ""}
          </button>

          {/* Ordenamiento */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs font-semibold border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition"
              >
                ✕ Limpiar todo
              </button>
            )}
          </div>
        </div>

        {/* Panel de tipos */}
        {showTypeFilter && (
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              {typeMode === "exclude" ? "Quita un tipo para excluirlo:" : "Selecciona un tipo:"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={toggleAllTypes}
                aria-pressed={allTypesSelected}
                className={`px-2.5 py-1 rounded-full text-[11px] font-black transition border ${
                  allTypesSelected
                    ? "bg-red-600 text-white border-red-600 shadow-sm ring-2 ring-offset-1 ring-red-300"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-500 hover:bg-gray-50"
                }`}
              >
                Todos
              </button>
              {Object.entries(POKEMON_TYPES).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => toggleType(key)}
                  aria-pressed={isTypeSelected(key)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-black transition border ${
                    isTypeSelected(key)
                      ? `${info.bg} ${info.text} ${info.border} shadow-sm ring-2 ring-offset-1 ring-gray-400`
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
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
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              {genMode === "exclude" ? "Quita una generación para excluirla:" : "Selecciona una generación:"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={toggleAllGens}
                aria-pressed={allGensSelected}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition border ${
                  allGensSelected
                    ? "bg-red-600 text-white border-red-600 shadow-sm ring-2 ring-offset-1 ring-red-300"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-500 hover:bg-gray-50"
                }`}
              >
                Todos
              </button>
              {GENERATIONS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => toggleGen(g.id)}
                  aria-pressed={isGenSelected(g.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition border ${
                    isGenSelected(g.id)
                      ? "bg-red-600 text-white border-red-600 shadow-sm ring-2 ring-offset-1 ring-red-300"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  {g.name} · {g.region}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resumen de filtros activos */}
        {(activeTypes.length > 0 || activeGens.length > 0 || allTypesSelected || allGensSelected) && (
          <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500 font-semibold self-center">Filtros activos:</span>
            {allTypesSelected && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-red-600 text-white flex items-center gap-1">
                Todos los tipos
                <button
                  onClick={() => {
                    setTypeMode("include");
                    setActiveTypes([]);
                  }}
                  className="ml-1 opacity-70 hover:opacity-100"
                >
                  ✕
                </button>
              </span>
            )}
            {typeMode === "include" && activeTypes.length > 0 && !allTypesSelected && activeTypeInfo && (
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${activeTypeInfo.bg} ${activeTypeInfo.text} flex items-center gap-1`}>
                {activeTypeInfo.es}
                <button onClick={() => setActiveTypes(activeTypes.filter(t => t !== activeTypes[0]))} className="ml-1 opacity-70 hover:opacity-100">✕</button>
              </span>
            )}
            {typeMode === "exclude" && activeTypes.map((key) => {
              const info = POKEMON_TYPES[key];
              if (!info) return null;
              return (
                <span key={key} className="px-2.5 py-1 rounded-full text-[11px] font-black bg-white text-gray-700 border border-gray-300 flex items-center gap-1">
                  Sin {info.es}
                  <button onClick={() => setActiveTypes(activeTypes.filter(t => t !== key))} className="ml-1 opacity-70 hover:opacity-100">✕</button>
                </span>
              );
            })}
            {allGensSelected && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-red-600 text-white flex items-center gap-1">
                Todas las generaciones
                <button
                  onClick={() => {
                    setGenMode("include");
                    setActiveGens([]);
                  }}
                  className="ml-1 opacity-70 hover:opacity-100"
                >
                  ✕
                </button>
              </span>
            )}
            {genMode === "include" && activeGens.length > 0 && !allGensSelected && activeGens.map((id) => {
              const g = GENERATIONS.find((item) => item.id === id);
              if (!g) return null;
              return (
                <span key={id} className="px-2.5 py-1 rounded-full text-[11px] font-black bg-red-600 text-white flex items-center gap-1">
                  {g.name} · {g.region}
                  <button onClick={() => setActiveGens(activeGens.filter((x) => x !== id))} className="ml-1 opacity-70 hover:opacity-100">✕</button>
                </span>
              );
            })}
            {genMode === "exclude" && activeGens.map((id) => {
              const g = GENERATIONS.find((item) => item.id === id);
              if (!g) return null;
              return (
                <span key={id} className="px-2.5 py-1 rounded-full text-[11px] font-black bg-white text-gray-700 border border-gray-300 flex items-center gap-1">
                  Sin {g.name} · {g.region}
                  <button onClick={() => setActiveGens(activeGens.filter((x) => x !== id))} className="ml-1 opacity-70 hover:opacity-100">✕</button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Resultados */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-red-600 border-t-transparent mb-3"></div>
          <p className="text-gray-600 font-medium">Cargando los Pokémon al tiro, espérate un cachito...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-white rounded-lg border my-6">
          <p className="text-red-600 font-bold text-lg mb-2">¡Pucha la cuestión! No pudimos cargar los Pokémon.</p>
          <p className="text-gray-500 text-sm mb-4">Revisa tu conexión o inténtalo de nuevo.</p>
          <button onClick={clearFilters} className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700">
            Limpiar filtros
          </button>
        </div>
      ) : sortedPokemon.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {hasFilters
                ? `${sortedPokemon.length} Pokémon encontrados`
                : `Mostrando ${sortedPokemon.length} de ${totalPokemon} Pokémon`}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedPokemon.map((p) => (
              <PokemonCard key={p.id} pokemon={p} />
            ))}
          </div>

          {canLoadMore && (
            <div className="text-center mt-8">
              <button
                onClick={() => setPageSize((size) => size + PAGE_SIZE)}
                disabled={isFetching}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl shadow-sm transition"
              >
                {isFetching
                  ? "Cargando más Pokémon..."
                  : `Cargar más Pokémon (${totalPokemon - sortedPokemon.length} restantes)`}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border my-6">
          <p className="text-gray-700 font-bold text-lg mb-2">¡Chuta! No pillamos ningún Pokémon con esos filtros.</p>
          <p className="text-gray-500 text-sm mb-4">Prueba cambiando el tipo o la generación.</p>
          <button onClick={clearFilters} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">
            Ver todos los Pokémon
          </button>
        </div>
      )}
    </div>
  );
}
