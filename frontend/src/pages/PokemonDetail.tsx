import { useState } from "react";
import { m } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPokemon, searchPokemon } from "../services/api";
import FavoriteButton from "../components/FavoriteButton";
import PokemonDetailSkeleton from "../components/PokemonDetailSkeleton";
import { useMinimumLoading } from "../hooks/useMinimumLoading";
import EvolutionChain from "../components/EvolutionChain";
import MegaForms from "../components/MegaForms";
import DynamaxForms from "../components/DynamaxForms";
import SpriteLightbox from "../components/SpriteLightbox";
import type { SpriteItem } from "../components/SpriteLightbox";
import VariantsAndForms from "../components/VariantsAndForms";
import { getTypeBadge, STAT_NAMES, GENERATIONS } from "../utils/pokemon";

export default function PokemonDetail() {
  const { id, name } = useParams();
  const navigate = useNavigate();
  const pokemonId = id ? Number(id) : undefined;
  const [showShiny, setShowShiny] = useState(false);
  const [isPlayingCry, setIsPlayingCry] = useState(false);

  // Estado del Modal de Sprites
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSprite, setSelectedSprite] = useState<SpriteItem | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["pokemon", "detail", pokemonId ?? name],
    queryFn: () => (pokemonId ? getPokemon(pokemonId) : searchPokemon(name!)),
    enabled: !!id || !!name,
  });

  // Un mínimo de 650 ms evita el parpadeo en respuestas muy rápidas; si la
  // petición tarda más, el skeleton desaparece en cuanto llegan los datos.
  const showingSkeleton = useMinimumLoading(isLoading);

  const playCry = (url?: string) => {
    if (!url) return;
    try {
      setIsPlayingCry(true);
      const audio = new Audio(url);
      audio.onended = () => setIsPlayingCry(false);
      audio.onerror = () => setIsPlayingCry(false);
      audio.play().catch(() => setIsPlayingCry(false));
    } catch {
      setIsPlayingCry(false);
    }
  };

  if (showingSkeleton) return <PokemonDetailSkeleton />;

  if (isError || !data)
    return (
      <div className="glass-surface glass-blur mx-auto mt-8 max-w-md rounded-card border border-line bg-surface p-8 text-center shadow-card">
        <span className="mb-4 block text-5xl">🔍</span>
        <h2 className="mb-2 text-xl font-bold text-ink-900">
          ¡Chuta! No pillamos ese Pokémon
        </h2>
        <p className="mb-6 text-sm text-ink-500">
          Revisa que el nombre o ID esté bien escrito, o vuelve a la portada para explorar.
        </p>
        <Link
          to="/"
          className="inline-block rounded-control bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
        >
          Volver a la portada al tiro 👈
        </Link>
      </div>
    );

  const formattedId = String(data.id).padStart(3, "0");
  const genInfo = data.generation ? GENERATIONS.find((g) => g.id === data.generation) : null;

  // Recopilar lista de todos los sprites disponibles para el modal
  const allSprites: SpriteItem[] = [];
  if (data.sprites?.front_default) {
    allSprites.push({ key: "front_default", label: "Frente", url: data.sprites.front_default });
  }
  if (data.sprites?.back_default) {
    allSprites.push({ key: "back_default", label: "Espalda", url: data.sprites.back_default });
  }
  if (data.sprites?.front_shiny) {
    allSprites.push({ key: "front_shiny", label: "Frente shiny ✨", url: data.sprites.front_shiny });
  }
  if (data.sprites?.back_shiny) {
    allSprites.push({ key: "back_shiny", label: "Espalda shiny ✨", url: data.sprites.back_shiny });
  }
  if (data.sprites?.other?.showdown?.front_default) {
    allSprites.push({ key: "showdown_front", label: "Animado pa' pelear (GIF)", url: data.sprites.other.showdown.front_default });
  }
  if (data.sprites?.other?.showdown?.front_shiny) {
    allSprites.push({ key: "showdown_shiny", label: "Animado pa' pelear shiny ✨", url: data.sprites.other.showdown.front_shiny });
  }
  if (data.sprites?.other?.["official-artwork"]?.front_default) {
    allSprites.push({ key: "official", label: "Arte oficial", url: data.sprites.other["official-artwork"].front_default });
  }
  if (data.sprites?.other?.["official-artwork"]?.front_shiny) {
    allSprites.push({ key: "official_shiny", label: "Arte oficial shiny ✨", url: data.sprites.other["official-artwork"].front_shiny });
  }
  if (data.sprites?.other?.home?.front_default) {
    allSprites.push({ key: "home", label: "Modelo 3D HOME", url: data.sprites.other.home.front_default });
  }

  const openSpriteModal = (sprite?: SpriteItem) => {
    // Si se abre desde la ilustración principal, arrancamos con el arte
    // oficial (o el modelo 3D HOME) en lugar del sprite pequeño de 96 px.
    const fallback =
      allSprites.find((s) => s.key === (showShiny ? "official_shiny" : "official")) ||
      allSprites.find((s) => s.key === "official") ||
      allSprites.find((s) => s.key === "official_shiny") ||
      allSprites.find((s) => s.key === "home") ||
      allSprites.find((s) =>
        showShiny ? s.key === "front_shiny" : s.key === "front_default"
      ) ||
      allSprites[0] ||
      null;

    setSelectedSprite(sprite || fallback);
    setModalOpen(true);
  };

  // Artwork selection
  const officialArtwork = showShiny
    ? data.sprites?.other?.["official-artwork"]?.front_shiny ||
      data.sprites?.front_shiny ||
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${data.id}.png`
    : data.sprites?.other?.["official-artwork"]?.front_default ||
      data.sprites?.front_default ||
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`;

  const totalStats = (data.stats ?? []).reduce((acc, s) => acc + s.base_stat, 0);

  // La comparación de Megaevoluciones solo tiene sentido cuando estamos en la
  // ficha de la especie original (no en la ficha de una Mega concreta).
  const baseArtwork =
    data.sprites?.other?.["official-artwork"]?.front_default ??
    data.sprites?.front_default ??
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`;
  const canCompareMega =
    data.megaForms?.some((form) => form.baseName === data.name) ?? false;

  return (
    <div className="mx-auto w-full max-w-ficha pb-12">
      {/* Botón Volver y Header superior */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-4 py-2 text-sm font-bold text-ink-700 shadow-sm transition hover:border-red-200 hover:text-red-600"
        >
          <span>←</span>
          <span>Volver 👈</span>
        </button>
        <div className="flex items-center gap-2">
          <FavoriteButton pokemonId={data.id} name={data.name} />
        </div>
      </div>

      {/* Tarjeta Principal Hero */}
      <div className="glass-surface glass-blur overflow-hidden rounded-card border border-line bg-surface shadow-card">
        {/* Banner con gradiente de color */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 px-6 py-8 text-white sm:px-8 sm:py-10 lg:px-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border-[44px] border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-white/90" aria-hidden="true" />
                Pokédex #{formattedId}
              </span>
              <h1 className="mt-3 break-words text-display font-extrabold capitalize">
                {data.name}
              </h1>
              {genInfo && (
                <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-meta font-medium text-white/90">
                  <span>{genInfo.name}</span>
                  <span className="text-white/50" aria-hidden="true">
                    •
                  </span>
                  <span>Región de {genInfo.region}</span>
                </p>
              )}
            </div>

            {/* Badges de Tipos */}
            <div className="flex flex-wrap gap-2 sm:justify-end sm:pb-1">
              {(data.types ?? []).map((t) => {
                const info = getTypeBadge(t);
                return (
                  <Link
                    key={t}
                    to={`/type/${t}`}
                    className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] shadow-sm transition hover:-translate-y-0.5 hover:opacity-95 ${info.bg} ${info.text} ${info.border}`}
                  >
                    {info.es}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cuerpo de la tarjeta */}
        <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 md:grid-cols-12 lg:gap-10 lg:p-10">
          {/* Columna Izquierda: Imagen, controles y galería */}
          <div className="flex flex-col md:col-span-5">
            <button
              type="button"
              onClick={() => openSpriteModal()}
              title="Haz clic para ver en pantalla completa"
              aria-label={`Ampliar la ilustración de ${data.name}`}
              className="artwork-frame group relative mx-auto flex aspect-square w-full max-w-[360px] cursor-pointer items-center justify-center overflow-hidden rounded-card border border-slate-200/80 p-6 shadow-ambient transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200"
            >
              <img
                key={officialArtwork}
                src={officialArtwork}
                alt={data.name}
                className="max-h-full max-w-full animate-fade-up object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:animate-none"
              />
              <span className="pointer-events-none absolute bottom-3 right-3 rounded-lg bg-slate-900/70 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
                🔍 Ver en grande
              </span>
            </button>

            {/* Controles: Shiny y Grito */}
            <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowShiny(!showShiny)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-control border px-3 py-2.5 text-xs font-bold transition ${
                  showShiny
                    ? "border-amber-300 bg-amber-100 text-amber-900 shadow-sm"
                    : "border-line bg-slate-100 text-ink-700 hover:bg-slate-200"
                }`}
              >
                <span>✨</span>
                <span>{showShiny ? "Versión normal" : "Ver variocolor (shiny)"}</span>
              </button>

              {data.cries?.latest && (
                <button
                  type="button"
                  onClick={() => playCry(data.cries?.latest)}
                  disabled={isPlayingCry}
                  title="Escuchar sonido / grito del Pokémon"
                  className="flex items-center justify-center gap-1.5 rounded-control border border-line bg-slate-100 px-4 py-2.5 text-xs font-bold text-ink-700 transition hover:bg-slate-200"
                >
                  <span>{isPlayingCry ? "🔊 ..." : "🔊 Grito"}</span>
                </button>
              )}
            </div>

            {/* Galería de Sprites miniatura con apertura de modal */}
            <div className="mt-6 w-full border-t border-line-soft pt-6">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
                  Sprites del juego
                </p>
                <button
                  type="button"
                  onClick={() => openSpriteModal()}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Ver en modal 🔍
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {allSprites.slice(0, 4).map((sprite) => (
                  <button
                    type="button"
                    key={sprite.key}
                    onClick={() => openSpriteModal(sprite)}
                    className="group rounded-control border border-line bg-slate-50 p-1 text-center transition hover:border-red-300 hover:bg-red-50"
                  >
                    <img
                      src={sprite.url}
                      alt={sprite.label}
                      className="h-14 w-14 object-contain transition group-hover:scale-110"
                      title={`Clic para ver ${sprite.label}`}
                    />
                    <span className="block max-w-[60px] truncate text-[10px] font-semibold text-ink-500 group-hover:text-red-600">
                      {sprite.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Descripción, Datos, Estadísticas y Habilidades */}
          <div className="flex flex-col gap-6 md:col-span-7">
            {/* Descripción oficial en español */}
            {data.description && (
              <div className="rounded-card border border-amber-200/80 bg-amber-50/70 p-6 shadow-sm">
                <p className="mb-2 flex items-center gap-1.5 text-meta font-bold uppercase tracking-wider text-amber-800">
                  <span>📖</span>
                  <span>Entrá de la Pokédex:</span>
                </p>
                <p className="text-body italic leading-relaxed text-ink-700">
                  &ldquo;{data.description}&rdquo;
                </p>
              </div>
            )}

            {/* Ficha Biológica rápida */}
            <div className="glass-surface grid grid-cols-3 gap-3 rounded-card border border-line-soft bg-slate-50/80 p-6 text-center shadow-sm">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-ink-500">
                  Alto
                </span>
                <span className="text-value font-bold text-ink-900">
                  {data.height ? `${data.height / 10} m` : "Desconocida"}
                </span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-ink-500">
                  Pesado
                </span>
                <span className="text-value font-bold text-ink-900">
                  {data.weight ? `${data.weight / 10} kg` : "Desconocido"}
                </span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-ink-500">
                  Exp. Base
                </span>
                <span className="text-value font-bold text-ink-900">
                  {data.base_experience ? `${data.base_experience} XP` : "N/A"}
                </span>
              </div>
            </div>

            {/* Estadísticas Base */}
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <h3 className="text-section font-bold uppercase tracking-wider text-ink-500">
                  Stats de combate
                </h3>
                <span className="text-sm font-semibold text-ink-700">
                  Total: <span className="text-value font-extrabold text-red-600">{totalStats}</span>
                </span>
              </div>

              <div className="space-y-2.5">
                {(data.stats ?? []).map((s) => {
                  const statLabel = STAT_NAMES[s.name] || s.name;
                  const percentage = Math.min(100, Math.round((s.base_stat / 200) * 100));

                  const barColor =
                    s.base_stat >= 110
                      ? "bg-emerald-500"
                      : s.base_stat >= 80
                      ? "bg-blue-500"
                      : s.base_stat >= 50
                      ? "bg-amber-500"
                      : "bg-red-500";

                  return (
                    <div key={s.name} className="flex items-center text-xs">
                      <span className="w-28 text-gray-600 font-semibold capitalize truncate">
                        {statLabel}
                      </span>
                      <span className="w-10 font-black text-gray-900 text-right pr-2">
                        {s.base_stat}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <m.div
                          className={`h-full rounded-full origin-left ${barColor}`}
                          style={{ width: `${percentage}%` }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Habilidades en Español */}
            {data.abilities && data.abilities.length > 0 && (
              <div>
                <h3 className="mb-2 text-section font-bold uppercase tracking-wider text-ink-500">
                  Habilidades
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.abilities.map((a) => (
                    <div
                      key={a.name}
                      className={`flex items-center gap-1.5 rounded-control border px-3 py-1.5 text-xs font-bold capitalize ${
                        a.is_hidden
                          ? "bg-purple-50 text-purple-800 border-purple-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      }`}
                    >
                      <span>{a.name}</span>
                      {a.is_hidden && (
                        <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded font-black">
                          Escondía
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Movimientos Destacados en Español */}
            {data.moves && data.moves.length > 0 && (
              <div>
                <h3 className="mb-2 text-section font-bold uppercase tracking-wider text-ink-500">
                  Movimientos destacados
                </h3>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 scrollbar-thin">
                  {data.moves.map((m) => (
                    <span
                      key={m}
                      className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-ink-700 transition hover:bg-slate-200"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cadena evolutiva: ocupa todo el ancho de la ficha */}
        {data.evolutionChain && data.evolutionChain.length > 0 && (
          <div className="border-t border-line-soft bg-slate-50/70 p-6 sm:p-8">
            <EvolutionChain
              stages={data.evolutionChain}
              currentId={data.speciesId ?? data.id}
            />
          </div>
        )}
      </div>

      {/* Variantes y formas: justo debajo de la cadena evolutiva */}
      {data.variantFamily && <VariantsAndForms family={data.variantFamily} />}

      {/* Ficha aparte de Megaevoluciones */}
      {data.megaForms && data.megaForms.length > 0 && (
        <MegaForms
          forms={data.megaForms}
          base={
            canCompareMega
              ? {
                  id: data.id,
                  name: data.name,
                  types: data.types ?? [],
                  stats: data.stats,
                  artwork: baseArtwork,
                }
              : undefined
          }
        />
      )}

      {/* Ficha aparte de Dinamax y Gigamax */}
      <DynamaxForms
        forms={data.gmaxForms ?? []}
        base={{
          id: data.id,
          name: data.name,
          types: data.types ?? [],
          stats: data.stats,
          artwork: baseArtwork,
          height: data.height,
        }}
        speciesId={data.speciesId}
        gmaxRelatives={data.gmaxRelatives ?? []}
      />

      {/* VENTANA MODAL DE VISTA AMPLIADA DE SPRITES */}
      <SpriteLightbox
        open={modalOpen}
        pokemonName={data.name}
        pokemonId={formattedId}
        sprites={allSprites}
        selected={selectedSprite}
        onSelect={setSelectedSprite}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
