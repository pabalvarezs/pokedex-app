import type { Transition, Variants } from "framer-motion";

/** Duraciones compartidas por todo el sistema de movimiento (segundos). */
export const motionDurations = {
  fast: 0.15,
  base: 0.2,
  slow: 0.35,
} as const;

/** Curvas cúbicas: salida para entradas, entrada para salidas. */
export const motionEasings: Record<"easeOut" | "easeIn", [number, number, number, number]> = {
  easeOut: [0.22, 0.61, 0.36, 1],
  easeIn: [0.55, 0.06, 0.68, 0.19],
};

/** Resorte suave para elementos interactivos. */
export const motionSpring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 28,
};

export const motionTransitions: Record<"enter" | "exit", Transition> = {
  enter: { duration: motionDurations.base, ease: motionEasings.easeOut },
  exit: { duration: motionDurations.fast, ease: motionEasings.easeIn },
};

/** Paso del escalonado de listas: 60 ms por elemento. */
export const STAGGER_STEP = 0.06;

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: motionTransitions.enter },
  exit: { opacity: 0, transition: motionTransitions.exit },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: motionTransitions.enter },
  exit: { opacity: 0, y: -8, transition: motionTransitions.exit },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: motionSpring },
  exit: { opacity: 0, scale: 0.96, transition: motionTransitions.exit },
};

/** Panel lateral: entra desde la derecha. */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: motionSpring },
  exit: { opacity: 0, x: 24, transition: motionTransitions.exit },
};

/** Bottom sheet: entra desde abajo. */
export const slideInUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: motionSpring },
  exit: { opacity: 0, y: 32, transition: motionTransitions.exit },
};

/** Contenedor que escalonaba sus hijos directos con `variants`. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER_STEP } },
};

export const motionTokens = {
  durations: motionDurations,
  easings: motionEasings,
  transitions: motionTransitions,
  spring: motionSpring,
  staggerStep: STAGGER_STEP,
};
