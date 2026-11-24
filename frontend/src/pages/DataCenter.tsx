import { Suspense, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, m } from "framer-motion";
import { Database, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LayoutMotionProvider from "../context/LayoutMotionProvider";
import EmptyState from "../features/admin/components/EmptyState";
import { Skeleton } from "../features/admin/components/Skeleton";
import DataCenterTabs from "../features/dataCenter/components/DataCenterTabs";
import {
  DEFAULT_DATA_CENTER_CATEGORY,
  getDataCenterCategoryMeta,
  isDataCenterCategory,
} from "../features/dataCenter/registry";
import { useReducedMotionSafe } from "../hooks/useReducedMotionSafe";
import { fadeUp } from "../lib/motion";

/** Página interna: el backend además valida el rol en cada petición. */
export default function DataCenter() {
  const { user, isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="mx-auto mt-6 max-w-md px-4 py-2">
        <EmptyState
          icon={ShieldAlert}
          tone="recovery"
          title="Acceso restringido"
          description={
            user
              ? "El Centro de Datos es solo para administradores, po."
              : "Conéctate con una cuenta de admin para ver el Centro de Datos."
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

  return <DataCenterDashboard />;
}

/** Se monta solo con sesión de admin: así no dispara queries protegidas. */
function DataCenterDashboard() {
  const { user } = useAuth();
  const reduceMotion = useReducedMotionSafe();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawCategory = searchParams.get("category");
  const category = isDataCenterCategory(rawCategory)
    ? rawCategory
    : DEFAULT_DATA_CENTER_CATEGORY;
  const meta = getDataCenterCategoryMeta(category);
  const ActiveCategory = meta.Component;

  const changeCategory = (next: string) => {
    setSearchParams(
      (previous) => {
        const params = new URLSearchParams(previous);
        if (next === DEFAULT_DATA_CENTER_CATEGORY) params.delete("category");
        else params.set("category", next);
        return params;
      },
      { replace: true }
    );
  };

  // El acento del panel admin también se aplica aquí mientras la página vive.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", "#DC2626");
    root.style.setProperty("--accent-ink", "#ffffff");
    return () => {
      root.style.removeProperty("--accent");
      root.style.removeProperty("--accent-ink");
    };
  }, []);

  return (
    <div data-data-center className="relative isolate mx-auto max-w-6xl py-2 sm:py-4">
      <header className="glass-surface glass-blur relative mb-6 animate-fade-up overflow-hidden rounded-card border border-line p-5 shadow-card sm:p-7">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-red-200/70 via-amber-100/60 to-transparent blur-2xl"
        />
        <div className="relative flex flex-wrap items-center gap-4 sm:gap-6">
          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-card border-2 border-red-600 bg-white shadow-ambient motion-safe:animate-pop sm:h-24 sm:w-24">
            <img
              src={`${import.meta.env.BASE_URL}datos.webp`}
              alt=""
              aria-hidden="true"
              className="h-14 w-14 sm:h-16 sm:w-16"
            />
          </span>
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-red-700">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
              Estadísticas internas
            </span>
            <h1 className="mt-2 flex items-center gap-3 text-display font-extrabold text-ink-900">
              <span
                className="h-9 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-red-600 to-amber-400"
                aria-hidden="true"
              />
              Centro de Datos
            </h1>
            <p className="mt-2 max-w-2xl text-body text-ink-500">
              Hola, {user?.name}. Estadísticas internas de la PokéAPI.
            </p>
          </div>
          <Database
            className="hidden h-10 w-10 shrink-0 text-red-600 sm:block"
            aria-hidden="true"
          />
        </div>
      </header>

      <LayoutMotionProvider>
        <DataCenterTabs
          value={category}
          onChange={changeCategory}
          panelId="panel-data-center"
        />

        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={category}
            id="panel-data-center"
            role="tabpanel"
            aria-labelledby={`tab-${category}`}
            tabIndex={0}
            className="relative z-10 pt-2 focus:outline-none"
            variants={fadeUp}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            exit={reduceMotion ? undefined : "exit"}
          >
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <ActiveCategory />
            </Suspense>
          </m.div>
        </AnimatePresence>
      </LayoutMotionProvider>
    </div>
  );
}
