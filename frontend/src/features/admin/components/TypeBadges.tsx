import TypeBadge from "./TypeBadge";

interface Props {
  types: string[];
  loading?: boolean;
  isError?: boolean;
  size?: "sm" | "md";
}

export default function TypeBadges({
  types,
  loading = false,
  isError = false,
  size = "sm",
}: Props) {
  if (loading) {
    return (
      <span className="inline-flex items-center gap-1" aria-hidden="true">
        <span className="h-5 w-12 rounded-full bg-slate-200 motion-safe:animate-pulse" />
        <span className="h-5 w-10 rounded-full bg-slate-200 motion-safe:animate-pulse" />
      </span>
    );
  }

  if (isError || types.length === 0) {
    return (
      <span
        title="Tipos no disponibles"
        className="text-[10px] font-semibold text-ink-500"
      >
        —
      </span>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {types.map((type) => (
        <TypeBadge key={type} type={type} size={size} />
      ))}
    </span>
  );
}
