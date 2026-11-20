import { useQuery } from "@tanstack/react-query";
import {
  adminListFavorites,
  adminListPasswordResets,
  adminListUsers,
  type AdminFavorite,
} from "../../../services/api";

export interface RecentFavorite {
  name: string;
  pokemonId: number;
  createdAt: string;
}

export interface AdminStats {
  total: number;
  trainers: number;
  admins: number;
  favorites: number;
  recentFavorite: RecentFavorite | null;
  pendingResets: number;
}

/**
 * No existe un endpoint de estadísticas, así que las métricas se derivan de
 * las mismas listas del panel. Al repetir los query keys de las pestañas,
 * TanStack Query reutiliza la caché y no se duplican requests.
 */
export function useAdminStats() {
  const users = useQuery({ queryKey: ["admin", "users"], queryFn: adminListUsers });
  const favorites = useQuery({
    queryKey: ["admin", "favorites"],
    queryFn: adminListFavorites,
  });
  const resets = useQuery({
    queryKey: ["admin", "password-resets"],
    queryFn: adminListPasswordResets,
  });

  const people = users.data ?? [];
  const favoriteList = favorites.data ?? [];

  const latestFavorite = favoriteList.reduce<AdminFavorite | null>(
    (latest, favorite) => {
      if (!latest) return favorite;
      return new Date(favorite.createdAt).getTime() >
        new Date(latest.createdAt).getTime()
        ? favorite
        : latest;
    },
    null
  );

  const stats: AdminStats = {
    total: people.length,
    trainers: people.filter((user) => user.role === "trainer").length,
    admins: people.filter((user) => user.role === "admin").length,
    favorites: favoriteList.length,
    recentFavorite: latestFavorite
      ? {
          name: latestFavorite.name,
          pokemonId: latestFavorite.pokemonId,
          createdAt: latestFavorite.createdAt,
        }
      : null,
    pendingResets: resets.data?.length ?? 0,
  };

  return {
    stats,
    isLoading: users.isLoading || favorites.isLoading || resets.isLoading,
    isError: users.isError || favorites.isError || resets.isError,
  };
}
