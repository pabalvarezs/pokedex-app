import { useQuery } from "@tanstack/react-query";

interface PokeApiTypeSlot {
  type: { name: string };
}

interface PokeApiPokemon {
  types: PokeApiTypeSlot[];
}

async function fetchPokemonTypes(pokemonId: number): Promise<string[]> {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${pokemonId}`
  );
  if (!response.ok) {
    throw new Error(`No se pudieron cargar los tipos de #${pokemonId}`);
  }
  const data = (await response.json()) as PokeApiPokemon;
  return data.types.map((slot) => slot.type.name);
}

/**
 * Tipos de un Pokémon desde PokeAPI. Se cachea para siempre en la sesión
 * (los tipos no cambian) y se conserva 24 h si la pantalla se desmonta.
 */
export function usePokemonTypes(pokemonId: number) {
  const query = useQuery({
    queryKey: ["pokemon", "types", pokemonId],
    queryFn: () => fetchPokemonTypes(pokemonId),
    enabled: Number.isInteger(pokemonId) && pokemonId > 0,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });

  return {
    types: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
