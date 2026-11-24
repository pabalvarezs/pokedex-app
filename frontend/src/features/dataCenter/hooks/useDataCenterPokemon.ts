import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDataCenterPokemon,
  getDataCenterStatus,
  refreshDataCenterPokemon,
} from "../../../services/api";
import type { PokemonDataCenterFilters } from "../lib/types";

export const DATA_CENTER_POKEMON_KEY = [
  "admin",
  "data-center",
  "pokemon",
] as const;

/**
 * El dataset se cachea en el backend (memoria + BD), así que la query se
 * considera fresca durante una hora: navegar entre filtros nunca descarga la
 * colección completa. El botón de actualizar dispara una reconstrucción en
 * segundo plano y hace polling de `/status` hasta que termina.
 */
export function useDataCenterPokemon(filters: PokemonDataCenterFilters) {
  const queryClient = useQueryClient();
  const [polling, setPolling] = useState(false);

  const query = useQuery({
    queryKey: [...DATA_CENTER_POKEMON_KEY, "data", filters],
    queryFn: () => getDataCenterPokemon(filters),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });

  const status = useQuery({
    queryKey: [...DATA_CENTER_POKEMON_KEY, "status"],
    queryFn: getDataCenterStatus,
    enabled: polling,
    refetchInterval: polling ? 2000 : false,
  });

  useEffect(() => {
    if (!polling || !status.data || status.data.refreshing) return;
    setPolling(false);
    void queryClient.invalidateQueries({
      queryKey: [...DATA_CENTER_POKEMON_KEY, "data"],
    });
  }, [polling, status.data, queryClient]);

  const refresh = useMutation({
    mutationFn: refreshDataCenterPokemon,
    onSuccess: () => setPolling(true),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    status: status.data,
    isPolling: polling,
    refresh,
  };
}
