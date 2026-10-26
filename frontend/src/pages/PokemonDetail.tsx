import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPokemon, searchPokemon } from "../services/api";
import FavoriteButton from "../components/FavoriteButton";
import EvolutionChain from "../components/EvolutionChain";
import { getTypeBadge, STAT_NAMES, GENERATIONS } from "../utils/pokemon";

interface SpriteItem {
  key: string;
  label: string;
  url: string;
}

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

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    if (modalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [modalOpen]);

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

  if (isLoading)
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mb-4"></div>
        <p className="text-gray-600 font-semibold text-lg">
          Buscando la ficha completa de este Pokémon al tiro...
        </p>
      </div>
    );

  if (isError || !data)
    return (
      <div className="max-w-md mx-auto py-16 text-center bg-white rounded-2xl border p-8 shadow-sm mt-8">
        <span className="text-5xl mb-4 block">🔍</span>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          ¡Chuta! No pillamos ese Pokémon
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Revisa que el nombre o ID esté bien escrito, o vuelve a la portada para explorar.
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-sm transition"
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
    allSprites.push({ key: "front_default", label: "Frente Normal", url: data.sprites.front_default });
  }
  if (data.sprites?.back_default) {
    allSprites.push({ key: "back_default", label: "Espalda Normal", url: data.sprites.back_default });
  }
  if (data.sprites?.front_shiny) {
    allSprites.push({ key: "front_shiny", label: "Frente Shiny ✨", url: data.sprites.front_shiny });
  }
  if (data.sprites?.back_shiny) {
    allSprites.push({ key: "back_shiny", label: "Espalda Shiny ✨", url: data.sprites.back_shiny });
  }
  if (data.sprites?.other?.showdown?.front_default) {
    allSprites.push({ key: "showdown_front", label: "Combate Animado (GIF)", url: data.sprites.other.showdown.front_default });
  }
  if (data.sprites?.other?.showdown?.front_shiny) {
    allSprites.push({ key: "showdown_shiny", label: "Combate Animado Shiny ✨", url: data.sprites.other.showdown.front_shiny });
  }
  if (data.sprites?.other?.["official-artwork"]?.front_default) {
    allSprites.push({ key: "official", label: "Arte Oficial", url: data.sprites.other["official-artwork"].front_default });
  }
  if (data.sprites?.other?.["official-artwork"]?.front_shiny) {
    allSprites.push({ key: "official_shiny", label: "Arte Oficial Shiny ✨", url: data.sprites.other["official-artwork"].front_shiny });
  }
  if (data.sprites?.other?.home?.front_default) {
    allSprites.push({ key: "home", label: "Modelo 3D HOME", url: data.sprites.other.home.front_default });
  }

  const openSpriteModal = (sprite?: SpriteItem) => {
    setSelectedSprite(sprite || allSprites[0] || null);
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

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Botón Volver y Header superior */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-700 hover:text-red-600 bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-sm transition"
        >
          <span>←</span>
          <span>Volver a la lista</span>
        </button>
        <div className="flex items-center gap-2">
          <FavoriteButton pokemonId={data.id} name={data.name} />
        </div>
      </div>

      {/* Tarjeta Principal Hero */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Banner con gradiente de color */}
        <div className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 p-6 sm:p-8 text-white relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-white/80 font-black text-sm tracking-wider uppercase">
                Pokémon #{formattedId}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black capitalize tracking-tight mt-0.5">
                {data.name}
              </h1>
              {genInfo && (
                <p className="text-xs text-white/90 font-medium mt-1">
                  {genInfo.name} • Región de {genInfo.region}
                </p>
              )}
            </div>

            {/* Badges de Tipos */}
            <div className="flex gap-2">
              {(data.types ?? []).map((t) => {
                const info = getTypeBadge(t);
                return (
                  <Link
                    key={t}
                    to={`/type/${t}`}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${info.bg} ${info.text} border ${info.border} shadow hover:opacity-95 transition`}
                  >
                    {info.es}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cuerpo de la tarjeta */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Columna Izquierda: Imagen, controles y galería */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div
              onClick={() => openSpriteModal()}
              title="Haz clic para ver en pantalla completa"
              className="w-56 h-56 sm:w-64 sm:h-64 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-center relative shadow-inner cursor-pointer group"
            >
              <img
                src={officialArtwork}
                alt={data.name}
                className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition">
                🔍 Ver en grande
              </span>
            </div>

            {/* Controles: Shiny y Grito */}
            <div className="flex gap-2 mt-4 w-full">
              <button
                onClick={() => setShowShiny(!showShiny)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  showShiny
                    ? "bg-amber-100 border-amber-300 text-amber-900 shadow-sm"
                    : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>✨</span>
                <span>{showShiny ? "Ver Normal" : "Ver Variocolor (Shiny)"}</span>
              </button>

              {data.cries?.latest && (
                <button
                  onClick={() => playCry(data.cries?.latest)}
                  disabled={isPlayingCry}
                  title="Escuchar sonido / grito del Pokémon"
                  className="py-2 px-3.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>{isPlayingCry ? "🔊 ..." : "🔊 Grito"}</span>
                </button>
              )}
            </div>

            {/* Galería de Sprites miniatura con apertura de modal */}
            <div className="mt-4 pt-4 border-t border-gray-100 w-full">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Sprites del juego
                </p>
                <button
                  onClick={() => openSpriteModal()}
                  className="text-xs text-red-600 hover:underline font-bold"
                >
                  Ver en modal 🔍
                </button>
              </div>

              <div className="flex justify-center gap-2 flex-wrap">
                {allSprites.slice(0, 4).map((sprite) => (
                  <button
                    key={sprite.key}
                    onClick={() => openSpriteModal(sprite)}
                    className="text-center group bg-gray-50 hover:bg-red-50 p-1 rounded-lg border border-gray-200 hover:border-red-300 transition"
                  >
                    <img
                      src={sprite.url}
                      alt={sprite.label}
                      className="w-14 h-14 object-contain group-hover:scale-110 transition"
                      title={`Clic para ver ${sprite.label}`}
                    />
                    <span className="text-[10px] text-gray-500 group-hover:text-red-600 font-semibold block truncate max-w-[60px]">
                      {sprite.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Descripción, Datos, Estadísticas y Habilidades */}
          <div className="md:col-span-7 flex flex-col gap-6">
            {/* Descripción oficial en español */}
            {data.description && (
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <span>📖</span>
                  <span>Entrada de la Pokédex:</span>
                </p>
                <p className="text-sm text-gray-800 italic leading-relaxed">
                  &ldquo;{data.description}&rdquo;
                </p>
              </div>
            )}

            {/* Ficha Biológica rápida */}
            <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Estatura
                </span>
                <span className="text-base font-extrabold text-gray-800">
                  {data.height ? `${data.height / 10} m` : "Desconocida"}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Peso
                </span>
                <span className="text-base font-extrabold text-gray-800">
                  {data.weight ? `${data.weight / 10} kg` : "Desconocido"}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Exp. Base
                </span>
                <span className="text-base font-extrabold text-gray-800">
                  {data.base_experience ? `${data.base_experience} XP` : "N/A"}
                </span>
              </div>
            </div>

            {/* Estadísticas Base */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Estadísticas de Combate
                </h3>
                <span className="text-xs font-extrabold text-gray-700">
                  Total: <span className="text-red-600">{totalStats}</span>
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
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${percentage}%` }}
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
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Habilidades (en Español)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.abilities.map((a) => (
                    <div
                      key={a.name}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize border flex items-center gap-1.5 ${
                        a.is_hidden
                          ? "bg-purple-50 text-purple-800 border-purple-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      }`}
                    >
                      <span>{a.name}</span>
                      {a.is_hidden && (
                        <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded font-black">
                          Oculta
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
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Movimientos Destacados (en Español)
                </h3>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 scrollbar-thin">
                  {data.moves.map((m) => (
                    <span
                      key={m}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-gray-800 rounded-lg text-[11px] font-semibold capitalize border border-slate-200 transition"
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
          <div className="border-t border-gray-100 bg-gray-50/60 p-6 sm:p-8">
            <EvolutionChain stages={data.evolutionChain} currentId={data.id} />
          </div>
        )}
      </div>

      {/* VENTANA MODAL DE VISTA PREVIA DE SPRITES */}
      {modalOpen && selectedSprite && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 capitalize">
                  {data.name} #{formattedId}
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {selectedSprite.label}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm transition"
              >
                ✕
              </button>
            </div>

            {/* Visualizador central grande del sprite */}
            <div className="w-full h-64 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center p-4 relative shadow-inner mb-4">
              <img
                src={selectedSprite.url}
                alt={selectedSprite.label}
                className="max-h-full max-w-full object-contain filter drop-shadow-xl"
              />
              <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                {selectedSprite.label}
              </span>
            </div>

            {/* Selector de miniaturas en el modal */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Selecciona otra vista:
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1">
                {allSprites.map((sprite) => (
                  <button
                    key={sprite.key}
                    onClick={() => setSelectedSprite(sprite)}
                    className={`p-1.5 rounded-xl border text-center transition flex flex-col items-center ${
                      selectedSprite.key === sprite.key
                        ? "border-red-500 bg-red-50 ring-2 ring-red-400"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <img
                      src={sprite.url}
                      alt={sprite.label}
                      className="w-12 h-12 object-contain"
                    />
                    <span className="text-[9px] font-bold text-gray-600 truncate max-w-full block mt-0.5">
                      {sprite.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Botón de cerrar */}
            <div className="mt-5 pt-3 border-t border-gray-100 text-right">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Cerrar vista previa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
