import { useId, useEffect, useState, type FormEvent } from "react";
import {
  Eye,
  EyeOff,
  Image,
  Lock,
  Mail,
  Tag,
  User,
} from "lucide-react";
import type { AdminUser } from "../../../services/api";
import Drawer from "./Drawer";
import FormSelect from "./FormSelect";
import FormTextField from "./FormTextField";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import UserAvatar from "./UserAvatar";
import type { Role } from "./RoleBadge";

export interface UserFormValues {
  username: string;
  name: string;
  password: string;
  role: Role;
  avatar: string;
  email: string;
}

interface Props {
  open: boolean;
  editing: AdminUser | null;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
}

const EMPTY_FORM: UserFormValues = {
  username: "",
  name: "",
  password: "",
  role: "trainer",
  avatar: "",
  email: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-z0-9_.-]{3,30}$/i;

export default function UserFormDrawer({
  open,
  editing,
  pending,
  error,
  onClose,
  onSubmit,
}: Props) {
  const formId = useId();
  const [form, setForm] = useState<UserFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormValues, string>>>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? {
            username: editing.username,
            name: editing.name,
            password: "",
            role: editing.role,
            avatar: editing.avatar,
            email: editing.email ?? "",
          }
        : EMPTY_FORM
    );
    setErrors({});
    setShowPassword(false);
  }, [open, editing]);

  const update = <Key extends keyof UserFormValues>(
    key: Key,
    value: UserFormValues[Key]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Partial<Record<keyof UserFormValues, string>> = {};

    if (!form.name.trim()) next.name = "Ponle un nombre al entrenador, po.";
    if (!editing && !USERNAME_PATTERN.test(form.username.trim())) {
      next.username = "Entre 3 y 30 caracteres: letras, números, punto, guion o guion bajo.";
    }
    if (!editing && form.password.length < 6) {
      next.password = "La contraseña necesita al menos 6 caracteres.";
    }
    if (editing && form.password && form.password.length < 6) {
      next.password = "Si la cambias, debe tener al menos 6 caracteres.";
    }
    if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim())) {
      next.email = "Ese correo no se ve bien. Revísalo.";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSubmit({
      username: form.username.trim(),
      name: form.name.trim(),
      password: form.password,
      role: form.role,
      avatar: form.avatar.trim(),
      email: form.email.trim(),
    });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editing ? `Editar a ${editing.name}` : "Nuevo entrenador"}
      subtitle={
        editing
          ? "Actualiza sus datos, rol o contraseña."
          : "Crea la cuenta y comparte las credenciales con la persona."
      }
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="focus-accent rounded-control bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition duration-150 hover:bg-slate-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form={formId}
            disabled={pending}
            className="btn-accent focus-accent inline-flex items-center justify-center gap-2 rounded-control px-5 py-2.5 text-sm font-bold shadow-sm transition duration-150 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending && (
              <span
                aria-hidden="true"
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
            )}
            {pending
              ? "Guardando…"
              : editing
                ? "Guardar cambios"
                : "Crear entrenador"}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            role="alert"
            className="rounded-control border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700"
          >
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 rounded-control border border-line bg-white/60 p-3">
          <UserAvatar
            src={form.avatar}
            name={form.name || "Nuevo entrenador"}
            role={form.role}
            size="lg"
          />
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
              Vista previa
            </p>
            <p className="truncate text-sm font-extrabold text-ink-900">
              {form.name || "Nombre del entrenador"}
            </p>
            <p className="truncate text-xs text-ink-500">
              {form.username ? `@${form.username}` : "sin usuario todavía"}
            </p>
          </div>
        </div>

        <FormTextField
          label="Usuario"
          value={form.username}
          onChange={(event) => update("username", event.target.value)}
          disabled={Boolean(editing)}
          autoComplete="off"
          placeholder="ej: ash_ketchum"
          icon={<User className="h-4 w-4" aria-hidden="true" />}
          hint={editing ? "El usuario no se puede cambiar." : undefined}
          error={errors.username}
        />

        <FormTextField
          label="Nombre visible"
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          autoComplete="off"
          placeholder="ej: Ash Ketchum"
          icon={<Tag className="h-4 w-4" aria-hidden="true" />}
          error={errors.name}
        />

        <FormTextField
          label="Email (opcional)"
          type="email"
          value={form.email}
          onChange={(event) => update("email", event.target.value)}
          autoComplete="off"
          placeholder="entrenador@correo.cl"
          icon={<Mail className="h-4 w-4" aria-hidden="true" />}
          hint="Se usa para enviar el enlace de recuperación."
          error={errors.email}
        />

        <div>
          <FormTextField
            label={editing ? "Nueva contraseña (opcional)" : "Contraseña"}
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(event) => update("password", event.target.value)}
            autoComplete="new-password"
            placeholder={editing ? "Dejar vacío para mantenerla" : "Mínimo 6 caracteres"}
            icon={<Lock className="h-4 w-4" aria-hidden="true" />}
            error={errors.password}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="focus-accent grid h-7 w-7 place-items-center rounded-full text-ink-500 transition duration-150 hover:bg-slate-100"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            }
          />
          <PasswordStrengthMeter password={form.password} />
        </div>

        <FormSelect
          label="Rol"
          value={form.role}
          onChange={(event) => update("role", event.target.value as Role)}
          options={[
            { value: "trainer", label: "Entrenador" },
            { value: "admin", label: "Administrador" },
          ]}
          hint="Los administradores pueden gestionar cuentas y regalones."
        />

        <FormTextField
          label="URL del avatar (opcional)"
          type="url"
          value={form.avatar}
          onChange={(event) => update("avatar", event.target.value)}
          autoComplete="off"
          placeholder="https://…"
          icon={<Image className="h-4 w-4" aria-hidden="true" />}
          hint="Si la imagen falla, mostramos al Pikachu de la casa."
        />
      </form>
    </Drawer>
  );
}
