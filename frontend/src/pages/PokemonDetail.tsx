import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPokemon } from "../services/api";
import FavoriteButton from "../components/FavoriteButton";

export default function PokemonDetail() {
  const { id } = useParams();
  const pokemonId = id ? Number(id) : 0;
  const { data, isLoading } = useQuery({
    queryKey: ["pokemon", "detail", pokemonId],
    queryFn: () => getPokemon(pokemonId),
    enabled: !!id,
  });
  if (isLoading) return <p className="text-center py-4">Cargando...</p>;
  if (!data) return <p className="text-center py-4">No encontrado</p>;
  return (
    <div className="max-w-2xl mx-auto py-6 text-center">
      <h1 className="text-3xl font-bold capitalize">{data.name}</h1>
      <p className="text-gray-600">ID #{data.id}</p>
      <div className="flex justify-center gap-2 mt-4">
        {data.types.map((t) => (
          <span key={t} className="px-3 py-1 rounded bg-gray-100">{t}</span>
        ))}
      </div>
      <FavoriteButton pokemonId={data.id} name={data.name} />
    </div>
  );
}
