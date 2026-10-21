import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/pokemon/search/${encodeURIComponent(q.trim())}`);
  };
  return (
    <form onSubmit={submit} className="flex gap-2 max-w-md">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar Pokémon por nombre..."
        className="flex-1 border rounded px-3 py-2"
      />
      <button className="px-4 py-2 bg-blue-600 text-white rounded">Buscar</button>
    </form>
  );
}
