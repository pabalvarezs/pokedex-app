import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  adminCreatePasswordReset,
  adminListPasswordResets,
  adminListUsers,
  getApiErrorMessage,
  type GeneratedPasswordReset,
  type PasswordResetRequest,
} from "../../services/api";
import AdminSectionHeader from "../../features/admin/components/AdminSectionHeader";
import EmptyState from "../../features/admin/components/EmptyState";
import PokeballDivider from "../../features/admin/components/PokeballDivider";
import ResetLinkModal from "../../features/admin/components/ResetLinkModal";
import ResetRequestCard from "../../features/admin/components/ResetRequestCard";
import ResetRequestRow from "../../features/admin/components/ResetRequestRow";
import { SkeletonRows } from "../../features/admin/components/Skeleton";

export default function PasswordResetsAdmin() {
  const queryClient = useQueryClient();

  const resetsQuery = useQuery({
    queryKey: ["admin", "password-resets"],
    queryFn: adminListPasswordResets,
  });
  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: adminListUsers,
  });

  const requests = resetsQuery.data ?? [];
  const usersByUsername = useMemo(
    () => new Map((usersQuery.data ?? []).map((user) => [user.username, user])),
    [usersQuery.data]
  );

  const [resetLink, setResetLink] = useState<GeneratedPasswordReset | null>(null);
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  const generate = useMutation({
    mutationFn: (request: PasswordResetRequest) =>
      adminCreatePasswordReset(request.userId),
    onSuccess: (data) => {
      setResetLink(data);
      toast.success("Enlace de recuperación listo");
      queryClient.invalidateQueries({ queryKey: ["admin", "password-resets"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
    onSettled: () => setGeneratingId(null),
  });

  const handleGenerate = (request: PasswordResetRequest) => {
    setResetLink(null);
    setGeneratingId(request.id);
    generate.mutate(request);
  };

  return (
    <section>
      <AdminSectionHeader
        title="Recuperaciones"
        description={
          resetsQuery.isLoading
            ? "Cargando solicitudes vigentes…"
            : `${requests.length} solicitud${
                requests.length === 1 ? "" : "es"
              } de contraseña. Genera un enlace y entrégaselo al entrenador (o se envía solo si tiene email).`
        }
        actions={
          <button
            type="button"
            onClick={() => resetsQuery.refetch()}
            disabled={resetsQuery.isFetching}
            className="focus-accent inline-flex items-center justify-center gap-2 rounded-control bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition duration-150 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${resetsQuery.isFetching ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            {resetsQuery.isFetching ? "Actualizando…" : "Actualizar"}
          </button>
        }
      />

      {resetsQuery.isError ? (
        <div
          role="alert"
          className="glass-surface rounded-card border border-red-200 bg-red-50/80 p-4 text-sm font-semibold text-red-700"
        >
          No pudimos cargar las solicitudes. Revisa tu sesión e inténtalo de nuevo.
          <button
            type="button"
            onClick={() => resetsQuery.refetch()}
            className="focus-accent ml-2 underline decoration-2 underline-offset-2"
          >
            Reintentar
          </button>
        </div>
      ) : resetsQuery.isLoading ? (
        <>
          <div className="glass-surface hidden rounded-card border border-line p-4 shadow-soft md:block">
            <SkeletonRows rows={4} />
          </div>
          <div className="grid gap-3 md:hidden">
            {[0, 1, 2].map((item) => (
              <div key={item} className="skeleton h-36 w-full rounded-card" />
            ))}
          </div>
        </>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          tone="recovery"
          title="No hay recuperaciones pendientes"
          description='Cuando un entrenador use "¿Olvidaste tu contraseña?", la solicitud aparecerá acá.'
        />
      ) : (
        <>
          <div className="glass-surface hidden overflow-hidden rounded-card border border-line shadow-soft md:block">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Solicitudes de recuperación de contraseña
              </caption>
              <thead className="bg-white/40 text-[11px] uppercase tracking-wider text-ink-500">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-bold">Entrenador</th>
                  <th scope="col" className="px-4 py-3 text-left font-bold">Email</th>
                  <th scope="col" className="px-4 py-3 text-left font-bold">Origen</th>
                  <th scope="col" className="px-4 py-3 text-left font-bold">Estado</th>
                  <th scope="col" className="px-4 py-3 text-right font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr aria-hidden="true">
                  <td colSpan={5} className="p-0">
                    <PokeballDivider />
                  </td>
                </tr>
                {requests.map((request) => (
                  <ResetRequestRow
                    key={request.id}
                    request={request}
                    owner={usersByUsername.get(request.username)}
                    generating={generatingId === request.id}
                    onGenerate={handleGenerate}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {requests.map((request) => (
              <ResetRequestCard
                key={request.id}
                request={request}
                owner={usersByUsername.get(request.username)}
                generating={generatingId === request.id}
                onGenerate={handleGenerate}
              />
            ))}
          </div>
        </>
      )}

      <ResetLinkModal data={resetLink} onClose={() => setResetLink(null)} />
    </section>
  );
}
