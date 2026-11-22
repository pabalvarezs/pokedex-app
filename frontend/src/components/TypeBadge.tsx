import { getBadgeTextColor, getTypeBadge } from "../utils/pokemon";
import TypeIcon from "./TypeIcon";

export type TypeBadgeSize = "xs" | "sm" | "md";

interface Props {
  type: string;
  size?: TypeBadgeSize;
  /** El icono SVG se muestra en sm/md; en xs se omite por densidad. */
  showIcon?: boolean;
  /** Renderiza un botón con `aria-pressed` (para los filtros). */
  interactive?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  /** Texto delantero, p. ej. "Sin" para tipos excluidos. */
  prefix?: string;
}

const SIZES: Record<TypeBadgeSize, { chip: string; icon: string; orb: string }> = {
  xs: { chip: "gap-1 px-1.5 py-0.5 text-[9px]", icon: "h-3 w-3", orb: "h-4 w-4" },
  sm: { chip: "gap-1.5 px-2 py-1 text-[10px]", icon: "h-3.5 w-3.5", orb: "h-5 w-5" },
  md: { chip: "gap-1.5 px-2.5 py-1.5 text-[11px]", icon: "h-4 w-4", orb: "h-6 w-6" },
};

/**
 * Insignia de tipo unificada: color oficial del tipo en degradado y símbolo
 * vectorial. Un único componente para tarjetas, filtros, favoritos y panel.
 */
export default function TypeBadge({
  type,
  size = "sm",
  showIcon = size !== "xs",
  interactive = false,
  selected = true,
  onClick,
  className = "",
  prefix,
}: Props) {
  const info = getTypeBadge(type);
  const dimensions = SIZES[size];

  const chipStyle = selected
    ? {
        backgroundImage: `linear-gradient(135deg, ${info.badge} 0%, ${info.accent} 100%)`,
        color: getBadgeTextColor(type),
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.32), 0 1px 2px rgba(15,23,42,0.10)",
      }
    : {
        backgroundColor: "rgba(255,255,255,0.88)",
        color: info.accent,
        boxShadow: `inset 0 0 0 1px ${info.accent}66`,
      };

  const orbStyle = selected
    ? { backgroundColor: "rgba(255,255,255,0.22)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.32)" }
    : { backgroundColor: `${info.accent}1f` };

  const content = (
    <>
      {showIcon && (
        <span
          className={`${dimensions.orb} grid shrink-0 place-items-center rounded-full`}
          style={orbStyle}
        >
          <TypeIcon type={type} className={dimensions.icon} />
        </span>
      )}
      <span className="leading-none">
        {prefix ? `${prefix} ${info.es}` : info.es}
      </span>
    </>
  );

  const classes = `inline-flex items-center rounded-full font-extrabold uppercase tracking-wide transition duration-150 motion-reduce:transition-none ${dimensions.chip} ${className} ${
    interactive
      ? selected
        ? "hover:-translate-y-0.5 hover:brightness-110"
        : "hover:bg-white hover:-translate-y-0.5"
      : ""
  }`;

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={`${classes} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1`}
        style={chipStyle}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={classes} style={chipStyle}>
      {content}
    </span>
  );
}
