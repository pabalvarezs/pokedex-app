import { useEffect, useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { GmaxForm, GmaxRelative, PokemonStat } from "../services/api";
import {
  dynamaxHp,
  dynamaxLevelLabel,
  formatDynamaxMultiplier,
  isDynamaxBlocked,
  isShedinja,
} from "../utils/dynamax";
import {
  GMAX_POWER_NOTE,
  MAX_GUARD,
  MAX_MOVES,
  type MaxMove,
} from "../utils/maxMoves";
import { getTypeBadge, STAT_NAMES } from "../utils/pokemon";
import PokemonArtwork from "./PokemonArtwork";
import {
  FormSummary,
  TypePills,
  formArtwork,
  formatFormId,
  prettyFormName,
} from "./forms/FormPrimitives";

interface DynamaxBaseForm {
  id: number;
  name: string;
  types: string[];
  stats?: PokemonStat[];
  artwork?: string;
  /** Altura en decímetros. */
  height?: number;
}

interface DynamaxFormsProps {
  forms: GmaxForm[];
  base: DynamaxBaseForm;
  speciesId?: number;
  /** Otras etapas de la cadena que sí pueden Gigamaxizar. */
  gmaxRelatives?: GmaxRelative[];
}

const ETERNAMAX_ID = 10190;
const ETERNAMAX_ARTWORK = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${ETERNAMAX_ID}.png`;

function gmaxTitle(form: GmaxForm) {
  const base = prettyFormName(form.baseName);
  return form.variant ? `Gigamax ${base} ${form.variant}` : `Gigamax ${base}`;
}

function formatHeight(height: number | undefined, approximate: boolean) {
  if (typeof height !== "number" || height <= 0) return "Desconocida";
  const meters = (height / 10).toFixed(1).replace(".", ",");
  return `${approximate ? "Más de " : ""}${meters} m`;
}

function TypeBadge({ type }: { type: string }) {
  const badge = getTypeBadge(type);
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${badge.bg} ${badge.text} ${badge.border}`}
    >
      {badge.es}
    </span>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/** Acordeón reutilizable para la información secundaria. */
function Disclosure({
  title,
  description,
  icon,
  children,
  defaultOpen = false,
  className = "",
}: {
  title: string;
  description?: string;
  icon?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div
      className={`glass-surface overflow-hidden rounded-[14px] border border-line ${className}`}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-300"
      >
        <span className="flex min-w-0 items-center gap-2">
          {icon && (
            <span aria-hidden="true" className="text-sm leading-none">
              {icon}
            </span>
          )}
          <span className="min-w-0">
            <span className="block text-[11px] font-black uppercase tracking-wider text-ink-700">
              {title}
            </span>
            {description && (
              <span className="mt-0.5 block text-[10px] font-semibold text-ink-500">
                {description}
              </span>
            )}
          </span>
        </span>
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink-500">
          <Chevron open={open} />
        </span>
      </button>

      {open && (
        <div id={panelId} className="border-t border-line-soft px-4 py-4">
          {children}
        </div>
      )}
    </div>
  );
}

