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
  onEdit: (favorite: AdminFavorite) => void;
  onDelete: (favorite: AdminFavorite) => void;
}

export default function FavoriteRow({
  favorite,
  ownerName,
  deleting = false,
  onEdit,
  onDelete,
}: Props) {
  const { types, isLoading, isError } = usePokemonTypes(favorite.pokemonId);
  const tint = getTypeColor(types[0]).tint;

  return (
    <tr className={`group border-b border-line-soft transition-colors duration-150 ${tint}`}>
      <td className="px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <PokemonAvatar
            pokemonId={favorite.pokemonId}
            name={favorite.name}
            type={types[0]}
          />
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="truncate font-semibold capitalize text-ink-900">
                {favorite.name}
              </p>
              <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 font-mono text-xs text-ink-500">
                #{String(favorite.pokemonId).padStart(3, "0")}
              </span>
            </div>
            <div className="mt-1">
              <TypeBadges types={types} loading={isLoading} isError={isError} />
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="truncate text-sm font-semibold text-ink-700">{ownerName}</p>
        <p className="truncate text-xs text-ink-500">@{favorite.userId}</p>
      </td>
      <td className="px-4 py-3 text-xs text-ink-500">
        {new Date(favorite.createdAt).toLocaleDateString("es-CL")}
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
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
      </td>
    </tr>
  );
}
