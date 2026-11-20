import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  /** Resumen en texto para lectores de pantalla. */
  summary: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function ChartCard({
  title,
  subtitle,
  summary,
  action,
  children,
  className = "",
}: Props) {
  return (
    <article
      className={`glass-surface rounded-card border border-line p-4 shadow-soft ${className}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-extrabold text-ink-900">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-[11px] leading-snug text-ink-500">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div role="img" aria-label={summary} className="min-w-0">
        {children}
      </div>
    </article>
  );
}
