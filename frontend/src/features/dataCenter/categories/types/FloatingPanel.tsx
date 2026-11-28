import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { m } from "framer-motion";
import { fadeUp } from "../../../../lib/motion";

export interface PopoverAnchor {
  rect: { top: number; bottom: number; left: number; width: number };
  kind: "type" | "cell" | "moves";
  typeSlug?: string;
  attackerSlug?: string;
  defenderSlug?: string;
  value?: number;
}

interface Props {
  anchor: PopoverAnchor;
  label: string;
  estimatedHeight?: number;
  width?: number;
  onEnter: () => void;
  onLeave: () => void;
  children: ReactNode;
}

/**
 * Panel flotante compartido por los popovers de la matriz y de las tarjetas.
 * El positionado vive en un wrapper porque Framer Motion controla el transform
 * del panel animado y sobrescribiría cualquier transform que pusiéramos ahí.
 */
export default function FloatingPanel({
  anchor,
  label,
  estimatedHeight = 220,
  width = 304,
  onEnter,
  onLeave,
  children,
}: Props) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onLeave();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onLeave]);

  // En pantallas estrechas el panel se reduce para no salirse del viewport.
  const panelWidth = Math.min(width, Math.max(0, window.innerWidth - 16));
  const left = Math.min(
    Math.max(8, anchor.rect.left + anchor.rect.width / 2 - panelWidth / 2),
    Math.max(8, window.innerWidth - panelWidth - 8)
  );
  const spaceAbove = anchor.rect.top - 18;
  const spaceBelow = window.innerHeight - anchor.rect.bottom - 18;
  const preferAbove = spaceAbove >= estimatedHeight || spaceAbove > spaceBelow;

  let top = preferAbove
    ? anchor.rect.top - 10 - estimatedHeight
    : anchor.rect.bottom + 10;
  if (top < 8) {
    const below = anchor.rect.bottom + 10;
    top = below + estimatedHeight <= window.innerHeight - 8 ? below : 8;
  }
  top = Math.min(top, Math.max(8, window.innerHeight - 8 - estimatedHeight));

  return createPortal(
    <div className="pointer-events-none fixed z-50" style={{ left, width: panelWidth, top }}>
      <m.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        role="dialog"
        aria-label={label}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className="glass-surface glass-blur pointer-events-auto w-full rounded-card border border-line p-4 shadow-card"
      >
        {children}
      </m.div>
    </div>,
    document.body
  );
}
