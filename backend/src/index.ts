import express from "express";
import cors from "cors";
import pokemonRoutes from "./routes/pokemon";
import favoriteRoutes from "./routes/favorites";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/pokemon", pokemonRoutes);
app.use("/api/favorites", favoriteRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Pokedex backend listening on http://0.0.0.0:${PORT}`);
});
