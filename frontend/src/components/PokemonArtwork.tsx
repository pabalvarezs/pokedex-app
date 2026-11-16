import { useEffect, useMemo, useState } from "react";

interface PokemonArtworkProps {
  id: number;
  name: string;
  /** Fuente preferida (por ejemplo, el artwork que ya entrega la API). */
  src?: string;
  className?: string;
  /** Se usa en la tarjeta que representa la ficha actual. */
  priority?: boolean;
}

function artworkUrl(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

function spriteUrl(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

/**
 * Ilustración con respaldo: primero el artwork oficial, luego el sprite y,
 * si ninguno carga, una Poké Ball discreta. Evita íconos roos en la ficha.
 */
export default function PokemonArtwork({
  id,
  name,
  src,
  className = "",
  priority = false,
}: PokemonArtworkProps) {
  const sources = useMemo(() => {
    const candidates = [src, artworkUrl(id), spriteUrl(id)].filter(
      (candidate): candidate is string => Boolean(candidate)
    );
    return Array.from(new Set(candidates));
  }, [id, src]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [sources]);

  if (index >= sources.length) {
    return (
      <span
        role="img"
        aria-label={`Ilustración no disponible de ${name}`}
        className={`inline-flex items-center justify-center text-slate-300 ${className}`}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="h-1/2 w-1/2"
          aria-hidden="true"
        >
          <circle cx="32" cy="32" r="22" />
          <path d="M10 32h44" />
          <circle cx="32" cy="32" r="8" fill="white" />
        </svg>
      </span>
    );
  }

  return (
    <img
      src={sources[index]}
      alt={name}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      onError={() => setIndex((current) => current + 1)}
    />
  );
}
