import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, SearchX, Star } from "lucide-react";
import { toast } from "sonner";
import {
  adminCreateFavorite,
  adminDeleteFavorite,
  adminListFavorites,
  adminListUsers,
  adminUpdateFavorite,
  getApiErrorMessage,
  type AdminFavorite,
} from "../../services/api";
import AdminSectionHeader from "../../features/admin/components/AdminSectionHeader";
import DeleteFavoriteDialog from "../../features/admin/components/DeleteFavoriteDialog";
import EmptyState from "../../features/admin/components/EmptyState";
import FavoriteFormDrawer, {
  type FavoriteFormValues,
} from "../../features/admin/components/FavoriteFormDrawer";
import FavoritesGrid from "../../features/admin/components/FavoritesGrid";
import FavoritesTable from "../../features/admin/components/FavoritesTable";
import FavoritesToolbar from "../../features/admin/components/FavoritesToolbar";
import { useDebouncedValue } from "../../features/admin/hooks/useDebouncedValue";
import { useViewMode } from "../../features/admin/hooks/useViewMode";

export default function FavoritesAdmin() {
  const queryClient = useQueryClient();

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
  const usersByUsername = useMemo(
    () => new Map(users.map((user) => [user.username, user])),
    [users]
  );

  const [search, setSearch] = useState("");
  const [trainer, setTrainer] = useState("");
  const [view, setView] = useViewMode("pokedex_admin_favorites_view");
  const debouncedSearch = useDebouncedValue(search, 250);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminFavorite | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminFavorite | null>(null);

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

  const openEdit = (favorite: AdminFavorite) => {
    setEditing(favorite);
    setFormError(null);
    setFormOpen(true);
  };

  const save = useMutation({
    mutationFn: (values: FavoriteFormValues) =>
      editing
        ? adminUpdateFavorite(editing.id, values)
        : adminCreateFavorite(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "favorites"] });
      toast.success(editing ? "Regalón actualizado" : "Regalón creado");
      closeForm();
    },
    onError: (error) => setFormError(getApiErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (favorite: AdminFavorite) => adminDeleteFavorite(favorite.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "favorites"] });
      toast.success("Regalón eliminado");
      setDeleteTarget(null);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const filtered = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return favorites.filter((favorite) => {
      if (trainer && favorite.userId !== trainer) return false;
      if (!query) return true;

      const id = String(favorite.pokemonId);
      return (
        favorite.name.toLowerCase().includes(query) ||
        id.includes(query) ||
        id.padStart(3, "0").includes(query) ||
        `#${id.padStart(3, "0")}`.includes(query)
      );
    });
  }, [debouncedSearch, favorites, trainer]);

  const ownerName = (favorite: AdminFavorite) =>
    usersByUsername.get(favorite.userId)?.name ?? "Cuenta eliminada";

  const loading = usersQuery.isLoading || favoritesQuery.isLoading;
  const hasError = usersQuery.isError || favoritesQuery.isError;

  const clearFilters = () => {
    setSearch("");
    setTrainer("");
  };

  return (
    <section>
      <AdminSectionHeader
        title="Regalones del sitio"
        description={
          loading
            ? "Cargando la colección de todos los entrenadores…"
            : `${favorites.length} regalón${
                favorites.length === 1 ? "" : "es"
              } guardado${favorites.length === 1 ? "" : "s"} entre todos los entrenadores.`
        }
        actions={
          <button
            type="button"
            onClick={openCreate}
            disabled={users.length === 0 || loading}
            className="btn-accent focus-accent inline-flex items-center justify-center gap-2 rounded-control px-4 py-2.5 text-sm font-bold shadow-sm transition duration-150 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo regalón
          </button>
        }
      />

      {hasError ? (
        <div
          role="alert"
          className="glass-surface rounded-card border border-red-200 bg-red-50/80 p-4 text-sm font-semibold text-red-700"
        >
          No pudimos cargar los regalones. Revisa tu sesión e inténtalo de nuevo.
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
      ) : (
        <>
          <FavoritesToolbar
            search={search}
            onSearchChange={setSearch}
            trainer={trainer}
            onTrainerChange={setTrainer}
            users={users}
            view={view}
            onViewChange={setView}
            resultCount={filtered.length}
            total={favorites.length}
          />

          {loading ? (
            <FavoritesTable
              favorites={[]}
              ownerName={ownerName}
              deleting={false}
              loading
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ) : favorites.length === 0 ? (
            <EmptyState
              icon={Star}
              tone="gifts"
              title="Todavía no hay regalones"
              description="Agrega el primero y aparecerá en la colección del entrenador."
              action={
                <button
                  type="button"
                  onClick={openCreate}
                  disabled={users.length === 0}
                  className="btn-accent focus-accent inline-flex items-center gap-2 rounded-control px-4 py-2.5 text-sm font-bold shadow-sm transition duration-150 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Crear el primer regalón
                </button>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              tone="gifts"
              title="No pillamos regalones con ese filtro"
              description="Prueba con otro nombre, número de Pokédex o entrenador."
              action={
                <button
                  type="button"
                  onClick={clearFilters}
                  className="focus-accent rounded-control bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition duration-150 hover:bg-slate-200"
                >
                  Limpiar filtros
                </button>
              }
            />
          ) : view === "grid" ? (
            <FavoritesGrid
              favorites={filtered}
              ownerName={ownerName}
              deleting={remove.isPending}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ) : (
            <FavoritesTable
              favorites={filtered}
              ownerName={ownerName}
              deleting={remove.isPending}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          )}
        </>
      )}

      <FavoriteFormDrawer
        open={formOpen}
        favorite={editing}
        users={users}
        pending={save.isPending}
        error={formError}
        onClose={closeForm}
        onSubmit={(values) => {
          setFormError(null);
          save.mutate(values);
        }}
      />

      <DeleteFavoriteDialog
        favorite={deleteTarget}
        loading={remove.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(favorite) => remove.mutate(favorite)}
      />
    </section>
  );
}