function DynamaxHeader({ formsCount }: { formsCount: number }) {
  return (
    <header className="relative overflow-hidden border-b border-line-soft bg-gradient-to-br from-white via-white to-rose-50/70">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border-[38px] border-rose-100/70"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/3 h-44 w-44 rounded-full bg-amber-100/50 blur-3xl"
      />

      <div className="relative flex items-start gap-3 px-5 py-5 sm:gap-4 sm:px-7 sm:py-6">
        <span className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 to-red-500 text-white shadow-sm sm:h-12 sm:w-12">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path d="M12 3c2.6 3.2 4 5.8 4 8a4 4 0 0 1-8 0c0-2.2 1.4-4.8 4-8Z" />
            <path d="M12 21v-5" />
            <path d="M9 21h6" />
          </svg>
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-600">
            Transformación Max
          </p>
          <h2
            id="dynamax-heading"
            className="mt-1 text-2xl font-black tracking-tight text-ink-900 sm:text-[1.7rem]"
          >
            Dinamax y Gigamax
          </h2>
          <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-ink-500 sm:text-sm">
            Una transformación temporal que aumenta los PS y convierte los
            movimientos en Max Moves. Solo algunas especies conservan una forma
            Gigamax propia.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/90 px-2.5 py-1 text-[10px] font-bold text-ink-700 shadow-sm">
              <span aria-hidden="true">⏳</span>
              <span>3 turnos</span>
            </span>
            <span
              title="Los PS pasan de ×1,5 a ×2,0 según el nivel Dinamax"
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/90 px-2.5 py-1 text-[10px] font-bold text-ink-700 shadow-sm"
            >
              <span aria-hidden="true">❤️</span>
              <span>PS ×1,5 a ×2,0</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/90 px-2.5 py-1 text-[10px] font-bold text-ink-700 shadow-sm">
              <span aria-hidden="true">🔒</span>
              <span>1 vez por combate</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700 shadow-sm">
              <span aria-hidden="true">🌋</span>
              <span>
                {formsCount > 0
                  ? `${formsCount} ${formsCount === 1 ? "forma" : "formas"} G-Max`
                  : "Sin forma G-Max"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

function RulesList() {
  const rules = [
    {
      icon: "⏳",
      title: "3 turnos",
      detail: "Termina antes si el Pokémon cambia.",
    },
    {
      icon: "❤️",
      title: "PS ×1,5 a ×2,0",
      detail: "Según el nivel Dinamax (0 a 10).",
    },
    {
      icon: "🎯",
      title: "Todo son Max Moves",
      detail: "Los de estado usan Maxibarrera.",
    },
    {
      icon: "🔒",
      title: "1 vez por combate",
      detail: "Requiere la Banda Dinamax.",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {rules.map((rule) => (
        <div
          key={rule.title}
          className="flex items-start gap-2.5 rounded-[12px] border border-line-soft bg-slate-50/70 p-3"
        >
          <span aria-hidden="true" className="text-base leading-none">
            {rule.icon}
          </span>
          <div>
            <p className="text-xs font-black text-ink-900">{rule.title}</p>
            <p className="mt-0.5 text-[10px] font-semibold text-ink-500">
              {rule.detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function HpPanel({
  baseHp,
  level,
  onLevelChange,
  speciesId,
}: {
  baseHp: number | undefined;
  level: number;
  onLevelChange: (level: number) => void;
  speciesId?: number;
}) {
  const boosted =
    typeof baseHp === "number" ? dynamaxHp(baseHp, level, speciesId) : undefined;
  const scale = Math.max(1, (baseHp ?? 1) * 2);
  const baseWidth = Math.min(100, Math.round(((baseHp ?? 0) / scale) * 100));
  const boostedWidth = Math.min(
    100,
    Math.round(((boosted ?? 0) / scale) * 100)
  );
  const shedinja = isShedinja(speciesId);

  return (
    <div className="glass-surface overflow-hidden rounded-card border border-line shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft bg-gradient-to-r from-rose-50/70 to-white px-4 py-3.5 sm:px-5">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-ink-700">
            <span aria-hidden="true">❤️</span>
            PS bajo Dinamax
          </h3>
          <p className="mt-0.5 text-[11px] font-semibold text-ink-500">
            El multiplicador se aplica a los PS máximos del Pokémon.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="dynamax-level"
            className="text-[10px] font-black uppercase tracking-wide text-ink-500"
          >
            Nivel Dinamax
          </label>
          <output
            htmlFor="dynamax-level"
            className="rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-black text-white"
          >
            {level}
          </output>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <input
            id="dynamax-level"
            type="range"
            min={0}
            max={10}
            step={1}
            value={level}
            onChange={(event) => onLevelChange(Number(event.target.value))}
            aria-valuetext={dynamaxLevelLabel(level)}
            className="h-2 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-rose-100 accent-rose-600"
          />
          <span className="w-14 shrink-0 text-right text-sm font-black text-rose-700">
            {formatDynamaxMultiplier(level)}
          </span>
        </div>
        <div className="mt-1 flex justify-between text-[9px] font-bold uppercase tracking-wide text-ink-500">
          <span>Nivel 0 · inicial</span>
          <span>Nivel 10 · máximo</span>
        </div>

        {typeof baseHp === "number" && typeof boosted === "number" ? (
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-2">
            <div
              aria-label="PS base"
              className="rounded-[12px] border border-line bg-slate-50/70 p-2.5 sm:p-3"
            >
              <p className="text-[10px] font-bold uppercase leading-tight tracking-wide text-ink-500">
                PS base
              </p>
              <p className="text-2xl font-black text-ink-900">{baseHp}</p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-slate-400"
                  style={{ width: `${baseWidth}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-center">
              <span
                aria-hidden="true"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white text-xs font-black text-rose-700 shadow-sm sm:h-8 sm:w-8"
              >
                →
              </span>
            </div>

            <div
              aria-label="PS con Dinamax"
              className="rounded-[12px] border border-rose-200 bg-gradient-to-b from-rose-50 to-white p-2.5 sm:p-3"
            >
              <p className="text-[10px] font-bold uppercase leading-tight tracking-wide text-rose-700">
                PS con Dinamax
              </p>
              <p className="text-2xl font-black text-rose-700">{boosted}</p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-rose-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400"
                  style={{ width: `${boostedWidth}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 rounded-[12px] border border-dashed border-rose-200 bg-rose-50/40 p-3 text-[11px] font-semibold text-ink-500">
            No hay una estadística de PS disponible para esta forma.
          </p>
        )}

        <p className="mt-3 text-[10px] font-semibold text-ink-500">
          {shedinja
            ? "Shedinja no gana PS al Dinamaxizar: conserva siempre 1 PS."
            : "Referencia calculada sobre la estadística base de PS, igual que el resto de la ficha."}
        </p>
      </div>
    </div>
  );
}

function MechanicsSection({
  baseHp,
  level,
  onLevelChange,
  speciesId,
}: {
  baseHp: number | undefined;
  level: number;
  onLevelChange: (level: number) => void;
  speciesId?: number;
}) {
  return (
    <div className="space-y-3">
      <HpPanel
        baseHp={baseHp}
        level={level}
        onLevelChange={onLevelChange}
        speciesId={speciesId}
      />
      <Disclosure
        title="Reglas de la transformación"
        description="Qué cambia durante los 3 turnos y cómo se activa"
        icon="📘"
      >
        <RulesList />
      </Disclosure>
    </div>
  );
}

function MaxMoveCard({
  move,
  highlighted,
}: {
  move: MaxMove;
  highlighted: boolean;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const badge = getTypeBadge(move.type);

  return (
    <article
      className={`overflow-hidden rounded-[12px] border transition ${
        highlighted
          ? "border-rose-200 bg-rose-50/60"
          : "border-line bg-white hover:border-slate-300"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Ver efecto de ${move.name}`}
        className="flex w-full items-center justify-between gap-2 p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-300"
      >
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-sm font-black text-ink-900">
              {move.name}
            </span>
            <TypeBadge type={move.type} />
          </span>
          <span
            className={`mt-1 block text-[9px] font-black uppercase tracking-wide ${
              highlighted ? "text-rose-700" : "text-ink-500"
            }`}
          >
            {move.isStatus
              ? "Movimiento de estado"
              : highlighted
                ? `Tu Max Move de ${badge.es}`
                : `Max Move de ${badge.es}`}
          </span>
        </span>
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink-500">
          <Chevron open={open} />
        </span>
      </button>

      {open && (
        <div
          id={panelId}
          className="border-t border-line-soft/80 px-3 py-2.5 text-[11px] font-medium leading-snug text-ink-500"
        >
          {move.effect}
        </div>
      )}
    </article>
  );
}

function MaxMoveGrid({ types }: { types: string[] }) {
  const [showAll, setShowAll] = useState(false);

  const matching = useMemo(
    () => MAX_MOVES.filter((move) => !move.isStatus && types.includes(move.type)),
    [types]
  );

  const ordered = useMemo(() => {
    const rest = MAX_MOVES.filter(
      (move) => !move.isStatus && !types.includes(move.type)
    );
    return [...matching, ...rest, MAX_GUARD];
  }, [matching, types]);

  const visible = showAll ? ordered : [...matching, MAX_GUARD];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-ink-700">
            <span aria-hidden="true">🎯</span>
            Movimientos Max
          </h3>
          <p className="mt-0.5 text-[11px] font-semibold text-ink-500">
            Al Dinamaxizar, cada ataque se convierte en el Max Move de su tipo.
            Toca una tarjeta para ver su efecto.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAll((current) => !current)}
          aria-expanded={showAll}
          aria-controls="max-move-grid"
          className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-rose-700 transition hover:border-rose-300 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          {showAll ? "Ver solo mis tipos" : "Ver los 19 Max Moves"}
          <Chevron open={showAll} />
        </button>
      </div>

      <div
        id="max-move-grid"
        className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
      >
        {visible.map((move) => (
          <MaxMoveCard
            key={move.slug}
            move={move}
            highlighted={!move.isStatus && types.includes(move.type)}
          />
        ))}
      </div>
    </div>
  );
}

function GmaxSelector({
  forms,
  selectedId,
  onSelect,
}: {
  forms: GmaxForm[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Elegir forma Gigamax"
      className="grid gap-2 sm:grid-cols-2"
    >
      {forms.map((form) => {
        const selected = form.id === selectedId;
        const title = gmaxTitle(form);

        return (
          <button
            key={form.id}
            type="button"
            onClick={() => onSelect(form.id)}
            aria-pressed={selected}
            aria-label={`Seleccionar ${title}`}
            className={`group flex items-center gap-3 rounded-[14px] border p-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 ${
              selected
                ? "border-rose-300 bg-gradient-to-r from-rose-50 to-white shadow-sm ring-1 ring-rose-200"
                : "border-line bg-white hover:border-rose-200 hover:bg-rose-50/40"
            }`}
          >
            <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50">
              <PokemonArtwork
                id={form.id}
                name={title}
                src={formArtwork(form)}
                className="h-12 w-12 object-contain transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-black text-ink-900">
                {title}
              </span>
              <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wide text-ink-500">
                {formatFormId(form.id)}
              </span>
            </span>
            <span
              aria-hidden="true"
              className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                selected
                  ? "border-rose-300 bg-rose-600 text-white"
                  : "border-line bg-white text-transparent"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
              >
                <path d="m5 12 4.5 4.5L19 7" />
              </svg>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function GmaxComparison({
  base,
  form,
}: {
  base: DynamaxBaseForm;
  form: GmaxForm;
}) {
  const heightDelta =
    typeof base.height === "number" &&
    base.height > 0 &&
    typeof form.height === "number" &&
    form.height > 0
      ? form.height / base.height
      : undefined;

  return (
    <div className="border-t border-rose-100 bg-gradient-to-b from-rose-50/50 to-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-ink-700">
            <span aria-hidden="true">⚖️</span>
            Comparación de formas
          </h4>
          <p className="mt-0.5 text-[11px] font-semibold text-ink-500">
            {prettyFormName(base.name)} frente a {gmaxTitle(form)}
          </p>
        </div>
        <span className="rounded-full border border-rose-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-rose-700">
          Datos de la Pokédex
        </span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-stretch">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <FormSummary
            size="large"
            label="Original"
            name={prettyFormName(base.name)}
            id={base.id}
            types={base.types}
            artwork={base.artwork}
            tone="base"
          />
          <FormSummary
            size="large"
            label={form.variant ? `GIGAMAX ${form.variant}` : "GIGAMAX"}
            name={gmaxTitle(form)}
            id={form.id}
            types={form.types}
            artwork={formArtwork(form)}
            tone="gmax"
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-[12px] border border-line bg-white/60 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500">
                Altura original
              </p>
              <p className="mt-0.5 text-sm font-black text-ink-900">
                {formatHeight(base.height, false)}
              </p>
            </div>
            <div className="rounded-[12px] border border-rose-200 bg-white/60 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-rose-700">
                Altura Gigamax
              </p>
              <p className="mt-0.5 text-sm font-black text-rose-700">
                {formatHeight(form.height, true)}
              </p>
            </div>
          </div>

          {typeof heightDelta === "number" && heightDelta > 1 && (
            <div
              className="flex items-center justify-between gap-2 rounded-[12px] border border-amber-200 bg-amber-50/70 px-3 py-2.5"
              title="Crecimiento aproximado de la altura respecto a la forma original"
            >
              <span className="text-[10px] font-bold uppercase tracking-wide text-amber-800">
                Diferencia de altura
              </span>
              <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[11px] font-black text-white">
                ×{heightDelta.toFixed(1).replace(".", ",")}
              </span>
            </div>
          )}

          <p className="rounded-[12px] border border-dashed border-rose-200 bg-white/80 p-3 text-[11px] font-semibold leading-relaxed text-ink-500">
            Las estadísticas base no cambian: Gigamax solo altera la apariencia y
            añade un movimiento exclusivo.
          </p>
        </div>
      </div>
    </div>
  );
}

function BaseStats({ stats }: { stats?: PokemonStat[] }) {
  if (!stats?.length) {
    return (
      <p className="rounded-[10px] border border-dashed border-line bg-slate-50/70 p-3 text-[11px] font-semibold text-ink-500">
        No hay estadísticas base disponibles para esta forma.
      </p>
    );
  }

  const total = stats.reduce((sum, stat) => sum + stat.base_stat, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wide text-ink-500">
        <span>Estadísticas compartidas</span>
        <span className="rounded-full border border-line bg-white px-2 py-0.5 text-ink-700">
          Total {total}
        </span>
      </div>
      {stats.map((stat) => {
        const width = Math.min(100, Math.round((stat.base_stat / 200) * 100));
        return (
          <div key={stat.name} className="flex items-center gap-2.5">
            <span className="w-[74px] shrink-0 truncate text-[10px] font-bold text-ink-700">
              {STAT_NAMES[stat.name] ?? stat.name}
            </span>
            <span className="w-7 shrink-0 text-right text-[10px] font-black text-ink-900">
              {stat.base_stat}
            </span>
            <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400"
                style={{ width: `${width}%` }}
              />
            </span>
          </div>
        );
      })}
    </div>
  );
}

function GmaxDetail({
  base,
  form,
}: {
  base: DynamaxBaseForm;
  form: GmaxForm;
}) {
  const move = form.gmaxMove;
  const samePage = base.id === form.id;
  const badge = move ? getTypeBadge(move.type) : undefined;

  const factorNotes = [
    form.name === "melmetal-gmax"
      ? "Melmetal no puede usar Sopa Max: el Factor Gigamax solo se consigue por Pokémon HOME."
      : null,
    /^(pikachu|meowth|eevee)-gmax$/.test(form.name)
      ? "Con el Factor Gigamax, este Pokémon no puede evolucionar."
      : null,
  ].filter((note): note is string => Boolean(note));

  return (
    <div className="glass-surface mt-4 overflow-hidden rounded-card border border-rose-200 shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Ilustración protagonista: ocupa la mitad del bloque en escritorio */}
        <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-5 sm:min-h-[360px] sm:p-8 lg:min-h-[440px]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[30px] border-white/60"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-14 h-56 w-56 rounded-full bg-amber-200/50 blur-3xl"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 bottom-8 h-10 rounded-[100%] bg-rose-900/10 blur-xl"
          />

          <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-700 to-red-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-sm ring-1 ring-white/30">
            <span aria-hidden="true">🌋</span>
            Gigamax
            {form.variant ? ` ${form.variant}` : ""}
          </span>

          <span className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black text-rose-700 shadow-sm ring-1 ring-rose-200 backdrop-blur-sm">
            {formatFormId(form.id)}
          </span>

          <PokemonArtwork
            id={form.id}
            name={gmaxTitle(form)}
            src={formArtwork(form)}
            priority
            className="relative z-10 h-[250px] w-full max-w-[320px] object-contain drop-shadow-[0_18px_28px_rgba(190,18,60,0.24)] sm:h-[310px] sm:max-w-[380px] lg:h-[360px] lg:max-w-[420px]"
          />
        </div>

        <div className="min-w-0 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-rose-600">
                Forma Gigamax
              </p>
              <h3 className="mt-0.5 text-2xl font-black tracking-tight text-ink-900">
                {gmaxTitle(form)}
              </h3>
            </div>
            <span
              title="Forma disponible solo durante el combate"
              className="shrink-0 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-black text-rose-700"
            >
              Solo en combate
            </span>
          </div>

          <div className="mt-2">
            <TypePills types={form.types} />
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            <div className="rounded-[10px] border border-line bg-slate-50/60 p-2.5">
              <dt className="text-[9px] font-bold uppercase tracking-wide text-ink-500">
                Altura
              </dt>
              <dd className="mt-0.5 text-sm font-black text-ink-900">
                {formatHeight(form.height, true)}
              </dd>
            </div>
            <div className="rounded-[10px] border border-line bg-slate-50/60 p-2.5">
              <dt className="text-[9px] font-bold uppercase tracking-wide text-ink-500">
                Peso
              </dt>
              <dd className="mt-0.5 text-sm font-black text-ink-900">
                Desconocido
              </dd>
            </div>
            <div className="rounded-[10px] border border-line bg-slate-50/60 p-2.5">
              <dt className="text-[9px] font-bold uppercase tracking-wide text-ink-500">
                Requisito
              </dt>
              <dd className="mt-0.5 text-xs font-black text-ink-900">
                Factor Gigamax
              </dd>
            </div>
          </dl>

          {move && badge ? (
            <div className="mt-4 rounded-[14px] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-rose-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-700">
                  Movimiento G-Max
                </p>
                {move.fixedPower && (
                  <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
                    Potencia 160
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <h4 className="text-lg font-black tracking-tight text-ink-900">
                  {move.name}
                </h4>
                <TypeBadge type={move.type} />
              </div>
              <p className="mt-1.5 text-[11px] font-semibold leading-snug text-ink-700">
                {move.effect}
              </p>
              <p className="mt-2 text-[10px] font-bold text-ink-500">
                Los movimientos de tipo {badge.es} se convierten en {move.name}.
              </p>
              <p className="mt-1 text-[10px] font-semibold text-ink-500">
                {GMAX_POWER_NOTE}
              </p>
            </div>
          ) : (
            <p className="mt-4 rounded-[12px] border border-dashed border-amber-200 bg-amber-50/50 p-3 text-[11px] font-semibold text-ink-500">
              No hay datos curados del movimiento G-Max de esta forma.
            </p>
          )}

          <div className="mt-3 space-y-2">
            <Disclosure
              title="Cómo obtener esta forma"
              description="Incursiones Max, Sopa Max y notas del Factor Gigamax"
              icon="🔑"
            >
              <div className="space-y-2 text-[11px] font-semibold leading-relaxed text-ink-500">
                <p>
                  Se obtiene en incursiones Max o con Sopa Max. El Factor Gigamax
                  no se hereda por crianza.
                </p>
                {factorNotes.map((note) => (
                  <p
                    key={note}
                    className="rounded-[10px] border border-rose-100 bg-rose-50/60 px-2.5 py-2 text-rose-800"
                  >
                    {note}
                  </p>
                ))}
                <p className="rounded-[10px] border border-line bg-slate-50 px-2.5 py-2">
                  Mantiene la habilidad y las estadísticas de la forma original.
                </p>
              </div>
            </Disclosure>

            <Disclosure
              title="Estadísticas base"
              description="Gigamax conserva las estadísticas de la especie"
              icon="📊"
            >
              <BaseStats stats={base.stats} />
            </Disclosure>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-rose-100 pt-3">
            <span className="text-[10px] font-semibold text-ink-500">
              Misma estadística que la forma original.
            </span>
            {!samePage && (
              <Link
                to={`/pokemon/${form.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-black text-rose-700 transition hover:text-rose-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
              >
                Ver ficha completa
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>

      {!samePage && <GmaxComparison base={base} form={form} />}
    </div>
  );
}

function joinNames(relatives: GmaxRelative[]) {
  const pretty = relatives.map((relative) => prettyFormName(relative.name));
  if (pretty.length === 1) return pretty[0];
  return `${pretty.slice(0, -1).join(", ")} y ${pretty[pretty.length - 1]}`;
}

function RelationCard({
  id,
  name,
  artwork,
  caption,
  tone,
  to,
}: {
  id: number;
  name: string;
  artwork?: string;
  caption: string;
  tone: "base" | "gmax";
  to?: string;
}) {
  const isGmax = tone === "gmax";

  const content = (
    <>
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] ${
          isGmax
            ? "bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50"
            : "bg-slate-50"
        }`}
      >
        <PokemonArtwork
          id={id}
          name={name}
          src={artwork}
          className={`h-11 w-11 object-contain ${
            to
              ? "transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              : ""
          }`}
        />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-black text-ink-900">
          {name}
        </span>
        <span
          className={`mt-0.5 block text-[9px] font-black uppercase tracking-wide ${
            isGmax ? "text-rose-700" : "text-ink-500"
          }`}
        >
          {caption}
        </span>
      </span>
      {to && (
        <span
          aria-hidden="true"
          className="ml-auto shrink-0 pr-0.5 text-sm font-black text-rose-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-rose-700 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
        >
          →
        </span>
      )}
    </>
  );

  const cardClasses = `flex min-w-0 items-center gap-2.5 rounded-[12px] border p-2.5 ${
    isGmax
      ? "border-rose-200 bg-gradient-to-r from-rose-50 to-white"
      : "border-line bg-white"
  }`;

  if (to) {
    return (
      <Link
        to={to}
        aria-label={`Ver la ficha de ${name}`}
        className={`group ${cardClasses} transition duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
      >
        {content}
      </Link>
    );
  }

  return <div className={`${cardClasses} group`}>{content}</div>;
}

function NoGmaxNotice({
  base,
  relatives,
}: {
  base: DynamaxBaseForm;
  relatives: GmaxRelative[];
}) {
  const later = relatives.filter((relative) => relative.direction === "later");
  const earlier = relatives.filter(
    (relative) => relative.direction === "earlier"
  );
  const hasRelatives = relatives.length > 0;

  const title = !hasRelatives
    ? "Sin forma Gigamax"
    : later.length > 0 && earlier.length === 0
      ? "La evolución sí Gigamaxiza"
      : earlier.length > 0 && later.length === 0
        ? "La preevolución sí Gigamaxiza"
        : "Otra etapa sí Gigamaxiza";

  return (
    <div className="mt-6 overflow-hidden rounded-card border border-dashed border-rose-200 bg-gradient-to-br from-rose-50/40 via-white/40 to-white/20 p-5 shadow-sm">
      <div className="flex flex-col items-start gap-3 sm:flex-row">
        <span
          aria-hidden="true"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-white text-2xl shadow-sm"
        >
          {hasRelatives ? "🧬" : "🌱"}
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-black uppercase tracking-wider text-ink-700">
            {title}
          </h3>
          {!hasRelatives ? (
            <p className="mt-1 max-w-2xl text-[11px] font-semibold leading-relaxed text-ink-500">
              Este Pokémon puede Dinamaxizar, pero ni él ni su línea evolutiva
              tienen Factor Gigamax. Solo 32 especies pueden Gigamaxizar.
            </p>
          ) : (
            <div className="mt-1 max-w-3xl space-y-1 text-[11px] font-semibold leading-relaxed text-ink-500">
              {later.length > 0 && (
                <p>
                  Este Pokémon puede Dinamaxizar, pero su etapa actual no tiene
                  Factor Gigamax. Cuando evolucione a {joinNames(later)}{" "}
                  {later.length === 1 ? "sí va" : "sí van"} a poder Gigamaxizar.
                </p>
              )}
              {earlier.length > 0 && (
                <p>
                  {later.length > 0
                    ? "Además, "
                    : "Este Pokémon puede Dinamaxizar, pero perdió el Factor Gigamax al evolucionar. "}
                  {earlier.length === 1 ? "Su preevolución" : "Sus preevoluciones"}{" "}
                  {joinNames(earlier)}{" "}
                  {earlier.length === 1 ? "sí puede" : "sí pueden"} Gigamaxizar:
                  si todavía {earlier.length === 1 ? "lo tienes" : "los tienes"}{" "}
                  en esa etapa,{" "}
                  {earlier.length === 1 ? "aprovéchalo" : "aprovéchalos"} antes de
                  evolucionar.
                </p>
              )}
              <p>
                Solo 32 especies tienen el Factor Gigamax, así que no te extrañe.
              </p>
            </div>
          )}
        </div>
      </div>

      {hasRelatives && (
        <div className="mt-5 grid items-center gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.15fr)]">
          <RelationCard
            id={base.id}
            name={prettyFormName(base.name)}
            artwork={base.artwork}
            caption="Esta especie · Dinamax"
            tone="base"
          />

          <span
            aria-hidden="true"
            className="mx-auto inline-flex h-7 w-7 items-center justify-center rounded-full border border-rose-200 bg-white text-xs font-black text-rose-600 shadow-sm"
          >
            <span className="sm:hidden">↓</span>
            <span className="hidden sm:inline">→</span>
          </span>

          <div className="grid gap-2">
            {relatives.map((relative) => (
              <RelationCard
                key={`${relative.direction}-${relative.id}`}
                id={relative.id}
                name={prettyFormName(relative.name)}
                caption={
                  relative.direction === "later"
                    ? "Su evolución · Gigamax sí"
                    : "Su preevolución · Gigamax sí"
                }
                tone="gmax"
                to={`/pokemon/${relative.id}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DynamaxBlockedNotice() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[14px] border border-amber-300 bg-amber-50 p-5 text-center sm:flex-row sm:text-left">
      <span
        aria-hidden="true"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-white text-2xl shadow-sm"
      >
        🚫
      </span>
      <div>
        <h3 className="text-sm font-black uppercase tracking-wider text-amber-800">
          No puede Dinamaxizar
        </h3>
        <p className="mt-1 text-[11px] font-semibold leading-relaxed text-amber-900/80">
          Zacian, Zamazenta y Eternatus son los únicos Pokémon que no pueden usar
          Dinamax. No tienen forma Gigamax ni movimientos Max.
        </p>
      </div>
    </div>
  );
}

function EternamaxCard() {
  return (
    <div className="mt-5 overflow-hidden rounded-card border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50/50 via-white/40 to-white/20 shadow-sm">
      <div className="grid sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:items-center">
        <div className="relative flex min-h-[200px] items-center justify-center overflow-hidden bg-gradient-to-br from-fuchsia-100/70 via-fuchsia-50 to-white p-5 sm:min-h-[240px]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full border-[22px] border-white/70"
          />
          <PokemonArtwork
            id={ETERNAMAX_ID}
            name="Eternamax"
            src={ETERNAMAX_ARTWORK}
            className="relative z-10 h-[180px] w-full max-w-[220px] object-contain drop-shadow-[0_12px_22px_rgba(126,34,206,0.2)] sm:h-[210px]"
          />
        </div>
        <div className="p-5 sm:p-6">
          <span className="inline-flex rounded-full bg-fuchsia-700 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white">
            Forma de jefe
          </span>
          <h3 className="mt-2 text-xl font-black tracking-tight text-ink-900">
            Eternamax
          </h3>
          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-ink-500">
            Eternatus adopta esta forma solo en la historia de Pokémon Espada y
            Escudo. No se puede obtener ni usar en combate.
          </p>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-fuchsia-700">
            Más de 100,0 m · 255 PS base · no disponible para el jugador
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DynamaxForms({
  forms,
  base,
  speciesId,
  gmaxRelatives = [],
}: DynamaxFormsProps) {
  const [level, setLevel] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(
    forms[0]?.id ?? null
  );

  useEffect(() => {
    setSelectedId((current) =>
      current && forms.some((form) => form.id === current)
        ? current
        : forms[0]?.id ?? null
    );
  }, [forms]);

  const blocked = isDynamaxBlocked(speciesId);
  const selectedForm = forms.find((form) => form.id === selectedId) ?? forms[0];
  const baseHp = base.stats?.find((stat) => stat.name === "hp")?.base_stat;

  return (
    <section
      id="dynamax-title"
      aria-labelledby="dynamax-heading"
      className="glass-surface glass-blur mt-6 scroll-mt-20 overflow-hidden rounded-card border border-rose-200 bg-surface shadow-card"
    >
      <DynamaxHeader formsCount={forms.length} />

      <div className="space-y-5 bg-gradient-to-b from-white via-white to-rose-50/40 p-4 sm:p-6 lg:p-8">
        {blocked ? (
          <DynamaxBlockedNotice />
        ) : (
          <>
            <MechanicsSection
              baseHp={baseHp}
              level={level}
              onLevelChange={setLevel}
              speciesId={speciesId}
            />
            <MaxMoveGrid types={base.types} />
          </>
        )}

        {forms.length > 0 && (
          <div className="glass-surface rounded-card border border-rose-100 p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-ink-700">
                  <span aria-hidden="true">🌋</span>
                  Formas Gigamax
                </h3>
                <p className="mt-0.5 text-[11px] font-semibold text-ink-500">
                  Cambian la apariencia y desbloquean un movimiento exclusivo.
                </p>
              </div>
              <span className="rounded-full border border-rose-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-rose-700">
                Solo con Factor Gigamax
              </span>
            </div>

            {forms.length > 1 && (
              <div className="mt-3">
                <GmaxSelector
                  forms={forms}
                  selectedId={selectedForm?.id ?? null}
                  onSelect={setSelectedId}
                />
              </div>
            )}

            {selectedForm && <GmaxDetail base={base} form={selectedForm} />}
          </div>
        )}

        {!blocked && forms.length === 0 && (
          <NoGmaxNotice base={base} relatives={gmaxRelatives} />
        )}
        {speciesId === 890 && <EternamaxCard />}
      </div>
    </section>
  );
}
