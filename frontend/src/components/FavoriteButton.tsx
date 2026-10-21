import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFavorite, removeFavorite, isFavorite } from "../services/api";

interface Props { pokemonId: number; name: string; }

export default function FavoriteButton({ pokemonId, name }: Props) {
  const queryClient = useQueryClient();
  const { data: fav } = useQuery({
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
    <button onClick={() => toggle.mutate()} className="px-3 py-1 rounded text-sm border">
      {fav ? "★ Favorito" : "☆ Favorito"}
    </button>
  );
}
