import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GeneratedPasswordReset,
  PasswordResetRequest,
  adminCreatePasswordReset,
  adminListPasswordResets,
  getApiErrorMessage,
} from "../../services/api";

export default function PasswordResetsAdmin() {
  const queryClient = useQueryClient();
  const [resetLink, setResetLink] = useState<GeneratedPasswordReset | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: requests = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin", "password-resets"],
    queryFn: adminListPasswordResets,
  });

  const generate = useMutation({
    mutationFn: (userId: number) => adminCreatePasswordReset(userId),
    onSuccess: (data) => {
      setResetLink(data);
      setNotice(
        data.emailSent
          ? `Enlace enviado por correo a @${data.username}.`
          : `Enlace generado para @${data.username}. Cópialo y entrégaselo.`
      );
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "password-resets"] });
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });

  const copyLink = async () => {
    if (!resetLink) return;
    try {
      await navigator.clipboard.writeText(resetLink.url);
      setNotice("Enlace copiado al portapapeles.");
      setError(null);
    } catch {
      setError("No se pudo copiar automáticamente; selecciona el enlace y cópialo a mano.");
    }
  };

  const handleGenerate = (request: PasswordResetRequest) => {
    setNotice(null);
    setError(null);
    setResetLink(null);
    generate.mutate(request.userId);
  };

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-gray-800">Recuperaciones</h2>
          <p className="text-xs text-gray-500">
            Solicitudes de contraseña vigentes. Genera un enlace y entrégaselo al entrenador
            (o se envía solo si tiene email).
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition disabled:opacity-50"
        >
          <span>↻</span>
          <span>{isFetching ? "Actualizando..." : "Actualizar"}</span>
        </button>
      </div>

      {notice && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
          ✅ {notice}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
          ⚠️ {error}
        </div>
      )}

      {resetLink && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-black text-amber-900">
                🔑 Enlace de recuperación para @{resetLink.username}
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Vence el {new Date(resetLink.expiresAt).toLocaleString("es-CL")}.{" "}
                {resetLink.emailSent
                  ? "También se envió al correo registrado."
                  : resetLink.hasEmail
                    ? "No se pudo enviar por correo; compártelo tú."
                    : "El entrenador no tiene email registrado; compártelo tú."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setResetLink(null)}
              aria-label="Cerrar enlace"
              className="shrink-0 w-7 h-7 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-black transition"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-3">
            <input
              readOnly
              value={resetLink.url}
              onFocus={(event) => event.currentTarget.select()}
              className="flex-1 min-w-0 border border-amber-300 rounded-xl px-3 py-2 text-xs bg-white text-amber-900 font-mono"
            />
            <button
              type="button"
              onClick={copyLink}
              className="shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded-xl text-xs font-bold transition"
            >
              Copiar enlace
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-sm text-gray-500 font-medium">
          Cargando solicitudes...
        </div>
      ) : isError ? (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-semibold">
          No se pudieron cargar las solicitudes. Revisa tu sesión e inténtalo de nuevo.
        </div>
      ) : requests.length === 0 ? (
        <div className="glass-surface text-center py-12 px-4 border border-gray-200 rounded-2xl">
          <p className="text-3xl mb-2">🔑</p>
          <p className="text-sm font-bold text-gray-700">No hay solicitudes pendientes</p>
          <p className="text-xs text-gray-500 mt-1">
            Cuando un entrenador use "¿Olvidaste tu contraseña?", aparecerá acá.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <div
              key={request.id}
              className="glass-surface border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-gray-800 truncate">{request.name}</p>
                  <span className="text-xs text-gray-400">@{request.username}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                      request.source === "admin"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {request.source === "admin" ? "Generado por admin" : "Solicitado por el usuario"}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  {request.email ? `✉️ ${request.email}` : "Sin email registrado"}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Solicitado el {new Date(request.createdAt).toLocaleString("es-CL")} · Vence el{" "}
                  {new Date(request.expiresAt).toLocaleString("es-CL")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleGenerate(request)}
                disabled={generate.isPending}
                className="shrink-0 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
              >
                {generate.isPending ? "Generando..." : "Generar enlace"}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
