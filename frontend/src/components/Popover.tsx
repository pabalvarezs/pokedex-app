import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "framer-motion";
import { motionTransitions } from "../lib/motion";

interface Props {
  /** Contenido del chip (disparador). */
  children: ReactNode;
  /** Contenido del panel flotante. */
  popover: ReactNode;
  /** Clases del chip, definidas por quien lo usa. */
  chipClassName: string;
  /** Estilo inline del chip (por ejemplo, el color del tipo). */
  chipStyle?: CSSProperties;
  /** Ancho deseado del panel; se limita al viewport en móvil. */
  width?: number;
}

const VIEWPORT_MARGIN = 16;

/**
 * Chip con popover accesible. Muestra el panel al pasar el ratón o al enfocar
 * el botón con el teclado (Escape lo cierra). El portal evita que el
 * `overflow-hidden` de la tarjeta de la ficha recorte el contenido.
 */
export default function Popover({ children, popover, chipClassName, chipStyle, width = 288 }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();

  useLayoutEffect(() => {
    if (!isOpen || !anchorRef.current) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      const panelWidth = Math.min(width, window.innerWidth - VIEWPORT_MARGIN * 2);
      const centered = rect.left + rect.width / 2 - panelWidth / 2;
      const left = Math.min(
        Math.max(VIEWPORT_MARGIN, centered),
        window.innerWidth - panelWidth - VIEWPORT_MARGIN
      );
      setPosition({ top: rect.top - 8, left, width: panelWidth });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, width]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape") setIsOpen(false);
  };

  return (
    <div ref={anchorRef} className="relative inline-flex">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-describedby={isOpen ? tooltipId : undefined}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onKeyDown={handleKeyDown}
        className={chipClassName}
        style={chipStyle}
      >
        {children}
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && position && (
            <m.div
              key="info-popover"
              id={tooltipId}
              role="tooltip"
              style={{ position: "fixed", top: position.top, left: position.left, width: position.width }}
              initial={{ opacity: 0, scale: 0.94, y: "-100%" }}
              animate={{ opacity: 1, scale: 1, y: "-100%", transition: motionTransitions.enter }}
              exit={{ opacity: 0, scale: 0.96, y: "-100%", transition: motionTransitions.exit }}
              className="pointer-events-none z-50 overflow-hidden rounded-control border border-line bg-white text-left shadow-lift"
            >
              {popover}
            </m.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
