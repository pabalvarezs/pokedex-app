import { useRef, useState, type FocusEvent, type MouseEvent } from "react";
import TypeIcon from "../../../../components/TypeIcon";
import { getTypeBadge } from "../../../../utils/pokemon";
import { formatNumber } from "../../lib/format";
import type { TypeMatrixType } from "../../lib/types";
import type { PopoverAnchor } from "./FloatingPanel";
import MovesPopover from "./MovesPopover";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

interface Props {
  types: TypeMatrixType[];
}

/** Tarjetas de tipo: vista rápida que alimenta la matriz de efectividad. */
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
      <ul className="grid grid-cols-2 justify-items-center gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {types.map((type) => {
          const badge = getTypeBadge(type.slug);
          return (
            <li key={type.slug} className="w-full max-w-[210px]">
              <article
                className="glass-surface overflow-hidden rounded-card border shadow-soft"
                style={{ borderColor: `${badge.accent}55` }}
              >
                <div
                  className="relative h-16 overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${badge.gradient[0]}, ${badge.gradient[1]})`,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="absolute -left-4 -top-8 h-20 w-20 rounded-full bg-white/25 blur-md"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute left-10 -top-4 h-14 w-14 rounded-full bg-white/20 blur-sm"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute right-4 -bottom-6 h-16 w-16 rounded-full bg-white/20 blur-md"
                  />
                </div>
                <div className="relative -mt-8 flex flex-col items-center px-3 pb-2">
                  <span
                    className="grid h-16 w-16 place-items-center rounded-full border-4 border-white shadow-ambient"
                    style={{ backgroundColor: badge.badge }}
                  >
                    <TypeIcon type={type.slug} className="h-12 w-12" />
                  </span>
                  <h3 className="mt-2 text-sm font-black text-ink-900">
                    {type.name}
                  </h3>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-ink-500">
                    Tipo
                  </p>
                </div>
                <div className="grid grid-cols-3 divide-x divide-line-soft border-t border-line-soft py-2 text-center">
                  <div>
                    <p className="text-xs font-black tabular-nums text-ink-900">
                      {ROMAN[type.generation - 1] ?? type.generation}
                    </p>
                    <p className="text-[8px] font-bold uppercase text-ink-500">
                      Generación
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
                    className="focus-accent rounded-control transition hover:bg-red-50 focus-visible:outline-none"
                  >
                    <p className="text-xs font-black tabular-nums text-red-700">
                      {formatNumber(type.moveCount, 0)}
                    </p>
                    <p className="text-[8px] font-bold uppercase text-ink-500">
                      Movimientos
                    </p>
                  </button>
                  <div>
                    <p className="text-[10px] font-black text-ink-900">
                      {type.damageClass}
                    </p>
                    <p className="text-[8px] font-bold uppercase text-ink-500">
                      Clase
                    </p>
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
