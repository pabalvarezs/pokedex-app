import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Hash, Star, User } from "lucide-react";
import type { AdminFavorite, AdminUser } from "../../../services/api";
import PokemonArtwork from "../../../components/PokemonArtwork";
import { favoriteFormSchema } from "../lib/formSchemas";
import type { FavoriteFormValues } from "../lib/formSchemas";
import { cn } from "../lib/cn";
import { artworkUrl } from "../lib/pokemonArtwork";
import Drawer from "./Drawer";
import FormSelect from "./FormSelect";
import FormTextField from "./FormTextField";

export type { FavoriteFormValues } from "../lib/formSchemas";

interface Props {
  open: boolean;
  favorite: AdminFavorite | null;
  users: AdminUser[];
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: FavoriteFormValues) => void;
}

const EMPTY_FORM: FavoriteFormValues = {
  userId: "",
  pokemonId: Number.NaN,
  name: "",
};

export default function FavoriteFormDrawer({
  open,
  favorite,
  users,
  pending,
  error,
  onClose,
  onSubmit,
}: Props) {
  const [shake, setShake] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, submitCount },
  } = useForm<FavoriteFormValues>({
    resolver: zodResolver(favoriteFormSchema),
    defaultValues: EMPTY_FORM,
    mode: "onSubmit",
  });

  const pokemonId = watch("pokemonId");
  const name = watch("name");
  const isValidId = Number.isInteger(pokemonId) && pokemonId > 0;

  useEffect(() => {
    if (!open) return;
    reset({
      userId: favorite?.userId ?? users[0]?.username ?? "",
      pokemonId: favorite?.pokemonId ?? Number.NaN,
      name: favorite?.name ?? "",
    });
    setShake(false);
  }, [open, favorite, users, reset]);

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
      title={favorite ? `Editar a ${favorite.name}` : "Nuevo regalón"}
      subtitle={
        favorite
          ? "Los cambios se reflejan al instante en la Pokédex."
          : "Agrega un Pokémon a la colección de un entrenador."
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
            form="favorite-form"
            disabled={pending}
            className="btn-accent focus-accent inline-flex items-center justify-center gap-2 rounded-control px-5 py-2.5 text-sm font-bold shadow-sm transition duration-150 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending && (
              <span
                aria-hidden="true"
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
              />
            )}
            {pending ? "Guardando…" : favorite ? "Guardar cambios" : "Crear regalón"}
          </button>
        </>
      }
    >
      <form
        id="favorite-form"
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

        {!favorite && (
          <div className="flex items-center gap-3 rounded-control border border-line bg-white/60 p-3">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-slate-100">
              {isValidId ? (
                <PokemonArtwork
                  id={pokemonId}
                  name={name || `Pokémon #${pokemonId}`}
                  src={artworkUrl(pokemonId)}
                  className="h-12 w-12 object-contain"
                />
              ) : (
                <Star className="h-6 w-6 text-amber-500" aria-hidden="true" />
              )}
            </span>
            <p className="text-xs leading-relaxed text-ink-500">
              Escribe el número de la Pokédex y el nombre con el que aparecerá en
              los regalones.
            </p>
          </div>
        )}

        <Controller
          control={control}
          name="userId"
          render={({ field, fieldState }) => (
            <FormSelect
              label="Entrenador"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="Selecciona uno…"
              options={users.map((user) => ({
                value: user.username,
                label: `${user.name} (@${user.username})`,
              }))}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="pokemonId"
          render={({ field, fieldState }) => (
            <FormTextField
              label="Número de Pokédex"
              type="number"
              min={1}
              value={Number.isNaN(field.value) ? "" : field.value}
              onChange={(event) => {
                const raw = event.target.value;
                field.onChange(raw === "" ? Number.NaN : Number(raw));
              }}
              onBlur={field.onBlur}
              placeholder="ej: 147"
              icon={<Hash className="h-4 w-4" aria-hidden="true" />}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <FormTextField
              label="Nombre del regalón"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="ej: dratini"
              icon={<User className="h-4 w-4" aria-hidden="true" />}
              hint="Se muestra en la colección y en el panel."
              error={fieldState.error?.message}
            />
          )}
        />
      </form>
    </Drawer>
  );
}
