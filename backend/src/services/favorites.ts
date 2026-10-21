import { prisma } from "./prisma";

export interface FavoriteInput {
  pokemonId: number;
  name: string;
}

export async function listFavorites() {
  return prisma.favorite.findMany({ orderBy: { createdAt: "desc" } });
}

export async function addFavorite(input: FavoriteInput) {
  return prisma.favorite.create({ data: input });
}

export async function removeFavorite(pokemonId: number) {
  try {
    return await prisma.favorite.delete({ where: { pokemonId } });
  } catch {
    return null;
  }
}

export async function isFavorite(pokemonId: number) {
  const f = await prisma.favorite.findUnique({ where: { pokemonId } });
  return !!f;
}
