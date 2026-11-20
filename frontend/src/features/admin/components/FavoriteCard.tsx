import { Pencil, Trash2 } from "lucide-react";
import type { AdminFavorite } from "../../../services/api";
import { usePokemonTypes } from "../hooks/usePokemonTypes";
import { getTypeColor } from "../lib/typeColors";
import IconButton from "./IconButton";
import PokemonAvatar from "./PokemonAvatar";
import TypeBadges from "./TypeBadges";

interface Props {
  favorite: AdminFavorite;
  ownerName: string;
  deleting?: boolean;
  /** true deja las acciones siempre visibles (listado móvil). */
  alwaysShowActions?: boolean;
  onEdit: (favorite: AdminFavorite) => void;
  onDelete: (favorite: AdminFavorite) => void;
}

/** Tarjeta de la vista grilla y del listado apilado en móvil. */
export default function FavoriteCard({
  favorite,
  ownerName,
  deleting = false,
  alwaysShowActions = false,
  onEdit,
  onDelete,
}: Props) {
  const { types, isLoading, isError } = usePokemonTypes(favorite.pokemonId);
  const color = getTypeColor(types[0]);

  return (
    <article className="group glass-surface relative flex flex-col items-center rounded-card border border-line p-4 text-center shadow-soft transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 rounded-full opacity-60 blur-xl"
            style={{ backgroundImage: color.gradient }}
          />
          <PokemonAvatar
            pokemonId={favorite.pokemonId}
            name={favorite.name}
            type={types[0]}
            size="lg"
          />
        </div>

        <div className="mt-3 min-w-0">
          <p className="truncate font-semibold capitalize text-ink-900">
            {favorite.name}
          </p>
          <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 font-mono text-xs text-ink-500">
            #{String(favorite.pokemonId).padStart(3, "0")}
          </span>
        </div>

        <div className="mt-2 flex min-h-[22px] items-center justify-center">
          <TypeBadges types={types} loading={isLoading} isError={isError} />
        </div>

        <p className="mt-2 w-full truncate text-xs text-ink-500">
          {ownerName} <span className="text-ink-500/80">· @{favorite.userId}</span>
        </p>
      </div>

      <div
        className={`mt-3 flex gap-2 ${
          alwaysShowActions
            ? ""
            : "md:absolute md:right-3 md:top-3 md:mt-0 md:opacity-0 md:transition-opacity md:duration-150 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
        }`}
      >
        <IconButton
          icon={<Pencil className="h-4 w-4" aria-hidden="true" />}
          label={`Editar a ${favorite.name}`}
          onClick={() => onEdit(favorite)}
        />
        <IconButton
          icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
          label={`Eliminar a ${favorite.name}`}
          tone="danger"
          disabled={deleting}
          onClick={() => onDelete(favorite)}
        />
      </div>
    </article>
  );
}
