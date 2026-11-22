import type { ReactNode } from "react";
import { LazyMotion } from "framer-motion";

const loadFeatures = () => import("../lib/motionFeatures").then((mod) => mod.default);

interface LayoutMotionProviderProps {
  children: ReactNode;
}

/**
 * Habilita `layout` y `layoutId` en el subárbol, cargando `domMax` en un chunk
 * aparte. Se usa en zonas con píldoras deslizantes o listas que se reacomodan.
 */
export default function LayoutMotionProvider({ children }: LayoutMotionProviderProps) {
  return <LazyMotion features={loadFeatures}>{children}</LazyMotion>;
}
