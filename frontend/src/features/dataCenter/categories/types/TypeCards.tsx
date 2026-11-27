import { useRef, useState, type FocusEvent, type MouseEvent } from "react";
import { cn } from "../../../admin/lib/cn";
import TypeIcon from "../../../../components/TypeIcon";
import { getTypeBadge } from "../../../../utils/pokemon";
import { formatNumber } from "../../lib/format";
import type { TypeMatrixType } from "../../lib/types";
import type { PopoverAnchor } from "./FloatingPanel";
import MovesPopover from "./MovesPopover";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

/** Clases de daño del snapshot, con la micro-etiqueta de la franja oscura. */
const DAMAGE_CLASSES: Record<string, { short: string; full: string }> = {
  fisica: { short: "FÍS", full: "Física" },
  fisico: { short: "FÍS", full: "Física" },
  physical: { short: "FÍS", full: "Física" },
  especial: { short: "ESP", full: "Especial" },
  special: { short: "ESP", full: "Especial" },
  estado: { short: "EST", full: "Estado" },
  status: { short: "EST", full: "Estado" },
  mixta: { short: "MIX", full: "Mixta" },
  mixed: { short: "MIX", full: "Mixta" },
};

function damageClassInfo(damageClass: string): { short: string; full: string } {
  const key = damageClass
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return DAMAGE_CLASSES[key] ?? { short: "MIX", full: damageClass || "Mixta" };
}

interface Props {
  types: TypeMatrixType[];
}

/** Tarjetas de tipo: Poké Balls circulares que alimentan la matriz de efectividad. */
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
      <ul className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6 lg:grid-cols-4">
        {types.map((type) => {
          const badge = getTypeBadge(type.slug);
          const damageClass = damageClassInfo(type.damageClass);
          return (
            <li key={type.slug} className="w-full">
              <article
                className={cn(
                  "group relative mx-auto aspect-square w-full max-w-[150px] rounded-full sm:max-w-[180px]",
                  "transition-transform duration-200 ease-out hover:-translate-y-1 focus-within:-translate-y-1",
                  "motion-reduce:transform-none motion-reduce:transition-none"
                )}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-full opacity-0 blur-lg transition-opacity duration-200 group-hover:opacity-40 group-focus-within:opacity-40 motion-reduce:transition-none"
                  style={{ backgroundColor: badge.accent }}
                />
                <div className="absolute inset-0 rounded-full bg-ink-900 p-[5px] shadow-soft sm:p-[6px]">
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-white">
                    {/* Mitad superior: color canónico del tipo con un brillo sutil. */}
                    <div
                      className="absolute inset-x-0 top-0 h-1/2"
                      style={{
                        backgroundColor: badge.badge,
                        backgroundImage:
                          "linear-gradient(150deg, rgba(255,255,255,0.32), rgba(255,255,255,0) 62%)",
                      }}
                    >
                      <h3
                        className="absolute inset-x-1 top-[13%] truncate text-center text-[11px] font-black uppercase tracking-wide text-white sm:text-xs"
                        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.55)" }}
                      >
                        {type.name}
                      </h3>
                    </div>

                    {/* Franja divisoria oscura con la clase de daño a la derecha. */}
                    <div className="absolute inset-x-0 top-1/2 h-[9%] -translate-y-1/2 bg-ink-900">
                      <span
                        title={damageClass.full}
                        aria-label={damageClass.full}
                        className="absolute right-[6px] top-1/2 -translate-y-1/2 text-[9px] font-black uppercase leading-none tracking-tight text-white"
                      >
                        <span aria-hidden="true">{damageClass.short}</span>
                        <span className="sr-only">{damageClass.full}</span>
                      </span>
                    </div>

                    {/* Botón central blanco: el icono del tipo es el protagonista. */}
                    <span className="absolute left-1/2 top-1/2 z-10 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-ink-900 bg-white shadow-soft sm:h-[58px] sm:w-[58px]">
                      <TypeIcon type={type.slug} className="h-8 w-8 sm:h-10 sm:w-10" />
                    </span>

                    {/* Mitad blanca: generación, Pokémon y ataques (abre el popover). */}
                    <div className="absolute inset-x-[6%] bottom-[5%] grid grid-cols-3 items-end gap-0.5 text-center">
                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-black tabular-nums leading-tight text-ink-900 sm:text-xs">
                          {ROMAN[type.generation - 1] ?? type.generation}
                        </p>
                        <p className="truncate text-[7px] font-bold uppercase leading-tight tracking-tight text-ink-500 sm:text-[8px]">
                          Generación
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-black tabular-nums leading-tight text-ink-900 sm:text-xs">
                          {formatNumber(type.pokemonCount, 0)}
                        </p>
                        <p className="truncate text-[7px] font-bold uppercase leading-tight tracking-tight text-ink-500 sm:text-[8px]">
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
                        <p className="truncate text-[10px] font-black tabular-nums leading-tight text-ink-900 sm:text-xs">
                          {formatNumber(type.moveCount, 0)}
                        </p>
                        <p className="truncate text-[7px] font-bold uppercase leading-tight tracking-tight text-ink-500 sm:text-[8px]">
                          Ataques
                        </p>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
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
