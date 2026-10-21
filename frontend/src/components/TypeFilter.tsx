import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TYPES = ["normal","fire","water","electric","grass","ice","fighting","poison","ground","flying","psychic","bug","rock","ghost","dark","dragon","steel","fairy"];

export default function TypeFilter() {
  const [type, setType] = useState("");
  const navigate = useNavigate();
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button onClick={() => { setType(""); navigate("/"); }} className="px-3 py-1 border rounded">Todos</button>
      {TYPES.map((t) => (
        <button key={t} onClick={() => { setType(t); navigate(`/type/${t}`); }}
          className={`px-3 py-1 rounded border ${type === t ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-300"}`}>
          {t}
        </button>
      ))}
    </div>
  );
}
