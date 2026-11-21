import { lazy, Suspense, type CSSProperties } from "react";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, m } from "framer-motion";
import { Clock, KeyRound, ShieldAlert, ShieldCheck, Star, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LayoutMotionProvider from "../context/LayoutMotionProvider";
import { useReducedMotionSafe } from "../hooks/useReducedMotionSafe";
import { fadeUp } from "../lib/motion";
import UsersAdmin from "../components/admin/UsersAdmin";
import FavoritesAdmin from "../components/admin/FavoritesAdmin";
import PasswordResetsAdmin from "../components/admin/PasswordResetsAdmin";
import PokemonArtwork from "../components/PokemonArtwork";
import { Skeleton } from "../features/admin/components/Skeleton";
import AdminTabs, {
  getAdminTabMeta,
  isAdminTab,
  type AdminTab,
} from "../features/admin/components/AdminTabs";
import EmptyState from "../features/admin/components/EmptyState";
import PokeballWatermark from "../features/admin/components/PokeballWatermark";
import StatCard from "../features/admin/components/StatCard";
import { useAdminStats } from "../features/admin/hooks/useAdminStats";

const AnalyticsSection = lazy(
  () => import("../features/admin/components/analytics/AnalyticsSection")
);

function spriteUrl(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export default function Admin() {
  const { user, isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="mx-auto mt-6 max-w-md px-4 py-2">
        <EmptyState
          icon={ShieldAlert}
          title="Acceso restringido"
          description={
            user
              ? "Tu cuenta no tiene permisos de admin, po."
              : "Conéctate con una cuenta de admin pa' gestionar el sitio."
          }
          action={
            <Link
              to={user ? "/" : "/login"}
              className="inline-block rounded-control bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
            >
              {user ? "Volver a la Pokédex" : "Ir a iniciar sesión"}
            </Link>
          }
        />
      </div>
    );
  }

  return <AdminDashboard />;
}

/** Se monta solo con sesión de admin: así no dispara queries admin a otros usuarios. */
function AdminDashboard() {
  const { user } = useAuth();
  const { stats, isLoading: statsLoading } = useAdminStats();
  const [searchParams, setSearchParams] = useSearchParams();
  const reduceMotion = useReducedMotionSafe();

  const rawTab = searchParams.get("tab");
  const tab: AdminTab = isAdminTab(rawTab) ? rawTab : "users";
  const meta = getAdminTabMeta(tab);

  const changeTab = (next: AdminTab) => {
    setSearchParams(
      (previous) => {
        const params = new URLSearchParams(previous);
        // La pestaña por defecto queda en /admin, sin query string.
        if (next === "users") params.delete("tab");
        else params.set("tab", next);
        return params;
      },
      { replace: true }
    );
  };

  const counts: Record<AdminTab, number> = {
    users: stats.total,
    favorites: stats.favorites,
    resets: stats.pendingResets,
  };

  // Los portales (Drawer/Modal/Toaster) viven fuera del contenedor del panel,
  // así que el acento también se publica en :root mientras el admin está montado.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", meta.accent);
    root.style.setProperty("--accent-ink", meta.ink);
    return () => {
      root.style.removeProperty("--accent");
      root.style.removeProperty("--accent-ink");
    };
  }, [meta.accent, meta.ink]);

  return (
    <div
      data-admin-accent
      className="relative isolate mx-auto max-w-6xl py-2 sm:py-4"
      style={
        {
          "--accent": meta.accent,
          "--accent-ink": meta.ink,
        } as CSSProperties
      }
    >
      <PokeballWatermark />

      <header className="mb-5 flex items-center gap-2.5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-control bg-gray-900 text-white motion-safe:animate-pop">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-black text-gray-800 sm:text-2xl">
            Panel de admin
          </h1>
          <p className="truncate text-xs text-gray-500">
            Hola, {user?.name}. Administra los entrenadores y sus regalones.
          </p>
        </div>
      </header>

      <section
        aria-label="Resumen del panel"
        className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatCard
          label="Entrenadores"
          shortLabel="Cuentas"
          icon={Users}
          tone="trainers"
          value={stats.total}
          loading={statsLoading}
          index={0}
        />
        <StatCard
          label="Regalones"
          icon={Star}
          tone="gifts"
          value={stats.favorites}
          loading={statsLoading}
          index={1}
        />
        <StatCard
          label="Regalón reciente"
          shortLabel="Reciente"
          icon={Clock}
          tone="recent"
          loading={statsLoading}
          index={2}
        >
          {stats.recentFavorite ? (
            <div className="mt-1 flex items-center gap-2">
              <PokemonArtwork
                id={stats.recentFavorite.pokemonId}
                name={stats.recentFavorite.name}
                src={spriteUrl(stats.recentFavorite.pokemonId)}
                className="h-12 w-12 shrink-0 object-contain"
              />
              <p className="min-w-0 truncate text-lg font-extrabold capitalize leading-tight text-ink-900">
                {stats.recentFavorite.name}
              </p>
            </div>
          ) : (
            <p className="mt-1 text-lg font-extrabold text-ink-500">Sin regalones</p>
          )}
        </StatCard>
        <StatCard
          label="Recuperaciones"
          shortLabel="Recup."
          icon={KeyRound}
          tone="recovery"
          value={stats.pendingResets}
          loading={statsLoading}
          index={3}
        />
      </section>

      <Suspense fallback={<Skeleton className="mb-5 h-28 w-full" />}>
        <AnalyticsSection />
      </Suspense>

      <LayoutMotionProvider>
        <AdminTabs
          value={tab}
          onChange={changeTab}
          counts={counts}
          loading={statsLoading}
          panelId="panel-admin-tab"
        />

        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={tab}
            id="panel-admin-tab"
            role="tabpanel"
            aria-labelledby={`tab-${tab}`}
            tabIndex={0}
            className="relative z-10 pt-4 focus:outline-none"
            variants={fadeUp}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            exit={reduceMotion ? undefined : "exit"}
          >
            {tab === "users" ? (
              <UsersAdmin />
            ) : tab === "favorites" ? (
              <FavoritesAdmin />
            ) : (
              <PasswordResetsAdmin />
            )}
          </m.div>
        </AnimatePresence>
      </LayoutMotionProvider>
    </div>
  );
}
