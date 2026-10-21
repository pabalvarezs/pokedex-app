import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { listPokemon, listPokemonByType, listPokemonByGeneration } from "../services/api";
import PokemonCard from "../components/PokemonCard";
import SearchBar from "../components/SearchBar";
import TypeFilter from "../components/TypeFilter";
import GenerationFilter from "../components/GenerationFilter";
import { POKEMON_TYPES, GENERATIONS } from "../utils/pokemon";

export default function Home() {
  const { type, gen } = useParams<{ type?: string; gen?: string }>();
  const genNumber = gen ? Number(gen) : null;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["pokemon", "list", { type, gen: genNumber }],
    queryFn: () => {
      if (type) {
        return listPokemonByType(type);
      }
      if (genNumber) {
        return listPokemonByGeneration(genNumber);
      }
      return listPokemon(40, 0);
    },
  });

  const activeTypeInfo = type ? POKEMON_TYPES[type.toLowerCase()] : null;
  const activeGenInfo = genNumber ? GENERATIONS.find((g) => g.id === genNumber) : null;

  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
          Pokédex Pablito
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          ¡Edición Chilensis! Pilla todos los Pokémon, revisa sus estadísticas y guárdalos en tus regalones 🇨🇱
        </p>
      </div>

      <SearchBar />
      <TypeFilter />
      <GenerationFilter />

      {/* Indicador de filtro activo */}
      {(type || genNumber) && (
        <div className="flex items-center gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-900">
          <span>Mostrando Pokémon de:</span>
          {activeTypeInfo && (
            <span className="font-bold underline">
              Tipo {activeTypeInfo.es}
            </span>
          )}
          {activeGenInfo && (
            <span className="font-bold underline">
              {activeGenInfo.name} ({activeGenInfo.region})
            </span>
          )}
          <Link
            to="/"
            className="ml-auto text-xs font-semibold bg-white px-2.5 py-1 rounded border border-red-300 hover:bg-red-100 transition"
          >
            ✕ Limpiar filtro
          </Link>
        </div>
      )}

      {/* Contenido de listado */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-red-600 border-t-transparent mb-3"></div>
          <p className="text-gray-600 font-medium">Cargando los Pokémon al tiro, espérate un cachito...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-white rounded-lg border my-6">
          <p className="text-red-600 font-bold text-lg mb-2">¡Pucha la cuestión! No pudimos cargar los Pokémon.</p>
          <p className="text-gray-500 text-sm mb-4">Revisa tu conexión o inténtalo de nuevo.</p>
          <Link to="/" className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700">
            Volver a la portada
          </Link>
        </div>
      ) : data?.pokemon && data.pokemon.length > 0 ? (
        <>
          <div className="flex justify-between items-center mt-6 mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {data.pokemon.length} Pokémon encontrados
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {data.pokemon.map((p) => (
              <PokemonCard key={p.id} pokemon={p} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border my-6">
          <p className="text-gray-700 font-bold text-lg mb-2">¡Chuta! No pillamos ningún Pokémon por acá.</p>
          <p className="text-gray-500 text-sm mb-4">Prueba buscando otro tipo o generación.</p>
          <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">
            Ver todos los Pokémon
          </Link>
        </div>
      )}
    </div>
  );
}
