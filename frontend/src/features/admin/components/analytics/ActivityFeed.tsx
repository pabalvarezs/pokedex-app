import { useState } from "react";
import { KeyRound, Star, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ActivityItem } from "../../hooks/useAdminAnalytics";
import { formatRelativeDate } from "../../lib/dates";

const ICONS: Record<ActivityItem["kind"], LucideIcon> = {
  favorite: Star,
  user: UserPlus,
  reset: KeyRound,
};

const TONES: Record<ActivityItem["kind"], string> = {
  favorite: "bg-amber-50 text-amber-700",
  user: "bg-emerald-50 text-emerald-700",
  reset: "bg-violet-50 text-violet-700",
};

interface Props {
  items: ActivityItem[];
}

export default function ActivityFeed({ items }: Props) {
  const [visible, setVisible] = useState(10);
  const shown = items.slice(0, visible);

  return (
    <section
      aria-label="Actividad reciente"
      className="glass-surface rounded-card border border-line p-4 shadow-soft"
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-extrabold text-ink-900">Actividad reciente</h3>
        <span className="text-[11px] text-ink-500">
          {items.length} evento{items.length === 1 ? "" : "s"}
        </span>
      </div>

      {shown.length === 0 ? (
        <p className="py-8 text-center text-xs text-ink-500">
          Todavía no hay actividad para mostrar.
        </p>
      ) : (
        <ul className="divide-y divide-line-soft">
          {shown.map((item) => {
            const Icon = ICONS[item.kind];
            return (
              <li key={item.id} className="flex items-center gap-3 py-2.5">
                <span
                  aria-hidden="true"
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${TONES[item.kind]}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-ink-900">{item.title}</p>
                  <p className="truncate text-[11px] text-ink-500">{item.detail}</p>
                </div>
                <time
                  dateTime={item.date}
                  className="shrink-0 text-[11px] font-semibold text-ink-500"
                >
                  {formatRelativeDate(item.date)}
                </time>
              </li>
            );
          })}
        </ul>
      )}

      {visible < items.length && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => setVisible((count) => count + 10)}
            className="focus-accent rounded-control bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition duration-150 hover:bg-slate-200"
          >
            Ver más ({Math.min(10, items.length - visible)})
          </button>
        </div>
      )}
    </section>
  );
}
