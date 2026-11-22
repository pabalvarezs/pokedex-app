import { PokeballIcon } from "./icons";

export default function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-white/60 bg-white/35 backdrop-blur-sm">
      {/* pb-20 en móvil y pr-24 en escritorio reservan la esquina del botón
          flotante "Volver arriba" para que no tape el contenido. */}
      <div className="mx-auto flex max-w-home flex-col items-center justify-between gap-2 px-4 pb-20 pt-4 text-center sm:flex-row sm:pb-4 sm:pr-24 sm:text-left">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-sm">
            <PokeballIcon className="h-4 w-4" />
          </span>
          <p className="text-xs font-extrabold tracking-wide text-ink-900">
            PokeChile
            <span className="ml-1.5 font-medium text-ink-500">
              · Hecho con cariño en Chile
            </span>
          </p>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
          Pokédex a la chilena
        </p>
      </div>
    </footer>
  );
}
