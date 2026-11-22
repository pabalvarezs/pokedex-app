import { Fragment } from "react";
import { Link } from "react-router-dom";
import type { EvolutionStage } from "../services/api";
import { usePokemonPreviews } from "../hooks/usePokemonPreviews";
import { getTypeBadge } from "../utils/pokemon";
import TypeBadge from "./TypeBadge";
import PokemonArtwork from "./PokemonArtwork";

interface EvolutionChainProps {
  stages: EvolutionStage[];
  currentId: number;
}

function prettyName(name: string) {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatId(id: number) {
  return `#${String(id).padStart(3, "0")}`;
}

function levelFromCondition(condition?: string) {
  return condition?.match(/\bNivel\s+(\d+)/i)?.[1];
}

function typeTint(types?: string[]) {
  if (!types?.length) return "#e2e8f0";
  return getTypeBadge(types[0]).badge;
}

function StageLabel({ index, stage }: { index: number; stage: EvolutionStage }) {
  const isBranch = stage.members.length > 1;

  return (
    <div className="mb-3 flex h-7 items-center justify-center">
      <span
        className={`inline-flex max-w-full items-center gap-1.5 truncate rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
          isBranch
            ? "border-violet-200 bg-violet-50 text-violet-700"
            : "border-line bg-white text-ink-500"
        }`}
      >
        <span>Etapa {index + 1}</span>
        {isBranch && (
          <>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-violet-400" />
            <span>{stage.members.length} ramas</span>
          </>
        )}
      </span>
    </div>
  );
}

function EvolutionConnector({ nextStage }: { nextStage: EvolutionStage }) {
  const isBranch = nextStage.members.length > 1;
  const condition = !isBranch ? nextStage.members[0]?.condition : undefined;
  const level = levelFromCondition(condition);

  return (
    <div className="flex w-full shrink-0 flex-col items-center justify-center gap-2 self-center py-2 md:w-16 md:py-0 lg:w-24">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-600 via-rose-500 to-amber-500 text-white shadow-lg shadow-rose-200/80 ring-4 ring-white transition-transform duration-200 hover:scale-105 sm:h-10 sm:w-10"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 rotate-90 sm:h-5 sm:w-5 md:rotate-0"
        >
          <path d="M4 12h15" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      </span>

      {isBranch ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-violet-700">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3"
            aria-hidden="true"
          >
            <circle cx="6" cy="5" r="2.2" />
            <circle cx="18" cy="7" r="2.2" />
            <circle cx="18" cy="17" r="2.2" />
            <path d="M8.2 5h3.8a2 2 0 0 1 2 2v8a2 2 0 0 1 2 2h-.2" />
          </svg>
          Elige rama
        </span>
      ) : condition ? (
        <span
          title={condition}
          className="block max-w-[180px] rounded-full border border-red-100 bg-white px-2 py-1 text-center text-[9px] font-black uppercase tracking-wide text-red-600 shadow-sm md:max-w-[92px]"
        >
          {level ? `Nv. ${level}` : "Evoluciona"}
        </span>
      ) : null}
    </div>
  );
}

interface EvolutionCardProps {
  member: EvolutionStage["members"][number];
  isCurrent: boolean;
  types?: string[];
}

function EvolutionCard({ member, isCurrent, types }: EvolutionCardProps) {
  const name = prettyName(member.name);
  const tint = typeTint(types);

  return (
    <Link
      to={`/pokemon/${member.id}`}
      aria-current={isCurrent ? "page" : undefined}
      title={
        isCurrent
          ? `${name} (estás viendo esta ficha)`
          : `Ver la ficha de ${name}`
      }
      className={`group relative flex h-[264px] w-[188px] shrink-0 flex-col overflow-hidden rounded-card border bg-surface text-center transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200 sm:h-[280px] ${
        isCurrent
          ? "border-red-400 bg-gradient-to-b from-red-50/80 to-white shadow-ambient ring-2 ring-red-200"
          : "border-line shadow-card hover:-translate-y-1 hover:border-red-300 hover:shadow-ambient motion-reduce:hover:translate-y-0"
      }`}
    >
      {isCurrent && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-10 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-400"
        />
      )}

      <div
        className="relative mx-2 mt-2 flex h-[124px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-white/80 sm:h-[138px]"
        style={{
          background: `radial-gradient(circle at 50% 44%, ${tint}30 0%, #f8fafc 70%)`,
        }}
      >
        <span className="absolute left-2 top-2 z-10 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-extrabold tracking-[0.08em] text-ink-500 shadow-sm backdrop-blur-sm">
          {formatId(member.id)}
        </span>

        {isCurrent && (
          <span className="absolute right-2 top-2 z-10 rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm">
            Aquí
          </span>
        )}

        <PokemonArtwork
          id={member.id}
          name={name}
          priority={isCurrent}
          className="h-[96px] w-[96px] object-contain drop-shadow-md transition-transform duration-200 ease-out group-hover:scale-105 motion-reduce:transform-none sm:h-[112px] sm:w-[112px]"
        />
      </div>

      <div className="flex flex-1 flex-col px-2.5 pb-3 pt-2.5">
        <h3
          className={`truncate text-[15px] font-extrabold capitalize transition-colors ${
            isCurrent ? "text-red-700" : "text-ink-900 group-hover:text-red-600"
          }`}
        >
          {name}
        </h3>

        <div className="mt-1.5 flex min-h-[20px] flex-wrap items-center justify-center gap-1">
          {types && types.length > 0 ? (
            types.map((type) => {
              return <TypeBadge key={type} type={type} size="xs" />;
            })
          ) : (
            <span className="text-[9px] font-semibold uppercase tracking-wide text-ink-500/70">
              Tipo no disponible
            </span>
          )}
        </div>

        <div className="mt-auto flex min-h-[42px] w-full items-center justify-center pt-2">
          {member.condition ? (
            <span
              title={member.condition}
              className="flex w-full items-start justify-center gap-1 rounded-lg border border-line-soft bg-slate-50 px-2 py-1.5 text-[10px] font-semibold leading-snug text-ink-700"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-px h-3 w-3 shrink-0 text-red-500"
                aria-hidden="true"
              >
                <path d="M12 3v18" />
                <path d="m7 8 5-5 5 5" />
              </svg>
              <span className="line-clamp-2">{member.condition}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-ink-500">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              Primera etapa
            </span>
          )}
        </div>
      </div>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1.5 right-2 flex translate-y-1 items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-red-600 opacity-0 shadow-sm transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transform-none"
      >
        Abrir
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-2.5 w-2.5"
        >
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      </span>
    </Link>
  );
}

