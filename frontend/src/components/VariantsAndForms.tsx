import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type {
  PokemonVariantFamily,
  PokemonVariant,
  ParadoxRelative,
} from "../services/api";
import { getTypeBadge } from "../utils/pokemon";
import PokemonArtwork from "./PokemonArtwork";

interface Props {
  family: PokemonVariantFamily;
}

const TONE_BG: Record<string, string> = {
  teal: "bg-teal-500",
  violet: "bg-violet-500",
  indigo: "bg-indigo-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  sky: "bg-sky-500",
  fuchsia: "bg-fuchsia-500",
  emerald: "bg-emerald-500",
  slate: "bg-slate-500",
  orange: "bg-orange-500",
  stone: "bg-stone-500",
};

const PERMANENCE_LABEL: Record<string, string> = {
  permanent: "Permanente",
  temporary: "Temporal",
  battle: "Combate",
};

/** Variantes que viven en las secciones Megaevoluciones y Dinamax. */
const DELEGATED_CATEGORIES = new Set(["mega", "gmax"]);

/** A partir de este número de formas locales se ofrece búsqueda por nombre. */
const SEARCH_THRESHOLD = 6;

const TONE_DOT: Record<string, string> = {
  teal: "bg-teal-500",
  violet: "bg-violet-500",
  indigo: "bg-indigo-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  sky: "bg-sky-500",
  fuchsia: "bg-fuchsia-500",
  emerald: "bg-emerald-500",
  slate: "bg-slate-500",
  orange: "bg-orange-500",
  stone: "bg-stone-500",
};

const TONE_CHIP: Record<string, string> = {
  teal: "border-teal-200 bg-teal-50 text-teal-800",
  violet: "border-violet-200 bg-violet-50 text-violet-800",
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-800",
  rose: "border-rose-200 bg-rose-50 text-rose-800",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  sky: "border-sky-200 bg-sky-50 text-sky-800",
  fuchsia: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
  slate: "border-slate-200 bg-slate-50 text-slate-800",
  orange: "border-orange-200 bg-orange-50 text-orange-800",
  stone: "border-stone-200 bg-stone-50 text-stone-800",
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function FilterChip({
  active,
  label,
  count,
  tone,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  tone?: string;
  onClick: () => void;
}) {
  const dot = TONE_DOT[tone ?? "slate"] ?? TONE_DOT.slate;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 ${
        active
          ? "border-ink-900 bg-ink-900 text-white shadow-sm"
          : "border-line bg-white text-ink-500 hover:border-slate-300 hover:bg-slate-50 hover:text-ink-700"
      }`}
    >
      {tone && (
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white/80" : dot}`}
        />
      )}
      <span>{label}</span>
      <span className={active ? "opacity-80" : "opacity-60"}>({count})</span>
    </button>
  );
}

