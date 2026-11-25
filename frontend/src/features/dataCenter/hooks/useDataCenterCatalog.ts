import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDataCenterCatalog,
  getDataCenterCatalogItem,
  getDataCenterCatalogStatus,
  refreshDataCenterCatalog,
} from "../../../services/api";
import type { CatalogCategory, CatalogQuery } from "../lib/types";

export const DATA_CENTER_CATALOG_KEY = [
  "admin",
  "data-center",
  "catalog",
] as const;

/**
 * Mismo patrón que `useDataCenterPokemon`: el índice se cachea en el backend,
 * así que cambiar filtros no descarga el catálogo completo. El refresh
 * reconstruye en segundo plano y hace polling de `/status` hasta terminar.
 */
export function useDataCenterCatalog(
  category: CatalogCategory,
  query: CatalogQuery
) {
  const queryClient = useQueryClient();
  const [polling, setPolling] = useState(false);

  const dataQuery = useQuery({
    queryKey: [...DATA_CENTER_CATALOG_KEY, category, "data", query],
    queryFn: () => getDataCenterCatalog(category, query),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });

  const status = useQuery({
    queryKey: [...DATA_CENTER_CATALOG_KEY, category, "status"],
    queryFn: () => getDataCenterCatalogStatus(category),
    enabled: polling,
    refetchInterval: polling ? 2000 : false,
  });

  useEffect(() => {
    if (!polling || !status.data || status.data.refreshing) return;
    setPolling(false);
    void queryClient.invalidateQueries({
      queryKey: [...DATA_CENTER_CATALOG_KEY, category],
    });
  }, [polling, status.data, category, queryClient]);

  const refresh = useMutation({
    mutationFn: () => refreshDataCenterCatalog(category),
    onSuccess: () => setPolling(true),
  });

  return {
    data: dataQuery.data,
    isLoading: dataQuery.isLoading,
    isFetching: dataQuery.isFetching,
    isError: dataQuery.isError,
    error: dataQuery.error,
    refetch: dataQuery.refetch,
    status: status.data,
    isPolling: polling,
    refresh,
  };
}

/** El detalle se pide solo cuando el usuario abre una tarjeta. */
export function useDataCenterCatalogItem(
  category: CatalogCategory,
  group: string | null,
  id: number | null
) {
  return useQuery({
    queryKey: [...DATA_CENTER_CATALOG_KEY, category, "item", group, id],
    queryFn: async () => {
      if (group === null || id === null) {
        throw new Error("No se ha seleccionado ningún recurso");
      }
      return getDataCenterCatalogItem(category, group, id);
    },
    enabled: group !== null && id !== null,
    staleTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });
}
