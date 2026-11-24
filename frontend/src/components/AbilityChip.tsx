import { useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "framer-motion";
import { getAbilityDescription, getOutOfBattleEffects } from "../utils/abilities";
import { motionTransitions } from "../lib/motion";

interface Props {
  /** Nombre en español que envía el backend. */
  name: string;
  /** Slug inglés de PokéAPI (campo aditivo). Tiene prioridad en la búsqueda. */
  slug?: string;
  isHidden: boolean;
}

/** Ancho del popover, limitado al viewport para no desbordar en móvil. */
const POPOVER_WIDTH = 288;
const VIEWPORT_MARGIN = 16;

/**
 * Chip de habilidad con popover informativo. Mantiene el aspecto original de
 * la ficha y muestra la descripción en español al pasar el ratón o al enfocar
 * el chip con el teclado. El portal evita que `overflow-hidden` de la tarjeta
 * recorte el popover.
 */
export default function AbilityChip({ name, slug, isHidden }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();
  const description = getAbilityDescription(slug ?? name);
  const outOfBattle = getOutOfBattleEffects(slug ?? name);

  useLayoutEffect(() => {
    if (!isOpen || !chipRef.current) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      const rect = chipRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(POPOVER_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);
      const centered = rect.left + rect.width / 2 - width / 2;
      const left = Math.min(
        Math.max(VIEWPORT_MARGIN, centered),
        window.innerWidth - width - VIEWPORT_MARGIN
      );
      setPosition({ top: rect.top - 8, left, width });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  return (
    <div ref={chipRef} className="relative inline-flex">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-describedby={isOpen ? tooltipId : undefined}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setIsOpen(false);
        }}
        className={`flex cursor-help items-center gap-1.5 rounded-control border px-3 py-1.5 text-xs font-bold capitalize transition duration-150 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1 motion-reduce:transition-none ${
          isHidden
            ? "bg-purple-50 text-purple-800 border-purple-200"
            : "bg-gray-100 text-gray-800 border-gray-200"
        }`}
      >
        <span>{name}</span>
        {isHidden && (
          <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded font-black">
            Escondía
          </span>
        )}
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && position && (
            <m.div
              key="ability-popover"
              id={tooltipId}
              role="tooltip"
              style={{ position: "fixed", top: position.top, left: position.left, width: position.width }}
              initial={{ opacity: 0, scale: 0.94, y: "-100%" }}
              animate={{ opacity: 1, scale: 1, y: "-100%", transition: motionTransitions.enter }}
              exit={{ opacity: 0, scale: 0.96, y: "-100%", transition: motionTransitions.exit }}
              className="pointer-events-none z-50 rounded-control border border-line bg-surface p-3 text-left shadow-lift"
            >
              <p className="mb-1 text-xs font-extrabold capitalize text-ink-900">{name}</p>
              <p className="text-[11px] font-medium leading-relaxed text-ink-700">
                {description ?? "Descripción no disponible."}
              </p>
              {outOfBattle.length > 0 && (
                <div className="mt-2 border-t border-line pt-2">
                  <p className="mb-1 text-[9px] font-black uppercase tracking-wide text-purple-700">
                    Fuera de combate
                  </p>
                  <ul className="space-y-1">
                    {outOfBattle.map((effect) => (
                      <li key={effect} className="text-[10px] font-medium leading-snug text-ink-700">
                        • {effect}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="mt-2 text-[9px] font-semibold uppercase tracking-wide text-ink-500">
                Fuente: WikiDex
              </p>
            </m.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