export default function EvolutionChain({ stages, currentId }: EvolutionChainProps) {
  const memberIds = stages.flatMap((stage) => stage.members.map((member) => member.id));
  const totalMembers = memberIds.length;
  const { previews } = usePokemonPreviews(totalMembers > 1 ? memberIds : []);

  if (stages.length === 0) return null;

  const current = stages
    .flatMap((stage) => stage.members)
    .find((member) => member.id === currentId);
  const hasBranches = stages.some((stage) => stage.members.length > 1);

  return (
    <section aria-labelledby="evolution-title" className="w-full">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-red-700">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Línea evolutiva
          </span>
          <h2
            id="evolution-title"
            className="flex items-center gap-2.5 text-xl font-black uppercase tracking-wide text-gray-800 sm:text-2xl"
          >
            <span aria-hidden="true" className="text-2xl sm:text-3xl">
              🧬
            </span>
            Cadena de evolución
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            {totalMembers > 1
              ? "Toca un Pokémon pa' abrir su ficha."
              : "Este Pokémon no evoluciona, po."}
          </p>
        </div>

        {totalMembers > 1 && (
          <div className="flex flex-wrap items-center gap-2 pr-0.5 text-[11px] font-bold text-ink-500">
            <span className="rounded-full border border-line bg-white px-2.5 py-1">
              {stages.length} {stages.length === 1 ? "etapa" : "etapas"}
            </span>
            <span className="rounded-full border border-line bg-white px-2.5 py-1">
              {totalMembers} especies
            </span>
            {hasBranches && (
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-violet-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3"
                  aria-hidden="true"
                >
                  <circle cx="6" cy="5" r="2.2" />
                  <circle cx="18" cy="7" r="2.2" />
                  <circle cx="18" cy="17" r="2.2" />
                  <path d="M8.2 5h3.8a2 2 0 0 1 2 2v8a2 2 0 0 1 2 2h-.2" />
                </svg>
                Cadena ramificada
              </span>
            )}
          </div>
        )}
      </div>

      {totalMembers <= 1 ? (
        <div className="glass-surface relative overflow-hidden rounded-card border border-line p-6 shadow-card sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-red-100/50 blur-3xl"
          />
          <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">
            <div className="artwork-frame flex h-36 w-36 shrink-0 items-center justify-center rounded-card border border-line-soft p-3 shadow-sm">
              <PokemonArtwork
                id={currentId}
                name={current ? prettyName(current.name) : "Pokémon"}
                priority
                className="h-28 w-28 object-contain drop-shadow-md"
              />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-ink-500">
                Sin evolución
              </span>
              <h3 className="mt-2 text-lg font-black capitalize text-ink-900 sm:text-xl">
                {current ? prettyName(current.name) : "Este Pokémon"}
              </h3>
              <p className="mt-1 text-sm font-semibold text-ink-700">
                {current ? prettyName(current.name) : "Este Pokémon"} no evoluciona.
              </p>
              <p className="mt-1 max-w-md text-xs leading-relaxed text-ink-500">
                Esta especie mantiene su forma durante toda la aventura. No hay
                etapas previas ni posteriores registradas en la Pokédex.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="-mx-1 overflow-x-auto pb-3 pt-1 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin]">
            <div className="mx-auto flex w-full flex-col items-stretch justify-center gap-0 px-1 sm:px-2 md:w-max md:min-w-full md:flex-row md:items-center">
              {stages.map((stage, index) => {
                const isBranch = stage.members.length > 1;

                return (
                  <Fragment key={`evolution-stage-${index}`}>
                    {index > 0 && <EvolutionConnector nextStage={stage} />}

                    <div
                      className={`shrink-0 ${
                        isBranch
                          ? "mx-auto w-full max-w-[420px] md:mx-0 md:w-[392px] md:max-w-none lg:w-[596px] xl:w-[800px]"
                          : "mx-auto w-[188px] md:mx-0"
                      }`}
                    >
                      <StageLabel index={index} stage={stage} />

                      <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                        {stage.members.map((member) => (
                          <EvolutionCard
                            key={member.id}
                            member={member}
                            isCurrent={member.id === currentId}
                            types={previews[member.id]?.types}
                          />
                        ))}
                      </div>
                    </div>
                  </Fragment>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
