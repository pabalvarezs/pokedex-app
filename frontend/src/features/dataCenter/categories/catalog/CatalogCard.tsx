import TypeBadge from "../../../../components/TypeBadge";
import { cn } from "../../../admin/lib/cn";
import { groupLabel, type CatalogMeta } from "../../lib/catalogs";
import type { CatalogEntry } from "../../lib/types";

interface Props {
  entry: CatalogEntry;
  meta: CatalogMeta;
  selected: boolean;
  onSelect: () => void;
}

/** Tarjeta reutilizable para cualquier entrada de cualquier catálogo. */
export default function CatalogCard({ entry, meta, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Ver detalle de ${entry.label}`}
      className={cn(
        "focus-accent group flex w-full items-center gap-3 rounded-card border border-line bg-white/80 p-3 text-left shadow-soft transition duration-150 hover:-translate-y-0.5 hover:border-red-300 hover:shadow-card motion-reduce:transform-none",
        selected && "border-red-400 bg-red-50/70 ring-2 ring-red-200"
      )}
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-control border border-line-soft bg-slate-50">
        {entry.group === "type" ? (
          <TypeBadge type={entry.name} size="xs" showIcon={false} />
        ) : entry.sprite ? (
          <img
            src={entry.sprite}
            alt=""
            aria-hidden="true"
            width={40}
            height={40}
            loading="lazy"
            className="h-10 w-10 object-contain"
          />
        ) : (
          <span className="text-sm font-black text-ink-500" aria-hidden="true">
            #{entry.id}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-extrabold capitalize text-ink-900">
          {entry.label}
        </span>
        <span className="mt-0.5 block text-[10px] font-bold text-ink-500">
          {groupLabel(meta, entry.group)} · #{String(entry.id).padStart(3, "0")}
        </span>
      </span>
      <span
        aria-hidden="true"
        className="text-xs font-black text-red-600 transition group-hover:translate-x-0.5 motion-reduce:transform-none"
      >
        ›
      </span>
    </button>
  );
}
