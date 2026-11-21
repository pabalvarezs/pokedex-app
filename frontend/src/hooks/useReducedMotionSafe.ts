import { useReducedMotion } from "framer-motion";

/**
 * Devuelve siempre un booleano (el hook de framer-motion puede devolver null)
 * para desactivar por JS las animaciones que no controla MotionConfig:
 * count-up, gráficos y desplazamientos de scroll.
 */
export function useReducedMotionSafe(): boolean {
  return useReducedMotion() ?? false;
}
