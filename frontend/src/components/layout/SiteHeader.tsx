import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  CloseIcon,
  HomeIcon,
  KeyIcon,
  LogoutIcon,
  MenuIcon,
  PokeballIcon,
  ShieldIcon,
  StarIcon,
} from "./icons";

type NavIcon = ComponentType<{ className?: string }>;

interface NavLink {
  to: string;
  label: string;
  Icon: NavIcon;
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-red-800";

export default function SiteHeader() {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Cierra el menú móvil al cambiar de página.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Escape cierra el menú y devuelve el foco al botón que lo abrió.
  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const links: NavLink[] = [
    { to: "/", label: "Portá", Icon: HomeIcon },
    { to: "/favorites", label: "Mis Regalones", Icon: StarIcon },
  ];
  if (isAdmin) {
    links.push({ to: "/admin", label: "Admin", Icon: ShieldIcon });
  }

  const isActive = (path: string) => location.pathname === path;

  const desktopLinkClass = (path: string) =>
    `inline-flex min-h-[40px] items-center gap-1.5 rounded-control px-3 py-1.5 text-sm font-bold transition ${FOCUS_RING} ${
      isActive(path)
        ? "bg-white text-red-700 shadow-sm"
        : "text-red-50 hover:bg-white/15 hover:text-white"
    }`;

  const mobileLinkClass = (path: string) =>
    `flex min-h-[44px] w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold transition ${FOCUS_RING} ${
      isActive(path)
        ? "bg-white text-red-700 shadow-sm"
        : "text-red-50 hover:bg-white/15 hover:text-white"
    }`;

  return (
    <header className="site-header sticky top-0 z-30 text-white">
      {/* Brillos y Poké Ball de marca de agua: decoración sin texto. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <span
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 94% -25%, rgba(251, 191, 36, 0.35), transparent 46%), radial-gradient(circle at 0% 150%, rgba(255, 255, 255, 0.16), transparent 52%)",
          }}
        />
        <PokeballIcon className="absolute -right-10 -top-16 h-52 w-52 text-white/10" />
      </div>

      <div className="relative mx-auto max-w-home px-3 sm:px-4">
        <div className="flex items-center justify-between gap-2 py-2.5 sm:py-3">
          <Link
            to="/"
            aria-label="PokeChile, ir a la portada"
            className={`group flex min-w-0 items-center gap-2 rounded-control text-base font-black tracking-wide transition hover:opacity-95 sm:text-xl ${FOCUS_RING}`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-300 text-amber-950 shadow-sm ring-2 ring-white/40 transition group-hover:scale-105 motion-reduce:transform-none">
              <PokeballIcon className="h-5 w-5" />
            </span>
            <span className="truncate">PokeChile</span>
            <span className="shrink-0 text-base" aria-hidden="true">🇨🇱</span>
          </Link>

          {/* Navegación escritorio */}
          <nav
            aria-label="Navegación principal"
            className="hidden shrink-0 items-center gap-1.5 md:flex lg:gap-2"
          >
            {links.map(({ to, label, Icon }) => (
              <Link
                key={to}
                to={to}
                aria-current={isActive(to) ? "page" : undefined}
                className={desktopLinkClass(to)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            ))}

            {user ? (
              <div className="ml-2 flex items-center gap-2 border-l border-white/20 pl-2">
                <span className="hidden max-w-[140px] truncate text-xs font-bold text-amber-200 lg:inline">
                  Wena, {user.name} 👋
                </span>
                <button
                  type="button"
                  onClick={logout}
                  title="Cerrar sesión"
                  className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-control border border-white/25 bg-red-950/40 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-950/60 ${FOCUS_RING}`}
                >
                  <LogoutIcon className="h-4 w-4 shrink-0" />
                  <span>Salir</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                aria-current={isActive("/login") ? "page" : undefined}
                className={`ml-1 inline-flex min-h-[40px] items-center gap-1.5 rounded-control border px-3 py-1.5 text-xs font-bold transition ${FOCUS_RING} ${
                  isActive("/login")
                    ? "border-white bg-white text-red-700 shadow-sm"
                    : "border-white/40 bg-white/10 text-white hover:bg-white hover:text-red-700"
                }`}
              >
                <KeyIcon className="h-4 w-4 shrink-0" />
                <span>Acceso</span>
              </Link>
            )}
          </nav>

          {/* Botón menú móvil */}
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation-mobile"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-red-950/40 text-white transition hover:bg-red-950/60 md:hidden ${FOCUS_RING}`}
          >
            {menuOpen ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navegación móvil */}
        {menuOpen && (
          <nav
            id="primary-navigation-mobile"
            aria-label="Navegación principal"
            className="pc-menu-in mb-3 grid gap-1.5 rounded-2xl border border-white/15 bg-red-950/50 p-2 shadow-ambient backdrop-blur-md md:hidden"
          >
            {links.map(({ to, label, Icon }) => (
              <Link
                key={to}
                to={to}
                aria-current={isActive(to) ? "page" : undefined}
                className={mobileLinkClass(to)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </Link>
            ))}

            {user ? (
              <div className="mt-1 flex items-center justify-between gap-3 border-t border-white/15 pt-2.5">
                <span className="truncate text-xs font-bold text-amber-200">
                  Wena, {user.name} 👋
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className={`flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl border border-white/25 bg-red-950/40 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-950/60 ${FOCUS_RING}`}
                >
                  <LogoutIcon className="h-4 w-4 shrink-0" />
                  <span>Salir</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                aria-current={isActive("/login") ? "page" : undefined}
                className={`mt-1 flex min-h-[44px] w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-bold transition ${FOCUS_RING} ${
                  isActive("/login")
                    ? "border-white bg-white text-red-700"
                    : "border-white/40 bg-white/10 text-white hover:bg-white hover:text-red-700"
                }`}
              >
                <KeyIcon className="h-4 w-4 shrink-0" />
                <span>Meterse, po</span>
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
