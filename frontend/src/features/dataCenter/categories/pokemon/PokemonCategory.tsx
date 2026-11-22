import { useMemo, useState } from "react";
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
  const { data, isLoading, isFetching, isError, error, refetch, refresh } =
    useDataCenterPokemon(queryFilters);

  const handleRefresh = () => {
    refresh.mutate(undefined, {
      onSuccess: (result) => {
        toast.success("Dataset actualizado", {
          description: `${formatNumber(result.count)} Pokémon · ${formatDate(result.generatedAt)}`,
        });
      },
      onError: (err) => {
        toast.error(getApiErrorMessage(err, "No se pudo actualizar el dataset."));
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

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-ink-900">Rankings de Pokémon</h2>
          <p className="text-xs font-semibold text-ink-500">
            {formatNumber(meta.filtered)} de {formatNumber(meta.total)} Pokémon
            {meta.type ? ` · tipo ${meta.type}` : ""}
            {meta.generation ? ` · generación ${meta.generation}` : ""}
            {meta.includeVariants ? " · con variantes" : " · solo forma por defecto"}
            {" · actualizado "}
            {formatDate(meta.generatedAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refresh.isPending || isFetching}
          className={cn(
            "inline-flex min-h-[40px] items-center gap-2 rounded-control border border-line bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-sm transition hover:border-red-300 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400",
            (refresh.isPending || isFetching) && "opacity-60"
          )}
        >
          <RefreshCw
            className={cn(
              "h-4 w-4",
              (refresh.isPending || isFetching) && "motion-safe:animate-spin"
            )}
            aria-hidden="true"
          />
          {refresh.isPending ? "Actualizando…" : "Actualizar datos"}
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
