import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import PokemonDetail from "./pages/PokemonDetail";
import Favorites from "./pages/Favorites";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./context/AuthContext";

function NavigationHeader() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <header className="bg-red-600 text-white shadow-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex justify-between items-center">
        <Link
          to="/"
          className="text-xl font-black tracking-wide flex items-center gap-2 hover:opacity-95 transition"
        >
          <span className="text-2xl">⚡</span>
          <span>PokéChile - Pablito 🇨🇱</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${
              location.pathname === "/"
                ? "bg-red-700 text-white"
                : "text-red-100 hover:bg-red-700/60"
            }`}
          >
            Inicio
          </Link>
          <Link
            to="/favorites"
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition flex items-center gap-1.5 ${
              location.pathname === "/favorites"
                ? "bg-amber-400 text-amber-950 shadow-sm"
                : "bg-red-700/50 text-white hover:bg-red-700"
            }`}
          >
            <span>⭐</span>
            <span>Mis Regalones</span>
          </Link>

          {/* Sección de Usuario / Login */}
          {user ? (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-red-500">
              <span className="text-xs font-bold text-amber-200 hidden md:inline">
                Hola, {user.name} 👋
              </span>
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="px-2.5 py-1.5 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 border border-red-700"
              >
                <span>Salir</span>
                <span>🚪</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-white/30 ml-1 ${
                location.pathname === "/login"
                  ? "bg-white text-red-600 shadow-sm"
                  : "bg-red-700/60 text-white hover:bg-white hover:text-red-600"
              }`}
            >
              <span>Acceso</span>
              <span>🔐</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col font-sans">
        <NavigationHeader />

        <main className="flex-1 px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pokemon/:id" element={<PokemonDetail />} />
            <Route path="/search/:name" element={<PokemonDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500">
          <div className="max-w-6xl mx-auto px-4">
            <p className="font-bold text-gray-800 text-sm">
              Versión adaptada a Chilensis 🇨🇱 Hecho con cariño Pablito
            </p>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
