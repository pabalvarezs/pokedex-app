import { Router } from "express";
import * as favoritesController from "../controllers/favorites";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(favoritesController.listFavorites));
router.post("/", asyncHandler(favoritesController.addFavorite));
router.delete("/:pokemonId", asyncHandler(favoritesController.removeFavorite));
router.get("/:pokemonId/check", asyncHandler(favoritesController.checkFavorite));

export default router;
