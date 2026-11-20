import type { AdminFavorite } from "../../../services/api";
import ConfirmDialog from "./ConfirmDialog";

interface Props {
  favorite: AdminFavorite | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: (favorite: AdminFavorite) => void;
}

export default function DeleteFavoriteDialog({
  favorite,
  loading,
  onClose,
  onConfirm,
}: Props) {
  return (
    <ConfirmDialog
      open={Boolean(favorite)}
      onClose={onClose}
      loading={loading}
      title={favorite ? `¿Eliminar a ${favorite.name} de @${favorite.userId}?` : "Eliminar regalón"}
      description="El regalón desaparecerá de la colección del entrenador. Esta acción no se puede deshacer."
      confirmLabel="Eliminar regalón"
      onConfirm={() => favorite && onConfirm(favorite)}
    />
  );
}
