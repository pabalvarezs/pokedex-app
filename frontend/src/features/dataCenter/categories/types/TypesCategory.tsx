import { useEffect, useRef } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../../../services/api";
import { cn } from "../../../admin/lib/cn";
import { DataCenterError } from "../../components/DataCenterState";
import { useDataCenterTypeMatrix } from "../../hooks/useDataCenterTypeMatrix";
import { formatDate, formatNumber } from "../../lib/format";
import TypeCards from "./TypeCards";
import TypeMatrix from "./TypeMatrix";
import {
  TypeCardsSkeleton,
  TypeMatrixHeaderSkeleton,
  TypeMatrixSkeleton,
  TypesHeaderSkeleton,
} from "./TypesSkeletons";
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

  if (isLoading) {
    return (
      <div className="space-y-5">
        <TypesHeaderSkeleton />
        <TypeCardsSkeleton />
        {/* El espacio extra se aplica al bloque de la matriz, igual que en el estado cargado. */}
        <div className="!mt-16 space-y-5">
          <TypeMatrixHeaderSkeleton />
          <TypeMatrixSkeleton />
        </div>
      </div>
    );
  }

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
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-red-700">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
            Catálogo elemental
          </span>
          <h2 className="mt-2 flex items-center gap-3 text-display font-extrabold text-ink-900">
            <span
              className="h-8 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-red-600 to-amber-400"
              aria-hidden="true"
            />
            Tipos elementales
          </h2>
          <p className="mt-1 max-w-2xl text-body text-ink-500">
            Generación en que apareció, movimientos y clase de daño de los 18 tipos.
          </p>
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

      <TypeCards types={data.types} />

      {/* Agrupamos la matriz para separarla 3 espacios de las tarjetas.
          !mt-16 es necesario porque space-y-5 del root gana por specificidad. */}
      <div className="!mt-16 space-y-5">
        <section aria-label="Matriz de efectividad" className="space-y-1">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-red-700">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
              Efectividad de tipos
            </span>
            <h2 className="mt-2 flex items-center gap-3 text-display font-extrabold text-ink-900">
              <span
                className="h-8 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-red-600 to-amber-400"
                aria-hidden="true"
              />
              Matriz de efectividad
            </h2>
          </div>
          <p className="mt-1 max-w-2xl text-body text-ink-500">
            {formatNumber(data.meta.count, 0)} tipos · reglas vigentes desde la sexta
            generación. Filas: tipo del movimiento · columnas: tipo del Pokémon objetivo.
            Toca una casilla para ver el detalle.
          </p>
          {isPolling && (
            <p className="text-[11px] font-bold text-amber-700" role="status">
              Actualizando en segundo plano…
            </p>
          )}
        </section>

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
    </div>
  );
}
