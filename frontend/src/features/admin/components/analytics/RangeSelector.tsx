import type { RangeDays } from "../../hooks/useAdminAnalytics";

const RANGES: RangeDays[] = [7, 30, 90];

interface Props {
  value: RangeDays;
  onChange: (range: RangeDays) => void;
}

export default function RangeSelector({ value, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Rango de fechas de los gráficos"
      className="inline-flex shrink-0 rounded-control bg-slate-100 p-1"
    >
      {RANGES.map((range) => {
        const active = value === range;
        return (
          <button
            key={range}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(range)}
            className={`focus-accent rounded-[10px] px-3 py-1.5 text-xs font-bold tabular-nums transition duration-150 ${
              active
                ? "bg-white text-ink-900 shadow-sm"
                : "text-ink-500 hover:text-ink-700"
            }`}
          >
            {range} d
          </button>
        );
      })}
    </div>
  );
}
