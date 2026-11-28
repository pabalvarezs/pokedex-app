import {
  ArrowDownToLine,
  Feather,
  Ruler,
  Trophy,
  Weight,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import PokemonArtwork from "../../../../components/PokemonArtwork";
import { cn } from "../../../admin/lib/cn";
import { formatNumber } from "../../lib/format";
import type { PhysicalRecords, RankEntry } from "../../lib/types";

interface RecordCardProps {
  label: string;
  hint: string;
  unit: string;
  icon: LucideIcon;
  entries: RankEntry[];
  accent: string;
  className?: string;
  /** La última tarjeta queda sola en la fila de 3 columnas. */
  orphan?: boolean;
}

function RecordCard({
  label,
  hint,
  unit,
  icon: Icon,
  entries,
  accent,
  className,
  orphan,
}: RecordCardProps) {
  const [leader, ...contenders] = entries;

  return (
    <article
      className={cn(
        "glass-surface flex min-w-0 flex-col overflow-hidden rounded-card border border-line shadow-soft",
        !leader && "min-h-[168px]",
        className
      )}
    >
      {/* Franja de acento: ocupa todo el ancho, el texto se mantiene en tinta. */}
      <div
        className="flex items-center gap-2.5 border-b border-line-soft px-3 py-2.5"
        style={{ backgroundColor: `${accent}12` }}
      >
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/90 shadow-sm"
          style={{ color: accent }}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-black uppercase tracking-wider text-ink-900">
            {label}
          </p>
          <p className="truncate text-[10px] text-ink-500">{hint}</p>
        </div>
      </div>

      {!leader ? (
        <div className="flex flex-1 items-center justify-center px-3 py-8">
          <p className="text-xs font-semibold text-ink-500">Sin datos</p>
        </div>
      ) : (
        <>
          {/* Único protagonista de la tarjeta: arte, nombre y cifra del récord. */}
          <div className="relative px-3 pb-3 pt-3">
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute left-1/2 top-4 h-24 w-24 -translate-x-1/2 rounded-full blur-2xl sm:h-28 sm:w-28",
                orphan && "lg:h-32 lg:w-32 xl:h-28 xl:w-28"
              )}
              style={{ backgroundColor: `${accent}22` }}
            />
            <div className="relative flex flex-col items-center text-center">
              <div
                className={cn(
                  "grid h-28 w-28 place-items-center sm:h-32 sm:w-32",
                  orphan && "lg:h-40 lg:w-40 xl:h-32 xl:w-32",
                  "motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:-translate-y-0.5"
                )}
              >
                <PokemonArtwork
                  id={leader.id}
                  name={leader.name}
                  src={leader.artwork ?? leader.sprite}
                  className="h-full w-full object-contain drop-shadow-sm"
                  priority
                />
              </div>
              <Link
                to={`/pokemon/${leader.id}`}
                className="mt-1 block max-w-full truncate text-value font-extrabold capitalize text-ink-900 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                {leader.name}
              </Link>
              <p
                className="mt-0.5 text-display font-black leading-none tabular-nums"
                style={{ color: accent }}
              >
                {formatNumber(leader.value)}
                <span className="ml-1 text-value font-extrabold">{unit}</span>
              </p>
              <span
                className={cn(
                  "mt-2 inline-flex items-center gap-1 rounded-full border border-line bg-white/85 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-ink-700 shadow-sm",
                  leader.tied && "border-dashed"
                )}
              >
                <Trophy
                  className="h-3 w-3 shrink-0"
                  style={{ color: accent }}
                  aria-hidden="true"
                />
                #1 · Récord{leader.tied ? " · empatado" : ""}
              </span>
            </div>
          </div>

          {/* Resto de puestos: filas compactas, sin competir con el podio. */}
          {contenders.length > 0 && (
            <ul className="max-h-56 overflow-y-auto border-t border-line-soft px-2 pb-2 pr-1.5">
              {contenders.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-1.5 border-b border-line-soft py-1.5 last:border-b-0"
                >
                  <span className="w-6 shrink-0 text-center text-[10px] font-black tabular-nums text-ink-500">
                    #{entry.rank}
                  </span>
                  <PokemonArtwork
                    id={entry.id}
                    name={entry.name}
                    src={entry.artwork ?? entry.sprite}
                    className="h-8 w-8 shrink-0 object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/pokemon/${entry.id}`}
                      className="block truncate text-[11px] font-extrabold capitalize leading-tight text-ink-900 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    >
                      {entry.name}
                    </Link>
                    <p className="truncate text-[9px] font-semibold leading-tight text-ink-500">
                      #{String(entry.id).padStart(3, "0")}
                      {entry.tied ? " · empatado" : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] font-black tabular-nums text-ink-900">
                    {formatNumber(entry.value)}{" "}
                    <span className="font-bold text-ink-500">{unit}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </article>
  );
}

const CARDS: {
  key: keyof PhysicalRecords;
  label: string;
  hint: string;
  unit: string;
  icon: LucideIcon;
  accent: string;
}[] = [
  { key: "tallest", label: "Más alto", hint: "decímetros → metros", unit: "m", icon: Ruler, accent: "#2563eb" },
  { key: "shortest", label: "Más bajo", hint: "decímetros → metros", unit: "m", icon: ArrowDownToLine, accent: "#0891b2" },
  { key: "heaviest", label: "Más pesado", hint: "hectogramos → kg", unit: "kg", icon: Weight, accent: "#b45309" },
  { key: "lightest", label: "Más liviano", hint: "hectogramos → kg", unit: "kg", icon: Feather, accent: "#16a34a" },
];

export default function RecordCards({ records }: { records: PhysicalRecords }) {
  return (
    <section aria-label="Récords físicos">
      <h2 className="mb-3 text-sm font-black text-ink-900">Récords físicos</h2>
      {/* Flex + justify-center: la fila que queda incompleta se centra sola. */}
      <div className="flex flex-wrap justify-center gap-4">
        {CARDS.map((card, index) => (
          <RecordCard
            key={card.key}
            label={card.label}
            hint={card.hint}
            unit={card.unit}
            icon={card.icon}
            accent={card.accent}
            entries={records[card.key]}
            className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)] xl:w-[calc(25%-0.75rem)]"
            orphan={index === CARDS.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
