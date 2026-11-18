import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addFavorite,
  listFavorites,
  removeFavorite,
  type Favorite,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { usePokemonPreviews } from "../hooks/usePokemonPreviews";
import { getTypeBadge } from "../utils/pokemon";
import SectionHero, { type HeroStat } from "../components/favorites/SectionHero";
import FavoritesToolbar, {
  type FavoriteSort,
} from "../components/favorites/FavoritesToolbar";
import FavoritePokemonCard from "../components/favorites/FavoritePokemonCard";
import FavoriteCardSkeleton from "../components/favorites/FavoriteCardSkeleton";
import FavoritesEmptyState from "../components/favorites/FavoritesEmptyState";
import FavoritesToast, {
  type ToastKind,
} from "../components/favorites/FavoritesToast";

interface ToastState {
  kind: ToastKind;
  message: string;
  favorite?: Favorite;
}

const SKELETON_COUNT = 8;

const PAGE_BACKGROUND =
  "radial-gradient(circle at 12% 0%, #fee2e2 0%, transparent 42%), radial-gradient(circle at 92% 0%, #fef3c7 0%, transparent 38%), linear-gradient(180deg, #f8fafc 0%, #ffffff 48%, #f8fafc 100%)";

function displayName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function addedLabel(createdAt: string) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Último en llegar";
  const formatted = date.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
  });
  return `Agregado el ${formatted}`;
}

/**
 * Con pocas tarjetas se prefieren menos columnas y más anchas, y con una o dos
 * se acota el ancho para que no queden desproporcionadas. Desde siete vuelve
 * la grilla densa de cuatro columnas en pantallas grandes.
 */
function gridClass(count: number) {
  if (count <= 1) return "grid-cols-1 max-w-[380px]";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2 max-w-[720px]";
  if (count <= 6) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
}

