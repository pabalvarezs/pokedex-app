import { PokeballIcon } from "./favorites/icons";

/**
 * Estado de carga de la ficha: replica la estructura real (banner,retrato y
 * columna de datos) con shimmer, para que el salto al contenido no mueva nada.
 */
export default function PokemonDetailSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-ficha animate-fade-up pb-12"
      role="status"
      aria-live="polite"
      aria-label="Buscando la ficha del Pokémon"
    >
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="skeleton h-10 w-32 rounded-control" />
        <div className="skeleton h-10 w-40 rounded-control" />
      </div>

      <div className="glass-surface glass-blur overflow-hidden rounded-card border border-line bg-surface shadow-card">
        {/* Banner con la identidad del sitio */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 px-6 py-8 text-white sm:px-8 sm:py-10 lg:px-10">
          <PokeballIcon
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 text-white/15 motion-safe:animate-pokemon-idle"
          />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="skeleton h-6 w-36 rounded-full bg-white/25" />
              <div className="skeleton mt-4 h-10 w-56 rounded-control bg-white/25" />
              <div className="skeleton mt-3 h-4 w-40 rounded-full bg-white/25" />
            </div>
            <div className="flex gap-2">
              <div className="skeleton h-9 w-24 rounded-full bg-white/25" />
              <div className="skeleton h-9 w-20 rounded-full bg-white/25" />
            </div>
          </div>
          <p className="relative mt-5 text-sm font-bold text-white/95">
            Buscando la ficha completa…
          </p>
          <p className="relative mt-1 text-xs font-medium text-white/80">
            Ya caemos con los datos, espérate un cachito.
          </p>
        </div>

        {/* Cuerpo: retrato a la izquierda, datos a la derecha */}
        <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 md:grid-cols-12 lg:gap-10 lg:p-10">
          <div className="flex flex-col md:col-span-5">
            <div className="skeleton mx-auto aspect-square w-full max-w-[360px] rounded-card" />
            <div className="mt-6 flex gap-2">
              <div className="skeleton h-11 flex-1 rounded-control" />
              <div className="skeleton h-11 w-28 rounded-control" />
            </div>
            <div className="mt-6 flex justify-center gap-2 border-t border-line-soft pt-6">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="skeleton h-20 w-16 rounded-control" />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6 md:col-span-7">
            <div className="skeleton h-32 rounded-card" />
            <div className="skeleton h-24 rounded-card" />
            <div>
              <div className="skeleton mb-3 h-5 w-40 rounded-control" />
              <div className="space-y-2.5">
                {[0, 1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="skeleton h-4 w-28 rounded-full" />
                    <div className="skeleton h-4 w-8 rounded-full" />
                    <div className="skeleton h-2.5 flex-1 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
            <div className="skeleton h-16 rounded-card" />
          </div>
        </div>
      </div>

      <span className="sr-only">Cargando la ficha del Pokémon…</span>
    </div>
  );
}
