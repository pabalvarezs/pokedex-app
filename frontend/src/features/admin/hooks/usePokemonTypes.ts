import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";

interface PokeApiTypeSlot {
  type: { name: string };
}

interface PokeApiPokemon {
  types: PokeApiTypeSlot[];
}

export async function fetchPokemonTypes(pokemonId: number): Promise<string[]> {
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

const TYPE_QUERY_OPTIONS = {
  staleTime: Infinity,
  gcTime: 1000 * 60 * 60 * 24,
  retry: 1,
} as const;

/**
 * Varios IDs a la vez reutilizando exactamente la misma query key que
 * `usePokemonTypes`, así las filas/tarjetas y la dona comparten caché.
 */
export function usePokemonTypesMap(pokemonIds: number[]) {
  const ids = useMemo(
    () =>
      Array.from(
        new Set(pokemonIds.filter((id) => Number.isInteger(id) && id > 0))
      ).sort((a, b) => a - b),
    [pokemonIds]
  );

  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["pokemon", "types", id],
      queryFn: () => fetchPokemonTypes(id),
      ...TYPE_QUERY_OPTIONS,
    })),
  });

  const typesById = useMemo(() => {
    const map = new Map<number, string[]>();
    results.forEach((result, index) => {
      if (result.data) map.set(ids[index], result.data);
    });
    return map;
  }, [results, ids]);

  return {
    typesById,
    isLoading: ids.length > 0 && results.some((result) => result.isLoading),
  };
}
