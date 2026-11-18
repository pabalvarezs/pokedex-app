import { Link } from "react-router-dom";
import { PokeballIcon, StarIcon } from "./icons";

interface Props {
  /** `true` cuando hay regalones pero la búsqueda no devolvió ninguno. */
  filtered?: boolean;
  query?: string;
  onClear?: () => void;
}

export default function FavoritesEmptyState({ filtered, query, onClear }: Props) {
  return (
    <div className="relative mt-5 overflow-hidden rounded-card border border-line bg-surface px-6 py-14 text-center shadow-card sm:py-16">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(220,38,38,0.06), transparent 60%)",
        }}
      />

      <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
        <PokeballIcon className="absolute inset-0 h-full w-full text-red-200" />
        <StarIcon className="relative h-9 w-9 text-amber-400 drop-shadow-sm" />
      </div>

      {filtered ? (
        <>
          <h2 className="relative mt-5 text-xl font-extrabold text-ink-900 sm:text-2xl">
            No pillamos a ese regalón
          </h2>
          <p className="relative mx-auto mt-2 max-w-md text-sm text-ink-500">
            No hay nadie en tu colección que se llame «{query}». Prueba con otro
            nombre o limpia la búsqueda.
          </p>
          <button
            type="button"
            onClick={onClear}
            className="relative mt-6 inline-flex min-h-[44px] items-center justify-center rounded-control border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
          >
            Limpiar búsqueda
          </button>
        </>
      ) : (
        <>
          <h2 className="relative mt-5 text-xl font-extrabold text-ink-900 sm:text-2xl">
            Aún no tenís regalones, ¡sale a cazar!
          </h2>
          <p className="relative mx-auto mt-2 max-w-md text-sm text-ink-500">
            Recorre la Pokédex y toca la estrellita de cualquier Pokémon para
            armar tu equipo de cracks. Quedan guardados en tu cuenta.
          </p>
          <Link
            to="/"
            className="relative mt-6 inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-control bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
          >
            Ir a pillar Pokémon
            <span aria-hidden="true">👈</span>
          </Link>
        </>
      )}
    </div>
  );
}
