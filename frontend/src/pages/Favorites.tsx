import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { listFavorites } from "../services/api";

export default function Favorites() {
  const navigate = useNavigate();
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: listFavorites,
  });
  if (isLoading) return <p className="text-center py-4">Cargando favoritos...</p>;
  if (favorites.length === 0) return <p className="text-center py-4">No hay favoritos aún.</p>;
  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Mis favoritos</h1>
      <ul className="divide-y">
        {favorites.map((f) => (
          <li key={f.id} className="py-3 flex justify-between items-center">
            <span className="capitalize">{f.name}</span>
            <button
              onClick={() => navigate(`/pokemon/${f.pokemonId}`)}
              className="text-sm text-blue-600 underline"
            >
              Ver detalle
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
