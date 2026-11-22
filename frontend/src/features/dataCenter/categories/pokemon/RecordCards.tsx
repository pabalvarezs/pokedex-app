import {
  ArrowDownToLine,
  Feather,
  Ruler,
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
}

function RecordCard({
  label,
  hint,
  unit,
  icon: Icon,
  entries,
  accent,
}: RecordCardProps) {
  return (
    <article className="glass-surface rounded-card border border-line p-4 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-ink-500">
            {label}
          </p>
          <p className="mt-0.5 text-[10px] text-ink-500">{hint}</p>
        </div>
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
          style={{ backgroundColor: `${accent}1f`, color: accent }}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="mt-3 text-xs font-semibold text-ink-500">Sin datos</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center gap-2">
              <PokemonArtwork
                id={entry.id}
                name={entry.name}
                src={entry.artwork ?? entry.sprite}
                className="h-10 w-10 shrink-0 object-contain"
              />
              <div className="min-w-0 flex-1">
                <Link
                  to={`/pokemon/${entry.id}`}
                  className="block truncate text-sm font-extrabold capitalize text-ink-900 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  {entry.name}
                </Link>
                <p className="text-[10px] font-semibold text-ink-500">
                  #{String(entry.id).padStart(3, "0")}
                  {entry.tied ? " · empatado" : ""}
                </p>
              </div>
              <span className="shrink-0 text-sm font-black tabular-nums" style={{ color: accent }}>
                {formatNumber(entry.value)} {unit}
              </span>
            </li>
          ))}
        </ul>
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
      <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4")}>
        {CARDS.map((card) => (
          <RecordCard
            key={card.key}
            label={card.label}
            hint={card.hint}
            unit={card.unit}
            icon={card.icon}
            accent={card.accent}
            entries={records[card.key]}
          />
        ))}
      </div>
    </section>
  );
}
