import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleFillCredentials = () => {
    setUsername("pablito");
    setPassword("pablito2026");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Tienes que ingresar usuario y contraseña, po.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(username.trim(), password.trim());
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "¡Pucha compadre! Usuario o clave incorrecta. Prueba con las credenciales de prueba."
      );
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-gray-200 p-8 shadow-sm text-center">
        <span className="text-5xl mb-3 block">👋</span>
        <h2 className="text-2xl font-black text-gray-800">
          ¡Ya estás conectado, {user.name}!
        </h2>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Rol: <span className="font-semibold text-red-600">{user.role}</span>
        </p>
        <Link
          to="/"
          className="inline-block w-full py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition shadow-sm"
        >
          Ir a explorar la Pokédex al tiro 👈
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-8">
      {/* Tarjeta de credenciales de prueba */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🔑</span>
          <h3 className="text-sm font-black text-amber-950 uppercase tracking-wider">
            Credenciales de prueba
          </h3>
        </div>
        <p className="text-xs text-amber-900 mb-3 leading-relaxed">
          Usa estas credenciales para probar el acceso de entrenador:
        </p>
        <div className="bg-white/80 rounded-xl p-3 border border-amber-200 text-xs text-gray-800 space-y-1 font-mono">
          <div>
            <span className="text-gray-400 select-none">Usuario: </span>
            <span className="font-bold text-gray-900">pablito</span>
          </div>
          <div>
            <span className="text-gray-400 select-none">Contraseña: </span>
            <span className="font-bold text-gray-900">pablito2026</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleFillCredentials}
          className="mt-3 w-full py-2 px-3 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>⚡</span>
          <span>Rellenar credenciales al tiro</span>
        </button>
      </div>

      {/* Formulario de Login */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-black shadow-inner">
            ⚡
          </div>
          <h1 className="text-2xl font-black text-gray-800">
            Acceso Entrenador Pablito
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Ingresa a tu cuenta para administrar la Pokédex y tus regalones
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Nombre de usuario:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: pablito"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Contraseña secreta:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <span>{loading ? "Entrando al tiro..." : "Entrar a la Pokédex 🚀"}</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <Link
            to="/"
            className="text-xs font-semibold text-gray-500 hover:text-red-600 transition"
          >
            ← Volver a explorar sin iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
