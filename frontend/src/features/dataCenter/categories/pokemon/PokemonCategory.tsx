import { useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, Trophy } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../../../services/api";
import { cn } from "../../../admin/lib/cn";
import {
  DataCenterEmpty,
  DataCenterError,
  DataCenterSkeleton,
} from "../../components/DataCenterState";
import { useDataCenterPokemon } from "../../hooks/useDataCenterPokemon";
import { formatDate, formatNumber, RANKING_LABELS } from "../../lib/format";
import {
  RANKING_KEYS,
  type PokemonDataCenterFilters,
} from "../../lib/types";
import InsightsPanels from "./InsightsPanels";
import PokemonFilters from "./PokemonFilters";
import RankingTable from "./RankingTable";
import RecordCards from "./RecordCards";

const INITIAL_FILTERS: PokemonDataCenterFilters = {
  limit: 10,
  type: null,
  generation: null,
  includeVariants: false,
};

const ACCENTS = {
  total: "#dc2626",
  hp: "#16a34a",
  attack: "#ea580c",
  defense: "#2563eb",
  specialAttack: "#db2777",
  specialDefense: "#7c3aed",
  speed: "#d97706",
} as const;

export default function PokemonCategory() {
  const [filters, setFilters] = useState<PokemonDataCenterFilters>(INITIAL_FILTERS);
  const queryFilters = useMemo(
    () => ({
      limit: filters.limit,
      type: filters.type,
      generation: filters.generation,
      includeVariants: filters.includeVariants,
    }),
    [filters]
  );
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    status,
    isPolling,
    refresh,
  } = useDataCenterPokemon(queryFilters);

  const wasRefreshing = useRef(false);
  useEffect(() => {
    const refreshing = Boolean(status?.refreshing);
    if (wasRefreshing.current && !refreshing) {
      if (status?.lastError) {
        toast.error("No se pudo actualizar el dataset", {
          description: status.lastError,
        });
      } else if (status?.generatedAt) {
        toast.success("Dataset actualizado", {
          description: `${formatNumber(status.count)} Pokémon · ${formatDate(status.generatedAt)}`,
        });
      }
    }
    wasRefreshing.current = refreshing;
  }, [status]);

  const handleRefresh = () => {
    refresh.mutate(undefined, {
      onSuccess: () => {
        toast.info("Actualización iniciada", {
          description: "Puede tardar un minuto; los datos actuales siguen disponibles.",
        });
      },
      onError: (err) => {
        toast.error(getApiErrorMessage(err, "No se pudo iniciar la actualización."));
      },
    });
  };

  if (isLoading) return <DataCenterSkeleton />;

  if (isError || !data) {
    return (
      <DataCenterError
        message={getApiErrorMessage(error, "No se pudo cargar el dataset de Pokémon.")}
        onRetry={() => void refetch()}
      />
    );
  }

  const { meta, rankings, records, insights } = data;
  const busy = refresh.isPending || isPolling || isFetching;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-red-700">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
            Estadísticas internas
          </span>
          <h2 className="mt-2 flex items-center gap-3 text-display font-extrabold text-ink-900">
            <span
              className="h-8 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-red-600 to-amber-400"
              aria-hidden="true"
            />
            Rankings de Pokémon
          </h2>
          <p className="mt-1 max-w-2xl text-body text-ink-500">
            {formatNumber(meta.filtered)} de {formatNumber(meta.total)} Pokémon
            {meta.type ? ` · tipo ${meta.type}` : ""}
            {meta.generation ? ` · generación ${meta.generation}` : ""}
            {meta.includeVariants ? " · con variantes" : " · solo forma por defecto"}
            {" · actualizado "}
            {formatDate(status?.generatedAt ?? meta.generatedAt)}
          </p>
          {isPolling && (
            <p className="mt-1 text-[11px] font-bold text-amber-700" role="status">
              Actualizando en segundo plano… los datos actuales siguen disponibles.
            </p>
          )}
          {!isPolling && status?.lastError && (
            <p className="mt-1 text-[11px] font-bold text-red-700" role="alert">
              Última actualización fallida: {status.lastError}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={busy}
          className={cn(
            "inline-flex min-h-[40px] items-center gap-2 rounded-control border border-line bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-sm transition hover:border-red-300 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400",
            busy && "opacity-60"
          )}
        >
          <RefreshCw
            className={cn("h-4 w-4", busy && "motion-safe:animate-spin")}
            aria-hidden="true"
          />
          {busy ? "Actualizando…" : "Actualizar datos"}
        </button>
      </header>

      <PokemonFilters filters={filters} onChange={setFilters} disabled={isFetching} />

      {meta.filtered === 0 ? (
        <DataCenterEmpty />
      ) : (
        <>
          <RecordCards records={records} />

          <section aria-label="Rankings por estadística base">
            <div className="mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-600" aria-hidden="true" />
              <h2 className="text-sm font-black text-ink-900">
                Top {meta.limit} por estadística base
              </h2>
            </div>
            <p className="mb-3 text-[11px] text-ink-500">{meta.tiesPolicy}</p>
            <div className="grid gap-4 lg:grid-cols-2">
              {RANKING_KEYS.map((key) => (
                <RankingTable
                  key={key}
                  title={RANKING_LABELS[key]}
                  entries={rankings[key]}
                  icon={Trophy}
                  accent={ACCENTS[key]}
                />
              ))}
            </div>
          </section>

          <InsightsPanels
            typeAverages={insights.typeAverages}
            generationDistribution={insights.generationDistribution}
            roleLeaders={insights.roleLeaders}
          />
        </>
      )}
    </div>
  );
}
