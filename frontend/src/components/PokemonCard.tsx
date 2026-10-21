import { Pokemon } from "../services/api";
import { useQuery } from "@tanstack/react-query";
import { isFavorite, addFavorite, removeFavorite } from "../services/api";

interface Props { pokemon: Pokemon; }

export default function PokemonCard({ pokemon }: Props) {
  const { data: fav } = useQuery({
    queryKey: ["favorite", pokemon.id],
    queryFn: () => isFavorite(pokemon.id),
    enabled: !!pokemon.id,
  });
  const toggle = async () => {
    if (fav) await removeFavorite(pokemon.id);
    else await addFavorite(pokemon.id, pokemon.name);
  };
  const typeBadges = pokemon.types.map((t) => (
    <span key={t} className="px-2 py-1 rounded text-xs font-medium bg-gray-100">{t}</span>
  ));
  return (
    <div className="border rounded-lg p-4 flex flex-col gap-2">
      <h3 className="text-lg font-bold capitalize">{pokemon.name}</h3>
      <p className="text-sm text-gray-600">ID #{pokemon.id}</p>
      <div className="flex gap-2">{typeBadges}</div>
      <button
        onClick={toggle}
        className={`px-3 py-1 rounded text-sm ${fav ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}
      >
        {fav ? "Quitar favorito" : "Marcar favorito"}
      </button>
    </div>
  );
}
