import TypeIcon from "../../../../components/TypeIcon";
import { cn } from "../../../admin/lib/cn";
import type { TypeMatrixType } from "../../lib/types";
import FloatingPanel, { type PopoverAnchor } from "./FloatingPanel";
import { multiplierInfo } from "./lib/typeMatrix";

export type { PopoverAnchor } from "./FloatingPanel";

interface Props {
  anchor: PopoverAnchor;
  types: TypeMatrixType[];
  onEnter: () => void;
  onLeave: () => void;
}

function TypeChip({ slug, name }: { slug: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line-soft bg-white/80 py-0.5 pl-0.5 pr-2 text-[10px] font-bold capitalize text-ink-700">
      <TypeIcon type={slug} className="h-4 w-4" />
      {name}
    </span>
  );
}

function RelationRow({
  label,
  slugs,
  names,
  empty,
}: {
  label: string;
  slugs: string[];
  names: Map<string, string>;
  empty: string;
}) {
  return (
    <div className="border-t border-line-soft pt-2">
      <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink-500">
        {label}
      </p>
      <div className="mt-1 flex flex-wrap gap-1">
        {slugs.length === 0 ? (
          <span className="text-[11px] font-semibold text-ink-500">{empty}</span>
        ) : (
          slugs.map((slug) => (
            <TypeChip key={slug} slug={slug} name={names.get(slug) ?? slug} />
          ))
        )}
      </div>
    </div>
  );
}

/** Popover flotante: relaciones del tipo o detalle del cruce de dos tipos. */
export default function TypePopover({ anchor, types, onEnter, onLeave }: Props) {
  const names = new Map(types.map((type) => [type.slug, type.name]));
  const type = types.find((item) => item.slug === anchor.typeSlug);
  const attacker = types.find((item) => item.slug === anchor.attackerSlug);
  const defender = types.find((item) => item.slug === anchor.defenderSlug);
  const info = multiplierInfo(anchor.value ?? 1);
  const isTypePopover = anchor.kind === "type";

  return (
    <FloatingPanel
      anchor={anchor}
      label={isTypePopover ? `Efectividad de ${type?.name ?? ""}` : "Detalle de efectividad"}
      estimatedHeight={isTypePopover ? 240 : 220}
      onEnter={onEnter}
      onLeave={onLeave}
    >
      {isTypePopover ? (
        <div className="space-y-2">
          <RelationRow label="Fuerte contra" slugs={type?.strongTo ?? []} names={names} empty="Ningún tipo" />
          <RelationRow label="Débil ante" slugs={type?.weakTo ?? []} names={names} empty="Ningún tipo" />
          <RelationRow label="Resiste" slugs={type?.resists ?? []} names={names} empty="Ningún tipo" />
          <RelationRow label="Inmune a" slugs={type?.immuneTo ?? []} names={names} empty="Ningún tipo" />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-red-700">
            Cruce de tipos · desde 6ª gen
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <TypeIcon type={attacker?.slug ?? "normal"} className="h-10 w-10" />
              <span className="text-[10px] font-bold text-ink-700">{attacker?.name}</span>
              <span className="text-[9px] uppercase text-ink-500">Ataque</span>
            </div>
            <span className="text-lg text-ink-400" aria-hidden="true">→</span>
            <div className="flex flex-col items-center gap-1">
              <TypeIcon type={defender?.slug ?? "normal"} className="h-10 w-10" />
              <span className="text-[10px] font-bold text-ink-700">{defender?.name}</span>
              <span className="text-[9px] uppercase text-ink-500">Defensa</span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-control bg-white/70 p-3">
            <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-black", info.chip)}>
              {info.symbol}
            </span>
            <div>
              <p className="text-sm font-black text-ink-900">{info.label}</p>
              <p className="text-[11px] font-semibold text-ink-500">{info.description}</p>
            </div>
          </div>
        </div>
      )}
    </FloatingPanel>
  );
}
