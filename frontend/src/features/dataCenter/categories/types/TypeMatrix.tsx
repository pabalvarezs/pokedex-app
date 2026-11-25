import { useRef, useState, type FocusEvent, type MouseEvent } from "react";
import TypeIcon from "../../../../components/TypeIcon";
import { cn } from "../../../admin/lib/cn";
import type { TypeMatrixResponse } from "../../lib/types";
import TypePopover, { type PopoverAnchor } from "./TypePopover";
import { cellClassName } from "./lib/typeMatrix";

interface Props {
  data: TypeMatrixResponse;
}

type AnchorPayload = Omit<PopoverAnchor, "rect">;

/** Matriz 18×18: filas = tipo de ataque, columnas = tipo del oponente. */
export default function TypeMatrix({ data }: Props) {
  const { types, matrix } = data;
  const [anchor, setAnchor] = useState<PopoverAnchor | null>(null);
  const [hover, setHover] = useState<{ row: number; col: number } | null>(null);
  const [pinnedRow, setPinnedRow] = useState<number | null>(null);
  const [pinnedCol, setPinnedCol] = useState<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setAnchor(null), 180);
  };

  const open = (
    event: MouseEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>,
    payload: AnchorPayload
  ) => {
    cancelClose();
    const rect = event.currentTarget.getBoundingClientRect();
    setAnchor({
      ...payload,
      rect: {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width,
      },
    });
  };

  const activeRow = hover?.row ?? pinnedRow;
  const activeCol = hover?.col ?? pinnedCol;
  const hasFocus = activeRow !== null || activeCol !== null;

  const headerCell = (row: number | null, col: number | null) =>
    cn(
      "focus-accent flex h-full w-full items-center justify-center gap-1 rounded-lg px-1 py-1.5 transition duration-150 outline-none",
      (row !== null && row === activeRow) || (col !== null && col === activeCol)
        ? "bg-red-600 text-white shadow-soft"
        : "text-ink-700 hover:bg-red-50"
    );

  // Las cabeceras de columna rotulan en diagonal: el icono sigue arriba y el
  // nombre completo se lee inclinado, sin importar lo largo que sea.
  const columnHeaderCell = (active: boolean) =>
    cn(
      "focus-accent relative block h-full w-full rounded-lg transition duration-150 outline-none",
      active ? "bg-red-600 text-white shadow-soft" : "text-ink-700 hover:bg-red-50"
    );

  return (
    <>
      <div className="glass-surface overflow-auto rounded-card border border-line shadow-card">
        <table className="w-min min-w-full border-separate border-spacing-0 text-center">
          <caption className="sr-only">
            Matriz de efectividad de tipos desde la sexta generación. Filas: tipo del
            movimiento. Columnas: tipo del Pokémon oponente.
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 top-0 z-30 w-[66px] min-w-[66px] border-b border-r border-line bg-white/95 p-1 text-center text-[9px] font-extrabold uppercase leading-tight tracking-wide text-ink-500 backdrop-blur sm:w-[104px] sm:min-w-[104px] sm:text-[10px]"
              >
                Ataque ↓
                <span className="mt-0.5 block font-medium normal-case tracking-normal">
                  Defensa →
                </span>
              </th>
              {types.map((defender, col) => (
                <th
                  key={defender.slug}
                  scope="col"
                  className="sticky top-0 z-20 h-[82px] w-9 min-w-9 border-b border-line bg-white/95 p-0.5 backdrop-blur sm:h-[96px] sm:w-11 sm:min-w-11"
                >
                  <button
                    type="button"
                    aria-label={`Tipo defensor ${defender.name}`}
                    className={columnHeaderCell(col === activeCol)}
                    onMouseEnter={(event) =>
                      open(event, { kind: "type", typeSlug: defender.slug })
                    }
                    onMouseLeave={scheduleClose}
                    onFocus={(event) =>
                      open(event, { kind: "type", typeSlug: defender.slug })
                    }
                    onBlur={scheduleClose}
                    onClick={() =>
                      setPinnedCol((previous) => (previous === col ? null : col))
                    }
                  >
                    <TypeIcon
                      type={defender.slug}
                      className="absolute left-1/2 top-1 h-6 w-6 -translate-x-1/2 sm:top-1.5 sm:h-7 sm:w-7"
                    />
                    <span className="absolute left-1/2 top-[52px] -translate-x-1/2 -translate-y-1/2 -rotate-[55deg] whitespace-nowrap text-[9px] font-black leading-none sm:top-[60px] sm:text-[10px]">
                      {defender.name}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {types.map((attacker, row) => (
              <tr key={attacker.slug}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-b border-r border-line bg-white/95 p-0.5 backdrop-blur"
                >
                  <button
                    type="button"
                    aria-label={`Tipo de ataque ${attacker.name}`}
                    className={cn(headerCell(row, null), "justify-start")}
                    onMouseEnter={(event) =>
                      open(event, { kind: "type", typeSlug: attacker.slug })
                    }
                    onMouseLeave={scheduleClose}
                    onFocus={(event) =>
                      open(event, { kind: "type", typeSlug: attacker.slug })
                    }
                    onBlur={scheduleClose}
                    onClick={() =>
                      setPinnedRow((previous) => (previous === row ? null : row))
                    }
                  >
                    <TypeIcon type={attacker.slug} className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" />
                    <span className="hidden truncate text-[10px] font-black sm:block">
                      {attacker.name}
                    </span>
                  </button>
                </th>
                {types.map((defender, col) => {
                  const value = matrix[row][col];
                  const highlighted = row === activeRow || col === activeCol;
                  return (
                    <td key={defender.slug} className="border-b border-line-soft p-0.5">
                      <button
                        type="button"
                        aria-label={`${attacker.name} contra ${defender.name}: ${value === 1 ? "daño neutro" : value === 0.5 ? "poco eficaz" : value === 0 ? "sin efecto" : "súper eficaz"}`}
                        className={cn(
                          cellClassName(value, highlighted),
                          hasFocus && !highlighted && "opacity-35"
                        )}
                        onMouseEnter={(event) => {
                          setHover({ row, col });
                          open(event, {
                            kind: "cell",
                            attackerSlug: attacker.slug,
                            defenderSlug: defender.slug,
                            value,
                          });
                        }}
                        onMouseLeave={() => {
                          setHover(null);
                          scheduleClose();
                        }}
                        onFocus={(event) =>
                          open(event, {
                            kind: "cell",
                            attackerSlug: attacker.slug,
                            defenderSlug: defender.slug,
                            value,
                          })
                        }
                        onBlur={scheduleClose}
                        onClick={(event) =>
                          open(event, {
                            kind: "cell",
                            attackerSlug: attacker.slug,
                            defenderSlug: defender.slug,
                            value,
                          })
                        }
                      >
                        {value === 2 ? "×2" : value === 1 ? "×1" : value === 0.5 ? "½" : "×0"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {anchor && (
        <TypePopover
          anchor={anchor}
          types={types}
          onEnter={cancelClose}
          onLeave={() => {
            cancelClose();
            setAnchor(null);
          }}
        />
      )}
    </>
  );
}
