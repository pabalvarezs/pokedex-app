import { Router } from "express";
import * as pokemonController from "../controllers/pokemon";

const router = Router();

router.get("/", pokemonController.listPokemon);
router.get("/type/:type", pokemonController.listPokemonByType);
router.get("/generation/:gen", pokemonController.listPokemonByGeneration);
router.get("/search/:name", pokemonController.searchPokemon);
router.get("/:id", pokemonController.getPokemonById);

export default router;
