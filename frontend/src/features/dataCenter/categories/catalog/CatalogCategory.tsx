import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, m } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
} from "lucide-react";
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
import { useDataCenterCatalog } from "../../hooks/useDataCenterCatalog";
import {
  DATA_CENTER_CATALOGS,
  getCatalogMeta,
  groupLabel,
  type CatalogMeta,
} from "../../lib/catalogs";
import { formatDate, formatNumber } from "../../lib/format";
import type { CatalogQuery } from "../../lib/types";
import CatalogCard from "./CatalogCard";
import CatalogDetail from "./CatalogDetail";
import ItemsCatalog from "./ItemsCatalog";

const PAGE_SIZE = 12;

const INITIAL_QUERY: CatalogQuery = {
  q: "",
  group: null,
  limit: PAGE_SIZE,
  offset: 0,
};

/**
 * La categoría viene del mismo parámetro `?category=` que ya usa la página.
 * Objetos tienen su propio acordeón; bayas conservan el panel genérico.
 */
export default function CatalogCategory() {
  const [searchParams] = useSearchParams();
  const category = getCatalogMeta(searchParams.get("category")).id;
  return category === "items" ? (
    <ItemsCatalog meta={DATA_CENTER_CATALOGS.items} />
  ) : (
    <GenericCatalog meta={DATA_CENTER_CATALOGS[category]} />
  );
}

/** Panel genérico que siguen usando el resto de catálogos. */
function GenericCatalog({ meta }: { meta: CatalogMeta }) {
  const category = meta.id;
  const reduceMotion = useReducedMotionSafe();

  const [query, setQuery] = useState<CatalogQuery>(INITIAL_QUERY);
  const deferredQ = useDeferredValue(query.q);
  const catalogQuery = useMemo(
    () => ({ ...query, q: deferredQ }),
    [query, deferredQ]
  );
  const [selected, setSelected] = useState<{ group: string; id: number } | null>(
    null
  );
  const detailRef = useRef<HTMLDivElement>(null);

  // El detalle se monta encima de la grilla: lo dejamos visible al abrirlo.
  useEffect(() => {
    if (!selected || !detailRef.current) return;
    detailRef.current.scrollIntoView?.({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [selected?.group, selected?.id, reduceMotion]);

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
  } = useDataCenterCatalog(category, catalogQuery);

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

  const changeQuery = (patch: Partial<CatalogQuery>) => {
    setQuery((previous) => ({
      ...previous,
      ...patch,
      ...("q" in patch || "group" in patch ? { offset: 0 } : {}),
    }));
    setSelected(null);
  };

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

  if (isLoading) return <DataCenterSkeleton />;

  if (isError || !data) {
    return (
      <DataCenterError
        message={getApiErrorMessage(error, "No se pudo cargar el catálogo.")}
        onRetry={() => void refetch()}
      />
    );
  }

  const { meta: info, items, groups } = data;
  const busy = refresh.isPending || isPolling || isFetching;
  const totalPages = Math.max(1, Math.ceil(info.filtered / info.limit));
  const page = Math.floor(info.offset / info.limit) + 1;
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-black text-ink-900">{meta.title}</h2>
          <p className="text-xs font-semibold text-ink-500">
            {meta.description}
          </p>
          <p className="mt-1 text-[11px] font-bold text-ink-500">
            {formatNumber(info.filtered)} de {formatNumber(info.total)} entradas
            {query.group ? ` · ${groupLabel(meta, query.group)}` : ""}
            {" · actualizado "}
            {formatDate(status?.generatedAt ?? info.generatedAt)}
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

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Entradas" value={formatNumber(info.total)} />
        <SummaryCard
          label="Con estos filtros"
          value={formatNumber(info.filtered)}
        />
        <SummaryCard label="Recursos" value={String(groups.length)} />
      </div>

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
            value={query.q}
            onChange={(event) => changeQuery({ q: event.target.value })}
            placeholder={`Buscar en ${meta.label.toLowerCase()}…`}
            className="w-full rounded-control border border-line bg-white/90 py-2.5 pl-9 pr-3 text-sm font-semibold text-ink-900 shadow-soft outline-none transition placeholder:text-ink-500 focus:border-red-400 focus:ring-2 focus:ring-red-200"
          />
        </label>
        {groups.length > 1 && (
          <label htmlFor="catalog-group" className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wide text-ink-500">
              Recurso
            </span>
            <select
              id="catalog-group"
              name="catalog-group"
              value={query.group ?? ""}
              onChange={(event) =>
                changeQuery({ group: event.target.value || null })
              }
              className="focus-accent rounded-control border border-line bg-white/90 px-3 py-2.5 text-xs font-bold text-ink-700 shadow-soft outline-none"
            >
              <option value="">Todos</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {groupLabel(meta, group.id)} ({formatNumber(group.count)})
                </option>
              ))}
            </select>
          </label>
        )}
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
              category={category}
              group={selected.group}
              id={selected.id}
              meta={meta}
              onClose={() => setSelected(null)}
            />
          </m.div>
        )}
      </AnimatePresence>

      {info.filtered === 0 ? (
        <DataCenterEmpty />
      ) : (
        <>
          <ul
            aria-label={`Entradas de ${meta.label}`}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {items.map((entry) => (
              <li key={`${entry.group}-${entry.id}`}>
                <CatalogCard
                  entry={entry}
                  meta={meta}
                  selected={
                    selected?.group === entry.group && selected.id === entry.id
                  }
                  onSelect={() =>
                    setSelected((previous) =>
                      previous?.group === entry.group && previous.id === entry.id
                        ? null
                        : { group: entry.group, id: entry.id }
                    )
                  }
                />
              </li>
            ))}
          </ul>

          <nav
            aria-label="Paginación del catálogo"
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <button
              type="button"
              onClick={() =>
                changeQuery({
                  offset: Math.max(0, info.offset - info.limit),
                })
              }
              disabled={info.offset === 0}
              className="focus-accent inline-flex min-h-[40px] items-center gap-1 rounded-control border border-line bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-sm transition hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Anterior
            </button>
            <span className="text-xs font-bold tabular-nums text-ink-500">
              Página {formatNumber(page, 0)} de {formatNumber(totalPages, 0)}
            </span>
            <button
              type="button"
              onClick={() =>
                changeQuery({ offset: info.offset + info.limit })
              }
              disabled={info.offset + info.limit >= info.filtered}
              className="focus-accent inline-flex min-h-[40px] items-center gap-1 rounded-control border border-line bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-sm transition hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-surface rounded-card border border-line p-3 shadow-soft">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-black tabular-nums text-ink-900">{value}</p>
    </div>
  );
}
