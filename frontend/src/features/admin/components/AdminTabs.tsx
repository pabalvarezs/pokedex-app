import type { KeyboardEvent } from "react";
import { KeyRound, Star, Users, type LucideIcon } from "lucide-react";
import { m } from "framer-motion";
import { useReducedMotionSafe } from "../../../hooks/useReducedMotionSafe";
import { motionTokens } from "../../../lib/motion";

export type AdminTab = "users" | "favorites" | "resets";

export interface AdminTabMeta {
  id: AdminTab;
  label: string;
  /** Etiqueta compacta para que las tres pestañas quepan en móvil. */
  shortLabel: string;
  icon: LucideIcon;
  /** Acento de la pestaña; se expone como `--accent` en el contenedor. */
  accent: string;
  /** Texto legible sobre el acento. */
  ink: string;
}

export const ADMIN_TABS: AdminTabMeta[] = [
  {
    id: "users",
    label: "Entrenadores",
    shortLabel: "Cuentas",
    icon: Users,
    accent: "#DC2626",
    ink: "#ffffff",
  },
  {
    id: "favorites",
    label: "Regalones",
    shortLabel: "Regalones",
    icon: Star,
    accent: "#F59E0B",
    ink: "#451a03",
  },
  {
    id: "resets",
    label: "Recuperaciones",
    shortLabel: "Claves",
    icon: KeyRound,
    accent: "#7C3AED",
    ink: "#ffffff",
  },
];

export function isAdminTab(value: string | null): value is AdminTab {
  return value === "users" || value === "favorites" || value === "resets";
}

export function getAdminTabMeta(id: AdminTab): AdminTabMeta {
  return ADMIN_TABS.find((tab) => tab.id === id) ?? ADMIN_TABS[0];
}

interface Props {
  value: AdminTab;
  onChange: (tab: AdminTab) => void;
  counts?: Record<AdminTab, number>;
  loading?: boolean;
  /** Id del panel que controlan estos tabs; debe coincidir con el tabpanel. */
  panelId?: string;
}

export default function AdminTabs({
  value,
  onChange,
  counts,
  loading = false,
  panelId = "panel-admin-tab",
}: Props) {
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
    const nextTab = ADMIN_TABS[nextIndex];
    next?.focus();
    if (next && nextTab) onChange(nextTab.id);
  };

  return (
    <div
      role="tablist"
      aria-label="Secciones del panel de administración"
      className="glass-surface glass-blur mx-auto mb-5 flex w-full snap-x gap-1.5 overflow-x-auto rounded-card border border-line p-1 shadow-soft sm:w-fit sm:overflow-visible"
    >
      {ADMIN_TABS.map((tab) => {
        const active = value === tab.id;
        const count = counts?.[tab.id] ?? 0;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={panelId}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={moveFocus}
            className={`focus-accent relative flex shrink-0 snap-start items-center justify-center rounded-control px-3 py-2.5 text-sm font-bold transition duration-150 sm:px-4 ${
              active
                ? "text-[color:var(--accent-ink)]"
                : "text-ink-500 hover:bg-slate-100 hover:text-ink-700"
            }`}
          >
            {active && (
              <m.span
                layoutId="tab-pill"
                aria-hidden="true"
                className="absolute inset-0 rounded-control shadow-soft"
                style={{ backgroundColor: "var(--accent)" }}
                transition={reduceMotion ? { duration: 0 } : motionTokens.spring}
              />
            )}

            <span className="relative z-10 flex items-center justify-center gap-2 whitespace-nowrap">
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span
                className={`hidden min-w-[1.5rem] sm:inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-black tabular-nums ${
                  active
                    ? "bg-white/30 text-[color:var(--accent-ink)]"
                    : "bg-slate-100 text-ink-500"
                }`}
              >
                {loading ? (
                  <span
                    aria-hidden="true"
                    className="h-2 w-3 rounded-full bg-current opacity-40 motion-safe:animate-pulse"
                  />
                ) : (
                  count
                )}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
