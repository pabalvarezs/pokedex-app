import { Link } from "react-router-dom";
import { useCountUp } from "../../hooks/useCountUp";
import TypeBadge from "../TypeBadge";
import { PokeballIcon, StarIcon } from "./icons";

export interface HeroStat {
  label: string;
  value: string;
  hint?: string;
  /** Miniatura opcional (se reutiliza el artwork ya cargado en las tarjetas). */
  sprite?: string;
  /** Tipos a mostrar con los badges del sitio (p. ej. el tipo estrella). */
  badges?: string[];
}

interface Props {
  /** `null` mientras se cargan los datos. */
  count: number | null;
  stats: HeroStat[];
}

export default function SectionHero({ count, stats }: Props) {
  const animatedCount = useCountUp(count ?? 0);

  return (
    <section
      aria-labelledby="favorites-title"
      className="relative animate-fade-up overflow-hidden rounded-[28px] px-5 py-7 text-white shadow-ambient sm:px-8 sm:py-9"
      style={{
        backgroundImage:
          "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 48%, #dc2626 100%)",
      }}
    >
      {/* Brillos y Poké Ball gigante: decoración sin texto, fuera del flujo. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 88% 6%, rgba(251,191,36,0.38), transparent 52%), radial-gradient(circle at 8% 110%, rgba(255,255,255,0.16), transparent 48%)",
        }}
      />
      <PokeballIcon
        className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 text-white/10 motion-safe:animate-pokemon-idle sm:-right-10 sm:h-80 sm:w-80"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 right-24 hidden h-24 w-24 rotate-12 text-amber-300/20 sm:block"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.5 2 4 14h6l-1.5 8L19 10h-6l.5-8z" />
        </svg>
      </span>

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" aria-hidden="true" />
            Colección personal
          </span>

          <h1
            id="favorites-title"
            tabIndex={-1}
            className="mt-3 flex flex-wrap items-center gap-3 text-3xl font-black tracking-tight outline-none sm:text-4xl"
          >
            Mis Regalones
            <div className="inline-flex shrink-0 items-center gap-3 rounded-card border border-amber-200/80 bg-gradient-to-br from-amber-300 to-amber-400 px-4 py-2.5 shadow-[0_10px_30px_-10px_rgba(251,191,36,0.85)] ring-1 ring-inset ring-white/50">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/60 text-amber-800 shadow-sm">
                <StarIcon className="h-6 w-6" />
              </span>
              <span className="flex flex-col leading-none">
                <span
                  className="text-4xl font-black tabular-nums tracking-tight text-amber-950 sm:text-5xl"
                  aria-label={count === null ? "Cargando cantidad" : `${count} regalones`}
                >
                  {count === null ? "…" : animatedCount.toLocaleString("es-CL")}
                </span>
                <span className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-900/80">
                  regalones
                </span>
              </span>
            </div>
          </h1>

          <p className="mt-2 max-w-xl text-sm font-medium text-red-50 sm:text-base">
            Tu equipo de cracks, guardado en la base de datos.{" "}
            <span className="whitespace-nowrap">Puro corazón chileno.</span>
          </p>
        </div>

        <Link
          to="/"
          aria-label="Agregar más regalones"
          className="ml-auto inline-flex min-h-[36px] w-fit shrink-0 items-center gap-1 rounded-full border border-white/25 bg-white/10 px-2.5 py-1.5 text-[11px] font-bold text-white/90 backdrop-blur-sm transition hover:bg-white hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-red-700"
        >
          <span aria-hidden="true" className="text-sm leading-none">＋</span>
          Agregar
        </Link>
      </div>

      {stats.length > 0 && (
        <dl className="relative mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`min-w-0 rounded-2xl border border-white/15 bg-white/10 px-3.5 py-2.5 backdrop-blur-sm ${
                index === stats.length - 1 && stats.length % 2 === 1
                  ? "col-span-2 sm:col-span-1"
                  : ""
              }`}
            >
              <dt className="text-xs font-bold uppercase tracking-[0.12em] text-amber-50">
                {stat.label}
              </dt>
              <dd className="mt-1">
                <span className="flex items-center gap-2">
                  {stat.sprite && (
                    <img
                      src={stat.sprite}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      className="h-7 w-7 shrink-0 object-contain drop-shadow transition-opacity duration-300 motion-reduce:transition-none"
                    />
                  )}
                  <span className="min-w-0 flex-1 truncate text-base font-extrabold text-white sm:text-lg">
                    {stat.value}
                  </span>
                </span>
                {stat.badges && stat.badges.length > 0 && (
                  <div className="mt-1.5 flex flex-nowrap items-center gap-1.5 overflow-hidden">
                    {stat.badges.map((type) => (
                      <TypeBadge key={type} type={type} size="xs" showIcon className="shrink-0" />
                    ))}
                  </div>
                )}
                {stat.hint && (
                  <span className="mt-0.5 block truncate text-xs font-semibold text-red-50">
                    {stat.hint}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
