import { Router } from "express";
import * as pokemonController from "../controllers/pokemon";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(pokemonController.listPokemon));
router.get("/type/:type", asyncHandler(pokemonController.listPokemonByType));
router.get("/generation/:gen", asyncHandler(pokemonController.listPokemonByGeneration));
router.get("/search/:name", asyncHandler(pokemonController.searchPokemon));
router.get("/:id", asyncHandler(pokemonController.getPokemonById));

export default router;
