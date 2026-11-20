import type { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  actions?: ReactNode;
}

/**
 * Encabezado común de las tres pestañas: la línea superior toma el acento de
 * la pestaña activa para reforzar el cambio de contexto.
 */
export default function AdminSectionHeader({ title, description, actions }: Props) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <span
          aria-hidden="true"
          className="mb-2 block h-1 w-9 rounded-full bg-[color:var(--accent)]"
        />
        <h2 className="text-lg font-extrabold tracking-tight text-ink-900 sm:text-xl">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 max-w-prose text-xs leading-relaxed text-ink-500">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
