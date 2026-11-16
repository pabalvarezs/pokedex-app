import { useState } from "react";
import { Link } from "react-router-dom";
import type {
  PokemonVariantFamily,
  PokemonVariant,
  PokemonVariantCategory,
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

const TONE_BADGE_BG: Record<string, string> = {
  teal: "bg-teal-100 text-teal-800 border-teal-200",
  violet: "bg-violet-100 text-violet-800 border-violet-200",
  indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
  rose: "bg-rose-100 text-rose-800 border-rose-200",
  amber: "bg-amber-100 text-amber-800 border-amber-200",
  sky: "bg-sky-100 text-sky-800 border-sky-200",
  fuchsia: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
  emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
  slate: "bg-slate-100 text-slate-800 border-slate-200",
  orange: "bg-orange-100 text-orange-800 border-orange-200",
  stone: "bg-stone-100 text-stone-800 border-stone-200",
};

const PERMANENCE_LABEL: Record<string, string> = {
  permanent: "Permanente",
  temporary: "Temporal",
  battle: "Combate",
};

export default function VariantsAndForms({ family }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  if (family.total === 0) return null;

  // Agrupar variantes por categoría
  const grouped = new Map<string, PokemonVariant[]>();
  for (const variant of family.variants) {
    const key = variant.category.key;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(variant);
  }

  // Las categorías Mega y Gmax se delegan a sus secciones existentes
  const delegated = new Set(["mega", "gmax"]);
  const localGroups = Array.from(grouped.entries()).filter(
    ([key]) => !delegated.has(key)
  );

  if (localGroups.length === 0) return null;

  return (
    <div className="mt-6 w-full rounded-card border border-line bg-surface shadow-card">
      {/* Cabecera */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-slate-50 sm:px-8"
        aria-expanded={!collapsed}
      >
        <div>
          <h2 className="text-section font-bold uppercase tracking-wider text-ink-500">
            Variantes y formas
          </h2>
          <p className="mt-0.5 text-sm text-ink-500">
            {family.total}{" "}
            {family.total === 1
              ? "variante registrada"
              : "variantes registradas en PokéAPI"}
          </p>
        </div>
        <span
          className={`text-xl text-ink-400 transition-transform ${
            collapsed ? "" : "rotate-180"
          }`}
        >
          ▼
        </span>
      </button>

      {!collapsed && (
        <div className="border-t border-line-soft px-6 pb-6 sm:px-8">
          {/* Barra de navegación: mostrar si es una variante (no la especie base) */}
          {!family.isDefault && (
            <div className="mb-5 mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-800">
                Estás viendo una variante de{" "}
                <Link
                  to={`/pokemon/${family.baseId}`}
                  className="font-bold underline hover:text-amber-600"
                >
                  {family.baseDisplayName}
                </Link>
                .
              </p>
            </div>
          )}

          {/* Chips de categorías */}
          <div className="mb-4 flex flex-wrap gap-2">
            {localGroups.map(([key, variants]) => {
              const cat = variants[0].category;
              const chipBg = TONE_BADGE_BG[cat.tone] ?? TONE_BADGE_BG.slate;
              return (
                <span
                  key={key}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${chipBg}`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.shortLabel}</span>
                  <span className="ml-0.5 opacity-70">
                    ({variants.length})
                  </span>
                </span>
              );
            })}
          </div>

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

          {/* Grid de tarjetas */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {family.variants
              .filter((v) => !delegated.has(v.category.key))
              .map((variant) => (
                <VariantCard
                  key={variant.id}
                  variant={variant}
                  speciesName={family.speciesName}
                  isCurrent={variant.isCurrent}
                />
              ))}
          </div>

          {/* Pokémon paradoja relacionados */}
          {family.paradoxRelatives && family.paradoxRelatives.length > 0 && (
            <div className="mt-6 border-t border-line-soft pt-5">
              <h3 className="mb-3 flex items-center gap-2 text-section font-bold uppercase tracking-wider text-ink-500">
                <span>🔄</span>
                <span>Pokémon paradoja relacionados</span>
              </h3>
              <p className="mb-4 text-xs text-ink-500">
                Según el lore de Pokémon Escarlata y Púrpura, estos Pokémon
                paradoja guardan relación con esta especie.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {family.paradoxRelatives.map((relative) => (
                  <ParadoxCard key={relative.id} relative={relative} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
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
  speciesName,
  isCurrent,
}: {
  variant: PokemonVariant;
  speciesName: string;
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