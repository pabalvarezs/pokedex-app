import { useId, useRef, type ReactNode } from "react";
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

/**
 * Drawer lateral en desktop y bottom sheet en móvil. Mantiene el mismo
 * comportamiento de foco/scroll que el Modal.
 */
export default function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  useDialogBehavior(open, onClose, panelRef);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50" data-admin-accent>
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
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 flex max-h-[92vh] flex-col overflow-hidden rounded-t-card bg-white shadow-lift outline-none animate-fade-up sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:max-h-none sm:w-full sm:max-w-lg sm:rounded-none sm:rounded-l-card"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-extrabold text-ink-900">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>}
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
