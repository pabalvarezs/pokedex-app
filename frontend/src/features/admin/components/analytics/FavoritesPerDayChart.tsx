import { useReducedMotion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DayCount, RangeDays } from "../../hooks/useAdminAnalytics";
import { formatDayLabel } from "../../lib/dates";
import ChartCard from "./ChartCard";

interface Props {
  data: DayCount[];
  range: RangeDays;
}

export default function FavoritesPerDayChart({ data, range }: Props) {
  const reduceMotion = useReducedMotion();
  const total = data.reduce((sum, point) => sum + point.total, 0);
  const withData = data.filter((point) => point.total > 0).length;
  const summary = `Regalones guardados por día en los últimos ${range} días: ${total} en total, con actividad en ${withData} días.`;

  return (
    <ChartCard
      title="Regalones por día"
      subtitle={`Guardados en los últimos ${range} días`}
      summary={summary}
    >
      {total === 0 ? (
        <p className="grid h-[220px] place-items-center text-xs text-ink-500">
          Sin guardados en este rango.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="key"
              tickFormatter={(value: string) => formatDayLabel(value)}
              tick={{ fontSize: 10, fill: "#64748b" }}
              interval={range === 7 ? 0 : range === 30 ? 4 : 14}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
              labelFormatter={(label) => formatDayLabel(String(label))}
              formatter={(value) => [`${String(value)} regalones`, "Guardados"]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 12,
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.10)",
              }}
            />
            <Bar
              dataKey="total"
              fill="var(--accent)"
              radius={[5, 5, 0, 0]}
              isAnimationActive={!reduceMotion}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
