import { useNavigate, useParams } from "react-router-dom";
import { GENERATIONS } from "../utils/pokemon";

export default function GenerationFilter() {
  const { gen: activeGenStr } = useParams<{ gen?: string }>();
  const activeGen = activeGenStr ? Number(activeGenStr) : null;
  const navigate = useNavigate();

  return (
    <div className="my-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Filtrar por Generación:
        </span>
        {activeGen && (
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
            !activeGen
              ? "bg-red-600 text-white border-red-600 shadow-sm"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
        >
          Todas las generaciones
        </button>
        {GENERATIONS.map((g) => {
          const isSelected = activeGen === g.id;
          return (
            <button
              key={g.id}
              onClick={() => navigate(`/generation/${g.id}`)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap border ${
                isSelected
                  ? "bg-red-600 text-white border-red-600 shadow-md ring-2 ring-offset-1 ring-red-300"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              }`}
            >
              {g.name} ({g.region})
            </button>
          );
        })}
      </div>
    </div>
  );
}
