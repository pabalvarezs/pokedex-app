/** URLs de sprites/artwork de PokeAPI reutilizadas por el panel. */
export function artworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function spriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

/** Pikachu como avatar de respaldo cuando la URL guardada falla. */
export const DEFAULT_POKEMON_AVATAR = spriteUrl(25);

export function isUsableImageUrl(value: string | null | undefined): value is string {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}
