import type { AdminFavorite } from "../../../services/api";
import AnimatedList from "./AnimatedList";
import FavoriteCard from "./FavoriteCard";

interface Props {
  favorites: AdminFavorite[];
  ownerName: (favorite: AdminFavorite) => string;
  deleting: boolean;
  onEdit: (favorite: AdminFavorite) => void;
  onDelete: (favorite: AdminFavorite) => void;
}

export default function FavoritesGrid({
  favorites,
  ownerName,
  deleting,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
      <AnimatedList items={favorites} getKey={(favorite) => favorite.id}>
        {(favorite) => (
          <FavoriteCard
            favorite={favorite}
            ownerName={ownerName(favorite)}
            deleting={deleting}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </AnimatedList>
    </div>
  );
}
