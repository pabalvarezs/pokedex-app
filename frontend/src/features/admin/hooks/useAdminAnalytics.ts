import { useMemo } from "react";
import type {
  AdminFavorite,
  AdminUser,
  PasswordResetRequest,
} from "../../../services/api";
import { formatDayLabel, lastDayKeys, parseAdminDate, toDayKey } from "../lib/dates";
import { getTypeColor } from "../lib/typeColors";
import { usePokemonTypesMap } from "./usePokemonTypes";

export type RangeDays = 7 | 30 | 90;

export interface DayCount {
  key: string;
  label: string;
  total: number;
}

export interface TrainerDatum {
  key: string;
  name: string;
  username: string;
  count: number;
  isOthers?: boolean;
}

export interface TypeDatum {
  key: string;
  label: string;
  count: number;
  color: string;
}

export interface ActivityItem {
  id: string;
  kind: "favorite" | "user" | "reset";
  title: string;
  detail: string;
  date: string;
  timestamp: number;
}

interface Props {
  favorites: AdminFavorite[];
  users: AdminUser[];
  resets: PasswordResetRequest[];
  range: RangeDays;
}

/**
 * Agregaciones derivadas de las listas que ya usa el panel: no dispara
 * requests nuevos y solo recalcula cuando cambian los datos o el rango.
 */
export function useAdminAnalytics({ favorites, users, resets, range }: Props) {
  const pokemonIds = useMemo(
    () => Array.from(new Set(favorites.map((favorite) => favorite.pokemonId))),
    [favorites]
  );
  const { typesById, isLoading: typesLoading } = usePokemonTypesMap(pokemonIds);

  const analytics = useMemo(() => {
    // TODO: si estas listas superan ~500 elementos, mover la agregación al
    // backend. Por ahora se calcula en cliente pero sin bloquear el render.
    const days = lastDayKeys(range);
    const inRange = new Set(days);

    const favoriteCounts = new Map<string, number>();
    for (const favorite of favorites) {
      const key = toDayKey(favorite.createdAt);
      if (key && inRange.has(key)) {
        favoriteCounts.set(key, (favoriteCounts.get(key) ?? 0) + 1);
      }
    }
    const favoritesByDay: DayCount[] = days.map((key) => ({
      key,
      label: formatDayLabel(key),
      total: favoriteCounts.get(key) ?? 0,
    }));

    const userDays = users
      .map((user) => toDayKey(user.createdAt))
      .filter((key): key is string => Boolean(key))
      .sort();
    let cursor = 0;
    const trainersOverTime: DayCount[] = days.map((key) => {
      while (cursor < userDays.length && userDays[cursor] <= key) cursor += 1;
      return { key, label: formatDayLabel(key), total: cursor };
    });

    const usersByUsername = new Map(users.map((user) => [user.username, user]));
    const perTrainer = new Map<string, TrainerDatum>();
    for (const favorite of favorites) {
      const username = favorite.userId;
      const owner = usersByUsername.get(username);
      const entry = perTrainer.get(username) ?? {
        key: username,
        name: owner?.name ?? `@${username}`,
        username,
        count: 0,
      };
      entry.count += 1;
      perTrainer.set(username, entry);
    }
    const sortedTrainers = Array.from(perTrainer.values()).sort(
      (a, b) => b.count - a.count
    );
    const topTrainers = sortedTrainers.slice(0, 8);
    const rest = sortedTrainers.slice(8);
    if (rest.length > 0) {
      topTrainers.push({
        key: "__others__",
        name: `Otros (${rest.length})`,
        username: "",
        count: rest.reduce((sum, item) => sum + item.count, 0),
        isOthers: true,
      });
    }

    const typeCounts = new Map<string, number>();
    for (const favorite of favorites) {
      for (const type of typesById.get(favorite.pokemonId) ?? []) {
        typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
      }
    }
    const typeDistribution: TypeDatum[] = Array.from(typeCounts.entries())
      .map(([key, count]) => {
        const info = getTypeColor(key);
        return { key, label: info.es, count, color: info.badge };
      })
      .sort((a, b) => b.count - a.count);

    const activity: ActivityItem[] = [];
    for (const favorite of favorites) {
      activity.push({
        id: `fav-${favorite.id}`,
        kind: "favorite",
        title: `${favorite.name} #${favorite.pokemonId}`,
        detail: `Regalón guardado por @${favorite.userId}`,
        date: favorite.createdAt,
        timestamp: parseAdminDate(favorite.createdAt)?.getTime() ?? 0,
      });
    }
    for (const user of users) {
      activity.push({
        id: `user-${user.id}`,
        kind: "user",
        title: user.name,
        detail: `@${user.username} se unió a la Pokédex`,
        date: user.createdAt,
        timestamp: parseAdminDate(user.createdAt)?.getTime() ?? 0,
      });
    }
    for (const request of resets) {
      activity.push({
        id: `reset-${request.id}`,
        kind: "reset",
        title: `Recuperación de @${request.username}`,
        detail:
          request.source === "admin"
            ? "Enlace generado por un admin"
            : "Solicitada por el entrenador",
        date: request.createdAt,
        timestamp: parseAdminDate(request.createdAt)?.getTime() ?? 0,
      });
    }
    activity.sort((a, b) => b.timestamp - a.timestamp);

    return {
      favoritesByDay,
      trainersOverTime,
      topTrainers,
      allTrainers: sortedTrainers,
      totalTrainersWithFavorites: sortedTrainers.length,
      typeDistribution,
      activity,
      hasData: favorites.length > 0 || users.length > 0,
    };
  }, [favorites, users, resets, range, typesById]);

  return { ...analytics, typesLoading };
}
