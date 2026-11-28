import { cn } from "../../../admin/lib/cn";
import TypeIcon from "../../../../components/TypeIcon";
import { getMoveInfo, MOVE_CLASSES_ES } from "../../../../utils/moves";
import type { TypeMatrixType } from "../../lib/types";
import FloatingPanel, { type PopoverAnchor } from "./FloatingPanel";

interface Props {
  anchor: PopoverAnchor;
  type: TypeMatrixType;
  onEnter: () => void;
  onLeave: () => void;
}

function humanize(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/** Lista completa de movimientos de un tipo, ordenada por potencia y tipo. */
export default function MovesPopover({ anchor, type, onEnter, onLeave }: Props) {
  const moves = type.moveSlugs
    .map((slug) => ({ slug, move: getMoveInfo(slug) }))
    .sort((a, b) => {
      const powerA = a.move?.[3];
      const powerB = b.move?.[3];
      // Los movimientos sin potencia (estado, daño variable) van al final.
      if (powerA == null || powerB == null) {
        if (powerA !== powerB) return powerA == null ? 1 : -1;
      } else if (powerA !== powerB) {
        return powerB - powerA;
      }
      const typeA = a.move?.[1] ?? "";
      const typeB = b.move?.[1] ?? "";
      if (typeA !== typeB) return typeA.localeCompare(typeB, "es");
      return (a.move?.[0] ?? a.slug).localeCompare(b.move?.[0] ?? b.slug, "es");
    });

  return (
    <FloatingPanel
      anchor={anchor}
      label={`Movimientos de tipo ${type.name}`}
      estimatedHeight={360}
      width={320}
      onEnter={onEnter}
      onLeave={onLeave}
    >
      <div className="flex items-center gap-2 border-b border-line-soft pb-2">
        <TypeIcon type={type.slug} className="h-8 w-8" />
        <div>
          <p className="text-sm font-black text-ink-900">
            Movimientos de {type.name}
          </p>
          <p className="text-[10px] font-bold text-ink-500">
            {type.moveCount} movimientos · clase {type.damageClass}
          </p>
        </div>
      </div>
      <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto pr-1">
        {moves.map(({ slug, move }) => {
          const category = move?.[2];
          const chip = category ? MOVE_CLASSES_ES[category] : undefined;
          return (
            <li
              key={slug}
              className="flex items-center gap-2 rounded-control bg-white/70 px-2 py-1.5"
            >
              <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-ink-900">
                {move?.[0] ?? humanize(slug)}
              </span>
              <span
                className="w-8 shrink-0 text-right text-[10px] font-black tabular-nums text-ink-700"
                title="Potencia"
              >
                <span className="sr-only">Potencia </span>
                {move?.[3] ?? "—"}
              </span>
              {chip && (
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-extrabold",
                    chip.chip
                  )}
                >
                  {chip.label}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </FloatingPanel>
  );
}
