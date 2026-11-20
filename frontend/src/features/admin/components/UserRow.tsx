import {
  Check,
  Link2,
  Loader2,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import type { AdminUser } from "../../../services/api";
import { formatDayLabel, formatRelativeDate, getLastLoginAt } from "../lib/dates";
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
  showLastLogin: boolean;
  onCopyLink: (user: AdminUser) => void;
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

export default function UserRow({
  user,
  favoritesCount,
  isSelf,
  copied,
  copying,
  deleting,
  showLastLogin,
  onCopyLink,
  onEdit,
  onDelete,
}: Props) {
  const lastLogin = getLastLoginAt(user);

  return (
    <tr className="group border-b border-line-soft transition-colors duration-150 hover:bg-white/50">
      <td className="px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar src={user.avatar} name={user.name} role={user.role} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink-900">
              {user.name}
              {isSelf && (
                <span className="ml-2 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                  tú
                </span>
              )}
            </p>
            <p className="truncate text-xs text-ink-500">@{user.username}</p>
            {user.email && (
              <p className="truncate text-[11px] text-ink-500">{user.email}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <RoleBadge role={user.role} />
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold tabular-nums text-amber-800">
          <Star className="h-3.5 w-3.5" aria-hidden="true" />
          {favoritesCount}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-ink-500">
        {new Date(user.createdAt).toLocaleDateString("es-CL")}
      </td>
      {showLastLogin && (
        <td className="px-4 py-3 text-xs text-ink-500">
          {lastLogin ? (
            <time dateTime={lastLogin} title={formatDayLabel(lastLogin)}>
              {formatRelativeDate(lastLogin)}
            </time>
          ) : (
            "—"
          )}
        </td>
      )}
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
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
              copied
                ? "Enlace copiado"
                : "Generar y copiar enlace de recuperación"
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
      </td>
    </tr>
  );
}
