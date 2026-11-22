import { useEffect, useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Image, Lock, Mail, Tag, User } from "lucide-react";
import type { AdminUser } from "../../../services/api";
import { makeUserSchema } from "../lib/formSchemas";
import type { UserFormValues } from "../lib/formSchemas";
import { cn } from "../lib/cn";
import Drawer from "./Drawer";
import FormSelect from "./FormSelect";
import FormTextField from "./FormTextField";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import UserAvatar from "./UserAvatar";

export type { UserFormValues } from "../lib/formSchemas";

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

export default function UserFormDrawer({
  open,
  editing,
  pending,
  error,
  onClose,
  onSubmit,
}: Props) {
  const formId = useId();
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, submitCount },
  } = useForm<UserFormValues>({
    resolver: zodResolver(makeUserSchema(Boolean(editing))),
    defaultValues: EMPTY_FORM,
    mode: "onSubmit",
  });

  const name = watch("name");
  const username = watch("username");
  const role = watch("role");
  const avatar = watch("avatar");
  const password = watch("password");

  useEffect(() => {
    if (!open) return;
    reset(
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
    setShowPassword(false);
    setShake(false);
  }, [open, editing, reset]);

  useEffect(() => {
    if (submitCount === 0 || Object.keys(errors).length === 0) return;
    setShake(true);
    const timeout = window.setTimeout(() => setShake(false), 350);
    return () => window.clearTimeout(timeout);
    // Se ejecuta solo cuando cambia el número de envíos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitCount]);

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
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
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
      <form
        id={formId}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className={cn("space-y-4", shake && "animate-shake motion-reduce:animate-none")}
      >
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
            src={avatar}
            name={name || "Nuevo entrenador"}
            role={role}
            size="lg"
          />
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
              Vista previa
            </p>
            <p className="truncate text-sm font-extrabold text-ink-900">
              {name || "Nombre del entrenador"}
            </p>
            <p className="truncate text-xs text-ink-500">
              {username ? `@${username}` : "sin usuario todavía"}
            </p>
          </div>
        </div>

        <Controller
          control={control}
          name="username"
          render={({ field, fieldState }) => (
            <FormTextField
              label="Usuario"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={Boolean(editing)}
              autoComplete="off"
              placeholder="ej: ash_ketchum"
              icon={<User className="h-4 w-4" aria-hidden="true" />}
              hint={editing ? "El usuario no se puede cambiar." : undefined}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <FormTextField
              label="Nombre visible"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              autoComplete="off"
              placeholder="ej: Ash Ketchum"
              icon={<Tag className="h-4 w-4" aria-hidden="true" />}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <FormTextField
              label="Email (opcional)"
              type="email"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              autoComplete="off"
              placeholder="entrenador@correo.cl"
              icon={<Mail className="h-4 w-4" aria-hidden="true" />}
              hint="Se usa para enviar el enlace de recuperación."
              error={fieldState.error?.message}
            />
          )}
        />

        <div>
          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <FormTextField
                label={editing ? "Nueva contraseña (opcional)" : "Contraseña"}
                type={showPassword ? "text" : "password"}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                autoComplete="new-password"
                placeholder={editing ? "Dejar vacío para mantenerla" : "Mínimo 6 caracteres"}
                icon={<Lock className="h-4 w-4" aria-hidden="true" />}
                error={fieldState.error?.message}
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
            )}
          />
          <PasswordStrengthMeter password={password} />
        </div>

        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <FormSelect
              label="Rol"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              options={[
                { value: "trainer", label: "Entrenador" },
                { value: "admin", label: "Administrador" },
              ]}
              hint="Los administradores pueden gestionar cuentas y regalones."
            />
          )}
        />

        <Controller
          control={control}
          name="avatar"
          render={({ field }) => (
            <FormTextField
              label="URL del avatar (opcional)"
              type="url"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              autoComplete="off"
              placeholder="https://…"
              icon={<Image className="h-4 w-4" aria-hidden="true" />}
              hint="Si la imagen falla, mostramos al Pikachu de la casa."
            />
          )}
        />
      </form>
    </Drawer>
  );
}
