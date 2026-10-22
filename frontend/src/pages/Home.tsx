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
  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeGen, setActiveGen] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("id");
  const [showTypeFilter, setShowTypeFilter] = useState(true);
  const [showGenFilter, setShowGenFilter] = useState(false);

  const clearFilters = useCallback(() => {
    setActiveType(null);
    setActiveGen(null);
    setSortBy("id");
  }, []);

  const hasFilters = !!(activeType || activeGen || sortBy !== "id");

  // Fetch según filtros activos
  const { data, isLoading, isError } = useQuery({
    queryKey: ["pokemon", "filtered", { type: activeType, gen: activeGen }],
    queryFn: async () => {
      if (activeType && activeGen) {
        // Combinar: filtra por tipo, luego intersecta con gen
        const [typeData, genData] = await Promise.all([
          listPokemonByType(activeType),
          listPokemonByGeneration(activeGen),
        ]);
        const genIds = new Set(genData.pokemon.map((p) => p.id));
        const combined = typeData.pokemon.filter((p) => genIds.has(p.id));
        return { pokemon: combined, total: combined.length };
      }
      if (activeType) return listPokemonByType(activeType);
      if (activeGen) return listPokemonByGeneration(activeGen);
      return listPokemon(250, 0);
    },
  });

  // Ordenar en cliente
  const sortedPokemon = (() => {
    const list = data?.pokemon ?? [];
    if (sortBy === "name") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "name_desc") return [...list].sort((a, b) => b.name.localeCompare(a.name));
    return [...list].sort((a, b) => a.id - b.id);
  })();

  const activeTypeInfo = activeType ? POKEMON_TYPES[activeType.toLowerCase()] : null;
  const activeGenInfo = activeGen ? GENERATIONS.find((g) => g.id === activeGen) : null;

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
            onClick={() => { setShowTypeFilter(!showTypeFilter); setShowGenFilter(false); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              showTypeFilter
                ? "bg-red-600 text-white border-red-600"
                : activeType
                ? "bg-red-50 text-red-700 border-red-300"
                : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
            }`}
          >
            🎨 Tipo {activeType ? `· ${activeTypeInfo?.es}` : ""}
          </button>

          <button
            onClick={() => { setShowGenFilter(!showGenFilter); setShowTypeFilter(false); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              showGenFilter
                ? "bg-red-600 text-white border-red-600"
                : activeGen
                ? "bg-red-50 text-red-700 border-red-300"
                : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
            }`}
          >
            🌍 Generación {activeGen ? `· ${activeGenInfo?.name}` : ""}
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
                  onClick={() => setActiveType(activeType === key ? null : key)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-black transition border ${
                    activeType === key
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
                  onClick={() => setActiveGen(activeGen === g.id ? null : g.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition border ${
                    activeGen === g.id
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
        {(activeType || activeGen) && (
          <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500 font-semibold self-center">Filtros activos:</span>
            {activeType && activeTypeInfo && (
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${activeTypeInfo.bg} ${activeTypeInfo.text} flex items-center gap-1`}>
                {activeTypeInfo.es}
                <button onClick={() => setActiveType(null)} className="ml-1 opacity-70 hover:opacity-100">✕</button>
              </span>
            )}
            {activeGen && activeGenInfo && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-red-600 text-white flex items-center gap-1">
                {activeGenInfo.name} · {activeGenInfo.region}
                <button onClick={() => setActiveGen(null)} className="ml-1 opacity-70 hover:opacity-100">✕</button>
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
              {activeType && activeGen ? " (con ambos filtros)" : ""}
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
