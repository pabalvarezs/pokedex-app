import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useDialogBehavior } from "../hooks/useDialogBehavior";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const EXIT_MS = 200;

/** Indica si el panel se muestra como drawer lateral (desktop) o bottom sheet. */
function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 640px)").matches
  );

  useEffect(() => {
    const query = window.matchMedia("(min-width: 640px)");
    const update = () => setIsDesktop(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

/** Bottom sheet en móvil y drawer lateral en desktop. */
export default function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: Props) {
  const titleId = useId();
  const subtitleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();
  const [mounted, setMounted] = useState(open);
  const [entered, setEntered] = useState(false);
  useDialogBehavior(open, onClose, panelRef);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(frame);
    }
    setEntered(false);
    const timeout = window.setTimeout(() => setMounted(false), EXIT_MS + 40);
    return () => window.clearTimeout(timeout);
  }, [open]);

  if (!open && !mounted) return null;

  const hiddenTransform = isDesktop ? "translate-x-6" : "translate-y-8";

  return createPortal(
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-200 motion-reduce:transition-none ${
        entered ? "opacity-100" : "opacity-0"
      }`}
      data-admin-accent
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? subtitleId : undefined}
        tabIndex={-1}
        className={`absolute inset-x-0 bottom-0 flex max-h-[92vh] flex-col overflow-hidden rounded-t-card bg-white shadow-lift outline-none transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:transition-none sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:max-h-none sm:w-full sm:max-w-lg sm:rounded-none sm:rounded-l-card ${
          entered
            ? "translate-x-0 translate-y-0 scale-100 opacity-100"
            : `${hiddenTransform} scale-[0.98] opacity-0`
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-extrabold text-ink-900">
              {title}
            </h2>
            {subtitle && (
              <p id={subtitleId} className="mt-0.5 text-xs text-ink-500">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="focus-accent grid h-8 w-8 shrink-0 place-items-center rounded-control bg-slate-100 text-slate-600 transition duration-150 hover:bg-slate-200"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
