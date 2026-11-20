import { Backpack, ShieldCheck } from "lucide-react";
import type { AdminUser } from "../../../services/api";

export type Role = AdminUser["role"];

const ROLE_STYLES: Record<
  Role,
  { label: string; badge: string; Icon: typeof ShieldCheck }
> = {
  admin: {
    label: "Administrador",
    badge: "border-violet-200 bg-violet-50 text-violet-700",
    Icon: ShieldCheck,
  },
  trainer: {
    label: "Entrenador",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Icon: Backpack,
  },
};

interface Props {
  role: Role;
  withIcon?: boolean;
}

export default function RoleBadge({ role, withIcon = true }: Props) {
  const style = ROLE_STYLES[role];
  const Icon = style.Icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${style.badge}`}
    >
      {withIcon && <Icon className="h-3 w-3" aria-hidden="true" />}
      {style.label}
    </span>
  );
}
