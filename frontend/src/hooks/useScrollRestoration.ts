import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Posiciones de scroll de la sesión, guardadas en memoria y asociadas a la
 * clave de la entrada del historial (`location.key`). Se mantienen fuera del
 * componente para sobrevivir al desmontaje al navegar a otra ruta.
 */
const positions = new Map<string, number>();

/**
 * Conserva el desplazamiento vertical de una página al volver a su entrada del
 * historial: tanto con el botón "Volver" (`navigate(-1)`) como con el botón
 * atrás/adelante del navegador.
 *
 * Guarda la posición mientras se hace scroll y la reaplica al regresar. Como el
 * contenido puede tardar en recuperar su altura (por ejemplo, una lista
 * paginada que se vuelve a cargar), reintenta hasta que el documento alcance la
 * posición guardada o se agote un margen corto de tiempo.
 */
export default function useScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const key = location.key;
  const frame = useRef<number | null>(null);

  // Guarda la posición actual al salir y mientras se hace scroll.
  useEffect(() => {
    const save = () => positions.set(key, Math.max(0, window.scrollY));

    const onScroll = () => {
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        save();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }
      // Se ejecuta justo antes de desmontar al navegar a la ficha.
      save();
    };
  }, [key]);

  // Restaura la posición solo al retroceder/avanzar en el historial; una
  // navegación nueva (clic en un enlace) parte desde arriba.
  useEffect(() => {
    if (navigationType !== "POP") return;

    const target = positions.get(key);
    if (target === undefined || target <= 0) return;

    const deadline = performance.now() + 2000;
    let raf = 0;

    const restore = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const reached = maxScroll >= target - 2;

      if (reached || performance.now() >= deadline) {
        window.scrollTo(0, Math.min(target, Math.max(maxScroll, 0)));
        return;
      }

      raf = requestAnimationFrame(restore);
    };

    raf = requestAnimationFrame(restore);

    return () => cancelAnimationFrame(raf);
  }, [key, navigationType]);
}
