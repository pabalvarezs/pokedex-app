import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDataCenterTypeMatrix,
  getDataCenterTypeMatrixStatus,
  refreshDataCenterTypeMatrix,
} from "../../../services/api";

export const DATA_CENTER_TYPE_MATRIX_KEY = [
  "admin",
  "data-center",
  "types",
  "matrix",
] as const;

/** La matriz se calcula y cachea en el backend; el refresh es en segundo plano. */
export function useDataCenterTypeMatrix() {
  const queryClient = useQueryClient();
  const [polling, setPolling] = useState(false);

  const matrix = useQuery({
    queryKey: DATA_CENTER_TYPE_MATRIX_KEY,
    queryFn: getDataCenterTypeMatrix,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });

  const status = useQuery({
    queryKey: ["admin", "data-center", "types", "status"],
    queryFn: getDataCenterTypeMatrixStatus,
    enabled: polling,
    refetchInterval: polling ? 2000 : false,
  });

  useEffect(() => {
    if (!polling || !status.data || status.data.refreshing) return;
    setPolling(false);
    void queryClient.invalidateQueries({
      queryKey: DATA_CENTER_TYPE_MATRIX_KEY,
    });
  }, [polling, status.data, queryClient]);

  const refresh = useMutation({
    mutationFn: refreshDataCenterTypeMatrix,
    onSuccess: () => setPolling(true),
  });

  return {
    data: matrix.data,
    isLoading: matrix.isLoading,
    isFetching: matrix.isFetching,
    isError: matrix.isError,
    error: matrix.error,
    refetch: matrix.refetch,
    status: status.data,
    isPolling: polling,
    refresh,
  };
}
