import { useEffect, useState } from "react";
import { DEFAULT_POKEMON_AVATAR, isUsableImageUrl } from "../lib/pokemonArtwork";
import type { Role } from "./RoleBadge";

interface Props {
  src: string | null | undefined;
  name: string;
  role: Role;
  size?: "md" | "lg";
  className?: string;
}

const SIZES: Record<NonNullable<Props["size"]>, string> = {
  md: "h-11 w-11",
  lg: "h-16 w-16",
};

const RINGS: Record<Role, string> = {
  admin: "ring-violet-400/70",
  trainer: "ring-emerald-400/70",
};

/** Avatar con anillo del rol y Pikachu como respaldo si la URL falla. */
export default function UserAvatar({
  src,
  name,
  role,
  size = "md",
  className = "",
}: Props) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const source = !failed && isUsableImageUrl(src) ? src : DEFAULT_POKEMON_AVATAR;

  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-slate-100 ring-2 ${RINGS[role]} ${SIZES[size]} ${className}`}
    >
      <img
        src={source}
        alt={name}
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        draggable={false}
        onError={() => setFailed(true)}
      />
    </span>
  );
}
