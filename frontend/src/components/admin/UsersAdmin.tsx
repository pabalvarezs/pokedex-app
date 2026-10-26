import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AdminUser,
  adminCreateUser,
  adminDeleteUser,
  adminListUsers,
  adminUpdateUser,
  getApiErrorMessage,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";

type Role = "admin" | "trainer";

interface FormState {
  username: string;
  name: string;
  password: string;
  role: Role;
  avatar: string;
}

const EMPTY_FORM: FormState = {
  username: "",
  name: "",
  password: "",
  role: "trainer",
  avatar: "",
};

function roleBadge(role: string) {
  return role === "admin"
    ? { label: "Administrador", className: "bg-purple-100 text-purple-800 border-purple-200" }
    : { label: "Entrenador", className: "bg-blue-50 text-blue-700 border-blue-200" };
}

export default function UsersAdmin() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: adminListUsers,
  });

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editing, setEditing] = useState<AdminUser | null>(null);
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
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditing(user);
    setForm({
      username: user.username,
      name: user.name,
      password: "",
      role: user.role,
      avatar: user.avatar,
    });
    setFormError(null);
    setShowForm(true);
  };

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        return adminUpdateUser(editing.id, {
          name: form.name.trim(),
          role: form.role,
          avatar: form.avatar.trim(),
          password: form.password || undefined,
        });
      }
      return adminCreateUser({
        username: form.username.trim(),
        name: form.name.trim(),
        password: form.password,
        role: form.role,
        avatar: form.avatar.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "favorites"] });
      setNotice(editing ? "Entrenador actualizado correctamente." : "Entrenador creado correctamente.");
      setActionError(null);
      closeForm();
    },
    onError: (error) => setFormError(getApiErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (id: number) => adminDeleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "favorites"] });
      setNotice("Entrenador eliminado correctamente.");
      setActionError(null);
    },
    onError: (error) => setActionError(getApiErrorMessage(error)),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setNotice(null);

    if (!form.name.trim()) {
      setFormError("El nombre del entrenador es obligatorio.");
      return;
    }
    if (!editing && !/^[a-z0-9_.-]{3,30}$/i.test(form.username.trim())) {
      setFormError("El usuario debe tener entre 3 y 30 caracteres (letras, números, punto, guion o guion bajo).");
      return;
    }
    if (!editing && form.password.length < 6) {
      setFormError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (editing && form.password && form.password.length < 6) {
      setFormError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    save.mutate();
  };

  const handleDelete = (user: AdminUser) => {
    setNotice(null);
    setActionError(null);
    if (!window.confirm(`¿Eliminar la cuenta de ${user.name} (@${user.username}) y todos sus regalones?`)) {
      return;
    }
    remove.mutate(user.id);
  };

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-gray-800">Entrenadores</h2>
          <p className="text-xs text-gray-500">
            {users.length} cuenta{users.length === 1 ? "" : "s"} registrada{users.length === 1 ? "" : "s"} en el sitio
          </p>
        </div>
        <button
          onClick={showForm ? closeForm : openCreate}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition shadow-sm"
        >
          <span>{showForm ? "✕" : "+"}</span>
          <span>{showForm ? "Cerrar formulario" : "Nuevo entrenador"}</span>
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
            {editing ? `Editar a ${editing.name}` : "Crear nuevo entrenador"}
          </h3>

          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              ⚠️ {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Usuario
              </span>
              <input
                type="text"
                value={form.username}
                disabled={!!editing}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="ej: ash_ketchum"
              />
            </label>

            <label className="block">
              <span className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Nombre visible
              </span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="ej: Ash Ketchum"
              />
            </label>

            <label className="block">
              <span className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                {editing ? "Nueva contraseña (opcional)" : "Contraseña"}
              </span>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={editing ? "Dejar vacío para mantener la actual" : "Mínimo 6 caracteres"}
              />
            </label>

            <label className="block">
              <span className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Rol
              </span>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="trainer">Entrenador</option>
                <option value="admin">Administrador</option>
              </select>
            </label>

            <label className="block sm:col-span-2">
              <span className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                URL del avatar (opcional)
              </span>
              <input
                type="url"
                value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://..."
              />
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-5">
            <button
              type="submit"
              disabled={save.isPending}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition shadow-sm"
            >
              {save.isPending ? "Guardando..." : editing ? "Guardar cambios" : "Crear entrenador"}
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

      {isLoading ? (
        <div className="text-center py-12 text-sm text-gray-500 font-medium">Cargando entrenadores...</div>
      ) : isError ? (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-semibold">
          No pudimos cargar los entrenadores. Revisa tu sesión e inténtalo de nuevo.
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl text-sm text-gray-500">
          Todavía no hay entrenadores registrados.
        </div>
      ) : (
        <>
          {/* Tabla escritorio */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="text-left font-bold px-4 py-3">Entrenador</th>
                  <th className="text-left font-bold px-4 py-3">Rol</th>
                  <th className="text-left font-bold px-4 py-3">Creado</th>
                  <th className="text-right font-bold px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => {
                  const badge = roleBadge(user.role);
                  const isSelf = currentUser?.username === user.username;
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/70 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-9 h-9 rounded-full bg-gray-100 object-contain border border-gray-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800 truncate">
                              {user.name} {isSelf && <span className="text-[10px] text-red-600">(tú)</span>}
                            </p>
                            <p className="text-xs text-gray-400 truncate">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-black border ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString("es-CL")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(user)}
                            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            disabled={isSelf || remove.isPending}
                            title={isSelf ? "No puedes eliminar tu propia cuenta" : "Eliminar entrenador"}
                            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
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
            {users.map((user) => {
              const badge = roleBadge(user.role);
              const isSelf = currentUser?.username === user.username;
              return (
                <div key={user.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-11 h-11 rounded-full bg-gray-100 object-contain border border-gray-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-800 truncate">
                        {user.name} {isSelf && <span className="text-[10px] text-red-600">(tú)</span>}
                      </p>
                      <p className="text-xs text-gray-400 truncate">@{user.username}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border shrink-0 ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">
                    Creado el {new Date(user.createdAt).toLocaleDateString("es-CL")}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => openEdit(user)}
                      className="flex-1 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      disabled={isSelf || remove.isPending}
                      className="flex-1 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
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
