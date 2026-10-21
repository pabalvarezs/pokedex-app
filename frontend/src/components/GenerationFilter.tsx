import { useState } from "react";
import { useNavigate } from "react-router-dom";

const GENS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function GenerationFilter() {
  const [gen, setGen] = useState<number | null>(null);
  const navigate = useNavigate();
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button onClick={() => { setGen(null); navigate("/"); }} className="px-3 py-1 border rounded">Todas</button>
      {GENS.map((g) => (
        <button key={g} onClick={() => { setGen(g); navigate(`/generation/${g}`); }}
          className={`px-3 py-1 rounded border ${gen === g ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-300"}`}>
          Gen {g}
        </button>
      ))}
    </div>
  );
}
