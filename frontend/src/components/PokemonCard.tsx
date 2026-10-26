import { Link } from "react-router-dom";
import { Pokemon } from "../services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isFavorite, addFavorite, removeFavorite } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getTypeBadge } from "../utils/pokemon";

interface Props {
  pokemon: Pokemon;
}

export default function PokemonCard({ pokemon }: Props) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.username;
  const { data: fav } = useQuery({
    queryKey: ["favorite", pokemon.id, userId],
    queryFn: () => isFavorite(pokemon.id),
    enabled: !!pokemon.id && !!userId,
  });

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
        className={`px-2 py-0.5 rounded text-[11px] font-bold ${badge.bg} ${badge.text}`}
      >
        {badge.es}
      </span>
    );
  });

  // Prefer official artwork, then default sprite
  const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
  const fallbackSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

  const formattedId = String(pokemon.id).padStart(3, "0");

  return (
    <div className="group bg-white border border-gray-200 hover:border-red-400 rounded-xl p-3 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-200 relative">
      <span className="text-[11px] font-bold text-gray-400 self-start">
        #{formattedId}
      </span>

      <Link
        to={`/pokemon/${pokemon.id}`}
        className="flex flex-col items-center my-1"
      >
        <div className="w-24 h-24 flex items-center justify-center p-1">
          <img
            src={artworkUrl}
            alt={pokemon.name}
            className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-200"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== fallbackSprite) {
                target.src = fallbackSprite;
              }
            }}
          />
        </div>
        <h3 className="text-sm font-bold capitalize text-gray-800 group-hover:text-red-600 transition-colors mt-2 text-center line-clamp-1">
          {pokemon.name}
        </h3>
      </Link>

      {typeBadges.length > 0 && (
        <div className="flex gap-1 justify-center my-1.5 flex-wrap">
          {typeBadges}
        </div>
      )}

      {userId ? (
        <button
          onClick={toggle}
          title={fav ? "Quitar de mis regalones" : "Agregar a mis regalones"}
          className={`w-full mt-2 py-1.5 px-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 border ${
            fav
              ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
          }`}
        >
          <span>{fav ? "⭐ Regalón" : "☆ Hacer regalón"}</span>
        </button>
      ) : (
        <Link
          to="/login"
          title="Inicia sesión para guardar favoritos"
          className="w-full mt-2 py-1.5 px-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 border bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
        >
          <span>🔐 Inicia sesión</span>
        </Link>
      )}
    </div>
  );
}
