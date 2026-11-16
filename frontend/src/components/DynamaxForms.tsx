import { useEffect, useMemo, useState } from "react";
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
import { getTypeBadge } from "../utils/pokemon";
import PokemonArtwork from "./PokemonArtwork";
import {
  FormHero,
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

function RulesRow() {
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
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
      {rules.map((rule) => (
        <div
          key={rule.title}
          className="flex items-start gap-3 rounded-[12px] border border-rose-100 bg-white/80 p-3"
        >
          <span aria-hidden="true" className="text-lg leading-none">
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
  const boosted = typeof baseHp === "number" ? dynamaxHp(baseHp, level, speciesId) : undefined;
  const scale = Math.max(1, (baseHp ?? 1) * 2);
  const baseWidth = Math.min(100, Math.round(((baseHp ?? 0) / scale) * 100));
  const boostedWidth = Math.min(
    100,
    Math.round(((boosted ?? 0) / scale) * 100)
  );
  const shedinja = isShedinja(speciesId);

  return (
    <div className="mt-4 overflow-hidden rounded-card border border-rose-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-100 bg-gradient-to-r from-rose-50/80 to-white px-5 py-4">
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
        <input
          id="dynamax-level"
          type="range"
          min={0}
          max={10}
          step={1}
          value={level}
          onChange={(event) => onLevelChange(Number(event.target.value))}
          aria-valuetext={dynamaxLevelLabel(level)}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-rose-100 accent-rose-600"
        />
        <div className="mt-1 flex justify-between text-[9px] font-bold uppercase tracking-wide text-ink-500">
          <span>Nivel 0 · inicial</span>
          <span>Nivel 10 · máximo</span>
        </div>

        {typeof baseHp === "number" && typeof boosted === "number" ? (
          <div className="mt-4 grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            <div aria-label="PS base" className="rounded-[12px] border border-line bg-white p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500">
                PS base
              </p>
              <p className="text-2xl font-black text-ink-900">{baseHp}</p>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-400"
                  style={{ width: `${baseWidth}%` }}
                />
              </div>
            </div>

            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500">
                Multiplicador
              </p>
              <p className="text-xl font-black text-rose-700">
                {formatDynamaxMultiplier(level)}
              </p>
            </div>

            <div
              aria-label="PS con Dinamax"
              className="rounded-[12px] border border-rose-200 bg-gradient-to-b from-rose-50 to-white p-3"
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-rose-700">
                PS con Dinamax
              </p>
              <p className="text-2xl font-black text-rose-700">{boosted}</p>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-rose-100">
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

function MaxMoveCard({
  move,
  highlighted,
}: {
  move: MaxMove;
  highlighted: boolean;
}) {
  const badge = getTypeBadge(move.type);

  return (
    <article
      className={`flex flex-col rounded-[12px] border p-3 transition ${
        highlighted
          ? "border-rose-300 bg-rose-50/70 shadow-sm ring-1 ring-rose-200"
          : "border-line bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-black leading-tight text-ink-900">
          {move.name}
        </h4>
        <TypeBadge type={move.type} />
      </div>

      <p className="mt-1.5 flex-1 text-[11px] font-medium leading-snug text-ink-500">
        {move.effect}
      </p>

      <p
        className={`mt-2 text-[9px] font-black uppercase tracking-wide ${
          highlighted ? "text-rose-700" : "text-ink-500"
        }`}
      >
        {move.isStatus
          ? "Movimientos de estado"
          : `${highlighted ? "Tus movimientos" : "Movimientos"} de tipo ${badge.es}`}
      </p>
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
    <div className="mt-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-ink-700">
            <span aria-hidden="true">🎯</span>
            Movimientos Max
          </h3>
          <p className="mt-0.5 text-[11px] font-semibold text-ink-500">
            Al Dinamaxizar, cada ataque se convierte en el Max Move de su tipo.
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
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`h-3 w-3 transition-transform ${showAll ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      <div
        id="max-move-grid"
        className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
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

function GmaxCard({
  form,
  selected,
  onSelect,
}: {
  form: GmaxForm;
  selected: boolean;
  onSelect: () => void;
}) {
  const title = gmaxTitle(form);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Seleccionar ${title}`}
      className={`group relative flex flex-col overflow-hidden rounded-card border bg-surface text-left transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200 ${
        selected
          ? "border-rose-400 shadow-ambient ring-2 ring-rose-200"
          : "border-rose-100 shadow-card hover:-translate-y-1 hover:border-rose-300 hover:shadow-ambient motion-reduce:hover:translate-y-0"
      }`}
    >
      {selected && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-20 h-1.5 bg-gradient-to-r from-rose-600 via-red-500 to-amber-400"
        />
      )}

      <div className="relative flex h-[184px] items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full border-[22px] border-white/50"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-amber-200/40 blur-2xl"
        />

        <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-700 to-red-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-sm ring-1 ring-white/30">
          <span aria-hidden="true" className="text-[11px] leading-none">
            🌋
          </span>
          GIGAMAX{form.variant ? ` ${form.variant}` : ""}
        </span>

        {selected && (
          <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-rose-700 shadow-sm ring-1 ring-rose-200 backdrop-blur-sm">
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
          className="relative z-10 h-[150px] w-[150px] object-contain drop-shadow-[0_10px_18px_rgba(190,18,60,0.22)] transition-transform duration-200 ease-out group-hover:scale-105 motion-reduce:transform-none sm:h-[165px] sm:w-[165px]"
        />
      </div>

      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-ink-500">
            Forma Gigamax de {prettyFormName(form.baseName)}
          </p>
          <h4 className="truncate text-base font-black tracking-tight text-ink-900">
            {title}
          </h4>
          <div className="mt-1.5">
            <TypePills types={form.types} />
          </div>
        </div>
        <span className="shrink-0 text-[10px] font-black text-rose-300">
          {formatFormId(form.id)}
        </span>
      </div>
    </button>
  );
}

function GmaxComparison({
  base,
  form,
}: {
  base: DynamaxBaseForm;
  form: GmaxForm;
}) {
  return (
    <div className="border-t border-rose-100 bg-rose-50/30 p-4 sm:p-5">
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

      <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:items-center">
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
            label={form.variant ? `GIGAMAX ${form.variant}` : "GIGAMAX"}
            name={gmaxTitle(form)}
            id={form.id}
            types={form.types}
            artwork={formArtwork(form)}
            tone="gmax"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-[12px] border border-line bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500">
              Altura original
            </p>
            <p className="mt-0.5 text-sm font-black text-ink-900">
              {formatHeight(base.height, false)}
            </p>
          </div>
          <div className="rounded-[12px] border border-rose-200 bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-rose-700">
              Altura Gigamax
            </p>
            <p className="mt-0.5 text-sm font-black text-rose-700">
              {formatHeight(form.height, true)}
            </p>
          </div>
          <p className="col-span-2 rounded-[12px] border border-dashed border-rose-200 bg-white/70 p-3 text-[11px] font-semibold text-ink-500">
            Las estadísticas base no cambian: Gigamax solo altera la apariencia y
            añade un movimiento exclusivo.
          </p>
        </div>
      </div>
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
    <div className="mt-4 overflow-hidden rounded-card border border-rose-200 bg-white shadow-sm">
      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative flex min-h-[240px] items-center justify-center overflow-hidden rounded-[12px] border border-rose-100 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-4">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full border-[26px] border-white/50"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -left-12 h-52 w-52 rounded-full bg-amber-200/40 blur-3xl"
          />
          <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-700 to-red-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-sm ring-1 ring-white/30">
            <span aria-hidden="true">🌋</span>
            Gigamax
          </span>
          <PokemonArtwork
            id={form.id}
            name={gmaxTitle(form)}
            src={formArtwork(form)}
            className="relative z-10 h-[210px] w-[210px] object-contain drop-shadow-[0_12px_22px_rgba(190,18,60,0.22)] sm:h-[240px] sm:w-[240px]"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-500">
                Forma Gigamax
              </p>
              <h3 className="text-xl font-black tracking-tight text-ink-900">
                {gmaxTitle(form)}
              </h3>
            </div>
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-black text-rose-700 ring-1 ring-rose-200">
              {formatFormId(form.id)}
            </span>
          </div>

          <div className="mt-2">
            <TypePills types={form.types} />
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-[10px] border border-line bg-white p-2.5">
              <dt className="text-[9px] font-bold uppercase tracking-wide text-ink-500">
                Altura
              </dt>
              <dd className="mt-0.5 text-sm font-black text-ink-900">
                {formatHeight(form.height, true)}
              </dd>
            </div>
            <div className="rounded-[10px] border border-line bg-white p-2.5">
              <dt className="text-[9px] font-bold uppercase tracking-wide text-ink-500">
                Peso
              </dt>
              <dd className="mt-0.5 text-sm font-black text-ink-900">
                Desconocido
              </dd>
            </div>
            <div className="rounded-[10px] border border-line bg-white p-2.5">
              <dt className="text-[9px] font-bold uppercase tracking-wide text-ink-500">
                Disponibilidad
              </dt>
              <dd className="mt-0.5 text-xs font-black text-ink-900">
                Solo en combate
              </dd>
            </div>
            <div className="rounded-[10px] border border-line bg-white p-2.5">
              <dt className="text-[9px] font-bold uppercase tracking-wide text-ink-500">
                Requisito
              </dt>
              <dd className="mt-0.5 text-xs font-black text-ink-900">
                Factor Gigamax
              </dd>
            </div>
          </dl>

          {move && badge ? (
            <div className="mt-4 rounded-[12px] border border-amber-200 bg-gradient-to-r from-amber-50 to-rose-50 p-3.5">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-700">
                Movimiento G-Max
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h4 className="text-base font-black tracking-tight text-ink-900">
                  {move.name}
                </h4>
                <TypeBadge type={move.type} />
                {move.fixedPower && (
                  <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
                    Potencia 160
                  </span>
                )}
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

          <p className="mt-3 text-[10px] font-semibold leading-snug text-ink-500">
            Se obtiene en incursiones Max o con Sopa Max. El Factor Gigamax no se
            hereda por crianza.
          </p>

          {factorNotes.map((note) => (
            <p
              key={note}
              className="mt-1.5 rounded-[10px] border border-rose-100 bg-rose-50/50 px-2.5 py-1.5 text-[10px] font-semibold text-rose-800"
            >
              {note}
            </p>
          ))}

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

function NoGmaxNotice({ relatives }: { relatives: GmaxRelative[] }) {
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
    <div className="mt-6 flex flex-col items-center gap-3 rounded-card border border-dashed border-rose-200 bg-rose-50/40 p-5 text-center sm:flex-row sm:text-left">
      <span aria-hidden="true" className="text-3xl">
        {hasRelatives ? "🧬" : "🌱"}
      </span>
      <div>
        <h3 className="text-sm font-black uppercase tracking-wider text-ink-700">
          {title}
        </h3>
        {!hasRelatives ? (
          <p className="mt-1 text-[11px] font-semibold text-ink-500">
            Este Pokémon puede Dinamaxizar, pero ni él ni su línea evolutiva
            tienen Factor Gigamax. Solo 32 especies pueden Gigamaxizar.
          </p>
        ) : (
          <div className="mt-1 space-y-1 text-[11px] font-semibold text-ink-500">
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
  );
}

function DynamaxBlockedNotice() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[12px] border border-amber-300 bg-amber-50 p-5 text-center sm:flex-row sm:text-left">
      <span aria-hidden="true" className="text-3xl">
        🚫
      </span>
      <div>
        <h3 className="text-sm font-black uppercase tracking-wider text-amber-800">
          No puede Dinamaxizar
        </h3>
        <p className="mt-1 text-[11px] font-semibold text-amber-900/80">
          Zacian, Zamazenta y Eternatus son los únicos Pokémon que no pueden usar
          Dinamax. No tienen forma Gigamax ni movimientos Max.
        </p>
      </div>
    </div>
  );
}

function EternamaxCard() {
  return (
    <div className="mt-5 overflow-hidden rounded-card border border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 via-white to-white shadow-sm">
      <div className="grid gap-4 p-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center sm:p-5">
        <PokemonArtwork
          id={ETERNAMAX_ID}
          name="Eternamax"
          src={ETERNAMAX_ARTWORK}
          className="mx-auto h-36 w-36 object-contain drop-shadow-[0_10px_18px_rgba(126,34,206,0.18)]"
        />
        <div>
          <span className="inline-flex rounded-full bg-fuchsia-700 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white">
            Forma de jefe
          </span>
          <h3 className="mt-1.5 text-lg font-black tracking-tight text-ink-900">
            Eternamax
          </h3>
          <p className="mt-1 text-[11px] font-semibold leading-snug text-ink-500">
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
      aria-labelledby="dynamax-title"
      className="mt-6 overflow-hidden rounded-card border border-rose-200 bg-surface shadow-card"
    >
      <FormHero
        tone="rose"
        badge="Aura Dinamax"
        emoji="🌋"
        title="Dinamax y Gigamax"
        titleId="dynamax-title"
        subtitle="Transformación temporal de 3 turnos. Solo una vez por combate."
        aside={
          <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold ring-1 ring-white/25">
            {forms.length > 0
              ? `${forms.length} ${forms.length === 1 ? "forma" : "formas"} G-Max`
              : "Sin forma G-Max"}
          </span>
        }
      />

      <div className="bg-gradient-to-b from-white via-white to-rose-50/40 p-4 sm:p-6 lg:p-8">
        {blocked ? (
          <DynamaxBlockedNotice />
        ) : (
          <>
            <RulesRow />
            <HpPanel
              baseHp={baseHp}
              level={level}
              onLevelChange={setLevel}
              speciesId={speciesId}
            />
            <MaxMoveGrid types={base.types} />
          </>
        )}

        {forms.length > 0 && (
          <div className="mt-6">
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
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {forms.map((form) => (
                  <GmaxCard
                    key={form.id}
                    form={form}
                    selected={form.id === selectedForm?.id}
                    onSelect={() => setSelectedId(form.id)}
                  />
                ))}
              </div>
            )}

            {selectedForm && <GmaxDetail base={base} form={selectedForm} />}
          </div>
        )}

        {!blocked && forms.length === 0 && (
          <NoGmaxNotice relatives={gmaxRelatives} />
        )}
        {speciesId === 890 && <EternamaxCard />}
      </div>
    </section>
  );
}
