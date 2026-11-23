interface Props {
  type: string;
  className?: string;
}

/**
 * Insignia circular de cada tipo, extraída de los PNG originales y
 * vectorizada a SVG. Los archivos viven en `public/tipos` y se sirven por URL
 * para no inflar el bundle con los 18 trazados en línea.
 */
const ICON_FILES: Record<string, string> = {
  normal: "normal",
  fire: "fuego",
  water: "agua",
  electric: "electrico",
  grass: "planta",
  ice: "hielo",
  fighting: "lucha",
  poison: "veneno",
  ground: "tierra",
  flying: "volador",
  psychic: "psiquico",
  bug: "bicho",
  rock: "roca",
  ghost: "fantasma",
  dragon: "dragon",
  dark: "siniestro",
  steel: "acero",
  fairy: "hada",
};

export default function TypeIcon({ type, className = "h-4 w-4" }: Props) {
  const file = ICON_FILES[type.toLowerCase()] ?? "normal";

  return (
    <img
      src={`${import.meta.env.BASE_URL}tipos/${file}.svg`}
      alt=""
      aria-hidden="true"
      className={className}
    />
  );
}
