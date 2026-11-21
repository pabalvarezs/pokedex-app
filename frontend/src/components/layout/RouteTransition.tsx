import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { m, AnimatePresence } from "framer-motion";
import { useReducedMotionSafe } from "../../hooks/useReducedMotionSafe";
import { motionDurations, motionEasings } from "../../lib/motion";

interface RouteTransitionProps {
  children: ReactNode;
}

/**
 * Envuelve el contenido de `<main>` y aplica un fade + desplazamiento leve al
 * cambiar de ruta. `mode="wait"` evita solapar páginas y el ancla del scroll
 * permanece estable porque solo se animan opacidad y transform.
 */
export default function RouteTransition({ children }: RouteTransitionProps) {
  const location = useLocation();
  const reduceMotion = useReducedMotionSafe();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={location.pathname}
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
        transition={{
          duration: reduceMotion ? 0 : motionDurations.base,
          ease: motionEasings.easeOut,
        }}
        className="min-h-[60vh]"
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}
