import { PokeballIcon } from "./icons";

export default function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-white/60 bg-white/35 backdrop-blur-sm">
      <div className="mx-auto flex max-w-home flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-sm">
            <PokeballIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-black tracking-wide text-ink-900">
              PokeChile
            </p>
            <p className="text-xs font-medium text-ink-500">
              Hecho con cariño en Chile 🇨🇱
            </p>
          </div>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-500">
          Pokédex a la chilena
        </p>
      </div>
    </footer>
  );
}
