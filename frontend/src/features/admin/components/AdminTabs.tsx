import { motion, useReducedMotion } from "framer-motion";

export type AdminTab = "users" | "favorites" | "resets";

export interface AdminTabMeta {
  id: AdminTab;
  label: string;
  icon: string;
  /** Acento de la pestaña; se expone como `--accent` en el contenedor. */
  accent: string;
  /** Texto legible sobre el acento. */
  ink: string;
}

export const ADMIN_TABS: AdminTabMeta[] = [
  {
    id: "users",
    label: "Entrenadores",
    icon: "👥",
    accent: "#DC2626",
    ink: "#ffffff",
  },
  {
    id: "favorites",
    label: "Regalones",
    icon: "⭐",
    accent: "#F59E0B",
    ink: "#451a03",
  },
  {
    id: "resets",
    label: "Recuperaciones",
    icon: "🔑",
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
}

export default function AdminTabs({
  value,
  onChange,
  counts,
  loading = false,
}: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      role="tablist"
      aria-label="Secciones del panel de administración"
      className="glass-surface glass-blur mb-5 flex w-full flex-col gap-1.5 rounded-card border border-line p-1 shadow-soft sm:inline-flex sm:w-auto sm:flex-row"
    >
      {ADMIN_TABS.map((tab) => {
        const active = value === tab.id;
        const count = counts?.[tab.id] ?? 0;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`focus-accent relative flex w-full items-center justify-center rounded-control px-4 py-2.5 text-sm font-bold transition sm:w-auto ${
              active
                ? "text-[color:var(--accent-ink)]"
                : "text-ink-500 hover:bg-slate-100 hover:text-ink-700"
            }`}
          >
            {active && (
              <motion.span
                layoutId="tab-pill"
                aria-hidden="true"
                className="absolute inset-0 rounded-control shadow-soft"
                style={{ backgroundColor: "var(--accent)" }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 480, damping: 38 }
                }
              />
            )}

            <span className="relative z-10 flex items-center justify-center gap-2">
              <span aria-hidden="true">{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={`inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-black tabular-nums ${
                  active
                    ? "bg-white/30 text-[color:var(--accent-ink)]"
                    : "bg-slate-100 text-ink-500"
                }`}
              >
                {loading ? (
                  <span
                    aria-hidden="true"
                    className="h-2 w-3 rounded-full bg-current opacity-40"
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
