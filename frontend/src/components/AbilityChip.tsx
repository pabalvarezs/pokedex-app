import { getAbilityDescription, getOutOfBattleEffects } from "../utils/abilities";
import Popover from "./Popover";

interface Props {
  /** Nombre en español que envía el backend. */
  name: string;
  /** Slug inglés de PokéAPI (campo aditivo). Tiene prioridad en la búsqueda. */
  slug?: string;
  isHidden: boolean;
}

/** Chip de habilidad con descripción y efectos fuera de combate en el popover. */
export default function AbilityChip({ name, slug, isHidden }: Props) {
  const description = getAbilityDescription(slug ?? name);
  const outOfBattle = getOutOfBattleEffects(slug ?? name);

  const chipClassName = `flex cursor-help items-center gap-1.5 rounded-control border px-3 py-1.5 text-xs font-bold capitalize transition duration-150 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1 motion-reduce:transition-none ${
    isHidden
      ? "bg-purple-50 text-purple-800 border-purple-200"
      : "bg-gray-100 text-gray-800 border-gray-200"
  }`;

  return (
    <Popover
      chipClassName={chipClassName}
      popover={
        <>
          <div
            className={`flex items-center justify-between gap-2 px-3 py-2 ${
              isHidden ? "bg-accent-recovery" : "bg-accent-trainers"
            }`}
          >
            <p className="text-xs font-extrabold capitalize text-white">{name}</p>
            {isHidden && (
              <span className="shrink-0 rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-white">
                Oculta
              </span>
            )}
          </div>
          <div className="space-y-2 px-3 py-2.5">
            <p className="text-[11px] font-medium leading-relaxed text-ink-900">
              {description ?? "Descripción no disponible."}
            </p>
            {outOfBattle.length > 0 && (
              <div className="rounded-lg border border-purple-100 bg-purple-50/70 p-2">
                <p className="mb-1 text-[9px] font-black uppercase tracking-wide text-purple-700">
                  Fuera de combate
                </p>
                <ul className="space-y-1">
                  {outOfBattle.map((effect) => (
                    <li key={effect} className="text-[10px] font-medium leading-snug text-ink-900">
                      • {effect}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-[9px] font-semibold uppercase tracking-wide text-ink-500">
              Fuente: WikiDex
            </p>
          </div>
        </>
      }
    >
      <span>{name}</span>
      {isHidden && (
        <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded font-black">
          Escondía
        </span>
      )}
    </Popover>
  );
}
