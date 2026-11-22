import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { m } from "framer-motion";
import { useReducedMotionSafe } from "../../hooks/useReducedMotionSafe";
import { motionDurations, motionEasings } from "../../lib/motion";

interface RouteTransitionProps {
  children: ReactNode;
}

/**
 * Envuelve el contenido de `<main>` y aplica un fade + desplazamiento leve al
 * entrar en cada ruta. La `key` del `m.div` fuerza el remontaje por ruta.
 *
 * No se usa `AnimatePresence`: su modo `wait` puede dejar el hijo saliente
 * montado para siempre cuando la ruta cambia justo al terminar el `exit`
 * (issue #3803 de Motion), y la página se queda en blanco.
 */
export default function RouteTransition({ children }: RouteTransitionProps) {
  const location = useLocation();
  const reduceMotion = useReducedMotionSafe();

  return (
    <m.div
      key={location.pathname}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : motionDurations.base,
        ease: motionEasings.easeOut,
      }}
      className="min-h-[60vh]"
    >
      {children}
    </m.div>
  );
}
