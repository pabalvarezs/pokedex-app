import { useNavigate, useParams } from "react-router-dom";
import { POKEMON_TYPES } from "../utils/pokemon";

const TYPES = Object.keys(POKEMON_TYPES);

export default function TypeFilter() {
  const { type: activeType } = useParams<{ type?: string }>();
  const navigate = useNavigate();

  return (
    <div className="my-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Filtrar por Tipo de Pokémon:
        </span>
        {activeType && (
          <button
            onClick={() => navigate("/")}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Quitar filtro
          </button>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => navigate("/")}
          className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap border ${
            !activeType
              ? "bg-gray-800 text-white border-gray-800 shadow-sm"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
        >
          Todos los tipos
        </button>
        {TYPES.map((t) => {
          const info = POKEMON_TYPES[t];
          const isSelected = activeType?.toLowerCase() === t;
          return (
            <button
              key={t}
              onClick={() => navigate(`/type/${t}`)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap border ${
                isSelected
                  ? `${info.bg} ${info.text} ${info.border} shadow-md ring-2 ring-offset-1 ring-gray-400`
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              }`}
            >
              {info.es}
            </button>
          );
        })}
      </div>
    </div>
  );
}
