import { Link } from "react-router-dom";
import type { MegaForm } from "../services/api";
import { getTypeBadge } from "../utils/pokemon";

interface MegaFormsProps {
  forms: MegaForm[];
}

function prettyName(name: string) {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function megaTitle(form: MegaForm) {
  const base = prettyName(form.baseName);
  return form.variant ? `Mega ${base} ${form.variant}` : `Mega ${base}`;
}

function artworkFor(form: MegaForm) {
  return (
    form.artwork ??
    form.sprite ??
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${form.id}.png`
  );
}

export default function MegaForms({ forms }: MegaFormsProps) {
  if (forms.length === 0) return null;

  return (
    <section
      aria-labelledby="mega-title"
      className="mt-6 overflow-hidden rounded-3xl border border-indigo-200 bg-white shadow-sm"
    >
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-5 text-white sm:px-8 sm:py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id="mega-title"
              className="flex items-center gap-2 text-xl font-black tracking-tight sm:text-2xl"
            >
              <span aria-hidden="true">💥</span>
              Megaevoluciones
            </h2>
            <p className="mt-1 max-w-2xl text-xs font-medium text-indigo-100 sm:text-sm">
              Formas temporales de combate. No son una evolución permanente.
            </p>
          </div>

          <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold ring-1 ring-white/25">
            {forms.length} {forms.length === 1 ? "forma" : "formas"}
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {forms.map((form) => {
            const title = megaTitle(form);

            return (
              <Link
                key={form.id}
                to={`/pokemon/${form.id}`}
                title={`Ver la ficha de ${title}`}
                className="group flex items-center gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/70 p-4 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
              >
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white shadow-inner ring-1 ring-indigo-100 sm:h-28 sm:w-28">
                  <img
                    src={artworkFor(form)}
                    alt={title}
                    loading="lazy"
                    className="h-20 w-20 object-contain drop-shadow-md transition-transform group-hover:scale-110 sm:h-24 sm:w-24"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center rounded-full bg-indigo-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                    Mega{form.variant ? ` ${form.variant}` : ""}
                  </span>
                  <h3 className="mt-1.5 truncate text-base font-black text-gray-900 sm:text-lg">
                    {title}
                  </h3>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {prettyName(form.baseName)}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {form.types.map((type) => {
                      const badge = getTypeBadge(type);
                      return (
                        <span
                          key={type}
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.es}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
