import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PokemonDetail from "./pages/PokemonDetail";
import Favorites from "./pages/Favorites";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pokemon/:id" element={<PokemonDetail />} />
      <Route path="/search/:name" element={<PokemonDetail />} />
      <Route path="/type/:type" element={<Home />} />
      <Route path="/generation/:gen" element={<Home />} />
      <Route path="/favorites" element={<Favorites />} />
    </Routes>
  );
}
