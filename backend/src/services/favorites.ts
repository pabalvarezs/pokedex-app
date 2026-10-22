import { prisma } from "./prisma";

export interface FavoriteInput {
  pokemonId: number;
  name: string;
  userId: string;
}

export async function listFavorites(userId: string) {
  return prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function addFavorite(input: FavoriteInput) {
  return prisma.favorite.create({ data: input });
}

export async function removeFavorite(pokemonId: number, userId: string) {
  try {
    return await prisma.favorite.delete({
      where: { userId_pokemonId: { userId, pokemonId } },
    });
  } catch {
    return null;
  }
}

export async function isFavorite(pokemonId: number, userId: string) {
  const f = await prisma.favorite.findUnique({
    where: { userId_pokemonId: { userId, pokemonId } },
  });
  return !!f;
}
