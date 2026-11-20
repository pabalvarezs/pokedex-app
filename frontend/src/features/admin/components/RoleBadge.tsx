import type { AdminUser } from "../../../services/api";

export type Role = AdminUser["role"];

const ROLE_STYLES: Record<Role, { label: string; badge: string; dot: string }> = {
  admin: {
    label: "Administrador",
    badge: "border-accent-recovery/25 bg-accent-recovery/10 text-accent-recovery",
    dot: "bg-accent-recovery",
  },
  trainer: {
    label: "Entrenador",
    badge: "border-sky-200 bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
  },
};

interface Props {
  role: Role;
  withDot?: boolean;
}

export default function RoleBadge({ role, withDot = true }: Props) {
  const style = ROLE_STYLES[role];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black ${style.badge}`}
    >
      {withDot && (
        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      )}
      {style.label}
    </span>
  );
}
