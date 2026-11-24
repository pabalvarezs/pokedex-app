import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import PokemonArtwork from "../../../../components/PokemonArtwork";
import TypeBadge from "../../../../components/TypeBadge";
import { formatNumber } from "../../lib/format";
import type { RankEntry } from "../../lib/types";

interface Props {
  title: string;
  entries: RankEntry[];
  icon: LucideIcon;
  /** Color del tipo/estadística para el encabezado. */
  accent: string;
  /** Unidad visible del valor, p. ej. "m" o "kg". */
  unit?: string;
}

export default function RankingTable({
  title,
  entries,
  icon: Icon,
  accent,
  unit,
}: Props) {
  return (
    <article className="glass-surface overflow-hidden rounded-card border border-line shadow-soft">
      <header className="flex items-center gap-2 border-b border-line-soft px-3 py-2.5">
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full"
          style={{ backgroundColor: accent, color: "#ffffff" }}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <h3 className="text-xs font-black uppercase tracking-wide text-ink-900">
          {title}
        </h3>
        <span className="ml-auto text-[10px] font-bold text-ink-500">
          {entries.length} {entries.length === 1 ? "fila" : "filas"}
        </span>
      </header>

      {entries.length === 0 ? (
        <p className="px-3 py-6 text-center text-xs font-semibold text-ink-500">
          Sin datos con estos filtros.
        </p>
      ) : (
        <div className="max-h-[420px] overflow-auto">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">{title}</caption>
            <thead className="sticky top-0 z-10 bg-white/95 text-[10px] uppercase tracking-wider text-ink-500 backdrop-blur">
              <tr>
                <th scope="col" className="px-2 py-2 text-center">#</th>
                <th scope="col" className="px-2 py-2">Pokémon</th>
                <th scope="col" className="hidden px-2 py-2 sm:table-cell">Tipo</th>
                <th scope="col" className="px-2 py-2 text-right">
                  {unit ? `Valor (${unit})` : "Valor"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {entries.map((entry) => (
                <tr key={entry.id} className="transition hover:bg-red-50/40">
                  <td className="px-2 py-1.5 text-center font-black tabular-nums text-ink-500">
                    #{entry.rank}
                  </td>
                  <td className="px-2 py-1.5">
                    <Link
                      to={`/pokemon/${entry.id}`}
                      className="flex items-center gap-2 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    >
                      <PokemonArtwork
                        id={entry.id}
                        name={entry.name}
                        src={entry.artwork ?? entry.sprite}
                        className="h-8 w-8 shrink-0 object-contain"
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-bold capitalize text-ink-900">
                          {entry.name}
                        </span>
                        <span className="block text-[10px] text-ink-500">
                          #{String(entry.id).padStart(3, "0")}
                          {entry.tied ? " · empatado" : ""}
                          {entry.isDefault ? "" : " · variante"}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="hidden px-2 py-1.5 sm:table-cell">
                    <span className="flex flex-wrap gap-1">
                      {entry.types.map((type) => (
                        <TypeBadge key={type} type={type} size="xs" />
                      ))}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-right font-extrabold tabular-nums text-ink-900">
                    {formatNumber(entry.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
