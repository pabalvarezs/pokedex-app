import { useReducedMotionSafe } from "../../../../hooks/useReducedMotionSafe";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DayCount, RangeDays } from "../../hooks/useAdminAnalytics";
import { formatDayLabel, formatDayShortLabel } from "../../lib/dates";
import ChartCard from "./ChartCard";

interface Props {
  data: DayCount[];
  range: RangeDays;
}

export default function TrainersOverTimeChart({ data, range }: Props) {
  const reduceMotion = useReducedMotionSafe();
  const last = data[data.length - 1]?.total ?? 0;
  const first = data[0]?.total ?? 0;
  const summary = `Entrenadores registrados acumulados en los últimos ${range} días: ${first} al inicio y ${last} al final del rango.`;

  return (
    <ChartCard
      title="Entrenadores en el tiempo"
      subtitle="Cuentas acumuladas hasta cada día"
      summary={summary}
    >
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
          <defs>
            <linearGradient id="trainers-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="key"
            tickFormatter={(value: string) => formatDayShortLabel(value)}
            tick={{ fontSize: 10, fill: "#64748b" }}
            interval="preserveStartEnd"
            minTickGap={8}
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
            labelFormatter={(label) => formatDayLabel(String(label))}
            formatter={(value) => [`${String(value)} entrenadores`, "Acumulado"]}
            wrapperStyle={{ transition: "opacity 150ms ease-out" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              fontSize: 12,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.10)",
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="var(--accent)"
            fill="url(#trainers-area)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={!reduceMotion}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
