import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listPokemonByType } from "../services/api";
import PokemonCard from "../components/PokemonCard";
import { getTypeBadge } from "../utils/pokemon";

export default function TypePage() {
  const { type } = useParams();
  const navigate = useNavigate();
  // Fallback por si useParams no devuelve type aún
  const safeType = (type ?? "fire").toLowerCase();
  const typeInfo = getTypeBadge(safeType);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["pokemon", "type", safeType],
    queryFn: () => listPokemonByType(safeType),
    enabled: !!safeType,
  });

  if (isLoading)
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-red-600 border-t-transparent mb-3 motion-reduce:animate-none"></div>
        <p className="text-gray-600 font-medium">Cargando Pokémon del tipo...</p>
      </div>
    );

  if (isError) {
    return (
      <div
        role="alert"
        className="glass-surface glass-blur mx-auto mt-6 max-w-md animate-fade-up rounded-2xl border p-8 py-16 text-center shadow-sm"
      >
        <h2 className="mb-2 text-xl font-bold text-gray-800">
          No pudimos cargar este tipo
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          Hubo un problema al pedir los Pokémon de tipo "{typeInfo.es}".
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-control bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
          >
            Reintentar
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-control bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
          >
            Volver a la portada
          </button>
        </div>
      </div>
    );
  }

  if (!data?.pokemon?.length) {
    return (
      <div className="glass-surface glass-blur mx-auto mt-6 max-w-md animate-fade-up rounded-2xl border p-8 py-16 text-center shadow-sm">
        <span className="mb-4 block text-5xl motion-safe:animate-pokemon-idle">🔍</span>
        <h2 className="mb-2 text-xl font-bold text-gray-800">Tipo no encontrado</h2>
        <p className="mb-4 text-sm text-gray-500">
          No pillamos ningún Pokémon del tipo "<strong>{typeInfo.es}</strong>".
        </p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-control bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
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