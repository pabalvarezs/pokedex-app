import { cn } from "../../../../admin/lib/cn";

export interface MultiplierInfo {
  label: string;
  symbol: string;
  description: string;
  cell: string;
  chip: string;
}

/** Estilos y texto de cada casilla, compartidos por matriz, leyenda y popover. */
export function multiplierInfo(value: number): MultiplierInfo {
  switch (value) {
    case 2:
      return {
        label: "×2",
        symbol: "×2",
        description: "Súper eficaz: el daño se duplica.",
        cell: "bg-rose-500 text-white shadow-[0_6px_14px_-6px_rgba(244,63,94,0.9)] hover:bg-rose-600",
        chip: "bg-rose-500 text-white",
      };
    case 1:
      return {
        label: "×1",
        symbol: "×1",
        description: "Neutro: el daño no se modifica.",
        cell: "bg-white/60 text-ink-400 hover:bg-white hover:text-ink-700",
        chip: "bg-slate-100 text-ink-500",
      };
    case 0.5:
      return {
        label: "×0,5",
        symbol: "½",
        description: "Poco eficaz: el daño se reduce a la mitad.",
        cell: "bg-sky-500/20 text-sky-700 hover:bg-sky-500/35",
        chip: "bg-sky-500/20 text-sky-700",
      };
    default:
      return {
        label: "×0",
        symbol: "×0",
        description: "Sin efecto: el movimiento no hace daño.",
        cell: "bg-slate-800 text-white hover:bg-slate-900",
        chip: "bg-slate-800 text-white",
      };
  }
}

export function cellClassName(value: number, highlighted: boolean): string {
  return cn(
    "grid h-9 w-9 place-items-center rounded-lg text-[11px] font-black tabular-nums transition duration-150 outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 sm:h-11 sm:w-11 sm:text-xs",
    multiplierInfo(value).cell,
    highlighted && "ring-2 ring-red-400 ring-offset-1"
  );
}
