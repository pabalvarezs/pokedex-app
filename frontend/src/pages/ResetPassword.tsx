import { FormEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { resetPassword } from "../services/api";

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("El enlace no es válido. Solicita uno nuevo.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden, po.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "No pudimos actualizar tu contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner">
            🔒
          </div>
          <h1 className="text-2xl font-black text-gray-800">Nueva contraseña</h1>
          <p className="text-xs text-gray-500 mt-1">
            Elige una contraseña que no uses en otros sitios
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-start gap-2">
              <span className="text-base">✅</span>
              <span>
                Tu contraseña se actualizó correctamente. Ya puedes entrar con tu nueva clave.
              </span>
            </div>
            <Link
              to="/login"
              className="block w-full py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition shadow-sm text-center"
            >
              Iniciar sesión
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"
                >
                  Contraseña nueva:
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  autoComplete="new-password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"
                >
                  Repite la contraseña:
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirm}
                  autoComplete="new-password"
                  onChange={(event) => setConfirm(event.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <span>{loading ? "Guardando..." : "Guardar contraseña 🔐"}</span>
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center space-y-2">
              <Link
                to="/recuperar"
                className="block text-xs font-semibold text-gray-500 hover:text-red-600 transition"
              >
                Solicitar un enlace nuevo
              </Link>
              <Link
                to="/login"
                className="block text-xs font-semibold text-gray-500 hover:text-red-600 transition"
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
