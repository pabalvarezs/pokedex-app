import type { ButtonHTMLAttributes, ReactNode } from "react";

type Tone = "neutral" | "danger" | "warning" | "brand";

const TONES: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  danger: "bg-red-50 text-red-700 hover:bg-red-100",
  warning: "bg-amber-50 text-amber-800 hover:bg-amber-100",
  brand: "bg-accent-trainers text-white hover:brightness-110",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  tone?: Tone;
}

export default function IconButton({
  icon,
  label,
  tone = "neutral",
  className = "",
  ...rest
}: Props) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`inline-grid h-9 w-9 place-items-center rounded-control text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${TONES[tone]} ${className}`}
      {...rest}
    >
      {icon}
    </button>
  );
}
