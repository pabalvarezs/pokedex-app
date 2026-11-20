import { Link2, Loader2, ShieldCheck, UserRound } from "lucide-react";
import type { AdminUser, PasswordResetRequest } from "../../../services/api";
import { isResetExpired } from "../lib/resetStatus";
import IconButton from "./IconButton";
import StatusBadge from "./StatusBadge";
import UserAvatar from "./UserAvatar";

interface Props {
  request: PasswordResetRequest;
  owner?: AdminUser;
  generating: boolean;
  onGenerate: (request: PasswordResetRequest) => void;
}

export default function ResetRequestRow({
  request,
  owner,
  generating,
  onGenerate,
}: Props) {
  const expired = isResetExpired(request.expiresAt);

  return (
    <tr className="border-b border-line-soft transition-colors duration-150 hover:bg-white/50">
      <td className="px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {owner ? (
            <UserAvatar src={owner.avatar} name={request.name} role={owner.role} />
          ) : (
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-violet-50 text-violet-600 ring-2 ring-violet-200">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink-900">{request.name}</p>
            <p className="truncate text-xs text-ink-500">@{request.username}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="truncate text-xs text-ink-700">
          {request.email ?? "Sin email registrado"}
        </p>
      </td>
      <td className="px-4 py-3">
        <StatusBadge
          tone={request.source === "admin" ? "violet" : "green"}
          icon={
            request.source === "admin" ? (
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
            ) : (
              <UserRound className="h-3 w-3" aria-hidden="true" />
            )
          }
        >
          {request.source === "admin" ? "Admin" : "Usuario"}
        </StatusBadge>
      </td>
      <td className="px-4 py-3">
        <StatusBadge tone={expired ? "red" : "green"}>
          {expired ? "Vencida" : "Vigente"}
        </StatusBadge>
        <p className="mt-1 text-[11px] text-ink-500">
          Vence el {new Date(request.expiresAt).toLocaleDateString("es-CL")}
        </p>
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end">
          <IconButton
            icon={
              generating ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Link2 className="h-4 w-4" aria-hidden="true" />
              )
            }
            label={`Generar enlace para @${request.username}`}
            tone="warning"
            disabled={generating}
            onClick={() => onGenerate(request)}
          />
        </div>
      </td>
    </tr>
  );
}
