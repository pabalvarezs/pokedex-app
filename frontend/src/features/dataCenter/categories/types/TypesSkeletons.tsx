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

/** Skeleton de las Poké Balls, con la misma rejilla y forma que el contenido real. */
export function TypeCardsSkeleton() {
  return (
    <section aria-busy="true" aria-label="Cargando tipos" className="space-y-3">
      <ul className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <li key={index} className="w-full">
            <div className="relative mx-auto aspect-square w-full max-w-[150px] rounded-full sm:max-w-[180px]">
              <div className="absolute inset-0 rounded-full bg-ink-900 p-[5px] shadow-soft sm:p-[6px]">
                <div className="relative h-full w-full overflow-hidden rounded-full bg-white">
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-slate-300" />
                  <div className="absolute inset-x-0 top-1/2 h-[9%] -translate-y-1/2 bg-ink-900">
                    <span
                      aria-hidden="true"
                      className="absolute right-[6px] top-1/2 h-2 w-4 -translate-y-1/2 rounded-full bg-white/40"
                    />
                  </div>
                  <Skeleton className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-ink-900 sm:h-[58px] sm:w-[58px]" />
                  <div className="absolute inset-x-[6%] bottom-[5%] grid grid-cols-3 items-end gap-0.5">
                    {Array.from({ length: 3 }, (_, slot) => (
                      <div key={slot} className="flex min-w-0 flex-col items-center gap-1">
                        <Skeleton className="h-2 w-6" />
                        <Skeleton className="h-1.5 w-8 max-w-full" />
                      </div>
                    ))}
                  </div>
                </div>
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
