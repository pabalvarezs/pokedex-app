import { useReducedMotionSafe } from "../../../../hooks/useReducedMotionSafe";
import { List } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrainerDatum } from "../../hooks/useAdminAnalytics";
import ChartCard from "./ChartCard";

interface Props {
  data: TrainerDatum[];
  onOpenAll: () => void;
}

export default function FavoritesPerTrainerChart({ data, onOpenAll }: Props) {
  const reduceMotion = useReducedMotionSafe();
  const height = Math.max(220, data.length * 34);
  const summary = `Regalones por entrenador. ${data
    .slice(0, 3)
    .map((trainer) => `${trainer.name} con ${trainer.count}`)
    .join(", ")}.`;

  return (
    <ChartCard
      title="Regalones por entrenador"
      subtitle="Top 8 y el resto agrupado"
      summary={summary}
      action={
        <button
          type="button"
          onClick={onOpenAll}
          className="focus-accent inline-flex shrink-0 items-center gap-1 rounded-control bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition duration-150 hover:bg-slate-200"
        >
          <List className="h-3.5 w-3.5" aria-hidden="true" />
          Ver todos
        </button>
      }
    >
      {data.length === 0 ? (
        <p className="grid h-[220px] place-items-center text-xs text-ink-500">
          Aún no hay regalones por entrenador.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 12, bottom: 0, left: 0 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={104}
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickFormatter={(value: string) =>
                value.length > 14 ? `${value.slice(0, 13)}…` : value
              }
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
              formatter={(value) => [`${String(value)} regalones`, "Guardados"]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 12,
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.10)",
              }}
            />
            <Bar dataKey="count" radius={[0, 5, 5, 0]} isAnimationActive={!reduceMotion}>
              {data.map((trainer) => (
                <Cell
                  key={trainer.key}
                  fill={trainer.isOthers ? "#94a3b8" : "var(--accent)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
