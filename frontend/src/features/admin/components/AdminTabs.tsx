export type AdminTab = "users" | "favorites" | "resets";

interface TabConfig {
  id: AdminTab;
  label: string;
  icon: string;
  active: string;
}

export const ADMIN_TABS: TabConfig[] = [
  {
    id: "users",
    label: "Entrenadores",
    icon: "👥",
    active: "bg-accent-trainers text-white shadow-soft",
  },
  {
    id: "favorites",
    label: "Regalones",
    icon: "⭐",
    active: "bg-accent-gifts text-amber-950 shadow-soft",
  },
  {
    id: "resets",
    label: "Recuperaciones",
    icon: "🔑",
    active: "bg-accent-recovery text-white shadow-soft",
  },
];

interface Props {
  value: AdminTab;
  onChange: (tab: AdminTab) => void;
}

export default function AdminTabs({ value, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Secciones del panel de administración"
      className="glass-surface glass-blur mb-5 flex w-full flex-col gap-1.5 rounded-card border border-line p-1 shadow-soft sm:inline-flex sm:w-auto sm:flex-row"
    >
      {ADMIN_TABS.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`flex w-full items-center justify-center gap-2 rounded-control px-4 py-2.5 text-sm font-bold transition sm:w-auto ${
              active ? tab.active : "text-ink-500 hover:bg-slate-100 hover:text-ink-700"
            }`}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
