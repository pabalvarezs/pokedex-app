import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { RefreshCw, Search, X } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../../../services/api";
import { cn } from "../../../admin/lib/cn";
import { useReducedMotionSafe } from "../../../../hooks/useReducedMotionSafe";
import { fadeUp } from "../../../../lib/motion";
import {
  DataCenterEmpty,
  DataCenterError,
  DataCenterSkeleton,
} from "../../components/DataCenterState";
import { formatDate, formatNumber } from "../../lib/format";
import type { CatalogMeta } from "../../lib/catalogs";
import type { CatalogEntry } from "../../lib/types";
import CatalogDetail from "./CatalogDetail";
import ItemPocketPanel from "./ItemPocketPanel";
import ItemPocketRail from "./ItemPocketRail";
import { groupItemsByPocket } from "./itemPockets";
import { useItemCatalogIndex } from "./useItemCatalogIndex";

interface Selection {
  group: string;
  id: number;
}

/** Vista propia de objetos: acordeón de bolsas con búsqueda global. */
export default function ItemsCatalog({ meta }: { meta: CatalogMeta }) {
  const reduceMotion = useReducedMotionSafe();
  const [term, setTerm] = useState("");
  const deferredQ = useDeferredValue(term);
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
  } = useItemCatalogIndex(deferredQ);

  const [activePocket, setActivePocket] = useState<string | null>(null);
  const [selected, setSelected] = useState<Selection | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected && detailRef.current) {
      detailRef.current.scrollIntoView?.({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    }
  }, [selected?.group, selected?.id, reduceMotion]);

  const wasRefreshing = useRef(false);
  useEffect(() => {
    const refreshing = Boolean(status?.refreshing);
    if (wasRefreshing.current && !refreshing) {
      if (status?.lastError) {
        toast.error("No se pudo actualizar el catálogo", {
          description: status.lastError,
        });
      } else if (status?.generatedAt) {
        toast.success("Catálogo actualizado", {
          description: `${formatNumber(status.count)} entradas · ${formatDate(status.generatedAt)}`,
        });
      }
    }
    wasRefreshing.current = refreshing;
  }, [status]);

  const groups = useMemo(
    () => groupItemsByPocket(data?.items ?? []),
    [data?.items]
  );
  const searching = deferredQ.trim().length > 0;
  const activeGroup = activePocket
    ? (groups.find((group) => group.id === activePocket) ?? null)
    : null;

  const panelGroups =
    activePocket !== null
      ? activeGroup
        ? [activeGroup]
        : []
      : searching
        ? groups.filter((group) => group.count > 0)
        : [];
  const showPanel = activePocket !== null || (searching && panelGroups.length > 0);
  const panelTitle = activePocket
    ? (activeGroup?.label ?? "Objetos")
    : "Resultados de búsqueda";
  const panelSubtitle = activePocket
    ? `${formatNumber(activeGroup?.count ?? 0)} objetos · ${formatNumber(activeGroup?.categories.length ?? 0, 0)} categorías`
    : `${formatNumber(data?.meta.filtered ?? 0)} coincidencias en ${formatNumber(panelGroups.length, 0)} bolsas`;

  const handleRefresh = () => {
    refresh.mutate(undefined, {
      onSuccess: () => {
        toast.info("Actualización iniciada", {
          description: "Los datos actuales siguen disponibles mientras termina.",
        });
      },
      onError: (err) => {
        toast.error(getApiErrorMessage(err, "No se pudo iniciar la actualización."));
      },
    });
  };

  const togglePocket = (id: string) => {
    setActivePocket((previous) => (previous === id ? null : id));
    setSelected(null);
  };

  const toggleDetail = (entry: CatalogEntry) => {
    setSelected((previous) =>
      previous?.group === entry.group && previous.id === entry.id
        ? null
        : { group: entry.group, id: entry.id }
    );
  };

  if (isLoading) return <DataCenterSkeleton />;

  if (isError || !data) {
    return (
      <DataCenterError
        message={getApiErrorMessage(error, "No se pudo cargar el catálogo.")}
        onRetry={() => void refetch()}
      />
    );
  }

  const busy = refresh.isPending || isPolling || isFetching;

  return (
    <div className="min-w-0 space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-black text-ink-900">{meta.title}</h2>
          <p className="text-xs font-semibold text-ink-500">{meta.description}</p>
          <p className="mt-1 text-[11px] font-bold text-ink-500">
            {formatNumber(data.meta.filtered)} de {formatNumber(data.meta.total)} entradas
            {" · actualizado "}
            {formatDate(status?.generatedAt ?? data.meta.generatedAt)}
          </p>
          {isPolling && (
            <p className="mt-1 text-[11px] font-bold text-amber-700" role="status">
              Actualizando en segundo plano… los datos actuales siguen disponibles.
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

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="catalog-search" className="relative min-w-[200px] flex-1">
          <span className="sr-only">Buscar en {meta.label}</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500"
            aria-hidden="true"
          />
          <input
            id="catalog-search"
            name="catalog-search"
            type="search"
            autoComplete="off"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={`Buscar en ${meta.label.toLowerCase()}…`}
            className="w-full rounded-control border border-line bg-white/90 py-2.5 pl-9 pr-9 text-sm font-semibold text-ink-900 shadow-soft outline-none transition placeholder:text-ink-500 focus:border-red-400 focus:ring-2 focus:ring-red-200"
          />
          {term && (
            <button
              type="button"
              onClick={() => setTerm("")}
              aria-label="Limpiar búsqueda"
              className="focus-accent absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-control text-ink-500 transition hover:bg-red-50 hover:text-red-700"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </label>
      </div>

      <AnimatePresence>
        {selected && (
          <m.div
            ref={detailRef}
            key={`${selected.group}-${selected.id}`}
            variants={fadeUp}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            exit={reduceMotion ? undefined : "exit"}
          >
            <CatalogDetail
              category={meta.id}
              group={selected.group}
              id={selected.id}
              meta={meta}
              onClose={() => setSelected(null)}
            />
          </m.div>
        )}
      </AnimatePresence>

      {data.items.length === 0 ? (
        <DataCenterEmpty />
      ) : (
        <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(190px,230px)_minmax(0,1fr)] lg:gap-4">
          <ItemPocketRail
            groups={groups}
            active={activePocket}
            onSelect={togglePocket}
          />
          <div id="item-pocket-panel" className="min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              {showPanel && (
                <ItemPocketPanel
                  key={`${searching ? "search" : "browse"}-${activePocket ?? "all"}`}
                  title={panelTitle}
                  subtitle={panelSubtitle}
                  groups={panelGroups}
                  searching={searching}
                  searchTerm={deferredQ}
                  selected={selected}
                  onSelect={toggleDetail}
                  onClose={() => {
                    setActivePocket(null);
                    setSelected(null);
                  }}
                />
              )}
            </AnimatePresence>
            {!showPanel && (
              <div className="glass-surface rounded-card border border-line p-4 text-xs font-semibold text-ink-500 shadow-soft">
                Elige una bolsa para ver sus categorías de objetos.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
