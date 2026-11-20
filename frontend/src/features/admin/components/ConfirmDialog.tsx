import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="focus-accent rounded-control bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition duration-150 hover:bg-slate-200"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="focus-accent inline-flex items-center justify-center gap-2 rounded-control bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition duration-150 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && (
              <span
                aria-hidden="true"
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
            )}
            {loading ? "Eliminando..." : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-3">
        <span
          aria-hidden="true"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600"
        >
          <AlertTriangle className="h-5 w-5" />
        </span>
        <p className="pt-1 text-sm leading-relaxed text-ink-700">{description}</p>
      </div>
    </Modal>
  );
}
