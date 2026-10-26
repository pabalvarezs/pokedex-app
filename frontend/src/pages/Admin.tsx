import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UsersAdmin from "../components/admin/UsersAdmin";
import FavoritesAdmin from "../components/admin/FavoritesAdmin";

type Tab = "users" | "favorites";

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>("users");

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center bg-white rounded-3xl border border-gray-200 shadow-sm mt-6">
        <span className="text-5xl mb-4 block">🛡️</span>
        <h1 className="text-xl font-black text-gray-800 mb-2">Acceso restringido</h1>
        <p className="text-sm text-gray-500 mb-6">
          {user
            ? "Tu cuenta de entrenador no tiene permisos de administración."
            : "Inicia sesión con una cuenta de administrador para gestionar el sitio."}
        </p>
        <Link
          to={user ? "/" : "/login"}
          className="inline-block px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition shadow-sm"
        >
          {user ? "Volver a la Pokédex" : "Ir a iniciar sesión"}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-2 sm:py-4">
      <div className="mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-xl shrink-0">
            🛡️
          </span>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-gray-800 truncate">
              Panel de administración
            </h1>
            <p className="text-xs text-gray-500 truncate">
              Hola, {user?.name}. Administra los entrenadores y sus regalones.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 p-1 bg-white border border-gray-200 rounded-2xl mb-5 shadow-sm w-full sm:w-auto sm:inline-flex">
        <button
          onClick={() => setTab("users")}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${
            tab === "users"
              ? "bg-red-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <span>👥</span>
          <span>Entrenadores</span>
        </button>
        <button
          onClick={() => setTab("favorites")}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${
            tab === "favorites"
              ? "bg-amber-500 text-amber-950 shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <span>⭐</span>
          <span>Regalones</span>
        </button>
      </div>

      {tab === "users" ? <UsersAdmin /> : <FavoritesAdmin />}
    </div>
  );
}
