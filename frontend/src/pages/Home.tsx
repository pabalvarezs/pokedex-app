import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { listPokemon, listPokemonByType, listPokemonByGeneration } from "../services/api";
import PokemonCard from "../components/PokemonCard";
import { POKEMON_TYPES, GENERATIONS } from "../utils/pokemon";

// --- Tipos de ordenamiento ---
const SORT_OPTIONS = [
  { value: "id", label: "Número (#)" },
  { value: "name", label: "Nombre (A-Z)" },
  { value: "name_desc", label: "Nombre (Z-A)" },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export default function Home() {
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const [activeGens, setActiveGens] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("id");
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showGenFilter, setShowGenFilter] = useState(false);

  const clearFilters = useCallback(() => {
    setActiveTypes([]);
    setActiveGens([]);
    setSortBy("id");
    setShowTypeFilter(false);
    setShowGenFilter(false);
  }, []);

  const hasFilters = activeTypes.length > 0 || activeGens.length > 0 || sortBy !== "id";

  // Fetch según filtros activos
  const { data, isLoading, isError } = useQuery({
    queryKey: ["pokemon", "filtered", { types: activeTypes, gens: activeGens, sort: sortBy }],
    queryFn: async () => {
      let pokemon: Pokemon[] = [];
      const sort = sortBy === "name" || sortBy === "name_desc" || sortBy === "id";

      if (activeTypes.length > 0 && activeGens.length > 0) {
        // Múltiples tipos Y múltiples generaciones
        // Empezar con el primer tipo, luego intersectar con tipos y generaciones
        const typeData = await listPokemonByType(activeTypes[0]);
        pokemon = typeData.pokemon;
        // Intersectar con los tipos restantes
        for (let i = 1; i < activeTypes.length; i++) {
          const nextTypeData = await listPokemonByType(activeTypes[i]);
          const nextIds = new Set(nextTypeData.pokemon.map((p: any) => p.id));
          pokemon = pokemon.filter((p: any) => nextIds.has(p.id));
        }
        // Intersectar con las generaciones
        for (const genId of activeGens) {
          const genData = await listPokemonByGeneration(genId);
          const genIds = new Set(genData.pokemon.map((p: any) => p.id));
          pokemon = pokemon.filter((p: any) => genIds.has(p.id));
        }
      } else if (activeTypes.length > 0) {
        // Solo múltiples tipos - juntar y dedup
        const typePromises = activeTypes.map(t => listPokemonByType(t));
        const typeResults = await Promise.all(typePromises);
        pokemon = typeResults.flatMap((tr: any) => tr.pokemon);
        const seen = new Set();
        pokemon = pokemon.filter((p: any) => {
          const key = p.id;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      } else if (activeGens.length > 0) {
        // Solo múltiples generaciones
        let first = true;
        for (const genId of activeGens) {
          const genData = await listPokemonByGeneration(genId);
          if (first) {
            pokemon = genData.pokemon;
            first = false;
          } else {
            const genIds = new Set(genData.pokemon.map((p: any) => p.id));
            pokemon = pokemon.filter((p: any) => genIds.has(p.id));
          }
        }
      } else {
        const data = await listPokemon(250, 0);
        pokemon = data.pokemon;
      }

      // Aplicar ordenamiento en cliente
      if (sort) {
        if (sortBy === "name") {
          pokemon = [...pokemon].sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === "name_desc") {
          pokemon = [...pokemon].sort((a, b) => b.name.localeCompare(a.name));
        } else if (sortBy === "id") {
          pokemon = [...pokemon].sort((a, b) => a.id - b.id);
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

  const activeTypeInfo = activeTypes.length > 0 ? POKEMON_TYPES[activeTypes[0].toLowerCase()] : null;
  const activeGenInfo = activeGens.length > 0 ? GENERATIONS.find((g) => g.id === activeGens[0]) : null;

  return (
    <div className="max-w-6xl mx-auto py-6">
      {/* Título */}
      <div className="mb-5">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
          Pokédex Pablito
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          ¡Edición Chilensis! Pilla todos los Pokémon, revisa sus estadísticas y guárdalos en tus regalones 🇨🇱
        </p>
      </div>

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
            🎨 Tipo {activeTypes.length > 0 ? `${activeTypes.length} seleccionados` : ""}
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
            🌍 Generación {activeGens.length > 0 ? `${activeGens.length} seleccionadas` : ""}
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
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Selecciona un tipo:</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(POKEMON_TYPES).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => {
                    if (activeTypes.includes(key)) {
                      setActiveTypes(activeTypes.filter(t => t !== key));
                    } else {
                      setActiveTypes([...activeTypes, key]);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-black transition border ${
                    activeTypes.includes(key)
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
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Selecciona una generación:</p>
            <div className="flex flex-wrap gap-1.5">
              {GENERATIONS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    if (activeGens.includes(g.id)) {
                      setActiveGens(activeGens.filter(id => id !== g.id));
                    } else {
                      setActiveGens([...activeGens, g.id]);
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition border ${
                    activeGens.includes(g.id)
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
        {(activeTypes.length > 0 || activeGens.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500 font-semibold self-center">Filtros activos:</span>
            {activeTypes.length > 0 && activeTypeInfo && (
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${activeTypeInfo.bg} ${activeTypeInfo.text} flex items-center gap-1`}>
                {activeTypeInfo.es}
                <button onClick={() => setActiveTypes(activeTypes.filter(t => t !== activeTypes[0]))} className="ml-1 opacity-70 hover:opacity-100">✕</button>
              </span>
            )}
            {activeGens.length > 0 && activeGenInfo && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-red-600 text-white flex items-center gap-1">
                {activeGenInfo.name} · {activeGenInfo.region}
                <button onClick={() => setActiveGens(activeGens.filter(id => id !== activeGens[0]))} className="ml-1 opacity-70 hover:opacity-100">✕</button>
              </span>
            )}
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
              {sortedPokemon.length} Pokémon encontrados
              {(activeTypes.length > 0 || activeGens.length > 0) ? " (con filtros activos)" : ""}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedPokemon.map((p) => (
              <PokemonCard key={p.id} pokemon={p} />
            ))}
          </div>
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
