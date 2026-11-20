import { getTypeColor } from "../lib/typeColors";

interface Props {
  type: string;
  size?: "sm" | "md";
}

export default function TypeBadge({ type, size = "md" }: Props) {
  const color = getTypeColor(type);

  return (
    <span
      className={`inline-flex items-center rounded-full font-extrabold uppercase tracking-wider ring-1 ${color.bg} ${color.text} ${color.ring} ${
        size === "sm" ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]"
      }`}
    >
      {color.es}
    </span>
  );
}
