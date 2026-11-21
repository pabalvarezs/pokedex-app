import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, UserPlus, UsersRound } from "lucide-react";
import { toast } from "sonner";
import {
  adminCreatePasswordReset,
  adminCreateUser,
  adminDeleteUser,
  adminListFavorites,
  adminListUsers,
  adminUpdateUser,
  getApiErrorMessage,
  type AdminUser,
  type GeneratedPasswordReset,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { PokeballIcon } from "../../components/layout/icons";
import AdminSectionHeader from "../../features/admin/components/AdminSectionHeader";
import AnimatedList from "../../features/admin/components/AnimatedList";
import DeleteUserDialog from "../../features/admin/components/DeleteUserDialog";
import EmptyState from "../../features/admin/components/EmptyState";
import PokeballDivider from "../../features/admin/components/PokeballDivider";
import ResetLinkModal from "../../features/admin/components/ResetLinkModal";
import { SkeletonRows } from "../../features/admin/components/Skeleton";
import UserCard from "../../features/admin/components/UserCard";
import UserFormDrawer, {
  type UserFormValues,
} from "../../features/admin/components/UserFormDrawer";
import UserRow from "../../features/admin/components/UserRow";
import { useCopyFeedback } from "../../features/admin/hooks/useCopyFeedback";
import { copyToClipboard } from "../../features/admin/lib/clipboard";
import { getLastLoginAt } from "../../features/admin/lib/dates";

export default function UsersAdmin() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: adminListUsers,
  });
  const favoritesQuery = useQuery({
    queryKey: ["admin", "favorites"],
    queryFn: adminListFavorites,
  });

  const users = usersQuery.data ?? [];
  const favorites = favoritesQuery.data ?? [];

  const favoriteCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const favorite of favorites) {
      counts.set(favorite.userId, (counts.get(favorite.userId) ?? 0) + 1);
    }
    return counts;
  }, [favorites]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [resetLink, setResetLink] = useState<GeneratedPasswordReset | null>(null);
  const [copyingId, setCopyingId] = useState<number | null>(null);
  const { copied, markCopied } = useCopyFeedback();

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setFormError(null);
  };

  const openCreate = () => {
    setEditing(null);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditing(user);
    setFormError(null);
    setFormOpen(true);
  };

  const save = useMutation({
    mutationFn: (values: UserFormValues) => {
      if (editing) {
        return adminUpdateUser(editing.id, {
          name: values.name,
          role: values.role,
          avatar: values.avatar,
          password: values.password || undefined,
          email: values.email || null,
        });
      }
      return adminCreateUser({
        username: values.username,
        name: values.name,
        password: values.password,
        role: values.role,
        avatar: values.avatar || undefined,
        email: values.email || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "favorites"] });
      toast.success(editing ? "Entrenador actualizado" : "Entrenador creado");
      closeForm();
    },
    onError: (error) => setFormError(getApiErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (user: AdminUser) => adminDeleteUser(user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "favorites"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "password-resets"] });
      toast.success("Entrenador eliminado");
      setDeleteTarget(null);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const generateReset = useMutation({
    mutationFn: (user: AdminUser) => adminCreatePasswordReset(user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "password-resets"] });
    },
  });

  const handleCopyLink = async (user: AdminUser) => {
    setCopyingId(user.id);
    try {
      const data = await generateReset.mutateAsync(user);
      const ok = await copyToClipboard(data.url);
      if (ok) {
        markCopied(String(user.id));
        toast.success("¡Enlace copiado!");
      } else {
        setResetLink(data);
        toast.error("No pudimos copiar solos; copia el enlace a mano.");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setCopyingId(null);
    }
  };

  const loading = usersQuery.isLoading || favoritesQuery.isLoading;
  const hasError = usersQuery.isError || favoritesQuery.isError;
  // El backend aún no expone este campo: la columna solo aparece si llega.
  const hasLastLogin = useMemo(
    () => users.some((user) => Boolean(getLastLoginAt(user))),
    [users]
  );
  const onlyAdmin =
    !loading && users.length === 1 && users[0]?.role === "admin";

  return (
    <section>
      <AdminSectionHeader
        title="Entrenadores"
        description={
          loading
            ? "Cargando las cuentas del sitio…"
            : `${users.length} cuenta${users.length === 1 ? "" : "s"} registrada${
                users.length === 1 ? "" : "s"
              } · ${favorites.length} regalón${favorites.length === 1 ? "" : "es"} en total.`
        }
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="btn-accent focus-accent inline-flex items-center justify-center gap-2 rounded-control px-4 py-2.5 text-sm font-bold shadow-sm transition duration-150"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo entrenador
          </button>
        }
      />

      {hasError ? (
        <div
          role="alert"
          className="glass-surface rounded-card border border-red-200 bg-red-50/80 p-4 text-sm font-semibold text-red-700"
        >
          No pudimos cargar los entrenadores. Revisa tu sesión e inténtalo de nuevo.
          <button
            type="button"
            onClick={() => {
              usersQuery.refetch();
              favoritesQuery.refetch();
            }}
            className="focus-accent ml-2 underline decoration-2 underline-offset-2"
          >
            Reintentar
          </button>
        </div>
      ) : loading ? (
        <>
          <div className="glass-surface hidden rounded-card border border-line p-4 shadow-soft md:block">
            <SkeletonRows rows={5} />
          </div>
          <div className="grid gap-3 md:hidden">
            {[0, 1, 2].map((item) => (
              <div key={item} className="skeleton h-32 w-full rounded-card" />
            ))}
          </div>
        </>
      ) : onlyAdmin ? (
        <EmptyState
          tone="trainers"
          illustration={<PokeballIcon className="h-8 w-8" />}
          title="Invita a más entrenadores"
          description="Por ahora solo está la cuenta de administrador. Crea la primera cuenta para que empiecen a guardar sus regalones."
          action={
            <button
              type="button"
              onClick={openCreate}
              className="btn-accent focus-accent inline-flex items-center gap-2 rounded-control px-4 py-2.5 text-sm font-bold shadow-sm transition duration-150"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Crear entrenador
            </button>
          }
        />
      ) : users.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          tone="trainers"
          title="Todavía no hay entrenadores"
          description="Crea la primera cuenta para empezar a armar la liga."
          action={
            <button
              type="button"
              onClick={openCreate}
              className="btn-accent focus-accent inline-flex items-center gap-2 rounded-control px-4 py-2.5 text-sm font-bold shadow-sm transition duration-150"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Crear entrenador
            </button>
          }
        />
      ) : (
        <>
          <div className="glass-surface hidden overflow-hidden rounded-card border border-line shadow-soft md:block">
            <table className="w-full text-sm">
              <caption className="sr-only">Cuentas de entrenadores del sitio</caption>
              <thead className="bg-white/40 text-[11px] uppercase tracking-wider text-ink-500">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-bold">Entrenador</th>
                  <th scope="col" className="px-4 py-3 text-left font-bold">Rol</th>
                  <th scope="col" className="px-4 py-3 text-left font-bold">Regalones</th>
                  <th scope="col" className="px-4 py-3 text-left font-bold">Creado</th>
                  {hasLastLogin && (
                    <th scope="col" className="px-4 py-3 text-left font-bold">Último acceso</th>
                  )}
                  <th scope="col" className="px-4 py-3 text-right font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr aria-hidden="true">
                  <td colSpan={hasLastLogin ? 6 : 5} className="p-0">
                    <PokeballDivider />
                  </td>
                </tr>
                <AnimatedList as="tr" items={users} getKey={(user) => user.id}>
                  {(user) => (
                    <UserRow
                      user={user}
                      favoritesCount={favoriteCounts.get(user.username) ?? 0}
                      isSelf={currentUser?.username === user.username}
                      copied={copied === String(user.id)}
                      copying={copyingId === user.id}
                      deleting={remove.isPending}
                      showLastLogin={hasLastLogin}
                      onCopyLink={handleCopyLink}
                      onEdit={openEdit}
                      onDelete={setDeleteTarget}
                    />
                  )}
                </AnimatedList>
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            <AnimatedList items={users} getKey={(user) => user.id}>
              {(user) => (
                <UserCard
                  user={user}
                  favoritesCount={favoriteCounts.get(user.username) ?? 0}
                  isSelf={currentUser?.username === user.username}
                  copied={copied === String(user.id)}
                  copying={copyingId === user.id}
                  deleting={remove.isPending}
                  showLastLogin={hasLastLogin}
                  onCopyLink={handleCopyLink}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                />
              )}
            </AnimatedList>
          </div>
        </>
      )}

      <UserFormDrawer
        open={formOpen}
        editing={editing}
        pending={save.isPending}
        error={formError}
        onClose={closeForm}
        onSubmit={(values) => {
          setFormError(null);
          save.mutate(values);
        }}
      />

      <DeleteUserDialog
        user={deleteTarget}
        loading={remove.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(user) => remove.mutate(user)}
      />

      <ResetLinkModal data={resetLink} onClose={() => setResetLink(null)} />
    </section>
  );
}
