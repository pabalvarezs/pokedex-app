import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { StatTone } from "./StatCard";

const HALOS: Record<StatTone, string> = {
  trainers: "bg-accent-trainers/10 text-accent-trainers",
  gifts: "bg-accent-gifts/10 text-accent-gifts",
  recent: "bg-sky-500/10 text-sky-600",
  recovery: "bg-accent-recovery/10 text-accent-recovery",
};

interface Props {
  emoji?: string;
  icon?: LucideIcon;
  illustration?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: StatTone;
}

export default function EmptyState({
  emoji,
  icon: Icon,
  illustration,
  title,
  description,
  action,
  tone = "trainers",
}: Props) {
  return (
    <div className="glass-surface animate-fade-up rounded-card border border-line px-6 py-12 text-center shadow-soft">
      <span
        aria-hidden="true"
        className={`mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl ${HALOS[tone]} motion-safe:animate-pokemon-idle`}
      >
        {illustration ?? (Icon ? <Icon className="h-6 w-6" /> : <span className="text-2xl">{emoji}</span>)}
      </span>
      <p className="text-sm font-extrabold text-ink-900">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-500">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
