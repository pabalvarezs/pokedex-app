import type { KeyboardEvent } from "react";
import { m } from "framer-motion";
import { useReducedMotionSafe } from "../../../hooks/useReducedMotionSafe";
import { motionTokens } from "../../../lib/motion";
import { cn } from "../../admin/lib/cn";
import { DATA_CENTER_CATEGORIES } from "../registry";

interface Props {
  value: string;
  onChange: (id: string) => void;
  /** Id del panel controlado por estos tabs. */
  panelId: string;
}

/** Misma interacción que las pestañas del panel de admin, pero alimentada por el registro. */
export default function DataCenterTabs({ value, onChange, panelId }: Props) {
  const reduceMotion = useReducedMotionSafe();

  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>) => {
    const key = event.key;
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(key)) return;
    event.preventDefault();

    const tabs = Array.from(
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]'
      ) ?? []
    );
    const index = tabs.indexOf(event.currentTarget);
    if (index < 0) return;

    const nextIndex =
      key === "Home"
        ? 0
        : key === "End"
          ? tabs.length - 1
          : key === "ArrowRight"
            ? (index + 1) % tabs.length
            : (index - 1 + tabs.length) % tabs.length;

    const next = tabs[nextIndex];
    const nextCategory = DATA_CENTER_CATEGORIES[nextIndex];
    next?.focus();
    if (next && nextCategory) onChange(nextCategory.id);
  };

  return (
    <div
      role="tablist"
      aria-label="Categorías del Centro de Datos"
      className="glass-surface glass-blur mb-5 flex w-full snap-x gap-1.5 overflow-x-auto rounded-card border border-line p-1 shadow-soft sm:w-fit sm:overflow-visible"
    >
      {DATA_CENTER_CATEGORIES.map((category) => {
        const active = value === category.id;
        const Icon = category.icon;

        return (
          <button
            key={category.id}
            id={`tab-${category.id}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={panelId}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(category.id)}
            onKeyDown={moveFocus}
            className={cn(
              "focus-accent relative flex shrink-0 snap-start items-center justify-center rounded-control px-3 py-2.5 text-sm font-bold transition duration-150 sm:px-4",
              active
                ? "text-white"
                : "text-ink-500 hover:bg-slate-100 hover:text-ink-700"
            )}
          >
            {active && (
              <m.span
                layoutId="data-center-tab-pill"
                aria-hidden="true"
                className="absolute inset-0 rounded-control bg-red-600 shadow-soft"
                transition={reduceMotion ? { duration: 0 } : motionTokens.spring}
              />
            )}
            <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="sm:hidden">{category.shortLabel}</span>
              <span className="hidden sm:inline">{category.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
