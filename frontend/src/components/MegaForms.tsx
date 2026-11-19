import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { MegaForm, PokemonStat } from "../services/api";
import { usePokemonPreviews } from "../hooks/usePokemonPreviews";
import { STAT_NAMES } from "../utils/pokemon";
import PokemonArtwork from "./PokemonArtwork";
import {
  FormHero,
  FormSummary,
  TypePills,
  formArtwork,
  formatFormId,
  prettyFormName,
} from "./forms/FormPrimitives";

export interface MegaBaseForm {
  id: number;
  name: string;
  types: string[];
  stats?: PokemonStat[];
  artwork?: string;
}

interface MegaFormsProps {
  forms: MegaForm[];
  /** Ficha original para habilitar la comparación de formas. */
  base?: MegaBaseForm;
}

function megaTitle(form: MegaForm) {
  const base = prettyFormName(form.baseName);
  return form.variant ? `Mega ${base} ${form.variant}` : `Mega ${base}`;
}

interface MegaCardProps {
  form: MegaForm;
  selected: boolean;
  onSelect: () => void;
}

function MegaCard({ form, selected, onSelect }: MegaCardProps) {
  const title = megaTitle(form);

  return (
    <div
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-card border bg-surface transition duration-200 ${
        selected
          ? "border-violet-400 shadow-ambient ring-2 ring-violet-200"
          : "border-violet-100 shadow-card hover:-translate-y-1 hover:border-violet-300 hover:shadow-ambient motion-reduce:hover:translate-y-0"
      }`}
    >
      {selected && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-20 h-1.5 bg-gradient-to-r from-violet-600 via-indigo-500 to-fuchsia-500"
        />
      )}

      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`Seleccionar ${title} para comparar`}
        className="flex flex-1 flex-col text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-violet-300"
      >
        <div className="relative flex h-[196px] items-center justify-center overflow-hidden bg-gradient-to-br from-violet-50 via-indigo-50/70 to-fuchsia-50 sm:h-[212px]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full border-[22px] border-white/50"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-violet-200/40 blur-2xl"
          />

          <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-700 to-indigo-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-sm ring-1 ring-white/30">
            <span aria-hidden="true" className="text-[11px] leading-none">
              ⚡
            </span>
            MEGA{form.variant ? ` ${form.variant}` : ""}
          </span>

          {selected && (
            <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-violet-700 shadow-sm ring-1 ring-violet-200 backdrop-blur-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-2.5 w-2.5"
                aria-hidden="true"
              >
                <path d="m5 12 4.5 4.5L19 7" />
              </svg>
              Elegida
            </span>
          )}

          <PokemonArtwork
            id={form.id}
            name={title}
            src={formArtwork(form)}
            className="relative z-10 h-[160px] w-[160px] object-contain drop-shadow-[0_10px_18px_rgba(91,33,182,0.22)] transition-transform duration-200 ease-out group-hover:scale-105 motion-reduce:transform-none sm:h-[180px] sm:w-[180px]"
          />
        </div>

        <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-500">
            Forma Mega de {prettyFormName(form.baseName)}
          </p>
          <h3 className="mt-0.5 truncate text-lg font-black tracking-tight text-ink-900 transition-colors group-hover:text-violet-700">
            {title}
          </h3>

          <div className="mt-2">
            <TypePills types={form.types} />
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-violet-100/80 pt-2.5">
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide ${
                selected ? "text-violet-700" : "text-ink-500"
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${
                  selected ? "bg-violet-500" : "bg-violet-300"
                }`}
              />
              {selected ? "Comparando formas" : "Seleccionar para comparar"}
            </span>
            <span className="text-[10px] font-black text-violet-300">
              {formatFormId(form.id)}
            </span>
          </div>
        </div>
      </button>

      <div className="border-t border-violet-100 bg-violet-50/40 px-4 py-2.5">
        <Link
          to={`/pokemon/${form.id}`}
          title={`Ver la ficha de ${title}`}
          className="inline-flex w-full items-center justify-between gap-2 text-xs font-black text-violet-700 transition hover:text-violet-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
        >
          <span>Ver ficha completa</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function StatComparison({
  baseName,
  megaName,
  baseStats,
  megaStats,
}: {
  baseName: string;
  megaName: string;
  baseStats: PokemonStat[];
  megaStats: PokemonStat[];
}) {
  const megaByName = useMemo(
    () => new Map(megaStats.map((stat) => [stat.name, stat.base_stat])),
    [megaStats]
  );

  const rows = baseStats
    .map((stat) => {
      const megaValue = megaByName.get(stat.name);
      if (typeof megaValue !== "number") return null;
      return {
        name: stat.name,
        label: STAT_NAMES[stat.name] ?? stat.name,
        base: stat.base_stat,
        mega: megaValue,
        delta: megaValue - stat.base_stat,
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  if (rows.length === 0) return null;

  const baseTotal = rows.reduce((total, row) => total + row.base, 0);
  const megaTotal = rows.reduce((total, row) => total + row.mega, 0);
  const totalDelta = megaTotal - baseTotal;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-black uppercase tracking-wider text-ink-700">
            Estadísticas base
          </h4>
          <p className="text-[11px] font-semibold text-ink-500">
            {baseName} vs. {megaName}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-violet-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-ink-500">
          <span>Total</span>
          <span className="text-ink-900">{baseTotal}</span>
          <span aria-hidden="true">→</span>
          <span className="text-violet-700">{megaTotal}</span>
          <span
            className={`rounded-full px-1.5 py-0.5 ${
              totalDelta > 0
                ? "bg-emerald-100 text-emerald-700"
                : totalDelta < 0
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-100 text-ink-500"
            }`}
          >
            {totalDelta > 0 ? `+${totalDelta}` : totalDelta}
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {rows.map((row) => {
          const baseWidth = Math.min(100, Math.round((row.base / 200) * 100));
          const megaWidth = Math.min(100, Math.round((row.mega / 200) * 100));

          return (
            <div key={row.name} className="flex items-center gap-2.5">
              <span className="w-[74px] shrink-0 truncate text-[11px] font-bold text-ink-700">
                {row.label}
              </span>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-7 shrink-0 text-right text-[10px] font-bold text-ink-500">
                    {row.base}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-400"
                      style={{ width: `${baseWidth}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 shrink-0 text-right text-[10px] font-black text-violet-700">
                    {row.mega}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-violet-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                      style={{ width: `${megaWidth}%` }}
                    />
                  </div>
                </div>
              </div>

              <span
                className={`w-9 shrink-0 rounded-full px-1 py-0.5 text-center text-[10px] font-black ${
                  row.delta > 0
                    ? "bg-emerald-50 text-emerald-700"
                    : row.delta < 0
                      ? "bg-red-50 text-red-700"
                      : "bg-slate-100 text-ink-500"
                }`}
              >
                {row.delta > 0 ? `+${row.delta}` : row.delta}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MegaForms({ forms, base }: MegaFormsProps) {
  const [selectedId, setSelectedId] = useState<number | null>(forms[0]?.id ?? null);

  useEffect(() => {
    setSelectedId((current) =>
      current && forms.some((form) => form.id === current)
        ? current
        : forms[0]?.id ?? null
    );
  }, [forms]);

  const selectedForm = forms.find((form) => form.id === selectedId) ?? forms[0];
  const previewIds = base && selectedForm ? [selectedForm.id] : [];
  const { previews, pending, failed } = usePokemonPreviews(previewIds);
  const selectedPreview = selectedForm ? previews[selectedForm.id] : undefined;

  if (forms.length === 0) return null;

  const title = selectedForm ? megaTitle(selectedForm) : "";
  const megaArtwork =
    selectedForm &&
    formArtwork(selectedForm) !== undefined
      ? selectedPreview?.artwork ?? formArtwork(selectedForm)
      : undefined;

  const canCompare = Boolean(base && base.stats?.length);
  const hasStats = Boolean(canCompare && selectedPreview?.stats?.length);

  return (
    <section
      id="mega-title"
      aria-labelledby="mega-title"
      className="glass-surface glass-blur mt-6 scroll-mt-20 overflow-hidden rounded-card border border-violet-200 bg-surface shadow-card"
    >
      <FormHero
        tone="violet"
        badge="Energía Mega"
        emoji="💥"
        title="Megaevoluciones"
        titleId="mega-title"
        subtitle="Formas de pelea temporales. No son evolución permanente."
        aside={
          <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold ring-1 ring-white/25">
            {forms.length} {forms.length === 1 ? "forma" : "formas"}
          </span>
        }
      />

      <div className="bg-gradient-to-b from-white/60 via-white/40 to-violet-50/30 p-5 sm:p-6 lg:p-8">
        <div className="flex flex-wrap justify-center gap-4">
          {forms.map((form) => (
            <div
              key={form.id}
              className="flex w-full sm:w-[calc((100%_-_1rem)/2)]"
            >
              <MegaCard
                form={form}
                selected={form.id === selectedForm?.id}
                onSelect={() => setSelectedId(form.id)}
              />
            </div>
          ))}
        </div>

        {canCompare && selectedForm && base && (
          <div className="glass-surface mt-6 overflow-hidden rounded-card border border-violet-200 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-violet-100 bg-gradient-to-r from-violet-50/80 to-white px-5 py-4">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-ink-700">
                  <span aria-hidden="true" className="text-base">
                    ⚖️
                  </span>
                  Comparación de formas
                </h3>
                <p className="mt-0.5 text-[11px] font-semibold text-ink-500">
                  {prettyFormName(base.name)} frente a {title}
                </p>
              </div>
              <span className="rounded-full border border-violet-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-violet-700">
                Datos de la Pokédex
              </span>
            </div>

            <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-6">
              <div className="grid grid-cols-2 gap-3">
                <FormSummary
                  label="Original"
                  name={prettyFormName(base.name)}
                  id={base.id}
                  types={base.types}
                  artwork={base.artwork}
                  tone="base"
                />
                <FormSummary
                  label={selectedForm.variant ? `MEGA ${selectedForm.variant}` : "MEGA"}
                  name={title}
                  id={selectedForm.id}
                  types={selectedForm.types}
                  artwork={megaArtwork}
                  tone="mega"
                />
              </div>

              <div className="min-w-0">
                {hasStats && (
                  <StatComparison
                    baseName={prettyFormName(base.name)}
                    megaName={title}
                    baseStats={base.stats ?? []}
                    megaStats={selectedPreview?.stats ?? []}
                  />
                )}

                {!hasStats && pending && (
                  <div
                    className="space-y-3"
                    role="status"
                    aria-label="Cargando estadísticas de la Megaevolución"
                  >
                    <div className="skeleton h-4 w-40 rounded" />
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="skeleton h-7 w-full rounded-lg" />
                    ))}
                    <p className="text-[11px] font-semibold text-ink-500">
                      Consultando las estadísticas de esta forma…
                    </p>
                  </div>
                )}

                {!hasStats && !pending && (
                  <div className="flex h-full min-h-[120px] flex-col items-center justify-center rounded-[12px] border border-dashed border-violet-200 bg-violet-50/40 p-4 text-center">
                    <span aria-hidden="true" className="text-2xl">
                      🔎
                    </span>
                    <p className="mt-2 text-xs font-bold text-ink-700">
                      {failed || !selectedPreview
                        ? "No hay datos de estadísticas disponibles para esta forma."
                        : "Esta forma no trae estadísticas comparables."}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-500">
                      Puedes revisar el detalle completo en su ficha.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export { prettyFormName as prettyMegaName };
