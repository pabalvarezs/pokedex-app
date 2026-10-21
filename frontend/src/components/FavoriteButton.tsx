import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFavorite, removeFavorite, isFavorite } from "../services/api";

interface Props {
  pokemonId: number;
  name: string;
}

export default function FavoriteButton({ pokemonId, name }: Props) {
  const queryClient = useQueryClient();
  const { data: fav, isLoading } = useQuery({
    queryKey: ["favorite", pokemonId],
    queryFn: () => isFavorite(pokemonId),
    enabled: !!pokemonId,
  });

  const toggle = useMutation({
    mutationFn: async () => {
      if (fav) await removeFavorite(pokemonId);
      else await addFavorite(pokemonId, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite", pokemonId] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
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
