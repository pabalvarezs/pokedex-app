import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import type { GeneratedPasswordReset } from "../../../services/api";
import { copyToClipboard } from "../lib/clipboard";
import Modal from "./Modal";

interface Props {
  data: GeneratedPasswordReset | null;
  onClose: () => void;
}

/** Enlace generado: se puede copiar solo o compartir a mano. */
export default function ResetLinkModal({ data, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!data) return;
    const ok = await copyToClipboard(data.url);
    if (ok) {
      setCopied(true);
      toast.success("¡Enlace copiado!");
      window.setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error("No pudimos copiar solos; selecciona el enlace y cópialo a mano.");
    }
  };

  return (
    <Modal
      open={Boolean(data)}
      onClose={() => {
        setCopied(false);
        onClose();
      }}
      title={data ? `Enlace para @${data.username}` : "Enlace de recuperación"}
      subtitle="Vence pronto. Compártelo solo con la persona dueña de la cuenta."
      size="md"
      footer={
        <button
          type="button"
          onClick={() => {
            setCopied(false);
            onClose();
          }}
          className="focus-accent rounded-control bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition duration-150 hover:bg-slate-200"
        >
          Listo
        </button>
      }
    >
      {data && (
        <div className="space-y-3">
          <div className="rounded-control border border-amber-200 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-900">
            Vence el {new Date(data.expiresAt).toLocaleString("es-CL")}.{" "}
            {data.emailSent
              ? "También se envió al correo registrado."
              : data.hasEmail
                ? "No se pudo enviar por correo; compártelo tú."
                : "La cuenta no tiene email registrado; compártelo tú."}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={data.url}
              onFocus={(event) => event.currentTarget.select()}
              aria-label="Enlace de recuperación"
              className="min-w-0 flex-1 rounded-control border border-line bg-white px-3 py-2 font-mono text-xs text-ink-700"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="btn-accent focus-accent inline-flex shrink-0 items-center justify-center gap-2 rounded-control px-4 py-2 text-xs font-bold shadow-sm transition duration-150"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              {copied ? "¡Copiado!" : "Copiar enlace"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