export default function VariantsAndForms({ family }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");

  const hasParadox =
    family.paradoxRelatives && family.paradoxRelatives.length > 0;

  // Agrupar variantes por categoría. El backend ya las entrega ordenadas.
  const grouped = useMemo(() => {
    const map = new Map<string, PokemonVariant[]>();
    for (const variant of family.variants) {
      const key = variant.category.key;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(variant);
    }
    return map;
  }, [family.variants]);

  // Si no hay ni variantes regulares ni paradojas, no renderizar nada.
  if (family.total === 0 && !hasParadox) return null;

  // Mega y Gigamax mantienen sus secciones dedicadas.
  const groupedEntries = Array.from(grouped.entries());
  const localGroups = groupedEntries.filter(
    ([key]) => !DELEGATED_CATEGORIES.has(key)
  );
  const localVariants = family.variants.filter(
    (variant) => !DELEGATED_CATEGORIES.has(variant.category.key)
  );

  const showVariants = localGroups.length > 0;
  const showSomething = showVariants || hasParadox;
  if (!showSomething) return null;

  const localCategoryKeys = new Set(localGroups.map(([key]) => key));
  const effectiveCategory =
    activeCategory === "all" || localCategoryKeys.has(activeCategory)
      ? activeCategory
      : "all";
  const normalizedQuery = normalizeText(query.trim());
  const searchEnabled = localVariants.length >= SEARCH_THRESHOLD;

  const filteredVariants = localVariants.filter((variant) => {
    if (
      effectiveCategory !== "all" &&
      variant.category.key !== effectiveCategory
    ) {
      return false;
    }
    if (!normalizedQuery) return true;

    return normalizeText(
      [variant.displayName, variant.name, variant.region]
        .filter(Boolean)
        .join(" ")
    ).includes(normalizedQuery);
  });

  const paradoxCount = family.paradoxRelatives?.length ?? 0;
  const totalLabel = `${family.total} ${family.total === 1 ? "variante" : "variantes"}`;
  const headerDescription =
    family.total > 0
      ? `Todas las formas alternativas de ${family.baseDisplayName} en un solo lugar. Filtra por categoría y abre la ficha de cada variante.`
      : hasParadox
        ? "Sin formas alternativas registradas. Revisa los Pokémon paradoja relacionados con esta especie."
        : "";

  return (
    <section
      aria-labelledby="variants-title"
      className="mt-6 w-full overflow-hidden rounded-card border border-line bg-surface shadow-card"
    >
      {/* Cabecera */}
      <div className="relative overflow-hidden border-b border-line-soft bg-gradient-to-br from-white via-white to-slate-50">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full border-[34px] border-slate-100/80"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/3 h-40 w-40 rounded-full bg-red-100/50 blur-3xl"
        />

        <div className="relative">
          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            aria-expanded={!collapsed}
            aria-controls="variants-forms-panel"
            aria-label={
              collapsed
                ? "Expandir variantes y formas"
                : "Contraer variantes y formas"
            }
            className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-red-200"
          />

          <div className="pointer-events-none relative flex items-start gap-3 px-5 py-5 sm:gap-4 sm:px-7 sm:py-6">
            <span className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-500 text-white shadow-sm sm:h-12 sm:w-12">
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
                <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z" />
                <path d="m4 7.5 8 4.5 8-4.5" />
                <path d="M12 12v9" />
              </svg>
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-600">
                Formas de {family.baseDisplayName}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h2
                  id="variants-title"
                  className="text-2xl font-black tracking-tight text-ink-900 sm:text-[1.7rem]"
                >
                  Variantes y formas
                </h2>
                <span className="inline-flex items-center rounded-full border border-line bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink-700 shadow-sm">
                  {totalLabel}
                </span>
                {paradoxCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-[10px] font-bold text-purple-700">
                    🔄 {paradoxCount} paradoja{paradoxCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {headerDescription && (
                <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-ink-500 sm:text-sm">
                  {headerDescription}
                </p>
              )}
            </div>

            <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink-500 shadow-sm transition group-hover:border-slate-300">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-4 w-4 transition-transform duration-300 ${
                  collapsed ? "" : "rotate-180"
                }`}
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </div>
        </div>

        {groupedEntries.length > 0 && (
          <div className="relative flex flex-wrap gap-1.5 border-t border-line-soft/80 bg-white/60 px-5 py-2.5 sm:px-7">
            {groupedEntries.map(([key, variants]) => {
              const category = variants[0].category;
              const chip = TONE_CHIP[category.tone] ?? TONE_CHIP.slate;
              const dot = TONE_DOT[category.tone] ?? TONE_DOT.slate;

              return (
                <span
                  key={key}
                  title={category.label}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${chip}`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${dot}`}
                  />
                  <span>{category.shortLabel}</span>
                  <span className="opacity-60">({variants.length})</span>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {!collapsed && (
        <div
          id="variants-forms-panel"
          className="px-5 pb-6 pt-5 sm:px-7 sm:pb-7"
        >
          {/* Barra de navegación: mostrar si es una variante (no la especie base) */}
          {!family.isDefault && (
            <div className="mb-5 rounded-[12px] border border-amber-200/80 bg-amber-50/70 p-3">
              <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs font-semibold text-amber-800">
                <span aria-hidden="true">↩️</span>
                <span>Estás viendo una variante de</span>
                <Link
                  to={`/pokemon/${family.baseId}`}
                  className="font-bold underline decoration-amber-400 underline-offset-2 hover:text-amber-600"
                >
                  {family.baseDisplayName}
                </Link>
                <span>.</span>
              </p>
            </div>
          )}

          {showVariants && (
            <div className="mb-4 flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
              <div
                role="group"
                aria-label="Filtrar variantes por categoría"
                className="flex flex-wrap items-center gap-1.5"
              >
                <FilterChip
                  active={effectiveCategory === "all"}
                  label="Todas"
                  count={localVariants.length}
                  onClick={() => setActiveCategory("all")}
                />
                {localGroups.map(([key, variants]) => {
                  const category = variants[0].category;
                  return (
                    <FilterChip
                      key={key}
                      active={effectiveCategory === key}
                      label={category.shortLabel}
                      count={variants.length}
                      tone={category.tone}
                      onClick={() => setActiveCategory(key)}
                    />
                  );
                })}
              </div>

              {searchEnabled && (
                <div className="relative w-full lg:w-64">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-3.5-3.5" />
                    </svg>
                  </span>
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar variante…"
                    aria-label="Buscar variante por nombre"
                    className="w-full rounded-full border border-line bg-white py-1.5 pl-9 pr-9 text-xs font-semibold text-ink-900 shadow-sm transition placeholder:font-normal placeholder:text-ink-500 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Borrar búsqueda"
                      className="absolute right-2.5 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-ink-500 transition hover:bg-slate-100 hover:text-ink-900"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {showVariants && (
            <p
              role="status"
              className="mb-2 text-[11px] font-semibold text-ink-500"
            >
              Mostrando {filteredVariants.length} de {localVariants.length}{" "}
              {localVariants.length === 1 ? "forma" : "formas"}
              {effectiveCategory !== "all" && query
                ? " · filtro y búsqueda activos"
                : effectiveCategory !== "all"
                  ? " · filtro activo"
                  : query
                    ? " · búsqueda activa"
                    : ""}
            </p>
          )}

          {/* Enlaces delegados */}
          {grouped.has("mega") && (
            <a
              href="#mega-title"
              className="mb-2 inline-flex items-center gap-1.5 rounded-control border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-800 transition hover:bg-violet-100"
            >
              💥 Ver Megaevoluciones
            </a>
          )}
          {grouped.has("gmax") && (
            <a
              href="#dynamax-title"
              className="mb-2 ml-2 inline-flex items-center gap-1.5 rounded-control border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800 transition hover:bg-rose-100"
            >
              🌋 Ver formas Gigamax
            </a>
          )}

          {/* Grid de tarjetas de variantes — solo si hay variantes no delegadas */}
          {showVariants && filteredVariants.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredVariants.map((variant) => (
                <VariantCard
                  key={variant.id}
                  variant={variant}
                  isCurrent={variant.isCurrent}
                />
              ))}
            </div>
          )}

          {showVariants && filteredVariants.length === 0 && (
            <div className="mt-4 flex flex-col items-center justify-center rounded-[12px] border border-dashed border-line bg-slate-50/70 px-5 py-8 text-center">
              <span aria-hidden="true" className="text-2xl">
                🔎
              </span>
              <p className="mt-2 text-sm font-bold text-ink-900">
                No encontramos variantes con ese nombre
              </p>
              <p className="mt-1 max-w-sm text-xs text-ink-500">
                Prueba con otra búsqueda o quita el filtro de categoría.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveCategory("all");
                }}
                className="mt-3 rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-bold text-ink-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Limpiar filtros
              </button>
            </div>
          )}

          {/* Pokémon paradoja relacionados */}
          {hasParadox && (
            <div
              className={`${showVariants ? "mt-6 border-t border-line-soft pt-5" : "mt-4"}`}
            >
              <h3 className="mb-3 flex items-center gap-2 text-section font-bold uppercase tracking-wider text-ink-500">
                <span>🔄</span>
                <span>Pokémon paradoja relacionados</span>
              </h3>
              <p className="mb-4 text-xs text-ink-500">
                Según el lore de Pokémon Escarlata y Púrpura, estos Pokémon
                paradoja guardan relación con esta especie.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {family.paradoxRelatives!.map((relative) => (
                  <ParadoxCard key={relative.id} relative={relative} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function ParadoxCard({ relative }: { relative: ParadoxRelative }) {
  const eraLabel = relative.era === "past" ? "Pasado" : "Futuro";
  const eraBadge =
    relative.era === "past"
      ? "bg-amber-600 text-white"
      : "bg-cyan-600 text-white";
  const eraEmoji = relative.era === "past" ? "🦴" : "🤖";

  return (
    <Link
      to={`/pokemon/${relative.id}`}
      className="group relative flex flex-col items-center rounded-lg border border-purple-200 bg-gradient-to-b from-purple-50 to-white p-3 text-center transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Badge de era */}
      <span
        className={`mb-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${eraBadge}`}
      >
        <span>{eraEmoji}</span>
        <span>{eraLabel}</span>
      </span>

      {/* Arte */}
      <PokemonArtwork
        id={relative.id}
        name={relative.name}
        src={relative.artwork}
        className="h-20 w-20 object-contain drop-shadow-sm transition group-hover:scale-105 sm:h-24 sm:w-24"
      />

      {/* Nombre */}
      <p className="mt-1.5 w-full truncate text-xs font-extrabold text-ink-900">
        {relative.displayName}
      </p>

      {/* Tipos */}
      <div className="mt-1.5 flex flex-wrap justify-center gap-1">
        {relative.types.map((type) => {
          const badge = getTypeBadge(type);
          return (
            <span
              key={type}
              className={`rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide ${badge.bg} ${badge.text} ${badge.border}`}
            >
              {badge.es}
            </span>
          );
        })}
      </div>

      {/* Descripción */}
      <p className="mt-1.5 line-clamp-2 text-[9px] leading-tight text-ink-400">
        {relative.description}
      </p>
    </Link>
  );
}

function VariantCard({
  variant,
  isCurrent,
}: {
  variant: PokemonVariant;
  isCurrent: boolean;
}) {
  const toneBg = TONE_BG[variant.category.tone] ?? TONE_BG.slate;
  const permanenceLabel =
    PERMANENCE_LABEL[variant.permanence] ?? variant.permanence;

  return (
    <Link
      to={`/pokemon/${variant.id}`}
      className={`group relative flex flex-col items-center rounded-lg border p-3 text-center transition hover:-translate-y-0.5 hover:shadow-md ${
        isCurrent
          ? "border-red-300 bg-red-50 ring-1 ring-red-200"
          : "border-line bg-white hover:border-slate-300"
      }`}
    >
      {/* Indicador de variante actual */}
      {isCurrent && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white shadow-sm">
          ✓
        </span>
      )}

      {/* Badge de categoría */}
      <span
        className={`mb-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white ${toneBg}`}
      >
        <span>{variant.category.emoji}</span>
        <span>{variant.category.shortLabel}</span>
      </span>

      {/* Arte o sprite */}
      <PokemonArtwork
        id={variant.id}
        name={variant.name}
        src={variant.artwork}
        className="h-20 w-20 object-contain drop-shadow-sm transition group-hover:scale-105 sm:h-24 sm:w-24"
      />

      {/* Nombre */}
      <p className="mt-1.5 w-full truncate text-xs font-extrabold text-ink-900">
        {variant.displayName}
      </p>

      {/* Tipos */}
      {variant.types && variant.types.length > 0 && (
        <div className="mt-1.5 flex flex-wrap justify-center gap-1">
          {variant.types.map((type) => {
            const badge = getTypeBadge(type);
            return (
              <span
                key={type}
                className={`rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide ${badge.bg} ${badge.text} ${badge.border}`}
              >
                {badge.es}
              </span>
            );
          })}
        </div>
      )}

      {/* Región (si aplica) */}
      {variant.region && (
        <span className="mt-1 text-[9px] font-semibold text-ink-500">
          {variant.region}
        </span>
      )}

      {/* Permanencia */}
      <span className="mt-1 rounded bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold uppercase text-ink-500">
        {permanenceLabel}
      </span>

      {/* Condición (si aplica) */}
      {variant.condition && (
        <p className="mt-1.5 line-clamp-2 text-[9px] leading-tight text-ink-400">
          {variant.condition}
        </p>
      )}
    </Link>
  );
}