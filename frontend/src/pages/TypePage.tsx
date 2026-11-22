import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SearchX } from "lucide-react";
import { listPokemonByType } from "../services/api";
import PokemonCard from "../components/PokemonCard";
import PokemonCardSkeleton from "../components/PokemonCardSkeleton";
import { useMinimumLoading } from "../hooks/useMinimumLoading";
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

  const showingSkeleton = useMinimumLoading(isLoading);

  if (showingSkeleton)
    return (
      <div
        className="mx-auto w-full max-w-6xl animate-fade-up py-6"
        role="status"
        aria-busy="true"
        aria-label="Cargando Pokémon del tipo..."
      >
        <div className="mb-5">
          <div className="skeleton h-9 w-2/3 rounded-control" />
          <div className="skeleton mt-2 h-4 w-40 rounded-full" />
        </div>
        <div className="pokemon-grid">
          {Array.from({ length: 10 }).map((_, index) => (
            <PokemonCardSkeleton key={index} />
          ))}
        </div>
        <span className="sr-only">Cargando Pokémon del tipo…</span>
      </div>
    );

  if (isError) {
    return (
      <div
        role="alert"
        className="glass-surface glass-blur mx-auto mt-6 max-w-md animate-fade-up rounded-2xl border p-8 py-16 text-center shadow-sm"
      >
        <h2 className="mb-2 text-xl font-bold text-ink-900">
          No pudimos cargar este tipo
        </h2>
        <p className="mb-4 text-sm text-ink-500">
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
        <span
          aria-hidden="true"
          className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-500 motion-safe:animate-pokemon-idle"
        >
          <SearchX className="h-6 w-6" />
        </span>
        <h2 className="mb-2 text-xl font-bold text-ink-900">Tipo no encontrado</h2>
        <p className="mb-4 text-sm text-ink-500">
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
        <h1 className="text-display font-extrabold text-ink-900 tracking-tight">
          Pokémon de tipo {typeInfo.es}
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          Se encontraron {sortedPokemon.length} Pokémon
        </p>
      </div>

      <div className="pokemon-grid">
        {sortedPokemon.map((p) => (
          <PokemonCard key={p.id} pokemon={p} />
        ))}
      </div>
    </div>
  );
}