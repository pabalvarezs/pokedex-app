import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../services/api";

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ message: string; devResetUrl?: string } | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError("Ingresa tu nombre de usuario, po.");
      return;
    }

    setLoading(true);
    try {
      const data = await requestPasswordReset(username.trim().toLowerCase());
      setResult({ message: data.message, devResetUrl: data.devResetUrl });
    } catch (err: any) {
      setError(err?.message || "No pudimos procesar la solicitud. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel max-w-md mx-auto my-8">
      <div className="bg-surface rounded-3xl border border-line p-8 shadow-card">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner">
            🔑
          </div>
          <h1 className="text-2xl font-black text-gray-800">Recuperar contraseña</h1>
          <p className="text-xs text-gray-500 mt-1">
            Te enviamos un enlace de un solo uso para que elijas una contraseña nueva
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {result ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-start gap-2">
              <span className="text-base">📬</span>
              <span>{result.message}</span>
            </div>

            {result.devResetUrl && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                <p className="font-bold">Modo desarrollo: no hay proveedor de correo configurado.</p>
                <a
                  href={result.devResetUrl}
                  className="block break-all font-semibold text-red-700 hover:text-red-800 underline"
                >
                  {result.devResetUrl}
                </a>
                <p className="text-[11px] text-amber-700">
                  Este enlace solo aparece fuera de producción.
                </p>
              </div>
            )}

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-700 mb-1">¿No te llega el correo?</p>
              <p>
                Revisa la carpeta de spam o pide a un administrador que te genere el enlace
                desde el panel de admin. También puedes intentarlo de nuevo en unos minutos.
              </p>
            </div>

            <Link
              to="/login"
              className="block w-full py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition shadow-sm text-center"
            >
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="recovery-username"
                  className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"
                >
                  Nombre de usuario:
                </label>
                <input
                  id="recovery-username"
                  type="text"
                  value={username}
                  autoComplete="username"
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Tu nombre de usuario"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <span>{loading ? "Enviando..." : "Enviar enlace de recuperación ✉️"}</span>
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <Link
                to="/login"
                className="text-xs font-semibold text-gray-500 hover:text-red-600 transition"
              >
                ← Volver a iniciar sesión
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
