import { useEffect, useState, type FormEvent } from "react";
import { Hash, Star, User } from "lucide-react";
import type { AdminFavorite, AdminUser } from "../../../services/api";
import PokemonArtwork from "../../../components/PokemonArtwork";
import Drawer from "./Drawer";
import FormSelect from "./FormSelect";
import FormTextField from "./FormTextField";
import { artworkUrl } from "../lib/pokemonArtwork";

export interface FavoriteFormValues {
  userId: string;
  pokemonId: number;
  name: string;
}

interface Props {
  open: boolean;
  favorite: AdminFavorite | null;
  users: AdminUser[];
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: FavoriteFormValues) => void;
}

export default function FavoriteFormDrawer({
  open,
  favorite,
  users,
  pending,
  error,
  onClose,
  onSubmit,
}: Props) {
  const [userId, setUserId] = useState("");
  const [pokemonId, setPokemonId] = useState("");
  const [name, setName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setUserId(favorite?.userId ?? users[0]?.username ?? "");
    setPokemonId(favorite ? String(favorite.pokemonId) : "");
    setName(favorite?.name ?? "");
    setFieldErrors({});
  }, [open, favorite, users]);

  const numericId = Number(pokemonId);
  const isValidId = Number.isInteger(numericId) && numericId > 0;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const errors: Record<string, string> = {};

    if (!userId) errors.userId = "Elige al entrenador dueño del regalón.";
    if (!isValidId) errors.pokemonId = "El número debe ser un entero positivo (ej: 25).";
    if (!name.trim()) errors.name = "Ponle un nombre al regalón, po.";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    onSubmit({ userId, pokemonId: numericId, name: name.trim() });
  };

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
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
            )}
            {pending ? "Guardando…" : favorite ? "Guardar cambios" : "Crear regalón"}
          </button>
        </>
      }
    >
      <form id="favorite-form" onSubmit={handleSubmit} className="space-y-4">
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
                  id={numericId}
                  name={name || `Pokémon #${numericId}`}
                  src={artworkUrl(numericId)}
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

        <FormSelect
          label="Entrenador"
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          placeholder="Selecciona uno…"
          options={users.map((user) => ({
            value: user.username,
            label: `${user.name} (@${user.username})`,
          }))}
          error={fieldErrors.userId}
        />

        <FormTextField
          label="Número de Pokédex"
          type="number"
          min={1}
          value={pokemonId}
          onChange={(event) => setPokemonId(event.target.value)}
          placeholder="ej: 147"
          icon={<Hash className="h-4 w-4" aria-hidden="true" />}
          error={fieldErrors.pokemonId}
        />

        <FormTextField
          label="Nombre del regalón"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="ej: dratini"
          icon={<User className="h-4 w-4" aria-hidden="true" />}
          hint="Se muestra en la colección y en el panel."
          error={fieldErrors.name}
        />
      </form>
    </Drawer>
  );
}
