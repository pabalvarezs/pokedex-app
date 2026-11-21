import type { ReactNode } from "react";
import { AnimatePresence, m } from "framer-motion";
import type { Variants } from "framer-motion";
import { useReducedMotionSafe } from "../../../hooks/useReducedMotionSafe";
import { motionDurations, motionEasings } from "../../../lib/motion";

/** Máximo de elementos que se animan al entrar/salir; el resto aparece directo. */
const MAX_ANIMATED = 12;

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionDurations.base, ease: motionEasings.easeOut },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: motionDurations.fast, ease: motionEasings.easeIn },
  },
};

interface AnimatedListProps<T> {
  items: T[];
  getKey: (item: T) => string | number;
  children: (item: T) => ReactNode;
  maxAnimated?: number;
}

/**
 * Lista con entrada/salida animada y reacomodación suave mediante `layout`.
 * Solo anima los primeros `maxAnimated` elementos para no saturar el hilo
 * principal; el resto se renderiza como `div` sin movimiento.
 * No usar dentro de `<tbody>`: las filas ya son `<tr>` y se anidarían.
 */
export default function AnimatedList<T>({
  items,
  getKey,
  children,
  maxAnimated = MAX_ANIMATED,
}: AnimatedListProps<T>) {
  const reduceMotion = useReducedMotionSafe();

  return (
    <AnimatePresence initial={false} mode="sync">
      {items.map((item, index) => {
        const key = getKey(item);
        if (reduceMotion || index >= maxAnimated) {
          return <div key={key}>{children(item)}</div>;
        }
        return (
          <m.div
            key={key}
            layout="position"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {children(item)}
          </m.div>
        );
      })}
    </AnimatePresence>
  );
}
