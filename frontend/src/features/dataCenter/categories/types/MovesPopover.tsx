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

/** Lista completa de movimientos de un tipo, resuelta con el catálogo local. */
export default function MovesPopover({ anchor, type, onEnter, onLeave }: Props) {
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
        {type.moveSlugs.map((slug) => {
          const move = getMoveInfo(slug);
          const category = move?.[2];
          const chip = category ? MOVE_CLASSES_ES[category] : undefined;
          return (
            <li
              key={slug}
              className="flex items-center justify-between gap-2 rounded-control bg-white/70 px-2 py-1.5"
            >
              <span className="min-w-0 truncate text-[11px] font-bold text-ink-900">
                {move?.[0] ?? humanize(slug)}
              </span>
              {chip && (
                <span
                  className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-extrabold ${chip.chip}`}
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
