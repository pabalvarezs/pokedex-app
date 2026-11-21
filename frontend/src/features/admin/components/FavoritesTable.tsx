import type { AdminFavorite } from "../../../services/api";
import AnimatedList from "./AnimatedList";
import FavoriteCard from "./FavoriteCard";
import FavoriteRow from "./FavoriteRow";
import PokeballDivider from "./PokeballDivider";
import { SkeletonRows } from "./Skeleton";

interface Props {
  favorites: AdminFavorite[];
  ownerName: (favorite: AdminFavorite) => string;
  deleting: boolean;
  loading?: boolean;
  onEdit: (favorite: AdminFavorite) => void;
  onDelete: (favorite: AdminFavorite) => void;
}

/** Tabla en escritorio y listado de tarjetas apiladas bajo md. */
export default function FavoritesTable({
  favorites,
  ownerName,
  deleting,
  loading = false,
  onEdit,
  onDelete,
}: Props) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="glass-surface hidden overflow-hidden rounded-card border border-line p-4 shadow-soft md:block">
          <SkeletonRows rows={5} />
        </div>
        <div className="grid gap-3 md:hidden">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="skeleton h-24 w-full rounded-card motion-safe:animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-surface hidden overflow-hidden rounded-card border border-line shadow-soft md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">Regalones guardados por entrenador</caption>
          <thead className="bg-white/40 text-[11px] uppercase tracking-wider text-ink-500">
            <tr>
              <th scope="col" className="px-4 py-3 text-left font-bold">Regalón</th>
              <th scope="col" className="px-4 py-3 text-left font-bold">Entrenador</th>
              <th scope="col" className="px-4 py-3 text-left font-bold">Guardado</th>
              <th scope="col" className="px-4 py-3 text-right font-bold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr aria-hidden="true">
              <td colSpan={4} className="p-0">
                <PokeballDivider />
              </td>
            </tr>
            <AnimatedList
              as="tr"
              items={favorites}
              getKey={(favorite) => favorite.id}
            >
              {(favorite) => (
                <FavoriteRow
                  favorite={favorite}
                  ownerName={ownerName(favorite)}
                  deleting={deleting}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              )}
            </AnimatedList>
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        <AnimatedList
          items={favorites}
          getKey={(favorite) => favorite.id}
        >
          {(favorite) => (
            <FavoriteCard
              favorite={favorite}
              ownerName={ownerName(favorite)}
              deleting={deleting}
              alwaysShowActions
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )}
        </AnimatedList>
      </div>
    </>
  );
}
