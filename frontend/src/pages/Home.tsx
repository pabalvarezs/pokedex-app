import { useQuery } from "@tanstack/react-query";
import { listPokemon } from "../services/api";
import PokemonCard from "../components/PokemonCard";
import SearchBar from "../components/SearchBar";
import TypeFilter from "../components/TypeFilter";
import GenerationFilter from "../components/GenerationFilter";

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ["pokemon", "list"],
    queryFn: () => listPokemon(20, 0),
  });
  if (isLoading) return <p className="text-center py-4">Cargando...</p>;
  return (
    <div className="max-w-6xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Pokédex</h1>
      <SearchBar />
      <TypeFilter />
      <GenerationFilter />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {data?.pokemon.map((p) => (
          <PokemonCard key={p.id} pokemon={p} />
        ))}
      </div>
    </div>
  );
}
