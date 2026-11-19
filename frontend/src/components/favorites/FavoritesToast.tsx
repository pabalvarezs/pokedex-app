import { StarIcon } from "./icons";

export type ToastKind = "removed" | "restored" | "error";

interface Props {
  kind: ToastKind;
  message: string;
  canUndo?: boolean;
  undoing?: boolean;
  onUndo?: () => void;
  onClose: () => void;
}

export default function FavoritesToast({
  kind,
  message,
  canUndo,
  undoing,
  onUndo,
  onClose,
}: Props) {
  const isError = kind === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      aria-atomic="true"
      className="favorites-toast fixed inset-x-4 bottom-5 z-50 mx-auto flex max-w-lg items-center gap-3 rounded-card border border-white/10 bg-slate-900/95 px-4 py-3 text-white shadow-ambient backdrop-blur"
    >
      <span
        aria-hidden="true"
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          isError ? "bg-red-500/20 text-red-300" : "bg-amber-300/15 text-amber-300"
        }`}
      >
        <StarIcon className="h-[18px] w-[18px]" />
      </span>

      <p className="min-w-0 flex-1 text-sm font-semibold leading-snug">
        {message}
      </p>

      {canUndo && onUndo && (
        <button
          type="button"
          onClick={onUndo}
          disabled={undoing}
          className="shrink-0 rounded-control bg-white/10 px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-amber-300 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-wait disabled:opacity-70"
        >
          {undoing ? "Volviendo…" : "Deshacer"}
        </button>
      )}

      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar aviso"
        className="shrink-0 rounded-full p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          aria-hidden="true"
          className="h-4 w-4"
        >
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}
