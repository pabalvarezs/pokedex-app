import type { AdminUser } from "../../../services/api";
import ConfirmDialog from "./ConfirmDialog";

interface Props {
  user: AdminUser | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: (user: AdminUser) => void;
}

export default function DeleteUserDialog({
  user,
  loading,
  onClose,
  onConfirm,
}: Props) {
  return (
    <ConfirmDialog
      open={Boolean(user)}
      onClose={onClose}
      loading={loading}
      title={user ? `¿Eliminar a ${user.name} (@${user.username})?` : "Eliminar entrenador"}
      description="Se borrarán la cuenta y todos sus regalones. Esta acción no se puede deshacer."
      confirmLabel="Eliminar entrenador"
      onConfirm={() => user && onConfirm(user)}
    />
  );
}
