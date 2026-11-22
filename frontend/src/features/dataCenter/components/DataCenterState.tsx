import { RefreshCw, TriangleAlert } from "lucide-react";
import EmptyState from "../../admin/components/EmptyState";
import { Skeleton } from "../../admin/components/Skeleton";

export function DataCenterSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Cargando datos">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-64 w-full" />
        ))}
      </div>
    </div>
  );
}

export function DataCenterError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <EmptyState
      icon={TriangleAlert}
      tone="recovery"
      title="No pudimos cargar los datos"
      description={message}
      action={
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-control bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Reintentar
        </button>
      }
    />
  );
}

export function DataCenterEmpty() {
  return (
    <EmptyState
      emoji="🔎"
      title="Sin resultados con estos filtros"
      description="Prueba con otro tipo, otra generación o incluye las variantes."
    />
  );
}
