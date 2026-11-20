import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, ChevronDown } from "lucide-react";
import {
  adminListFavorites,
  adminListPasswordResets,
  adminListUsers,
} from "../../../../services/api";
import EmptyState from "../EmptyState";
import { Skeleton } from "../Skeleton";
import { useAdminAnalytics, type RangeDays } from "../../hooks/useAdminAnalytics";
import ActivityFeed from "./ActivityFeed";
import AllTrainersModal from "./AllTrainersModal";
import FavoritesPerDayChart from "./FavoritesPerDayChart";
import FavoritesPerTrainerChart from "./FavoritesPerTrainerChart";
import RangeSelector from "./RangeSelector";
import TrainersOverTimeChart from "./TrainersOverTimeChart";
import TypeDistributionChart from "./TypeDistributionChart";

/**
 * Panel de gráficos derivado de las mismas query keys que las pestañas:
 * no agrega endpoints ni dispara requests nuevos.
 */
export default function AnalyticsSection() {
  const [open, setOpen] = useState(true);
  const [range, setRange] = useState<RangeDays>(30);
  const [allTrainersOpen, setAllTrainersOpen] = useState(false);

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: adminListUsers,
  });
  const favoritesQuery = useQuery({
    queryKey: ["admin", "favorites"],
    queryFn: adminListFavorites,
  });
  const resetsQuery = useQuery({
    queryKey: ["admin", "password-resets"],
    queryFn: adminListPasswordResets,
  });

  const users = usersQuery.data ?? [];
  const favorites = favoritesQuery.data ?? [];
  const resets = resetsQuery.data ?? [];

  const analytics = useAdminAnalytics({ favorites, users, resets, range });
  const loading =
    usersQuery.isLoading || favoritesQuery.isLoading || resetsQuery.isLoading;
  const isError =
    usersQuery.isError || favoritesQuery.isError || resetsQuery.isError;

  return (
    <section aria-label="Analíticas del panel" className="relative z-10 mb-5">
      <div className="glass-surface overflow-hidden rounded-card border border-line shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            aria-expanded={open}
            aria-controls="analytics-content"
            onClick={() => setOpen((value) => !value)}
            className="focus-accent flex min-w-0 items-center gap-2.5 rounded-control text-left"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-slate-100 text-slate-700">
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-extrabold text-ink-900">
                Analíticas
              </span>
              <span className="block truncate text-[11px] text-ink-500">
                Lo que pasa en la Pokédex, en números
              </span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className={`h-4 w-4 shrink-0 text-ink-500 transition-transform duration-200 motion-safe:transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
          {open && <RangeSelector value={range} onChange={setRange} />}
        </div>

        {open && (
          <div id="analytics-content" className="border-t border-line-soft p-4">
            {isError ? (
              <p role="alert" className="text-xs font-semibold text-red-700">
                No pudimos juntar las cifras. Revisa tu sesión e inténtalo de nuevo.
              </p>
            ) : loading ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {[0, 1, 2, 3].map((item) => (
                  <Skeleton key={item} className="h-64 w-full" />
                ))}
              </div>
            ) : !analytics.hasData ? (
              <EmptyState
                icon={BarChart3}
                tone="gifts"
                title="Todavía no hay datos para graficar"
                description="Cuando se creen entrenadores y se guarden regalones, las cifras aparecerán acá."
              />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                <FavoritesPerDayChart data={analytics.favoritesByDay} range={range} />
                <TrainersOverTimeChart data={analytics.trainersOverTime} range={range} />
                <FavoritesPerTrainerChart
                  data={analytics.topTrainers}
                  onOpenAll={() => setAllTrainersOpen(true)}
                />
                <TypeDistributionChart
                  data={analytics.typeDistribution}
                  loading={analytics.typesLoading}
                />
                <div className="lg:col-span-2">
                  <ActivityFeed items={analytics.activity} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AllTrainersModal
        open={allTrainersOpen}
        onClose={() => setAllTrainersOpen(false)}
        trainers={analytics.allTrainers}
      />
    </section>
  );
}
