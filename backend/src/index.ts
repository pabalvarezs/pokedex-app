import express from "express";
import cors from "cors";
import pokemonRoutes from "./routes/pokemon";
import favoriteRoutes from "./routes/favorites";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import dataCenterRoutes from "./routes/dataCenter";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { warmSuggestionIndex } from "./services/pokemon";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/pokemon", pokemonRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/admin/data-center", dataCenterRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// Sin host explícito Node escucha en `::` (dual-stack), cubriendo IPv4 e IPv6.
app.listen(PORT, () => {
  console.log(`Pokedex backend listening on http://localhost:${PORT}`);
  // Deja listo el buscador predictivo antes de la primera consulta.
  warmSuggestionIndex();
});
