import { m } from "framer-motion";
import { X } from "lucide-react";
import TypeBadge from "../../../../components/TypeBadge";
import { getApiErrorMessage } from "../../../../services/api";
import {
  DataCenterError,
  DataCenterSkeleton,
} from "../../components/DataCenterState";
import { useDataCenterCatalogItem } from "../../hooks/useDataCenterCatalog";
import { groupLabel, type CatalogMeta } from "../../lib/catalogs";
import { fadeUp } from "../../../../lib/motion";
import type { CatalogAttribute, CatalogCategory } from "../../lib/types";

interface Props {
  category: CatalogCategory;
  group: string;
  id: number;
  meta: CatalogMeta;
  onClose: () => void;
}

function AttributeValue({ attribute }: { attribute: CatalogAttribute }) {
  if (!attribute.isTypeName) {
    return <span className="font-bold text-ink-900">{attribute.value}</span>;
  }

  return (
    <span className="flex flex-wrap gap-1">
      {attribute.value.split(" · ").map((type) => (
        <TypeBadge key={type} type={type} size="xs" />
      ))}
    </span>
  );
}

/** Panel de detalle: solo monta la ficha del recurso que el usuario abrió. */
export default function CatalogDetail({
  category,
  group,
  id,
  meta,
  onClose,
}: Props) {
  const { data, isLoading, isError, error, refetch } = useDataCenterCatalogItem(
    category,
    group,
    id
  );

  return (
    <m.section
      aria-label="Detalle del recurso"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="glass-surface glass-blur rounded-card border border-line p-4 shadow-card sm:p-5"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {data?.sprite && (
            <img
              src={data.sprite}
              alt=""
              aria-hidden="true"
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 object-contain"
            />
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-red-700">
              {groupLabel(meta, group)} · #{String(id).padStart(3, "0")}
            </p>
            <h3 className="mt-1 text-lg font-black text-ink-900">
              {data?.label ?? "Cargando…"}
            </h3>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalle"
          className="focus-accent grid h-9 w-9 shrink-0 place-items-center rounded-control border border-line bg-white text-ink-500 transition hover:border-red-300 hover:text-red-700"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {isLoading ? (
        <div className="max-w-md">
          <DataCenterSkeleton />
        </div>
      ) : isError || !data ? (
        <DataCenterError
          message={getApiErrorMessage(error, "No se pudo cargar el detalle.")}
          onRetry={() => void refetch()}
        />
      ) : (
        <div className="space-y-4">
          {data.summary && (
            <p className="rounded-control border border-line-soft bg-white/70 p-3 text-xs font-semibold leading-relaxed text-ink-700">
              {data.summary}
            </p>
          )}
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.attributes.map((attribute) => (
              <div key={attribute.key} className="min-w-0 border-t border-line-soft pt-2">
                <dt className="text-[10px] font-extrabold uppercase tracking-wide text-ink-500">
                  {attribute.label}
                </dt>
                <dd className="mt-1 break-words text-xs">
                  <AttributeValue attribute={attribute} />
                </dd>
              </div>
            ))}
          </dl>
          {data.attributes.length === 0 && (
            <p className="text-xs font-semibold text-ink-500">
              PokéAPI no entrega datos adicionales para este recurso.
            </p>
          )}
        </div>
      )}
    </m.section>
  );
}
