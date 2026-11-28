import { cn } from "../../../admin/lib/cn";
import type { ItemPocketGroup } from "./itemPockets";

interface Props {
  groups: readonly ItemPocketGroup[];
  active: string | null;
  onSelect: (id: string) => void;
}

/** Rail de bolsas: vertical en escritorio, compacto en pantallas pequeñas. */
export default function ItemPocketRail({ groups, active, onSelect }: Props) {
  return (
    <nav
      aria-label="Bolsas de objetos"
      className="glass-surface min-w-0 rounded-card border border-line p-2 shadow-soft lg:p-3"
    >
      <p className="px-2 pb-2 pt-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-500">
        Bolsas
      </p>
      <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-1">
        {groups.map((group) => {
          const Icon = group.icon;
          const expanded = active === group.id;
          return (
            <li key={group.id} className="min-w-0">
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls="item-pocket-panel"
                aria-label={`${group.label}, ${group.count} objetos`}
                onClick={() => onSelect(group.id)}
                className={cn(
                  "focus-accent flex min-h-[44px] w-full min-w-0 items-center gap-2 rounded-control border border-transparent px-2 py-2 text-left text-xs font-bold text-ink-700 transition hover:border-red-200 hover:bg-red-50/60",
                  expanded &&
                    "border-red-300 bg-red-50 text-red-700 ring-1 ring-red-200"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate" aria-hidden="true">
                  {group.label}
                </span>
                <span
                  className="shrink-0 rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-black tabular-nums text-ink-500"
                  aria-hidden="true"
                >
                  {group.count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
