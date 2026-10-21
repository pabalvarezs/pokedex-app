import { Router } from "express";
import * as favoritesController from "../controllers/favorites";

const router = Router();

router.get("/", favoritesController.listFavorites);
router.post("/", favoritesController.addFavorite);
router.delete("/:pokemonId", favoritesController.removeFavorite);
router.get("/:pokemonId/check", favoritesController.checkFavorite);

export default router;
