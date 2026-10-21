import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/search/${encodeURIComponent(q.trim().toLowerCase())}`);
  };

  return (
    <form onSubmit={submit} className="flex gap-2 max-w-lg mb-4">
      <div className="relative flex-1">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Busca un Pokémon al tiro (ej: pikachu, mewtwo)..."
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-sm"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-sm"
          >
            ✕
          </button>
        )}
      </div>
      <button
        type="submit"
        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
      >
        <span>Buscar al tiro</span>
        <span>🔍</span>
      </button>
    </form>
  );
}
