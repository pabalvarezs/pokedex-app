import { useMemo, useState } from "react";
import { Search, Star } from "lucide-react";
import type { TrainerDatum } from "../../hooks/useAdminAnalytics";
import Modal from "../Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  trainers: TrainerDatum[];
}

export default function AllTrainersModal({ open, onClose, trainers }: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return trainers;
    return trainers.filter(
      (trainer) =>
        trainer.name.toLowerCase().includes(term) ||
        trainer.username.toLowerCase().includes(term)
    );
  }, [trainers, search]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Todos los entrenadores"
      subtitle={`${trainers.length} entrenadores con regalones guardados`}
      size="md"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="focus-accent rounded-control bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition duration-150 hover:bg-slate-200"
        >
          Cerrar
        </button>
      }
    >
      <div className="relative mb-3">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar entrenador…"
          aria-label="Buscar entrenador"
          className="w-full rounded-control border border-line bg-white py-2.5 pl-9 pr-3 text-sm text-ink-900 outline-none transition duration-150 placeholder:text-ink-500/70 focus:ring-2"
        />
      </div>

      <ul className="max-h-[45vh] divide-y divide-line-soft overflow-y-auto rounded-control border border-line">
        {filtered.map((trainer, index) => (
          <li
            key={trainer.key}
            className="flex items-center gap-3 bg-white/60 px-3 py-2 text-sm"
          >
            <span className="w-5 shrink-0 text-right text-[11px] font-bold tabular-nums text-ink-500">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-ink-900">
                {trainer.name}
              </span>
              <span className="block truncate text-[11px] text-ink-500">
                @{trainer.username}
              </span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-bold tabular-nums text-amber-800">
              <Star className="h-3 w-3" aria-hidden="true" />
              {trainer.count}
            </span>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="px-3 py-8 text-center text-xs text-ink-500">
            No encontramos entrenadores con ese nombre.
          </li>
        )}
      </ul>
    </Modal>
  );
}
