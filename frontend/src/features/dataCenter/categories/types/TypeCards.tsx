import { useRef, useState, type FocusEvent, type MouseEvent } from "react";
import { cn } from "../../../admin/lib/cn";
import TypeIcon from "../../../../components/TypeIcon";
import { getTypeBadge } from "../../../../utils/pokemon";
import { MOVE_CLASSES_ES } from "../../../../utils/moves";
import { formatNumber } from "../../lib/format";
import type { TypeMatrixType } from "../../lib/types";
import type { PopoverAnchor } from "./FloatingPanel";
import MovesPopover from "./MovesPopover";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

/** Los tipos sin clase fija (p. ej. Hada) usan un chip neutro. */
const MIXED_CHIP = "border-amber-200 bg-amber-50 text-amber-800";

interface DamageClassInfo {
  label: string;
  chip: string;
}

/**
 * Texto completo de la clase de daño del snapshot y colores del chip,
 * reutilizando la paleta de `MOVE_CLASSES_ES` para no introducir tokens nuevos.
 */
const DAMAGE_CLASSES: Record<string, DamageClassInfo> = {
  fisica: { label: "Física", chip: MOVE_CLASSES_ES.fisico.chip },
  fisico: { label: "Física", chip: MOVE_CLASSES_ES.fisico.chip },
  physical: { label: "Física", chip: MOVE_CLASSES_ES.fisico.chip },
  especial: { label: "Especial", chip: MOVE_CLASSES_ES.especial.chip },
  special: { label: "Especial", chip: MOVE_CLASSES_ES.especial.chip },
  estado: { label: "Estado", chip: MOVE_CLASSES_ES.estado.chip },
  status: { label: "Estado", chip: MOVE_CLASSES_ES.estado.chip },
  mixta: { label: "Mixta", chip: MIXED_CHIP },
  mixed: { label: "Mixta", chip: MIXED_CHIP },
};

function damageClassInfo(damageClass: string): DamageClassInfo {
  const key = damageClass
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return DAMAGE_CLASSES[key] ?? { label: damageClass.trim() || "Mixta", chip: MIXED_CHIP };
}

interface Props {
  types: TypeMatrixType[];
}

