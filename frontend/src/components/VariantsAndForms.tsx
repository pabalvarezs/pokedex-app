import { useEffect, useMemo, useState } from "react";
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

interface ToneStyle {
  badge: string;
  surface: string;
  hoverBorder: string;
  nameHover: string;
}

const TONE_STYLES: Record<string, ToneStyle> = {
  teal: {
    badge: "border-teal-200/80 bg-white/90 text-teal-800",
    surface: "from-teal-50 via-white to-teal-50/70",
    hoverBorder: "hover:border-teal-300",
    nameHover: "group-hover:text-teal-700",
  },
  violet: {
    badge: "border-violet-200/80 bg-white/90 text-violet-800",
    surface: "from-violet-50 via-white to-violet-50/70",
    hoverBorder: "hover:border-violet-300",
    nameHover: "group-hover:text-violet-700",
  },
  indigo: {
    badge: "border-indigo-200/80 bg-white/90 text-indigo-800",
    surface: "from-indigo-50 via-white to-indigo-50/70",
    hoverBorder: "hover:border-indigo-300",
    nameHover: "group-hover:text-indigo-700",
  },
  rose: {
    badge: "border-rose-200/80 bg-white/90 text-rose-800",
    surface: "from-rose-50 via-white to-rose-50/70",
    hoverBorder: "hover:border-rose-300",
    nameHover: "group-hover:text-rose-700",
  },
  amber: {
    badge: "border-amber-200/80 bg-white/90 text-amber-800",
    surface: "from-amber-50 via-white to-amber-50/70",
    hoverBorder: "hover:border-amber-300",
    nameHover: "group-hover:text-amber-700",
  },
  sky: {
    badge: "border-sky-200/80 bg-white/90 text-sky-800",
    surface: "from-sky-50 via-white to-sky-50/70",
    hoverBorder: "hover:border-sky-300",
    nameHover: "group-hover:text-sky-700",
  },
  fuchsia: {
    badge: "border-fuchsia-200/80 bg-white/90 text-fuchsia-800",
    surface: "from-fuchsia-50 via-white to-fuchsia-50/70",
    hoverBorder: "hover:border-fuchsia-300",
    nameHover: "group-hover:text-fuchsia-700",
  },
  emerald: {
    badge: "border-emerald-200/80 bg-white/90 text-emerald-800",
    surface: "from-emerald-50 via-white to-emerald-50/70",
    hoverBorder: "hover:border-emerald-300",
    nameHover: "group-hover:text-emerald-700",
  },
  slate: {
    badge: "border-slate-200/80 bg-white/90 text-slate-800",
    surface: "from-slate-50 via-white to-slate-50/70",
    hoverBorder: "hover:border-slate-300",
    nameHover: "group-hover:text-slate-700",
  },
  orange: {
    badge: "border-orange-200/80 bg-white/90 text-orange-800",
    surface: "from-orange-50 via-white to-orange-50/70",
    hoverBorder: "hover:border-orange-300",
    nameHover: "group-hover:text-orange-700",
  },
  stone: {
    badge: "border-stone-200/80 bg-white/90 text-stone-800",
    surface: "from-stone-50 via-white to-stone-50/70",
    hoverBorder: "hover:border-stone-300",
    nameHover: "group-hover:text-stone-700",
  },
};

const PERMANENCE_STYLES: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  permanent: {
    label: "Permanente",
    className: "border-emerald-200/70 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  temporary: {
    label: "Temporal",
    className: "border-amber-200/70 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  battle: {
    label: "En combate",
    className: "border-sky-200/70 bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
  },
};

/** Variantes que viven en las secciones Megaevoluciones y Dinamax. */
const DELEGATED_CATEGORIES = new Set(["mega", "gmax"]);

/** A partir de este número de formas locales se ofrece búsqueda por nombre. */
const SEARCH_THRESHOLD = 6;

