import PokemonArtwork from "../../../components/PokemonArtwork";
import { spriteUrl } from "../lib/pokemonArtwork";
import { getTypeColor } from "../lib/typeColors";

interface Props {
  pokemonId: number;
  name: string;
  type?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const CIRCLE: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-14 w-14",
  md: "h-16 w-16",
  lg: "h-24 w-24",
};

const IMAGE: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-12 w-12",
  md: "h-14 w-14",
  lg: "h-20 w-20",
};

/** Sprite dentro de un círculo con el degradado pastel del tipo principal. */
export default function PokemonAvatar({
  pokemonId,
  name,
  type,
  size = "sm",
  className = "",
}: Props) {
  const color = getTypeColor(type);

  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full shadow-soft ring-2 ring-white/80 ${CIRCLE[size]} ${className}`}
      style={{ backgroundImage: color.gradient }}
    >
      <PokemonArtwork
        id={pokemonId}
        name={name}
        src={spriteUrl(pokemonId)}
        className={`${IMAGE[size]} object-contain transition-transform duration-200 ease-out motion-safe:group-hover:scale-110`}
      />
    </span>
  );
}
