import { Gauge, Shield, Swords } from "lucide-react";
import { Link } from "react-router-dom";
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
import PokemonArtwork from "../../../../components/PokemonArtwork";
import { getTypeBadge } from "../../../../utils/pokemon";
import { formatNumber } from "../../lib/format";
import type {
  GenerationBucket,
  RoleLeaders,
  TypeAverage,
} from "../../lib/types";

interface Props {
  typeAverages: TypeAverage[];
  generationDistribution: GenerationBucket[];
  roleLeaders: RoleLeaders;
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

const ROLES = [
  { key: "attacker" as const, label: "Atacante", hint: "Ataque + Ataque especial", icon: Swords, accent: "#ea580c" },
  { key: "defender" as const, label: "Defensor", hint: "Defensa + Defensa especial", icon: Shield, accent: "#2563eb" },
  { key: "fast" as const, label: "Rápido", hint: "Velocidad", icon: Gauge, accent: "#d97706" },
];

export default function InsightsPanels({
  typeAverages,
  generationDistribution,
  roleLeaders,
}: Props) {
  const typeData = typeAverages.map((item) => ({
    name: getTypeBadge(item.type).es,
    average: item.average,
    color: getTypeBadge(item.type).badge,
  }));

  const generationData = generationDistribution.map((bucket, index) => ({
    name: `Gen ${ROMAN[index]}`,
    count: bucket.count,
    percentage: bucket.percentage,
  }));

  return (
    <section aria-label="Datos para jugadores competitivos" className="space-y-5">
      <div>
        <h2 className="mb-3 text-sm font-black text-ink-900">
          Mejor Pokémon por rol
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {ROLES.map((role) => {
            const leaders = roleLeaders[role.key];
            const Icon = role.icon;
            return (
              <article
                key={role.key}
                className="glass-surface rounded-card border border-line p-4 shadow-soft"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="grid h-8 w-8 place-items-center rounded-full"
                    style={{ backgroundColor: `${role.accent}1f`, color: role.accent }}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-xs font-black text-ink-900">{role.label}</h3>
                    <p className="text-[10px] text-ink-500">{role.hint}</p>
                  </div>
                </div>
                <ul className="mt-3 space-y-2">
                  {leaders.length === 0 ? (
                    <li className="text-xs font-semibold text-ink-500">Sin datos</li>
                  ) : (
                    leaders.map((leader) => (
                      <li key={leader.id} className="flex items-center gap-2">
                        <PokemonArtwork
                          id={leader.id}
                          name={leader.name}
                          src={leader.artwork ?? leader.sprite}
                          className="h-9 w-9 shrink-0 object-contain"
                        />
                        <Link
                          to={`/pokemon/${leader.id}`}
                          className="min-w-0 flex-1 truncate text-sm font-extrabold capitalize text-ink-900 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                        >
                          {leader.name}
                        </Link>
                        <span className="shrink-0 text-sm font-black tabular-nums" style={{ color: role.accent }}>
                          {formatNumber(leader.value, 0)}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </article>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="glass-surface rounded-card border border-line p-4 shadow-soft">
          <h3 className="text-sm font-black text-ink-900">
            Promedio de estadísticas por tipo
          </h3>
          <p className="mb-3 text-[11px] text-ink-500">
            Suma de las 6 estadísticas base, promediada por tipo.
          </p>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 4, right: 8, bottom: 56, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 9 }}
                  height={56}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ fill: "rgba(220,38,38,0.06)" }} />
                <Bar dataKey="average" radius={[5, 5, 0, 0]}>
                  {typeData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <details className="mt-2 text-xs">
            <summary className="cursor-pointer font-bold text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400">
              Ver promedios por estadística
            </summary>
            <div className="mt-2 max-h-56 overflow-auto">
              <table className="w-full text-left text-[11px]">
                <caption className="sr-only">Promedio de estadísticas base por tipo</caption>
                <thead className="sticky top-0 bg-white/95 text-ink-500">
                  <tr>
                    <th scope="col" className="py-1.5">Tipo</th>
                    <th scope="col" className="py-1.5 text-right">PS</th>
                    <th scope="col" className="py-1.5 text-right">Atq.</th>
                    <th scope="col" className="py-1.5 text-right">Def.</th>
                    <th scope="col" className="py-1.5 text-right">Atq. Esp.</th>
                    <th scope="col" className="py-1.5 text-right">Def. Esp.</th>
                    <th scope="col" className="py-1.5 text-right">Vel.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {typeAverages.map((item) => (
                    <tr key={item.type}>
                      <th scope="row" className="py-1.5 font-bold capitalize">
                        {getTypeBadge(item.type).es} <span className="font-normal text-ink-500">({item.count})</span>
                      </th>
                      <td className="py-1.5 text-right tabular-nums">{formatNumber(item.stats.hp)}</td>
                      <td className="py-1.5 text-right tabular-nums">{formatNumber(item.stats.attack)}</td>
                      <td className="py-1.5 text-right tabular-nums">{formatNumber(item.stats.defense)}</td>
                      <td className="py-1.5 text-right tabular-nums">{formatNumber(item.stats["special-attack"])}</td>
                      <td className="py-1.5 text-right tabular-nums">{formatNumber(item.stats["special-defense"])}</td>
                      <td className="py-1.5 text-right tabular-nums">{formatNumber(item.stats.speed)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </article>

        <article className="glass-surface rounded-card border border-line p-4 shadow-soft">
          <h3 className="text-sm font-black text-ink-900">
            Distribución por generación
          </h3>
          <p className="mb-3 text-[11px] text-ink-500">
            Pokémon incluidos en los filtros actuales.
          </p>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={generationData} margin={{ top: 4, right: 8, bottom: 8, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ fill: "rgba(220,38,38,0.06)" }} />
                <Bar dataKey="count" radius={[5, 5, 0, 0]} fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 grid grid-cols-3 gap-1.5 text-[10px] font-bold text-ink-500 sm:grid-cols-5">
            {generationDistribution.map((bucket, index) => (
              <li key={bucket.generation} className="rounded-control bg-slate-50 px-1.5 py-1 text-center">
                Gen {ROMAN[index]}: {formatNumber(bucket.percentage)}%
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
