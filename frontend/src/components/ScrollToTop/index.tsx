import { useEffect, useState, useCallback, useRef } from "react";

import "./scroll-top.css";

/**
 * ScrollToTop
 * -----------
 * Botón flotante con forma de PokéBall que aparece tras un scroll
 * considerable (default: 300 px) y vuelve al inicio con scroll suave.
 *
 * - visible solo después de SCROLL_THRESHOLD px de scroll vertical
 * - responsive: en móviles se ajusta para no chocar con barras del navegador
 * - no interfiere con el header (z-30): usa z-index 1000
 * - scroll suave nativo al hacer clic
 * - accesible: aria-label, type="button", focus-visible, prefers-reduced-motion
 */
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number | null>(null);

  // Umbral de aparición: cambiar este valor para mostrar antes/después
  const SCROLL_THRESHOLD = 300;

  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      const y =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      setVisible(y > SCROLL_THRESHOLD);
      rafRef.current = null;
    });
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    // Comprueba en montaje (recarga de página a mitad de contenido)
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <button
      type="button"
      className={`scroll-top ${visible ? "is-visible" : ""}`}
      onClick={scrollToTop}
      aria-label="Volver arriba"
      title="Volver arriba"
    />
  );
}
