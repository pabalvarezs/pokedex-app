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

/** Tarjeta apilada de recuperaciones para móvil. */
export default function ResetRequestCard({
  request,
  owner,
  generating,
  onGenerate,
}: Props) {
  const expired = isResetExpired(request.expiresAt);

  return (
    <article className="glass-surface rounded-card border border-line p-4 shadow-soft">
      <div className="flex items-start gap-3">
        {owner ? (
          <UserAvatar
            src={owner.avatar}
            name={request.name}
            role={owner.role}
            size="lg"
          />
        ) : (
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-violet-50 text-violet-600 ring-2 ring-violet-200">
            <UserRound className="h-6 w-6" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink-900">{request.name}</p>
          <p className="truncate text-xs text-ink-500">@{request.username}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
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
            <StatusBadge tone={expired ? "red" : "green"}>
              {expired ? "Vencida" : "Vigente"}
            </StatusBadge>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-0.5 text-[11px] text-ink-500">
        <p className="truncate">{request.email ?? "Sin email registrado"}</p>
        <p>Solicitado el {new Date(request.createdAt).toLocaleString("es-CL")}</p>
        <p>Vence el {new Date(request.expiresAt).toLocaleString("es-CL")}</p>
      </div>

      <div className="mt-3 flex justify-end border-t border-line-soft pt-3">
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
    </article>
  );
}
