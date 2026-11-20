import type { ReactNode } from "react";

type Tone = "green" | "amber" | "violet" | "slate" | "red";

const TONES: Record<Tone, string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  slate: "border-slate-200 bg-slate-100 text-slate-600",
  red: "border-red-200 bg-red-50 text-red-700",
};

interface Props {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
}

/** Chip de estado compartido por recuperaciones y formularios. */
export default function StatusBadge({ tone = "slate", icon, children }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${TONES[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}
