import { Fragment } from "react";
import { Link } from "react-router-dom";
import type { EvolutionStage } from "../services/api";

interface EvolutionChainProps {
  stages: EvolutionStage[];
  currentId: number;
}

function prettyName(name: string) {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function spriteUrl(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

function formatId(id: number) {
  return `#${String(id).padStart(3, "0")}`;
}

export default function EvolutionChain({ stages, currentId }: EvolutionChainProps) {
  if (stages.length === 0) return null;

  const totalMembers = stages.reduce((total, stage) => total + stage.members.length, 0);
  const current = stages
    .flatMap((stage) => stage.members)
    .find((member) => member.id === currentId);

  return (
    <section aria-labelledby="evolution-title" className="w-full">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="evolution-title"
            className="flex items-center gap-2.5 text-xl font-black uppercase tracking-wide text-gray-800 sm:text-2xl"
          >
            <span aria-hidden="true" className="text-2xl sm:text-3xl">
              🧬
            </span>
            Cadena evolutiva
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {totalMembers > 1
              ? "Toca una especie para abrir su ficha."
              : "Este Pokémon no tiene evoluciones."}
          </p>
        </div>

        {totalMembers > 1 && (
          <span className="text-xs font-bold text-gray-400">
            {stages.length} {stages.length === 1 ? "etapa" : "etapas"} · {totalMembers} especies
          </span>
        )}
      </div>

      {totalMembers <= 1 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-8 text-center">
          <img
            src={spriteUrl(currentId)}
            alt=""
            loading="lazy"
            className="h-24 w-24 object-contain"
          />
          <p className="text-base font-semibold text-gray-600">
            {current ? prettyName(current.name) : "Este Pokémon"} no evoluciona.
          </p>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-4 md:flex-row md:items-start md:justify-between md:gap-3">
          {stages.map((stage, index) => (
            <Fragment key={`evolution-stage-${index}`}>
              {index > 0 && (
                <div
                  aria-hidden="true"
                  className="flex shrink-0 items-center justify-center py-1 text-3xl font-black text-gray-300 md:self-center md:py-0"
                >
                  <span className="md:hidden">↓</span>
                  <span className="hidden md:inline">→</span>
                </div>
              )}

              <div
                className={`w-full md:w-auto ${
                  stage.members.length > 1 ? "md:max-w-[580px]" : ""
                }`}
              >
                <p className="mb-3 text-center text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Etapa {index + 1}
                </p>

                <div className="flex flex-wrap justify-center gap-3">
                  {stage.members.map((member) => {
                    const isCurrent = member.id === currentId;

                    return (
                      <Link
                        key={member.id}
                        to={`/pokemon/${member.id}`}
                        aria-current={isCurrent ? "page" : undefined}
                        title={
                          isCurrent
                            ? `${prettyName(member.name)} (estás viendo esta ficha)`
                            : `Ver la ficha de ${prettyName(member.name)}`
                        }
                        className={`group flex h-[200px] w-[136px] flex-col items-center justify-between rounded-2xl border p-3 text-center transition ${
                          isCurrent
                            ? "border-red-400 bg-red-50 shadow-sm ring-2 ring-red-200"
                            : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-red-300 hover:shadow-md"
                        }`}
                      >
                        <img
                          src={spriteUrl(member.id)}
                          alt=""
                          loading="lazy"
                          className="h-24 w-24 object-contain drop-shadow-sm transition-transform group-hover:scale-110 sm:h-28 sm:w-28"
                        />

                        <div className="w-full">
                          <p
                            className={`truncate text-sm font-bold ${
                              isCurrent ? "text-red-700" : "text-gray-800"
                            }`}
                          >
                            {prettyName(member.name)}
                          </p>
                          <p className="text-[11px] font-semibold text-gray-400">
                            {formatId(member.id)}
                          </p>

                          {member.condition ? (
                            <p
                              className="mt-1 line-clamp-2 text-[11px] leading-snug text-gray-500"
                              title={member.condition}
                            >
                              {member.condition}
                            </p>
                          ) : (
                            <span aria-hidden="true" className="mt-1 block h-[26px]" />
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      )}
    </section>
  );
}
