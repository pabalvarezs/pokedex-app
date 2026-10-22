import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { listFavorites } from "../services/api";
import { useAuth } from "../context/AuthContext";
import FavoriteButton from "../components/FavoriteButton";

export default function Favorites() {
  const { user } = useAuth();
  // Sin user autenticado, no mostrar favoritos (quedará vacío/sin datos)
  const userId = user?.username;
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites", userId],
    queryFn: () => listFavorites(userId),
  });

  if (isLoading)
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent mb-3"></div>
        <p className="text-gray-600 font-medium">Buscando a tus regalones en la base de datos...</p>
      </div>
    );

  if (favorites.length === 0)
    return (
      <div className="max-w-md mx-auto py-16 text-center bg-white rounded-2xl border p-8 shadow-sm mt-6">
        <span className="text-5xl mb-4 block">⭐</span>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          ¡Chuta, compadre! Aún no tienes regalones guardados
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Navega por la Pokédex y presiona &quot;⭐ Hacer regalón&quot; en cualquier Pokémon para guardarlo aquí.
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-sm transition"
        >
          Ir a pillar Pokémon al tiro 👈
        </Link>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">
            Mis Regalones ⭐ ({favorites.length})
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Tus Pokémon favoritos guardados en la base de datos local
          </p>
        </div>
        <Link
          to="/"
          className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
        >
          + Agregar más Pokémon
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {favorites.map((f) => {
          const formattedId = String(f.pokemonId).padStart(3, "0");
          const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${f.pokemonId}.png`;
          const fallbackSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${f.pokemonId}.png`;

          return (
            <div
              key={f.id}
              className="bg-white border border-gray-200 rounded-xl p-3.5 flex justify-between items-center shadow-sm hover:shadow-md transition"
            >
              <Link to={`/pokemon/${f.pokemonId}`} className="flex items-center gap-3.5 group">
                <div className="w-14 h-14 bg-gray-50 rounded-lg p-1 flex items-center justify-center border border-gray-100">
                  <img
                    src={artworkUrl}
                    alt={f.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== fallbackSprite) {
                        target.src = fallbackSprite;
                      }
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-base capitalize text-gray-800 group-hover:text-red-600 transition">
                    {f.name}
                  </h3>
                  <p className="text-xs font-semibold text-gray-400">#{formattedId}</p>
                </div>
              </Link>
              <div className="flex items-center gap-2">
                <Link
                  to={`/pokemon/${f.pokemonId}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition hidden sm:inline-block"
                >
                  Ver ficha completa →
                </Link>
                <FavoriteButton pokemonId={f.pokemonId} name={f.name} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
