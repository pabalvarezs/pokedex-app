import { getTypeBadge } from "../utils/pokemon";

interface Props {
  type: string;
  size?: "sm" | "md";
  /** `solid` para vitrinas públicas, `soft` para tablas densas del panel. */
  variant?: "solid" | "soft";
  showEmoji?: boolean;
}

/**
 * Badge de tipo compartido. Unifica los colores de `utils/pokemon` con el
 * mismo lenguaje visual en las páginas públicas y en el panel de administración.
 */
export default function TypeBadge({
  type,
  size = "md",
  variant = "soft",
  showEmoji = false,
}: Props) {
  const info = getTypeBadge(type);
  const sizing =
    size === "sm" ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[11px]";

  if (variant === "solid") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border font-extrabold uppercase tracking-wide shadow-sm ${sizing}`}
        style={{
          backgroundColor: info.accent,
          borderColor: info.accent,
          color: info.onAccent ?? "#ffffff",
        }}
      >
        {showEmoji && (
          <span aria-hidden="true" className="text-[10px] leading-none">
            {info.emoji}
          </span>
        )}
        {info.es}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-extrabold uppercase tracking-wider ring-1 ring-inset ring-black/10 ${info.bg} ${info.text} ${sizing}`}
    >
      {showEmoji && (
        <span aria-hidden="true" className="text-[10px] leading-none">
          {info.emoji}
        </span>
      )}
      {info.es}
    </span>
  );
}
