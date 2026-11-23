import { Suspense, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, m } from "framer-motion";
import { ChartColumnIncreasing, Database, ShieldAlert } from "lucide-react";
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
      <header className="mb-5 flex items-center gap-2.5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-control border-2 border-red-600 bg-white motion-safe:animate-pop">
          <ChartColumnIncreasing className="h-7 w-7" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-black text-gray-800 sm:text-2xl">
            Centro de Datos
          </h1>
          <p className="truncate text-xs text-gray-500">
            Hola, {user?.name}. Estadísticas internas de la PokéAPI.
          </p>
        </div>
        <Database className="ml-auto hidden h-6 w-6 shrink-0 text-red-600 sm:block" aria-hidden="true" />
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