/** Tarjetas rectangulares de tipo con Poké Ball propia y datos por tipo. */
export default function TypeCards({ types }: Props) {
  const [open, setOpen] = useState<{
    anchor: PopoverAnchor;
    type: TypeMatrixType;
  } | null>(null);
  const closeTimer = useRef<number | null>(null);

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(null), 180);
  };
  const showMoves = (
    event: MouseEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>,
    type: TypeMatrixType
  ) => {
    cancelClose();
    const rect = event.currentTarget.getBoundingClientRect();
    setOpen({
      type,
      anchor: {
        kind: "moves",
        typeSlug: type.slug,
        rect: {
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          width: rect.width,
        },
      },
    });
  };

  return (
    <section aria-label="Tarjetas de tipos">
      <ul className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-7 lg:grid-cols-4 lg:gap-x-6">
        {types.map((type) => {
          const badge = getTypeBadge(type.slug);
          const damageClass = damageClassInfo(type.damageClass);
          return (
            <li key={type.slug} className="w-full">
              <div className="group relative mx-auto w-full max-w-[205px]">
                {/* Halo del color del tipo: solo opacidad, sin layout. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-1 rounded-[26px] opacity-0 blur-md transition-opacity duration-200 group-hover:opacity-40 group-focus-within:opacity-40 motion-reduce:transition-none"
                  style={{ backgroundColor: badge.accent }}
                />
                <article
                  className={cn(
                    "relative flex flex-col overflow-hidden rounded-card border border-line shadow-soft glass-surface",
                    "transition-transform duration-200 ease-out hover:-translate-y-1 focus-within:-translate-y-1",
                    "motion-reduce:transform-none motion-reduce:transition-none"
                  )}
                >
                  {/* Cabecera: color canónico del tipo, nombre y clase completa. */}
                  <div
                    className="flex min-h-[46px] items-center justify-between gap-1.5 px-2.5 py-2 sm:min-h-[50px] sm:px-3"
                    style={{
                      backgroundColor: badge.badge,
                      backgroundImage:
                        "linear-gradient(115deg, rgba(255,255,255,0.22), rgba(255,255,255,0) 58%)",
                    }}
                  >
                    <h3
                      className="min-w-0 truncate text-[12px] font-black uppercase tracking-wide text-white sm:text-[13px]"
                      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.45)" }}
                    >
                      {type.name}
                    </h3>
                    <span
                      title={`Clase de daño: ${damageClass.label}`}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[8px] font-extrabold leading-none sm:px-2 sm:text-[9px]",
                        damageClass.chip
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="h-1 w-1 rounded-full bg-current opacity-70"
                      />
                      <span>{damageClass.label}</span>
                    </span>
                  </div>

                  {/* Cuerpo: patrón sutil del tipo y Poké Ball protagonista. */}
                  <div
                    className="relative flex h-[104px] items-center justify-center overflow-hidden sm:h-[118px]"
                    style={{
                      backgroundImage: `linear-gradient(160deg, ${badge.gradient[0]}, ${badge.gradient[1]})`,
                    }}
                  >
                    <TypeIcon
                      type={type.slug}
                      className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 opacity-[0.12] sm:h-28 sm:w-28"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 opacity-[0.14]"
                      style={{
                        backgroundImage: `radial-gradient(${badge.accent} 1px, transparent 1px)`,
                        backgroundSize: "13px 13px",
                      }}
                    />
                    <div
                      aria-hidden="true"
                      className="relative z-10 h-[84px] w-[84px] overflow-hidden rounded-full border-[4px] border-ink-900 bg-white shadow-soft sm:h-[94px] sm:w-[94px]"
                    >
                      <div
                        className="absolute inset-x-0 top-0 h-1/2"
                        style={{
                          backgroundColor: badge.badge,
                          backgroundImage:
                            "linear-gradient(145deg, rgba(255,255,255,0.34), rgba(255,255,255,0) 60%)",
                        }}
                      />
                      <div className="absolute inset-x-0 top-1/2 h-[9px] -translate-y-1/2 bg-ink-900" />
                      <span className="absolute left-1/2 top-1/2 grid h-[30px] w-[30px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-ink-900 bg-white sm:h-[34px] sm:w-[34px]">
                        <TypeIcon
                          type={type.slug}
                          className="h-[18px] w-[18px] sm:h-[21px] sm:w-[21px]"
                        />
                      </span>
                    </div>
                  </div>

                  {/* Franja crema: etiquetas completas, nunca siglas. */}
                  <div className="grid grid-cols-[1.18fr_1fr_1fr] items-center gap-1 border-t border-line bg-[#FFFDF7] px-1.5 py-2 sm:px-2.5 sm:py-2.5">
                    <div className="min-w-0 text-center">
                      <p className="text-[13px] font-black tabular-nums leading-none text-ink-900 sm:text-[15px]">
                        {ROMAN[type.generation - 1] ?? type.generation}
                      </p>
                      <p className="mt-1 whitespace-nowrap text-[8px] font-bold leading-none tracking-[-0.02em] text-ink-500 sm:mt-1.5 sm:text-[10px] sm:tracking-normal">
                        Generación
                      </p>
                    </div>
                    <div className="min-w-0 text-center">
                      <p className="text-[13px] font-black tabular-nums leading-none text-ink-900 sm:text-[15px]">
                        {formatNumber(type.pokemonCount, 0)}
                      </p>
                      <p className="mt-1 whitespace-nowrap text-[8px] font-bold leading-none tracking-[-0.02em] text-ink-500 sm:mt-1.5 sm:text-[10px] sm:tracking-normal">
                        Pokémon
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Ver movimientos de ${type.name}`}
                      onMouseEnter={(event) => showMoves(event, type)}
                      onMouseLeave={scheduleClose}
                      onFocus={(event) => showMoves(event, type)}
                      onBlur={scheduleClose}
                      onClick={(event) => showMoves(event, type)}
                      className={cn(
                        "focus-accent min-w-0 rounded-control",
                        "transition-opacity duration-150 hover:opacity-70 motion-reduce:transition-none"
                      )}
                    >
                      <p className="text-[13px] font-black tabular-nums leading-none text-ink-900 sm:text-[15px]">
                        {formatNumber(type.moveCount, 0)}
                      </p>
                      <p className="mt-1 whitespace-nowrap text-[8px] font-bold leading-none tracking-[-0.02em] text-ink-500 sm:mt-1.5 sm:text-[10px] sm:tracking-normal">
                        Ataques
                      </p>
                    </button>
                  </div>
                </article>
              </div>
            </li>
          );
        })}
      </ul>

      {open && (
        <MovesPopover
          anchor={open.anchor}
          type={open.type}
          onEnter={cancelClose}
          onLeave={() => {
            cancelClose();
            setOpen(null);
          }}
        />
      )}
    </section>
  );
}
