import { Skeleton } from "../../../admin/components/Skeleton";
import { getTypeBadge } from "../../../../utils/pokemon";

/** Muestra de colores de tipo para que la carga no cambie de aspecto. */
const SKELETON_SLUGS = [
  "fire",
  "water",
  "grass",
  "electric",
  "psychic",
  "fighting",
  "ghost",
  "fairy",
];

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

/** Skeleton de las tarjetas rectangulares, con la misma forma que el contenido real. */
export function TypeCardsSkeleton() {
  return (
    <section aria-busy="true" aria-label="Cargando tipos" className="space-y-3">
      <ul className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-7 lg:grid-cols-4 lg:gap-x-6">
        {SKELETON_SLUGS.map((slug, index) => {
          const badge = getTypeBadge(slug);
          return (
            <li key={index} className="w-full">
              <div className="mx-auto w-full max-w-[205px]">
                <article className="relative flex flex-col overflow-hidden rounded-card border border-line shadow-soft glass-surface">
                  <div
                    className="flex min-h-[46px] items-center justify-between gap-1.5 px-2.5 py-2 sm:min-h-[50px] sm:px-3"
                    style={{
                      backgroundColor: badge.badge,
                      backgroundImage:
                        "linear-gradient(115deg, rgba(255,255,255,0.22), rgba(255,255,255,0) 58%)",
                    }}
                  >
                    <Skeleton className="h-2.5 w-14 rounded-full bg-white/70 sm:w-20" />
                    <Skeleton className="h-3 w-12 rounded-full bg-white/70 sm:w-14" />
                  </div>
                  <div
                    className="relative flex h-[104px] items-center justify-center overflow-hidden sm:h-[118px]"
                    style={{
                      backgroundImage: `linear-gradient(160deg, ${badge.gradient[0]}, ${badge.gradient[1]})`,
                    }}
                  >
                    <div
                      aria-hidden="true"
                      className="skeleton h-[84px] w-[84px] rounded-full border-[4px] border-ink-900 sm:h-[94px] sm:w-[94px]"
                    />
                  </div>
                  <div className="grid grid-cols-[1.18fr_1fr_1fr] items-center gap-1 border-t border-line bg-[#FFFDF7] px-1.5 py-2 sm:px-2.5 sm:py-2.5">
                    {Array.from({ length: 3 }, (_, slot) => (
                      <div key={slot} className="flex min-w-0 flex-col items-center gap-1.5">
                        <Skeleton className="h-3 w-5 sm:h-3.5 sm:w-6" />
                        <Skeleton className="h-1.5 w-full max-w-[52px] sm:h-2" />
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </li>
          );
        })}
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
