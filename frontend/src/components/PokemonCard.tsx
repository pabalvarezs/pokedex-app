import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pokemon } from "../services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isFavorite, addFavorite, removeFavorite } from "../services/api";
import { useAuth } from "../context/AuthContext";
import TypeBadge from "./TypeBadge";

interface Props {
  pokemon: Pokemon;
}

type ImageStage = "artwork" | "sprite" | "missing";

type ActionFeedback = {
  kind: "success" | "error";
  message: string;
} | null;

export default function PokemonCard({ pokemon }: Props) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.username;
  const { data: fav } = useQuery({
    queryKey: ["favorite", pokemon.id, userId],
    queryFn: () => isFavorite(pokemon.id),
    enabled: !!pokemon.id && !!userId,
  });

  const [imageStage, setImageStage] = useState<ImageStage>("artwork");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<ActionFeedback>(null);

  // Cada tarjeta reutiliza su instancia al cambiar de Pokémon en la lista.
  useEffect(() => {
    setImageStage("artwork");
    setPending(false);
    setFeedback(null);
  }, [pokemon.id]);

  // El mensaje de la acción es breve: confirma sin dejar ruido permanente.
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 2600);
    return () => clearTimeout(timer);
  }, [feedback]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId || pending) return;

    setPending(true);
    setFeedback(null);
    try {
      if (fav) {
        await removeFavorite(pokemon.id);
        setFeedback({ kind: "success", message: "Quitado de tus regalones" });
      } else {
        await addFavorite(pokemon.id, pokemon.name);
        setFeedback({ kind: "success", message: "¡Agregado a tus regalones!" });
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["favorite"] }),
        queryClient.invalidateQueries({ queryKey: ["favorites"] }),
      ]);
    } catch {
      setFeedback({
        kind: "error",
        message: "No se pudo guardar. Intenta de nuevo.",
      });
    } finally {
      setPending(false);
    }
  };

  const typeBadges = (pokemon.types ?? []).map((t) => (
    <TypeBadge key={t} type={t} size="sm" />
  ));

  // Prefer official artwork, then default sprite
  const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
  const fallbackSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

  const imageSrc =
    imageStage === "artwork"
      ? artworkUrl
      : imageStage === "sprite"
        ? fallbackSprite
        : null;

  const handleImageError = () => {
    setImageStage((stage) => (stage === "artwork" ? "sprite" : "missing"));
  };

  const formattedId = String(pokemon.id).padStart(3, "0");

  return (
    <article
      className="glass-surface group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-ambient focus-within:border-red-200 focus-within:shadow-ambient motion-reduce:hover:translate-y-0"
      aria-busy={pending || undefined}
    >
      <Link
        to={`/pokemon/${pokemon.id}`}
        aria-label={`Ver ficha de ${pokemon.name}`}
        className="flex flex-1 flex-col gap-3 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-400 sm:p-3.5"
      >
        <div className="artwork-frame relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[12px] border border-line-soft p-3">
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-extrabold tracking-[0.08em] text-ink-500 shadow-sm backdrop-blur-sm">
            #{formattedId}
          </span>

          {imageSrc ? (
            <img
              src={imageSrc}
              alt={pokemon.name}
              className="h-full w-full object-contain drop-shadow-sm transition-transform duration-200 ease-out group-hover:scale-[1.05] motion-reduce:transform-none"
              loading="lazy"
              decoding="async"
              draggable={false}
              onError={handleImageError}
            />
          ) : (
            <div
              role="img"
              aria-label={`Ilustración no disponible de ${pokemon.name}`}
              className="flex flex-col items-center justify-center gap-2 text-slate-300"
            >
              <svg
                viewBox="0 0 64 64"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="h-12 w-12"
                aria-hidden="true"
              >
                <circle cx="32" cy="32" r="22" />
                <path d="M10 32h44" />
                <circle cx="32" cy="32" r="8" fill="white" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                Sin foto
              </span>
            </div>
          )}

          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-2 right-2 z-10 inline-flex translate-y-1 items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-red-700 opacity-0 shadow-sm backdrop-blur-sm transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
          >
            Ver ficha
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3 w-3"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center gap-2">
          <h3 className="flex w-full items-center justify-center gap-1.5 text-[15px] font-extrabold capitalize text-ink-900 transition-colors group-hover:text-red-600">
            <span className="line-clamp-1">{pokemon.name}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0 text-ink-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-red-600 motion-reduce:transform-none"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </h3>

          <div className="flex min-h-[22px] flex-wrap items-center justify-center gap-1.5">
            {typeBadges}
          </div>
        </div>
      </Link>

      <div className="border-t border-line-soft px-3 pb-3 pt-2.5 sm:px-3.5 sm:pb-3.5">
        {userId ? (
          <>
            <button
              type="button"
              onClick={toggle}
              disabled={pending}
              aria-pressed={!!fav}
              aria-busy={pending}
              aria-label={
                fav
                  ? `Quitar a ${pokemon.name} de tus regalones`
                  : `Agregar a ${pokemon.name} a tus regalones`
              }
              title={fav ? "Quitar de mis regalones" : "Agregar a mis regalones"}
              className={`flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-control border px-3 py-2.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70 ${
                pending
                  ? "border-red-200 bg-red-50 text-red-700"
                  : feedback?.kind === "error"
                    ? "border-red-300 bg-red-50 text-red-700"
                    : fav
                      ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                      : "border-line bg-slate-50 text-ink-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              }`}
            >
              {pending ? (
                <>
                  <span
                    className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                  <span>Guardando…</span>
                </>
              ) : (
                <span>
                  {fav ? (
                    <>
                      <span aria-hidden="true">⭐</span> Regalón
                    </>
                  ) : (
                    <>
                      <span aria-hidden="true">☆</span> Hacer regalón
                    </>
                  )}
                </span>
              )}
            </button>
            <p
              role="status"
              className={`mt-1 min-h-[16px] text-center text-[11px] font-bold ${
                feedback?.kind === "error" ? "text-red-600" : "text-emerald-700"
              }`}
            >
              {feedback?.message ?? ""}
            </p>
          </>
        ) : (
          <Link
            to="/login"
            aria-label={`Conéctate para guardar a ${pokemon.name} en tus regalones`}
            title="Conéctate para guardar favoritos"
            className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-control border border-line bg-slate-50 px-3 py-2.5 text-xs font-bold text-ink-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
          >
            <span aria-hidden="true">🔐</span>
            <span>Conéctate</span>
          </Link>
        )}
      </div>
    </article>
  );
}
