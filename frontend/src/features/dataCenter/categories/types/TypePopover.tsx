import { useEffect } from "react";
import { createPortal } from "react-dom";
import { m } from "framer-motion";
import TypeIcon from "../../../../components/TypeIcon";
import { cn } from "../../../admin/lib/cn";
import { fadeUp } from "../../../../lib/motion";
import { formatNumber } from "../../lib/format";
import type { TypeMatrixType } from "../../lib/types";
import { multiplierInfo } from "./lib/typeMatrix";

export interface PopoverAnchor {
  rect: { top: number; bottom: number; left: number; width: number };
  kind: "type" | "cell";
  typeSlug?: string;
  attackerSlug?: string;
  defenderSlug?: string;
  value?: number;
}

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

/** Popover flotante: abre el detalle del tipo o del cruce de dos tipos. */
export default function TypePopover({ anchor, types, onEnter, onLeave }: Props) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onLeave();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onLeave]);

  const names = new Map(types.map((type) => [type.slug, type.name]));
  const type = types.find((item) => item.slug === anchor.typeSlug);
  const attacker = types.find((item) => item.slug === anchor.attackerSlug);
  const defender = types.find((item) => item.slug === anchor.defenderSlug);
  const info = multiplierInfo(anchor.value ?? 1);

  const width = 304;
  const left = Math.min(
    Math.max(8, anchor.rect.left + anchor.rect.width / 2 - width / 2),
    Math.max(8, window.innerWidth - width - 8)
  );
  // Se reserva el alto estimado para que el panel quepa siempre en el viewport.
  // El positioning vive en un wrapper: Framer Motion controla el transform del
  // panel animado y sobrescribiría cualquier transform que pusiéramos ahí.
  const estimatedHeight = anchor.kind === "type" ? 400 : 220;
  const spaceAbove = anchor.rect.top - 18;
  const spaceBelow = window.innerHeight - anchor.rect.bottom - 18;
  const preferAbove = spaceAbove >= estimatedHeight || spaceAbove > spaceBelow;

  let top = preferAbove
    ? anchor.rect.top - 10 - estimatedHeight
    : anchor.rect.bottom + 10;
  if (top < 8) {
    const below = anchor.rect.bottom + 10;
    top = below + estimatedHeight <= window.innerHeight - 8 ? below : 8;
  }
  top = Math.min(top, Math.max(8, window.innerHeight - 8 - estimatedHeight));

  return createPortal(
    <div
      className="pointer-events-none fixed z-50"
      style={{ left, width, top }}
    >
    <m.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      role="dialog"
      aria-label={anchor.kind === "type" ? `Detalle de tipo ${type?.name ?? ""}` : "Detalle de efectividad"}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="glass-surface glass-blur pointer-events-auto w-full rounded-card border border-line p-4 shadow-card"
    >
      {anchor.kind === "type" && type ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <TypeIcon type={type.slug} className="h-12 w-12 shrink-0" />
            <div className="min-w-0">
              <p className="text-base font-black text-ink-900">{type.name}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500">
                Generación {type.generation} · clase {type.damageClass}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-control bg-white/70 p-2 text-center">
              <p className="text-sm font-black tabular-nums text-ink-900">
                {formatNumber(type.moveCount, 0)}
              </p>
              <p className="text-[9px] font-bold uppercase text-ink-500">Movimientos</p>
            </div>
            <div className="rounded-control bg-white/70 p-2 text-center">
              <p className="text-sm font-black tabular-nums text-ink-900">
                {formatNumber(type.pokemonCount, 0)}
              </p>
              <p className="text-[9px] font-bold uppercase text-ink-500">Pokémon</p>
            </div>
          </div>
          <div className="space-y-2">
            <RelationRow label="Fuerte contra" slugs={type.strongTo} names={names} empty="Ningún tipo" />
            <RelationRow label="Débil ante" slugs={type.weakTo} names={names} empty="Ningún tipo" />
            <RelationRow label="Resiste" slugs={type.resists} names={names} empty="Ningún tipo" />
            <RelationRow label="Inmune a" slugs={type.immuneTo} names={names} empty="Ningún tipo" />
          </div>
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
    </m.div>
    </div>,
    document.body
  );
}
