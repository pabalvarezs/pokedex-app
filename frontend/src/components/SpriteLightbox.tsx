import { useEffect, useId, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { createPortal } from "react-dom";
import { PokeballIcon } from "./favorites/icons";
import { X } from "lucide-react";

export interface SpriteItem {
  key: string;
  label: string;
  url: string;
}

interface SpriteLightboxProps {
  open: boolean;
  pokemonName: string;
  pokemonId: string;
  sprites: SpriteItem[];
  selected: SpriteItem | null;
  onSelect: (sprite: SpriteItem) => void;
  onClose: () => void;
}

/**
 * Sprites de 96×96 px dibujados pixel a pixel. Al ampliarlos conviene
 * "pixelated" para que se vean nítidos en lugar de borrosos.
 */
const PIXEL_SPRITE_KEYS = new Set([
  "front_default",
  "back_default",
  "front_shiny",
  "back_shiny",
]);

const TRANSITION_MS = 200;

export default function SpriteLightbox({
  open,
  pokemonName,
  pokemonId,
  sprites,
  selected,
  onSelect,
  onClose,
}: SpriteLightboxProps) {
  // Mantiene el modal montado durante la animación de cierre.
  const [mounted, setMounted] = useState(open);
  const [entered, setEntered] = useState(false);
  const [imageState, setImageState] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Apertura / cierre con transición
  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(frame);
    }

    setEntered(false);
    const timeout = window.setTimeout(() => setMounted(false), TRANSITION_MS + 40);
    return () => window.clearTimeout(timeout);
  }, [open]);

  // Bloqueo del scroll del fondo + foco inicial en el botón de cierre
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    previouslyFocused.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(
      () => closeButtonRef.current?.focus(),
      80
    );

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      previouslyFocused.current?.focus();
    };
  }, [open]);

  // Escape para cerrar y flechas para cambiar de vista
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      // Mantiene el foco dentro del modal mientras está abierto.
      if (event.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusables = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (event.shiftKey && (active === first || !dialog.contains(active))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
        return;
      }

      if (!selected || sprites.length < 2) return;
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

      event.preventDefault();
      const index = sprites.findIndex((sprite) => sprite.key === selected.key);
      if (index === -1) return;

      const delta = event.key === "ArrowRight" ? 1 : -1;
      onSelect(sprites[(index + delta + sprites.length) % sprites.length]);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, selected, sprites, onClose, onSelect]);

  // Al cambiar de vista se muestra el indicador de carga hasta que la nueva
  // imagen termina de descargarse (evita saltos de diseño).
  useEffect(() => {
    setImageState("loading");
  }, [selected?.url]);

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  if (!mounted || !selected) return null;

  const isPixelSprite = PIXEL_SPRITE_KEYS.has(selected.key);

  return createPortal(
    <div
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[linear-gradient(135deg,rgba(69,10,10,0.82),rgba(120,53,15,0.66),rgba(69,26,3,0.76))] p-2 backdrop-blur-md transition-opacity duration-200 motion-reduce:transition-none sm:p-6 ${
        entered ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`glass-surface glass-blur relative flex h-[94dvh] w-full max-w-[min(1180px,94vw)] flex-col overflow-hidden rounded-card border border-white/70 bg-surface shadow-ambient transition-all duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none sm:h-[88dvh] sm:max-h-[880px] ${
          entered
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.97] opacity-0"
        }`}
      >
        {/* Cabecera compacta */}
        <header
          className="relative flex shrink-0 items-start justify-between gap-3 overflow-hidden px-4 py-3 text-white sm:px-6 sm:py-4"
          style={{
            backgroundColor: "#991b1b",
            backgroundImage:
              "linear-gradient(100deg, #7f1d1d 0%, #991b1b 52%, #b91c1c 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
          }}
        >
          <PokeballIcon
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-12 h-44 w-44 text-white/10"
          />
          <div className="relative min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="rounded-full bg-amber-300 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-[0.14em] text-amber-950 ring-1 ring-inset ring-white/40">
                #{pokemonId}
              </span>
              <h2
                id={titleId}
                className="truncate text-lg font-extrabold capitalize leading-tight drop-shadow-sm sm:text-xl"
              >
                {pokemonName}
              </h2>
            </div>
            <p className="mt-1 flex items-center gap-1.5 truncate text-xs font-semibold text-red-50">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300"
              />
              <span className="truncate">{selected.label}</span>
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar vista ampliada"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white shadow-sm transition hover:bg-white hover:text-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        {/* Área principal: la imagen es la protagonista */}
        <div className="artwork-frame relative min-h-0 flex-1 overflow-hidden">
          <div className="absolute inset-0 p-2 sm:p-5">
            <img
              key={selected.url}
              src={selected.url}
              alt={`${pokemonName} — ${selected.label}`}
              draggable={false}
              decoding="async"
              onLoad={() => setImageState("ready")}
              onError={() => setImageState("error")}
              style={{
                imageRendering: isPixelSprite ? "pixelated" : "auto",
              }}
              className={`h-full w-full object-contain drop-shadow-[0_18px_30px_rgba(15,23,42,0.22)] transition-opacity duration-300 ${
                imageState === "ready" ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>

          {imageState !== "ready" && (
            <div
              aria-live="polite"
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/60 text-ink-500 backdrop-blur-[1px]"
            >
              {imageState === "loading" ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent"
                  />
                  <span className="text-xs font-bold uppercase tracking-[0.16em]">
                    Cargando ilustración…
                  </span>
                </>
              ) : (
                <>
                  <span aria-hidden="true" className="text-4xl">
                    🚫
                  </span>
                  <span className="text-sm font-bold text-ink-700">
                    No pudimos cargar esta vista
                  </span>
                  <span className="text-xs">Probá con otra miniatura.</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Selector de vistas alternativas */}
        <div className="glass-surface shrink-0 border-t border-line-soft px-3 py-2.5 sm:px-6 sm:py-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-500">
              Cambiar vista
            </p>
            <p className="hidden text-[11px] font-medium text-ink-500/80 sm:block">
              Usá ← → para navegar
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1.5 sm:flex-wrap sm:overflow-visible sm:pb-0">
            {sprites.map((sprite) => {
              const isActive = sprite.key === selected.key;

              return (
                <button
                  key={sprite.key}
                  type="button"
                  onClick={() => onSelect(sprite)}
                  aria-pressed={isActive}
                  title={sprite.label}
                  className={`group flex w-[72px] shrink-0 snap-start flex-col items-center gap-1 rounded-control border p-1.5 text-center transition motion-reduce:transform-none sm:w-[88px] ${
                    isActive
                      ? "border-red-500 bg-gradient-to-b from-red-50 to-amber-50 shadow-soft ring-2 ring-red-400/60"
                      : "border-line bg-slate-50 hover:border-red-200 hover:bg-red-50/70"
                  }`}
                >
                  <img
                    src={sprite.url}
                    alt=""
                    className="h-12 w-12 object-contain sm:h-14 sm:w-14"
                  />
                  <span
                    className={`line-clamp-2 block min-h-[26px] w-full text-[10px] font-bold leading-[1.3] ${
                      isActive
                        ? "text-red-600"
                        : "text-ink-500 group-hover:text-red-600"
                    }`}
                  >
                    {sprite.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
