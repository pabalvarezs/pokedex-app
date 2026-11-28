import { useEffect, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getDataCenterCatalog,
  getDataCenterCatalogStatus,
  refreshDataCenterCatalog,
} from "../../../../services/api";
import { DATA_CENTER_CATALOG_KEY } from "../../hooks/useDataCenterCatalog";
import type { CatalogIndexResponse } from "../../lib/types";

/**
 * El controlador limita cada respuesta a 50 filas, así que el índice completo
 * se recorre en páginas. Así el acordeón tiene contadores reales por bolsa y la
 * búsqueda es global, no solo de la página visible.
 */
const PAGE_LIMIT = 50;
const MAX_PAGES = 80;

export function useItemCatalogIndex(q: string) {
  const queryClient = useQueryClient();
  const [polling, setPolling] = useState(false);

  const dataQuery = useQuery({
    queryKey: [...DATA_CENTER_CATALOG_KEY, "items", "index", q],
    queryFn: async (): Promise<CatalogIndexResponse> => {
      const pages: CatalogIndexResponse[] = [];
      let total = Number.POSITIVE_INFINITY;
      for (
        let offset = 0;
        offset < total && pages.length < MAX_PAGES;
        offset += PAGE_LIMIT
      ) {
        const page = await getDataCenterCatalog("items", {
          q,
          group: null,
          limit: PAGE_LIMIT,
          offset,
        });
        pages.push(page);
        total = page.meta.filtered;
        if (page.items.length === 0) break;
      }
      const first = pages[0];
      return {
        ...first,
        meta: { ...first.meta, limit: PAGE_LIMIT, offset: 0, filtered: total },
        items: pages.flatMap((page) => page.items),
      };
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
    placeholderData: keepPreviousData,
  });

  const status = useQuery({
    queryKey: [...DATA_CENTER_CATALOG_KEY, "items", "status"],
    queryFn: () => getDataCenterCatalogStatus("items"),
    enabled: polling,
    refetchInterval: polling ? 2000 : false,
  });

  useEffect(() => {
    if (!polling || !status.data || status.data.refreshing) return;
    setPolling(false);
    void queryClient.invalidateQueries({
      queryKey: [...DATA_CENTER_CATALOG_KEY, "items"],
    });
  }, [polling, status.data, queryClient]);

  const refresh = useMutation({
    mutationFn: () => refreshDataCenterCatalog("items"),
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
