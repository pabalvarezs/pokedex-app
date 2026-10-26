import { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import PokemonDetail from "./pages/PokemonDetail";
import Favorites from "./pages/Favorites";
import Login from "./pages/Login";
import TypePage from "./pages/TypePage";
import Admin from "./pages/Admin";
import { AuthProvider, useAuth } from "./context/AuthContext";

function NavigationHeader() {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Cierra el menú móvil al cambiar de página
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const links = [
    { to: "/", label: "Inicio", icon: "🏠" },
    { to: "/favorites", label: "Mis Regalones", icon: "⭐" },
  ];
  if (isAdmin) {
    links.push({ to: "/admin", label: "Administración", icon: "🛡️" });
  }

  const desktopLinkClass = (path: string) =>
    `px-3 py-1.5 rounded-lg text-sm font-bold transition ${
      location.pathname === path
        ? "bg-red-700 text-white"
        : "text-red-100 hover:bg-red-700/60"
    }`;

  const mobileLinkClass = (path: string) =>
    `flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-bold transition ${
      location.pathname === path
        ? "bg-red-700 text-white"
        : "text-red-50 hover:bg-red-700/60"
    }`;

  return (
    <header className="bg-red-600 text-white shadow-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between gap-2 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 min-w-0 text-base sm:text-xl font-black tracking-wide hover:opacity-95 transition"
          >
            <span className="text-xl sm:text-2xl shrink-0">⚡</span>
            <span className="truncate">PokéChile</span>
            <span className="hidden sm:inline text-xs md:text-sm font-bold text-red-100 truncate">
              · Pablito 🇨🇱
            </span>
          </Link>

          {/* Navegación escritorio */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 shrink-0">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className={desktopLinkClass(link.to)}>
                <span className="mr-1">{link.icon}</span>
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-red-500">
                <span className="text-xs font-bold text-amber-200 hidden lg:inline max-w-[120px] truncate">
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

          {/* Botón menú móvil */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            className="md:hidden shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-red-700/70 hover:bg-red-800 border border-red-500 text-xl font-bold transition"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Navegación móvil */}
        {menuOpen && (
          <nav className="md:hidden pb-3 grid gap-1.5">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className={mobileLinkClass(link.to)}>
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}

            {user ? (
              <div className="mt-1.5 pt-2.5 border-t border-red-500/60 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-amber-200 truncate">
                  Hola, {user.name} 👋
                </span>
                <button
                  onClick={logout}
                  className="shrink-0 px-3 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 border border-red-700"
                >
                  <span>Salir</span>
                  <span>🚪</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-bold transition border border-white/30 ${
                  location.pathname === "/login"
                    ? "bg-white text-red-600"
                    : "bg-red-700/60 text-white hover:bg-white hover:text-red-600"
                }`}
              >
                <span>🔐</span>
                <span>Acceso entrenador</span>
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col font-sans">
        <NavigationHeader />

        <main className="flex-1 px-3 sm:px-4 py-5 sm:py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pokemon/:id" element={<PokemonDetail />} />
            <Route path="/search/:name" element={<PokemonDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/login" element={<Login />} />
            <Route path="/type/:type" element={<TypePage />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}
