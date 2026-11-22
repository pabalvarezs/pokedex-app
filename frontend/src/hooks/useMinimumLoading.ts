import { useEffect, useRef, useState } from "react";

/**
 * Mantiene visible el estado de carga al menos `minimumMs` para que la
 * transición no parpadee cuando la respuesta llega muy rápido, sin aburrir
 * al usuario cuando tarda: el tiempo extra se descuenta del tiempo real.
 */
export function useMinimumLoading(isLoading: boolean, minimumMs = 650): boolean {
  const [visible, setVisible] = useState(isLoading);
  const startedAt = useRef(0);

  useEffect(() => {
    if (isLoading) {
      startedAt.current = Date.now();
      setVisible(true);
      return;
    }

    const elapsed = startedAt.current ? Date.now() - startedAt.current : minimumMs;
    const remaining = Math.max(0, minimumMs - elapsed);
    if (remaining === 0) {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setVisible(false), remaining);
    return () => window.clearTimeout(timer);
  }, [isLoading, minimumMs]);

  return visible;
}
