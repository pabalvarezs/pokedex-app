import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { useReducedMotionSafe } from "../../../hooks/useReducedMotionSafe";
import { motionDurations, motionTokens, STAGGER_STEP } from "../../../lib/motion";
import { useCountUp } from "../hooks/useCountUp";
import { Skeleton } from "./Skeleton";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (position: number) => ({
    opacity: 1,
    y: 0,
    transition: { ...motionTokens.transitions.enter, delay: position * STAGGER_STEP },
  }),
};

export type StatTone = "trainers" | "gifts" | "recent" | "recovery";

const TONES: Record<StatTone, string> = {
  trainers: "bg-accent-trainers/10 text-accent-trainers ring-accent-trainers/20",
  gifts: "bg-accent-gifts/10 text-accent-gifts ring-accent-gifts/20",
  recent: "bg-sky-500/10 text-sky-600 ring-sky-500/20",
  recovery: "bg-accent-recovery/10 text-accent-recovery ring-accent-recovery/20",
};

interface Props {
  label: string;
  /** Etiqueta breve para móvil, donde las tarjetas son angostas. */
  shortLabel?: string;
  icon: LucideIcon;
  tone: StatTone;
  /** Métrica numérica. Se anima con count-up. */
  value?: number;
  /** Contenido alternativo al número (p. ej. sprite + nombre del regalón). */
  children?: ReactNode;
  loading?: boolean;
  index?: number;
}

export default function StatCard({
  label,
  shortLabel,
  icon: Icon,
  tone,
  value = 0,
  children,
  loading = false,
  index = 0,
}: Props) {
  const display = useCountUp(loading ? 0 : value);
  const reduceMotion = useReducedMotionSafe();

  return (
    <m.article
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={reduceMotion ? undefined : { y: -2 }}
      transition={{ duration: motionDurations.fast }}
      className="glass-surface flex flex-col rounded-card border border-line p-4 shadow-soft transition-shadow duration-200 hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 flex-1 break-words text-[10px] font-bold uppercase leading-tight tracking-wider text-ink-500 sm:text-xs">
          <span className="sm:hidden">{shortLabel ?? label}</span>
          <span className="hidden sm:inline">{label}</span>
        </p>
        <span
          aria-hidden="true"
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ring-1 sm:h-11 sm:w-11 ${TONES[tone]}`}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.25} />
        </span>
      </div>

      <div className="mt-1 min-w-0">
        {loading ? (
          <Skeleton className="h-9 w-20" />
        ) : children ? (
          children
        ) : (
          <p className="text-3xl font-extrabold tabular-nums tracking-tight text-ink-900">
            {display.toLocaleString("es-CL")}
          </p>
        )}
      </div>
    </m.article>
  );
}
