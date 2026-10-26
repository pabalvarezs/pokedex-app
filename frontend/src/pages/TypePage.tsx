import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listPokemonByType } from "../services/api";
import PokemonCard from "../components/PokemonCard";
import { getTypeBadge } from "../utils/pokemon";

export default function TypePage() {
  const { type } = useParams();
  // Fallback por si useParams no devuelve type aún
  const safeType = (type ?? "fire").toLowerCase();
  const typeInfo = getTypeBadge(safeType);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["pokemon", "type", safeType],
    queryFn: () => listPokemonByType(safeType),
    enabled: !!safeType,
  });

  if (isLoading)
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-red-600 border-t-transparent mb-3"></div>
        <p className="text-gray-600 font-medium">Cargando Pokémon del tipo...</p>
      </div>
    );

  if (isError || !data?.pokemon?.length) {
    return (
      <div className="max-w-md mx-auto py-16 text-center bg-white rounded-2xl border p-8 shadow-sm mt-6">
        <span className="text-5xl mb-4 block">🔍</span>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Tipo no encontrado
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          No pillamos ningún Pokémon del tipo "<strong>{typeInfo.es}</strong>".
        </p>
        <button
          onClick={() => window.history.back()}
          className="inline-block px-4 py-2 bg-red-600 text-white rounded text-sm font-bold hover:bg-red-700 transition shadow-sm"
        >
          ← Volver a la portada
        </button>
      </div>
    );
  }

  const sortedPokemon = [...data.pokemon].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="mb-5">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
          Pokémon de tipo {typeInfo.es}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Se encontraron {sortedPokemon.length} Pokémon
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sortedPokemon.map((p) => (
          <PokemonCard key={p.id} pokemon={p} />
        ))}
      </div>
    </div>
  );
}