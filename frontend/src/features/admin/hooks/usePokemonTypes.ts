import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDataCenterPokemonTypes } from "../../../services/api";

const TYPE_QUERY_OPTIONS = {
  staleTime: Infinity,
  gcTime: 1000 * 60 * 60 * 24,
  retry: 1,
} as const;

/**
 * Tipos de un Pokémon desde el backend (mismo snapshot del Centro de Datos,
 * con respaldo en la caché de PokéAPI). Se cachea para siempre en la sesión.
 */
export function usePokemonTypes(pokemonId: number) {
  const query = useQuery({
    queryKey: ["pokemon", "types", pokemonId],
    queryFn: async () => {
      const typesById = await getDataCenterPokemonTypes([pokemonId]);
      return typesById[String(pokemonId)] ?? [];
    },
    enabled: Number.isInteger(pokemonId) && pokemonId > 0,
    ...TYPE_QUERY_OPTIONS,
  });

  return {
    types: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

/**
 * Varios IDs en una sola petición. Antes se hacía una llamada al navegador a
 * PokéAPI por ID; ahora se reutiliza el endpoint por lote del backend.
 */
export function usePokemonTypesMap(pokemonIds: number[]) {
  const ids = useMemo(
    () =>
      Array.from(
        new Set(pokemonIds.filter((id) => Number.isInteger(id) && id > 0))
      ).sort((a, b) => a - b),
    [pokemonIds]
  );

  const query = useQuery({
    queryKey: ["pokemon", "types-map", ids.join(",")],
    queryFn: () => getDataCenterPokemonTypes(ids),
    enabled: ids.length > 0,
    ...TYPE_QUERY_OPTIONS,
  });

  // Se conserva Map<number, string[]> porque los consumidores indexan por ID numérico.
  const typesById = useMemo(
    () =>
      new Map<number, string[]>(
        Object.entries(query.data ?? {}).map(([id, types]) => [Number(id), types])
      ),
    [query.data]
  );

  return {
    typesById,
    isLoading: ids.length > 0 && query.isLoading,
  };
}
