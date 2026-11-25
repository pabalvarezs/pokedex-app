import { Skeleton } from "../../../admin/components/Skeleton";

/** Skeleton del encabezado principal, con el botón en la misma posición. */
export function TypesHeaderSkeleton() {
  return (
    <header
      aria-busy="true"
      aria-label="Cargando cabecera de tipos"
      className="flex flex-wrap items-start justify-between gap-3"
    >
      <div>
        <Skeleton className="h-5 w-32 rounded-full" />
        <div className="mt-2 flex items-center gap-3">
          <Skeleton className="h-8 w-1.5" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Skeleton className="mt-2 h-3 w-72 max-w-full" />
      </div>
      <Skeleton className="h-10 w-32" />
    </header>
  );
}

/** Skeleton del título que antecede a la matriz. */
export function TypeMatrixHeaderSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando título de la matriz" className="space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-5 w-44" />
      </div>
      <Skeleton className="h-3 w-64 max-w-full" />
      <Skeleton className="h-3 w-80 max-w-full" />
    </div>
  );
}

/** Skeleton de las tarjetas, con la misma rejilla que el contenido real. */
export function TypeCardsSkeleton() {
  return (
    <section aria-busy="true" aria-label="Cargando tipos" className="space-y-3">
      <ul className="grid grid-cols-2 justify-items-center gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <li key={index} className="w-full max-w-[210px]">
            <div className="glass-surface overflow-hidden rounded-card border border-line shadow-soft">
              <Skeleton className="h-16 rounded-none" />
              <div className="relative -mt-8 flex flex-col items-center px-3 pb-2">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="mt-2 h-3 w-20" />
                <Skeleton className="mt-1 h-2 w-10" />
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-line-soft py-2">
                {Array.from({ length: 3 }, (_, slot) => (
                  <Skeleton key={slot} className="mx-auto h-6 w-12" />
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Skeleton de la matriz: mismas proporciones que la tabla definitiva. */
export function TypeMatrixSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando matriz de efectividad"
      className="glass-surface overflow-hidden rounded-card border border-line p-2 shadow-card"
    >
      <div className="flex gap-1">
        <Skeleton className="h-[82px] w-[66px] shrink-0 sm:h-[96px] sm:w-[104px]" />
        {Array.from({ length: 18 }, (_, index) => (
          <Skeleton
            key={index}
            className="h-[82px] w-9 shrink-0 sm:h-[96px] sm:w-11"
          />
        ))}
      </div>
      {Array.from({ length: 5 }, (_, row) => (
        <div key={row} className="mt-1 flex gap-1">
          <Skeleton className="h-9 w-[66px] shrink-0 sm:h-11 sm:w-[104px]" />
          {Array.from({ length: 18 }, (_, col) => (
            <Skeleton key={col} className="h-9 w-9 shrink-0 sm:h-11 sm:w-11" />
          ))}
        </div>
      ))}
    </div>
  );
}
