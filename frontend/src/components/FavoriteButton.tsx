import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFavorite, removeFavorite, isFavorite } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface Props {
  pokemonId: number;
  name: string;
}

export default function FavoriteButton({ pokemonId, name }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.username;

  const { data: fav, isLoading } = useQuery({
    queryKey: ["favorite", pokemonId, userId],
    queryFn: () => isFavorite(pokemonId),
    enabled: !!pokemonId && !!userId,
  });

  const toggle = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Debes iniciar sesión para guardar favoritos");
      if (fav) await removeFavorite(pokemonId);
      else await addFavorite(pokemonId, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite"] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  if (!userId) {
    return (
      <Link
        to="/login"
        className="px-4 py-2 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 border shadow-sm bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      >
        <span>🔐</span>
        <span>Inicia sesión para guardar</span>
      </Link>
    );
  }

  return (
    <button
      onClick={() => toggle.mutate()}
      disabled={isLoading || toggle.isPending}
      className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 border shadow-sm ${
        fav
          ? "bg-amber-400 text-amber-950 border-amber-500 hover:bg-amber-500"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      }`}
    >
      <span>{fav ? "⭐ Quitar de regalones" : "☆ ¡Guardar en mis regalones!"}</span>
    </button>
  );
}
