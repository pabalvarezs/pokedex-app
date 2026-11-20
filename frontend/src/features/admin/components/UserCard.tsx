import {
  Check,
  Link2,
  Loader2,
  Mail,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import type { AdminUser } from "../../../services/api";
import IconButton from "./IconButton";
import RoleBadge from "./RoleBadge";
import UserAvatar from "./UserAvatar";

interface Props {
  user: AdminUser;
  favoritesCount: number;
  isSelf: boolean;
  copied: boolean;
  copying: boolean;
  deleting: boolean;
  onCopyLink: (user: AdminUser) => void;
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

/** Tarjeta apilada para móvil; las acciones quedan siempre visibles. */
export default function UserCard({
  user,
  favoritesCount,
  isSelf,
  copied,
  copying,
  deleting,
  onCopyLink,
  onEdit,
  onDelete,
}: Props) {
  return (
    <article className="glass-surface rounded-card border border-line p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <UserAvatar src={user.avatar} name={user.name} role={user.role} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold text-ink-900">{user.name}</p>
            {isSelf && (
              <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                tú
              </span>
            )}
          </div>
          <p className="truncate text-xs text-ink-500">@{user.username}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <RoleBadge role={user.role} />
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold tabular-nums text-amber-800">
              <Star className="h-3 w-3" aria-hidden="true" />
              {favoritesCount} regalón{favoritesCount === 1 ? "" : "es"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1 text-[11px] text-ink-500">
        {user.email && (
          <p className="flex items-center gap-1.5 truncate">
            <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {user.email}
          </p>
        )}
        <p>Creado el {new Date(user.createdAt).toLocaleDateString("es-CL")}</p>
      </div>

      <div className="mt-3 flex justify-end gap-2 border-t border-line-soft pt-3">
        <IconButton
          icon={
            copying ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Link2 className="h-4 w-4" aria-hidden="true" />
            )
          }
          label={
            copied ? "Enlace copiado" : "Generar y copiar enlace de recuperación"
          }
          tone="warning"
          disabled={copying}
          onClick={() => onCopyLink(user)}
        />
        <IconButton
          icon={<Pencil className="h-4 w-4" aria-hidden="true" />}
          label={`Editar a ${user.name}`}
          onClick={() => onEdit(user)}
        />
        <IconButton
          icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
          label={
            isSelf
              ? "No puedes eliminar tu propia cuenta"
              : `Eliminar a ${user.name}`
          }
          tone="danger"
          disabled={isSelf || deleting}
          onClick={() => onDelete(user)}
        />
      </div>
    </article>
  );
}
