import { getTypeBadge } from "../../utils/pokemon";

interface Props {
  type: string;
}

export default function TypeBadge({ type }: Props) {
  const info = getTypeBadge(type);

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.04em] shadow-sm"
      style={{
        backgroundColor: info.accent,
        borderColor: info.accent,
        color: info.onAccent ?? "#ffffff",
      }}
    >
      <span aria-hidden="true" className="text-[10px] leading-none">
        {info.emoji}
      </span>
      {info.es}
    </span>
  );
}
