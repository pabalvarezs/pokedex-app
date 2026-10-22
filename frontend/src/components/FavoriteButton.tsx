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
  // Solo permitir favoritos cuando hay usuario autentificado con username real
  // Si no hay user (sin sesión), userId será undefined y el query quedará disabled
  const userId = user?.username; // No hay default "pablito" - si no hay usuario, no hay favoritos
  const { data: fav, isLoading } = useQuery({
    queryKey: ["favorite", pokemonId, userId],
    queryFn: () => isFavorite(pokemonId),
    enabled: !!pokemonId && !!userId, // Solo habilitado cuando hay user real
  });

  const toggle = useMutation({
    mutationFn: async () => {
      if (fav) await removeFavorite(pokemonId, userId);
      else await addFavorite(pokemonId, name, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite", pokemonId, userId] });
      queryClient.invalidateQueries({ queryKey: ["favorites", userId] });
    },
  });

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