/** Formas que se muestran antes de ofrecer «Mostrar más». */
const PAGE_SIZE = 10;

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
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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

  // Cada filtro o búsqueda vuelve a mostrar la primera página.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeCategory, query]);

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

  const visibleVariants = filteredVariants.slice(0, visibleCount);
  const remainingVariants = filteredVariants.length - visibleVariants.length;

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
              Mostrando {visibleVariants.length} de {filteredVariants.length}{" "}
              {filteredVariants.length === 1 ? "forma" : "formas"}
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
            <div
              key={`${effectiveCategory}-${normalizedQuery}`}
              className="variant-grid-enter mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
              {visibleVariants.map((variant) => (
                <VariantCard key={variant.id} variant={variant} />
              ))}
            </div>
          )}

          {showVariants && remainingVariants > 0 && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-xs font-bold text-ink-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 motion-reduce:hover:translate-y-0"
              >
                Mostrar más variantes
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-black text-ink-500">
                  +{remainingVariants}
                </span>
              </button>
              <p className="text-[10px] font-semibold text-ink-500">
                Quedan {remainingVariants}{" "}
                {remainingVariants === 1 ? "forma por ver" : "formas por ver"}
              </p>
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

function VariantCard({ variant }: { variant: PokemonVariant }) {
  const tone = TONE_STYLES[variant.category.tone] ?? TONE_STYLES.slate;
  const permanence =
    PERMANENCE_STYLES[variant.permanence] ?? PERMANENCE_STYLES.permanent;
  const extraInfo = variant.condition ?? variant.description;

  return (
    <Link
      to={`/pokemon/${variant.id}`}
      aria-label={`Ver ficha de ${variant.displayName}`}
      className={`group relative flex h-full flex-col overflow-hidden rounded-[14px] border bg-white text-left shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-1 hover:shadow-ambient focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 motion-reduce:hover:translate-y-0 ${
        variant.isCurrent
          ? "border-red-300 ring-1 ring-red-100"
          : `border-line ${tone.hoverBorder}`
      }`}
    >
      {/* Ilustración */}
      <div
        className={`relative flex aspect-square items-center justify-center overflow-hidden border-b border-white/80 bg-gradient-to-br p-3 ${tone.surface}`}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full border-[16px] border-white/60"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-white/50 blur-2xl"
        />

        <span
          className={`absolute left-2 top-2 z-10 inline-flex max-w-[calc(100%-1rem)] items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] shadow-sm backdrop-blur-sm ${tone.badge}`}
        >
          <span aria-hidden="true">{variant.category.emoji}</span>
          <span className="truncate">{variant.category.shortLabel}</span>
        </span>

        {variant.isCurrent && (
          <span className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm">
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
            Actual
          </span>
        )}

        <PokemonArtwork
          id={variant.id}
          name={variant.name}
          src={variant.artwork}
          className="relative z-[1] h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(15,23,42,0.16)] transition-transform duration-300 ease-out group-hover:scale-[1.06] motion-reduce:transform-none"
        />
      </div>

      {/* Información */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-center justify-between gap-2">
          {variant.region ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold text-ink-500">
              <span aria-hidden="true">📍</span>
              {variant.region}
            </span>
          ) : (
            <span />
          )}
          <span className="text-[9px] font-bold tabular-nums text-ink-500">
            #{variant.id}
          </span>
        </div>

        <h3
          className={`break-words text-sm font-extrabold leading-snug text-ink-900 transition-colors ${tone.nameHover}`}
        >
          {variant.displayName}
        </h3>

        <div className="flex min-h-[20px] flex-wrap items-center gap-1">
          {variant.types && variant.types.length > 0
            ? variant.types.map((type) => {
                const badge = getTypeBadge(type);
                return (
                  <span
                    key={type}
                    className={`rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    {badge.es}
                  </span>
                );
              })
            : null}
        </div>

        {extraInfo && (
          <p
            className="line-clamp-2 min-h-[2.35rem] text-[11px] leading-snug text-ink-500"
            title={extraInfo}
          >
            {extraInfo}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line-soft pt-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${permanence.className}`}
          >
            <span
              aria-hidden="true"
              className={`h-1 w-1 rounded-full ${permanence.dot}`}
            />
            {permanence.label}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-ink-500 transition-colors group-hover:text-ink-900">
            Ver ficha
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}