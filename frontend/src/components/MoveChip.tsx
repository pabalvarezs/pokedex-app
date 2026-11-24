import { MOVE_CLASSES_ES, getMoveInfo } from "../utils/moves";
import { POKEMON_TYPES, getBadgeBgColor } from "../utils/pokemon";
import Popover from "./Popover";

interface Props {
  /** Nombre en español que envía el backend. */
  name: string;
  /** Slug inglés de PokéAPI (campo aditivo). Tiene prioridad en la búsqueda. */
  slug?: string;
}

/** Chip de movimiento con ficha técnica resumida en el popover. */
export default function MoveChip({ name, slug }: Props) {
  const move = getMoveInfo(slug ?? name);
  const typeEntry = move
    ? Object.entries(POKEMON_TYPES).find(([, info]) => info.es === move[1])
    : undefined;
  const typeKey = typeEntry?.[0];
  const typeColor = typeKey ? getBadgeBgColor(typeKey) : undefined;
  const category = move ? MOVE_CLASSES_ES[move[2]] : undefined;

  const chipClassName = `rounded-lg px-2.5 py-1 text-[11px] font-extrabold capitalize transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1 motion-reduce:transition-none ${
    typeColor
      ? "border border-transparent text-white"
      : "border border-slate-200 bg-slate-100 text-ink-700"
  }`;
  const chipStyle = typeColor
    ? {
        backgroundColor: typeColor,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.22), 0 1px 2px rgba(15,23,42,0.12)",
        textShadow: "0 1px 1px rgba(15,23,42,0.35)",
      }
    : undefined;

  const valueClass = "py-1.5 text-[13px] font-black tabular-nums text-ink-900";
  const labelClass =
    "w-[76px] py-1.5 pr-2 text-center text-[9px] font-black uppercase tracking-wide text-ink-500";

  return (
    <Popover width={320} chipClassName={chipClassName} chipStyle={chipStyle} popover={
      <>
        <div
          className="px-3 py-2"
          style={{ backgroundColor: typeColor ?? "#DC2626" }}
        >
          <p className="text-xs font-extrabold capitalize text-white drop-shadow-sm">{name}</p>
        </div>
        <div className="px-3 py-2.5">
          <table className="w-full border-collapse text-center">
            <tbody>
              <tr className="border-b border-line-soft">
                <th scope="row" className={labelClass}>Clase</th>
                <td className="py-1.5">
                  {category ? (
                    <>
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${category.chip}`}>
                        {category.label}
                      </span>
                      <span className="mt-0.5 block text-[9px] leading-snug text-ink-500">
                        {category.detail}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-ink-500">—</span>
                  )}
                </td>
              </tr>
              <tr className="border-b border-line-soft">
                <th scope="row" className={labelClass}>Tipo</th>
                <td className="py-1.5">
                  {move ? (
                    <span
                      className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold text-white"
                      style={{ backgroundColor: typeColor ?? "#64748b" }}
                    >
                      {move[1]}
                    </span>
                  ) : (
                    <span className="text-xs text-ink-500">—</span>
                  )}
                </td>
              </tr>
              <tr className="border-b border-line-soft odd:bg-slate-50/60">
                <th scope="row" className={labelClass}>Potencia</th>
                <td className={valueClass}>{move?.[3] ?? "—"}</td>
              </tr>
              <tr className="border-b border-line-soft odd:bg-slate-50/60">
                <th scope="row" className={labelClass}>Precisión</th>
                <td className={valueClass}>{move?.[4] != null ? `${move[4]}%` : "—"}</td>
              </tr>
              <tr className="odd:bg-slate-50/60">
                <th scope="row" className={labelClass}>PP</th>
                <td className={valueClass}>{move?.[5] ?? "—"}</td>
              </tr>
            </tbody>
          </table>
          {move?.[6] && (
            <p className="mt-2 rounded-lg border border-line-soft bg-slate-50 p-2 text-[10px] font-medium leading-snug text-ink-900">
              {move[6]}
            </p>
          )}
          <p className="mt-2 text-[9px] font-semibold uppercase tracking-wide text-ink-500">
            Fuente: WikiDex
          </p>
        </div>
      </>
    }>
      {name}
    </Popover>
  );
}
