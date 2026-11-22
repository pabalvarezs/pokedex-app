/** Esqueleto usado como `Suspense fallback` al cargar una ruta diferida. */
export default function RouteFallback() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-fade-up py-4" aria-busy="true">
      <div className="skeleton mb-4 h-9 w-2/3 rounded-control" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="skeleton h-28 rounded-card" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="skeleton h-40 rounded-card" />
        ))}
      </div>
      <span className="sr-only">Cargando la página…</span>
    </div>
  );
}