export default function Favorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  // Sin sesión no se consultan favoritos: el backend exige token válido
  const userId = user?.username;

  const {
    data: favorites = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["favorites", userId],
    queryFn: () => listFavorites(),
    enabled: !!userId,
  });

  // Los tipos se piden en segundo plano con el servicio existente y quedan
  // cacheados en memoria: la lógica de favoritos no cambia.
  const { previews } = usePokemonPreviews(favorites.map((f) => f.pokemonId));

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<FavoriteSort>("recent");
  const [hiddenIds, setHiddenIds] = useState<Set<number>>(new Set());
  const [exitingId, setExitingId] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [undoing, setUndoing] = useState(false);
  const exitTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (exitTimer.current !== null) window.clearTimeout(exitTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(
      () => setToast(null),
      toast.kind === "removed" ? 6500 : 4000
    );
    return () => window.clearTimeout(timer);
  }, [toast]);

  const remove = useMutation({
    mutationFn: (favorite: Favorite) => removeFavorite(favorite.pokemonId),
    onSuccess: async (_data, favorite) => {
      setHiddenIds((current) => new Set(current).add(favorite.pokemonId));
      setToast({
        kind: "removed",
        message: `Quitaste a ${displayName(favorite.name)} de tus regalones.`,
        favorite,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["favorites"] }),
        queryClient.invalidateQueries({ queryKey: ["favorite"] }),
      ]);
    },
    onError: (_error, favorite) => {
      setHiddenIds((current) => {
        const next = new Set(current);
        next.delete(favorite.pokemonId);
        return next;
      });
      setToast({
        kind: "error",
        message: `No pudimos quitar a ${displayName(favorite.name)}. Inténtalo de nuevo, po.`,
      });
    },
  });

  const visibleFavorites = useMemo(
    () => favorites.filter((favorite) => !hiddenIds.has(favorite.pokemonId)),
    [favorites, hiddenIds]
  );

  const shownFavorites = useMemo(() => {
    const term = query.trim().toLowerCase();
    const digits = term.replace(/^#/, "");

    const matched = term
      ? visibleFavorites.filter(
          (favorite) =>
            favorite.name.toLowerCase().includes(term) ||
            (digits.length > 0 &&
              String(favorite.pokemonId).padStart(3, "0").includes(digits))
        )
      : visibleFavorites;

    return [...matched].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "dex") return a.pokemonId - b.pokemonId;
      // "recent": la API ya entrega lo último agregado primero.
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [visibleFavorites, query, sortBy]);

  const heroStats = useMemo<HeroStat[]>(() => {
    if (visibleFavorites.length === 0) return [];

    const stats: HeroStat[] = [];

    const latest = visibleFavorites.reduce((best, favorite) =>
      new Date(favorite.createdAt).getTime() >
      new Date(best.createdAt).getTime()
        ? favorite
        : best
    );
    const latestPreview = previews[latest.pokemonId];

    stats.push({
      label: "Último agregado",
      value: displayName(latestPreview?.name ?? latest.name),
      hint: addedLabel(latest.createdAt),
      sprite: latestPreview?.artwork,
    });

    const typeCounts = new Map<string, number>();
    visibleFavorites.forEach((favorite) => {
      (previews[favorite.pokemonId]?.types ?? []).forEach((type) => {
        typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
      });
    });

    if (typeCounts.size > 0) {
      const [topType, amount] = [...typeCounts.entries()].sort(
        (a, b) => b[1] - a[1]
      )[0];
      const info = getTypeBadge(topType);
      stats.push({
        label: "Tipo estrella",
        value: `${info.emoji} ${info.es}`,
        hint: amount > 1 ? `${amount} en tu equipo` : "El único de su tipo",
      });
    }

    const highest = visibleFavorites.reduce((best, favorite) =>
      favorite.pokemonId > best.pokemonId ? favorite : best
    );
    stats.push({
      label: "N° más alto",
      value: `#${String(highest.pokemonId).padStart(3, "0")}`,
      hint: displayName(previews[highest.pokemonId]?.name ?? highest.name),
    });

    return stats.slice(0, 3);
  }, [visibleFavorites, previews]);

  const finishRemove = (favorite: Favorite) => {
    setExitingId(null);
    setHiddenIds((current) => new Set(current).add(favorite.pokemonId));
    remove.mutate(favorite);
  };

  const handleRemove = (favorite: Favorite) => {
    if (exitingId !== null || remove.isPending) return;

    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      finishRemove(favorite);
      return;
    }

    setExitingId(favorite.pokemonId);
    exitTimer.current = window.setTimeout(
      () => finishRemove(favorite),
      200
    );
  };

  const handleUndo = async () => {
    const favorite = toast?.favorite;
    if (!favorite || undoing) return;

    setUndoing(true);
    try {
      await addFavorite(favorite.pokemonId, favorite.name);
      setHiddenIds((current) => {
        const next = new Set(current);
        next.delete(favorite.pokemonId);
        return next;
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["favorites"] }),
        queryClient.invalidateQueries({ queryKey: ["favorite"] }),
      ]);
      setToast({
        kind: "restored",
        message: `¡${displayName(favorite.name)} volvió a tus regalones!`,
      });
    } catch {
      setToast({
        kind: "error",
        message: "No pudimos devolverlo. Prueba de nuevo en un ratito.",
      });
    } finally {
      setUndoing(false);
    }
  };

  if (!userId) {
    return (
      <div
        className="-mx-4 -my-5 min-h-[calc(100vh-4.5rem)] px-4 py-10 sm:-mx-6 sm:-my-6 sm:px-6 sm:py-14"
        style={{ backgroundImage: PAGE_BACKGROUND }}
      >
        <div className="mx-auto max-w-md rounded-card border border-line bg-surface p-8 text-center shadow-card">
          <span
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl"
            aria-hidden="true"
          >
            🔐
          </span>
          <h1 className="text-xl font-extrabold text-ink-900">
            Inicia sesión para ver tus regalones
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Los favoritos se guardan por entrenador. Entra con tu cuenta para
            verlos en cualquier dispositivo.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-control bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
          >
            Ir al acceso de entrenador
            <span aria-hidden="true">👈</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="-mx-4 -my-5 min-h-[calc(100vh-4.5rem)] px-4 py-6 sm:-mx-6 sm:-my-6 sm:px-6 sm:py-8"
      style={{ backgroundImage: PAGE_BACKGROUND }}
    >
      <div className="mx-auto w-full max-w-home">
        <SectionHero
          count={isLoading || isError ? null : visibleFavorites.length}
          stats={isLoading || isError ? [] : heroStats}
        />

        {isLoading ? (
          <div className="mt-5" aria-busy="true" aria-live="polite">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-500">
              <span
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent motion-reduce:animate-none"
                aria-hidden="true"
              />
              Buscando a tus regalones…
            </div>
            <div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              aria-hidden="true"
            >
              {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <FavoriteCardSkeleton key={index} />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div
            role="alert"
            className="mt-5 rounded-card border border-line bg-surface px-6 py-14 text-center shadow-card"
          >
            <span className="mb-4 block text-4xl" aria-hidden="true">
              🔌
            </span>
            <p className="text-lg font-extrabold text-red-600">
              Se nos escaparon tus regalones
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
              Revisa tu conexión o tu sesión y prueba de nuevo. No se perdió
              nada de tu colección.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-control bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
            >
              Reintentar
            </button>
          </div>
        ) : visibleFavorites.length === 0 ? (
          <FavoritesEmptyState />
        ) : (
          <>
            <FavoritesToolbar
              query={query}
              onQueryChange={setQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              shown={shownFavorites.length}
              total={visibleFavorites.length}
            />

            {shownFavorites.length === 0 ? (
              <FavoritesEmptyState
                filtered
                query={query.trim()}
                onClear={() => setQuery("")}
              />
            ) : (
              <div
                className={`favorites-grid-enter mt-5 grid gap-4 ${gridClass(
                  shownFavorites.length
                )}`}
              >
                {shownFavorites.map((favorite, index) => (
                  <FavoritePokemonCard
                    key={favorite.id}
                    favorite={favorite}
                    preview={previews[favorite.pokemonId]}
                    index={index}
                    isRemoving={exitingId === favorite.pokemonId}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {toast && (
        <FavoritesToast
          kind={toast.kind}
          message={toast.message}
          canUndo={toast.kind === "removed"}
          undoing={undoing}
          onUndo={handleUndo}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
