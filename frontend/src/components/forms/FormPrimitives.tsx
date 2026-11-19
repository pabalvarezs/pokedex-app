import type { ReactNode } from "react";
import { getTypeBadge } from "../../utils/pokemon";
import PokemonArtwork from "../PokemonArtwork";

/** Nombre legible para slugs de PokeAPI: "charizard-mega-x" → "Charizard Mega X". */
export function prettyFormName(name: string) {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatFormId(id: number) {
  return `#${String(id).padStart(3, "0")}`;
}

/** Arte oficial con respaldo al sprite y, por último, al artwork por ID. */
export function formArtwork(form: {
  id: number;
  artwork?: string;
  sprite?: string;
}) {
  return (
    form.artwork ??
    form.sprite ??
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${form.id}.png`
  );
}

export function TypePills({
  types,
  dense = false,
}: {
  types: string[];
  dense?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 ${dense ? "justify-center" : ""}`}
    >
      {types.map((type) => {
        const badge = getTypeBadge(type);
        return (
          <span
            key={type}
            className={`rounded-full border font-extrabold uppercase tracking-wide ${
              dense ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]"
            } ${badge.bg} ${badge.text} ${badge.border}`}
          >
            {badge.es}
          </span>
        );
      })}
    </div>
  );
}

type FormTone = "base" | "mega" | "gmax";

const SUMMARY_TONES: Record<
  Exclude<FormTone, "base">,
  { card: string; label: string }
> = {
  mega: {
    card: "border-violet-200 bg-gradient-to-b from-violet-50 to-white",
    label: "bg-violet-600 text-white",
  },
  gmax: {
    card: "border-rose-200 bg-gradient-to-b from-rose-50 to-white",
    label: "bg-rose-600 text-white",
  },
};

/** Resumen compacto de una forma para las comparaciones lado a lado. */
export function FormSummary({
  label,
  name,
  id,
  types,
  artwork,
  tone,
  size = "default",
}: {
  label: string;
  name: string;
  id: number;
  types: string[];
  artwork?: string;
  tone: FormTone;
  /** "large" da más protagonismo a la ilustración en las comparaciones. */
  size?: "default" | "large";
}) {
  const accent = tone === "base" ? null : SUMMARY_TONES[tone];

  return (
    <div
      className={`flex flex-col items-center rounded-[12px] border p-3 text-center ${
        accent ? accent.card : "border-line bg-surface"
      }`}
    >
      <div className="flex w-full items-center justify-between gap-1">
        <span
          className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] ${
            accent ? accent.label : "bg-slate-100 text-ink-500"
          }`}
        >
          {label}
        </span>
        <span className="text-[9px] font-bold text-ink-500">
          {formatFormId(id)}
        </span>
      </div>

      <PokemonArtwork
        id={id}
        name={name}
        src={artwork}
        className={`mt-1 object-contain drop-shadow-sm ${
          size === "large"
            ? "h-28 w-28 sm:h-40 sm:w-40"
            : "h-24 w-24 sm:h-28 sm:w-28"
        }`}
      />

      <p className="mt-1 line-clamp-2 min-h-[2rem] w-full text-xs font-extrabold capitalize leading-tight text-ink-900">
        {name}
      </p>
      <div className="mt-1.5">
        <TypePills types={types} dense />
      </div>
    </div>
  );
}

const HERO_TONES = {
  violet: {
    gradient: "from-violet-700 via-indigo-600 to-fuchsia-700",
    dot: "bg-fuchsia-300",
    blob: "bg-fuchsia-300/20",
    badgeText: "text-violet-50",
  },
  rose: {
    gradient: "from-rose-700 via-red-600 to-amber-600",
    dot: "bg-amber-300",
    blob: "bg-amber-300/20",
    badgeText: "text-rose-50",
  },
} as const;

export function FormHero({
  tone,
  badge,
  emoji,
  title,
  titleId,
  subtitle,
  aside,
}: {
  tone: keyof typeof HERO_TONES;
  badge: string;
  emoji: string;
  title: string;
  titleId: string;
  subtitle: string;
  aside?: ReactNode;
}) {
  const styles = HERO_TONES[tone];

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-r px-6 py-6 text-white sm:px-8 ${styles.gradient}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[38px] border-white/10"
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full blur-3xl ${styles.blob}`}
      />

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div>
          <span
            className={`mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] backdrop-blur-sm ${styles.badgeText}`}
          >
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
            />
            {badge}
          </span>
          <h2
            id={titleId}
            className="flex items-center gap-2 text-xl font-black tracking-tight sm:text-2xl"
          >
            <span aria-hidden="true">{emoji}</span>
            {title}
          </h2>
          <p className="mt-1 max-w-2xl text-xs font-medium text-white/80 sm:text-sm">
            {subtitle}
          </p>
        </div>

        {aside}
      </div>
    </div>
  );
}
