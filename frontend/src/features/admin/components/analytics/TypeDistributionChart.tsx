import { useReducedMotionSafe } from "../../../../hooks/useReducedMotionSafe";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { TypeDatum } from "../../hooks/useAdminAnalytics";
import ChartCard from "./ChartCard";

interface Props {
  data: TypeDatum[];
  loading?: boolean;
}

export default function TypeDistributionChart({ data, loading = false }: Props) {
  const reduceMotion = useReducedMotionSafe();
  const total = data.reduce((sum, slice) => sum + slice.count, 0);
  const summary = `Distribución de tipos Pokémon entre los regalones guardados: ${data
    .slice(0, 5)
    .map((slice) => `${slice.label} ${slice.count}`)
    .join(", ")}.`;

  return (
    <ChartCard
      title="Tipos de Pokémon"
      subtitle="Apariciones en los regalones guardados"
      summary={summary}
    >
      {loading ? (
        <p className="grid h-[220px] place-items-center text-xs text-ink-500">
          Cargando tipos…
        </p>
      ) : data.length === 0 ? (
        <p className="grid h-[220px] place-items-center text-xs text-ink-500">
          Sin tipos para mostrar todavía.
        </p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="label"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={2}
                stroke="#ffffff"
                strokeWidth={2}
                isAnimationActive={!reduceMotion}
                animationDuration={600}
                animationEasing="ease-out"
              >
                {data.map((slice) => (
                  <Cell key={slice.key} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  `${String(value)} apariciones`,
                  String(name),
                ]}
                wrapperStyle={{ transition: "opacity 150ms ease-out" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.10)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <p className="mb-2 text-center text-[11px] text-ink-500">
            {total} apariciones en total · un Pokémon puede aportar 2 tipos
          </p>
          <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1.5">
            {data.slice(0, 10).map((slice) => (
              <li
                key={slice.key}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-700"
              >
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                {slice.label}
                <span className="tabular-nums text-ink-500">{slice.count}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </ChartCard>
  );
}
