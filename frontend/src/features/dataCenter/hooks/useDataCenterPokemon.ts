import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDataCenterPokemon,
  refreshDataCenterPokemon,
} from "../../../services/api";
import type { PokemonDataCenterFilters } from "../lib/types";

export const DATA_CENTER_POKEMON_KEY = [
  "admin",
  "data-center",
  "pokemon",
] as const;

/**
 * El dataset se cachea en el backend 24 h, así que la query se considera
 * fresca durante una hora: navegar entre pestañas o filtros nunca descarga
 * de nuevo la colección completa. El botón de actualizar fuerza una sola
 * reconstrucción en el servidor y luego invalida estas queries.
 */
export function useDataCenterPokemon(filters: PokemonDataCenterFilters) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...DATA_CENTER_POKEMON_KEY, filters],
    queryFn: () => getDataCenterPokemon(filters),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });

  const refresh = useMutation({
    mutationFn: refreshDataCenterPokemon,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DATA_CENTER_POKEMON_KEY });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    refresh,
  };
}
