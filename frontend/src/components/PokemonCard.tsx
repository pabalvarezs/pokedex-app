import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pokemon } from "../services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isFavorite, addFavorite, removeFavorite } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getTypeBadge } from "../utils/pokemon";

interface Props {
  pokemon: Pokemon;
}

type ImageStage = "artwork" | "sprite" | "missing";

export default function PokemonCard({ pokemon }: Props) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.username;
  const { data: fav } = useQuery({
    queryKey: ["favorite", pokemon.id, userId],
    queryFn: () => isFavorite(pokemon.id),
    enabled: !!pokemon.id && !!userId,
  });

  const [imageStage, setImageStage] = useState<ImageStage>("artwork");

  // Cada tarjeta reutiliza su instancia al cambiar de Pokémon en la lista.
  useEffect(() => {
    setImageStage("artwork");
  }, [pokemon.id]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) return;
    if (fav) {
      await removeFavorite(pokemon.id);
    } else {
      await addFavorite(pokemon.id, pokemon.name);
    }
    queryClient.invalidateQueries({ queryKey: ["favorite"] });
    queryClient.invalidateQueries({ queryKey: ["favorites"] });
  };

  const typeBadges = (pokemon.types ?? []).map((t) => {
    const badge = getTypeBadge(t);
    return (
      <span
        key={t}
        className={`rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${badge.bg} ${badge.text} ${badge.border}`}
      >
        {badge.es}
      </span>
    );
  });

  // Prefer official artwork, then default sprite
  const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
  const fallbackSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

  const imageSrc =
    imageStage === "artwork"
      ? artworkUrl
      : imageStage === "sprite"
        ? fallbackSprite
        : null;

  const handleImageError = () => {
    setImageStage((stage) => (stage === "artwork" ? "sprite" : "missing"));
  };

  const formattedId = String(pokemon.id).padStart(3, "0");

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-ambient">
      <Link
        to={`/pokemon/${pokemon.id}`}
        aria-label={`Ver ficha de ${pokemon.name}`}
        className="flex flex-1 flex-col gap-3 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-400 sm:p-3.5"
      >
        <div className="artwork-frame relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[12px] border border-line-soft p-3">
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-extrabold tracking-[0.08em] text-ink-500 shadow-sm backdrop-blur-sm">
            #{formattedId}
          </span>

          {imageSrc ? (
            <img
              src={imageSrc}
              alt={pokemon.name}
              className="h-full w-full object-contain drop-shadow-sm transition-transform duration-200 ease-out group-hover:scale-[1.05]"
              loading="lazy"
              decoding="async"
              onError={handleImageError}
            />
          ) : (
            <div
              role="img"
              aria-label={`Ilustración no disponible de ${pokemon.name}`}
              className="flex flex-col items-center justify-center gap-2 text-slate-300"
            >
              <svg
                viewBox="0 0 64 64"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="h-12 w-12"
                aria-hidden="true"
              >
                <circle cx="32" cy="32" r="22" />
                <path d="M10 32h44" />
                <circle cx="32" cy="32" r="8" fill="white" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Sin imagen
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center gap-2">
          <h3 className="line-clamp-1 text-center text-[15px] font-extrabold capitalize text-ink-900 transition-colors group-hover:text-red-600">
            {pokemon.name}
          </h3>

          <div className="flex min-h-[22px] flex-wrap items-center justify-center gap-1.5">
            {typeBadges}
          </div>
        </div>
      </Link>

      <div className="px-3 pb-3 sm:px-3.5 sm:pb-3.5">
        {userId ? (
          <button
            onClick={toggle}
            aria-pressed={!!fav}
            title={fav ? "Quitar de mis regalones" : "Agregar a mis regalones"}
            className={`flex w-full items-center justify-center gap-1.5 rounded-control border px-3 py-2.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 ${
              fav
                ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                : "border-line bg-slate-50 text-ink-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            }`}
          >
            <span>{fav ? "⭐ Regalón" : "☆ Hacer regalón"}</span>
          </button>
        ) : (
          <Link
            to="/login"
            title="Inicia sesión para guardar favoritos"
            className="flex w-full items-center justify-center gap-1.5 rounded-control border border-line bg-slate-50 px-3 py-2.5 text-xs font-bold text-ink-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
          >
            <span>🔐 Inicia sesión</span>
          </Link>
        )}
      </div>
    </article>
  );
}
