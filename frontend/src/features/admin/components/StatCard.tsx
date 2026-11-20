import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useCountUp } from "../hooks/useCountUp";
import { Skeleton } from "./Skeleton";

export type StatTone = "trainers" | "gifts" | "recent" | "recovery";

const TONES: Record<StatTone, string> = {
  trainers: "bg-accent-trainers/10 text-accent-trainers ring-accent-trainers/20",
  gifts: "bg-accent-gifts/10 text-accent-gifts ring-accent-gifts/20",
  recent: "bg-sky-500/10 text-sky-600 ring-sky-500/20",
  recovery: "bg-accent-recovery/10 text-accent-recovery ring-accent-recovery/20",
};

interface Props {
  label: string;
  icon: LucideIcon;
  tone: StatTone;
  /** Métrica numérica. Se anima con count-up. */
  value?: number;
  /** Contenido alternativo al número (p. ej. sprite + nombre del regalón). */
  children?: ReactNode;
  loading?: boolean;
  index?: number;
}

export default function StatCard({
  label,
  icon: Icon,
  tone,
  value = 0,
  children,
  loading = false,
  index = 0,
}: Props) {
  const display = useCountUp(loading ? 0 : value);

  return (
    <article
      className="glass-surface flex animate-fade-up flex-col rounded-card border border-line p-4 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-lift motion-safe:hover:-translate-y-0.5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 flex-1 text-xs font-bold uppercase tracking-wider text-ink-500">
          {label}
        </p>
        <span
          aria-hidden="true"
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ring-1 ${TONES[tone]}`}
        >
          <Icon className="h-5 w-5" strokeWidth={2.25} />
        </span>
      </div>

      <div className="mt-1 min-w-0">
        {loading ? (
          <Skeleton className="h-9 w-20" />
        ) : children ? (
          children
        ) : (
          <p className="text-3xl font-extrabold tabular-nums tracking-tight text-ink-900">
            {display.toLocaleString("es-CL")}
          </p>
        )}
      </div>
    </article>
  );
}
