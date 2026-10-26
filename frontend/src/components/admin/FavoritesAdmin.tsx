import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AdminFavorite,
  adminCreateFavorite,
  adminDeleteFavorite,
  adminListFavorites,
  adminListUsers,
  adminUpdateFavorite,
  getApiErrorMessage,
} from "../../services/api";

interface FormState {
  userId: string;
  pokemonId: string;
  name: string;
}

const EMPTY_FORM: FormState = { userId: "", pokemonId: "", name: "" };

function artworkUrl(pokemonId: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
}

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
  const usersByUsername = new Map(users.map((user) => [user.username, user]));

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editing, setEditing] = useState<AdminFavorite | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, userId: users[0]?.username ?? "" });
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (favorite: AdminFavorite) => {
    setEditing(favorite);
    setForm({
      userId: favorite.userId,
      pokemonId: String(favorite.pokemonId),
      name: favorite.name,
    });
    setFormError(null);
    setShowForm(true);
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        userId: form.userId,
        pokemonId: Number(form.pokemonId),
        name: form.name.trim(),
      };
      if (editing) {
        return adminUpdateFavorite(editing.id, payload);
      }
      return adminCreateFavorite(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "favorites"] });
      setNotice(editing ? "Regalón actualizado correctamente." : "Regalón creado correctamente.");
      setActionError(null);
      closeForm();
    },
    onError: (error) => setFormError(getApiErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (id: number) => adminDeleteFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "favorites"] });
      setNotice("Regalón eliminado correctamente.");
      setActionError(null);
    },
    onError: (error) => setActionError(getApiErrorMessage(error)),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setNotice(null);

    if (!form.userId) {
      setFormError("Debes elegir al entrenador dueño del regalón.");
      return;
    }
    if (!form.pokemonId || !Number.isInteger(Number(form.pokemonId)) || Number(form.pokemonId) <= 0) {
      setFormError("El ID del Pokémon debe ser un número positivo.");
      return;
    }
    if (!form.name.trim()) {
      setFormError("El nombre del Pokémon es obligatorio.");
      return;
    }

    save.mutate();
  };

  const handleDelete = (favorite: AdminFavorite) => {
    setNotice(null);
    setActionError(null);
    if (!window.confirm(`¿Eliminar el regalón "${favorite.name}" de @${favorite.userId}?`)) {
      return;
    }
    remove.mutate(favorite.id);
  };

  const loading = usersQuery.isLoading || favoritesQuery.isLoading;
  const hasError = usersQuery.isError || favoritesQuery.isError;

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-gray-800">Regalones del sitio</h2>
          <p className="text-xs text-gray-500">
            {favorites.length === 1
              ? "1 regalón guardado entre todos los entrenadores"
              : `${favorites.length} regalones guardados entre todos los entrenadores`}
          </p>
        </div>
        <button
          onClick={showForm ? closeForm : openCreate}
          disabled={users.length === 0}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-amber-950 rounded-xl text-sm font-bold transition shadow-sm"
        >
          <span>{showForm ? "✕" : "+"}</span>
          <span>{showForm ? "Cerrar formulario" : "Nuevo regalón"}</span>
        </button>
      </div>

      {notice && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
          ✅ {notice}
        </div>
      )}
      {actionError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
          ⚠️ {actionError}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-5 bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm"
        >
          <h3 className="text-sm font-black text-gray-800 mb-4">
            {editing ? `Editar regalón de @${editing.userId}` : "Agregar regalón a un entrenador"}
          </h3>

          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              ⚠️ {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="block">
              <span className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Entrenador
              </span>
              <select
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Selecciona uno...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.username}>
                    {user.name} (@{user.username})
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                ID del Pokémon
              </span>
              <input
                type="number"
                min={1}
                value={form.pokemonId}
                onChange={(e) => setForm({ ...form, pokemonId: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="ej: 25"
              />
            </label>

            <label className="block">
              <span className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Nombre del Pokémon
              </span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="ej: pikachu"
              />
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-5">
            <button
              type="submit"
              disabled={save.isPending}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-amber-950 rounded-xl text-sm font-bold transition shadow-sm"
            >
              {save.isPending ? "Guardando..." : editing ? "Guardar cambios" : "Crear regalón"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-sm text-gray-500 font-medium">Cargando regalones...</div>
      ) : hasError ? (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-semibold">
          No pudimos cargar los regalones. Revisa tu sesión e inténtalo de nuevo.
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl text-sm text-gray-500">
          Todavía no hay regalones guardados.
        </div>
      ) : (
        <>
          {/* Tabla escritorio */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="text-left font-bold px-4 py-3">Pokémon</th>
                  <th className="text-left font-bold px-4 py-3">Entrenador</th>
                  <th className="text-left font-bold px-4 py-3">Guardado</th>
                  <th className="text-right font-bold px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {favorites.map((favorite) => {
                  const owner = usersByUsername.get(favorite.userId);
                  return (
                    <tr key={favorite.id} className="hover:bg-gray-50/70 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={artworkUrl(favorite.pokemonId)}
                            alt={favorite.name}
                            className="w-9 h-9 object-contain bg-gray-50 rounded-lg border border-gray-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800 capitalize truncate">{favorite.name}</p>
                            <p className="text-xs text-gray-400">#{String(favorite.pokemonId).padStart(3, "0")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-700 truncate">
                          {owner?.name ?? "Cuenta eliminada"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">@{favorite.userId}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(favorite.createdAt).toLocaleDateString("es-CL")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(favorite)}
                            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(favorite)}
                            disabled={remove.isPending}
                            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition disabled:opacity-40"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tarjetas móvil */}
          <div className="md:hidden space-y-3">
            {favorites.map((favorite) => {
              const owner = usersByUsername.get(favorite.userId);
              return (
                <div key={favorite.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={artworkUrl(favorite.pokemonId)}
                      alt={favorite.name}
                      className="w-12 h-12 object-contain bg-gray-50 rounded-lg border border-gray-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-800 capitalize truncate">{favorite.name}</p>
                      <p className="text-xs text-gray-400">#{String(favorite.pokemonId).padStart(3, "0")}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {owner?.name ?? "Cuenta eliminada"} · @{favorite.userId}
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">
                    Guardado el {new Date(favorite.createdAt).toLocaleDateString("es-CL")}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => openEdit(favorite)}
                      className="flex-1 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(favorite)}
                      disabled={remove.isPending}
                      className="flex-1 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition disabled:opacity-40"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
