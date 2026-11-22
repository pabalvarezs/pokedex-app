import { z } from "zod";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const USERNAME_PATTERN = /^[a-z0-9_.-]{3,30}$/i;

/**
 * Esquema de entrenador. Se construye según se esté editando para conservar
 * exactamente las reglas que antes se validaban a mano en UserFormDrawer.
 */
export function makeUserSchema(isEditing: boolean) {
  return z.object({
    username: isEditing
      ? z.string()
      : z
          .string()
          .trim()
          .regex(
            USERNAME_PATTERN,
            "Entre 3 y 30 caracteres: letras, números, punto, guion o guion bajo."
          ),
    name: z.string().trim().min(1, "Ponle un nombre al entrenador, po."),
    password: isEditing
      ? z
          .string()
          .refine(
            (value) => value.length === 0 || value.length >= 6,
            "Si la cambias, debe tener al menos 6 caracteres."
          )
      : z.string().min(6, "La contraseña necesita al menos 6 caracteres."),
    role: z.enum(["trainer", "admin"]),
    avatar: z.string().trim(),
    email: z
      .string()
      .trim()
      .refine(
        (value) => value.length === 0 || EMAIL_PATTERN.test(value),
        "Ese correo no se ve bien. Revísalo."
      ),
  });
}

export type UserFormValues = z.infer<ReturnType<typeof makeUserSchema>>;

export const favoriteFormSchema = z.object({
  userId: z.string().min(1, "Elige al entrenador dueño del regalón."),
  pokemonId: z
    .number({ error: "El número debe ser un entero positivo (ej: 25)." })
    .int("El número debe ser un entero positivo (ej: 25).")
    .positive("El número debe ser un entero positivo (ej: 25)."),
  name: z.string().trim().min(1, "Ponle un nombre al regalón, po."),
});

export type FavoriteFormValues = z.infer<typeof favoriteFormSchema>;
