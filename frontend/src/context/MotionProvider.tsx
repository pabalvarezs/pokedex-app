import type { ReactNode } from "react";
import { domAnimation, LazyMotion, MotionConfig } from "framer-motion";

interface MotionProviderProps {
  children: ReactNode;
}

/**
 * Proveedor raíz de movimiento: carga solo las funciones DOM básicas y
 * centraliza la preferencia de movimiento reducido. Los componentes deben
 * usar `m.*` en lugar de `motion.*` (modo estricto).
 */
export default function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
