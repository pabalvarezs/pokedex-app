import type { CSSProperties, MouseEvent } from "react";
import { Link } from "react-router-dom";
import type { Favorite } from "../../services/api";
import type { PokemonPreview } from "../../hooks/usePokemonPreviews";
import { getTypeBadge } from "../../utils/pokemon";
import PokemonArtwork from "../PokemonArtwork";
import TypeBadge from "./TypeBadge";
import { ArrowRightIcon, StarIcon } from "./icons";

interface Props {
  favorite: Favorite;
  preview?: PokemonPreview;
  index: number;
  isRemoving: boolean;
  onRemove: (favorite: Favorite) => void;
}

export default function FavoritePokemonCard({
  favorite,
  preview,
  index,
  isRemoving,
  onRemove,
}: Props) {
  const name = preview?.name ?? favorite.name;
  const types = preview?.types ?? [];
  const primaryType = types[0];
  const theme = primaryType ? getTypeBadge(primaryType) : null;
  const formattedId = String(favorite.pokemonId).padStart(3, "0");
  const hp = preview?.stats?.find((stat) => stat.name === "hp")?.base_stat;
  const hpPercent =
    hp === undefined ? 0 : Math.min(100, Math.round((hp / 200) * 100));

  const style = {
    "--fav-index": Math.min(index, 8),
    "--type-accent": theme?.accent ?? "#fca5a5",
  } as CSSProperties;

  const mediaBackground = theme
    ? `linear-gradient(140deg, ${theme.gradient[0]} 0%, ${theme.gradient[1]} 100%)`
    : "linear-gradient(140deg, #F8FAFC 0%, #E2E8F0 100%)";

  const watermarkColor = `${theme?.accent ?? "#0f172a"}1f`;

  const handleRemove = (event: MouseEvent<HTMLButtonElement>) => {
    // La estrella vive fuera del enlace, pero cortamos la propagación para que
    // el clic nunca se interprete como "abrir ficha".
    event.stopPropagation();
    onRemove(favorite);
  };

  return (
    <article
      style={style}
      aria-busy={isRemoving || undefined}
      className={`favorite-card group/card relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card ${
        isRemoving ? "favorite-card-exit" : ""
      }`}
    >
      {/* Toda la tarjeta es el enlace real a la ficha: sin botones anidados. */}
      <Link
        to={`/pokemon/${favorite.pokemonId}`}
        aria-label={`Ver ficha de ${name}`}
        className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500"
      >
        <div
          className="relative flex aspect-[5/4] items-center justify-center overflow-hidden px-4 pb-3 pt-7"
          style={{ backgroundImage: mediaBackground }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-2 right-3 select-none text-[46px] font-black leading-none tracking-tighter"
            style={{ color: watermarkColor }}
          >
            #{formattedId}
          </span>

          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 aspect-square w-[48%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-white/45 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]"
          />

          <PokemonArtwork
            id={favorite.pokemonId}
            name={name}
            src={preview?.artwork}
            priority={index < 4}
            className="relative z-10 aspect-square w-[64%] max-h-[88%] object-contain drop-shadow-md transition-transform duration-300 ease-out group-hover/card:-rotate-2 group-hover/card:scale-110 motion-reduce:transform-none"
          />
        </div>

        <div className="flex flex-1 flex-col gap-2.5 p-4">
          <h2 className="truncate text-lg font-extrabold capitalize text-ink-900 transition-colors group-hover/card:text-red-600">
            {name}
          </h2>

          <div className="flex min-h-[26px] flex-wrap items-center gap-1.5">
            {types.length > 0 ? (
              types.map((type) => <TypeBadge key={type} type={type} />)
            ) : (
              <span
                aria-hidden="true"
                className="skeleton h-[26px] w-24 rounded-full"
              />
            )}
          </div>

          {hp !== undefined && (
            <div className="mt-auto pt-0.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-ink-500">
                <span>PS</span>
                <span className="tabular-nums">{hp}</span>
              </div>
              <div
                role="img"
                aria-label={`PS base ${hp}`}
                className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200"
              >
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${hpPercent}%`,
                    backgroundColor: theme?.accent ?? "#dc2626",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-4 pb-4">
          <span
            aria-hidden="true"
            className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-control border border-red-200 bg-red-50 px-3.5 py-1.5 text-sm font-bold text-red-700 transition-colors group-hover/card:border-red-300 group-hover/card:bg-red-100"
          >
            Ver ficha
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover/card:translate-x-0.5 motion-reduce:transform-none" />
          </span>
        </div>
      </Link>

      <button
        type="button"
        onClick={handleRemove}
        disabled={isRemoving}
        aria-label={`Quitar a ${name} de mis regalones`}
        title="Quitar de regalones"
        className="group/remove absolute right-3 top-3 z-20 flex min-h-[44px] items-center justify-center rounded-full border border-white/80 bg-white/90 px-2.5 py-1.5 text-amber-500 shadow-sm backdrop-blur-sm transition hover:border-red-600 hover:bg-red-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
      >
        <StarIcon className="h-4 w-4 shrink-0" />
        <span className="ml-0 max-w-0 overflow-hidden whitespace-nowrap text-[11px] font-extrabold uppercase tracking-wide opacity-0 transition-all duration-200 group-hover/remove:ml-1 group-hover/remove:max-w-[64px] group-hover/remove:opacity-100 group-focus-visible/remove:ml-1 group-focus-visible/remove:max-w-[64px] group-focus-visible/remove:opacity-100 motion-reduce:transition-none">
          Quitar
        </span>
      </button>
    </article>
  );
}
