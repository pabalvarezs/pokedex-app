import { useEffect, useRef, useState } from "react";

const DEFAULT_DURATION = 600;

/**
 * Cuenta animada desde 0 hasta `value` con easing ease-out.
 * Respeta `prefers-reduced-motion`: en ese caso muestra el número final
 * sin animación.
 */
export function useCountUp(value: number, duration = DEFAULT_DURATION): number {
  const [display, setDisplay] = useState(0);
  const current = useRef(0);

  useEffect(() => {
    if (duration <= 0 || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      current.current = value;
      setDisplay(value);
      return;
    }

    const from = current.current;
    const delta = value - from;
    if (delta === 0) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const started = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - started) / duration, 1);
      // ease-out cúbico
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(from + delta * eased);
      current.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return display;
}
