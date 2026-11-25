import { useEffect, useRef } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../../../services/api";
import { cn } from "../../../admin/lib/cn";
import {
  DataCenterError,
  DataCenterSkeleton,
} from "../../components/DataCenterState";
import { useDataCenterTypeMatrix } from "../../hooks/useDataCenterTypeMatrix";
import { formatDate, formatNumber } from "../../lib/format";
import TypeMatrix from "./TypeMatrix";
import { multiplierInfo } from "./lib/typeMatrix";

const LEGEND = [2, 1, 0.5, 0];

/** La matriz es la pieza central: de ella sale todo el detalle de cada tipo. */
export default function TypesCategory() {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    status,
    isPolling,
    refresh,
  } = useDataCenterTypeMatrix();

  const wasRefreshing = useRef(false);
  useEffect(() => {
    const refreshing = Boolean(status?.refreshing);
    if (wasRefreshing.current && !refreshing) {
      if (status?.lastError) {
        toast.error("No se pudo actualizar la matriz", {
          description: status.lastError,
        });
      } else if (status?.generatedAt) {
        toast.success("Matriz actualizada", {
          description: `${formatNumber(status.count, 0)} tipos · ${formatDate(status.generatedAt)}`,
        });
      }
    }
    wasRefreshing.current = refreshing;
  }, [status]);

  const handleRefresh = () => {
    refresh.mutate(undefined, {
      onSuccess: () => {
        toast.info("Actualización iniciada", {
          description: "La matriz actual sigue disponible mientras termina.",
        });
      },
      onError: (err) => {
        toast.error(getApiErrorMessage(err, "No se pudo iniciar la actualización."));
      },
    });
  };

  if (isLoading) return <DataCenterSkeleton />;

  if (isError || !data) {
    return (
      <DataCenterError
        message={getApiErrorMessage(error, "No se pudo cargar la matriz de tipos.")}
        onRetry={() => void refetch()}
      />
    );
  }

  const busy = refresh.isPending || isPolling || isFetching;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-red-600 text-white shadow-soft">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-black text-ink-900">
              Matriz de efectividad
            </h2>
          </div>
          <p className="mt-2 text-xs font-semibold text-ink-500">
            {formatNumber(data.meta.count, 0)} tipos · reglas vigentes desde la sexta
            generación
          </p>
          <p className="mt-1 text-[11px] text-ink-500">
            Filas: tipo del movimiento · columnas: tipo del Pokémon objetivo. Toca una
            casilla o un tipo para ver el detalle.
          </p>
          {isPolling && (
            <p className="mt-1 text-[11px] font-bold text-amber-700" role="status">
              Actualizando en segundo plano…
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={busy}
          aria-label={busy ? "Actualizando datos" : "Actualizar datos"}
          className={cn(
            "inline-flex min-h-[40px] items-center gap-2 rounded-control border border-line bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-sm transition hover:border-red-300 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400",
            busy && "opacity-60"
          )}
        >
          <RefreshCw
            className={cn("h-4 w-4", busy && "motion-safe:animate-spin")}
            aria-hidden="true"
          />
          <span className="hidden sm:inline">
            {busy ? "Actualizando…" : "Actualizar datos"}
          </span>
        </button>
      </header>

      <ul
        aria-label="Leyenda de la matriz"
        className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1"
      >
        {LEGEND.map((value) => {
          const info = multiplierInfo(value);
          return (
            <li
              key={value}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-white/70 py-1 pl-1 pr-2.5 text-[10px] font-bold text-ink-600"
            >
              <span
                className={cn(
                  "grid h-6 w-6 place-items-center rounded-full text-[10px] font-black",
                  info.chip
                )}
              >
                {info.symbol}
              </span>
              {info.description.split(":")[0]}
            </li>
          );
        })}
      </ul>

      <TypeMatrix data={data} />

      <p className="text-center text-[10px] font-semibold text-ink-500">
        Datos de PokéAPI · actualizado {formatDate(status?.generatedAt ?? data.meta.generatedAt)}
      </p>
    </div>
  );
}
